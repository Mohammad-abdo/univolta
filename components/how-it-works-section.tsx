"use client";

import Image from "next/image";
import { figmaAssets } from "@/lib/figma-assets";
import { Search, FileText, Headphones, Send } from "lucide-react";
import { getLanguage, t, type Language } from "@/lib/i18n";
import { useState, useEffect } from "react";

// Steps will be defined inside component to use translations

export function HowItWorksSection() {
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
  return (
    <section className="py-12 md:py-20 bg-[rgba(117,211,247,0.06)] relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-5">
        {(() => {
          const currentLang = getLanguage();
          const isRTL = currentLang === "ar";
          return (
            <div className={`grid lg:grid-cols-2 gap-8 md:gap-12 items-start ${isRTL ? "lg:grid-cols-2" : ""}`}>
              {/* Left Content */}
              <div className={`space-y-4 md:space-y-6 ${isRTL ? "lg:order-2" : ""}`}>
            <div>
              <p className="text-sm md:text-base font-montserrat-regular text-[#5260ce] mb-2">{t("howItWorks")}</p>
              <div className="relative w-[83px] h-[10px] mb-4 inline-block">
                <Image
                  src={figmaAssets.vector5}
                  alt=""
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
            <h2 className="text-2xl md:text-[34px] font-montserrat-bold text-[#121c67] leading-tight">
              {t("howToApply")}
            </h2>
            <p className="text-base md:text-[18px] font-montserrat-regular text-[#7c7b7c] leading-relaxed max-w-full md:max-w-[269px]">
              {t("howToApplyDescription")}
            </p>

            {/* Decorative Elements */}
            <div className="relative mt-12">
              <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-[#75d3f7] to-[#5260ce] rounded-full blur-3xl opacity-20"></div>
              <div className="relative w-[26px] h-[26px]">
                <Send className="w-full h-full text-[#5260ce]" />
              </div>
            </div>
          </div>

              {/* Right Content - Steps */}
              <div className={`grid gap-6 md:gap-8 ${isRTL ? "lg:order-1" : ""}`}>
            {(() => {
              const currentLang = getLanguage();
              const steps = [
                {
                  icon: Search,
                  title: t("exploreChoose"),
                  description: t("exploreChooseDesc"),
                },
                {
                  icon: FileText,
                  title: t("applyOnline"),
                  description: t("applyOnlineDesc"),
                },
                {
                  icon: Headphones,
                  title: t("getSupport"),
                  description: t("getSupportDesc"),
                },
              ];
              
              return steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div key={index} className={`flex gap-4 md:gap-6 ${currentLang === "ar" ? "flex-row-reverse" : ""}`}>
                    <div className="shrink-0">
                      <div className="w-[56px] h-[56px] md:w-[68px] md:h-[68px] flex items-center justify-center bg-[rgba(82,96,206,0.1)] rounded-lg">
                        <IconComponent className="w-7 h-7 md:w-8 md:h-8 text-[#5260ce]" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-montserrat-bold text-[#5260ce] mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm md:text-base font-montserrat-regular text-[#65666f] leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              });
            })()}
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
}
