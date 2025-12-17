"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/constants";
import { figmaAssets } from "@/lib/figma-assets";
import { t } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to send reset link");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to send reset link");
        setLoading(false);
        return;
      }

      // Show success message
      setLoading(false);
    } catch (error) {
      console.error("Resend error:", error);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e] relative overflow-hidden">
        {/* Dark Speckled Background Pattern */}
        <div 
          className="absolute inset-0 opacity-40" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(82, 96, 206, 0.3) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}
        ></div>
        
        <div className="relative z-10 w-full max-w-md px-4 py-4 md:py-8">
          <div 
            className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 lg:p-10 relative"
            style={{
              border: '3px dashed rgba(82, 96, 206, 0.4)',
              borderStyle: 'dotted'
            }}
          >
            {/* Logo */}
            <div className="flex flex-col items-center mb-6 md:mb-8">
              <div className="relative w-12 h-12 md:w-16 md:h-16 mb-2 md:mb-3">
                <Image
                  src={figmaAssets.logo}
                  alt="UNIVOLTA Logo"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <h1 className="text-lg md:text-xl font-montserrat-bold text-[#5260ce] mb-1">UNIVOLTA</h1>
              <p className="text-xs font-montserrat-regular text-[#65666f] text-center">
                {t("companyName")}
              </p>
            </div>

            {/* Success Message */}
            <h2 className="text-xl md:text-2xl font-montserrat-bold text-[#040404] mb-3 md:mb-4 text-center">
              The link has been sent.
            </h2>
            <p className="text-xs md:text-base font-montserrat-regular text-[#65666f] mb-6 md:mb-8 text-center">
              A password reset link has been sent to your email. Please check your inbox (including the spam folder) and follow the instructions to set a new password.
            </p>

            {/* Email Display */}
            <div className="mb-6">
              <label className="block font-montserrat-semibold text-sm text-[#040404] mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full border-2 border-[#E0E6F1] rounded-xl px-4 py-3 pr-12 bg-gray-50 font-montserrat-regular text-sm"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B8C9A]" />
              </div>
            </div>

            {/* Resend Button */}
            <Button
              onClick={handleResend}
              disabled={loading}
              className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm md:text-base h-12 md:h-14 rounded-xl mb-4 shadow-lg"
            >
              {loading ? "Sending..." : "Resend"}
            </Button>

            {/* Return to Login */}
            <div className="text-center">
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e] relative overflow-hidden">
      {/* Dark Speckled Background Pattern */}
      <div 
        className="absolute inset-0 opacity-40" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(82, 96, 206, 0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}
      ></div>
      
      <div className="relative z-10 w-full max-w-md px-4 py-4 md:py-8">
        <div 
          className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 lg:p-10 relative"
          style={{
            border: '3px dashed rgba(82, 96, 206, 0.4)',
            borderStyle: 'dotted'
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-6 md:mb-8">
            <div className="relative w-12 h-12 md:w-16 md:h-16 mb-2 md:mb-3">
              <Image
                src={figmaAssets.logo}
                alt="UNIVOLTA Logo"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <h1 className="text-lg md:text-xl font-montserrat-bold text-[#5260ce] mb-1">UNIVOLTA</h1>
            <p className="text-xs font-montserrat-regular text-[#65666f] text-center">
              شركة يونيفولتا للخدمات الاستشارية
            </p>
          </div>

          {/* Title */}
          <h2 className="text-xl md:text-2xl font-montserrat-bold text-[#040404] mb-3 md:mb-4 text-center">
            Forgot your password?
          </h2>
          <p className="text-xs md:text-base font-montserrat-regular text-[#65666f] mb-6 md:mb-8 text-center">
            Please enter your email address and we will send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Email Field */}
            <div>
              <label className="block font-montserrat-semibold text-sm text-[#040404] mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user.user@gmail.com"
                  required
                  className="w-full border-2 border-[#E0E6F1] rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#5260ce] focus:border-[#5260ce] font-montserrat-regular text-sm"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B8C9A]" />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm font-montserrat-regular text-center">
                {error}
              </div>
            )}

            {/* Continue Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm md:text-base h-12 md:h-14 rounded-xl shadow-lg"
            >
              {loading ? "Sending..." : "Continue"}
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
