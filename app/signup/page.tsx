"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/constants";
import { figmaAssets } from "@/lib/figma-assets";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Store tokens
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      // Redirect to home or dashboard based on role
      if (
        data.user?.role?.toLowerCase() === "admin" ||
        data.user?.role?.toLowerCase() === "editor"
      ) {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (error) {
      console.error("Signup error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative overflow-hidden py-4 md:py-8">
      {/* Background Graduation Cap Graphic - Bottom Right */}
      <div className="hidden md:block absolute bottom-0 right-0 w-64 h-64 opacity-10">
        <Image
          src={figmaAssets.heroGraduationCap}
          alt=""
          fill
          className="object-contain"
          unoptimized
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-4 md:py-8">
        <div className="bg-white w-full md:w-[600px] rounded-2xl md:rounded-3xl shadow-lg p-6 md:p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6 md:mb-8">
            <div className="relative w-16 h-16 md:w-20 md:h-20 mb-2 md:mb-3">
              <Image
                src={figmaAssets.logo}
                alt="UNIVOLTA Logo"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl md:text-3xl font-montserrat-bold text-[#2e2e2e] mb-2 text-center">
            Sign Up to UniVolta
          </h2>
          <p className="text-xs md:text-base font-montserrat-regular text-[#65666f] mb-6 md:mb-8 text-center">
            Please enter your email and password to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {/* Full Name Field */}
            <div>
              <label className="block font-montserrat-semibold text-sm text-[#2e2e2e] mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="w-full border-2 border-[#E0E6F1] rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#5260ce] focus:border-[#5260ce] font-montserrat-regular text-sm bg-white"
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B8C9A]" />
              </div>
            </div>

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
                  className="w-full border-2 border-[#E0E6F1] rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#5260ce] focus:border-[#5260ce] font-montserrat-regular text-sm bg-white"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B8C9A]" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block font-montserrat-semibold text-sm text-[#2e2e2e] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border-2 border-[#E0E6F1] rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#5260ce] focus:border-[#5260ce] font-montserrat-regular text-sm bg-white"
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

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm font-montserrat-regular text-center">
                {error}
              </div>
            )}

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-base h-14 rounded-xl"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          {/* Social Login - Horizontal Layout */}
          <div className="mt-6 flex gap-3">
            {/* Facebook Button - Left, Blue Background */}
            <Button
              type="button"
              className="flex-1 h-12 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-montserrat-regular flex items-center justify-center gap-2"
              onClick={() => {
                // TODO: Implement Facebook OAuth
                console.log("Facebook signup clicked");
              }}
            >
              <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                <span className="text-[#1877F2] font-bold text-sm">f</span>
              </div>
              <span className="text-sm">الدخول باستخدام فيسبوك</span>
            </Button>

            {/* Google Button - Right, White Background */}
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12 rounded-xl border-2 border-[#E0E6F1] hover:bg-[#F9FAFB] font-montserrat-regular text-[#2e2e2e] flex items-center justify-center gap-2 bg-white"
              onClick={() => {
                // TODO: Implement Google OAuth
                console.log("Google signup clicked");
              }}
            >
              <div className="w-5 h-5 bg-gradient-to-br from-[#4285F4] to-[#34A853] rounded flex items-center justify-center text-white font-bold text-xs">
                G
              </div>
              <span className="text-sm">الدخول باستخدام Google</span>
            </Button>
          </div>

          {/* University Registration Link */}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm font-montserrat-regular text-[#65666f]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#5260ce] hover:text-[#4350b0] font-montserrat-semibold"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
