import type { Metadata } from "next";
import type { AppLocale } from "@/lib/locale-path";
import { absoluteLocaleUrl } from "@/lib/locale-path";

/** Path without locale prefix, e.g. `/universities` or `/universities/foo/programs/bar`. */
export function publicAlternates(
  locale: AppLocale,
  pathWithoutLocale: string
): Pick<Metadata, "alternates"> {
  const path =
    pathWithoutLocale.startsWith("/") ? pathWithoutLocale : `/${pathWithoutLocale}`;
  return {
    alternates: {
      canonical: absoluteLocaleUrl(locale, path),
      languages: {
        en: absoluteLocaleUrl("en", path),
        ar: absoluteLocaleUrl("ar", path),
        "x-default": absoluteLocaleUrl("en", path),
      },
    },
  };
}
