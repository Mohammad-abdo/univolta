"use client";

import Image from "next/image";
import { figmaAssets } from "@/lib/figma-assets";
import { Search, FileText, Headphones, ArrowRight, ArrowLeft } from "lucide-react";
import { getLanguage, t, type Language } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function HowItWorksSection() {
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentLang(getLanguage());
    const interval = setInterval(() => setCurrentLang(getLanguage()), 300);
    return () => clearInterval(interval);
  }, []);

  const isRTL = mounted && currentLang === "ar";
  const tl = (key: string) => t(key, currentLang);
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const steps = [
    {
      number: "01",
      icon: Search,
      title: tl("exploreChoose"),
      description: tl("exploreChooseDesc"),
      color: "#5260ce",
      bg: "rgba(82,96,206,0.08)",
    },
    {
      number: "02",
      icon: FileText,
      title: tl("applyOnline"),
      description: tl("applyOnlineDesc"),
      color: "#75d3f7",
      bg: "rgba(117,211,247,0.12)",
    },
    {
      number: "03",
      icon: Headphones,
      title: tl("getSupport"),
      description: tl("getSupportDesc"),
      color: "#121c67",
      bg: "rgba(18,28,103,0.08)",
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-[rgba(117,211,247,0.06)] relative overflow-hidden">
      {/* Background decorative orb */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: isRTL ? "auto" : "-5%",
          left: isRTL ? "-5%" : "auto",
          bottom: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(117,211,247,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-[1440px] mx-auto px-4 md:px-5">
        <div className={`grid lg:grid-cols-2 gap-8 md:gap-12 items-start ${isRTL ? "lg:grid-cols-2" : ""}`}>

          {/* ── Left / Intro Content ── */}
          <ScrollReveal direction={isRTL ? "right" : "left"} className={`space-y-4 md:space-y-6 ${isRTL ? "lg:order-2 text-right" : ""}`}>
            <div>
              <p className="text-sm md:text-base font-montserrat-regular text-[#5260ce] mb-2">
                {tl("howItWorks")}
              </p>
              <div className="relative w-[83px] h-[10px] mb-4 inline-block">
                <Image src={figmaAssets.vector5} alt="" fill className="object-contain" unoptimized />
              </div>
            </div>

            <h2 className="text-2xl md:text-[34px] font-montserrat-bold text-[#121c67] leading-tight">
              {tl("howToApply")}
            </h2>
            <p className="text-base md:text-[18px] font-montserrat-regular text-[#7c7b7c] leading-relaxed max-w-full md:max-w-[269px]">
              {tl("howToApplyDescription")}
            </p>

            {/* Step count badge */}
            <div className={`inline-flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-md border border-[#5260ce]/10 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[#5260ce] opacity-80" style={{ opacity: 0.3 + i * 0.35 }} />
                ))}
              </div>
              <span className="font-montserrat-semibold text-sm text-[#121c67]">
                {steps.length} {tl("stepsToApply")}
              </span>
            </div>

            {/* Decorative send icon */}
            <div className="relative mt-4">
              <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-[#75d3f7] to-[#5260ce] rounded-full blur-3xl opacity-15 pointer-events-none" />
            </div>
          </ScrollReveal>

          {/* ── Right / Steps ── */}
          <div className={`grid gap-0 ${isRTL ? "lg:order-1" : ""}`}>
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isLast = index === steps.length - 1;

              return (
                <ScrollReveal
                  key={index}
                  direction="up"
                  delay={index * 180}
                  className="relative"
                >
                  <div className={`flex gap-4 md:gap-6 pb-8 ${isRTL ? "flex-row-reverse" : ""}`}>
                    {/* Left: step number + connector */}
                    <div className={`flex flex-col items-center shrink-0 ${isRTL ? "items-center" : ""}`}>
                      {/* Icon circle */}
                      <div
                        className="w-[56px] h-[56px] md:w-[68px] md:h-[68px] flex items-center justify-center rounded-xl relative overflow-hidden"
                        style={{ background: step.bg, border: `2px solid ${step.color}20` }}
                      >
                        <IconComponent
                          className="w-7 h-7 md:w-8 md:h-8"
                          style={{ color: step.color }}
                        />
                        {/* Shimmer overlay */}
                        <div
                          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                          style={{ background: `linear-gradient(135deg, transparent 30%, ${step.color}18 100%)` }}
                        />
                      </div>

                      {/* Connector line */}
                      {!isLast && (
                        <div
                          className="w-[2px] flex-1 mt-2 rounded-full"
                          style={{
                            background: `linear-gradient(to bottom, ${step.color}50, transparent)`,
                            minHeight: "32px",
                          }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 pt-1 ${isRTL ? "text-right" : ""}`}>
                      <div className={`flex items-center gap-2 mb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <span
                          className="font-montserrat-bold text-xs tracking-widest"
                          style={{ color: step.color }}
                        >
                          {step.number}
                        </span>
                        <div className="h-px flex-1 max-w-[32px]" style={{ background: step.color, opacity: 0.3 }} />
                      </div>
                      <h3 className="text-lg md:text-xl font-montserrat-bold mb-2" style={{ color: step.color }}>
                        {step.title}
                      </h3>
                      <p className="text-sm md:text-base font-montserrat-regular text-[#65666f] leading-relaxed">
                        {step.description}
                      </p>
                      {!isLast && (
                        <div className={`flex items-center gap-1 mt-3 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
                          <span className="text-xs font-montserrat-light text-[#8b8c9a]">{tl("thenNext")}</span>
                          <ArrowIcon className="w-3 h-3 text-[#8b8c9a]" />
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
