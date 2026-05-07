"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPatch } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { canAccess, type UserRole } from "@/lib/permissions";
import { API_BASE_URL } from "@/lib/constants";
import {
  Search, RefreshCw, Eye, FileText, Clock, CheckCircle,
  XCircle, AlertCircle, DollarSign, Building2, BookOpen,
  Mail, Phone, ChevronLeft, ChevronRight, User,
} from "lucide-react";
import { t } from "@/lib/i18n";

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  status: "PENDING" | "REVIEW" | "APPROVED" | "REJECTED";
  notes?: string;
  createdAt: string;
  university?: { name: string };
  program?: { name: string };
  paymentStatus?: string;
  totalFee?: number;
}

const STATUS_CONFIG = {
  PENDING:  { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: <Clock      size={12} />, dot: "bg-amber-400",   label: t("pending")  },
  REVIEW:   { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    icon: <AlertCircle size={12} />, dot: "bg-blue-400",   label: t("review")   },
  APPROVED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: <CheckCircle size={12} />, dot: "bg-emerald-400", label: t("approved") },
  REJECTED: { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     icon: <XCircle    size={12} />, dot: "bg-red-400",    label: t("rejected") },
};

const PAYMENT_CONFIG: Record<string, { bg: string; text: string }> = {
  paid:      { bg: "bg-emerald-100", text: "text-emerald-700" },
  completed: { bg: "bg-emerald-100", text: "text-emerald-700" },
  failed:    { bg: "bg-red-100",     text: "text-red-700" },
  pending:   { bg: "bg-amber-100",   text: "text-amber-700" },
};

const AVATAR_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
];

