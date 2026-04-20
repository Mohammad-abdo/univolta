import { API_BASE_URL } from "./constants";

export interface HeroSlideSetting {
  id: string;
  image: string;
  badge?: string;
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

export interface FooterContentSetting {
  phone?: string;
  email?: string;
  address?: string;
  copyright?: string;
  quickLinks?: Array<{ label: string; href: string }>;
  socialLinks?: Array<{ platform: string; href: string }>;
}

export interface PublicSiteSettings {
  "site.name"?: string;
  "site.logoUrl"?: string;
  "site.footerLogoUrl"?: string;
  "site.tagline"?: string;
  "hero.slides"?: HeroSlideSetting[];
  "home.sections"?: HomeSectionSetting[];
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

