import type { Metadata } from "next";
import { HomePageClient } from "@/app/[locale]/home-page-client";
import { publicAlternates } from "@/lib/seo-metadata";
import { toAppLocale } from "@/lib/locale-path";
import { getSiteUrl } from "@/lib/site-url";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = toAppLocale(params.locale);
  return {
    ...publicAlternates(locale, "/"),
  };
}

export default function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "UniVolta",
        url: siteUrl,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "UniVolta",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePageClient />
    </>
  );
}
