"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/constants";
import { figmaAssets } from "@/lib/figma-assets";

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
      setError("Invalid or missing reset token");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to reset password");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      setError("An error occurred. Please try again.");
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
                Password Reset Successful
              </h2>
              <p className="text-sm md:text-base font-montserrat-regular text-[#65666f]">
                Your password has been reset successfully. Redirecting to login...
              </p>
            </div>
            <Link
              href="/login"
              className="text-sm font-montserrat-regular text-[#5260ce] hover:text-[#4350b0] transition-colors"
            >
              Go to login
            </Link>
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
              شركة يونيفولتا للخدمات الاستشارية
            </p>
          </div>

          {/* Title */}
          <h2 className="text-xl md:text-2xl font-montserrat-bold text-[#040404] mb-3 md:mb-4 text-center">
            Reset your password
          </h2>
          <p className="text-sm md:text-base font-montserrat-regular text-[#65666f] mb-6 md:mb-8 text-center">
            Please enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* New Password Field */}
            <div>
              <label className="block font-montserrat-semibold text-sm text-[#040404] mb-2">
                New Password
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                Confirm Password
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
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-4 md:mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-montserrat-regular text-[#5260ce] hover:text-[#4350b0] transition-colors"
            >
              Return to login
            </Link>
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
        <div className="text-lg font-montserrat-regular">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

