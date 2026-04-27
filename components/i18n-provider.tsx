"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import {
  type Language,
  setI18nRenderLanguage,
  readClientLanguagePreference,
  syncLanguageCookie,
} from "@/lib/i18n";

/**
 * Binds `getLanguage()` / `t()` to the cookie-backed locale on SSR and the first
 * client render, then reconciles with localStorage in `useLayoutEffect` so
 * hydration matches and preferred client storage still wins when it differs.
 */
export function I18nProvider({
  initialLang,
  children,
}: {
  initialLang: Language;
  children: ReactNode;
}) {
  const [lang, setLang] = useState<Language>(initialLang);

  setI18nRenderLanguage(lang);

  useLayoutEffect(() => {
    const preferred = readClientLanguagePreference(initialLang);
    if (preferred !== initialLang) {
      setLang(preferred);
      syncLanguageCookie();
    }
  }, [initialLang]);

  return <>{children}</>;
}
