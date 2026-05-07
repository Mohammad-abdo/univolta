"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Users, Building2, TrendingUp, BookOpen } from "lucide-react";
import { t, getLanguage, type Language } from "@/lib/i18n";
import { fetchPublicSiteSettings, type HomeStatsSetting } from "@/lib/site-settings";

function Counter({ end, suffix = "", duration = 2200 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export function StatsSection() {
  const [lang, setLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);
  const [statsData, setStatsData] = useState<HomeStatsSetting>({
    universitiesCount: 150,
    studentsCount: 5000,
    acceptanceRate: 95,
    programsCount: 30,
  });

  useEffect(() => {
    setMounted(true);
    setLang(getLanguage());
    const id = setInterval(() => setLang(getLanguage()), 300);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetchPublicSiteSettings().then((settings) => {
      if (settings["home.stats"]) {
        setStatsData(settings["home.stats"]);
      }
    });
  }, []);

  const tl = (key: string) => t(key, lang);

  const DYNAMIC_STATS = [
    { icon: Building2, endValue: statsData.universitiesCount, suffix: "+", labelKey: "stat1Label", color: "from-[#5260ce]/15 to-[#5260ce]/5", iconColor: "text-[#5260ce]" },
    { icon: Users,     endValue: statsData.studentsCount, suffix: "+", labelKey: "stat2Label", color: "from-[#75d3f7]/20 to-[#75d3f7]/5", iconColor: "text-[#1971c2]" },
    { icon: TrendingUp,endValue: statsData.acceptanceRate,   suffix: "%", labelKey: "stat3Label", color: "from-[#5cb85c]/15 to-[#5cb85c]/5", iconColor: "text-[#5cb85c]" },
    { icon: BookOpen,  endValue: statsData.programsCount,   suffix: "+", labelKey: "stat4Label", color: "from-[#f4c23b]/15 to-[#f4c23b]/5", iconColor: "text-[#d4a017]" },
  ];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#121c67] via-[#1e2d8a] to-[#5260ce]" />
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: "radial-gradient(circle at 15% 50%, rgba(117,211,247,0.4) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(255,255,255,0.15) 0%, transparent 40%)",
      }} />
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className="max-w-[1280px] mx-auto px-4 md:px-5 relative z-[1]">
        <ScrollReveal direction="up">
          <div className={`text-center mb-12 md:mb-16 ${mounted && lang === "ar" ? "rtl" : ""}`}>
            <Badge className="mb-4 bg-white/10 text-white border border-white/20 font-montserrat-semibold px-4 py-1.5 backdrop-blur-sm">
              {tl("statsSectionBadge")}
            </Badge>
            <h2 className="font-montserrat-bold text-2xl md:text-[36px] text-white leading-tight">
              {tl("statsSectionTitle")}
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {DYNAMIC_STATS.map(({ icon: Icon, endValue, suffix, labelKey, color, iconColor }, i) => (
            <ScrollReveal key={labelKey} direction="up" delay={i * 100}>
              <div className="group relative rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-8 text-center hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div className="font-montserrat-bold text-3xl md:text-4xl text-white mb-1 tabular-nums">
                  <Counter end={endValue} suffix={suffix} />
                </div>
                <p className="font-montserrat-regular text-sm md:text-base text-white/75 leading-snug">
                  {tl(labelKey)}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
