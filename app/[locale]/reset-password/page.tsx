"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocaleLink } from "@/components/locale-link";
import { API_BASE_URL } from "@/lib/constants";
import { getLocaleHeaders } from "@/lib/api";
import { figmaAssets } from "@/lib/figma-assets";
import { t } from "@/lib/i18n";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError(t("authInvalidResetToken"));
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("authPasswordsNoMatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("authPasswordMinLength"));
      return;
    }

    if (!token) {
      setError(t("authResetTokenInvalid"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getLocaleHeaders() },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || t("authResetPasswordFailed"));
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      setError(t("authGenericTryAgain"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#5260ce]/10 via-white to-[#5260ce]/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #5260ce 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
        
        <div className="relative z-10 w-full max-w-md px-4 py-4 md:py-8">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 lg:p-10 border-4 border-[#5260ce]/20 text-center">
            <div className="mb-4 md:mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-montserrat-bold text-[#040404] mb-2">
                {t("authPasswordResetSuccessTitle")}
              </h2>
              <p className="text-sm md:text-base font-montserrat-regular text-[#65666f]">
                {t("authPasswordResetSuccessBody")}
              </p>
            </div>
            <LocaleLink
              href="/login"
              className="text-sm font-montserrat-regular text-[#5260ce] hover:text-[#4350b0] transition-colors"
            >
              {t("authGoToLogin")}
            </LocaleLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#5260ce]/10 via-white to-[#5260ce]/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, #5260ce 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>
      
      <div className="relative z-10 w-full max-w-md px-4 py-4 md:py-8">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 lg:p-10 border-4 border-[#5260ce]/20">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6 md:mb-8">
            <div className="relative w-16 h-16 md:w-20 md:h-20 mb-3 md:mb-4">
              <Image
                src={figmaAssets.logo}
                alt="UNIVOLTA Logo"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <h1 className="text-xl md:text-2xl font-montserrat-bold text-[#5260ce] mb-2">UNIVOLTA</h1>
            <p className="text-xs md:text-sm font-montserrat-regular text-[#65666f] text-center">
              {t("companyName")}
            </p>
          </div>

          {/* Title */}
          <h2 className="text-xl md:text-2xl font-montserrat-bold text-[#040404] mb-3 md:mb-4 text-center">
            {t("authResetPasswordTitle")}
          </h2>
          <p className="text-sm md:text-base font-montserrat-regular text-[#65666f] mb-6 md:mb-8 text-center">
            {t("authResetPasswordSubtitle")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* New Password Field */}
            <div>
              <label className="block font-montserrat-semibold text-sm text-[#040404] mb-2">
                {t("authNewPassword")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border-2 border-[#E0E6F1] rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#5260ce] focus:border-[#5260ce] font-montserrat-regular"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B8C9A] hover:text-[#65666f] focus:outline-none"
                  aria-label={showPassword ? t("authAriaHidePassword") : t("authAriaShowPassword")}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block font-montserrat-semibold text-sm text-[#040404] mb-2">
                {t("authConfirmPassword")}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border-2 border-[#E0E6F1] rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#5260ce] focus:border-[#5260ce] font-montserrat-regular"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B8C9A] hover:text-[#65666f] focus:outline-none"
                  aria-label={showConfirmPassword ? t("authAriaHidePassword") : t("authAriaShowPassword")}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm font-montserrat-regular text-center">
                {error}
              </div>
            )}

            {/* Reset Button */}
            <Button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm md:text-base h-12 md:h-14 rounded-xl"
            >
              {loading ? t("authResetting") : t("authResetPasswordButton")}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-4 md:mt-6 text-center">
            <LocaleLink
              href="/login"
              className="text-sm font-montserrat-regular text-[#5260ce] hover:text-[#4350b0] transition-colors"
            >
              {t("authReturnToLogin")}
            </LocaleLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-montserrat-regular">{t("authPageLoading")}</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

