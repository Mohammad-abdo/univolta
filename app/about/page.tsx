"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import {
  Eye, Target, Lightbulb, Shield, Heart, CheckCircle2,
  Globe2, GraduationCap, ArrowRight, Sparkles, BookOpen,
  Users, Building2, TrendingUp, MapPin,
} from "lucide-react";
import { t, getLanguage, type Language } from "@/lib/i18n";

// ── Value card ───────────────────────────────────────────────────────────────
function ValueCard({
  icon: Icon,
  titleKey,
  textKey,
  gradient,
  delay,
}: {
  icon: React.ElementType;
  titleKey: string;
  textKey: string;
  gradient: string;
  delay: number;
}) {
  return (
    <ScrollReveal direction="up" delay={delay}>
      <div className="group relative h-full rounded-2xl border border-gray-100 bg-white p-7 shadow-sm hover:shadow-[0_12px_48px_rgba(82,96,206,0.13)] hover:border-[#5260ce]/20 hover:-translate-y-1 transition-all duration-300">
        <div className={`w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-montserrat-bold text-lg text-[#121c67] mb-2">{t(titleKey)}</h3>
        <p className="font-montserrat-regular text-[#65666f] text-[15px] leading-relaxed">{t(textKey)}</p>
      </div>
    </ScrollReveal>
  );
}

// ── Why-Egypt bullet ──────────────────────────────────────────────────────────
function EgyptPoint({ textKey, delay }: { textKey: string; delay: number }) {
  return (
    <ScrollReveal direction="left" delay={delay}>
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-[#5260ce] shrink-0 mt-0.5" />
        <p className="font-montserrat-regular text-[#2e2e2e] text-[15px] md:text-base leading-relaxed">{t(textKey)}</p>
      </div>
    </ScrollReveal>
  );
}

// ── Stat chip ────────────────────────────────────────────────────────────────
function StatChip({ icon: Icon, end, suffix, labelKey }: { icon: React.ElementType; end: number; suffix: string; labelKey: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
      <Icon className="w-6 h-6 text-[#75d3f7] mb-2" />
      <div className="font-montserrat-bold text-3xl text-white tabular-nums">
        <AnimatedCounter target={end} suffix={suffix} />
      </div>
      <p className="font-montserrat-regular text-white/70 text-sm mt-0.5">{t(labelKey)}</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const [lang, setLang] = useState<Language>(getLanguage());

  useEffect(() => {
    const id = setInterval(() => setLang(getLanguage()), 300);
    return () => clearInterval(id);
  }, []);

  const isRTL = lang === "ar";

  return (
    <div className={`min-h-screen bg-white pb-16 md:pb-0 ${isRTL ? "rtl" : "ltr"}`}>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-32 md:pt-40 pb-20 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1554] via-[#121c67] to-[#1e3a8a]" />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(ellipse at 20% 60%, rgba(117,211,247,0.3) 0%, transparent 55%), radial-gradient(ellipse at 80% 30%, rgba(82,96,206,0.5) 0%, transparent 50%)",
        }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        {/* Floating rings */}
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full border border-white/5 pointer-events-none" />

        <div className="max-w-[1100px] mx-auto px-4 md:px-5 relative z-[1]">
          <ScrollReveal direction="up">
            <div className="text-center">
              <Badge className="mb-5 bg-[#75d3f7]/15 text-[#75d3f7] border border-[#75d3f7]/30 font-montserrat-semibold px-5 py-1.5 inline-flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                {t("aboutHeroBadge")}
              </Badge>
              <h1 className="font-montserrat-bold text-3xl md:text-[52px] text-white leading-[1.2] mb-6 md:mb-8 max-w-[800px] mx-auto">
                {t("aboutHeroTitle")}
              </h1>
              <p className="font-montserrat-regular text-white/75 text-base md:text-xl leading-relaxed max-w-[680px] mx-auto mb-10">
                {t("aboutHeroSubtitle")}
              </p>
              <div className={`flex flex-wrap gap-4 justify-center ${isRTL ? "flex-row-reverse" : ""}`}>
                <Button asChild className="bg-white text-[#121c67] hover:bg-[#f0f4ff] font-montserrat-bold h-[52px] px-8 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <Link href="/universities" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    {t("getStarted")}
                    <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white font-montserrat-semibold h-[52px] px-8 rounded-xl backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Link href="/contact" className="!text-white">
                    {t("ctaButtonSecondary")}
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>

          {/* Hero stats row */}
          <ScrollReveal direction="up" delay={200}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 md:mt-20">
              <StatChip icon={Building2}   end={150}  suffix="+" labelKey="stat1Label" />
              <StatChip icon={Users}       end={5000} suffix="+" labelKey="stat2Label" />
              <StatChip icon={TrendingUp}  end={95}   suffix="%" labelKey="stat3Label" />
              <StatChip icon={BookOpen}    end={30}   suffix="+" labelKey="stat4Label" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1100px] mx-auto px-4 md:px-5">
          <ScrollReveal direction="up">
            <div className="text-center mb-12 md:mb-16">
              <Badge className="mb-4 bg-[rgba(82,96,206,0.1)] text-[#5260ce] border border-[#5260ce]/20 font-montserrat-semibold px-4 py-1.5">
                {t("aboutMissionBadge")}
              </Badge>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Mission */}
            <ScrollReveal direction="left" delay={0}>
              <div className="relative h-full rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#121c67] to-[#5260ce]" />
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: "radial-gradient(circle at 80% 20%, rgba(117,211,247,0.5) 0%, transparent 50%)",
                }} />
                <div className="relative z-[1] p-8 md:p-10 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-6">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-montserrat-bold text-xl md:text-2xl text-white mb-4">{t("aboutMissionTitle")}</h3>
                  <p className="font-montserrat-regular text-white/80 text-base md:text-lg leading-relaxed">{t("aboutMissionText")}</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Vision */}
            <ScrollReveal direction="right" delay={100}>
              <div className="relative h-full rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0d1554] via-[#1e2d8a] to-[#75d3f7]/40" />
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 45%)",
                }} />
                <div className="relative z-[1] p-8 md:p-10 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-6">
                    <Eye className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-montserrat-bold text-xl md:text-2xl text-white mb-4">{t("aboutVisionTitle")}</h3>
                  <p className="font-montserrat-regular text-white/80 text-base md:text-lg leading-relaxed">{t("aboutVisionText")}</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── OUR STORY ── */}
      <section className="py-16 md:py-24 bg-[#f9fafe]">
        <div className="max-w-[1100px] mx-auto px-4 md:px-5">
          <div className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${isRTL ? "md:flex-row-reverse" : ""}`}>
            {/* Visual side */}
            <ScrollReveal direction="left">
              <div className="relative">
                {/* Big card */}
                <div className="rounded-3xl bg-gradient-to-br from-[#121c67] to-[#5260ce] p-8 md:p-10 shadow-[0_20px_80px_rgba(82,96,206,0.3)]">
                  <GraduationCap className="w-14 h-14 text-[#75d3f7] mb-6" />
                  <p className="font-montserrat-bold text-white text-2xl md:text-3xl leading-snug mb-2">
                    50+
                  </p>
                  <p className="font-montserrat-regular text-white/70 text-base">{t("stat1Label")}</p>
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    {[
                      { icon: MapPin, label: "Cairo", sub: "HQ" },
                      { icon: Globe2, label: "Arabic & English", sub: "Support" },
                    ].map(({ icon: Icon, label, sub }) => (
                      <div key={label} className="bg-white/10 rounded-2xl p-4">
                        <Icon className="w-5 h-5 text-[#75d3f7] mb-1.5" />
                        <p className="font-montserrat-bold text-white text-sm">{label}</p>
                        <p className="font-montserrat-regular text-white/60 text-xs">{sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-[0_8px_32px_rgba(82,96,206,0.2)] p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-montserrat-bold text-[#121c67] text-sm">95%</p>
                    <p className="font-montserrat-regular text-[#65666f] text-xs">{t("stat3Label")}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Text side */}
            <ScrollReveal direction="right" delay={100}>
              <div>
                <Badge className="mb-4 bg-[rgba(82,96,206,0.1)] text-[#5260ce] border border-[#5260ce]/20 font-montserrat-semibold px-4 py-1.5">
                  {t("aboutStoryBadge")}
                </Badge>
                <h2 className="font-montserrat-bold text-2xl md:text-[34px] text-[#121c67] leading-tight mb-5">
                  {t("aboutStoryTitle")}
                </h2>
                <p className="font-montserrat-regular text-[#65666f] text-base md:text-lg leading-relaxed mb-5">
                  {t("aboutStoryText1")}
                </p>
                <p className="font-montserrat-regular text-[#65666f] text-base md:text-lg leading-relaxed">
                  {t("aboutStoryText2")}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1100px] mx-auto px-4 md:px-5">
          <ScrollReveal direction="up">
            <div className="text-center mb-12 md:mb-16">
              <Badge className="mb-4 bg-[rgba(82,96,206,0.1)] text-[#5260ce] border border-[#5260ce]/20 font-montserrat-semibold px-4 py-1.5">
                {t("aboutValuesBadge")}
              </Badge>
              <h2 className="font-montserrat-bold text-2xl md:text-[34px] text-[#121c67] leading-tight">
                {t("aboutValuesTitle")}
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            <ValueCard icon={Shield}    titleKey="aboutValue1Title" textKey="aboutValue1Text" gradient="from-[#5260ce] to-[#3b5bdb]" delay={0}   />
            <ValueCard icon={Globe2}    titleKey="aboutValue2Title" textKey="aboutValue2Text" gradient="from-[#1971c2] to-[#1c7ed6]" delay={80}  />
            <ValueCard icon={Lightbulb} titleKey="aboutValue3Title" textKey="aboutValue3Text" gradient="from-[#d4a017] to-[#f4c23b]" delay={160} />
            <ValueCard icon={Heart}     titleKey="aboutValue4Title" textKey="aboutValue4Text" gradient="from-[#c2255c] to-[#f06595]" delay={240} />
          </div>
        </div>
      </section>

      {/* ── WHY EGYPT ── */}
      <section className="py-16 md:py-24 bg-[#f9fafe] overflow-hidden">
        <div className="max-w-[1100px] mx-auto px-4 md:px-5">
          <div className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${isRTL ? "md:flex-row-reverse" : ""}`}>
            {/* Text side */}
            <div>
              <ScrollReveal direction="up">
                <Badge className="mb-4 bg-[rgba(82,96,206,0.1)] text-[#5260ce] border border-[#5260ce]/20 font-montserrat-semibold px-4 py-1.5">
                  {t("aboutWhyEgyptBadge")}
                </Badge>
                <h2 className="font-montserrat-bold text-2xl md:text-[34px] text-[#121c67] leading-tight mb-5">
                  {t("aboutWhyEgyptTitle")}
                </h2>
                <p className="font-montserrat-regular text-[#65666f] text-base md:text-lg leading-relaxed mb-8">
                  {t("aboutWhyEgyptText")}
                </p>
              </ScrollReveal>
              <div className="space-y-4">
                <EgyptPoint textKey="aboutWhyEgyptPoint1" delay={0}   />
                <EgyptPoint textKey="aboutWhyEgyptPoint2" delay={80}  />
                <EgyptPoint textKey="aboutWhyEgyptPoint3" delay={160} />
                <EgyptPoint textKey="aboutWhyEgyptPoint4" delay={240} />
              </div>
            </div>

            {/* Visual side — mosaic of cards */}
            <ScrollReveal direction="right" delay={100}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Building2, label: "Cairo University", sub: "Est. 1908", bg: "bg-gradient-to-br from-[#121c67] to-[#5260ce]", text: "text-white", subText: "text-white/70" },
                  { icon: GraduationCap, label: "Al-Azhar", sub: "Est. 970 AD", bg: "bg-gradient-to-br from-[#75d3f7]/30 to-[#5260ce]/20", text: "text-[#121c67]", subText: "text-[#65666f]" },
                  { icon: Globe2, label: "Ain Shams", sub: "Est. 1950", bg: "bg-gradient-to-br from-[#f4c23b]/20 to-[#f4c23b]/5", text: "text-[#121c67]", subText: "text-[#65666f]" },
                  { icon: BookOpen, label: "Intl. Branches", sub: "8+ campuses", bg: "bg-gradient-to-br from-[#5260ce] to-[#1971c2]", text: "text-white", subText: "text-white/70" },
                ].map(({ icon: Icon, label, sub, bg, text, subText }) => (
                  <div key={label} className={`rounded-2xl ${bg} p-6 shadow-sm hover:shadow-md transition-shadow`}>
                    <Icon className={`w-6 h-6 ${text} mb-3 opacity-80`} />
                    <p className={`font-montserrat-bold ${text} text-sm mb-0.5`}>{label}</p>
                    <p className={`font-montserrat-regular ${subText} text-xs`}>{sub}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1554] via-[#121c67] to-[#1e2d8a]" />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(ellipse at 15% 50%, rgba(117,211,247,0.25) 0%, transparent 55%), radial-gradient(ellipse at 85% 30%, rgba(82,96,206,0.4) 0%, transparent 50%)",
        }} />

        <div className="max-w-[800px] mx-auto px-4 md:px-5 relative z-[1] text-center">
          <ScrollReveal direction="up">
            <h2 className="font-montserrat-bold text-3xl md:text-[44px] text-white leading-[1.2] mb-5">
              {t("aboutCtaTitle")}
            </h2>
            <p className="font-montserrat-regular text-white/75 text-base md:text-xl leading-relaxed mb-8 max-w-[560px] mx-auto">
              {t("aboutCtaSubtitle")}
            </p>
            <Button
              asChild
              className="bg-white text-[#121c67] hover:bg-[#f0f4ff] font-montserrat-bold text-base h-[52px] px-10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <Link href="/universities" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                {t("aboutCtaButton")}
                <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
              </Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
