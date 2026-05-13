import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAppLocale, type AppLocale } from "@/lib/locale-path";

function pickLocale(request: NextRequest): AppLocale {
  const fromCookie = request.cookies.get("language")?.value;
  if (fromCookie === "ar") return "ar";
  if (fromCookie === "en") return "en";
  const accept = request.headers.get("accept-language")?.toLowerCase() ?? "";
  if (accept.includes("ar")) return "ar";
  return "en";
}

function isStaticAssetPath(pathname: string): boolean {
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return true;
  }
  return /\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest|woff2?)$/i.test(
    pathname.split("/").pop() ?? ""
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAssetPath(pathname)) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (first === "api") {
    return NextResponse.next();
  }

  if (first === "dashboard" || first === "admin" || first === "auth" || first === "r") {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", pickLocale(request));
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (isAppLocale(first)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", first);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const locale = pickLocale(request);
  const url = request.nextUrl.clone();
  url.pathname =
    pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
