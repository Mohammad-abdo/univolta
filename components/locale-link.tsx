"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { withLocaleHref } from "@/lib/locale-path";

type LinkProps = ComponentProps<typeof Link>;

/**
 * Internal marketing links: prefixes `/en` or `/ar` from the current URL.
 * Dashboard, admin, auth, api, r/* hrefs are left unchanged.
 */
export function LocaleLink({ href, ...rest }: LinkProps) {
  const pathname = usePathname();
  const resolved =
    typeof href === "string" ? withLocaleHref(href, pathname) : href;
  return <Link href={resolved} {...rest} />;
}
