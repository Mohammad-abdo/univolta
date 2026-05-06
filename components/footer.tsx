"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Phone, Mail, MapPin, Send, GraduationCap, Globe, MessageCircle } from "lucide-react";
import { figmaAssets } from "@/lib/figma-assets";
import { t, getLanguage, type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { fetchPublicSiteSettings, type FooterContentSetting } from "@/lib/site-settings";
import { getImageUrl } from "@/lib/image-utils";
import { CreditBar } from "@/components/credit-bar";
import { buildSocialLinkRows, footerSocialHoverClass } from "@/lib/social-links";

/** Normalize href for matching (pathname only, no trailing slash except root). */
function normalizeFooterHref(href: string): string {
  const raw = href.trim();
  if (!raw) return "/";
  try {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      const p = new URL(raw).pathname.replace(/\/$/, "") || "/";
      return p;
    }
  } catch {
    /* ignore */
  }
  const noHash = raw.split("#")[0] ?? raw;
  const noQuery = noHash.split("?")[0] ?? noHash;
  let path = noQuery.replace(/\/$/, "") || "/";
  if (!path.startsWith("/")) path = `/${path}`;
  return path;
}

/**
 * Footer quick links: CMS often stores English labels only — map known paths and
 * common English labels to i18n so AR/EN both work.
 */
function translateFooterQuickLinkLabel(href: string, cmsLabel: string, tl: (key: string) => string): string {
  const path = normalizeFooterHref(href);
  const label = cmsLabel.trim();
  const lower = label.toLowerCase();

  if (path === "/universities") {
    if (/\bprogram(s)?\b/i.test(label)) return tl("programs");
    if (/\bapply\b/i.test(label)) return tl("applyNow");
    return tl("universities");
  }

  const pathToKey: Record<string, string> = {
    "/": "home",
    "/about": "footerQuickAbout",
    "/contact": "contact",
    "/faq": "faq",
    "/terms": "termsAndConditions",
  };
  const byPath = pathToKey[path];
  if (byPath) return tl(byPath);

  const englishToKey: Record<string, string> = {
    home: "home",
    universities: "universities",
    university: "universities",
    programs: "programs",
    programme: "programs",
    "about us": "footerQuickAbout",
    about: "footerQuickAbout",
    "contact us": "contact",
    contact: "contact",
    faq: "faq",
    "terms & conditions": "termsAndConditions",
    "terms and conditions": "termsAndConditions",
    "terms & policy": "termsPolicy",
    terms: "termsAndConditions",
    "apply now": "applyNow",
  };
  if (englishToKey[lower]) return tl(englishToKey[lower]);

  return cmsLabel;
}

/** Default quick links when CMS does not override — all labels go through i18n. */
const DEFAULT_FOOTER_QUICK_LINKS: { href: string; labelKey: string }[] = [
  { href: "/", labelKey: "home" },
  { href: "/universities", labelKey: "universities" },
  { href: "/universities", labelKey: "programs" },
  { href: "/about", labelKey: "footerQuickAbout" },
  { href: "/contact", labelKey: "contact" },
  { href: "/faq", labelKey: "faq" },
  { href: "/terms", labelKey: "termsAndConditions" },
  { href: "/universities", labelKey: "applyNow" },
];

/**
 * Footer specialization shortcuts — `queryValue` is passed to `?specialization=` (matches program names, same as hero chips).
 */
const FOOTER_SPECIALIZATION_ITEMS: { labelKey: string; queryValue: string }[] = [
  { labelKey: "filterEngineering", queryValue: "Engineering" },
  { labelKey: "filterBusiness", queryValue: "Business" },
  { labelKey: "filterMedicine", queryValue: "Medicine" },
  { labelKey: "filterLaw", queryValue: "Law" },
  { labelKey: "filterComputerScience", queryValue: "Computer Science" },
  { labelKey: "filterArchitecture", queryValue: "Architecture" },
];

