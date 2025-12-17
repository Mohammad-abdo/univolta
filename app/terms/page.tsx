"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import { figmaAssets } from "@/lib/figma-assets";
import { t, getLanguage, type Language } from "@/lib/i18n";
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
            <div className="relative h-[200px] md:h-[350px] overflow-hidden rounded-[16px] md:rounded-[24px] shadow-[0px_20px_80px_rgba(82,96,206,0.15)]">
              <Image
                src={figmaAssets.termsHeroBackground}
                alt="Students studying in a classroom"
                fill
                className="object-cover"
                priority
                unoptimized
              />
              <Image
                src={figmaAssets.termsHeroForeground}
                alt=""
                fill
                className="object-cover"
                aria-hidden="true"
                priority
                unoptimized
              />
              <Image
                src={figmaAssets.termsHeroOverlay}
                alt=""
                fill
                className="object-cover"
                aria-hidden="true"
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-[#121c67]/45" aria-hidden="true" />

              <div className="absolute inset-0 flex items-center justify-center px-4 md:px-8 text-center">
                <h1 className="text-white text-xl md:text-[34px] font-montserrat-bold leading-[1.4]">
                  {t("termsPolicy")}
                </h1>
              </div>
            </div>
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

            <div className="flex flex-col gap-6 md:gap-8">
              {sections.map((section) => (
                <article key={section.title} className="space-y-2 md:space-y-3">
                  <h3 className="text-lg md:text-[24px] font-montserrat-bold text-[#5260ce] leading-[1.4]">
                    {section.title}
                  </h3>
                  {section.body && (
                    <p className="text-base md:text-[20px] font-montserrat-regular text-[#2e2e2e] leading-relaxed">
                      {section.body}
                    </p>
                  )}
                  {section.list && (
                    <ul className="space-y-2 text-base md:text-[20px] font-montserrat-regular text-[#2e2e2e] leading-relaxed">
                      {section.list.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5260ce]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
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
              <div className="relative grid gap-6 md:gap-12 items-center px-4 md:px-6 py-8 md:py-16 lg:px-10 lg:grid-cols-2">
                <div className="space-y-4 md:space-y-6">
                  <div className="relative inline-block h-[4px] md:h-[5px] w-[60px] md:w-[80px]">
                    <Image
                      src={figmaAssets.vector5}
                      alt=""
                      fill
                      className="object-contain"
                      aria-hidden="true"
                      unoptimized
                    />
                  </div>
                  <h2 className="text-2xl md:text-[34px] font-montserrat-bold leading-[1.4]">
                    {t("startYourUniversityJourney")} 🚀
                  </h2>
                  <p className="max-w-full md:max-w-[451px] text-sm md:text-lg font-montserrat-light text-white/90 leading-relaxed">
                    {t("termsCTADescription")}
                  </p>
                  <Button
                    size="lg"
                    className="rounded-xl bg-white px-6 md:px-8 text-sm md:text-base font-montserrat-semibold text-[#5260ce] hover:bg-gray-100"
                    asChild
                  >
                    <Link href="/universities">{t("browseUniversities")}</Link>
                  </Button>
                </div>
                <div className="relative hidden w-full h-[300px] md:h-[420px] lg:block">
                  <Image
                    src={figmaAssets.faqCtaIllustration}
                    alt="Students exploring universities"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
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

