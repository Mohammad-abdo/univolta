"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FAQSection } from "@/components/faq-section";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Badge } from "@/components/ui/badge";
import { t, getLanguage, type Language } from "@/lib/i18n";
import { HelpCircle, Search } from "lucide-react";

export default function FAQPage() {
  const [lang, setLang] = useState<Language>(getLanguage());

  useEffect(() => {
    const id = setInterval(() => setLang(getLanguage()), 300);
    return () => clearInterval(id);
  }, []);

  const isRTL = lang === "ar";

  return (
    <div className={`min-h-screen bg-[#f9fafe] pb-16 md:pb-0 ${isRTL ? "rtl" : "ltr"}`}>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-24 md:pt-36 pb-14 md:pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1554] via-[#121c67] to-[#1e2d8a]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 60%, rgba(117,211,247,0.4) 0%, transparent 55%), radial-gradient(ellipse at 80% 30%, rgba(82,96,206,0.5) 0%, transparent 50%)",
          }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Floating orbs */}
        <div className="absolute top-10 left-1/4 w-40 h-40 rounded-full bg-[#75d3f7]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-6 right-1/3 w-32 h-32 rounded-full bg-[#5260ce]/25 blur-2xl pointer-events-none" style={{ animation: "float-gentle 6s ease-in-out infinite 0.8s" }} />

        <div className="relative max-w-[860px] mx-auto px-4 md:px-5 text-center z-[1]">
          {/* Badge */}
          <div className="flex justify-center mb-5">
            <Badge className="bg-white/10 text-white border border-white/20 font-montserrat-semibold px-5 py-1.5 backdrop-blur-sm inline-flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5" />
              {t("faqHelpCenter")}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="font-montserrat-bold text-3xl md:text-[50px] text-white leading-[1.2] mb-5 drop-shadow-lg">
            {t("frequentlyAskedQuestions")}
          </h1>

          {/* Subtitle */}
          <p className="font-montserrat-regular text-white/75 text-base md:text-xl leading-relaxed mb-8 max-w-[600px] mx-auto">
            {t("faqHeroSubtitle")}
          </p>

          {/* Search hint pill */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2.5">
            <Search className="w-4 h-4 text-white/60" />
            <span className="text-white/60 text-sm font-montserrat-regular">{t("faqHeroSearch")}</span>
          </div>
        </div>

        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#f9fafe]" style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
      </section>

      {/* ── FAQ CONTENT ── */}
      <main>
        <FAQSection />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
