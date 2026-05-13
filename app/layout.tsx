import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import { Geist, Geist_Mono, Alexandria } from "next/font/google";
import "./globals.css";
import { DirectionProvider } from "@/components/direction-provider";
import { I18nProvider } from "@/components/i18n-provider";
import type { Language } from "@/lib/i18n";
import { isAppLocale } from "@/lib/locale-path";
import { getMetadataBase } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Primary UI font — Latin + Arabic (replaces Montserrat site-wide) */
const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/** Fallback for routes outside `[locale]` (dashboard, admin, auth). */
export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: { default: "UniVolta", template: "%s | UniVolta" },
  description:
    "Apply to accredited Egyptian universities, explore programmes and fees, with support in English and Arabic.",
  icons: {
    icon: [{ url: "/logo-1.png", type: "image/png" as const }],
    apple: "/logo-1.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

function languageFromCookieJar(cookieLanguage: string | undefined): Language {
  return cookieLanguage === "ar" ? "ar" : "en";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const headerLocale = headersList.get("x-locale") ?? "";
  const cookieStore = await cookies();
  const initialLang: Language =
    isAppLocale(headerLocale)
      ? headerLocale
      : languageFromCookieJar(cookieStore.get("language")?.value);

  return (
    <html
      suppressHydrationWarning
      lang={initialLang}
      dir={initialLang === "ar" ? "rtl" : "ltr"}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${alexandria.variable} antialiased`}
      >
        <I18nProvider initialLang={initialLang}>
          <DirectionProvider>{children}</DirectionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
