"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, User, LogOut, Globe } from "lucide-react";
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

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setCurrentLang(getLanguage());
    checkAuth();

    const interval = setInterval(() => {
      const lang = getLanguage();
      setCurrentLang(lang);
    }, 100);

    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", onScroll);
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

  const navItems = [
    { href: "/", label: t("home"), active: pathname === "/" },
    {
      href: "/universities",
      label: t("universities"),
      active: pathname === "/universities",
    },
    { href: "/faq", label: t("faq"), active: pathname === "/faq" },
    { href: "/contact", label: t("contact"), active: pathname === "/contact" },
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
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="h-14 px-4 flex items-center justify-between">
          {/* Left side - Notification icon and Menu button */}
          <div className="flex items-center gap-3 relative z-10">
            {isAuthenticated && (
              <div className="relative z-10">
                <AlertNotification className="md:hidden" />
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative z-10"
              aria-label="Toggle menu"
              type="button"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Right side - Username and Logout (when logged in) */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#5260ce] flex-shrink-0" />
                <span className="font-montserrat-medium text-xs sm:text-sm text-[#2e2e2e] max-w-[100px] sm:max-w-[150px] truncate">
                  {userName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                aria-label={t("logout")}
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span className="font-montserrat-medium text-xs hidden sm:inline">
                  {t("logout")}
                </span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-montserrat-medium text-[#5260ce] hover:text-[#4350b0] transition-colors"
              >
                {mounted ? t("login") : "Login"}
              </Link>
              <Button
                className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-xs h-8 px-2 sm:px-3 rounded-lg"
                asChild
              >
                <Link href="/signup">
                  {mounted ? t("signUp") : "Sign Up"}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Spacer for mobile content - pushes content below fixed header */}
      <div className="md:hidden h-14" aria-hidden="true" />

      {/* ── Rainbow accent bar fixed at the very top (desktop only) ── */}
      <div className="hidden md:block fixed top-0 left-0 right-0 z-[60] nav-top-bar h-[3px]" />

      <nav className={`hidden md:block fixed left-1/2 -translate-x-1/2 z-50 w-full max-w-[1440px] px-5 transition-[top] duration-500 ${scrolled ? "top-[8px]" : "top-[28px]"}`}>
      <div className={`animate-nav-enter rounded-[22px] h-[70px] flex items-center justify-between px-6 relative transition-[background-color,box-shadow,border-color] duration-500 ${
        scrolled
          ? "bg-white/92 backdrop-blur-2xl shadow-[0_8px_48px_rgba(82,96,206,0.22)] ring-1 ring-[#5260ce]/12"
          : "bg-white shadow-[0px_4px_40px_0px_rgba(82,96,206,0.10)]"
      }`}>

        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 group">
          <div className="relative w-[50px] h-[30px] md:w-[78px] md:h-[48px] transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_2px_8px_rgba(82,96,206,0.3)]">
            <Image src={figmaAssets.logo} alt="UniVolta Logo" fill className="object-contain" unoptimized />
          </div>
        </Link>

        {/* Desktop Menu - Centered */}
        <div className={`hidden md:flex items-center justify-center gap-1 flex-1 absolute ${currentLang === "ar" ? "right-1/2 translate-x-1/2" : "left-1/2 -translate-x-1/2"}`}>
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
        <div className={`hidden md:flex items-center gap-4 shrink-0 ${currentLang === "ar" ? "mr-auto" : "ml-auto"}`}>
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[#65666f] font-montserrat-regular text-sm hover:text-[#5260ce] hover:bg-[rgba(82,96,206,0.06)] transition-all"
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span className="font-montserrat-semibold">{currentLang.toUpperCase()}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${langMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {langMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} />
                <div className={`absolute ${currentLang === "ar" ? "left-0" : "right-0"} mt-2 w-44 bg-white rounded-2xl shadow-[0_8px_32px_rgba(82,96,206,0.15)] border border-gray-100 z-50 overflow-hidden`}>
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
                      <span className="text-xl">{lang.flag}</span>
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
                    {t("myApplications")}
                  </Link>
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm text-[#2e2e2e] transition-colors" onClick={() => setUserMenuOpen(false)}>
                    {t("profile")}
                  </Link>
                  <div className="border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2 text-red-600 text-sm transition-colors">
                      <LogOut className="w-4 h-4" />
                      {t("logout")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-[#2e2e2e] font-montserrat-regular text-sm hover:text-[#5260ce] transition-colors px-2 py-1"
              >
                {mounted ? t("login") : "Login"}
              </Link>
              <Button
                className="nav-cta-shine text-white font-montserrat-semibold text-sm h-[40px] px-5 rounded-xl relative overflow-hidden shadow-[0_4px_14px_rgba(82,96,206,0.35)] hover:shadow-[0_6px_20px_rgba(82,96,206,0.5)] hover:-translate-y-0.5 transition-all duration-200"
                asChild
              >
                <Link href="/signup">{mounted ? t("signUp") : "Sign Up"}</Link>
              </Button>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Menu - Full Screen Overlay like Mobile Apps */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[60] md:hidden"
            onClick={() => setIsOpen(false)}
          />
          {/* Menu Panel */}
          <div className={`fixed top-14 ${currentLang === "ar" ? "right-0" : "left-0"} w-full max-w-sm h-[calc(100vh-56px)] bg-white shadow-2xl z-[70] md:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto`}>
            <div className="px-4 py-4 space-y-1">
              {/* Navigation Items */}
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 py-3.5 px-4 rounded-xl transition-all ${
                    item.active
                      ? "text-[#5260ce] font-montserrat-bold bg-[rgba(82,96,206,0.1)]"
                      : "text-[#2e2e2e] font-montserrat-regular hover:bg-gray-50 active:bg-gray-100"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-base">{item.label}</span>
                </Link>
              ))}
              
              {/* Divider */}
              <div className="my-4 border-t border-gray-200"></div>
              
              {/* Language Selector */}
              <div className="px-4 py-2">
                <p className="text-xs font-montserrat-semibold text-gray-500 mb-3 uppercase tracking-wide">
                  {t("language")}
                </p>
                <div className="flex gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        handleLanguageChange(lang.code);
                        setIsOpen(false);
                      }}
                      className={`flex-1 px-3 py-2.5 rounded-xl border-2 text-sm font-montserrat-medium transition-all ${
                        currentLang === lang.code
                          ? "bg-[#5260ce] text-white border-[#5260ce] shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#5260ce] active:scale-95"
                      }`}
                    >
                      <span className="text-base mr-1">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-gray-200"></div>

              {/* User Menu or Login/Sign Up */}
              {isAuthenticated ? (
                <div className="px-4 py-2 space-y-1">
                  <p className="text-xs font-montserrat-semibold text-gray-500 mb-3 uppercase tracking-wide">
                    {t("account")}
                  </p>
                  <Link
                    href="/my-applications"
                    className="flex items-center gap-3 py-3.5 px-4 rounded-xl text-[#2e2e2e] font-montserrat-regular hover:bg-gray-50 active:bg-gray-100 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-5 h-5 text-[#5260ce]" />
                    <span className="text-base">{t("myApplications")}</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 py-3.5 px-4 rounded-xl text-[#2e2e2e] font-montserrat-regular hover:bg-gray-50 active:bg-gray-100 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-5 h-5 text-[#5260ce]" />
                    <span className="text-base">{t("profile")}</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl text-red-600 font-montserrat-regular hover:bg-red-50 active:bg-red-100 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-base">{t("logout")}</span>
                  </button>
                </div>
              ) : (
                <div className="px-4 py-2 space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full text-base h-12 font-montserrat-semibold border-2 border-gray-300 hover:border-[#5260ce] active:scale-95 transition-all" 
                    asChild
                  >
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      {t("login")}
                    </Link>
                  </Button>
                  <Button
                    className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white text-base h-12 font-montserrat-semibold shadow-md active:scale-95 transition-all"
                    asChild
                  >
                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                      {t("signUp")}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
    </>
  );
}
