import { NextResponse, type NextRequest } from "next/server";
import { ADVISOR_REF_COOKIE, ADVISOR_REF_MAX_AGE_SEC } from "@/lib/advisor-ref-cookie";

/**
 * Sets first-party cookie with advisor referral token and redirects to home.
 * Registration reads the cookie and sends `advisorRef` in the application JSON body.
 */
function pickLocale(request: NextRequest): "en" | "ar" {
  const fromCookie = request.cookies.get("language")?.value;
  if (fromCookie === "ar") return "ar";
  if (fromCookie === "en") return "en";
  const accept = request.headers.get("accept-language")?.toLowerCase() ?? "";
  if (accept.includes("ar")) return "ar";
  return "en";
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const locale = pickLocale(request);
  if (!token || token.length < 8) {
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(new URL(`/${locale}/`, origin));
  }
  const origin = new URL(request.url).origin;
  const res = NextResponse.redirect(new URL(`/${locale}/`, origin));
  res.cookies.set(ADVISOR_REF_COOKIE, encodeURIComponent(token), {
    path: "/",
    maxAge: ADVISOR_REF_MAX_AGE_SEC,
    sameSite: "lax",
  });
  return res;
}
