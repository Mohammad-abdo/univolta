/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StudentHeader } from "@/components/student-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
import { getLanguage, t, type Language } from "@/lib/i18n";
import { getImageUrl } from "@/lib/image-utils";
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  GraduationCap,
  ArrowRight,
  Search,
  SlidersHorizontal,
  RotateCw,
} from "lucide-react";

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  status: "PENDING" | "REVIEW" | "APPROVED" | "REJECTED";
  notes?: string;
  createdAt: string;
  university?: { id: string; name: string; slug: string; logoUrl?: string };
  program?: { id: string; name: string; slug: string; degree?: string };
  applicationFee?: number;
  additionalFee?: number;
  totalFee?: number;
  paymentStatus?: string;
  payment?: { id: string; paymentStatus: string; paidAt?: string; amount?: number; currency?: string };
}

const statusConfig = {
  PENDING:  { icon: Clock,        color: "bg-yellow-50 text-yellow-700 border-yellow-200", borderClass: "app-card-pending",  dot: "bg-yellow-400",  label: "" },
  REVIEW:   { icon: FileText,     color: "bg-blue-50 text-blue-700 border-blue-200",       borderClass: "app-card-review",   dot: "bg-blue-500",    label: "" },
  APPROVED: { icon: CheckCircle,  color: "bg-green-50 text-green-700 border-green-200",    borderClass: "app-card-approved", dot: "bg-green-500",   label: "" },
  REJECTED: { icon: XCircle,      color: "bg-red-50 text-red-600 border-red-200",          borderClass: "app-card-rejected", dot: "bg-red-500",     label: "" },
};

