"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Mail, User, AlertCircle } from "lucide-react";
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
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      if (data.user?.role?.toLowerCase() === "admin" || data.user?.role?.toLowerCase() === "editor") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strengthColor = password.length === 0 ? "bg-gray-200" : password.length < 6 ? "bg-red-400" : password.length < 10 ? "bg-yellow-400" : "bg-green-500";
  const strengthWidth = password.length === 0 ? "w-0" : password.length < 6 ? "w-1/3" : password.length < 10 ? "w-2/3" : "w-full";

  return (
    <div className="min-h-screen aurora-hero flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-20 right-16 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(82,96,206,0.18) 0%, transparent 65%)" }} />
      <div className="absolute bottom-20 left-16 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(117,211,247,0.22) 0%, transparent 65%)" }} />

      {/* Background watermark */}
      <div className="hidden md:block absolute top-0 left-0 w-64 h-64 opacity-[0.04] pointer-events-none">
        <Image src={figmaAssets.heroGraduationCap} alt="" fill className="object-contain" unoptimized />
      </div>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-[480px] animate-card-enter">
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_24px_80px_rgba(82,96,206,0.18)] border border-white/60 p-7 md:p-10">

          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-36 h-[52px] mb-3">
              <Image src={figmaAssets.logo} alt="UNIVOLTA Logo" fill className="object-contain" unoptimized />
            </div>
            <div className="w-12 h-1 rounded-full bg-gradient-to-r from-[#5260ce] to-[#75d3f7]" />
          </div>

          <h2 className="text-2xl md:text-3xl font-montserrat-bold text-[#121c67] mb-1.5 text-center">
            Create Account
          </h2>
          <p className="text-sm font-montserrat-regular text-[#65666f] mb-6 text-center">
            Join thousands of students finding their dream university
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block font-montserrat-semibold text-sm text-[#2e2e2e] mb-1.5">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="input-enhanced pr-12"
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#8B8C9A]" />
              </div>
            </div>

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
              <label className="block font-montserrat-semibold text-sm text-[#2e2e2e] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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
              {/* Password strength indicator */}
              <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${strengthColor} ${strengthWidth}`} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 text-sm font-montserrat-regular rounded-xl p-3.5 bg-red-50 border border-red-200 text-red-600">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-base h-12 rounded-xl transition-all duration-200 shadow-[0_4px_16px_rgba(82,96,206,0.3)] hover:shadow-[0_6px_24px_rgba(82,96,206,0.4)]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Creating account...
                </span>
              ) : "Create Account"}
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
            <Button type="button"
              className="flex-1 h-11 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-montserrat-regular flex items-center justify-center gap-2 text-sm">
              <div className="w-5 h-5 bg-white rounded flex items-center justify-center shrink-0">
                <span className="text-[#1877F2] font-bold text-sm">f</span>
              </div>
              <span>Facebook</span>
            </Button>
            <Button type="button" variant="outline"
              className="flex-1 h-11 rounded-xl border border-[#E0E6F1] hover:bg-[#F9FAFB] hover:border-[#5260ce]/30 font-montserrat-regular text-[#2e2e2e] flex items-center justify-center gap-2 bg-white text-sm">
              <div className="w-5 h-5 bg-gradient-to-br from-[#4285F4] to-[#34A853] rounded flex items-center justify-center text-white font-bold text-xs shrink-0">G</div>
              <span>Google</span>
            </Button>
          </div>

          {/* Login link */}
          <p className="mt-6 text-center text-sm font-montserrat-regular text-[#65666f]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#5260ce] hover:text-[#4350b0] font-montserrat-semibold transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
