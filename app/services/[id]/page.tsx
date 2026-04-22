"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { API_BASE_URL } from "@/lib/constants";
import { getLanguage, t, type Language } from "@/lib/i18n";
import { CheckCircle2, ChevronLeft } from "lucide-react";

type ServiceDetails = {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  price: string;
  discount: string;
  mainImage?: string | null;
  images?: string[];
  points?: Array<{ title: string; description: string }>;
  subServices?: Array<{ id: string; title: string; description: string; price: string; images: string[] }>;
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

export default function ServiceDetailsPage() {
  const params = useParams<{ id: string }>();
  const [lang, setLang] = useState<Language>("en");
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<ServiceDetails | null>(null);

  useEffect(() => {
    setLang(getLanguage());
    if (!params.id) return;
    fetch(`${API_BASE_URL}/public/services/${params.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setService(data))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className="min-h-screen bg-[#f8f9ff] pb-16 md:pb-0">
      <Navbar />
      <main className="mx-auto max-w-[1280px] space-y-6 px-4 pb-16 pt-24 md:px-5">
        <Link href="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-[#5260ce]">
          <ChevronLeft className={`h-4 w-4 ${lang === "ar" ? "rotate-180" : ""}`} />
          {t("backToServices")}
        </Link>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center">{t("loading")}</div>
        ) : !service ? (
          <div className="rounded-2xl bg-white p-10 text-center text-red-500">{t("serviceNotFound")}</div>
        ) : (
          <div className={`space-y-6 ${lang === "ar" ? "rtl text-right" : ""}`}>
            <section className="overflow-hidden rounded-3xl border bg-white">
              <div className="h-[260px] w-full bg-gray-100 md:h-[360px]">
                {service.mainImage ? (
                  <img src={service.mainImage} alt={service.title} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="space-y-3 p-6 md:p-8">
                <h1 className="text-3xl font-montserrat-bold text-[#121c67]">{service.title}</h1>
                <p className="text-lg font-semibold text-[#2f3b87]" dir="rtl">
                  {service.titleAr || serviceArabicFallback[service.title]?.titleAr || service.title}
                </p>
                <p className="text-[#5f6377]">{service.description}</p>
                <p className="text-[#5f6377]" dir="rtl">
                  {service.descriptionAr || serviceArabicFallback[service.title]?.descriptionAr || service.description}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#EEF2FF] px-4 py-1.5 font-semibold text-[#4350b0]">
                    {formatPrice(service.price)}
                  </span>
                  {Number(service.discount || 0) > 0 && (
                    <span className="rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700">
                      {t("discount")}: {formatPrice(service.discount)}
                    </span>
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              <article className="rounded-2xl border bg-white p-6">
                <h2 className="mb-4 text-xl font-semibold text-[#121c67]">{t("serviceIncludedPoints")}</h2>
                <div className="space-y-3">
                  {(service.points || []).map((point, index) => (
                    <div key={`${point.title}-${index}`} className="rounded-xl bg-[#f9faff] p-3">
                      <p className="flex items-center gap-2 font-semibold text-[#25307c]">
                        <CheckCircle2 className="h-4 w-4 text-[#5260ce]" />
                        {point.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">{point.description}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border bg-white p-6">
                <h2 className="mb-4 text-xl font-semibold text-[#121c67]">{t("serviceSubServices")}</h2>
                <div className="space-y-3">
                  {(service.subServices || []).map((sub) => (
                    <div key={sub.id} className="rounded-xl border p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="font-semibold text-[#1f2a6e]">{sub.title}</p>
                        <span className="text-sm font-semibold text-[#5260ce]">{formatPrice(sub.price)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{sub.description}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </div>
        )}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
