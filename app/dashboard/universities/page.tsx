"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet, apiDelete } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { canAccess, type UserRole } from "@/lib/permissions";
import { API_BASE_URL } from "@/lib/constants";
import {
  Plus, Edit2, Trash2, Eye, Search, RefreshCw,
  GraduationCap, MapPin, Globe, ChevronLeft, ChevronRight,
  Building2, CheckCircle, XCircle,
} from "lucide-react";

interface University {
  id: string;
  name: string;
  slug: string;
  country: string;
  city: string;
  language: string;
  isActive: boolean;
}

const GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-blue-500 to-indigo-700",
  "from-emerald-500 to-teal-700",
  "from-orange-500 to-amber-700",
  "from-pink-500 to-rose-700",
  "from-cyan-500 to-sky-700",
];

const PAGE_SIZE = 12;

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [userRole,     setUserRole]     = useState<UserRole | null>(null);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [langFilter,   setLangFilter]   = useState("all");
  const [page,         setPage]         = useState(1);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) { const d = await res.json(); setUserRole(d.role?.toLowerCase() as UserRole); }
        }
      } catch { /* silent */ }
      fetchUniversities();
    };
    init();
  }, []);

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const data = await apiGet<University[]>("/universities");
      setUniversities(data);
    } catch (e: any) {
      if (e.statusCode === 401 || e.statusCode === 403) { localStorage.removeItem("accessToken"); router.push("/dashboard/login"); }
      else showToast.error("Failed to load universities");
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this university? This cannot be undone.")) return;
    try {
      await apiDelete(`/universities/${id}`);
      showToast.success("University deleted");
      fetchUniversities();
    } catch (e: any) { showToast.error(e.message || "Delete failed"); }
  };

  const languages = Array.from(new Set(universities.map((u) => u.language).filter(Boolean)));

  const filtered = universities.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.city?.toLowerCase().includes(q) || u.country?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || String(u.isActive) === statusFilter;
    const matchLang   = langFilter   === "all" || u.language === langFilter;
    return matchSearch && matchStatus && matchLang;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const active     = universities.filter((u) => u.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1d4ed8] rounded-2xl p-6 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #818cf8 0%, transparent 50%), radial-gradient(circle at 80% 20%, #38bdf8 0%, transparent 50%)" }} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Universities</h1>
              <p className="text-indigo-300 text-sm mt-0.5">Manage all partner universities</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{universities.length}</p>
              <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">Total</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{active}</p>
              <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">Active</p>
            </div>
            {userRole && canAccess(userRole, "universities", "create") && (
              <Link
                href="/dashboard/universities/add"
                className="inline-flex items-center gap-2 bg-white text-[#5260ce] hover:bg-indigo-50 active:scale-95 font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <Plus size={16} /> Add University
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
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
            placeholder="Search universities, city, country…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="all">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        {languages.length > 0 && (
          <select
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={langFilter}
            onChange={(e) => { setLangFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Languages</option>
            {languages.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        )}
        <button onClick={fetchUniversities} className="w-10 h-10 border border-gray-200 bg-white rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
          <RefreshCw size={14} className={`text-gray-500 ${loading ? "animate-spin" : ""}`} />
        </button>
        {filtered.length !== universities.length && (
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
            {filtered.length} of {universities.length} shown
          </span>
        )}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-24 bg-gray-200" />
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
            <Building2 size={24} className="text-gray-300" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-600">No universities found</p>
            <p className="text-sm text-gray-400 mt-1">{search ? "Try a different search" : "Add your first university to get started"}</p>
          </div>
          {!search && userRole && canAccess(userRole, "universities", "create") && (
            <Link href="/dashboard/universities/add"
              className="inline-flex items-center gap-2 bg-[#5260ce] text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#4251be] transition-all">
              <Plus size={16} /> Add University
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paged.map((uni, idx) => {
            const grad = GRADIENTS[(uni.name.charCodeAt(0) || 0) % GRADIENTS.length];
            return (
              <div key={uni.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                {/* Card top banner */}
                <div className={`relative h-24 bg-gradient-to-br ${grad} flex items-center justify-center`}>
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                    <span className="text-white font-extrabold text-lg">{initials(uni.name)}</span>
                  </div>
                  {/* Status dot */}
                  <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm ${
                    uni.isActive ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"
                  }`}>
                    {uni.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                    {uni.isActive ? "Active" : "Inactive"}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">{uni.name}</h3>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin size={11} className="text-gray-400 shrink-0" />
                      <span className="truncate">{uni.city}{uni.country ? `, ${uni.country}` : ""}</span>
                    </div>
                    {uni.language && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Globe size={11} className="text-gray-400 shrink-0" />
                        <span>{uni.language}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="px-4 pb-4 flex items-center gap-2">
                  <Link href={`/dashboard/universities/${uni.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-semibold transition-all">
                    <Eye size={13} /> View
                  </Link>
                  {userRole && canAccess(userRole, "universities", "update") && (
                    <Link href={`/dashboard/universities/${uni.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-all">
                      <Edit2 size={13} /> Edit
                    </Link>
                  )}
                  {userRole && canAccess(userRole, "universities", "delete") && (
                    <button
                      onClick={() => handleDelete(uni.id)}
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
                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${p === page ? "bg-[#5260ce] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
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
