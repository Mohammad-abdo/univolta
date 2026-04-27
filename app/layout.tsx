import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Alexandria } from "next/font/google";
import "./globals.css";
import { DirectionProvider } from "@/components/direction-provider";
import { I18nProvider } from "@/components/i18n-provider";
import type { Language } from "@/lib/i18n";

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

export const metadata: Metadata = {
  title: "UniVolta - Study Abroad Made Easy",
  description:
    "Connect with top international universities and get personalized support throughout your application journey.",
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
  const cookieStore = await cookies();
  const initialLang = languageFromCookieJar(cookieStore.get("language")?.value);

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
