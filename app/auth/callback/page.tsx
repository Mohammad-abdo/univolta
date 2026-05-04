"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      router.replace(`/login?error=${encodeURIComponent(err)}`);
      return;
    }

    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const role = (searchParams.get("role") || "user").toLowerCase();
    const redirect = searchParams.get("redirect");

    if (!accessToken || !refreshToken) {
      router.replace("/login?error=oauth_missing_tokens");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    }

    if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
      router.replace(redirect);
      return;
    }

    if (role === "admin" || role === "editor") {
      router.replace("/dashboard");
    } else if (role === "university") {
      router.replace("/dashboard/partner");
    } else {
      router.replace("/profile");
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen aurora-hero flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5260ce]" />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen aurora-hero flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5260ce]" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
