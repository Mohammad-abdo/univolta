"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { StudentHeader } from "@/components/student-header";
import { Settings } from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";
import { getImageUrl } from "@/lib/image-utils";
import { apiGet } from "@/lib/api";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

/* ─── Types ─────────────────────────────────────────────────────── */
interface Application {
  id: string;
  status: "PENDING" | "REVIEW" | "APPROVED" | "REJECTED";
  createdAt: string;
  university?: { name: string; slug: string; logoUrl?: string; country?: string };
  program?: { name: string; degree?: string };
}
interface UserData { id: string; name: string; email: string }

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING:  { label: "Pending",      cls: "bg-orange-50  text-orange-500  border-orange-100" },
  REVIEW:   { label: "Under Review", cls: "bg-blue-50    text-blue-500    border-blue-100"   },
  APPROVED: { label: "Accepted",     cls: "bg-green-50   text-green-600   border-green-100"  },
  REJECTED: { label: "Rejected",     cls: "bg-red-50     text-red-500     border-red-100"    },
};

/* ─── Stat card config ───────────────────────────────────────────── */
const STAT_CONFIG = [
  {
    key: "total",
    label: "Total Applications",
    accent: "#5260CE",
    iconBg: "#EEF2FF",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="#5260CE" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    key: "pending",
    label: "Pending Applications",
    accent: "#F59E0B",
    iconBg: "#FFFBEB",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="#F59E0B" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <circle cx="12" cy="14" r="3" strokeWidth="1.5"/>
        <polyline points="12 13 12 14 13 14" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    key: "accepted",
    label: "Accepted Applications",
    accent: "#10B981",
    iconBg: "#ECFDF5",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="#10B981" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <polyline points="9 15 11 17 15 12" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    key: "rejected",
    label: "Rejected Applications",
    accent: "#EF4444",
    iconBg: "#FEF2F2",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="#EF4444" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="10" y1="12" x2="14" y2="16" strokeWidth="2"/>
        <line x1="14" y1="12" x2="10" y2="16" strokeWidth="2"/>
      </svg>
    ),
  },
];

