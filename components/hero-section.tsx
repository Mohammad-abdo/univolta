"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { figmaAssets } from "@/lib/figma-assets";
import { Search } from "lucide-react";
import { t, getLanguage, type Language } from "@/lib/i18n";

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage());
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      const lang = getLanguage();
      if (lang !== currentLang) {
        setCurrentLang(lang);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [currentLang]);

  const studentAvatars = [
    figmaAssets.student1,
    figmaAssets.student2,
    figmaAssets.student3,
    figmaAssets.student4,
    figmaAssets.student5,
  ];

  return (
    <section className="relative min-h-[600px] md:h-[793px] overflow-hidden bg-gradient-to-b from-[rgba(105,171,233,0.2)] to-[rgba(255,255,255,0)] pt-20 md:pt-0">
      <div className="max-w-[1440px] mx-auto relative h-full px-4 md:px-5">
        {/* Desktop Decorative Elements - Hidden on Mobile */}
        {(() => {
          const currentLang = getLanguage();
          const isRTL = currentLang === "ar";
          return (
            <div className="hidden lg:block">
              {/* Graduation Cap Icon */}
              <div className={`absolute ${isRTL ? "right-[671px]" : "left-[671px]"} top-[202px] w-[100px] h-[79px] flex items-center justify-center`}>
                <div className="relative w-full h-full rotate-180 scale-y-[-100%]">
                  <Image
                    src={figmaAssets.heroGraduationCap}
                    alt=""
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>

              {/* Decorative Vector */}
              <div className={`absolute ${isRTL ? "right-[80px]" : "left-[80px]"} top-[312px] w-[141px] h-[10px]`}>
                <div className="absolute inset-[-30%_-2.13%_-30.01%_-2.13%]">
                  <Image
                    src={figmaAssets.heroVector}
                    alt=""
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>

              {/* Main Frame Image */}
              <div className={`absolute ${isRTL ? "right-[825px]" : "left-[825px]"} top-[236px] w-[481px] h-[481px]`}>
                <Image
                  src={figmaAssets.heroFrame}
                  alt="Students"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Main Student Image with Mask */}
              <div className={`absolute ${isRTL ? "right-[824px]" : "left-[824px]"} top-[149px] w-[481px] h-[580px] overflow-hidden`}>
                <div
                  className="absolute inset-0"
                  style={{
                    maskImage: `url('${figmaAssets.heroMainImageMask}')`,
                    maskSize: "481px 614px",
                    maskPosition: "-0.08px -45.304px",
                    maskRepeat: "no-repeat",
                  }}
                >
                  <Image
                    src={figmaAssets.heroMainImage}
                    alt="Student"
                    fill
                    className="object-cover"
                    style={{ objectPosition: "left -12.14% top 1%" }}
                    unoptimized
                  />
                </div>
              </div>

              {/* Country Flags */}
              <div className={`absolute ${isRTL ? "right-[1114px]" : "left-[1114px]"} top-[155px] w-[69px] h-[70px] bg-white rounded-[110px] p-3 flex items-center justify-center shadow-lg`}>
                <div className="relative w-11 h-11">
                  <Image src={figmaAssets.flagFrance} alt="France" fill className="object-contain" unoptimized />
                </div>
              </div>
              <div className={`absolute ${isRTL ? "right-[816px]" : "left-[816px]"} top-[315px] w-[69px] h-[70px] bg-white rounded-[110px] p-3 flex items-center justify-center shadow-lg`}>
                <div className="relative w-11 h-11">
                  <Image src={figmaAssets.flagUSA} alt="USA" fill className="object-contain" unoptimized />
                </div>
              </div>
              <div className={`absolute ${isRTL ? "right-[1210px]" : "left-[1210px]"} top-[281px] w-[69px] h-[69px] bg-white rounded-[110px] p-3 flex items-center justify-center shadow-lg`}>
                <div className="relative w-11 h-11">
                  <Image src={figmaAssets.flagCanada} alt="Canada" fill className="object-contain" unoptimized />
                </div>
              </div>
              <div className={`absolute ${isRTL ? "right-[1271px]" : "left-[1271px]"} top-[418px] w-[68px] h-[70px] bg-white rounded-[110px] p-3 flex items-center justify-center shadow-lg`}>
                <div className="relative w-11 h-11">
                  <Image src={figmaAssets.flagUK} alt="UK" fill className="object-contain" unoptimized />
                </div>
              </div>
              <div className={`absolute ${isRTL ? "right-[781px]" : "left-[781px]"} top-[470px] w-[70px] h-[69px] bg-white rounded-[110px] p-3 flex items-center justify-center shadow-lg`}>
                <div className="relative w-11 h-11">
                  <Image src={figmaAssets.flagGermany} alt="Germany" fill className="object-contain" unoptimized />
                </div>
              </div>

              {/* Decorative Sparkles */}
              <div className={`absolute ${isRTL ? "right-[1124px]" : "left-[1124px]"} top-[597px] w-[214px] h-[95px] overflow-hidden`}>
                <div className="absolute inset-0 rotate-[193.445deg]">
                  <div className="relative w-full h-full">
                    <Image
                      src={figmaAssets.heroVector3}
                      alt=""
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
              <div className={`absolute ${isRTL ? "right-[864px]" : "left-[864px]"} top-[199px] w-[95px] h-[95px] overflow-hidden`}>
                <div className={`absolute ${isRTL ? "right-[15px]" : "left-[15px]"} top-[5px] w-[66px] h-[66px]`}>
                  <Image
                    src={figmaAssets.heroSparkle}
                    alt=""
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
              <div className={`absolute ${isRTL ? "right-[889px]" : "left-[889px]"} top-[631px] w-[111px] h-[102px] overflow-hidden`}>
                <div className={`absolute ${isRTL ? "right-1/2 translate-x-1/2" : "left-1/2 -translate-x-1/2"} top-[9px] w-[84px] h-[83px]`}>
                  <div className="absolute inset-[20.04%_20.15%]">
                    <Image
                      src={figmaAssets.heroStar}
                      alt=""
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
        {/* Content Section - Responsive */}
        <div className="relative z-10 pt-8 md:pt-[249px] pb-12 md:pb-0">
          {/* Heading */}
          <h1 className="font-montserrat-bold text-3xl md:text-[50px] leading-[1.4] text-[#121c67] mb-4 md:mb-0">
            {t("studyAbroadMadeEasy")}
          </h1>

          {/* Description */}
          <p className="font-montserrat-regular text-base md:text-[22px] leading-[1.4] text-[#65666f] mb-6 md:mb-8 max-w-full md:max-w-[644px]">
            {t("connectWithTopUniversities")}
          </p>

          {/* Search Bar Container */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-[0px_4px_40px_0px_rgba(0,0,0,0.06)] p-4 md:p-4 flex flex-col gap-4 max-w-full md:max-w-[646px]">
            {/* Search Input and Button */}
            {(() => {
              const currentLang = getLanguage();
              const isRTL = currentLang === "ar";
              return (
                <div className={`flex flex-col sm:flex-row gap-3 md:gap-5 items-stretch sm:items-center ${isRTL ? "sm:flex-row-reverse" : ""}`}>
                  <div className={`flex-1 flex items-center gap-2 md:gap-3 px-3 md:px-3.5 py-2.5 md:py-3.5 bg-gray-50 rounded-lg md:rounded-none ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Search className={`w-5 h-5 md:w-6 md:h-6 text-[#8b8c9a] shrink-0 ${isRTL ? "ml-2 md:ml-3" : ""}`} />
                    <input
                      type="text"
                      placeholder={t("searchUniversities")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 font-montserrat-light text-sm md:text-base text-[#8b8c9a] placeholder:text-[#8b8c9a] focus:outline-none bg-transparent"
                      dir={isRTL ? "rtl" : "ltr"}
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (searchQuery.trim()) {
                        router.push(`/universities?search=${encodeURIComponent(searchQuery)}`);
                      } else {
                        router.push("/universities");
                      }
                    }}
                    className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm md:text-base h-[48px] md:h-[52px] w-full sm:w-auto sm:min-w-[124px] rounded-lg md:rounded-xl shrink-0"
                  >
                    {t("search")}
                  </Button>
                </div>
              );
            })()}

            {/* Quick Filters */}
            <div className="flex gap-1.5 items-center flex-wrap">
              {(() => {
                const currentLang = getLanguage();
                const tags = [
                  { key: "filterUSA", value: "USA", type: "country" },
                  { key: "filterCanada", value: "Canada", type: "country" },
                  { key: "filterMexico", value: "Mexico", type: "country" },
                  { key: "filterMedicine", value: "Medicine", type: "specialization" },
                  { key: "filterEngineering", value: "Engineering", type: "specialization" },
                  { key: "filterEnglish", value: "English", type: "language" },
                ];
                return tags.map((tag) => (
                  <button
                    key={tag.key}
                    onClick={() => {
                      if (tag.type === "country") {
                        router.push(`/universities?country=${encodeURIComponent(tag.value)}`);
                      } else if (tag.type === "language") {
                        router.push(`/universities?language=${encodeURIComponent(tag.value)}`);
                      } else {
                        router.push(`/universities?specialization=${encodeURIComponent(tag.value)}`);
                      }
                    }}
                    className="px-2 py-1 text-sm md:text-base font-montserrat-light text-[#040404] bg-[#e0e6f1] rounded-[50px] hover:bg-[#d0d6e1] transition-colors"
                  >
                    {t(tag.key)}
                  </button>
                ));
              })()}
            </div>
          </div>

          {/* Student Avatars and Stats */}
          {(() => {
            const currentLang = getLanguage();
            const isRTL = currentLang === "ar";
            return (
              <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-6 md:mt-8 md:absolute ${isRTL ? "md:right-[80px]" : "md:left-[80px]"} md:top-[590px] ${isRTL ? "sm:flex-row-reverse" : ""}`}>
                <div className={`flex items-center ${isRTL ? "pl-0 sm:pl-[26px]" : "pr-0 sm:pr-[26px]"}`}>
                  {studentAvatars.map((avatar, index) => (
                    <div
                      key={index}
                      className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white overflow-hidden ${
                        index > 0 ? (isRTL ? "-mr-4 md:-mr-[26px]" : "-ml-4 md:-ml-[26px]") : ""
                      }`}
                    >
                      <div className="absolute inset-0 bg-[#d9d9d9] rounded-full" />
                      <Image
                        src={avatar}
                        alt={`Student ${index + 1}`}
                        fill
                        className="object-cover rounded-full"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center py-2.5">
                  <p className="font-montserrat-regular text-sm md:text-[18px] leading-[1.4] text-[#2e2e2e] max-w-full md:max-w-[498px]">
                    {t("studentsInUniversities")}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
}
