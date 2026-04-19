"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { figmaAssets } from "@/lib/figma-assets";
import { Search } from "lucide-react";
import { t, getLanguage, type Language } from "@/lib/i18n";
import { RotatingText } from "@/components/ui/rotating-text";
import { AnimatedCounter } from "@/components/ui/animated-counter";

const ParticleField = dynamic(
  () => import("@/components/ui/particle-field").then((m) => m.ParticleField),
  { ssr: false }
);

// ── Slide data (badges via i18n keys — no hardcoded locale text) ───────────
const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=1600&q=80",
    badgeKey: "heroSlideBadge1" as const,
    accent: "#5260ce",
  },
  {
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&q=80",
    badgeKey: "heroSlideBadge2" as const,
    accent: "#3b5bdb",
  },
  {
    image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1600&q=80",
    badgeKey: "heroSlideBadge3" as const,
    accent: "#1971c2",
  },
  {
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80",
    badgeKey: "heroSlideBadge4" as const,
    accent: "#5260ce",
  },
];

const INTERVAL_MS = 5500;

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage());
  const [activeSlide, setActiveSlide] = useState(0);
  const [prevSlide, setPrevSlide]     = useState<number | null>(null);
  const [paused, setPaused]           = useState(false);
  const router = useRouter();

  const isRTL = currentLang === "ar";

  // language sync
  useEffect(() => {
    const id = setInterval(() => {
      const lang = getLanguage();
      if (lang !== currentLang) setCurrentLang(lang);
    }, 200);
    return () => clearInterval(id);
  }, [currentLang]);

  // auto-play
  const goTo = useCallback((idx: number) => {
    setPrevSlide(activeSlide);
    setActiveSlide((idx + SLIDES.length) % SLIDES.length);
  }, [activeSlide]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => goTo(activeSlide + 1), INTERVAL_MS);
    return () => clearInterval(id);
  }, [activeSlide, paused, goTo]);

  const studentAvatars = [
    figmaAssets.student1, figmaAssets.student2, figmaAssets.student3,
    figmaAssets.student4, figmaAssets.student5,
  ];

  const rotatingWords = [t("heroWord1"), t("heroWord2"), t("heroWord3")];
  const stats = [
    { target: 150, suffix: "+", label: t("studentsStatLabel") },
    { target: 50,  suffix: "+", label: t("universitiesStatLabel") },
    { target: 30,  suffix: "+", label: t("heroThirdStatLabel") },
  ];

  return (
    <section
      className="relative min-h-[600px] md:h-[793px] overflow-hidden pt-20 md:pt-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── SLIDESHOW BACKGROUNDS ── */}
      {SLIDES.map((slide, idx) => {
        const isActive = idx === activeSlide;
        const wasPrev  = idx === prevSlide;
        return (
          <div
            key={slide.image}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isActive ? "opacity-100 z-[1]" : wasPrev ? "opacity-0 z-[0]" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={t("heroCampusImageAlt")}
              fill
              priority={idx === 0}
              className={`object-cover ${isActive ? "slide-ken" : ""}`}
              unoptimized
            />
            {/* gradient overlays — direction mirrors with RTL so text side is always white */}
            <div
              className="absolute inset-0"
              style={{
                background: isRTL
                  ? "linear-gradient(to left, white 0%, rgba(255,255,255,0.92) 45%, rgba(255,255,255,0.15) 75%, rgba(255,255,255,0.05) 100%)"
                  : "linear-gradient(to right, white 0%, rgba(255,255,255,0.92) 45%, rgba(255,255,255,0.15) 75%, rgba(255,255,255,0.05) 100%)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
          </div>
        );
      })}

      {/* ── Three.js particle background (z-2) ── */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <ParticleField />
      </div>

      {/* ── Soft radial glow ── */}
      <div
        className="absolute pointer-events-none z-[2]"
        style={{
          left: isRTL ? "auto" : "-10%",
          right: isRTL ? "-10%" : "auto",
          top: "10%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(82,96,206,0.10) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden="true"
      />

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-[1440px] mx-auto relative h-full px-4 md:px-5 z-[3]">

        {/* Desktop Decorative Elements */}
        <div className="hidden lg:block">
          <div className={`absolute ${isRTL ? "right-[671px]" : "left-[671px]"} top-[202px] w-[100px] h-[79px] flex items-center justify-center animate-float`}>
            <div className="relative w-full h-full rotate-180 scale-y-[-100%]">
              <Image src={figmaAssets.heroGraduationCap} alt="" fill className="object-contain" unoptimized />
            </div>
          </div>
          <div className={`absolute ${isRTL ? "right-[80px]" : "left-[80px]"} top-[312px] w-[141px] h-[10px]`}>
            <div className="absolute inset-[-30%_-2.13%_-30.01%_-2.13%]">
              <Image src={figmaAssets.heroVector} alt="" fill className="object-contain" unoptimized />
            </div>
          </div>

          {/* Right hero image — shows active slide's university in the circular mask */}
          <div className={`absolute ${isRTL ? "right-[825px]" : "left-[825px]"} top-[236px] w-[481px] h-[481px] z-[4]`}>
            <Image src={figmaAssets.heroFrame} alt="" fill className="object-contain" unoptimized />
          </div>
          <div className={`absolute ${isRTL ? "right-[824px]" : "left-[824px]"} top-[149px] w-[481px] h-[580px] overflow-hidden z-[4]`}>
            <div
              className="absolute inset-0 transition-all duration-1000"
              style={{
                maskImage: `url('${figmaAssets.heroMainImageMask}')`,
                maskSize: "481px 614px",
                maskPosition: "-0.08px -45.304px",
                maskRepeat: "no-repeat",
              }}
            >
              {SLIDES.map((slide, idx) => (
                <div
                  key={slide.image}
                  className={`absolute inset-0 transition-opacity duration-1000 ${activeSlide === idx ? "opacity-100" : "opacity-0"}`}
                >
                  <Image
                    src={slide.image}
                    alt={t("heroMaskedCampusAlt")}
                    fill
                    className={`object-cover ${activeSlide === idx ? "slide-ken" : ""}`}
                    style={{ objectPosition: "center top" }}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121c67]/10" />
                </div>
              ))}
              {/* fallback static image on top if needed */}
              <Image
                src={figmaAssets.heroMainImage}
                alt=""
                fill
                className="object-cover opacity-0"
                style={{ objectPosition: "left -12.14% top 1%" }}
                unoptimized
              />
            </div>
          </div>

          {/* Country Flags */}
          {[
            { src: figmaAssets.flagFrance,  id: "f1", pos: isRTL ? "right-[1114px]" : "left-[1114px]", top: "top-[155px]",  delay: "0s" },
            { src: figmaAssets.flagUSA,     id: "f2", pos: isRTL ? "right-[816px]"  : "left-[816px]",  top: "top-[315px]",  delay: "0.8s" },
            { src: figmaAssets.flagCanada,  id: "f3", pos: isRTL ? "right-[1210px]" : "left-[1210px]", top: "top-[281px]",  delay: "1.5s" },
            { src: figmaAssets.flagUK,      id: "f4", pos: isRTL ? "right-[1271px]" : "left-[1271px]", top: "top-[418px]",  delay: "0.4s" },
            { src: figmaAssets.flagGermany, id: "f5", pos: isRTL ? "right-[781px]"  : "left-[781px]",  top: "top-[470px]",  delay: "1.2s" },
          ].map(({ src, id, pos, top, delay }) => (
            <div
              key={id}
              className={`absolute ${pos} ${top} w-[69px] h-[70px] bg-white rounded-[110px] p-3 flex items-center justify-center shadow-lg z-[5]`}
              style={{ animation: `float-gentle 5s ease-in-out infinite ${delay}` }}
            >
              <div className="relative w-11 h-11">
                <Image src={src} alt="" fill className="object-contain" unoptimized />
              </div>
            </div>
          ))}

          {/* Sparkles */}
          <div className={`absolute ${isRTL ? "right-[1124px]" : "left-[1124px]"} top-[597px] w-[214px] h-[95px] overflow-hidden z-[4]`}>
            <div className="absolute inset-0 rotate-[193.445deg]">
              <div className="relative w-full h-full">
                <Image src={figmaAssets.heroVector3} alt="" fill className="object-contain" unoptimized />
              </div>
            </div>
          </div>
          <div className={`absolute ${isRTL ? "right-[864px]" : "left-[864px]"} top-[199px] w-[95px] h-[95px] overflow-hidden z-[4]`}>
            <div className={`absolute ${isRTL ? "right-[15px]" : "left-[15px]"} top-[5px] w-[66px] h-[66px]`}>
              <Image src={figmaAssets.heroSparkle} alt="" fill className="object-contain" unoptimized />
            </div>
          </div>
          <div className={`absolute ${isRTL ? "right-[889px]" : "left-[889px]"} top-[631px] w-[111px] h-[102px] overflow-hidden z-[4]`}>
            <div className={`absolute ${isRTL ? "right-1/2 translate-x-1/2" : "left-1/2 -translate-x-1/2"} top-[9px] w-[84px] h-[83px]`}>
              <div className="absolute inset-[20.04%_20.15%]">
                <Image src={figmaAssets.heroStar} alt="" fill className="object-contain" unoptimized />
              </div>
            </div>
          </div>

          {/* Slide indicator badge (top-right of hero frame) */}
          <div className={`absolute z-[6] ${isRTL ? "right-[828px]" : "left-[828px]"} top-[150px]`}>
            <div className="bg-white/90 backdrop-blur-md text-[#5260ce] text-xs font-montserrat-semibold px-3 py-1.5 rounded-full shadow-md border border-[#5260ce]/10 animate-fade-up">
              {t(SLIDES[activeSlide].badgeKey)}
            </div>
          </div>
        </div>

        {/* ── TEXT CONTENT — stays on the white side in both LTR & RTL ── */}
        <div
          className={`relative z-[5] pt-8 md:pt-[249px] pb-12 md:pb-0 ${isRTL ? "text-right" : "text-left"}`}
          style={isRTL ? { paddingLeft: "clamp(0px, 52%, 760px)" } : { paddingRight: "clamp(0px, 42%, 640px)" }}
        >

          {/* Discovery Badge */}
          <div className={`inline-flex items-center gap-2 glass-badge rounded-full px-4 py-1.5 mb-5 ${isRTL ? "flex-row-reverse" : ""}`}>
            <span className="text-base" aria-hidden="true">🌍</span>
            <span className="font-montserrat-regular text-sm text-[#65666f]">
              {t("discoverTop")}{" "}
              <RotatingText words={rotatingWords} className="font-montserrat-semibold text-[#5260ce]" />
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-montserrat-bold text-2xl md:text-[40px] leading-[1.25] text-[#121c67] mb-3 md:mb-4">
            {t("studyAbroadMadeEasy")}
          </h1>

          {/* Description */}
          <p className="font-montserrat-regular text-sm md:text-[17px] leading-[1.55] text-[#65666f] mb-5 md:mb-6">
            {t("connectWithTopUniversities")}
          </p>

          {/* Search Bar */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-[0px_8px_48px_0px_rgba(82,96,206,0.12)] p-4 flex flex-col gap-4 w-full border border-[#5260ce]/8">
            <div className={`flex flex-col sm:flex-row gap-3 md:gap-5 items-stretch sm:items-center ${isRTL ? "sm:flex-row-reverse" : ""}`}>
              <div className={`flex-1 flex items-center gap-2 md:gap-3 px-3 md:px-3.5 py-2.5 md:py-3.5 bg-gray-50 rounded-lg md:rounded-none ${isRTL ? "flex-row-reverse" : ""}`}>
                <Search className={`w-5 h-5 md:w-6 md:h-6 text-[#8b8c9a] shrink-0 ${isRTL ? "ml-2 md:ml-3" : ""}`} />
                <input
                  type="text"
                  placeholder={t("searchUniversities")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (searchQuery.trim()) router.push(`/universities?search=${encodeURIComponent(searchQuery)}`);
                      else router.push("/universities");
                    }
                  }}
                  className="flex-1 font-montserrat-light text-sm md:text-base text-[#8b8c9a] placeholder:text-[#8b8c9a] focus:outline-none bg-transparent"
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>
              <Button
                onClick={() => {
                  if (searchQuery.trim()) router.push(`/universities?search=${encodeURIComponent(searchQuery)}`);
                  else router.push("/universities");
                }}
                className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm md:text-base h-[48px] md:h-[52px] w-full sm:w-auto sm:min-w-[124px] rounded-lg md:rounded-xl shrink-0 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(82,96,206,0.4)] hover:-translate-y-0.5"
              >
                {t("search")}
              </Button>
            </div>

            {/* Quick Filters */}
            <div className={`flex gap-1.5 items-center flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
              {[
                { key: "filterUSA",        value: "USA",         type: "country" },
                { key: "filterCanada",      value: "Canada",      type: "country" },
                { key: "filterMexico",      value: "Mexico",      type: "country" },
                { key: "filterMedicine",    value: "Medicine",    type: "specialization" },
                { key: "filterEngineering", value: "Engineering", type: "specialization" },
                { key: "filterEnglish",     value: "English",     type: "language" },
              ].map((tag) => (
                <button
                  key={tag.key}
                  onClick={() => {
                    if (tag.type === "country") router.push(`/universities?country=${encodeURIComponent(tag.value)}`);
                    else if (tag.type === "language") router.push(`/universities?language=${encodeURIComponent(tag.value)}`);
                    else router.push(`/universities?specialization=${encodeURIComponent(tag.value)}`);
                  }}
                  className="px-2 py-1 text-sm md:text-base font-montserrat-light text-[#040404] bg-[#e0e6f1] rounded-[50px] hover:bg-[#5260ce] hover:text-white transition-all duration-200"
                >
                  {t(tag.key)}
                </button>
              ))}
            </div>

            {/* Animated Stats Row */}
            <div className={`flex items-center gap-0 pt-3 border-t border-gray-100 ${isRTL ? "flex-row-reverse" : ""}`}>
              {stats.map((stat, i) => (
                <div key={stat.label} className={`flex ${isRTL ? "flex-row-reverse" : ""} items-center`}>
                  <div className={`flex-1 text-center px-4 ${i === 0 ? (isRTL ? "pl-0" : "pr-4 pl-0") : ""}`}>
                    <div className="font-montserrat-bold text-xl text-gradient-accent">
                      <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                    </div>
                    <div className="font-montserrat-regular text-xs text-[#65666f] mt-0.5 whitespace-nowrap">
                      {stat.label}
                    </div>
                  </div>
                  {i < stats.length - 1 && <div className="w-px h-10 bg-gray-200 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Student Avatars */}
          <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-6 md:mt-7 ${isRTL ? "sm:flex-row-reverse" : ""}`}>
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
                    alt={t("heroStudentAvatarAlt").replace("{n}", String(index + 1))}
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
        </div>
      </div>

      {/* Progress bar only — no dots/arrows */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] z-[6] bg-gray-100/40">
        <div
          key={activeSlide}
          className="h-full bg-gradient-to-r from-[#5260ce] to-[#75d3f7]"
          style={{ animation: `progress-fill ${INTERVAL_MS}ms linear forwards` }}
        />
      </div>
    </section>
  );
}
