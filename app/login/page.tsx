"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/constants";
import { figmaAssets } from "@/lib/figma-assets";

function LoginContent() {
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
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        if (rememberMe) localStorage.setItem("rememberMe", "true");
      }
      const redirectUrl = searchParams?.get("redirect");
      if (redirectUrl) {
        router.push(decodeURIComponent(redirectUrl));
      } else if (data.user?.role?.toLowerCase() === "admin" || data.user?.role?.toLowerCase() === "editor") {
        router.push("/dashboard");
      } else if (data.user?.role?.toLowerCase() === "university" || data.user?.universityId) {
        router.push("/dashboard/partner");
      } else {
        router.push("/profile");
      }
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen aurora-hero flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative floating orbs */}
      <div className="absolute top-16 left-10 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(82,96,206,0.18) 0%, transparent 65%)" }} />
      <div className="absolute bottom-16 right-10 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(117,211,247,0.22) 0%, transparent 65%)" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-30"
        style={{ background: "radial-gradient(circle, rgba(82,96,206,0.1) 0%, transparent 70%)" }} />

      {/* Background logo watermark */}
      <div className="hidden md:block absolute bottom-0 right-0 w-72 h-72 opacity-[0.04] pointer-events-none">
        <Image src={figmaAssets.logo} alt="" fill className="object-contain" unoptimized />
      </div>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-[480px] animate-card-enter">
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_24px_80px_rgba(82,96,206,0.18)] border border-white/60 p-7 md:p-10">

          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="relative w-36 h-[52px] mb-3">
              <Image src={figmaAssets.logo} alt="UNIVOLTA Logo" fill className="object-contain" unoptimized />
            </div>
            <div className="w-12 h-1 rounded-full bg-gradient-to-r from-[#5260ce] to-[#75d3f7]" />
          </div>

          <h2 className="text-2xl md:text-3xl font-montserrat-bold text-[#121c67] mb-1.5 text-center">
            Welcome Back
          </h2>
          <p className="text-sm font-montserrat-regular text-[#65666f] mb-7 text-center">
            Sign in to continue your academic journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block font-montserrat-semibold text-sm text-[#2e2e2e] mb-1.5">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-enhanced pr-12"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#8B8C9A]" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-montserrat-semibold text-sm text-[#2e2e2e]">Password</label>
                <Link href="/forgot-password" className="text-xs font-montserrat-regular text-[#5260ce] hover:text-[#4350b0] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-enhanced pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B8C9A] hover:text-[#65666f] focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#5260ce] border-2 border-[#E0E6F1] rounded focus:ring-2 focus:ring-[#5260ce] cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-sm font-montserrat-regular text-[#2e2e2e] cursor-pointer select-none">
                Remember me
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className={`flex items-start gap-2.5 text-sm font-montserrat-regular rounded-xl p-3.5 ${
                error.includes("pending") || error.includes("approval") || error.includes("inactive")
                  ? "bg-yellow-50 border border-yellow-200 text-yellow-800"
                  : "bg-red-50 border border-red-200 text-red-600"
              }`}>
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-base h-12 rounded-xl transition-all duration-200 shadow-[0_4px_16px_rgba(82,96,206,0.3)] hover:shadow-[0_6px_24px_rgba(82,96,206,0.4)]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Signing in...
                </span>
              ) : "Log In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-montserrat-regular">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social Login */}
          <div className="flex gap-3">
            <Button type="button" variant="outline"
              className="flex-1 h-11 rounded-xl border border-[#E0E6F1] hover:bg-[#F9FAFB] hover:border-[#5260ce]/30 font-montserrat-regular text-[#2e2e2e] flex items-center justify-center gap-2 bg-white text-xs transition-all">
              <div className="w-5 h-5 bg-[#1877F2] rounded flex items-center justify-center text-white font-bold text-xs shrink-0">f</div>
              <span className="truncate">Facebook</span>
            </Button>
            <Button type="button" variant="outline"
              className="flex-1 h-11 rounded-xl border border-[#E0E6F1] hover:bg-[#F9FAFB] hover:border-[#5260ce]/30 font-montserrat-regular text-[#2e2e2e] flex items-center justify-center gap-2 bg-white text-xs transition-all">
              <div className="w-5 h-5 bg-gradient-to-br from-[#4285F4] to-[#34A853] rounded flex items-center justify-center text-white font-bold text-xs shrink-0">G</div>
              <span className="truncate">Google</span>
            </Button>
          </div>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm font-montserrat-regular text-[#65666f]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#5260ce] hover:text-[#4350b0] font-montserrat-semibold transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen aurora-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5260ce] mx-auto" />
          <p className="mt-4 text-[#65666f] font-montserrat-regular">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
