import type { Language } from "@/lib/i18n";

type TFn = (key: string) => string;

/** Localize common degree labels from API (English strings). */
export function formatDegreeLabel(degree: string | null | undefined, t: TFn): string {
  if (!degree) return "";
  const d = degree.toLowerCase();
  if (d.includes("bachelor")) return t("degreeBachelorShort");
  if (d.includes("master")) return t("degreeMasterShort");
  if (d.includes("phd") || d.includes("doctor of philosophy")) return t("degreePhdShort");
  if (d.includes("diploma")) return t("degreeDiplomaShort");
  return degree;
}

/** e.g. "5 years" → "5 سنوات" in Arabic via i18n */
export function formatDurationLabel(duration: string | null | undefined, t: TFn): string {
  if (!duration) return "";
  const m = duration.trim().match(/^(\d+)\s*years?$/i);
  if (m) return `${m[1]} ${t("yearsLabel")}`;
  return duration;
}

/** Normalize tuition suffix "/year" for locale */
export function formatTuitionPeriod(tuition: string | null | undefined, t: TFn): string {
  if (!tuition) return "";
  return tuition.replace(/\s*\/\s*year\b/gi, ` / ${t("perYear")}`);
}

/** Instruction languages often stored as "English" or "German, English" */
export function formatInstructionLanguages(text: string | null | undefined, t: TFn): string {
  if (!text || !text.trim()) return "";
  return text
    .split(/,\s*/)
    .map((part) => {
      const s = part.trim();
      const low = s.toLowerCase();
      if (low === "english") return t("langEnglish");
      if (low === "arabic") return t("langArabic");
      if (low === "german") return t("langGerman");
      if (low === "french") return t("langFrench");
      if (low === "spanish") return t("langSpanish");
      if (low === "italian") return t("langItalian");
      if (low === "japanese") return t("langJapanese");
      if (low === "chinese") return t("langChinese");
      if (low === "turkish") return t("langTurkish");
      return s;
    })
    .join(`${t("langListSeparator")} `);
}

/** Faculty / department headers from seed (English phrases) */
export function formatStudyMethodLabel(text: string | null | undefined, t: TFn): string {
  if (!text) return "";
  const low = text.toLowerCase();
  if (low.includes("on-campus") || low === "on campus") return t("studyMethodOnCampus");
  if (low.includes("online")) return t("studyMethodOnline");
  if (low.includes("hybrid")) return t("studyMethodHybrid");
  return text;
}

export function formatClassScheduleLabel(text: string | null | undefined, t: TFn): string {
  if (!text) return "";
  const low = text.toLowerCase();
  if (low.includes("morning")) return t("scheduleMorning");
  if (low.includes("evening")) return t("scheduleEvening");
  if (low.includes("full-time") || low.includes("full time")) return t("scheduleFullTime");
  return text;
}

/** Country names shown next to university (English DB → Arabic UI). */
export function formatCountryLabel(country: string | null | undefined, lang: Language): string {
  if (!country?.trim()) return "";
  if (lang !== "ar") return country.trim();
  const map: Record<string, string> = {
    egypt: "مصر",
    "united states": "الولايات المتحدة",
    "united kingdom": "المملكة المتحدة",
    canada: "كندا",
    australia: "أستراليا",
    germany: "ألمانيا",
    france: "فرنسا",
    japan: "اليابان",
    singapore: "سنغافورة",
    switzerland: "سويسرا",
  };
  return map[country.trim().toLowerCase()] ?? country.trim();
}

/** Start dates stored like "September 2025" → Arabic month names when locale is ar. */
export function localizeEnglishDatePhrases(text: string | null | undefined, lang: Language): string {
  if (!text?.trim()) return "";
  if (lang !== "ar") return text.trim();
  let s = text;
  const pairs: [RegExp, string][] = [
    [/January/gi, "يناير"],
    [/February/gi, "فبراير"],
    [/March/gi, "مارس"],
    [/April/gi, "أبريل"],
    [/May/gi, "مايو"],
    [/June/gi, "يونيو"],
    [/July/gi, "يوليو"],
    [/August/gi, "أغسطس"],
    [/September/gi, "سبتمبر"],
    [/October/gi, "أكتوبر"],
    [/November/gi, "نوفمبر"],
    [/December/gi, "ديسمبر"],
  ];
  for (const [re, ar] of pairs) {
    s = s.replace(re, ar);
  }
  return s;
}

export function formatFacultyDepartmentLabel(name: string, lang: Language): string {
  if (lang !== "ar") return name;
  const key = name.trim().toLowerCase();
  const map: Record<string, string> = {
    engineering: "الهندسة",
    "computer science": "علوم الحاسوب",
    business: "إدارة الأعمال",
    medicine: "الطب",
    law: "القانون",
    sciences: "العلوم",
    "faculty of engineering": "كلية الهندسة",
    "faculty of computer science & it": "كلية علوم الحاسوب وتكنولوجيا المعلومات",
    "faculty of sciences": "كلية العلوم",
    "faculty of arts & humanities": "كلية الآداب والعلوم الإنسانية",
    "faculty of medicine & health sciences": "كلية الطب والعلوم الصحية",
    "faculty of psychology & education": "كلية علم النفس والتربية",
    "faculty of business & economics": "كلية التجارة وإدارة الأعمال",
    "faculty of law": "كلية الحقوق",
    "faculty of architecture & design": "كلية العمارة والتصميم",
    "faculty of social sciences": "كلية العلوم الاجتماعية",
    "faculty of computer & it": "كلية الحاسوب وتكنولوجيا المعلومات",
    "faculty of tourism & hospitality": "كلية السياحة والفندقة",
    "faculty of design & architecture": "كلية التصميم والعمارة",
    other: "أخرى",
  };
  return map[key] ?? name;
}