/* ─── Stat Card ──────────────────────────────────────────────────── */
function StatCard({ label, value, icon, accent, iconBg }: {
  label: string; value: number; icon: React.ReactNode; accent: string; iconBg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 relative overflow-hidden">
      {/* Colored left accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full" style={{ background: accent }} />
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        {icon}
      </div>
      <div>
        <p className="text-[12px] text-[#9CA3AF] leading-tight">{label}</p>
        <p className="text-[34px] font-bold leading-none mt-0.5" style={{ color: accent }}>{value}</p>
      </div>
    </div>
  );
}

/* ─── Eye icon ──────────────────────────────────────────────────── */
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const router  = useRouter();
  const fetchedRef = useRef(false);   // prevent double-fetch in StrictMode

  const [user, setUser]         = useState<UserData | null>(null);
  const [applications, setApps] = useState<Application[]>([]);
  const [ready, setReady]       = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const token = localStorage.getItem("accessToken");
    if (!token) { router.replace("/login?redirect=%2Fprofile"); return; }

    fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (r.status === 401) {
          // Token is definitively invalid — log out
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          router.replace("/login?redirect=%2Fprofile");
          return;
        }
        if (!r.ok) {
          // Network/server error — show page anyway (don't log out)
          setReady(true);
          setLoading(false);
          return;
        }
        const userData = await r.json();
        setUser(userData);
        setReady(true);
        apiGet<Application[]>("/applications")
          .then((d) => setApps(Array.isArray(d) ? d : []))
          .catch(() => setApps([]))
          .finally(() => setLoading(false));
      })
      .catch(() => {
        // Network error — don't redirect, just show the page with cached state
        setReady(true);
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/");
  };

  /* ── Auth loading ── */
  if (!ready) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#5260ce] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#A0AEC0]">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const total    = applications.length;
  const pending  = applications.filter((a) => a.status === "PENDING" || a.status === "REVIEW").length;
  const accepted = applications.filter((a) => a.status === "APPROVED").length;
  const rejected = applications.filter((a) => a.status === "REJECTED").length;
  const statValues = { total, pending, accepted, rejected };

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      <StudentHeader user={user} onLogout={handleLogout} activePage="dashboard" />

      <main style={{ paddingTop: 64 }}>
        <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-8">

          {/* ── Welcome banner ──────────────────────────────────────── */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-[26px] md:text-[30px] font-bold text-[#1B2559] leading-tight">
                Welcome back, {user?.name?.split(" ")[0] || "Student"}! 👋
              </h1>
              <p className="text-sm text-[#A0AEC0] mt-1.5">
                Track your applications and manage your documents
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline"
                className="border-gray-200 text-[#4A5568] hover:bg-[#F0F4FF] hover:text-[#5260ce] hover:border-[#5260ce]/30 rounded-xl h-10 px-4 text-sm font-semibold flex items-center gap-2"
                asChild
              >
                <Link href="/profile/settings"><Settings className="w-4 h-4" /> Settings</Link>
              </Button>
              <Button
                className="bg-[#5260ce] hover:bg-[#4350b0] text-white rounded-xl h-10 px-5 text-sm font-semibold"
                asChild
              >
                <Link href="/universities">Browse Universities</Link>
              </Button>
            </div>
          </div>

          {/* ── Stat Cards ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {STAT_CONFIG.map((cfg) => (
              <StatCard
                key={cfg.key}
                label={cfg.label}
                value={statValues[cfg.key as keyof typeof statValues]}
                icon={cfg.icon}
                accent={cfg.accent}
                iconBg={cfg.iconBg}
              />
            ))}
          </div>

          {/* ── Recent Applications ──────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#1B2559]">Recent Applications</h2>
              {applications.length > 0 && (
                <span className="text-xs text-[#A0AEC0]">{applications.length} total</span>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-[#5260ce] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : applications.length === 0 ? (
              <div className="py-16 text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="#5260CE" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <p className="text-[#1B2559] font-semibold mb-1">No applications yet</p>
                <p className="text-[#A0AEC0] text-sm mb-5">Start your journey by browsing universities</p>
                <Button className="bg-[#5260ce] hover:bg-[#4350b0] text-white rounded-xl" asChild>
                  <Link href="/universities">Browse Universities</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-[#FAFBFF]">
                      <th className="text-left px-6 py-3 text-xs text-[#A0AEC0] font-medium">University</th>
                      <th className="text-left px-4 py-3 text-xs text-[#A0AEC0] font-medium">Program</th>
                      <th className="text-left px-4 py-3 text-xs text-[#A0AEC0] font-medium">Degree</th>
                      <th className="text-left px-4 py-3 text-xs text-[#A0AEC0] font-medium">Status</th>
                      <th className="text-left px-4 py-3 text-xs text-[#A0AEC0] font-medium">Submission date</th>
                      <th className="text-left px-4 py-3 text-xs text-[#A0AEC0] font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => {
                      const s    = STATUS[app.status] ?? STATUS.PENDING;
                      const logo = getImageUrl(app.university?.logoUrl || "");
                      return (
                        <tr key={app.id} className="border-b border-gray-50 last:border-0 hover:bg-[#FAFBFF] transition-colors group">

                          {/* University */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {logo ? (
                                <div className="relative w-9 h-9 rounded-full border border-gray-100 overflow-hidden shrink-0 bg-white">
                                  <Image src={logo} alt="" fill className="object-contain p-1" unoptimized />
                                </div>
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0 text-[#5260ce] font-bold text-xs">
                                  {app.university?.name?.charAt(0) || "U"}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-[#1B2559] text-sm">{app.university?.name || "—"}</p>
                                {app.university?.country && (
                                  <p className="text-xs text-[#A0AEC0]">{app.university.country}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Program */}
                          <td className="px-4 py-4 text-[#4A5568] text-sm max-w-[200px]">
                            <span className="line-clamp-2">{app.program?.name || "—"}</span>
                          </td>

                          {/* Degree */}
                          <td className="px-4 py-4 text-[#718096] text-sm whitespace-nowrap">{app.program?.degree || "—"}</td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
                              {s.label}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-4 py-4 text-[#718096] text-sm whitespace-nowrap">
                            {new Date(app.createdAt).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })}
                          </td>

                          {/* Action */}
                          <td className="px-4 py-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#5260ce]/30 text-[#5260ce] hover:bg-[#5260ce] hover:text-white hover:border-[#5260ce] rounded-lg text-xs h-8 px-3.5 transition-all"
                              asChild
                            >
                              <Link href={`/my-applications/${app.id}`} className="flex items-center gap-1.5">
                                <EyeIcon />
                                View Details
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
