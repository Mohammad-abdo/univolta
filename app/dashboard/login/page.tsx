"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ShieldCheck, ChevronRight, Loader2, AlertCircle, GraduationCap, Users, Edit3 } from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";
import { showToast } from "@/lib/toast";

const ROLES = [
  {
    key: "admin",
    icon: <ShieldCheck size={16} />,
    label: "Admin",
    email: "admin@univolta.com",
    password: "admin123",
    color: "from-violet-500 to-indigo-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    dot: "bg-violet-500",
  },
  {
    key: "editor",
    icon: <Edit3 size={16} />,
    label: "Editor",
    email: "editor@univolta.com",
    password: "user123",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  {
    key: "university",
    icon: <GraduationCap size={16} />,
    label: "University",
    email: "admin@cairouniversity.univolta.com",
    password: "university123",
    color: "from-sky-500 to-cyan-500",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    dot: "bg-sky-400",
  },
];

export default function DashboardLoginPage() {
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeRole,   setActiveRole]   = useState<string | null>(null);
  const router = useRouter();

  /* ── Auth check ─────────────────────────────────────────────────── */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const user = await res.json();
          const role = user.role?.toLowerCase();
          const isAdminAreaUser = role === "admin" || role === "editor";
          const isUniversityAreaUser = role === "university" || !!user.universityId;

          // Only redirect users that belong to admin/university sections.
          // Student users must stay on this login page and should not be redirected.
          if (isAdminAreaUser || isUniversityAreaUser) {
            router.push(isUniversityAreaUser ? "/dashboard/partner" : "/dashboard");
            return;
          }
        }
        // Only clear tokens when backend says token is invalid.
        if (res.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      } catch { /* silent */ }
      finally { setCheckingAuth(false); }
    };
    checkAuth();
  }, [router]);

  /* ── Quick-fill role ─────────────────────────────────────────────── */
  const selectRole = (r: typeof ROLES[0]) => {
    setActiveRole(r.key);
    setEmail(r.email);
    setPassword(r.password);
    setError("");
  };

  /* ── Submit ──────────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg  = data.message || data.error || `Login failed (${res.status})`;
        setError(msg);
        showToast.error(msg);
        return;
      }

      const data = await res.json();
      const role = data.user?.role?.toLowerCase();

      if (role === "admin" || role === "editor" || role === "university" || data.user?.universityId) {
        localStorage.setItem("accessToken",  data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        showToast.success(`Welcome back, ${data.user?.name || "User"}!`);
        router.push(role === "university" || data.user?.universityId ? "/dashboard/partner" : "/dashboard");
        router.refresh();
      } else {
        const msg = "Access denied. Admin, Editor, or University role required.";
        setError(msg);
        showToast.error(msg);
      }
    } catch {
      const msg = "Connection error. Please try again.";
      setError(msg);
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading screen ──────────────────────────────────────────────── */
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0c29]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0a0818]">
      {/* ── Left panel ────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1d4ed8] p-12">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.15) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-violet-600/30 blur-[80px]" />
        <div className="absolute bottom-[-80px] left-[-80px] w-[350px] h-[350px] rounded-full bg-indigo-500/20 blur-[80px]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="text-white font-extrabold text-xl tracking-tight">UniVolta</span>
          <span className="text-white/40 text-xs border border-white/20 px-2 py-0.5 rounded-full font-medium">Admin</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
          {/* Big icon */}
          <div className="w-28 h-28 rounded-[32px] bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center mb-8 shadow-2xl">
            <ShieldCheck size={52} className="text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Management<br />
            <span className="text-indigo-300">Control Center</span>
          </h2>
          <p className="text-white/50 text-base max-w-xs leading-relaxed">
            Manage universities, programs, applications and all platform content from one place.
          </p>

          {/* Stats row */}
          <div className="flex gap-6 mt-10">
            {[
              { label: "Universities", value: "50+" },
              { label: "Programs",     value: "500+" },
              { label: "Applications", value: "10k+" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-white/40 text-xs font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-white/20 text-xs text-center">
          © {new Date().getFullYear()} UniVolta — Secure Admin Portal
        </p>
      </div>

      {/* ── Right panel (form) ────────────────────────────────────── */}
      <div className="flex flex-col justify-center w-full lg:max-w-[520px] px-6 sm:px-10 py-12 bg-[#0a0818] relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-indigo-900/40 blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-[400px] mx-auto">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="text-white font-extrabold text-lg">UniVolta Admin</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white leading-tight">Sign in</h1>
            <p className="text-white/40 text-sm mt-1.5">Enter your credentials to access the dashboard</p>
          </div>

          {/* Role quick-select */}
          <div className="mb-7">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Quick select role</p>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => selectRole(r)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 ${
                    activeRole === r.key
                      ? `${r.bg} ${r.border} ${r.text} scale-[1.03] shadow-lg`
                      : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeRole === r.key ? `bg-gradient-to-br ${r.color} text-white shadow-sm` : "bg-white/10"
                  }`}>
                    {r.icon}
                  </div>
                  <span className="text-[11px] font-bold">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setActiveRole(null); }}
                  required
                  autoComplete="email"
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm leading-snug">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 active:scale-[0.98] text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-900/50 mt-2"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Signing in…</>
              ) : (
                <>Sign In <ChevronRight size={16} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/20 text-xs font-medium">credentials reference</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Credentials info cards */}
          <div className="space-y-2.5">
            {ROLES.map((r) => (
              <div key={r.key} className="bg-white/[0.03] border border-white/8 rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${r.color} flex items-center justify-center text-white`}>
                    {r.icon}
                  </div>
                  <span className="text-white/60 text-xs font-bold uppercase tracking-wide">{r.label}</span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-white/40 text-[11px]">
                    <span className="text-white/25">Email: </span>
                    <span className="text-white/50 font-mono">{r.email}</span>
                  </p>
                  <p className="text-white/40 text-[11px]">
                    <span className="text-white/25">Pass: </span>
                    <span className="text-white/50 font-mono">{r.password}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom note */}
          <p className="text-center text-white/20 text-xs mt-8">
            UniVolta Admin Portal — Internal use only
          </p>
        </div>
      </div>
    </div>
  );
}
