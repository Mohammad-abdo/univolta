"use client";

import Image from "next/image";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FAQSection } from "@/components/faq-section";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
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
            <div className="relative h-[200px] md:h-[350px] rounded-[16px] md:rounded-[24px] overflow-hidden shadow-[0px_20px_80px_rgba(82,96,206,0.15)]">
              <Image
                src={figmaAssets.faqHeroBackground}
                alt="City skyline with academic symbols"
                fill
                className="object-cover"
                priority
                unoptimized
              />

              <Image
                src={figmaAssets.faqHeroBackgroundOverlay}
                alt=""
                fill
                className="object-cover mix-blend-overlay opacity-80"
                priority
                aria-hidden="true"
                unoptimized
              />

              <Image
                src={figmaAssets.faqHeroBackgroundTexture}
                alt=""
                fill
                className="object-cover opacity-50"
                priority
                aria-hidden="true"
                unoptimized
              />

              <div className="absolute inset-0 bg-[#121c67]/40" aria-hidden="true" />

              <div className="absolute inset-0 flex items-center justify-center px-4 md:px-10 text-center">
                <h1 className="text-white text-xl md:text-[34px] font-montserrat-bold leading-[1.4]">
                  {t("frequentlyAskedQuestions")}
                </h1>
              </div>
            </div>
          </div>
        </section>

        <FAQSection showIllustration />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

