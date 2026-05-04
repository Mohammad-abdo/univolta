import type { LucideIcon } from "lucide-react";
import {
  Facebook,
  Youtube,
  Twitter,
  Instagram,
  MessageCircle,
  Globe,
} from "lucide-react";

export type SocialLinkRow = {
  Icon: LucideIcon;
  href: string;
  label: string;
};

/** Fallback when CMS has no social links (matches previous footer defaults). */
export const DEFAULT_SOCIAL_LINKS: Array<{ platform: string; href: string }> = [
  { platform: "Instagram", href: "#" },
  { platform: "Facebook", href: "#" },
  { platform: "YouTube", href: "#" },
  { platform: "Twitter", href: "#" },
];

const ICONS: Record<string, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  twitter: Twitter,
  whatsapp: MessageCircle,
};

function iconForPlatform(platform: string): LucideIcon {
  const key = platform.trim().toLowerCase();
  if (key === "x") return Twitter;
  for (const [name, Icon] of Object.entries(ICONS)) {
    if (key.includes(name)) return Icon;
  }
  return Globe;
}

/**
 * Maps CMS `footer.content.socialLinks` (or defaults) to Lucide icons + hrefs.
 * Platform string is matched case-insensitively (e.g. "YouTube", "youtube").
 */
export function buildSocialLinkRows(
  socialLinks?: Array<{ platform: string; href: string }> | null
): SocialLinkRow[] {
  const raw = socialLinks?.length ? socialLinks : DEFAULT_SOCIAL_LINKS;
  return raw.map(({ platform, href }) => ({
    Icon: iconForPlatform(platform),
    href: (href && href.trim()) || "#",
    label: platform.trim() || "Social",
  }));
}

/** Footer column: extra Tailwind for icon hover on dark background */
export const FOOTER_SOCIAL_HOVER: Record<string, string> = {
  Instagram:
    "hover:bg-gradient-to-br hover:from-[#833ab4] hover:via-[#fd1d1d] hover:to-[#fcb045]",
  Facebook: "hover:bg-[#1877F2]",
  YouTube: "hover:bg-[#FF0000]",
  Twitter: "hover:bg-[#1DA1F2]",
  WhatsApp: "hover:bg-[#25D366]",
};

export function footerSocialHoverClass(label: string): string {
  const k = Object.keys(FOOTER_SOCIAL_HOVER).find(
    (name) => name.toLowerCase() === label.trim().toLowerCase()
  );
  return k ? FOOTER_SOCIAL_HOVER[k] : "hover:bg-[#5260ce]";
}
