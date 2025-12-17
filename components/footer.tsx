"use client";

import Image from "next/image";
import Link from "next/link";
import { figmaAssets } from "@/lib/figma-assets";
import { Phone, Mail, MapPin, Facebook, Youtube, Twitter, Instagram, MessageCircle } from "lucide-react";
import { t, getLanguage, type Language } from "@/lib/i18n";
import { useState, useEffect } from "react";

export function Footer() {
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage());
  const isRTL = currentLang === "ar";

  useEffect(() => {
    const interval = setInterval(() => {
      const lang = getLanguage();
      if (lang !== currentLang) {
        setCurrentLang(lang);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [currentLang]);

  const footerLinks = {
    quickLinks: [
      { name: t("home"), href: "/" },
      { name: t("universities"), href: "/universities" },
      { name: t("faq"), href: "/faq" },
      { name: t("contact"), href: "/contact" },
      { name: t("termsPolicy"), href: "/terms" },
    ],
  };

  return (
    <footer className="bg-gradient-to-b from-[rgba(117,211,247,0.2)] to-white pt-8 md:pt-20 pb-20 md:pb-6">
      <div className="max-w-[1280px] mx-auto px-4 md:px-5">
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12 ${isRTL ? "text-right" : "text-left"}`}>
          {/* Logo & Description */}
          <div className="space-y-4 md:space-y-5">
            <div className="relative w-[80px] h-[60px] md:w-[109px] md:h-[81px]">
              <Image
                src={figmaAssets.footerLogo}
                alt="UniVolta"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <p className="text-xs md:text-base font-montserrat-regular text-[#8b8c9a] leading-relaxed max-w-full md:max-w-md">
              {t("footerDescription")}
            </p>
            
            {/* Social Media */}
            <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 ${isRTL ? "sm:flex-row-reverse" : ""}`}>
              <div className="bg-[#75d3f7] px-2.5 py-1 rounded text-white font-montserrat-light text-xs md:text-base">
                {t("followUs")}
              </div>
              <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                <a href="#" className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-[#5260ce] hover:text-[#4350b0] transition-colors" aria-label="Instagram">
                  <Instagram className="w-full h-full" />
                </a>
                <a href="#" className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-[#5260ce] hover:text-[#4350b0] transition-colors" aria-label="Facebook">
                  <Facebook className="w-full h-full" />
                </a>
                <a href="#" className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center bg-[#5260ce] rounded p-1 md:p-1.5 text-white hover:bg-[#4350b0] transition-colors" aria-label="YouTube">
                  <Youtube className="w-full h-full" />
                </a>
                <a href="#" className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center bg-[#5260ce] rounded p-1 md:p-1.5 text-white hover:bg-[#4350b0] transition-colors" aria-label="Twitter">
                  <Twitter className="w-full h-full" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base md:text-xl font-montserrat-bold text-[#2e2e2e] mb-3 md:mb-6">{t("quickLinks")}</h4>
            <ul className="space-y-2 md:space-y-5">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-xs md:text-base font-montserrat-regular text-[#8b8c9a] hover:text-[#121c67] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-base md:text-xl font-montserrat-bold text-[#2e2e2e] mb-3 md:mb-6">{t("contactInformation")}</h4>
            <div className="space-y-2.5 md:space-y-4">
              <div className={`flex items-center gap-2 md:gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                <div className="bg-[#5260ce] p-1.5 md:p-2 rounded-full shrink-0">
                  <Phone className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <p className="text-xs md:text-base font-montserrat-regular text-[#8b8c9a]">+00 000 000 00 67</p>
              </div>
              <div className={`flex items-center gap-2 md:gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                <div className="bg-[#5260ce] p-1.5 md:p-2 rounded-full shrink-0">
                  <Mail className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <p className="text-xs md:text-base font-montserrat-regular text-[#8b8c9a] break-all">info@univolta.com</p>
              </div>
              <div className={`flex items-start gap-2 md:gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                <div className="bg-[#5260ce] p-1.5 md:p-2 rounded-full flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <p className="text-xs md:text-base font-montserrat-regular text-[#8b8c9a] leading-relaxed">
                  Mert, Rainbow Center, Floor: 3, Office: 12B, Brooklyn, New York, USA, Spring St. No:5, 11215, USA
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-4 md:pt-8 flex flex-col md:flex-row justify-center items-center gap-2 md:gap-2">
          <p className="text-xs md:text-sm font-montserrat-regular text-[#65666f] text-center">
            {t("poweredBy")} <span className="font-montserrat-bold text-[#5260ce]">Eta tech</span>
          </p>
          <div className="hidden md:block w-0.5 h-3.5 bg-gray-300"></div>
          <p className="text-xs md:text-sm font-montserrat-regular text-[#65666f] text-center">
            {t("allRightsReserved")}
          </p>
        </div>
      </div>

      {/* WhatsApp Float Button - Hidden on mobile (bottom nav handles navigation) */}
      <div className="hidden md:block fixed bottom-8 right-8 z-50">
        <a
          href="https://wa.me/1234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label="Contact us on WhatsApp"
        >
          <MessageCircle className="w-8 h-8 text-white" />
        </a>
      </div>
    </footer>
  );
}
