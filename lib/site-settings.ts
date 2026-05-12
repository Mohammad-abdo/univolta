import { API_BASE_URL } from "./constants";
import type { LocalizedJson } from "./localized";

export interface HeroSlideSetting {
  id: string;
  image: string;
  /** New format (preferred): `{ en, ar }` */
  badge?: LocalizedJson | string;
  title?: LocalizedJson | string;
  sub?: LocalizedJson | string;
  /** Legacy format (backward compatible) */
  titleEn?: string;
  titleAr?: string;
  subEn?: string;
  subAr?: string;
}

export interface HomeSectionSetting {
  id: string;
  label?: string;
  enabled: boolean;
  order?: number;
}

export interface HomeStatsSetting {
  universitiesCount: number;
  studentsCount: number;
  acceptanceRate: number;
  programsCount: number;
}

export interface FooterContentSetting {
  /** New format (preferred): `{ en, ar }` */
  title?: LocalizedJson | string;
  phone?: string;
  email?: string;
  address?: LocalizedJson | string;
  copyright?: string;
  quickLinks?: Array<{ label: string; href: string }>;
  socialLinks?: Array<{ platform: string; href: string }>;
  /** Legacy format (backward compatible) */
  titleEn?: string;
  titleAr?: string;
  addressEn?: string;
  addressAr?: string;
}

export interface HomeVideoSetting {
  url?: string;
  posterUrl?: string;
  /** New format (preferred): `{ en, ar }` */
  title?: LocalizedJson | string;
  sub?: LocalizedJson | string;
  /** Legacy format (backward compatible) */
  titleEn?: string;
  titleAr?: string;
  subEn?: string;
  subAr?: string;
}

export interface PublicSiteSettings {
  "site.name"?: string;
  "site.logoUrl"?: string;
  "site.footerLogoUrl"?: string;
  "site.tagline"?: string;
  "hero.slides"?: HeroSlideSetting[];
  "home.sections"?: HomeSectionSetting[];
  "home.video"?: HomeVideoSetting;
  "home.stats"?: HomeStatsSetting;
  "footer.content"?: FooterContentSetting;
}

export async function fetchPublicSiteSettings(): Promise<PublicSiteSettings> {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    return {};
  }

  return (await response.json()) as PublicSiteSettings;
}

