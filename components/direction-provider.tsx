"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getLanguage, fetchTranslations } from "@/lib/i18n";

export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<string>("en");
  const pathname = usePathname();
  
  // Apply RTL for Arabic language in both dashboard and frontend
  const isDashboard = pathname?.startsWith("/dashboard");
  const shouldBeRTL = lang === "ar";
  const direction = shouldBeRTL ? "rtl" : "ltr";

  useEffect(() => {
    setMounted(true);
    const updateLanguage = async () => {
      const currentLang = getLanguage();
      setLang(currentLang);
      
      // Fetch translations from backend
      try {
        await fetchTranslations(currentLang);
      } catch (error) {
        console.error("Error loading translations:", error);
      }
      
      // Set document direction based on language
      if (typeof document !== "undefined") {
        // Set RTL for Arabic, LTR for other languages
        document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = currentLang;
      }
    };
    
    updateLanguage();
  }, [pathname]);

  // Listen for language changes
  useEffect(() => {
    const handleStorageChange = async () => {
      const currentLang = getLanguage();
      if (currentLang !== lang) {
        setLang(currentLang);
        
        // Fetch translations from backend when language changes
        try {
          await fetchTranslations(currentLang);
        } catch (error) {
          console.error("Error loading translations:", error);
        }
        
        if (typeof document !== "undefined") {
          // Set RTL for Arabic, LTR for other languages
          document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
          document.documentElement.lang = currentLang;
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
      // Also check periodically in case language changed in same window
      const interval = setInterval(() => {
        handleStorageChange();
      }, 100);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        clearInterval(interval);
      };
    }
  }, [lang, pathname]);

  if (!mounted) {
    return <>{children}</>;
  }

  // Apply direction wrapper for all pages based on language
  return (
    <div dir={direction} lang={lang} className={direction === "rtl" ? "rtl" : "ltr"}>
      {children}
    </div>
  );
}

