"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, GraduationCap, HelpCircle, Mail } from "lucide-react";
import { t, getLanguage, type Language } from "@/lib/i18n";
import { LocaleLink } from "@/components/locale-link";
import { pathnameWithoutLocalePrefix } from "@/lib/locale-path";

export function MobileBottomNav() {
  const pathname = usePathname();
  const pathSansLocale = pathnameWithoutLocalePrefix(pathname ?? "/");
  const normalizedPathname = pathSansLocale;
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage());
  const isRTL = currentLang === "ar";

  useEffect(() => {
    const interval = setInterval(() => {
      const lang = getLanguage();
      if (lang !== currentLang) setCurrentLang(lang);
    }, 200);
    return () => clearInterval(interval);
  }, [currentLang]);

  // Don't show on dashboard or auth pages
  if (
    pathname?.startsWith("/dashboard") ||
    pathSansLocale.startsWith("/login") ||
    pathSansLocale.startsWith("/signup") ||
    pathSansLocale.startsWith("/forgot-password") ||
    pathSansLocale.startsWith("/reset-password")
  ) {
    return null;
  }

  const navItems = [
    { href: "/",             label: t("home"),         icon: Home },
    { href: "/universities", label: t("universities"),  icon: GraduationCap },
    { href: "/faq",          label: t("mobileNavFaqShort"), icon: HelpCircle },
    { href: "/contact",      label: t("contact"),       icon: Mail },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_24px_rgba(82,96,206,0.10)] md:hidden">
      <div className={`flex items-center justify-around h-[62px] px-2 ${isRTL ? "flex-row-reverse" : ""}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = normalizedPathname === item.href;
          return (
            <LocaleLink
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-200 ${
                isActive ? "text-[#5260ce]" : "text-gray-400 hover:text-[#5260ce]"
              }`}
            >
              {isActive && (
                <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#5260ce]" />
              )}
              <div className={`transition-all duration-200 ${isActive ? "scale-110 -translate-y-0.5" : ""}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-center whitespace-nowrap text-[10px] font-montserrat-${isActive ? "semibold" : "regular"}`}
              >
                {item.label}
              </span>
            </LocaleLink>
          );
        })}
      </div>
    </nav>
  );
}


