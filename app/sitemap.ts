import type { MetadataRoute } from "next";
import { APP_LOCALES } from "@/lib/locale-path";
import { API_BASE_URL } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site-url";

const STATIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/universities",
  "/faq",
  "/terms",
  "/login",
  "/signup",
];

function addLocalizedEntries(
  entries: MetadataRoute.Sitemap,
  pathWithoutLocale: string,
  lastModified: Date
) {
  const normalized =
    pathWithoutLocale.startsWith("/") ? pathWithoutLocale : `/${pathWithoutLocale}`;
  for (const locale of APP_LOCALES) {
    const localizedPath =
      normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
    entries.push({
      url: `${getSiteUrl()}${localizedPath}`,
      lastModified,
    });
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const lastModified = new Date();

  for (const path of STATIC_PATHS) {
    addLocalizedEntries(entries, path, lastModified);
  }

  let universities: any[] = [];
  try {
    const response = await fetch(`${API_BASE_URL}/public/universities?limit=200`, {
      cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json();
      universities = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    }
  } catch {
    universities = [];
  }

  for (const university of universities) {
    const slug = typeof university?.slug === "string" ? university.slug : "";
    if (!slug) continue;
    addLocalizedEntries(entries, `/universities/${slug}`, lastModified);
    addLocalizedEntries(entries, `/universities/${slug}/programs`, lastModified);

    const programs = Array.isArray(university.programs) ? university.programs : [];
    for (const program of programs) {
      const programSlug = typeof program?.slug === "string" ? program.slug : "";
      if (!programSlug) continue;
      addLocalizedEntries(
        entries,
        `/universities/${slug}/programs/${programSlug}`,
        lastModified
      );
    }
  }

  return entries;
}
