import { NextResponse } from "next/server";
import { ADVISOR_REF_COOKIE, ADVISOR_REF_MAX_AGE_SEC } from "@/lib/advisor-ref-cookie";

/**
 * Sets first-party cookie with advisor referral token and redirects to home.
 * Registration reads the cookie and sends `advisorRef` in the application JSON body.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  if (!token || token.length < 8) {
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(new URL("/", origin));
  }
  const origin = new URL(request.url).origin;
  const res = NextResponse.redirect(new URL("/", origin));
  res.cookies.set(ADVISOR_REF_COOKIE, encodeURIComponent(token), {
    path: "/",
    maxAge: ADVISOR_REF_MAX_AGE_SEC,
    sameSite: "lax",
  });
  return res;
}