export function Footer() {
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [footerLogoUrl, setFooterLogoUrl] = useState<string>(figmaAssets.footerLogo);
  const [footerContent, setFooterContent] = useState<FooterContentSetting | null>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentLang(getLanguage());
    fetchPublicSiteSettings()
      .then((settings) => {
        if (settings["site.footerLogoUrl"]) setFooterLogoUrl(getImageUrl(settings["site.footerLogoUrl"]) || figmaAssets.footerLogo);
        if (settings["footer.content"]) setFooterContent(settings["footer.content"]);
      })
      .catch(() => {});
    const id = setInterval(() => setCurrentLang(getLanguage()), 300);
    return () => clearInterval(id);
  }, []);

  const isRTL = mounted && currentLang === "ar";
  const tl = (key: string) => t(key, currentLang);
  const footerTitle =
    isRTL ? footerContent?.titleAr?.trim() : footerContent?.titleEn?.trim();
  const footerAddress =
    (isRTL ? footerContent?.addressAr?.trim() : footerContent?.addressEn?.trim()) ||
    footerContent?.address?.trim();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const translatedDefaults = useMemo(
    () =>
      DEFAULT_FOOTER_QUICK_LINKS.map((d) => ({
        href: d.href,
        label: tl(d.labelKey),
      })),
    [currentLang]
  );

  /**
   * CMS quick links: translate labels by path / known English text.
   * Merge: show CMS order first, then append default entries whose path is missing.
   */
  const quickLinks = useMemo(() => {
    const fromCms = footerContent?.quickLinks;
    if (!fromCms?.length) return translatedDefaults;

    const merged = fromCms.map((l) => ({
      href: l.href,
      label: translateFooterQuickLinkLabel(l.href, l.label, tl),
    }));

    const seenPaths = new Set(fromCms.map((l) => normalizeFooterHref(l.href || "")));
    for (const d of translatedDefaults) {
      const p = normalizeFooterHref(d.href);
      if (p && !seenPaths.has(p)) {
        merged.push(d);
        seenPaths.add(p);
      }
    }
    return merged;
  }, [footerContent?.quickLinks, translatedDefaults, currentLang]);

  const footerSpecializations = useMemo(
    () =>
      FOOTER_SPECIALIZATION_ITEMS.map((item) => ({
        label: tl(item.labelKey),
        href: `/universities?specialization=${encodeURIComponent(item.queryValue)}`,
      })),
    [currentLang]
  );

  const socials = useMemo(
    () =>
      buildSocialLinkRows(footerContent?.socialLinks).map((row) => ({
        ...row,
        color: footerSocialHoverClass(row.label),
      })),
    [footerContent?.socialLinks]
  );

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
                <h3 className="font-montserrat-bold text-lg text-white">{tl("footerNewsletterTitle")}</h3>
              </div>
              <p className="font-montserrat-regular text-white/55 text-sm">{tl("footerNewsletterSubtitle")}</p>
            </div>
            <form
              onSubmit={handleSubscribe}
              className="flex gap-2 w-full md:w-auto"
            >
              <input
                type="email"
                suppressHydrationWarning
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tl("footerEmailPlaceholder")}
                className="flex-1 md:w-72 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-[#75d3f7] transition-colors"
              />
              <Button
                type="submit"
                suppressHydrationWarning
                className="bg-[#5260ce] hover:bg-[#4350b0] text-white px-5 rounded-xl text-sm font-montserrat-semibold shrink-0 transition-all"
              >
                {subscribed ? tl("footerSubscribedBtn") : <><Send className="w-4 h-4 mr-1 inline" />{tl("footerSubscribeBtn")}</>}
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
                src={footerLogoUrl}
                alt="UniVolta"
                fill
                className="object-contain brightness-0 invert"
                unoptimized
              />
            </div>
            {footerTitle ? (
              <h3 className="font-montserrat-bold text-base text-white">
                {footerTitle}
              </h3>
            ) : null}
            <p className="font-montserrat-regular text-white/55 text-sm leading-relaxed">
              {tl("footerDescription")}
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
              {tl("quickLinks")}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={`${normalizeFooterHref(link.href)}-${index}`}>
                  <Link href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Specializations (filtered universities list) */}
          <div className={isRTL ? "text-right" : ""}>
            <h4 className="font-montserrat-bold text-white mb-5 text-sm uppercase tracking-wider opacity-80">
              {tl("footerSpecializations")}
            </h4>
            <ul className="space-y-3">
              {footerSpecializations.map((row) => (
                <li key={row.href}>
                  <Link href={row.href} className="footer-link">
                    {row.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className={isRTL ? "text-right" : ""}>
            <h4 className="font-montserrat-bold text-white mb-5 text-sm uppercase tracking-wider opacity-80">
              {tl("contactInformation")}
            </h4>
            <div className="space-y-4">
              {[
                { Icon: Phone,  text: footerContent?.phone || "+00 000 000 00 67" },
                { Icon: Mail,   text: footerContent?.email || "info@univolta.com" },
                { Icon: Globe,  text: "www.univolta.com" },
                { Icon: MapPin, text: footerAddress || "Brooklyn, New York, USA" },
              ].map(({ Icon, text }) => (
                <div key={text} className={`flex items-start gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className="w-8 h-8 rounded-lg bg-[#5260ce]/40 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#75d3f7]" />
                  </div>
                  <p className={`text-white/55 text-sm leading-relaxed `} dir={ isRTL ? "ltr" : "ltr" }>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-white/10 py-5">
        <div className={`max-w-[1280px] mx-auto px-4 md:px-5 flex flex-col md:flex-row justify-between items-center gap-2 ${isRTL ? "md:flex-row-reverse" : ""}`}>
          <p className="text-white/40 text-xs font-montserrat-regular">
            {footerContent?.copyright || tl("allRightsReserved")}
          </p>
          <p className="text-white/40 text-xs font-montserrat-regular">
            {tl("poweredBy")}{" "}
            <span className="text-[#75d3f7] font-montserrat-bold">
              <Link href="https://www.qeematech.net/" target="_blank" rel="noopener noreferrer">Qeematech</Link>
            </span>
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
