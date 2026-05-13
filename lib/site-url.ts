/**
 * Canonical site origin for metadata, OG URLs, sitemap, and robots.
 * Set `NEXT_PUBLIC_SITE_URL` in env (e.g. https://univolta.com) — no trailing slash.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

export function getMetadataBase(): URL {
  return new URL(`${getSiteUrl()}/`);
}
