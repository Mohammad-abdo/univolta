"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";
import { getLanguage, t, type Language } from "@/lib/i18n";

type ServiceItem = {
  id: string;
  title: string;
  description: string;
  price: string;
  mainImage?: string | null;
  points?: Array<{ title: string; description: string }>;
};

export function ServicesSection() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    setLang(getLanguage());
    fetch(`${API_BASE_URL}/public/services`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServices(data.slice(0, 6));
      })
      .catch(() => {});
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <ScrollReveal key={service.id} direction="up" delay={index * 70}>
              <Link href={`/services/${service.id}`} className="block h-full">
                <article className="h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(82,96,206,0.12)]">
                  <div className="h-44 w-full bg-gray-100">
                    {service.mainImage ? (
                      <img src={service.mainImage} alt={service.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">No Image</div>
                    )}
                  </div>
                  <div className="space-y-3 p-5">
                    <h3 className="line-clamp-1 font-montserrat-semibold text-lg text-[#121c67]">{service.title}</h3>
                    <p className="line-clamp-2 text-sm text-gray-600">{service.description}</p>
                    <p className="font-montserrat-semibold text-[#4350b0]">${service.price}</p>
                    <div className="space-y-1">
                      {(service.points || []).slice(0, 2).map((point, idx) => (
                        <div key={`${service.id}-point-${idx}`} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#5260ce]" />
                          <span className="line-clamp-1">{point.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal direction="up" delay={200}>
          <div className="mt-10 text-center">
            <Button asChild className="h-auto rounded-xl bg-[#5260ce] px-8 py-3 font-montserrat-semibold text-white hover:bg-[#4350b0]">
              <Link href="/services" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                {t("servicesViewAll")}
                <ArrowRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
              </Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
