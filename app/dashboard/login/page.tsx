"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";
import { showToast } from "@/lib/toast";

export default function DashboardLoginPage() {
  const [email, setEmail] = useState("admin@univolta.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // Check if user is already authenticated and redirect
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (typeof window === "undefined") {
          setCheckingAuth(false);
          return;
        }

        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          setCheckingAuth(false);
          return;
        }

        // Verify token is valid
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          const role = userData.role?.toLowerCase();
          const isPartnerUser = !!userData.universityId;
          const isUniversityRole = role === "university";

          // If user is authenticated and has proper role, redirect to dashboard
          if (role === "admin" || role === "editor" || role === "university" || isPartnerUser) {
            // Redirect university users to partner dashboard
            if (role === "university" || isPartnerUser) {
              router.push("/dashboard/partner");
            } else {
              router.push("/dashboard");
            }
            return;
          }
        }

        // Token is invalid, clear it
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } catch (error) {
        // Error checking auth, clear tokens
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

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
        const errorMessage = data.message || data.error || `Login failed (${response.status})`;
        showToast.error(errorMessage);
        setError(errorMessage);
        setLoading(false);
        return;
      }

      const data = await response.json();

      const role = data.user?.role?.toLowerCase();
      // Allow admin, editor, and university users to access dashboard
      if (role === "admin" || role === "editor" || role === "university" || data.user?.universityId) {
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        
        showToast.success(`Welcome back, ${data.user?.name || "User"}!`);
        
        // Redirect university users to partner dashboard
        if (role === "university" || data.user?.universityId) {
          router.push("/dashboard/partner");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      } else {
        const errorMsg = "Access denied. Admin, Editor, or University privileges required.";
        showToast.error(errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      const errorMsg = "An error occurred. Please try again.";
      showToast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-montserrat-bold text-[#121c67] mb-6 text-center">
          Dashboard Login
        </h1>

        {/* Credentials Display */}
        <div className="space-y-4 mb-6">
          {/* Admin Credentials */}
          <div className="bg-[rgba(82,96,206,0.1)] border border-[#5260ce] rounded-lg p-4">
            <h3 className="font-montserrat-semibold text-[#121c67] mb-2 text-sm">
              Admin Credentials:
            </h3>
            <div className="space-y-1 text-sm font-montserrat-regular">
              <div className="flex gap-2">
                <span className="text-[#65666f]">Email:</span>
                <span className="text-[#121c67] font-montserrat-semibold">admin@univolta.com</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#65666f]">Password:</span>
                <span className="text-[#121c67] font-montserrat-semibold">admin123</span>
              </div>
            </div>
          </div>

          {/* University Credentials */}
          <div className="bg-[rgba(117,211,247,0.1)] border border-[#75d3f7] rounded-lg p-4">
            <h3 className="font-montserrat-semibold text-[#121c67] mb-2 text-sm">
              University Control Panel Credentials:
            </h3>
            <p className="text-xs text-[#65666f] mb-2 font-montserrat-regular">
              University administrators can manage their programs, students, payments, and reports
            </p>
            <div className="space-y-2 text-xs font-montserrat-regular">
              <div>
                <span className="text-[#65666f]">Stanford:</span>
                <span className="text-[#121c67] font-montserrat-semibold ml-2">admin@stanforduniversity.univolta.com</span>
                <span className="text-[#65666f] ml-2">/ university123</span>
              </div>
              <div>
                <span className="text-[#65666f]">Harvard:</span>
                <span className="text-[#121c67] font-montserrat-semibold ml-2">admin@harvarduniversity.univolta.com</span>
                <span className="text-[#65666f] ml-2">/ university123</span>
              </div>
              <div>
                <span className="text-[#65666f]">Oxford:</span>
                <span className="text-[#121c67] font-montserrat-semibold ml-2">admin@universityofoxford.univolta.com</span>
                <span className="text-[#65666f] ml-2">/ university123</span>
              </div>
              <div>
                <span className="text-[#65666f]">Sorbonne:</span>
                <span className="text-[#121c67] font-montserrat-semibold ml-2">admin@sorbonneuniversity.univolta.com</span>
                <span className="text-[#65666f] ml-2">/ university123</span>
                <span className="text-red-500 text-xs ml-2">(Note: no hyphen in email)</span>
              </div>
              <div>
                <span className="text-[#65666f]">Singapore (NUS):</span>
                <span className="text-[#121c67] font-montserrat-semibold ml-2">admin@nussingapore.univolta.com</span>
                <span className="text-[#65666f] ml-2">/ university123</span>
              </div>
              <div>
                <span className="text-[#65666f]">Tokyo:</span>
                <span className="text-[#121c67] font-montserrat-semibold ml-2">admin@universityoftokyo.univolta.com</span>
                <span className="text-[#65666f] ml-2">/ university123</span>
              </div>
              <div>
                <span className="text-[#65666f]">Toronto:</span>
                <span className="text-[#121c67] font-montserrat-semibold ml-2">admin@universityoftoronto.univolta.com</span>
                <span className="text-[#65666f] ml-2">/ university123</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
          </div>
          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
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
          {error && (
            <div className="text-red-500 text-sm font-montserrat-regular">
              {error}
            </div>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold h-[52px] rounded-xl"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
