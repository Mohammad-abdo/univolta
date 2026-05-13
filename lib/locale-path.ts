import { getSiteUrl } from "@/lib/site-url";

export const APP_LOCALES = ["en", "ar"] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

export function isAppLocale(value: string): value is AppLocale {
  return value === "en" || value === "ar";
}

export function toAppLocale(value: string | undefined): AppLocale {
  return value === "ar" ? "ar" : "en";
}

/** First path segment if it is en|ar. */
export function localeFromPathname(pathname: string): AppLocale | null {
  const seg = pathname.split("/").filter(Boolean)[0];
  return isAppLocale(seg) ? seg : null;
}

/**
 * Path without `/en` or `/ar` prefix. Leading slash preserved (`/` or `/contact`).
 */
export function pathnameWithoutLocalePrefix(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (!isAppLocale(seg)) return pathname || "/";
  const rest = pathname.slice(`/${seg}`.length) || "/";
  return rest.startsWith("/") ? rest : `/${rest}`;
}

const DASHBOARD_PREFIXES = ["dashboard", "admin", "auth", "api", "r"] as const;

function isDashboardOrSystemPath(hrefPath: string): boolean {
  const first = hrefPath.split("/").filter(Boolean)[0];
  return DASHBOARD_PREFIXES.includes(first as (typeof DASHBOARD_PREFIXES)[number]);
}

/**
 * Prefix a public app path with `/en` or `/ar`. Leaves dashboard/admin/auth/api/r unchanged.
 * If `href` already starts with `/en/` or `/ar/`, returns as-is.
 */
export function withLocalePath(locale: AppLocale, href: string): string {
  if (!href.startsWith("/")) href = `/${href}`;
  const first = href.split("/").filter(Boolean)[0];
  if (isAppLocale(first)) return href;
  if (isDashboardOrSystemPath(href)) return href;
  if (href === "/") return `/${locale}`;
  return `/${locale}${href}`;
}

/**
 * Client-side: resolve localized href using current pathname's locale (or `fallbackLocale`).
 */
export function withLocaleHref(
  href: string,
  currentPathname: string | null,
  fallbackLocale: AppLocale = "en"
): string {
  if (!href.startsWith("/")) return href;
  if (href.startsWith("//")) return href;
  const first = href.split("/").filter(Boolean)[0];
  if (isAppLocale(first)) return href;
  if (isDashboardOrSystemPath(href)) return href;
  const loc = localeFromPathname(currentPathname ?? "") ?? fallbackLocale;
  return withLocalePath(loc, href);
}

/** Strip `/en` or `/ar` for comparing CMS paths like `/about` to defaults. */
export function stripLocalePrefixFromPathForCompare(path: string): string {
  const normalized = path.replace(/\/$/, "") || "/";
  const seg = normalized.split("/").filter(Boolean)[0];
  if (isAppLocale(seg)) {
    const rest = normalized.slice(`/${seg}`.length) || "/";
    return rest.replace(/\/$/, "") || "/";
  }
  return normalized.replace(/\/$/, "") || "/";
}

export function absoluteLocaleUrl(locale: AppLocale, pathWithoutLocale: string): string {
  const base = getSiteUrl();
  const path = withLocalePath(locale, pathWithoutLocale.startsWith("/") ? pathWithoutLocale : `/${pathWithoutLocale}`);
  return `${base}${path === "/" ? "" : path}`;
}
