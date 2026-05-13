"use client";

import { t } from "@/lib/i18n";

/** Shown while `useSearchParams()` suspends — must be a Client Component to use `t()`. */
export function RegisterSuspenseFallback() {
  return (
    <div className="min-h-screen bg-[#f9fafe] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5260ce] mx-auto mb-4" />
        <p className="font-montserrat-regular text-sm text-[#8b8c9a]">{t("loadingRegistration")}</p>
      </div>
    </div>
  );
}