const PAGE_SIZE = 12;

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [userRole,     setUserRole]     = useState<UserRole | null>(null);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page,         setPage]         = useState(1);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) { const d = await res.json(); setUserRole(d.role?.toLowerCase() as UserRole); }
        }
      } catch { /* silent */ }
      fetchApplications();
    };
    init();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await apiGet<Application[]>("/applications");
      setApplications(Array.isArray(data) ? data : []);
    } catch (e: any) { showToast.error(e.message || t("failedToLoadApplications") || "Failed to load applications"); setApplications([]); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: Application["status"]) => {
    try {
      await apiPatch(`/applications/${id}/status`, { status });
      showToast.success(t("statusUpdated") || "Status updated");
      fetchApplications();
    } catch (e: any) { showToast.error(e.message || t("failedToUpdateStatus") || "Failed to update status"); }
  };

  const counts = {
    all:      applications.length,
    PENDING:  applications.filter((a) => a.status === "PENDING").length,
    REVIEW:   applications.filter((a) => a.status === "REVIEW").length,
    APPROVED: applications.filter((a) => a.status === "APPROVED").length,
    REJECTED: applications.filter((a) => a.status === "REJECTED").length,
  };

  const filtered = applications.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.fullName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
      || a.university?.name?.toLowerCase().includes(q) || a.program?.name?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const avatarGrad = (name: string) => AVATAR_GRADIENTS[(name?.charCodeAt(0) ?? 0) % AVATAR_GRADIENTS.length];
  const initials   = (name: string) => name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#581c87] via-[#6d28d9] to-[#4f46e5] rounded-2xl p-6 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #c084fc 0%, transparent 50%), radial-gradient(circle at 80% 20%, #818cf8 0%, transparent 50%)" }} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center">
              <FileText size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{t("applications")}</h1>
              <p className="text-purple-300 text-sm mt-0.5">{t("applicationsSubtitle") || "Review and manage student applications"}</p>
            </div>
          </div>
          {/* Stats */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["PENDING", "REVIEW", "APPROVED", "REJECTED"] as const).map((s) => {
              const cfg = STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(statusFilter === s ? "all" : s); setPage(1); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all border ${
                    statusFilter === s ? "bg-white text-gray-800 border-white" : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${statusFilter === s ? "bg-gray-100 text-gray-700" : "bg-white/20"}`}>
                    {counts[s]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t("total") || "Total",    value: counts.all,      icon: <FileText size={18} />,   from: "from-[#5260ce]", to: "to-[#7c3aed]" },
            { label: t("pending"),  value: counts.PENDING,  icon: <Clock size={18} />,       from: "from-amber-500",  to: "to-orange-600" },
            { label: t("approved"), value: counts.APPROVED, icon: <CheckCircle size={18} />, from: "from-emerald-500", to: "to-teal-600" },
            { label: t("rejected"), value: counts.REJECTED, icon: <XCircle size={18} />,     from: "from-red-500",    to: "to-rose-600" },
          ].map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.from} ${s.to} rounded-2xl p-4 text-white shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{s.label}</p>
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">{s.icon}</div>
            </div>
            <p className="text-3xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
            placeholder={t("searchApplications")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl">
          {[
            { v: "all", label: t("all") || "All" },
            { v: "PENDING",  label: t("pending") },
            { v: "REVIEW",   label: t("review") },
            { v: "APPROVED", label: t("approved") },
            { v: "REJECTED", label: t("rejected") },
          ].map((f) => (
            <button key={f.v}
              onClick={() => { setStatusFilter(f.v); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === f.v ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              {f.label}{f.v !== "all" && ` (${counts[f.v as keyof typeof counts]})`}
            </button>
          ))}
        </div>
        <button onClick={fetchApplications} className="w-10 h-10 border border-gray-200 bg-white rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
          <RefreshCw size={14} className={`text-gray-500 ${loading ? "animate-spin" : ""}`} />
        </button>
        {filtered.length !== applications.length && (
          <span className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full">
            {filtered.length} of {applications.length} shown
          </span>
        )}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : paged.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
            <FileText size={24} className="text-gray-300" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-600">{t("noApplicationsFound")}</p>
            <p className="text-sm text-gray-400 mt-1">{search ? t("tryDifferentSearch") : t("noApplicationsSubmittedYet")}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map((app) => {
            const sc = STATUS_CONFIG[app.status];
            const pc = app.paymentStatus ? (PAYMENT_CONFIG[app.paymentStatus.toLowerCase()] ?? { bg: "bg-gray-100", text: "text-gray-600" }) : null;
            return (
              <div key={app.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                {/* Colored top strip based on status */}
                <div className={`h-1.5 w-full ${
                  app.status === "APPROVED" ? "bg-emerald-500" :
                  app.status === "REJECTED" ? "bg-red-500" :
                  app.status === "REVIEW"   ? "bg-blue-500" : "bg-amber-500"
                }`} />

                <div className="p-5 space-y-4">
                  {/* Applicant info */}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGrad(app.fullName)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                      {initials(app.fullName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{app.fullName}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <Mail size={10} />
                        <span className="truncate">{app.email}</span>
                      </div>
                      {app.phone && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Phone size={10} />
                          <span>{app.phone}</span>
                        </div>
                      )}
                    </div>
                    {/* Status badge */}
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border shrink-0 ${sc.bg} ${sc.text} ${sc.border}`}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>

                  {/* Program / University */}
                  <div className="space-y-1.5">
                    {app.university?.name && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <Building2 size={11} className="text-gray-400 shrink-0" />
                        <span className="truncate font-medium">{app.university.name}</span>
                      </div>
                    )}
                    {app.program?.name && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <BookOpen size={11} className="text-gray-400 shrink-0" />
                        <span className="truncate">{app.program.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {pc && app.paymentStatus && (
                        <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${pc.bg} ${pc.text}`}>
                          <DollarSign size={9} /> {app.paymentStatus}
                        </span>
                      )}
                      {app.totalFee && (
                        <span className="text-[10px] text-gray-500">${Number(app.totalFee).toLocaleString()}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                    <Link href={`/dashboard/applications/${app.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 text-xs font-semibold transition-all">
                      <Eye size={13} /> {t("viewDetails")}
                    </Link>
                    {userRole && canAccess(userRole, "applications", "update") && (
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value as Application["status"])}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 border border-gray-200 rounded-xl px-2 py-2 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white cursor-pointer hover:border-purple-300 transition-all"
                      >
                        <option value="PENDING">{t("pending")}</option>
                        <option value="REVIEW">{t("review")}</option>
                        <option value="APPROVED">{t("approved")}</option>
                        <option value="REJECTED">{t("rejected")}</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-gray-500 font-medium">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
              className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center transition-colors">
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${p === page ? "bg-[#6d28d9] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}
              className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
