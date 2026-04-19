"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Facebook, Youtube, Twitter, Instagram, MessageCircle, Send, GraduationCap, Globe } from "lucide-react";
import { figmaAssets } from "@/lib/figma-assets";
import { t, getLanguage, type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function Footer() {
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage());
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const isRTL = currentLang === "ar";

  useEffect(() => {
    const interval = setInterval(() => {
      const lang = getLanguage();
      if (lang !== currentLang) setCurrentLang(lang);
    }, 100);
    return () => clearInterval(interval);
  }, [currentLang]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const quickLinks = [
    { name: t("home"), href: "/" },
    { name: t("universities"), href: "/universities" },
    { name: t("faq"), href: "/faq" },
    { name: t("contact"), href: "/contact" },
    { name: t("termsPolicy"), href: "/terms" },
  ];

  const programs = ["Engineering", "Business", "Medicine", "Law", "Computer Science", "Architecture"];

  const socials = [
    { Icon: Instagram, href: "#", label: "Instagram", color: "hover:bg-gradient-to-br hover:from-[#833ab4] hover:via-[#fd1d1d] hover:to-[#fcb045]" },
    { Icon: Facebook,  href: "#", label: "Facebook",  color: "hover:bg-[#1877F2]" },
    { Icon: Youtube,   href: "#", label: "YouTube",   color: "hover:bg-[#FF0000]" },
    { Icon: Twitter,   href: "#", label: "Twitter",   color: "hover:bg-[#1DA1F2]" },
  ];

  return (
    <footer className="relative bg-[#0d1550] text-white overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Decorative background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(82,96,206,0.18) 0%, transparent 65%)" }} />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(117,211,247,0.1) 0%, transparent 65%)" }} />
      </div>

      {/* Gradient accent line */}
      <div className="h-1 bg-gradient-to-r from-[#5260ce] via-[#75d3f7] to-[#5260ce]" />

      {/* Newsletter Section */}
      <div className="relative border-b border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-5 py-8 md:py-10">
          <div className={`flex flex-col md:flex-row items-center justify-between gap-6 ${isRTL ? "md:flex-row-reverse" : ""}`}>
            <div className={isRTL ? "text-right" : ""}>
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-5 h-5 text-[#75d3f7]" />
                <h3 className="font-montserrat-bold text-lg text-white">Stay in the Loop</h3>
              </div>
              <p className="font-montserrat-regular text-white/55 text-sm">Get the latest university news and scholarship opportunities</p>
            </div>
            <form
              onSubmit={handleSubscribe}
              className="flex gap-2 w-full md:w-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 md:w-72 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-[#75d3f7] transition-colors"
              />
              <Button
                type="submit"
                className="bg-[#5260ce] hover:bg-[#4350b0] text-white px-5 rounded-xl text-sm font-montserrat-semibold shrink-0 transition-all"
              >
                {subscribed ? "✓ Subscribed!" : <><Send className="w-4 h-4 mr-1 inline" />Subscribe</>}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="relative max-w-[1280px] mx-auto px-4 md:px-5 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">

          {/* Column 1: Logo + Description + Social */}
          <div className={`col-span-2 md:col-span-1 space-y-5 ${isRTL ? "text-right" : ""}`}>
            <div className="relative w-[90px] h-[55px]">
              <Image
                src={figmaAssets.footerLogo}
                alt="UniVolta"
                fill
                className="object-contain brightness-0 invert"
                unoptimized
              />
            </div>
            <p className="font-montserrat-regular text-white/55 text-sm leading-relaxed">
              {t("footerDescription")}
            </p>

            {/* Social icons */}
            <div className="flex gap-2.5">
              {socials.map(({ Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`w-9 h-9 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 ${color}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className={isRTL ? "text-right" : ""}>
            <h4 className="font-montserrat-bold text-white mb-5 text-sm uppercase tracking-wider opacity-80">
              {t("quickLinks")}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="footer-link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Programs */}
          <div className={isRTL ? "text-right" : ""}>
            <h4 className="font-montserrat-bold text-white mb-5 text-sm uppercase tracking-wider opacity-80">
              Programs
            </h4>
            <ul className="space-y-3">
              {programs.map((p) => (
                <li key={p}>
                  <Link href="/universities" className="footer-link">
                    {p}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className={isRTL ? "text-right" : ""}>
            <h4 className="font-montserrat-bold text-white mb-5 text-sm uppercase tracking-wider opacity-80">
              {t("contactInformation")}
            </h4>
            <div className="space-y-4">
              {[
                { Icon: Phone,  text: "+00 000 000 00 67" },
                { Icon: Mail,   text: "info@univolta.com" },
                { Icon: Globe,  text: "www.univolta.com" },
                { Icon: MapPin, text: "Brooklyn, New York, USA" },
              ].map(({ Icon, text }) => (
                <div key={text} className={`flex items-start gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className="w-8 h-8 rounded-lg bg-[#5260ce]/40 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#75d3f7]" />
                  </div>
                  <p className="text-white/55 text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-white/10 py-5">
        <div className={`max-w-[1280px] mx-auto px-4 md:px-5 flex flex-col md:flex-row justify-between items-center gap-2 ${isRTL ? "md:flex-row-reverse" : ""}`}>
          <p className="text-white/40 text-xs font-montserrat-regular">{t("allRightsReserved")}</p>
          <p className="text-white/40 text-xs font-montserrat-regular">
            {t("poweredBy")}{" "}
            <span className="text-[#75d3f7] font-montserrat-bold">Qeematech</span>
          </p>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <div className="hidden md:block fixed bottom-8 right-8 z-50">
        <a
          href="https://wa.me/1234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="group w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform"
          aria-label="Contact us on WhatsApp"
        >
          <MessageCircle className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
        </a>
      </div>
    </footer>
  );
}
