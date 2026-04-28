"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, User, LogOut, Home, GraduationCap, HelpCircle, Mail, FileText, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { figmaAssets } from "@/lib/figma-assets";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  getLanguage,
  setLanguage,
  languages,
  type Language,
  t,
} from "@/lib/i18n";
import { API_BASE_URL } from "@/lib/constants";
import { AlertNotification } from "@/components/alerts/alert-notification";
import { fetchPublicSiteSettings } from "@/lib/site-settings";
import { getImageUrl } from "@/lib/image-utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [siteLogoUrl, setSiteLogoUrl] = useState<string>(figmaAssets.logo);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setCurrentLang(getLanguage());
    checkAuth();
    fetchPublicSiteSettings()
      .then((settings) => {
        if (settings["site.logoUrl"]) setSiteLogoUrl(getImageUrl(settings["site.logoUrl"]) || figmaAssets.logo);
      })
      .catch(() => {});

    const onScroll = () => setScrolled(window.scrollY > 50);
    const refreshLanguage = () => setCurrentLang(getLanguage());
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshLanguage();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("focus", refreshLanguage);
    window.addEventListener("storage", refreshLanguage);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("focus", refreshLanguage);
      window.removeEventListener("storage", refreshLanguage);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setIsAuthenticated(true);
          setUserName(userData.name || userData.email);
        } else if (response.status === 401) {
          // Token is invalid, clear it
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setIsAuthenticated(false);
          setUserName(null);
        }
      }
    } catch (error) {
      // Silently handle errors - user might not be logged in
      setIsAuthenticated(false);
      setUserName(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    setUserName(null);
    router.push("/");
    window.location.reload();
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLangMenuOpen(false);
  };

  // Safe: returns English until mounted so server HTML == first client render
  const tl = (key: string, fallback: string) => (mounted ? t(key) : fallback);
  const isRTL = mounted && currentLang === "ar";
  const currentLanguageMeta =
    languages.find((lang) => lang.code === currentLang) || languages[0];
  const getFlagIconUrl = (langCode: Language) =>
    langCode === "ar"
      ? "https://flagcdn.com/w40/sa.png"
      : "https://flagcdn.com/w40/gb.png";

  const navItems = [
    { href: "/", label: tl("home", "Home"), active: pathname === "/" },
    { href: "/universities", label: tl("universities", "Universities"), active: pathname === "/universities" },
  
    { href: "/about", label: tl("aboutNavLink", "About"), active: pathname === "/about" },
    { href: "/faq", label: tl("faq", "FAQ"), active: pathname === "/faq" },
    { href: "/contact", label: tl("contact", "Contact"), active: pathname === "/contact" },
    { href: "/terms", label: tl("termsPolicy", "Terms & Policy"), active: pathname === "/terms" },
  ];


  const navItemConfig = {
    "/": { width: "w-[65px]", ml: "ml-[32.5px]", height: "h-[70px]" },
    "/universities": {
      width: "w-[109px]",
      ml: "ml-[54px]",
      height: "h-[70px]",
    },
    "/faq": { width: "w-[50px]", ml: "ml-[25px]", height: "h-[70px]" },
    "/contact": { width: "w-[100px]", ml: "ml-[50.5px]", height: "h-[70px]" },
  };

  return (
    <>
      {/* Mobile Header - Only visible on mobile/tablet */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="h-14 px-3 flex items-center justify-between">

          {/* Left — hamburger */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
            className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-11 min-w-11 flex items-center justify-center"
            aria-label="Toggle menu"
            type="button"
          >
            <Menu size={22} className="text-[#121c67]" />
          </button>

          {/* Center — Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <div className="relative h-8 w-24">
              <Image src={siteLogoUrl} alt="UniVolta" fill className="object-contain object-center" unoptimized priority />
            </div>
          </Link>

          {/* Right — user or login */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1">
              <AlertNotification className="lg:hidden" />
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors min-h-11 min-w-11 flex items-center justify-center"
                aria-label={tl("logout", "Logout")}
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Button
              className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-xs h-9 px-4 rounded-xl shadow-[0_4px_14px_rgba(82,96,206,0.3)]"
              asChild
            >
              <Link href="/login">{mounted ? t("login") : "Login"}</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Spacer for mobile content - pushes content below fixed header */}
      <div className="lg:hidden h-14" aria-hidden="true" />

      {/* ── Rainbow accent bar fixed at the very top (desktop only) ── */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-[60] nav-top-bar h-[3px]" />

      <nav className={`hidden lg:block fixed left-1/2 -translate-x-1/2 z-50 w-full max-w-[1440px] px-5 transition-[top] duration-500 ${scrolled ? "top-[8px]" : "top-[28px]"}`}>
      <div className={`animate-nav-enter rounded-[22px] h-[70px] flex items-center justify-between px-6 relative transition-[background-color,box-shadow,border-color] duration-500 ${
        scrolled
          ? "bg-white/92 backdrop-blur-2xl shadow-[0_8px_48px_rgba(82,96,206,0.22)] ring-1 ring-[#5260ce]/12"
          : "bg-white shadow-[0px_4px_40px_0px_rgba(82,96,206,0.10)]"
      }`}>

        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 group">
          <div className="relative w-[50px] h-[30px] md:w-[78px] md:h-[48px] transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_2px_8px_rgba(82,96,206,0.3)]">
            <Image src={siteLogoUrl} alt="UniVolta Logo" fill className="object-contain" unoptimized priority />
          </div>
        </Link>

        {/* Desktop Menu - Centered */}
        <div className={`hidden lg:flex items-center justify-center gap-1 flex-1 absolute ${isRTL ? "right-1/2 translate-x-1/2" : "left-1/2 -translate-x-1/2"}`}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-4 py-2 rounded-xl font-montserrat-${item.active ? "bold" : "regular"} text-[15px] leading-none transition-all duration-200 group ${
                item.active
                  ? "text-[#5260ce] bg-[rgba(82,96,206,0.08)]"
                  : "text-[#2e2e2e] hover:text-[#5260ce] hover:bg-[rgba(82,96,206,0.06)]"
              }`}
            >
              {item.label}
              {item.active && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-[#5260ce]" />
              )}
            </Link>
          ))}
        </div>

        {/* Right Side */}
          <div className={`hidden lg:flex items-center gap-4 shrink-0 ${isRTL ? "mr-auto" : "ml-auto"}`}>
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[#65666f] font-montserrat-regular text-sm hover:text-[#5260ce] hover:bg-[rgba(82,96,206,0.06)] transition-all"
            >
              <img
                src={getFlagIconUrl(currentLanguageMeta.code)}
                alt={`${currentLanguageMeta.name} flag`}
                className="w-[18px] h-[12px] rounded-[2px] object-cover shrink-0"
                loading="eager"
                referrerPolicy="no-referrer"
              />
              <span className="font-montserrat-semibold">{currentLang.toUpperCase()}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${langMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {langMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} />
                <div className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-44 bg-white rounded-2xl shadow-[0_8px_32px_rgba(82,96,206,0.15)] border border-gray-100 z-50 overflow-hidden`}>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                        currentLang === lang.code
                          ? "bg-[rgba(82,96,206,0.08)] text-[#5260ce] font-montserrat-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <img
                        src={getFlagIconUrl(lang.code)}
                        alt={`${lang.name} flag`}
                        className="w-[20px] h-[14px] rounded-[2px] object-cover shrink-0"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-sm font-montserrat-regular">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Separator */}
          <div className="w-px h-5 bg-gray-200" />

          {/* User / Auth */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#2e2e2e] font-montserrat-regular text-sm hover:text-[#5260ce] hover:bg-[rgba(82,96,206,0.06)] transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5260ce] to-[#75d3f7] flex items-center justify-center text-white text-xs font-montserrat-bold shrink-0">
                  {userName?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="max-w-[100px] truncate">{userName}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-[0_8px_32px_rgba(82,96,206,0.15)] border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-[#f9fafe]">
                    <p className="text-xs text-[#8b8c9a] font-montserrat-regular">Signed in as</p>
                    <p className="text-sm font-montserrat-semibold text-[#121c67] truncate">{userName}</p>
                  </div>
                  <Link href="/my-applications" className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm text-[#2e2e2e] transition-colors" onClick={() => setUserMenuOpen(false)}>
                    {tl("myApplications", "My Applications")}
                  </Link>
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm text-[#2e2e2e] transition-colors" onClick={() => setUserMenuOpen(false)}>
                    <User className="w-4 h-4 text-[#5260ce]" />
                    {tl("myDashboard", "My Dashboard")}
                  </Link>
                  <div className="border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2 text-red-600 text-sm transition-colors">
                      <LogOut className="w-4 h-4" />
                      {tl("logout", "Logout")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                className="nav-cta-shine text-white font-montserrat-semibold text-sm h-[40px] px-5 rounded-xl relative overflow-hidden shadow-[0_4px_14px_rgba(82,96,206,0.35)] hover:shadow-[0_6px_20px_rgba(82,96,206,0.5)] hover:-translate-y-0.5 transition-all duration-200"
                asChild
              >
                <Link href="/login">{mounted ? t("login") : "Login"}</Link>
              </Button>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer panel */}
          <div
            className={`fixed top-0 ${isRTL ? "right-0" : "left-0"} w-[82vw] max-w-[320px] h-full bg-white shadow-2xl z-[70] lg:hidden flex flex-col overflow-hidden`}
            style={{ animation: "slideInDrawer 0.25s cubic-bezier(0.4,0,0.2,1)" }}
          >

            {/* ── Drawer header: logo + close ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#f6f8ff] to-white shrink-0">
              <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center">
                <div className="relative h-8 w-28">
                  <Image src={siteLogoUrl} alt="UniVolta" fill className="object-contain object-left" unoptimized priority />
                </div>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
                aria-label="Close menu"
              >
                <X size={20} className="text-[#121c67]" />
              </button>
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">

              {/* Nav items with icons */}
              {[
                { href: "/",             label: tl("home", "Home"),                  Icon: Home },
                { href: "/universities", label: tl("universities", "Universities"),   Icon: GraduationCap },
                { href: "/about",        label: tl("aboutNavLink", "About"),          Icon: Info },
                { href: "/faq",          label: tl("faq", "FAQ"),                    Icon: HelpCircle },
                { href: "/contact",      label: tl("contact", "Contact"),             Icon: Mail },
                { href: "/terms",        label: tl("termsPolicy", "Terms & Policy"),  Icon: FileText },
              ].map(({ href, label, Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 py-3 px-4 rounded-2xl transition-all ${
                      active
                        ? "bg-[rgba(82,96,206,0.1)] text-[#5260ce] font-montserrat-bold"
                        : "text-[#2e2e2e] font-montserrat-regular hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? "bg-[rgba(82,96,206,0.15)]" : "bg-gray-100"}`}>
                      <Icon className={`w-[18px] h-[18px] ${active ? "text-[#5260ce]" : "text-[#65666f]"}`} />
                    </span>
                    <span className="text-[15px] leading-tight">{label}</span>
                    {active && <span className="ms-auto w-1.5 h-1.5 rounded-full bg-[#5260ce]" />}
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="pt-4 pb-2">
                <div className="border-t border-gray-100" />
              </div>

              {/* Language toggle */}
              <div className="px-1">
                <p className="text-[11px] font-montserrat-semibold text-gray-400 mb-3 uppercase tracking-wider px-3">
                  {tl("language", "Language")}
                </p>
                <div className="flex gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { handleLanguageChange(lang.code); setIsOpen(false); }}
                      className={`flex flex-1 items-center justify-center gap-2 py-2.5 rounded-2xl border-2 text-sm font-montserrat-semibold transition-all ${
                        currentLang === lang.code
                          ? "bg-[#5260ce] text-white border-[#5260ce] shadow-md"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#5260ce]"
                      }`}
                    >
                      <img
                        src={getFlagIconUrl(lang.code)}
                        alt={lang.name}
                        className="w-5 h-3.5 rounded-sm object-cover shrink-0"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="pt-4 pb-2">
                <div className="border-t border-gray-100" />
              </div>

              {/* Account section */}
              {isAuthenticated ? (
                <div className="space-y-1 px-1">
                  <p className="text-[11px] font-montserrat-semibold text-gray-400 mb-3 uppercase tracking-wider px-3">
                    {tl("account", "Account")}
                  </p>
                  {/* User badge */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#f6f8ff] rounded-2xl mb-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5260ce] to-[#75d3f7] flex items-center justify-center text-white text-sm font-montserrat-bold shrink-0">
                      {userName?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-montserrat-semibold text-[#121c67] truncate">{userName}</p>
                      <p className="text-xs text-gray-400">Signed in</p>
                    </div>
                  </div>
                  <Link
                    href="/my-applications"
                    className="flex items-center gap-3 py-3 px-4 rounded-2xl text-[#2e2e2e] font-montserrat-regular hover:bg-gray-50 active:bg-gray-100 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                      <FileText className="w-[18px] h-[18px] text-[#5260ce]" />
                    </span>
                    <span className="text-[15px]">{tl("myApplications", "My Applications")}</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 py-3 px-4 rounded-2xl text-[#2e2e2e] font-montserrat-regular hover:bg-gray-50 active:bg-gray-100 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                      <User className="w-[18px] h-[18px] text-[#5260ce]" />
                    </span>
                    <span className="text-[15px]">{tl("profile", "Profile")}</span>
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 py-3 px-4 rounded-2xl text-red-600 font-montserrat-regular hover:bg-red-50 active:bg-red-100 transition-all"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50">
                      <LogOut className="w-[18px] h-[18px] text-red-500" />
                    </span>
                    <span className="text-[15px]">{tl("logout", "Logout")}</span>
                  </button>
                </div>
              ) : (
                <div className="px-1 pt-1">
                  <Button
                    className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white text-base h-12 font-montserrat-semibold rounded-2xl shadow-[0_4px_16px_rgba(82,96,206,0.3)] active:scale-[0.98] transition-all"
                    asChild
                  >
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <User className="w-4 h-4 mr-2" />
                      {mounted ? t("login") : "Login"}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <style>{`
            @keyframes slideInDrawer {
              from { transform: translateX(${isRTL ? "100%" : "-100%"}); }
              to   { transform: translateX(0); }
            }
          `}</style>
        </>
      )}
    </nav>
    </>
  );
}
