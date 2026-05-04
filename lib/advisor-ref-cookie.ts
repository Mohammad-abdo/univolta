/** Cookie set by `/r/[token]`; send as `advisorRef` in POST /applications body (API may be another origin). */
export const ADVISOR_REF_COOKIE = "advisorRef";
export const ADVISOR_REF_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export function readAdvisorRefFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${ADVISOR_REF_COOKIE}=([^;]*)`));
  if (!m?.[1]) return null;
  try {
    return decodeURIComponent(m[1].trim());
  } catch {
    return m[1].trim() || null;
  }
}

export function clearAdvisorRefCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${ADVISOR_REF_COOKIE}=; Path=/; Max-Age=0`;
}