export default function MyApplicationsPage() {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);
  const isRTL = mounted && currentLang === "ar";
  const tl = (key: string, fallback: string) => {
    const v = t(key, currentLang);
    return v === key ? fallback : v;
  };

  const [user, setUser] = useState<{ id: string; name: string; email: string; profile?: { avatarUrl?: string } } | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | Application["status"]>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "PAID" | "UNPAID">("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST" | "UNIVERSITY">("NEWEST");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
    setCurrentLang(getLanguage());
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) { router.replace("/login?redirect=%2Fmy-applications"); return; }
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.replace("/login?redirect=%2Fmy-applications");
        return;
      }
      if (response.ok) setUser(await response.json());
      fetchApplications();
    } catch {
      fetchApplications();
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Application[]>("/applications");
      setApplications(Array.isArray(data) ? data : []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Populate labels after statusConfig is defined
  statusConfig.PENDING.label = tl("pendingReview", "Pending Review");
  statusConfig.REVIEW.label = tl("underReview", "Under Review");
  statusConfig.APPROVED.label = tl("approved", "Approved");
  statusConfig.REJECTED.label = tl("rejected", "Rejected");

  const filteredApplications = useMemo(() => {
    let list = [...applications];

    if (statusFilter !== "ALL") {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (paymentFilter !== "ALL") {
      list = list.filter((a) => {
        const paid = (a.payment?.paymentStatus || a.paymentStatus || "").toLowerCase();
        return paymentFilter === "PAID"
          ? paid === "completed" || paid === "paid"
          : !(paid === "completed" || paid === "paid");
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        (a.university?.name || "").toLowerCase().includes(q) ||
        (a.program?.name || "").toLowerCase().includes(q) ||
        (a.program?.degree || "").toLowerCase().includes(q) ||
        (statusConfig[a.status]?.label || "").toLowerCase().includes(q)
      );
    }

    if (sortBy === "NEWEST") {
      list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    } else if (sortBy === "OLDEST") {
      list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    } else {
      list.sort((a, b) => (a.university?.name || "").localeCompare(b.university?.name || ""));
    }

    return list;
  }, [applications, paymentFilter, search, sortBy, statusFilter]);

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "PENDING" || a.status === "REVIEW").length,
    accepted: applications.filter((a) => a.status === "APPROVED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] pb-20 md:pb-0" dir={isRTL ? "rtl" : "ltr"}>
      <StudentHeader user={user} onLogout={handleLogout} activePage="applications" />
      <main className="pt-[64px] pb-8 md:pb-20">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-7">
          <div className="mb-6 rounded-3xl bg-gradient-to-r from-[#5260ce] to-[#78B5F8] p-6 md:p-7 text-white shadow-[0_14px_42px_rgba(82,96,206,0.28)]">
            <h1 className="font-montserrat-bold text-2xl md:text-3xl">
              {tl("myApplications", "My Applications")}
            </h1>
            <p className="text-white/90 mt-1 text-sm md:text-base">
              {tl("trackStatus", "Track the status of your university applications")}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title={tl("totalApplications", "Total Applications")} value={stats.total} color="text-[#5260ce]" />
            <StatCard title={tl("pendingReview", "Pending Review")} value={stats.pending} color="text-yellow-600" />
            <StatCard title={tl("approved", "Approved")} value={stats.accepted} color="text-green-600" />
            <StatCard title={tl("rejected", "Rejected")} value={stats.rejected} color="text-red-600" />
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
              <div className="xl:col-span-2 relative">
                <Search className={`w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-3" : "left-3"}`} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={tl("searchApplications", "Search by university, program, or status...")}
                  className={`w-full h-10 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#5260ce] ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "ALL" | Application["status"])}
                className="h-10 rounded-xl border border-gray-200 bg-white text-sm px-3"
              >
                <option value="ALL">{tl("allStatus", "All Status")}</option>
                <option value="PENDING">{tl("pendingReview", "Pending Review")}</option>
                <option value="REVIEW">{tl("underReview", "Under Review")}</option>
                <option value="APPROVED">{tl("approved", "Approved")}</option>
                <option value="REJECTED">{tl("rejected", "Rejected")}</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as "ALL" | "PAID" | "UNPAID")}
                className="h-10 rounded-xl border border-gray-200 bg-white text-sm px-3"
              >
                <option value="ALL">{tl("payments", "Payments")}: {currentLang === "ar" ? "الكل" : "All"}</option>
                <option value="PAID">{tl("completed", "Completed")}</option>
                <option value="UNPAID">{tl("pending", "Pending")}</option>
              </select>

              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "NEWEST" | "OLDEST" | "UNIVERSITY")}
                  className="h-10 rounded-xl border border-gray-200 bg-white text-sm px-3 flex-1"
                >
                  <option value="NEWEST">{tl("date", "Date")}: {currentLang === "ar" ? "الأحدث" : "Newest"}</option>
                  <option value="OLDEST">{tl("date", "Date")}: {currentLang === "ar" ? "الأقدم" : "Oldest"}</option>
                  <option value="UNIVERSITY">{tl("university", "University")}: {currentLang === "ar" ? "أ-ي" : "A-Z"}</option>
                </select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setPaymentFilter("ALL");
                    setSortBy("NEWEST");
                    setSearch("");
                  }}
                  className="h-10 rounded-xl border-gray-200"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-[#8b8c9a]">
                {filteredApplications.length} {tl("results", "results")}
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs text-[#8b8c9a]">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {tl("filter", "Filter")}
              </div>
            </div>
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-44 rounded-2xl bg-white border border-gray-100 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && filteredApplications.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 md:p-16 text-center">
              <div className="w-20 h-20 rounded-full bg-[#f0f4ff] flex items-center justify-center mx-auto mb-5">
                <GraduationCap className="w-10 h-10 text-[#5260ce]/50" />
              </div>
              <h3 className="font-montserrat-bold text-xl text-[#121c67] mb-2">{tl("noApplications", "No Applications Yet")}</h3>
              <p className="text-[#65666f] text-sm font-montserrat-regular mb-6 max-w-xs mx-auto">{tl("startJourney", "Start your journey by applying to a university program")}</p>
              <Button className="bg-[#5260ce] hover:bg-[#4350b0] text-white rounded-xl px-6 shadow-[0_4px_16px_rgba(82,96,206,0.25)]" asChild>
                <Link href="/universities" className="flex items-center gap-2">
                  {tl("browseUniversities", "Browse Universities")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          )}

          {!loading && filteredApplications.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredApplications.map((app) => {
                const cfg = statusConfig[app.status];
                const StatusIcon = cfg.icon;
                const paid = (app.payment?.paymentStatus || app.paymentStatus || "").toLowerCase();
                const isPaid = paid === "completed" || paid === "paid";
                const logo = getImageUrl(app.university?.logoUrl || "");
                return (
                  <div key={app.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300 ${cfg.borderClass}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-montserrat-semibold ${cfg.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border ${isPaid ? "border-green-200 text-green-700 bg-green-50" : "border-gray-200 text-gray-600 bg-gray-50"}`}>
                        {tl("payment", "Payment")}: {isPaid ? tl("completed", "Completed") : tl("pending", "Pending")}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      {logo ? (
                        <img src={logo} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#EEF2FF] text-[#5260ce] flex items-center justify-center font-bold text-sm">
                          {(app.university?.name || "U").charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-montserrat-bold text-base text-[#121c67] leading-tight truncate">
                          {app.program?.name || tl("program", "Program")}
                        </h3>
                        <p className="font-montserrat-regular text-sm text-[#5260ce] truncate">
                          {app.university?.name || tl("university", "University")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-[#F8FAFF] border border-gray-100 px-3 py-2">
                        <p className="text-[#8b8c9a]">{tl("date", "Date")}</p>
                        <p className="text-[#2e2e2e] font-semibold mt-0.5">
                          {new Date(app.createdAt).toLocaleDateString(currentLang === "ar" ? "ar-EG" : "en-US")}
                        </p>
                      </div>
                      <div className="rounded-lg bg-[#F8FAFF] border border-gray-100 px-3 py-2">
                        <p className="text-[#8b8c9a]">{tl("degreeLevel", "Degree")}</p>
                        <p className="text-[#2e2e2e] font-semibold mt-0.5 truncate">
                          {app.program?.degree || (currentLang === "ar" ? "—" : "—")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-xs text-[#8b8c9a]">
                        {tl("total", "Total")}:{" "}
                        <span className="font-semibold text-[#2e2e2e]">
                          ${(app.totalFee || app.applicationFee || 0).toLocaleString()}
                        </span>
                      </p>
                      <Button
                        variant="outline"
                        className="border-[#5260ce] text-[#5260ce] hover:bg-[#5260ce] hover:text-white rounded-xl transition-all duration-200 flex items-center gap-2 h-9"
                        asChild
                      >
                        <Link href={`/my-applications/${app.id}`}>
                          <Eye className="w-4 h-4" />
                          {tl("viewDetails", "View Details")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <p className="text-xs text-[#8b8c9a]">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
