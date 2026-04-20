"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Youtube,
  Twitter,
  Send,
  CheckCircle,
} from "lucide-react";
import { figmaAssets } from "@/lib/figma-assets";
import { showToast } from "@/lib/toast";
import { t } from "@/lib/i18n";
import { contactApi } from "@/lib/admin-api";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await contactApi.submit(formData);
      showToast.success(t("messageSentSuccess"));
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error: any) {
      showToast.error(error.message || t("errorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafe] pb-16 md:pb-0">
      <Navbar />

      <main className="pt-0 md:pt-[150px]">
        {/* Hero Section */}
        <section className="relative pb-16 md:pb-24">
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(105,171,233,0.2)] to-transparent pointer-events-none" />
          <div className="relative max-w-[1280px] mx-auto px-4 md:px-5">
            <ScrollReveal direction="fade">
              <div className="relative h-[220px] md:h-[360px] rounded-[20px] md:rounded-[32px] overflow-hidden shadow-[0px_24px_100px_rgba(82,96,206,0.2)] animate-hero-reveal">
                {/* Background image */}
                <Image src={figmaAssets.contactHeroBackground} alt="Graduates" fill className="object-cover scale-105" priority unoptimized />

                {/* Layered gradients for depth */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#121c67]/85 via-[#5260ce]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121c67]/60 via-transparent to-transparent" />

                {/* Decorative dots pattern overlay */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
                />

                {/* Animated orbs */}
                <div className="absolute top-6 right-1/4 w-32 h-32 rounded-full bg-[#75d3f7]/20 blur-2xl animate-float" />
                <div className="absolute bottom-6 right-12 w-24 h-24 rounded-full bg-[#5260ce]/30 blur-2xl" style={{ animation: "float-gentle 7s ease-in-out infinite 1s" }} />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 md:px-10 text-center">
                  <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 mb-4 animate-fade-up">
                    <span className="text-sm">📬</span>
                    <span className="text-white/90 text-xs font-montserrat-semibold tracking-wider uppercase">Get in Touch</span>
                  </div>
                  <h1 className="text-white text-2xl md:text-[44px] font-montserrat-bold leading-tight animate-fade-up-d100 drop-shadow-lg">
                    {t("reachOutToUs")}
                  </h1>
                  <p className="text-white/75 text-sm md:text-lg font-montserrat-regular mt-3 animate-fade-up-d200 max-w-md">
                    We&apos;re here to help with your academic journey
                  </p>
                  {/* Quick contact chips */}
                  <div className="flex gap-3 mt-5 animate-fade-up-d300">
                    {[
                      { icon: "📞", label: "+00 000 000 0067" },
                      { icon: "✉️", label: "info@univolta.com" },
                    ].map(({ icon, label }) => (
                      <div key={label} className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 text-white/90 text-xs font-montserrat-regular">
                        <span>{icon}</span>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Contact Section */}
        <section className="relative pb-16 md:pb-24">
          {/* Vertical Follow Us Bar */}
          <div className="absolute left-0 top-[140px] hidden xl:flex -translate-y-1/2 z-10">
            <div className="flex flex-col items-center gap-3 rounded-r-[12px] bg-white p-3 shadow-[0px_4px_20px_rgba(82,96,206,0.12)]">
              <div className="rotate-90 bg-[#75d3f7] px-2 py-0.5 rounded text-sm font-montserrat-regular text-[#5260ce] whitespace-nowrap">
                {t("followUs")}
              </div>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-[12px] bg-[#5260ce]/10 transition-transform hover:scale-105"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-[#5260ce]" />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-[12px] bg-[#5260ce]/10 transition-transform hover:scale-105"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5 text-[#5260ce]" />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-[12px] bg-[#5260ce]/10 transition-transform hover:scale-105"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-[#5260ce]" />
              </a>
            </div>
          </div>

          <div className="max-w-[1280px] mx-auto px-4 md:px-5">
            <ScrollReveal direction="up">
            <div className="relative rounded-[24px] border border-[#75d3f7] bg-[rgba(117,211,247,0.08)] px-6 py-10 md:px-10 lg:px-14">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] items-start">
                {/* Left Side - Contact Information */}
                <div className="space-y-10">
                  <div className="space-y-6 max-w-[520px]">
                    <div className="space-y-4">
                      <p className="text-[#5260ce] text-base font-montserrat-regular">
                        {t("contact")}
                      </p>
                      <h2 className="text-[#121c67] text-[34px] font-montserrat-bold leading-[1.4]">
                        {t("contactOurSupport")}
                      </h2>
                      <p className="text-[#7c7b7c] text-[18px] font-montserrat-regular leading-relaxed">
                        {t("contactDescription")}
                      </p>
                    </div>

                    <div className="space-y-5">
                      <ContactInfo
                        icon={Phone}
                        label={t("phone")}
                        value="+00 000 000 00 67"
                      />
                      <ContactInfo
                        icon={Mail}
                        label={t("email")}
                        value="info@univolta.com"
                      />
                      <ContactInfo
                        icon={MapPin}
                        label={t("office")}
                        value="Mert, Rainbow Center, Floor: 3, Office: 12B, Brooklyn, New York, USA, Spring St. No:5, 11215, USA"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Side - Contact Form */}
                <div className="relative rounded-[20px] bg-white p-6 md:p-8 shadow-[0px_20px_50px_rgba(82,96,206,0.10)] border border-gray-50">
                  <h3 className="font-montserrat-bold text-lg text-[#121c67] mb-5">Send us a message</h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        label={t("fullName")}
                        htmlFor="name"
                        placeholder={t("fullNamePlaceholder")}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                      <FormField
                        label={t("email")}
                        htmlFor="email"
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <FormField
                      label={t("message")}
                      htmlFor="message"
                      placeholder={t("messagePlaceholder")}
                      as="textarea"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-12 w-full rounded-xl bg-[#5260ce] text-base font-montserrat-semibold text-white hover:bg-[#4350b0] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(82,96,206,0.25)] hover:shadow-[0_6px_24px_rgba(82,96,206,0.35)] transition-all"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          {t("sending")}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          {t("sendMessage")}
                        </span>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Start Your University Journey Section */}
        <section className="pb-16 md:pb-24">
          <div className="relative mx-auto max-w-[1280px] px-4 md:px-5">
            <ScrollReveal direction="up">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#5260ce] to-[#75d3f7] text-white">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
              <div className="relative grid gap-12 lg:grid-cols-2 items-center px-6 py-16 md:px-10">
                <div className="space-y-6">
                  <h2 className="text-[34px] font-montserrat-bold">
                    {t("startUniversityJourney")}
                  </h2>
                  <p className="max-w-[451px] text-lg font-montserrat-light text-white/90 leading-relaxed">
                    {t("startJourneyDescription")}
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="rounded-xl bg-white px-8 text-base font-montserrat-semibold text-[#5260ce] hover:bg-gray-100"
                  >
                    <Link href="/universities">{t("browseUniversitiesButton")}</Link>
                  </Button>
                </div>
                <div className="relative hidden lg:block h-[420px] w-full">
                  <Image
                    src={figmaAssets.faqCtaIllustration}
                    alt="Students exploring universities"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

interface FormFieldProps {
  label: string;
  htmlFor: string;
  placeholder: string;
  type?: string;
  as?: "input" | "textarea";
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
}

function FormField({
  label,
  htmlFor,
  placeholder,
  type = "text",
  as = "input",
  value,
  onChange,
  required = false,
}: FormFieldProps) {
  const sharedClasses =
    "w-full rounded-lg border border-[rgba(117,211,247,0.4)] bg-white px-3 py-2 text-[16px] font-montserrat-regular text-[#121c67] placeholder:text-[#b1b2bf] focus:outline-none focus:ring-2 focus:ring-[#5260ce]/40";

  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-2">
      <span className="text-[16px] font-montserrat-regular text-[#121c67]">{label}</span>
      {as === "textarea" ? (
        <textarea
          id={htmlFor}
          name={htmlFor}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`${sharedClasses} h-[153px] resize-none`}
        />
      ) : (
        <input
          id={htmlFor}
          name={htmlFor}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={sharedClasses}
        />
      )}
    </label>
  );
}

interface ContactInfoProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function ContactInfo({ icon: Icon, label, value }: ContactInfoProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="relative h-12 w-12 rounded-full bg-[#75d3f7] shadow-[0px_8px_24px_rgba(82,96,206,0.15)] flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-[#5260ce]" />
      </div>
      <div className="flex flex-col font-montserrat-regular text-[#121c67] text-base leading-[1.4]">
        <span className="font-montserrat-semibold text-[#5260ce]">{label}</span>
        <span className="text-[#121c67]">{value}</span>
      </div>
    </div>
  );
}
