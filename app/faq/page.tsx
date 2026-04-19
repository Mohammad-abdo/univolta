"use client";

import Image from "next/image";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FAQSection } from "@/components/faq-section";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { figmaAssets } from "@/lib/figma-assets";
import { t } from "@/lib/i18n";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#f9fafe] pb-16 md:pb-0">
      <Navbar />

      <main className="pt-0 md:pt-[150px]">
        <section className="relative pb-24">
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(105,171,233,0.16)] to-transparent pointer-events-none" />

          <div className="relative max-w-[1280px] mx-auto px-4 md:px-5">
            <ScrollReveal direction="fade">
            <div className="relative h-[220px] md:h-[360px] rounded-[20px] md:rounded-[32px] overflow-hidden shadow-[0px_24px_100px_rgba(82,96,206,0.2)] animate-hero-reveal">
              {/* Background layers */}
              <Image src={figmaAssets.faqHeroBackground} alt="City skyline" fill className="object-cover scale-105" priority unoptimized />
              <Image src={figmaAssets.faqHeroBackgroundOverlay} alt="" fill className="object-cover mix-blend-overlay opacity-80" priority aria-hidden="true" unoptimized />
              <Image src={figmaAssets.faqHeroBackgroundTexture} alt="" fill className="object-cover opacity-40" priority aria-hidden="true" unoptimized />

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#121c67]/80 via-[#5260ce]/50 to-[#75d3f7]/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121c67]/50 via-transparent to-transparent" />

              {/* Dot grid */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

              {/* Animated orbs */}
              <div className="absolute top-8 left-1/4 w-36 h-36 rounded-full bg-[#75d3f7]/25 blur-3xl animate-float" />
              <div className="absolute bottom-4 right-1/4 w-28 h-28 rounded-full bg-[#5260ce]/30 blur-2xl" style={{ animation: "float-gentle 6s ease-in-out infinite 0.5s" }} />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4 md:px-10 text-center">
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 mb-4 animate-fade-up">
                  <span className="text-sm">❓</span>
                  <span className="text-white/90 text-xs font-montserrat-semibold tracking-wider uppercase">Help Center</span>
                </div>
                <h1 className="text-white text-2xl md:text-[44px] font-montserrat-bold leading-tight animate-fade-up-d100 drop-shadow-lg">
                  {t("frequentlyAskedQuestions")}
                </h1>
                <p className="text-white/75 text-sm md:text-lg font-montserrat-regular mt-3 animate-fade-up-d200 max-w-lg">
                  Find answers to common questions about studying abroad with UniVolta
                </p>
                {/* Search hint */}
                <div className="mt-5 flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 animate-fade-up-d300">
                  <span className="text-white/60 text-xs">🔍</span>
                  <span className="text-white/60 text-xs font-montserrat-regular">Browse questions below…</span>
                </div>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </section>

        <FAQSection showIllustration />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

