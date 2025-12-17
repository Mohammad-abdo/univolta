"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, GraduationCap, HelpCircle, Mail, Menu, X, User, LogOut, Globe, ChevronDown } from "lucide-react";
import { t, getLanguage, setLanguage, languages, type Language } from "@/lib/i18n";
import { API_BASE_URL } from "@/lib/constants";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage());
  const isRTL = currentLang === "ar";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
    
    // Listen for language changes
    const interval = setInterval(() => {
      const lang = getLanguage();
      if (lang !== currentLang) {
        setCurrentLang(lang);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [currentLang]);

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
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setIsAuthenticated(false);
          setUserName(null);
        }
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUserName(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    setUserName(null);
    setIsMenuOpen(false);
    router.push("/");
    window.location.reload();
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLangMenuOpen(false);
  };

  // Don't show on dashboard or auth pages
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/login") || pathname?.startsWith("/signup") || pathname?.startsWith("/forgot-password") || pathname?.startsWith("/reset-password")) {
    return null;
  }

  const navItems = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/universities", label: t("universities"), icon: GraduationCap },
    { href: "/faq", label: t("faq"), icon: HelpCircle },
    { href: "/contact", label: t("contact"), icon: Mail },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg md:hidden">
        <div className={`flex items-center justify-around h-16 px-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                  isActive
                    ? "text-[#5260ce]"
                    : "text-gray-500 hover:text-[#5260ce]"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""} transition-transform`} />
                <span className={`text-xs font-montserrat-${isActive ? "semibold" : "regular"} ${isActive ? "text-[#5260ce]" : "text-gray-500"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          {/* Menu Icon */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              isMenuOpen
                ? "text-[#5260ce]"
                : "text-gray-500 hover:text-[#5260ce]"
            }`}
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 transition-transform" />
            ) : (
              <Menu className="w-5 h-5 transition-transform" />
            )}
            <span className={`text-xs font-montserrat-${isMenuOpen ? "semibold" : "regular"} ${isMenuOpen ? "text-[#5260ce]" : "text-gray-500"}`}>
              {t("menu") || "Menu"}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          {/* Menu Panel */}
          <div className={`fixed top-0 ${currentLang === "ar" ? "right-0" : "left-0"} w-full max-w-sm h-full bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto`}>
            <div className="pt-16 px-4 py-4 space-y-1">
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
                  onClick={() => setIsMenuOpen(false)}
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
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 text-[#5260ce]" />
                    <span className="text-base">{t("myApplications")}</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 py-3.5 px-4 rounded-xl text-[#2e2e2e] font-montserrat-regular hover:bg-gray-50 active:bg-gray-100 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 text-[#5260ce]" />
                    <span className="text-base">{t("profile")}</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl text-red-600 font-montserrat-regular hover:bg-red-50 active:bg-red-100 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-base">{t("logout")}</span>
                  </button>
                </div>
              ) : (
                <div className="px-4 py-2 space-y-3">
                  <Link
                    href="/login"
                    className="block w-full text-center py-3 px-4 rounded-xl border-2 border-gray-300 text-base font-montserrat-semibold hover:border-[#5260ce] active:scale-95 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t("login")}
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full text-center py-3 px-4 rounded-xl bg-[#5260ce] hover:bg-[#4350b0] text-white text-base font-montserrat-semibold shadow-md active:scale-95 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t("signUp")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}


