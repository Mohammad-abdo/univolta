import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_LOCALES, isAppLocale, type AppLocale } from "@/lib/locale-path";
import { getMetadataBase } from "@/lib/site-url";

export async function generateStaticParams() {
  return APP_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) notFound();
  const locale = raw as AppLocale;
  const icons = {
    icon: [{ url: "/logo-1.png", type: "image/png" as const }],
    apple: "/logo-1.png",
  };
  const title =
    locale === "ar"
      ? "يونيفولتا — بوابتك للجامعات المصرية"
      : "UniVolta — Your gateway to Egyptian universities";
  const description =
    locale === "ar"
      ? "قدّم على جامعات مصرية معتمدة، واستكشف البرامج والرسوم مع دعم بالعربية والإنجليزية."
      : "Apply to accredited Egyptian universities, explore programmes and fees, with support in English and Arabic.";

  return {
    metadataBase: getMetadataBase(),
    title: { default: title, template: "%s | UniVolta" },
    description,
    icons,
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_EG" : "en_US",
      siteName: locale === "ar" ? "يونيفولتا" : "UniVolta",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LocaleSegmentLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  return children;
}
