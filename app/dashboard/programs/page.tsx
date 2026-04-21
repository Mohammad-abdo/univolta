"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiDelete } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { canAccess, type UserRole } from "@/lib/permissions";
import { API_BASE_URL } from "@/lib/constants";
import {
  Plus, Edit2, Trash2, Eye, Search, RefreshCw,
  BookOpen, Clock, Globe, DollarSign, GraduationCap,
  ChevronLeft, ChevronRight, Building2, CheckCircle, XCircle,
} from "lucide-react";

interface Program {
  id: string;
  name: string;
  slug: string;
  degree?: string;
  duration?: string;
  language?: string;
  tuition?: string;
  isActive: boolean;
  university: {
    name: string;
    admissionStatus?: "OPEN" | "CLOSED";
    admissionStartDate?: string | null;
    admissionDeadline?: string | null;
  };
}

const DEGREE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  bachelor:      { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  master:        { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  phd:           { bg: "bg-rose-50",   text: "text-rose-700",   border: "border-rose-200" },
  doctorate:     { bg: "bg-rose-50",   text: "text-rose-700",   border: "border-rose-200" },
  diploma:       { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  certificate:   { bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200" },
};

const DEGREE_GRADIENT: Record<string, string> = {
  bachelor:    "from-blue-500 to-indigo-600",
  master:      "from-purple-500 to-violet-600",
  phd:         "from-rose-500 to-pink-600",
  doctorate:   "from-rose-500 to-pink-600",
  diploma:     "from-amber-500 to-orange-600",
  certificate: "from-teal-500 to-emerald-600",
};

function getDegreeKey(degree?: string) {
  const d = (degree ?? "").toLowerCase();
  for (const k of Object.keys(DEGREE_STYLES)) { if (d.includes(k)) return k; }
  return null;
}

const PAGE_SIZE = 12;

export default function ProgramsPage() {
  const [programs,     setPrograms]     = useState<Program[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [userRole,     setUserRole]     = useState<UserRole | null>(null);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [degreeFilter, setDegreeFilter] = useState("all");
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
      fetchPrograms();
    };
    init();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const data = await apiGet<Program[]>("/programs");
      setPrograms(data);
    } catch { showToast.error("Failed to load programs"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this program? This cannot be undone.")) return;
    try {
      await apiDelete(`/programs/${id}`);
      showToast.success("Program deleted");
      fetchPrograms();
    } catch (e: any) { showToast.error(e.message || "Delete failed"); }
  };

  const degrees = Array.from(new Set(programs.map((p) => p.degree).filter(Boolean))) as string[];

  const filtered = programs.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.university?.name?.toLowerCase().includes(q) || p.degree?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || String(p.isActive) === statusFilter;
    const matchDegree = degreeFilter === "all" || p.degree === degreeFilter;
    return matchSearch && matchStatus && matchDegree;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const active     = programs.filter((p) => p.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#065f46] via-[#047857] to-[#0284c7] rounded-2xl p-6 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #34d399 0%, transparent 50%), radial-gradient(circle at 80% 20%, #38bdf8 0%, transparent 50%)" }} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center">
              <BookOpen size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Programs</h1>
              <p className="text-emerald-200 text-sm mt-0.5">Manage all academic programs</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{programs.length}</p>
              <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">Total</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{active}</p>
              <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">Active</p>
            </div>
            {userRole && canAccess(userRole, "programs", "create") && (
              <Link
                href="/dashboard/programs/add"
                className="inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 active:scale-95 font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <Plus size={16} /> Add Program
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
            placeholder="Search programs, university, degree…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="all">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        {degrees.length > 0 && (
          <select
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
            value={degreeFilter}
            onChange={(e) => { setDegreeFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Degrees</option>
            {degrees.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
        <button onClick={fetchPrograms} className="w-10 h-10 border border-gray-200 bg-white rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
          <RefreshCw size={14} className={`text-gray-500 ${loading ? "animate-spin" : ""}`} />
        </button>
        {filtered.length !== programs.length && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
            {filtered.length} of {programs.length} shown
          </span>
        )}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-20 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : paged.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
            <BookOpen size={24} className="text-gray-300" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-600">No programs found</p>
            <p className="text-sm text-gray-400 mt-1">{search ? "Try a different search" : "Add your first program to get started"}</p>
          </div>
          {!search && userRole && canAccess(userRole, "programs", "create") && (
            <Link href="/dashboard/programs/add"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all">
              <Plus size={16} /> Add Program
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paged.map((prog) => {
            const dk = getDegreeKey(prog.degree);
            const grad = dk ? DEGREE_GRADIENT[dk] : "from-gray-400 to-gray-600";
            const dStyle = dk ? DEGREE_STYLES[dk] : { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" };
            return (
              <div key={prog.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                {/* Top banner */}
                <div className={`relative h-20 bg-gradient-to-br ${grad} flex items-center justify-between px-4`}>
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl flex items-center justify-center">
                    <GraduationCap size={18} className="text-white" />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm ${
                    prog.isActive ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"
                  }`}>
                    {prog.isActive ? <CheckCircle size={9} /> : <XCircle size={9} />}
                    {prog.isActive ? "Active" : "Inactive"}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                  {/* Degree badge */}
                  {prog.degree && (
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${dStyle.bg} ${dStyle.text} ${dStyle.border}`}>
                      {prog.degree}
                    </span>
                  )}
                  <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">{prog.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Building2 size={10} className="text-gray-400 shrink-0" />
                    <span className="truncate">{prog.university?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                        prog.university?.admissionStatus === "OPEN"
                          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                          : "text-rose-700 bg-rose-50 border-rose-200"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${prog.university?.admissionStatus === "OPEN" ? "bg-emerald-500" : "bg-rose-500"}`} />
                      {prog.university?.admissionStatus === "OPEN" ? "Admission Open" : "Admission Closed"}
                    </span>
                    {prog.university?.admissionDeadline && (
                      <span className="text-[10px] text-gray-400">
                        {new Date(prog.university.admissionDeadline).toLocaleDateString("en-US")}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {prog.duration && (
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-lg">
                        <Clock size={10} /> {prog.duration}
                      </div>
                    )}
                    {prog.language && (
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-lg">
                        <Globe size={10} /> {prog.language}
                      </div>
                    )}
                    {prog.tuition && (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg font-medium">
                        <DollarSign size={10} /> {prog.tuition}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer actions */}
                <div className="px-4 pb-4 flex items-center gap-2">
                  <Link href={`/dashboard/programs/${prog.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 text-xs font-semibold transition-all">
                    <Eye size={13} /> View
                  </Link>
                  {userRole && canAccess(userRole, "programs", "update") && (
                    <Link href={`/dashboard/programs/${prog.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-all">
                      <Edit2 size={13} /> Edit
                    </Link>
                  )}
                  {userRole && canAccess(userRole, "programs", "delete") && (
                    <button
                      onClick={() => handleDelete(prog.id)}
                      className="w-8 h-8 rounded-xl border border-gray-200 text-gray-400 hover:border-red-300 hover:text-white hover:bg-red-500 flex items-center justify-center transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${p === page ? "bg-emerald-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
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
