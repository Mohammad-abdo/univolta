"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { t, getLanguage, type Language } from "@/lib/i18n";
import { API_BASE_URL } from "@/lib/constants";
import Link from "next/link";
import { CheckCircle2, List, BookOpen, ChevronRight, CalendarDays } from "lucide-react";

const HERO_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.10'%3E%3Cpath d='M40 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20S40 51.046 40 40zm-40 0c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20S0 51.046 0 40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

interface TermsItem {
  type: "body" | "list";
  content?: string;
  items?: string[];
}

interface TermsSection {
  id: string;
  title: string;
  titleAr?: string;
  data: TermsItem;
}

interface TermsData {
  welcomeMessage: string;
  welcomeMessageAr?: string;
  sections: TermsSection[];
  lastUpdated?: string;
}

const FALLBACK_DATA: TermsData = {
  welcomeMessage: t("termsWelcomeMessage"),
  sections: [
    { id: "1", title: t("termsSection1Title"), data: { type: "body", content: t("termsSection1Body") } },
    { id: "2", title: t("termsSection2Title"), data: { type: "body", content: t("termsSection2Body") } },
    { id: "3", title: t("termsSection3Title"), data: { type: "list", items: [t("termsSection3Item1"), t("termsSection3Item2"), t("termsSection3Item3")] } },
    { id: "4", title: t("termsSection4Title"), data: { type: "list", items: [t("termsSection4Item1"), t("termsSection4Item2")] } },
    { id: "5", title: t("termsSection5Title"), data: { type: "list", items: [t("termsSection5Item1"), t("termsSection5Item2"), t("termsSection5Item3")] } },
    { id: "6", title: t("termsSection6Title"), data: { type: "list", items: [t("termsSection6Item1"), t("termsSection6Item2")] } },
    { id: "7", title: t("termsSection7Title"), data: { type: "list", items: [t("termsSection7Item1"), t("termsSection7Item2")] } },
    { id: "8", title: t("termsSection8Title"), data: { type: "list", items: [t("termsSection8Item1"), t("termsSection8Item2")] } },
    { id: "9", title: t("termsSection9Title"), data: { type: "body", content: t("termsSection9Body") } },
  ],
};

