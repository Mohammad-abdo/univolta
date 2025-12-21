import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { WhyUsSection } from "@/components/why-us-section";
import { UniversitiesSection } from "@/components/universities-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { FAQSection } from "@/components/faq-section";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export default function Home() {
  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      <Navbar />
      <main className="pt-0 pb-16 md:pb-0">
        <HeroSection />
        <WhyUsSection />
        <UniversitiesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
