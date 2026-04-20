"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Globe2, GraduationCap, Plane, ArrowRight } from "lucide-react";
import { t, getLanguage, type Language } from "@/lib/i18n";
import { useEffect, useState } from "react";

const points = [
  { key: "businessModelPoint1" as const, icon: Plane },
  { key: "businessModelPoint2" as const, icon: GraduationCap },
  { key: "businessModelPoint3" as const, icon: Globe2 },
];

export function EgyptBusinessSection() {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    setLang(getLanguage());
    const id = setInterval(() => setLang(getLanguage()), 300);
    return () => clearInterval(id);
  }, []);

  const isRTL = lang === "ar";
  const tl = (key: string) => t(key, lang);

  return (
    <section className="relative py-14 md:py-20 bg-gradient-to-b from-[#f9fafe] via-white to-[#f9fafe] overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(82,96,206,0.12) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(117,211,247,0.15) 0%, transparent 40%)",
        }}
      />

      <div className="max-w-[1280px] mx-auto px-4 md:px-5 relative z-[1]">
        <ScrollReveal direction="up">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
            <Badge className="mb-4 bg-[rgba(82,96,206,0.1)] text-[#5260ce] border border-[#5260ce]/20 font-montserrat-semibold px-4 py-1.5">
              {tl("businessModelBadge")}
            </Badge>
            <h2 className="font-montserrat-bold text-2xl md:text-[34px] text-[#121c67] leading-tight section-title-accent pb-1 inline-block">
              {tl("businessModelTitle")}
            </h2>
            <p className="mt-4 text-[#65666f] font-montserrat-regular text-base md:text-lg leading-relaxed">
              {tl("businessModelLead")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6 mb-10">
          {points.map(({ key, icon: Icon }, i) => (
            <ScrollReveal key={key} direction="up" delay={i * 80}>
              <div className="h-full rounded-2xl border border-gray-100 bg-white/90 backdrop-blur-sm p-6 shadow-[0_8px_40px_rgba(82,96,206,0.08)] card-hover-glow transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5260ce]/15 to-[#75d3f7]/20 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#5260ce]" />
                </div>
                <p className="font-montserrat-regular text-sm md:text-[15px] text-[#2e2e2e] leading-relaxed">
                  {tl(key)}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal direction="fade">
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${isRTL ? "sm:flex-row-reverse" : ""}`}
          >
            <Button
              className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold h-12 px-8 rounded-xl shadow-[0_4px_20px_rgba(82,96,206,0.35)] group"
              asChild
            >
              <Link
                href="/universities?country=Egypt"
                className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                {tl("businessModelCta")}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-[#5260ce] text-[#5260ce] hover:bg-[#5260ce]/5 font-montserrat-semibold h-12 px-8 rounded-xl"
              asChild
            >
              <Link href="/contact">{tl("contact")}</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
