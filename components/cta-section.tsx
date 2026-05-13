"use client";

import { useEffect, useState } from "react";
import { LocaleLink } from "@/components/locale-link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { t, getLanguage, type Language } from "@/lib/i18n";

export function CtaSection() {
  const [lang, setLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLang(getLanguage());
    const id = setInterval(() => setLang(getLanguage()), 300);
    return () => clearInterval(id);
  }, []);

  const isRTL = mounted && lang === "ar";
  const tl = (key: string) => t(key, lang);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Rich layered background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1554] via-[#121c67] to-[#1e2d8a]" />
      <div className="absolute inset-0" style={{
        backgroundImage: "radial-gradient(ellipse at 10% 50%, rgba(117,211,247,0.25) 0%, transparent 55%), radial-gradient(ellipse at 90% 20%, rgba(82,96,206,0.35) 0%, transparent 50%)",
      }} />
      {/* Decorative rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full border border-white/7 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-white/10 pointer-events-none" />
      {/* Floating dots */}
      {[
        { top: "15%", left: "8%",  w: "8px",  h: "8px",  opacity: 0.4, delay: "0s" },
        { top: "70%", left: "5%",  w: "12px", h: "12px", opacity: 0.25, delay: "1.5s" },
        { top: "30%", right: "6%", w: "6px",  h: "6px",  opacity: 0.5, delay: "0.8s" },
        { top: "80%", right: "10%",w: "10px", h: "10px", opacity: 0.3, delay: "2s" },
        { top: "50%", left: "15%", w: "5px",  h: "5px",  opacity: 0.35, delay: "0.4s" },
      ].map((dot, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-[#75d3f7] pointer-events-none"
          style={{ ...dot, width: dot.w, height: dot.h, animation: `float-gentle 6s ease-in-out infinite ${dot.delay}` }}
        />
      ))}

      <div className="max-w-[900px] mx-auto px-4 md:px-5 relative z-[1] text-center">
        <ScrollReveal direction="up">
          <div className={`flex justify-center mb-5 ${isRTL ? "rtl" : ""}`}>
            <Badge className="bg-[#75d3f7]/15 text-[#75d3f7] border border-[#75d3f7]/30 font-montserrat-semibold px-5 py-1.5 backdrop-blur-sm flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              {tl("ctaBadge")}
            </Badge>
          </div>

          <h2 className="font-montserrat-bold text-3xl md:text-[48px] text-white leading-[1.2] mb-5 md:mb-6">
            {tl("ctaTitle")}
          </h2>

          <p className="font-montserrat-regular text-white/75 text-base md:text-xl leading-relaxed mb-8 md:mb-10 max-w-[680px] mx-auto">
            {tl("ctaSubtitle")}
          </p>

          <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isRTL ? "sm:flex-row-reverse" : ""}`}>
            <Button
              asChild
              className="bg-white text-[#121c67] hover:bg-[#f0f4ff] font-montserrat-bold text-base h-[52px] px-8 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <LocaleLink href="/universities" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                {tl("ctaButton")}
                <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
              </LocaleLink>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-white/60 font-montserrat-semibold text-base h-[52px] px-8 rounded-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 [&_svg]:text-white"
            >
              <LocaleLink href="/contact" className={`flex items-center justify-center gap-2 min-w-0 ${isRTL ? "flex-row-reverse" : ""}`}>
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden />
                <span className="text-white">{tl("ctaButtonSecondary")}</span>
              </LocaleLink>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
