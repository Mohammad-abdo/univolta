"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

export default function UniversitySignUpPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to home page - university registration is disabled
    // Only admin can add universities through the dashboard
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>{t("loading") || "Redirecting..."}</p>
    </div>
  );
}
