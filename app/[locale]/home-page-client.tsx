"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { WhyUsSection } from "@/components/why-us-section";
import { StatsSection } from "@/components/stats-section";
import { UniversitiesSection } from "@/components/universities-section";
import { ServicesSection } from "@/components/services-section";
import { HomeVideoSection } from "@/components/home-video-section";
import { EgyptBusinessSection } from "@/components/egypt-business-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { CtaSection } from "@/components/cta-section";
import { FAQSection } from "@/components/faq-section";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import {
  fetchPublicSiteSettings,
  type HeroSlideSetting,
  type HomeSectionSetting,
  type HomeVideoSetting,
} from "@/lib/site-settings";

export function HomePageClient() {
  const [heroSlides, setHeroSlides] = useState<HeroSlideSetting[] | undefined>(undefined);
  const [homeSections, setHomeSections] = useState<HomeSectionSetting[] | undefined>(undefined);
  const [homeVideo, setHomeVideo] = useState<HomeVideoSetting | undefined>(undefined);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    fetchPublicSiteSettings()
      .then((settings) => {
        if (Array.isArray(settings["hero.slides"])) {
          const validSlides = settings["hero.slides"].filter(
            (slide) => !!slide?.image && String(slide.image).trim().length > 0
          );
          if (validSlides.length > 0) setHeroSlides(validSlides);
        }
        if (Array.isArray(settings["home.sections"])) setHomeSections(settings["home.sections"]);
        if (settings["home.video"]) setHomeVideo(settings["home.video"]);
      })
      .catch(() => {})
      .finally(() => setHeroReady(true));
  }, []);

  const sectionMap = useMemo(
    () => ({
      video: <HomeVideoSection video={homeVideo} />,
      whyUs: <WhyUsSection />,
      stats: <StatsSection />,
      universities: <UniversitiesSection />,
      programs: <ServicesSection />,
      services: <ServicesSection />,
      egyptBusiness: <EgyptBusinessSection />,
      howItWorks: <HowItWorksSection />,
      testimonials: <TestimonialsSection />,
      cta: <CtaSection />,
      faq: <FAQSection />,
    }),
    [homeVideo]
  );

  const orderedSections = useMemo(() => {
    if (!homeSections || homeSections.length === 0) {
      return [
        "video",
        "whyUs",
        "stats",
        "universities",
        "services",
        "egyptBusiness",
        "howItWorks",
        "testimonials",
        "cta",
        "faq",
      ];
    }

    const ids = [...homeSections]
      .filter((section) => section.enabled !== false)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      .map((section) => section.id)
      .filter((id): id is keyof typeof sectionMap => id in sectionMap);
    // If the admin configured sections but forgot to add "video", keep it visible by default.
    if (!ids.includes("video" as any)) ids.unshift("video" as any);
    return ids;
  }, [homeSections, sectionMap]);

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      <Navbar />
      <main className="pt-0 pb-16 md:pb-0">
        <HeroSection slidesOverride={heroSlides} ready={heroReady} />
        {orderedSections.map((id) => (
          <div key={id}>{sectionMap[id as keyof typeof sectionMap]}</div>
        ))}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
