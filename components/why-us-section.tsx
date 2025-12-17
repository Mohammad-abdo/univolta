"use client";

import Image from "next/image";
import { figmaAssets } from "@/lib/figma-assets";
import { GraduationCap, BookOpen, Building2, Users, Send } from "lucide-react";
import { getLanguage, t, type Language } from "@/lib/i18n";
import { useState, useEffect } from "react";

export function WhyUsSection() {
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
    <section className="relative min-h-[400px] md:h-[506px] bg-white overflow-hidden py-12 md:py-0">
      <div className="max-w-[1440px] mx-auto relative h-full px-4 md:px-5">
          {/* Desktop Decorative Elements - Hidden on Mobile */}
        <div className="hidden lg:block">
          {/* Decorative Vector */}
          <div className="absolute left-[159px] top-[152px] w-[109px] h-[10px]">
            <div className="absolute inset-[-20%_-1.84%_-20.01%_-1.84%]">
              <Image
                src={figmaAssets.whyUsVector5}
                alt=""
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>

          {/* Decorative Arrow/Vector */}
          <div className="absolute left-[119.67px] top-[335.38px] w-[287.568px] h-[108.795px] flex items-center justify-center">
            <div className="relative w-full h-full rotate-[346.567deg]">
              <div className="absolute inset-[-2.76%_-1.04%]">
                <Image
                  src={figmaAssets.whyUsVector66}
                  alt=""
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* Send Icon */}
          <div className="absolute left-[389px] top-[360px] w-[71px] h-[71px] flex items-center justify-center">
            <Send className="w-8 h-8 text-[#5260ce]" />
          </div>
        </div>

        {/* Content Section - Responsive */}
        <div className="relative z-10">
          {(() => {
            const currentLang = getLanguage();
            const isRTL = currentLang === "ar";
            return (
              <>
                {/* Heading Section */}
                <div className={`mb-4 md:mb-0 md:absolute ${isRTL ? "md:right-[80px]" : "md:left-[80px]"} md:top-[81px] md:w-[418px] md:h-[81px]`}>
                  <p className="font-montserrat-regular text-sm md:text-[16px] leading-[1.4] text-[#5260ce] mb-2">
                    {t("whyUnivolta")}
                  </p>
                  <h2 className="font-montserrat-bold text-2xl md:text-[34px] leading-[1.4] text-[#121c67]">
                    {t("topValuesForYou")}
                  </h2>
                </div>

                {/* Description */}
                <p className={`mb-8 md:mb-0 md:absolute ${isRTL ? "md:right-[80px]" : "md:left-[80px]"} md:top-[180px] md:w-[378px] font-montserrat-regular text-base md:text-[18px] leading-[1.4] text-[#7c7b7c] max-w-full md:max-w-[378px]`}>
                  {t("whyUnivoltaDescription")}
                </p>

                {/* Feature Cards Grid - Responsive */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-[30px] mt-8 md:mt-0 md:absolute ${isRTL ? "md:right-[540px]" : "md:left-[540px]"} md:top-[80px] md:w-auto`}>
            {(() => {
              const currentLang = getLanguage();
              const isRTL = currentLang === "ar";
              const cards = [
                {
                  icon: GraduationCap,
                  title: t("easyApplication"),
                  description: t("easyApplicationDesc"),
                },
                {
                  icon: BookOpen,
                  title: t("oneOnOneSupport"),
                  description: t("oneOnOneSupportDesc"),
                },
                {
                  icon: Building2,
                  title: t("trustedPartners"),
                  description: t("trustedPartnersDesc"),
                },
                {
                  icon: Users,
                  title: t("studentServices"),
                  description: t("studentServicesDesc"),
                },
              ];

              return cards.map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={index}
                    className={`bg-white border-[5px] border-solid border-white rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 items-start shadow-md ${
                      isRTL ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Icon Container */}
                    <div className="relative shrink-0">
                      <div className="w-[60px] h-[60px] md:w-[76px] md:h-[76px] bg-[rgba(82,96,206,0.1)] border-[5px] border-solid border-white rounded-xl flex items-center justify-center">
                        <IconComponent className="w-7 h-7 md:w-9 md:h-9 text-[#5260ce]" />
                      </div>
                    </div>
                    {/* Text Content */}
                    <div
                      className={`flex flex-col gap-[10px] w-full md:w-[247px] items-start ${
                        isRTL ? "md:items-start text-right" : "md:items-start text-left"
                      }`}
                    >
                      <h3 className="font-montserrat-bold text-base md:text-[18px] leading-[1.4] text-black w-full">
                        {card.title}
                      </h3>
                      <p className="font-montserrat-light text-sm md:text-[18px] leading-[1.4] text-[#7c7b7c] w-full">
                        {card.description}
                      </p>
                    </div>
                  </div>
                );
              });
            })()}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </section>
  );
}
