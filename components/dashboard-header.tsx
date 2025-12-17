"use client";

import { useState, useEffect } from "react";
import { Search, User, Settings, LogOut, Menu, X, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/constants";
import { useRouter } from "next/navigation";
import {
  getLanguage,
  setLanguage,
  languages,
  type Language,
  t,
} from "@/lib/i18n";
import { AlertNotification } from "@/components/alerts/alert-notification";

interface DashboardHeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function DashboardHeader({ onMenuToggle, isMobileMenuOpen }: DashboardHeaderProps) {
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setCurrentLang(getLanguage());
    
    const fetchUser = async () => {
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
            setUser(userData);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLangMenuOpen(false);
  };

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      try {
        if (accessToken) {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        }
      } catch (error) {
        console.error("Failed to log out via API", error);
      } finally {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }
    router.push("/dashboard/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 md:left-64 h-14 md:h-16 bg-white border-b border-gray-200 z-30 shadow-sm">
      <div className="h-full px-2 md:px-6 flex items-center justify-between gap-1 md:gap-2">
        {/* Left side - Mobile menu button and search */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          {/* Mobile menu button */}
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label={t("toggleMenu") || "Toggle menu"}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>

          {/* Search bar - Mobile */}
          <div className="md:hidden flex items-center flex-1 min-w-0 max-w-[calc(100vw-120px)]">
            <div className="relative w-full">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 ${currentLang === "ar" ? "right-2" : "left-2"}`} />
              <input
                type="text"
                placeholder={t("search")}
                className={`w-full py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5260ce] focus:border-transparent transition-all ${currentLang === "ar" ? "pr-7 pl-2.5" : "pl-7 pr-2.5"}`}
              />
            </div>
          </div>

          {/* Search bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${currentLang === "ar" ? "right-3" : "left-3"}`} />
              <input
                type="text"
                placeholder={t("search")}
                className={`w-full py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5260ce] focus:border-transparent transition-all ${currentLang === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"}`}
              />
            </div>
          </div>
        </div>

        {/* Right side - Language, Notifications and user menu */}
        <div className="flex items-center gap-0.5 md:gap-3 flex-shrink-0">
          {/* Language Selector */}
          {mounted && (
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 px-1.5 md:px-3 py-1.5 md:py-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={t("changeLanguage") || "Change language"}
              >
                <Globe className="w-4 h-4 md:w-5 md:h-5 text-gray-700 flex-shrink-0" />
                <span className="hidden lg:block text-xs md:text-sm font-montserrat-regular text-gray-700">
                  {currentLang.toUpperCase()}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-700 hidden lg:block" />
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${
                        currentLang === lang.code
                          ? "bg-blue-50 text-[#5260ce]"
                          : "text-gray-700"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span className="text-sm font-montserrat-regular">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          <AlertNotification />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1 px-1 md:px-3 py-1 md:py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-7 h-7 md:w-8 md:h-8 bg-[#5260ce] rounded-full flex items-center justify-center text-white font-montserrat-semibold text-xs md:text-sm flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-sm font-montserrat-semibold text-gray-900 truncate max-w-[100px]">
                  {user?.name || t("user") || "User"}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role || t("user") || "user"}
                </p>
              </div>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className={`absolute ${currentLang === "ar" ? "left-0" : "right-0"} mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200`}>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push("/profile");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                >
                  <User className="w-4 h-4" />
                  {t("profile")}
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push("/dashboard/settings");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {t("settings")}
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t("logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || langMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setLangMenuOpen(false);
          }}
        ></div>
      )}
    </header>
  );
}

