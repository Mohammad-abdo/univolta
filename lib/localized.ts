import type { Language } from "./i18n";

/** Stored shape for bilingual CMS/DB fields: `{ en, ar }`. */
export type LocalizedJson = { en: string; ar?: string };

/**
 * Pick the best localized value from:
 * - string (already localized/legacy)
 * - `{ en, ar }` JSON
 * - null/unknown (=> empty string)
 *
 * Fallback behavior matches backend `backend/src/common/i18n/pickLocalized.ts`:
 * - if locale is `ar` and `ar` is present => use it
 * - else prefer `en`, else `ar`
 */
export function pickLocalized(field: unknown, locale: Language): string {
  if (typeof field === "string") return field;
  if (field && typeof field === "object" && !Array.isArray(field)) {
    const o = field as LocalizedJson;
    if (locale === "ar" && typeof o.ar === "string" && o.ar.trim().length > 0) return o.ar;
    if (typeof o.en === "string" && o.en.length > 0) return o.en;
    if (typeof o.ar === "string") return o.ar;
  }
  return "";
}

/** Preview bilingual JSON from API for admin lists (defaults to English). */
export function previewLocalized(raw: unknown, lang: Language = "en"): string {
  if (typeof raw === "string") return raw;
  return pickLocalized(raw, lang).trim();
}

/** Mirrors backend `pickLocalizedStringArray` — safe if API still returns `{ en, ar }` JSON. */
export function pickLocalizedStringArray(field: unknown, locale: Language): string[] {
  let v: unknown = field;
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      return [];
    }
  }
  if (v == null) return [];

  if (Array.isArray(v)) {
    if (v.length === 0) return [];
    if (typeof v[0] === "string") return v as string[];
    return (v as LocalizedJson[])
      .map((row) => pickLocalized(row, locale))
      .filter((s) => s.length > 0);
  }

  if (typeof v === "object" && !Array.isArray(v)) {
    const o = v as { en?: unknown; ar?: unknown };
    const pickArr = (x: unknown): string[] =>
      Array.isArray(x) && x.every((i) => typeof i === "string") ? (x as string[]) : [];

    const arList = pickArr(o.ar);
    const enList = pickArr(o.en);

    if (locale === "ar" && arList.length > 0) return arList;
    if (enList.length > 0) return enList;
    if (arList.length > 0) return arList;
  }

  return [];
}
