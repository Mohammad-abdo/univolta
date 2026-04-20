"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { WhyUsSection } from "@/components/why-us-section";
import { StatsSection } from "@/components/stats-section";
import { UniversitiesSection } from "@/components/universities-section";
import { ProgramsSection } from "@/components/programs-section";
import { EgyptBusinessSection } from "@/components/egypt-business-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { CtaSection } from "@/components/cta-section";
import { FAQSection } from "@/components/faq-section";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { fetchPublicSiteSettings, type HeroSlideSetting, type HomeSectionSetting } from "@/lib/site-settings";

export default function Home() {
  const [heroSlides, setHeroSlides] = useState<HeroSlideSetting[] | undefined>(undefined);
  const [homeSections, setHomeSections] = useState<HomeSectionSetting[] | undefined>(undefined);

  useEffect(() => {
    fetchPublicSiteSettings()
      .then((settings) => {
        if (Array.isArray(settings["hero.slides"])) setHeroSlides(settings["hero.slides"]);
        if (Array.isArray(settings["home.sections"])) setHomeSections(settings["home.sections"]);
      })
      .catch(() => {});
  }, []);

  const sectionMap = useMemo(
    () => ({
      whyUs: <WhyUsSection />,
      stats: <StatsSection />,
      universities: <UniversitiesSection />,
      programs: <ProgramsSection />,
      egyptBusiness: <EgyptBusinessSection />,
      howItWorks: <HowItWorksSection />,
      testimonials: <TestimonialsSection />,
      cta: <CtaSection />,
      faq: <FAQSection />,
    }),
    []
  );

  const orderedSections = useMemo(() => {
    if (!homeSections || homeSections.length === 0) {
      return [
        "whyUs",
        "stats",
        "universities",
        "programs",
        "egyptBusiness",
        "howItWorks",
        "testimonials",
        "cta",
        "faq",
      ];
    }

    return [...homeSections]
      .filter((section) => section.enabled !== false)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      .map((section) => section.id)
      .filter((id): id is keyof typeof sectionMap => id in sectionMap);
  }, [homeSections, sectionMap]);

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      <Navbar />
      <main className="pt-0 pb-16 md:pb-0">
        <HeroSection slidesOverride={heroSlides} />
        {orderedSections.map((id) => (
          <div key={id}>{sectionMap[id as keyof typeof sectionMap]}</div>
        ))}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