export default function TermsPage() {
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage());
  const [termsData, setTermsData] = useState<TermsData | null>(null);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const interval = setInterval(() => {
      const lang = getLanguage();
      if (lang !== currentLang) setCurrentLang(lang);
    }, 300);
    return () => clearInterval(interval);
  }, [currentLang]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/settings/terms.sections`)
      .then((r) => r.json())
      .then((res) => {
        if (res?.value && res.value.sections?.length > 0) {
          setTermsData(res.value as TermsData);
        } else {
          setTermsData(FALLBACK_DATA);
        }
      })
      .catch(() => setTermsData(FALLBACK_DATA));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    const sections = document.querySelectorAll("section[data-section]");
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [termsData]);

  const data = termsData ?? FALLBACK_DATA;
  const isRTL = currentLang === "ar";

  const getTitle = (s: TermsSection) =>
    isRTL && s.titleAr ? s.titleAr : s.title;

  const getWelcome = () =>
    isRTL && data.welcomeMessageAr ? data.welcomeMessageAr : data.welcomeMessage;

  return (
    <div className="min-h-screen bg-[#f7f9fe] pb-16 md:pb-0" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      <main className="pt-0 md:pt-[150px]">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative pb-10 md:pb-16">
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(82,96,206,0.07)] to-transparent pointer-events-none" />
          <div className="relative mx-auto max-w-[1280px] px-4 md:px-5">
            <ScrollReveal direction="fade">
              <div
                className="relative flex min-h-[220px] flex-col items-center justify-center overflow-hidden rounded-2xl px-4 py-14 shadow-[0px_20px_80px_rgba(82,96,206,0.18)] md:min-h-[300px] md:rounded-[28px] md:px-8"
                style={{ background: "linear-gradient(135deg, #0f1756 0%, #5260ce 50%, #3d9fd9 100%)" }}
              >
                <div className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: HERO_PATTERN }} aria-hidden />
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute -start-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" aria-hidden />
                <div className="pointer-events-none absolute -bottom-10 -end-10 h-48 w-48 rounded-full bg-[#75d3f7]/10 blur-2xl" aria-hidden />

                <div className="relative z-[1] flex flex-col items-center gap-4 text-center">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-montserrat-semibold text-white/90 backdrop-blur-sm">
                    <BookOpen className="h-3.5 w-3.5" />
                    {t("termsOfUse")}
                  </span>
                  <h1 className="font-montserrat-bold text-3xl leading-tight text-white md:text-5xl">
                    {t("termsAndConditions")}
                  </h1>
                  <p className="max-w-xl font-montserrat-regular text-sm text-white/75 md:text-base">
                    {t("termsHeroSubtitle")}
                  </p>
                  {data.lastUpdated && (
                    <span className="flex items-center gap-1.5 text-xs text-white/60">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {isRTL ? "آخر تحديث:" : "Last updated:"}{" "}
                      {new Date(data.lastUpdated).toLocaleDateString(isRTL ? "ar-SA" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <section className="pb-16 md:pb-24">
          <div className="mx-auto max-w-[1280px] px-4 md:px-5">
            <div className="flex flex-col gap-8 md:flex-row md:gap-10 lg:gap-14">

              {/* Sticky TOC sidebar */}
              <aside className="hidden md:block w-64 shrink-0">
                <div className="sticky top-[180px] rounded-2xl border border-[#e8eaf6] bg-white p-5 shadow-sm">
                  <p className="mb-3 text-[11px] font-montserrat-bold uppercase tracking-widest text-[#5260ce]">
                    {isRTL ? "المحتويات" : "Contents"}
                  </p>
                  <nav className="space-y-1">
                    {data.sections.map((section) => (
                      <a
                        key={section.id}
                        href={`#section-${section.id}`}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-all ${
                          activeSection === `section-${section.id}`
                            ? "bg-[rgba(82,96,206,0.1)] font-montserrat-semibold text-[#5260ce]"
                            : "font-montserrat-regular text-gray-500 hover:text-[#5260ce]"
                        }`}
                      >
                        <ChevronRight
                          className={`h-3 w-3 shrink-0 transition-transform ${
                            activeSection === `section-${section.id}` ? "rotate-90 text-[#5260ce]" : ""
                          }`}
                        />
                        <span className="truncate">{getTitle(section)}</span>
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Main content */}
              <div className="flex-1 min-w-0 space-y-5">
                {/* Intro card */}
                <ScrollReveal direction="up">
                  <div className="rounded-2xl bg-gradient-to-br from-[#f0f2ff] to-[#e8f4fd] border border-[#dde2f8] p-6 md:p-8">
                    <p className="text-sm font-montserrat-regular text-[#5260ce] mb-1">{t("termsOfUse")}</p>
                    <h2 className="text-2xl md:text-[30px] font-montserrat-bold text-[#121c67] leading-snug mb-4">
                      {t("termsAndConditions")} 📝
                    </h2>
                    <p className="text-sm md:text-base font-montserrat-regular text-[#374151] leading-relaxed">
                      {getWelcome()}
                    </p>
                  </div>
                </ScrollReveal>

                {/* Sections */}
                {data.sections.map((section, idx) => (
                  <ScrollReveal key={section.id} direction="up" delay={idx * 50}>
                    <section
                      id={`section-${section.id}`}
                      data-section
                      className="group rounded-2xl border border-gray-100 bg-white p-5 md:p-7 shadow-sm hover:shadow-md hover:border-[#dde2f8] transition-all scroll-mt-[200px]"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5260ce] to-[#3d9fd9] text-sm font-montserrat-bold text-white shadow-sm">
                          {idx + 1}
                        </span>
                        <h3 className="pt-1.5 text-base md:text-lg font-montserrat-bold text-[#121c67] leading-snug group-hover:text-[#5260ce] transition-colors">
                          {getTitle(section)}
                        </h3>
                      </div>

                      {section.data.type === "body" && section.data.content && (
                        <p className="ms-[3.25rem] text-sm md:text-base font-montserrat-regular text-[#374151] leading-relaxed">
                          {section.data.content}
                        </p>
                      )}

                      {section.data.type === "list" && section.data.items && (
                        <ul className="ms-[3.25rem] space-y-2.5">
                          {section.data.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm md:text-base font-montserrat-regular text-[#374151] leading-relaxed">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#5260ce]" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  </ScrollReveal>
                ))}

                {!termsData && (
                  <div className="flex justify-center py-6">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#5260ce] border-t-transparent" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="pb-12 md:pb-24">
          <div className="mx-auto max-w-[1280px] px-4 md:px-5">
            <ScrollReveal direction="up">
              <div className="relative overflow-hidden rounded-2xl md:rounded-[24px] shadow-[0px_16px_60px_rgba(82,96,206,0.18)]"
                style={{ background: "linear-gradient(135deg, #121c67 0%, #5260ce 60%, #3d9fd9 100%)" }}>
                <div
                  className="pointer-events-none absolute inset-0 opacity-15"
                  style={{ backgroundImage: HERO_PATTERN }}
                  aria-hidden
                />
                <div className="relative flex flex-col items-start gap-5 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-12 md:py-14">
                  <div className="space-y-3 max-w-lg">
                    <div className="h-1 w-12 rounded-full bg-[#75d3f7]" />
                    <h2 className="text-2xl font-montserrat-bold text-white md:text-[32px] leading-tight">
                      {t("startYourUniversityJourney")} 🚀
                    </h2>
                    <p className="text-sm font-montserrat-light text-white/80 leading-relaxed md:text-base">
                      {t("termsCTADescription")}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="shrink-0 rounded-xl bg-white px-8 font-montserrat-semibold text-[#5260ce] shadow-lg hover:bg-gray-50"
                    asChild
                  >
                    <Link href="/universities">{t("browseUniversities")}</Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
