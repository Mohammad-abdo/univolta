"use client";

import { useEffect, useState } from "react";
import { LocaleLink } from "@/components/locale-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import {
  Stethoscope, Cpu, Scale, Briefcase, Palette, Pill,
  Building, Wrench, ArrowRight,
} from "lucide-react";
import { t, getLanguage, type Language } from "@/lib/i18n";

const PROGRAMS = [
  { key: "programMedicine",     icon: Stethoscope, color: "from-rose-500/15 to-rose-500/5",   iconBg: "bg-rose-50",    iconColor: "text-rose-600",   hover: "hover:border-rose-200" },
  { key: "programEngineering",  icon: Wrench,      color: "from-blue-500/15 to-blue-500/5",   iconBg: "bg-blue-50",    iconColor: "text-blue-600",   hover: "hover:border-blue-200" },
  { key: "programBusiness",     icon: Briefcase,   color: "from-amber-500/15 to-amber-500/5", iconBg: "bg-amber-50",   iconColor: "text-amber-600",  hover: "hover:border-amber-200" },
  { key: "programLaw",          icon: Scale,       color: "from-purple-500/15 to-purple-500/5",iconBg:"bg-purple-50",  iconColor: "text-purple-600", hover: "hover:border-purple-200" },
  { key: "programCS",           icon: Cpu,         color: "from-cyan-500/15 to-cyan-500/5",   iconBg: "bg-cyan-50",    iconColor: "text-cyan-600",   hover: "hover:border-cyan-200" },
  { key: "programArts",         icon: Palette,     color: "from-pink-500/15 to-pink-500/5",   iconBg: "bg-pink-50",    iconColor: "text-pink-600",   hover: "hover:border-pink-200" },
  { key: "programArchitecture", icon: Building,    color: "from-orange-500/15 to-orange-500/5",iconBg:"bg-orange-50", iconColor: "text-orange-600", hover: "hover:border-orange-200" },
  { key: "programPharmacy",     icon: Pill,        color: "from-green-500/15 to-green-500/5", iconBg: "bg-green-50",   iconColor: "text-green-600",  hover: "hover:border-green-200" },
] as const;

export function ProgramsSection() {
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
    <section className="relative py-16 md:py-24 bg-[#f9fafe] overflow-hidden">
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: "radial-gradient(circle at 80% 20%, rgba(82,96,206,0.08) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(117,211,247,0.10) 0%, transparent 45%)",
      }} />

      <div className="max-w-[1280px] mx-auto px-4 md:px-5 relative z-[1]">
        <ScrollReveal direction="up">
          <div className={`text-center max-w-2xl mx-auto mb-10 md:mb-14 ${isRTL ? "rtl" : ""}`}>
            <Badge className="mb-4 bg-[rgba(82,96,206,0.1)] text-[#5260ce] border border-[#5260ce]/20 font-montserrat-semibold px-4 py-1.5">
              {tl("programsSectionBadge")}
            </Badge>
            <h2 className="font-montserrat-bold text-2xl md:text-[34px] text-[#121c67] leading-tight mb-4">
              {tl("programsSectionTitle")}
            </h2>
            <p className="font-montserrat-regular text-[#65666f] text-base md:text-lg leading-relaxed">
              {tl("programsSectionSubtitle")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 mb-10">
          {PROGRAMS.map(({ key, icon: Icon, iconBg, iconColor, hover }, i) => (
            <ScrollReveal key={key} direction="up" delay={i * 60}>
              <LocaleLink href={`/universities?specialization=${encodeURIComponent(key.replace("program", ""))}`}>
                <div className={`group h-full bg-white rounded-2xl border border-gray-100 ${hover} p-5 md:p-6 flex flex-col items-center text-center shadow-sm hover:shadow-[0_8px_40px_rgba(82,96,206,0.12)] transition-all duration-300 hover:-translate-y-1 cursor-pointer`}>
                  <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${iconColor}`} />
                  </div>
                  <p className="font-montserrat-semibold text-sm md:text-[15px] text-[#121c67] leading-snug">
                    {tl(key)}
                  </p>
                </div>
              </LocaleLink>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal direction="up" delay={200}>
          <div className="text-center">
            <Button
              asChild
              className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold px-8 py-3 h-auto rounded-xl shadow-[0_4px_24px_rgba(82,96,206,0.3)] hover:shadow-[0_8px_32px_rgba(82,96,206,0.4)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <LocaleLink href="/universities" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                {tl("programsViewAll")}
                <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
              </LocaleLink>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
