"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/constants";
import { figmaAssets } from "@/lib/figma-assets";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Store tokens
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }
      }

      // Redirect based on redirect param or role
      const redirectUrl = searchParams?.get("redirect");
      if (redirectUrl) {
        router.push(decodeURIComponent(redirectUrl));
      } else if (
        data.user?.role?.toLowerCase() === "admin" ||
        data.user?.role?.toLowerCase() === "editor"
      ) {
        router.push("/dashboard");
      } else if (
        data.user?.role?.toLowerCase() === "university" ||
        data.user?.universityId
      ) {
        // University users go to their control panel
        router.push("/dashboard/partner");
      } else {
        // Regular users (students) go to home page
        router.push("/");
      }
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8EAF6] relative overflow-hidden py-4 md:py-8">
      {/* Background Logo Graphic - Bottom Right, Faint */}
      <div className="hidden md:block absolute bottom-0 right-0 w-80 h-80 opacity-5">
        <Image
          src={figmaAssets.logo}
          alt=""
          fill
          className="object-contain"
          unoptimized
        />
      </div>

      <div className="relative w-full max-w-lg z-10 px-4 py-4 md:py-8">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-md p-6 md:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6 md:mb-8">
            <div className="relative w-32 h-16 md:w-40 md:h-20 mb-2 md:mb-3">
              <Image
                src={figmaAssets.logo}
                alt="UNIVOLTA Logo"
                fill
                className="object-contain w-full h-full"
                unoptimized
              />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-montserrat-bold text-[#2e2e2e] mb-2 text-center">
            Log in to your account
          </h2>
          <p className="text-sm md:text-base font-montserrat-regular text-[#65666f] mb-6 md:mb-8 text-center">
            Please enter your email and password to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {/* Email Field */}
            <div>
              <label className="block font-montserrat-semibold text-sm text-[#2e2e2e] mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user.user@gmail.com"
                  required
                  className="w-full border border-[#E0E6F1] rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#5260ce] focus:border-[#5260ce] font-montserrat-regular text-sm bg-white text-[#2e2e2e]"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B8C9A]" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-montserrat-semibold text-sm text-[#2e2e2e]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-montserrat-regular text-[#5260ce] hover:text-[#4350b0] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-[#E0E6F1] rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#5260ce] focus:border-[#5260ce] font-montserrat-regular text-sm bg-white text-[#2e2e2e]"
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

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#5260ce] border-2 border-[#E0E6F1] rounded focus:ring-2 focus:ring-[#5260ce] cursor-pointer"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 text-sm font-montserrat-regular text-[#2e2e2e] cursor-pointer"
              >
                Remember me
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`text-sm font-montserrat-regular text-center rounded-xl p-4 ${
                error.includes("pending") || error.includes("approval") || error.includes("inactive")
                  ? "bg-yellow-50 border border-yellow-200 text-yellow-800"
                  : "bg-red-50 border border-red-200 text-red-600"
              }`}>
                {error}
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm md:text-base h-12 md:h-14 rounded-xl"
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          {/* Social Login - Horizontal Layout: Facebook Left, Google Right */}
          <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-2 md:gap-3">
            {/* Facebook Button - Left */}
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 md:h-12 rounded-xl border border-[#E0E6F1] hover:bg-[#F9FAFB] font-montserrat-regular text-[#2e2e2e] flex items-center justify-center gap-2 bg-white text-xs md:text-sm"
              onClick={() => {
                // TODO: Implement Facebook OAuth
                console.log("Facebook login clicked");
              }}
            >
              <div className="w-4 h-4 md:w-5 md:h-5 bg-[#1877F2] rounded flex items-center justify-center text-white font-bold text-xs">
                f
              </div>
              <span className="text-xs md:text-sm">الدخول باستخدام فيسبوك</span>
            </Button>

            {/* Google Button - Right */}
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 md:h-12 rounded-xl border border-[#E0E6F1] hover:bg-[#F9FAFB] font-montserrat-regular text-[#2e2e2e] flex items-center justify-center gap-2 bg-white text-xs md:text-sm"
              onClick={() => {
                // TODO: Implement Google OAuth
                console.log("Google login clicked");
              }}
            >
              <div className="w-4 h-4 md:w-5 md:h-5 bg-gradient-to-br from-[#4285F4] to-[#34A853] rounded flex items-center justify-center text-white font-bold text-xs">
                G
              </div>
              <span className="text-xs md:text-sm">الدخول باستخدام Google</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
