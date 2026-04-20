"use client";

import { GraduationCap, BookOpen, Building2, Users } from "lucide-react";
import { t, getLanguage, type Language } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const CARDS = [
  { icon: GraduationCap, titleKey: "easyApplication",   descKey: "easyApplicationDesc"   },
  { icon: BookOpen,      titleKey: "oneOnOneSupport",    descKey: "oneOnOneSupportDesc"    },
  { icon: Building2,     titleKey: "trustedPartners",    descKey: "trustedPartnersDesc"    },
  { icon: Users,         titleKey: "studentServices",    descKey: "studentServicesDesc"    },
] as const;

export function WhyUsSection() {
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentLang(getLanguage());
    const id = setInterval(() => setCurrentLang(getLanguage()), 300);
    return () => clearInterval(id);
  }, []);

  const isRTL = mounted && currentLang === "ar";
  const tl = (key: string) => t(key, currentLang);

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 md:px-5">
        {/*
          Layout is FIXED: cards always LEFT column, text always RIGHT column.
          Only text-alignment changes per language (text-left for EN, text-right for AR).
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── Left: heading + description (always right column on desktop) ── */}
          <ScrollReveal
            direction="right"
            className={`lg:order-2 ${isRTL ? "text-right" : "text-left"}`}
          >
            <p className="text-sm md:text-base font-montserrat-regular text-[#5260ce] mb-2">
              {tl("whyUnivolta")}
            </p>
            <h2 className="font-montserrat-bold text-2xl md:text-[34px] leading-[1.3] text-[#121c67] mb-5">
              {tl("topValuesForYou")}
            </h2>
            <p className="font-montserrat-regular text-base md:text-[18px] leading-relaxed text-[#7c7b7c] max-w-[440px]">
              {tl("whyUnivoltaDescription")}
            </p>

            {/* decorative pill row */}
            <div className={`flex flex-wrap gap-2 mt-8 ${isRTL ? "flex-row-reverse" : ""}`}>
              {(["🎓", "🌍", "🏫", "🤝"] as const).map((emoji, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[rgba(82,96,206,0.07)] text-[#5260ce] text-sm font-montserrat-regular border border-[#5260ce]/10"
                >
                  {emoji}
                </span>
              ))}
            </div>
          </ScrollReveal>

          {/* ── Right: 2×2 feature cards (always left column on desktop) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 lg:order-1">
            {CARDS.map(({ icon: Icon, titleKey, descKey }, i) => (
              <ScrollReveal key={titleKey} direction="up" delay={i * 90}>
                <div
                  className={`group h-full bg-white border border-gray-100 rounded-2xl p-5 flex gap-4 items-start shadow-[0_2px_16px_rgba(82,96,206,0.07)] hover:shadow-[0_8px_40px_rgba(82,96,206,0.13)] hover:-translate-y-1 transition-all duration-300 ${isRTL ? "flex-row-reverse text-right" : ""}`}
                >
                  <div className="shrink-0 w-[56px] h-[56px] rounded-xl bg-[rgba(82,96,206,0.08)] flex items-center justify-center group-hover:bg-[rgba(82,96,206,0.14)] transition-colors duration-300">
                    <Icon className="w-6 h-6 text-[#5260ce]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-montserrat-bold text-[15px] text-[#121c67] mb-1 leading-snug">
                      {tl(titleKey)}
                    </h3>
                    <p className="font-montserrat-regular text-sm text-[#65666f] leading-relaxed">
                      {tl(descKey)}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
