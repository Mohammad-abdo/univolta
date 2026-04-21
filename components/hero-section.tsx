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
import type { HeroSlideSetting } from "@/lib/site-settings";
import { getImageUrl } from "@/lib/image-utils";

/* Three.js background loaded only on the client */
const ParticleField = dynamic(
  () => import("@/components/ui/particle-field").then((m) => m.ParticleField),
  { ssr: false }
);

/* ── Slide data ─────────────────────────────────────────────────────────── */
const SLIDES = [
  { image: "https://images.unsplash.com/photo-1562774053-701939374585?w=1600&q=80", badgeKey: "heroSlideBadge1" as const },
  { image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&q=80", badgeKey: "heroSlideBadge2" as const },
  { image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1600&q=80", badgeKey: "heroSlideBadge3" as const },
  { image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80", badgeKey: "heroSlideBadge4" as const },
];

const INTERVAL_MS = 5500;

/* ── Component ──────────────────────────────────────────────────────────── */
export function HeroSection({ slidesOverride }: { slidesOverride?: HeroSlideSetting[] }) {
  const [searchQuery,  setSearchQuery]  = useState("");
  /* Always start with "en" → server and first client render match (hydration-safe) */
  const [currentLang,  setCurrentLang]  = useState<Language>("en");
  const [mounted,      setMounted]      = useState(false);
  const [activeSlide,  setActiveSlide]  = useState(0);
  const [prevSlide,    setPrevSlide]    = useState<number | null>(null);
  const [paused,       setPaused]       = useState(false);
  const router = useRouter();
  const slides = slidesOverride && slidesOverride.length > 0 ? slidesOverride : SLIDES;

  /* isRTL is false until mounted → server HTML == initial client HTML */
  const isRTL = mounted && currentLang === "ar";
  /* tl() passes React-state lang so every call is consistent with the server render */
  const tl = (key: string) => t(key, currentLang);

  /* language sync */
  useEffect(() => {
    setMounted(true);
    setCurrentLang(getLanguage());
    const id = setInterval(() => {
      const lang = getLanguage();
      if (lang !== currentLang) setCurrentLang(lang);
    }, 200);
    return () => clearInterval(id);
  }, [currentLang]);

  /* auto-play */
  const goTo = useCallback(
    (idx: number) => {
      setPrevSlide(activeSlide);
      setActiveSlide((idx + slides.length) % slides.length);
    },
    [activeSlide, slides.length]
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => goTo(activeSlide + 1), INTERVAL_MS);
    return () => clearInterval(id);
  }, [activeSlide, paused, goTo]);

  const studentAvatars = [
    figmaAssets.student1, figmaAssets.student2, figmaAssets.student3,
    figmaAssets.student4, figmaAssets.student5,
  ];

  const rotatingWords = [tl("heroWord1"), tl("heroWord2"), tl("heroWord3")];
  const currentSlideData = slides[activeSlide] as HeroSlideSetting | (typeof SLIDES)[number];
  const slideTitle =
    "titleEn" in currentSlideData
      ? (isRTL ? currentSlideData.titleAr : currentSlideData.titleEn) || tl("studyAbroadMadeEasy")
      : tl("studyAbroadMadeEasy");
  const slideSubtitle =
    "subEn" in currentSlideData
      ? (isRTL ? currentSlideData.subAr : currentSlideData.subEn) || tl("connectWithTopUniversities")
      : tl("connectWithTopUniversities");
  const stats = [
    { target: 150, suffix: "+", label: tl("studentsStatLabel")      },
    { target: 50,  suffix: "+", label: tl("universitiesStatLabel")  },
    { target: 30,  suffix: "+", label: tl("heroThirdStatLabel")     },
  ];

  /*
   * Layout is FIXED (identical for English and Arabic):
   *   LEFT  → text content (white gradient cover)
   *   RIGHT → decorative image panel (transparent gradient, visible photo)
   * isRTL only controls text-alignment and inline flex direction — NOT positions.
   */
  const gradient = "linear-gradient(to right, white 0%, rgba(255,255,255,0.92) 45%, rgba(255,255,255,0.15) 75%, rgba(255,255,255,0.05) 100%)";
  /* content ends at ~58% leaving ~3% gap before the circle at 61.2% */
  const padSide  = { paddingRight: "clamp(0px, 45%, 660px)" };

  return (
    <section
      className="relative min-h-[600px] md:h-[793px] overflow-hidden pt-20 md:pt-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── BACKGROUND SLIDESHOW ─────────────────────────────────────────── */}
      {slides.map((slide, idx) => {
        const isActive = idx === activeSlide;
        const wasPrev  = idx === prevSlide;
        return (
          <div
            key={"id" in slide ? slide.id : slide.image}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isActive ? "opacity-100 z-[1]" : wasPrev ? "opacity-0 z-[0]" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={getImageUrl(slide.image) || slide.image}
              alt={tl("heroCampusImageAlt")}
              fill
              priority={idx === 0}
              className={`object-cover ${isActive ? "slide-ken" : ""}`}
              unoptimized
            />
            {/* White gradient on the text side, transparent on the image-panel side */}
            <div className="absolute inset-0" style={{ background: gradient }} />
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
          </div>
        );
      })}

      {/* ── THREE.JS PARTICLE FIELD (z-2) ────────────────────────────────── */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <ParticleField />
      </div>

      {/* ── SOFT RADIAL GLOW — always left side (text side) ─────────────── */}
      <div
        className="absolute pointer-events-none z-[2]"
        style={{
          left: "-10%",
          top:  "10%",
          width:  "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(82,96,206,0.10) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden="true"
      />

      {/* ── MAIN CONTENT CONTAINER (z-3) ─────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto relative h-full px-4 md:px-5 z-[3]">

        {/* ═══ Desktop Decorative Panel ═══════════════════════════════════
             All left positions are % of the 1440px reference width so the
             panel scales correctly on every viewport ≥ 1024 px.
             Tops stay in px because the section height is fixed at 793px.
        ════════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:block">

          {/* Graduation cap — shifted +4% right for breathing room */}
          <div
            className="absolute w-[100px] h-[79px] flex items-center justify-center animate-float z-[4]"
            style={{ left: "50.6%", top: 202 }}
          >
            <div className="relative w-full h-full rotate-180 scale-y-[-1]">
              <Image src={figmaAssets.heroGraduationCap} alt="" fill className="object-contain" unoptimized />
            </div>
          </div>

          {/* Vector underline — inside text column */}
          <div className="absolute top-[312px] w-[141px] h-[10px] z-[4]" style={{ left: "5.56%" }}>
            <div className="absolute inset-[-30%_-2.13%_-30.01%_-2.13%]">
              <Image src={figmaAssets.heroVector} alt="" fill className="object-contain" unoptimized />
            </div>
          </div>

          {/* Hero banner — perfect 360° circle (square clip + rounded-full) */}
          <div
            className="absolute z-[5] rounded-full overflow-hidden bg-[#e8ecf7] shadow-[0_16px_48px_rgba(18,28,103,0.22)] ring-[5px] ring-white"
            style={{
              left:   "61.2%",
              top:    200,
              width:  "min(481px, 40vw)",
              height: "min(481px, 40vw)",
            }}
          >
            {slides.map((slide, idx) => (
              <div
                key={slide.image}
                className={`absolute inset-0 transition-opacity duration-1000 ${activeSlide === idx ? "opacity-100" : "opacity-0"}`}
              >
                <Image
                  src={getImageUrl(slide.image) || slide.image}
                  alt={tl("heroMaskedCampusAlt")}
                  fill
                  className={`object-cover ${activeSlide === idx ? "slide-ken" : ""}`}
                  style={{ objectPosition: "center center" }}
                  unoptimized
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-transparent to-[#121c67]/15 pointer-events-none" />
              </div>
            ))}
          </div>

          {/* Country flag bubbles — positioned around the circular banner */}
          {[
            { src: figmaAssets.flagFrance,  id: "f1", leftPct: "81.4%", top: 205, delay: "0s"   },
            { src: figmaAssets.flagUSA,     id: "f2", leftPct: "60.7%", top: 335, delay: "0.8s" },
            { src: figmaAssets.flagCanada,  id: "f3", leftPct: "88.0%", top: 300, delay: "1.5s" },
            { src: figmaAssets.flagUK,      id: "f4", leftPct: "92.3%", top: 438, delay: "0.4s" },
            { src: figmaAssets.flagGermany, id: "f5", leftPct: "58.2%", top: 490, delay: "1.2s" },
          ].map(({ src, id, leftPct, top, delay }) => (
            <div
              key={id}
              className="absolute w-[69px] h-[70px] bg-white rounded-[110px] p-3 flex items-center justify-center shadow-lg z-[5]"
              style={{ left: leftPct, top, animation: `float-gentle 5s ease-in-out infinite ${delay}` }}
            >
              <div className="relative w-11 h-11">
                <Image src={src} alt="" fill className="object-contain" unoptimized />
              </div>
            </div>
          ))}

          {/* Sparkle vector */}
          <div
            className="absolute w-[214px] h-[95px] overflow-hidden z-[4]"
            style={{ left: "82.1%", top: 597 }}
          >
            <div className="absolute inset-0 rotate-[193.445deg]">
              <div className="relative w-full h-full">
                <Image src={figmaAssets.heroVector3} alt="" fill className="object-contain" unoptimized />
              </div>
            </div>
          </div>

          {/* Sparkle star icon */}
          <div
            className="absolute w-[95px] h-[95px] overflow-hidden z-[4]"
            style={{ left: "64.0%", top: 199 }}
          >
            <div className="absolute left-[15px] top-[5px] w-[66px] h-[66px]">
              <Image src={figmaAssets.heroSparkle} alt="" fill className="object-contain" unoptimized />
            </div>
          </div>

          {/* Star decoration */}
          <div
            className="absolute w-[111px] h-[102px] overflow-hidden z-[4]"
            style={{ left: "65.7%", top: 631 }}
          >
            <div className="absolute left-1/2 -translate-x-1/2 top-[9px] w-[84px] h-[83px]">
              <div className="absolute inset-[20.04%_20.15%]">
                <Image src={figmaAssets.heroStar} alt="" fill className="object-contain" unoptimized />
              </div>
            </div>
          </div>

          {/* Slide indicator badge — sits on upper rim of circular banner */}
          <div className="absolute z-[6]" style={{ left: "61.5%", top: 172 }}>
            <div className="bg-white/90 backdrop-blur-md text-[#5260ce] text-xs font-montserrat-semibold px-3 py-1.5 rounded-full shadow-md border border-[#5260ce]/10 animate-fade-up">
              {"badgeKey" in slides[activeSlide]
                ? tl((slides[activeSlide] as { badgeKey: string }).badgeKey)
                : (slides[activeSlide] as HeroSlideSetting).badge || tl("heroSlideBadge1")}
            </div>
          </div>
        </div>

        {/* ═══ TEXT CONTENT ═══════════════════════════════════════════════ */}
        {/*
          Content lives on the TEXT side (left in LTR, right in RTL).
          padSide pushes it away from the decorative image panel.
          isRTL controls text-alignment + inline flex ordering only.
        */}
        <div
          className={`relative z-[5] pt-8 md:pt-[249px] pb-12 md:pb-0 ${isRTL ? "text-right" : "text-left"}`}
          style={padSide}
        >
          {/* Discovery badge */}
          <div className={`inline-flex items-center gap-2 glass-badge rounded-full px-4 py-1.5 mb-5 ${isRTL ? "flex-row-reverse" : ""}`}>
            <span className="text-base" aria-hidden="true">🌍</span>
            <span className="font-montserrat-regular text-sm text-[#65666f]">
              {tl("discoverTop")}{" "}
              <RotatingText words={rotatingWords} className="font-montserrat-semibold text-[#5260ce]" />
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-montserrat-bold text-2xl md:text-[40px] leading-[1.25] text-[#121c67] mb-3 md:mb-4">
            {slideTitle}
          </h1>

          {/* Description */}
          <p className="font-montserrat-regular text-sm md:text-[17px] leading-[1.55] text-[#65666f] mb-5 md:mb-6">
            {slideSubtitle}
          </p>

          {/* ── Search card ── */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-[0px_8px_48px_0px_rgba(82,96,206,0.12)] p-4 flex flex-col gap-4 w-full border border-[#5260ce]/8">

            {/* Input + button */}
            <div className={`flex flex-col sm:flex-row gap-3 md:gap-5 items-stretch sm:items-center ${isRTL ? "sm:flex-row-reverse" : ""}`}>
              <div className={`flex-1 flex items-center gap-2 md:gap-3 px-3 md:px-3.5 py-2.5 md:py-3.5 bg-gray-50 rounded-lg ${isRTL ? "flex-row-reverse" : ""}`}>
                <Search className="w-5 h-5 md:w-6 md:h-6 text-[#8b8c9a] shrink-0" />
                <input
                  type="text"
                  suppressHydrationWarning
                  placeholder={tl("searchUniversities")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    router.push(
                      searchQuery.trim()
                        ? `/universities?search=${encodeURIComponent(searchQuery)}`
                        : "/universities"
                    );
                  }}
                  className="flex-1 font-montserrat-light text-sm md:text-base text-[#8b8c9a] placeholder:text-[#8b8c9a] focus:outline-none bg-transparent"
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>
              <Button
                suppressHydrationWarning
                onClick={() =>
                  router.push(
                    searchQuery.trim()
                      ? `/universities?search=${encodeURIComponent(searchQuery)}`
                      : "/universities"
                  )
                }
                className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm md:text-base h-[48px] md:h-[52px] w-full sm:w-auto sm:min-w-[124px] rounded-lg md:rounded-xl shrink-0 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(82,96,206,0.4)] hover:-translate-y-0.5"
              >
                {tl("search")}
              </Button>
            </div>

            {/* Quick filters */}
            <div className={`flex gap-1.5 items-center flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
              {[
                { key: "filterUSA",         value: "USA",         type: "country"        },
                { key: "filterCanada",       value: "Canada",      type: "country"        },
                { key: "filterMexico",       value: "Mexico",      type: "country"        },
                { key: "filterMedicine",     value: "Medicine",    type: "specialization" },
                { key: "filterEngineering",  value: "Engineering", type: "specialization" },
                { key: "filterEnglish",      value: "English",     type: "language"       },
              ].map((tag) => (
                <button
                  key={tag.key}
                  suppressHydrationWarning
                  onClick={() => {
                    const param = tag.type === "country"
                      ? `country=${encodeURIComponent(tag.value)}`
                      : tag.type === "language"
                        ? `language=${encodeURIComponent(tag.value)}`
                        : `specialization=${encodeURIComponent(tag.value)}`;
                    router.push(`/universities?${param}`);
                  }}
                  className="px-2 py-1 text-sm md:text-base font-montserrat-light text-[#040404] bg-[#e0e6f1] rounded-[50px] hover:bg-[#5260ce] hover:text-white transition-all duration-200"
                >
                  {tl(tag.key)}
                </button>
              ))}
            </div>

            {/* Stats row */}
            <div className={`flex items-center pt-3 border-t border-gray-100 ${isRTL ? "flex-row-reverse" : ""}`}>
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex items-center flex-1">
                  <div className="flex-1 text-center px-4">
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

          {/* Student avatars + caption */}
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
                    alt={tl("heroStudentAvatarAlt").replace("{n}", String(index + 1))}
                    fill
                    className="object-cover rounded-full"
                    unoptimized
                  />
                </div>
              ))}
            </div>
            <p className="font-montserrat-regular text-sm md:text-[18px] leading-[1.4] text-[#2e2e2e] max-w-full md:max-w-[498px] py-2.5">
              {tl("studentsInUniversities")}
            </p>
          </div>
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────────────────────────── */}
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
