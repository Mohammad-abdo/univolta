"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { API_BASE_URL } from "@/lib/constants";
import { getImageUrl } from "@/lib/image-utils";
import { getLanguage, t, type Language } from "@/lib/i18n";
import { ArrowUpRight, Search } from "lucide-react";

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
  return `$${numeric.toLocaleString(undefined, {
    minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    setLang(getLanguage());
    fetch(`${API_BASE_URL}/public/services`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServices(data);
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(
    () =>
      services.filter((item) =>
        `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase())
      ),
    [services, query]
  );

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      <Navbar />
      <main className="mx-auto max-w-[1280px] space-y-8 px-4 pb-16 pt-24 md:px-5">
        <section className={`rounded-3xl bg-[#f8f9ff] p-6 md:p-10 ${lang === "ar" ? "rtl text-right" : ""}`}>
          <h1 className="mb-2 text-3xl font-montserrat-bold text-[#121c67]">{t("servicesPageTitle")}</h1>
          <p className="text-[#65666f]">{t("servicesPageSubtitle")}</p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 rounded-xl border px-3">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("servicesSearchPlaceholder")}
              className="w-full py-2 outline-none"
            />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((service) => (
            <Link key={service.id} href={`/services/${service.id}`} className="block">
              <article className="group relative h-[360px] overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(82,96,206,0.22)]">
                <div className="absolute inset-0 bg-gray-100">
                  {getImageUrl(service.mainImage) ? (
                    <img
                      src={getImageUrl(service.mainImage)}
                      alt={service.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1230]/90 via-[#1f2a6e]/45 to-transparent" />
                <div className={`absolute inset-x-0 bottom-0 space-y-2 p-4 text-white ${lang === "ar" ? "text-right" : "text-left"}`}>
                  <p className="text-sm font-semibold text-white/90">{formatPrice(service.price)}</p>
                  <h2 className="line-clamp-1 text-lg font-semibold">{service.title}</h2>
                  <p className="line-clamp-1 text-sm text-white/90" dir="rtl">
                    {service.titleAr || serviceArabicFallback[service.title]?.titleAr || service.title}
                  </p>
                  <p className="line-clamp-2 text-xs text-white/80">
                    {service.descriptionAr || serviceArabicFallback[service.title]?.descriptionAr || service.description}
                  </p>
                  <div className={`flex items-center justify-between pt-1 ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                    <span className="text-xs font-semibold tracking-wide text-white/90">{t("servicesSeeMore")}</span>
                    <span className="rounded-full bg-white/20 p-2">
                      <ArrowUpRight className="h-4 w-4 text-white" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed p-10 text-center text-gray-500">
              {t("noServicesFound")}
            </div>
          )}
        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
