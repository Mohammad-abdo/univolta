"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { t, getLanguage, type Language } from "@/lib/i18n";

const TERMS_HERO_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.12'%3E%3Cpath d='M40 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20S40 51.046 40 40zm-40 0c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20S0 51.046 0 40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";
import Link from "next/link";

export default function TermsPage() {
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage());

  useEffect(() => {
    const interval = setInterval(() => {
      const lang = getLanguage();
      if (lang !== currentLang) {
        setCurrentLang(lang);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [currentLang]);

  const sections = [
    {
      title: t("termsSection1Title"),
      body: t("termsSection1Body"),
    },
    {
      title: t("termsSection2Title"),
      body: t("termsSection2Body"),
    },
    {
      title: t("termsSection3Title"),
      list: [
        t("termsSection3Item1"),
        t("termsSection3Item2"),
        t("termsSection3Item3"),
      ],
    },
    {
      title: t("termsSection4Title"),
      list: [
        t("termsSection4Item1"),
        t("termsSection4Item2"),
      ],
    },
    {
      title: t("termsSection5Title"),
      list: [
        t("termsSection5Item1"),
        t("termsSection5Item2"),
        t("termsSection5Item3"),
      ],
    },
    {
      title: t("termsSection6Title"),
      list: [
        t("termsSection6Item1"),
        t("termsSection6Item2"),
      ],
    },
    {
      title: t("termsSection7Title"),
      list: [
        t("termsSection7Item1"),
        t("termsSection7Item2"),
      ],
    },
    {
      title: t("termsSection8Title"),
      list: [
        t("termsSection8Item1"),
        t("termsSection8Item2"),
      ],
    },
    {
      title: t("termsSection9Title"),
      body: t("termsSection9Body"),
    },
  ];
  return (
    <div className="min-h-screen bg-[#f9fafe] pb-16 md:pb-0">
      <Navbar />

      <main className="pt-0 md:pt-[150px]">
        <section className="relative pb-12 md:pb-20">
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(105,171,233,0.2)] to-transparent pointer-events-none" />

          <div className="relative mx-auto max-w-[1280px] px-4 md:px-5">
            <ScrollReveal direction="fade">
              <div
                className="relative flex min-h-[200px] flex-col items-center justify-center overflow-hidden rounded-2xl px-4 py-12 shadow-[0px_20px_80px_rgba(82,96,206,0.15)] md:min-h-[280px] md:rounded-[28px] md:px-8 md:py-16"
                style={{
                  background:
                    "linear-gradient(135deg, #121c67 0%, #5260ce 45%, #3d4a9e 100%)",
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-30"
                  style={{ backgroundImage: TERMS_HERO_PATTERN }}
                  aria-hidden
                />
                <div className="relative z-[1] max-w-3xl text-center">
                  <h1 className="font-montserrat-bold text-2xl leading-tight text-white md:text-[40px]">
                    {t("termsPolicy")}
                  </h1>
                  <p className="mt-3 font-montserrat-regular text-sm text-white/80 md:mt-4 md:text-base">
                    {t("termsHeroSubtitle")}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="pb-12 md:pb-24">
          <div className="mx-auto max-w-[1280px] px-4 md:px-5 space-y-8 md:space-y-12">
            <div>
              <p className="text-xs md:text-sm font-montserrat-regular text-[#5260ce]">{t("termsOfUse")}</p>
              <h2 className="text-2xl md:text-[34px] font-montserrat-bold text-[#121c67] leading-[1.4]">
                {t("termsAndConditions")} 📝
              </h2>
              <p className="mt-4 md:mt-6 text-base md:text-[20px] font-montserrat-regular text-[#2e2e2e] leading-relaxed">
                {t("termsWelcomeMessage")}
              </p>
            </div>

            <div className="flex flex-col gap-5 md:gap-6">
              {sections.map((section, index) => (
                <ScrollReveal key={section.title} direction="up" delay={index * 60}>
                  <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-7 space-y-3 hover:shadow-md transition-shadow">
                    <h3 className="text-base md:text-xl font-montserrat-bold text-[#5260ce] leading-tight">
                      {section.title}
                    </h3>
                    {section.body && (
                      <p className="text-sm md:text-base font-montserrat-regular text-[#2e2e2e] leading-relaxed">
                        {section.body}
                      </p>
                    )}
                    {section.list && (
                      <ul className="space-y-2">
                        {section.list.map((item) => (
                          <li key={item} className="flex gap-3 text-sm md:text-base font-montserrat-regular text-[#2e2e2e] leading-relaxed">
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-[#5260ce] to-[#75d3f7]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-12 md:pb-24">
          <div className="relative mx-auto max-w-[1280px] px-4 md:px-5">
            <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-b from-[#5260ce] to-[#75d3f7] text-white">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
              <div className="relative max-w-3xl space-y-4 px-4 py-8 md:space-y-6 md:px-6 md:py-16 lg:px-10">
                <div className="h-1 w-16 rounded-full bg-white/90 md:w-20" aria-hidden />
                <h2 className="text-2xl font-montserrat-bold leading-[1.4] md:text-[34px]">
                  {t("startYourUniversityJourney")} 🚀
                </h2>
                <p className="max-w-full text-sm font-montserrat-light leading-relaxed text-white/90 md:max-w-[451px] md:text-lg">
                  {t("termsCTADescription")}
                </p>
                <Button
                  size="lg"
                  className="rounded-xl bg-white px-6 text-sm font-montserrat-semibold text-[#5260ce] hover:bg-gray-100 md:px-8 md:text-base"
                  asChild
                >
                  <Link href="/universities">{t("browseUniversities")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

