"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ServiceListCard } from "@/components/service-list-card";
import { API_BASE_URL } from "@/lib/constants";
import { getImageUrl } from "@/lib/image-utils";
import { servicePrimaryTitle, servicePrimaryDescription } from "@/lib/service-display";
import { getLanguage, t, type Language } from "@/lib/i18n";

export type ServiceItem = {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  price: string;
  mainImage?: string | null;
};

export function ServicesSection() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const refreshLang = () => setLang(getLanguage());
    refreshLang();
    fetch(`${API_BASE_URL}/public/services`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServices(data.slice(0, 6));
      })
      .catch(() => {});
    window.addEventListener("storage", refreshLang);
    window.addEventListener("focus", refreshLang);
    return () => {
      window.removeEventListener("storage", refreshLang);
      window.removeEventListener("focus", refreshLang);
    };
  }, []);

  const isRTL = lang === "ar";

  return (
    <section className="bg-[#f9fafe] py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-5">
        <ScrollReveal direction="up">
          <div className={`mx-auto mb-10 max-w-2xl text-center ${isRTL ? "rtl" : ""}`}>
            <Badge className="mb-4 border border-[#5260ce]/20 bg-[rgba(82,96,206,0.1)] px-4 py-1.5 font-montserrat-semibold text-[#5260ce]">
              {t("servicesSectionBadge")}
            </Badge>
            <h2 className="mb-4 font-montserrat-bold text-2xl leading-tight text-[#121c67] md:text-[34px]">
              {t("servicesSectionTitle")}
            </h2>
            <p className="font-montserrat-regular text-base leading-relaxed text-[#65666f] md:text-lg">
              {t("servicesSectionSubtitle")}
            </p>
          </div>
        </ScrollReveal>

        {services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#5260ce]/25 bg-white/70 py-14 text-center text-[#65666f]">
            {t("noServicesFound")}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 md:gap-8">
            {services.map((service, index) => (
              <ScrollReveal key={service.id} direction="up" delay={index * 70}>
                <ServiceListCard
                  title={servicePrimaryTitle(service, lang)}
                  description={servicePrimaryDescription(service, lang)}
                  imageUrl={getImageUrl(service.mainImage)}
                  isRTL={isRTL}
                />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
