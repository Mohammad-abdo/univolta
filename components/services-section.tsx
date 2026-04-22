"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";
import { getImageUrl } from "@/lib/image-utils";
import { getLanguage, t, type Language } from "@/lib/i18n";

type ServiceItem = {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  price: string;
  mainImage?: string | null;
};

const serviceArabicFallback: Record<string, { titleAr: string; descriptionAr: string }> = {
  "Admission Guidance": {
    titleAr: "إرشاد القبول الجامعي",
    descriptionAr: "دعم كامل من اختيار الجامعة حتى تقديم الطلب ومتابعة القبول.",
  },
  "Accommodation & Arrival": {
    titleAr: "السكن والاستقبال",
    descriptionAr: "مساعدة في السكن والاستقبال لضمان بداية آمنة وسلسة في مصر.",
  },
  "Full Student Package": {
    titleAr: "الباقة الشاملة للطالب",
    descriptionAr: "باقة متكاملة تشمل القبول والتأشيرة والسكن والمتابعة بعد الوصول.",
  },
};

const formatPrice = (value: string | number | null | undefined) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return "$0";
  return `$${numeric.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
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
                <article className="group relative h-[330px] overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(82,96,206,0.22)]">
                  <div className="absolute inset-0 bg-gray-100">
                    {getImageUrl(service.mainImage) ?
                      <img
                        src={getImageUrl(service.mainImage)}
                        alt={service.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    : null}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1230]/90 via-[#1f2a6e]/45 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 space-y-2 p-4 text-white">
                    <p className="text-sm font-semibold text-white/90">{formatPrice(service.price)}</p>
                    <h3 className="line-clamp-1 font-montserrat-semibold text-lg">
                      {service.title}
                    </h3>
                    <p className="line-clamp-1 text-sm text-white/90" dir="rtl">
                      {service.titleAr || serviceArabicFallback[service.title]?.titleAr || service.title}
                    </p>
                    <p className="line-clamp-2 text-xs text-white/80">
                      {service.descriptionAr || serviceArabicFallback[service.title]?.descriptionAr || service.description}
                    </p>
                    <div className={`flex items-center justify-between pt-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <span className="text-xs font-semibold tracking-wide text-white/90">{t("servicesSeeMore")}</span>
                      <span className="rounded-full bg-white/20 p-2">
                        <ArrowUpRight className="h-4 w-4 text-white" />
                      </span>
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
