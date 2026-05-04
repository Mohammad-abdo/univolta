import type { Language } from "./i18n";

/** Preview bilingual JSON from API for admin lists (defaults to English). */
export function previewLocalized(raw: unknown, lang: Language = "en"): string {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as { en?: string; ar?: string };
    if (lang === "ar" && o.ar?.trim()) return o.ar.trim();
    return (o.en ?? o.ar ?? "").trim();
  }
  return "";
}
