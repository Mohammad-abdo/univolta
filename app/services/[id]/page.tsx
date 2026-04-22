"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/constants";
import { getImageUrl } from "@/lib/image-utils";
import { getLanguage, t, type Language } from "@/lib/i18n";
import { ArrowRight, CheckCircle2, ChevronLeft, Images } from "lucide-react";

type PointRow = {
  id?: string;
  title: string;
  description: string;
  titleAr?: string | null;
  descriptionAr?: string | null;
};

type SubRow = {
  id: string;
  title: string;
  description: string;
  titleAr?: string | null;
  descriptionAr?: string | null;
  price: string;
  discount?: string;
  images?: string[];
};

type ServiceDetails = {
  id: string;
  title: string;
  titleAr?: string | null;
  description: string;
  descriptionAr?: string | null;
  price: string;
  discount: string;
  mainImage?: string | null;
  images?: string[] | unknown;
  points?: PointRow[];
  subServices?: SubRow[];
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

function normalizeGallery(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === "string" && x.length > 0);
  }
  return [];
}

export default function ServiceDetailsPage() {
  const params = useParams<{ id: string }>();
  const [lang, setLang] = useState<Language>("en");
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<ServiceDetails | null>(null);

  useEffect(() => {
    const refreshLang = () => setLang(getLanguage());
    refreshLang();
    window.addEventListener("storage", refreshLang);
    window.addEventListener("focus", refreshLang);
    return () => {
      window.removeEventListener("storage", refreshLang);
      window.removeEventListener("focus", refreshLang);
    };
  }, []);

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/public/services/${params.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setService(data))
      .finally(() => setLoading(false));
  }, [params.id]);

  const heroImageUrl = useMemo(() => {
    if (!service) return "";
    const main = getImageUrl(service.mainImage);
    if (main) return main;
    const urls = normalizeGallery(service.images).map((u) => getImageUrl(u)).filter(Boolean);
    return urls[0] || "";
  }, [service]);

  const galleryUrls = useMemo(() => {
    if (!service) return [];
    const raw = normalizeGallery(service.images);
    const resolved = raw.map((u) => getImageUrl(u)).filter(Boolean);
    const dedup = [...new Set(resolved)];
    if (heroImageUrl && dedup.includes(heroImageUrl)) {
      return dedup;
    }
    return dedup;
  }, [service, heroImageUrl]);

  const primaryTitle = useMemo(() => {
    if (!service) return "";
    if (lang === "ar") {
      return (
        service.titleAr?.trim() ||
        serviceArabicFallback[service.title]?.titleAr ||
        service.title
      );
    }
    return service.title;
  }, [service, lang]);

  const secondaryTitle = useMemo(() => {
    if (!service) return "";
    if (lang === "ar") return service.title !== primaryTitle ? service.title : "";
    const ar =
      service.titleAr?.trim() ||
      serviceArabicFallback[service.title]?.titleAr ||
      "";
    return ar && ar !== primaryTitle ? ar : "";
  }, [service, lang, primaryTitle]);

  const primaryDescription = useMemo(() => {
    if (!service) return "";
    if (lang === "ar") {
      return (
        service.descriptionAr?.trim() ||
        serviceArabicFallback[service.title]?.descriptionAr ||
        service.description
      );
    }
    return service.description;
  }, [service, lang]);

  const secondaryDescription = useMemo(() => {
    if (!service) return "";
    if (lang === "ar") {
      return service.description !== primaryDescription ? service.description : "";
    }
    const ar =
      service.descriptionAr?.trim() ||
      serviceArabicFallback[service.title]?.descriptionAr ||
      "";
    return ar && ar !== primaryDescription ? ar : "";
  }, [service, lang, primaryDescription]);

  const labelPoint = (p: PointRow) => ({
    title:
      lang === "ar" && p.titleAr?.trim()
        ? p.titleAr
        : p.title,
    description:
      lang === "ar" && p.descriptionAr?.trim()
        ? p.descriptionAr
        : p.description,
  });

  const labelSub = (s: SubRow) => ({
    title:
      lang === "ar" && s.titleAr?.trim()
        ? s.titleAr
        : s.title,
    description:
      lang === "ar" && s.descriptionAr?.trim()
        ? s.descriptionAr
        : s.description,
  });

  const contactHref = service
    ? `/contact?serviceId=${encodeURIComponent(service.id)}`
    : "/contact";

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
          <div className={`space-y-8 ${lang === "ar" ? "rtl text-right" : ""}`}>
            <section className="overflow-hidden rounded-3xl border border-[#e4e8f6] bg-white shadow-sm">
              <div className="relative h-[260px] w-full bg-gradient-to-br from-[#eef2ff] to-[#f8f9ff] md:h-[380px]">
                {heroImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroImageUrl}
                    alt={primaryTitle}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#5260ce]/40">
                    <Images className="h-16 w-16" strokeWidth={1.25} />
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f1230]/55 via-transparent to-transparent" />
              </div>
              <div className="space-y-4 p-6 md:p-8">
                <div>
                  <h1 className="text-3xl font-montserrat-bold text-[#121c67]">{primaryTitle}</h1>
                  {secondaryTitle ? (
                    <p className="mt-1 text-lg font-semibold text-[#4350b0]" dir={lang === "ar" ? "rtl" : "ltr"}>
                      {secondaryTitle}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2 text-[#5f6377]">
                  <p className="leading-relaxed">{primaryDescription}</p>
                  {secondaryDescription ? (
                    <p className="leading-relaxed opacity-90" dir={lang === "ar" ? "ltr" : "rtl"}>
                      {secondaryDescription}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#EEF2FF] px-4 py-2 text-lg font-semibold text-[#4350b0]">
                    {formatPrice(service.price)}
                  </span>
                  {Number(service.discount || 0) > 0 && (
                    <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                      {t("discount")}: {formatPrice(service.discount)}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button asChild className="rounded-xl bg-[#5260ce] px-6 py-6 text-base font-semibold hover:bg-[#434db5]">
                    <Link href={contactHref} className="inline-flex items-center gap-2">
                      {t("serviceRequestButton")}
                      <ArrowRight className={`h-5 w-5 ${lang === "ar" ? "rotate-180" : ""}`} />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl border-[#5260ce]/40 px-6 py-6 text-[#5260ce]">
                    <Link href="/universities">{t("universities")}</Link>
                  </Button>
                </div>
              </div>
            </section>

            {galleryUrls.length > 0 ? (
              <section className={`rounded-3xl border border-[#e4e8f6] bg-white p-6 shadow-sm md:p-8 ${lang === "ar" ? "rtl" : ""}`}>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[#121c67]">
                  <Images className="h-6 w-6 text-[#5260ce]" />
                  {t("serviceGallery")}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {galleryUrls.map((src, index) => (
                    <div
                      key={`${src}-${index}`}
                      className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#f1f4ff]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="grid gap-6 lg:grid-cols-2">
              <article className={`rounded-2xl border border-[#e4e8f6] bg-white p-6 shadow-sm ${lang === "ar" ? "rtl" : ""}`}>
                <h2 className="mb-4 text-xl font-semibold text-[#121c67]">{t("serviceIncludedPoints")}</h2>
                {(service.points || []).length === 0 ? (
                  <p className="text-sm text-gray-500">{t("noDataFound")}</p>
                ) : (
                  <div className="space-y-3">
                    {(service.points || []).map((point, index) => {
                      const lb = labelPoint(point);
                      return (
                        <div key={point.id ?? `${lb.title}-${index}`} className="rounded-xl bg-[#f9faff] p-4">
                          <p className="flex items-start gap-2 font-semibold text-[#25307c]">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#5260ce]" />
                            <span>{lb.title}</span>
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-gray-600">{lb.description}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>

              <article className={`rounded-2xl border border-[#e4e8f6] bg-white p-6 shadow-sm ${lang === "ar" ? "rtl" : ""}`}>
                <h2 className="mb-4 text-xl font-semibold text-[#121c67]">{t("serviceSubServices")}</h2>
                {(service.subServices || []).length === 0 ? (
                  <p className="text-sm text-gray-500">{t("noDataFound")}</p>
                ) : (
                  <div className="space-y-5">
                    {(service.subServices || []).map((sub) => {
                      const lb = labelSub(sub);
                      const subImgs = normalizeGallery(sub.images)
                        .map((u) => getImageUrl(u))
                        .filter(Boolean);
                      return (
                        <div key={sub.id} className="rounded-xl border border-[#eef0fa] p-4">
                          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                            <p className="font-semibold text-[#1f2a6e]">{lb.title}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-base font-semibold text-[#5260ce]">{formatPrice(sub.price)}</span>
                              {Number(sub.discount || 0) > 0 && (
                                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                                  −{formatPrice(sub.discount)}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="mb-3 text-sm leading-relaxed text-gray-600">{lb.description}</p>
                          {subImgs.length > 0 ? (
                            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                              {subImgs.map((src, i) => (
                                <div
                                  key={`${sub.id}-img-${i}`}
                                  className="relative h-24 w-36 shrink-0 overflow-hidden rounded-lg bg-[#f4f6ff]"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            </section>

            <section
              className={`rounded-3xl border border-[#5260ce]/25 bg-gradient-to-br from-[#eef2ff] to-white p-8 shadow-[0_12px_40px_rgba(82,96,206,0.12)] ${lang === "ar" ? "rtl text-right" : ""}`}
            >
              <h2 className="text-2xl font-montserrat-bold text-[#121c67]">{t("serviceRequestCtaTitle")}</h2>
              <p className="mt-2 max-w-2xl text-[#5f6377]">{t("serviceRequestCtaSubtitle")}</p>
              <Button asChild className="mt-6 rounded-xl bg-[#5260ce] px-8 py-6 text-base font-semibold hover:bg-[#434db5]">
                <Link href={contactHref} className="inline-flex items-center gap-2">
                  {t("serviceRequestButton")}
                  <ArrowRight className={`h-5 w-5 ${lang === "ar" ? "rotate-180" : ""}`} />
                </Link>
              </Button>
            </section>
          </div>
        )}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
