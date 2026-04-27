import type { Language } from "@/lib/i18n";

/** All copy comes from API fields; no hardcoded title/description fallbacks. */

export function servicePrimaryTitle(
  service: { title: string; titleAr?: string | null },
  lang: Language
): string {
  if (lang === "ar") return service.titleAr?.trim() || service.title;
  return service.title;
}

/** Other locale line when both languages exist in the payload. */
export function serviceSecondaryTitle(
  service: { title: string; titleAr?: string | null },
  lang: Language
): string {
  const ar = service.titleAr?.trim();
  const en = service.title?.trim();
  if (!ar || !en) return "";
  if (lang === "ar") return en !== ar ? en : "";
  return ar !== en ? ar : "";
}

export function servicePrimaryDescription(
  service: { description: string; descriptionAr?: string | null },
  lang: Language
): string {
  if (lang === "ar") return service.descriptionAr?.trim() || service.description;
  return service.description;
}

export function serviceSecondaryDescription(
  service: { description: string; descriptionAr?: string | null },
  lang: Language
): string {
  const ar = service.descriptionAr?.trim();
  const en = service.description?.trim();
  if (!ar || !en) return "";
  if (lang === "ar") return en !== ar ? en : "";
  return ar !== en ? ar : "";
}
