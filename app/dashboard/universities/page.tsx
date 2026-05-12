"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet, apiDelete } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { canAccess, type UserRole } from "@/lib/permissions";
import { API_BASE_URL } from "@/lib/constants";
import { t, getLanguage } from "@/lib/i18n";
import { pickLocalized } from "@/lib/localized";
import { formatCountryLabel, formatInstructionLanguages } from "@/lib/university-program-display";
import {
  Plus, Edit2, Trash2, Eye, Search, RefreshCw,
  GraduationCap, MapPin, Globe, ChevronLeft, ChevronRight,
  Building2, CheckCircle, XCircle,
} from "lucide-react";

interface University {
  id: string;
  name: string;
  nameI18n?: unknown;
  slug: string;
  country: string;
  city: string;
  language: string;
  isActive: boolean;
  admissionStatus?: "OPEN" | "CLOSED";
  admissionStartDate?: string | null;
  admissionDeadline?: string | null;
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
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const a = parts[0][0] ?? "";
  const b = parts.length > 1 ? parts[1][0] ?? "" : (parts[0][1] ?? "");
  return (a + b).toUpperCase();
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
      else showToast.error(t("failedToLoadUniversities"));
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDeleteUniversity"))) return;
    try {
      await apiDelete(`/universities/${id}`);
      showToast.success(t("universityDeleted"));
      fetchUniversities();
    } catch (e: any) { showToast.error(e.message || t("deleteFailed")); }
  };

  const languages = Array.from(new Set(universities.map((u) => u.language).filter(Boolean)));

  const filtered = universities.filter((u) => {
    const q = search.toLowerCase().trim();
    const dispName = pickLocalized(u.nameI18n ?? u.name, getLanguage());
    const nameEn = pickLocalized(u.nameI18n ?? u.name, "en").toLowerCase();
    const nameAr = pickLocalized(u.nameI18n ?? u.name, "ar").toLowerCase();
    const city = (u.city ?? "").toLowerCase();
    const country = (u.country ?? "").toLowerCase();
    const countryAr = formatCountryLabel(u.country, "ar").toLowerCase();
    const matchSearch =
      !q ||
      nameEn.includes(q) ||
      nameAr.includes(q) ||
      dispName.toLowerCase().includes(q) ||
      city.includes(q) ||
      country.includes(q) ||
      countryAr.includes(q);
    const matchStatus = statusFilter === "all" || String(u.isActive) === statusFilter;
    const matchLang   = langFilter   === "all" || u.language === langFilter;
    return matchSearch && matchStatus && matchLang;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const active     = universities.filter((u) => u.isActive).length;
  const lang = getLanguage();
  const dateLocale = lang === "ar" ? "ar-EG" : "en-US";
  const locSep = lang === "ar" ? "، " : ", ";

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
              <h1 className="text-2xl font-extrabold tracking-tight">{t("universities")}</h1>
              <p className="text-indigo-300 text-sm mt-0.5">{t("universitiesSubtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{universities.length}</p>
              <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">{t("total")}</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{active}</p>
              <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">{t("active")}</p>
            </div>
            {userRole && canAccess(userRole, "universities", "create") && (
              <Link
                href="/dashboard/universities/add"
                className="inline-flex items-center gap-2 bg-white text-[#5260ce] hover:bg-indigo-50 active:scale-95 font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <Plus size={16} /> {t("addUniversity")}
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
            placeholder={t("searchUniversitiesDashboard")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="all">{t("allStatus")}</option>
          <option value="true">{t("active")}</option>
          <option value="false">{t("inactive")}</option>
        </select>
        {languages.length > 0 && (
          <select
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={langFilter}
            onChange={(e) => { setLangFilter(e.target.value); setPage(1); }}
          >
            <option value="all">{t("allLanguages")}</option>
            {languages.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        )}
        <button onClick={fetchUniversities} className="w-10 h-10 border border-gray-200 bg-white rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
          <RefreshCw size={14} className={`text-gray-500 ${loading ? "animate-spin" : ""}`} />
        </button>
        {filtered.length !== universities.length && (
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
            {t("dashboardFilteredCount")
              .replace("{filtered}", String(filtered.length))
              .replace("{total}", String(universities.length))}
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
            <p className="font-semibold text-gray-600">{t("noUniversitiesFoundDashboard")}</p>
            <p className="text-sm text-gray-400 mt-1">{search ? t("tryDifferentSearch") : t("addFirstUniversityHint")}</p>
          </div>
          {!search && userRole && canAccess(userRole, "universities", "create") && (
            <Link href="/dashboard/universities/add"
              className="inline-flex items-center gap-2 bg-[#5260ce] text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#4251be] transition-all">
              <Plus size={16} /> {t("addUniversity")}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paged.map((uni, idx) => {
            const displayName = pickLocalized(uni.nameI18n ?? uni.name, lang);
            const grad = GRADIENTS[(displayName.charCodeAt(0) || 0) % GRADIENTS.length];
            return (
              <div key={uni.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                {/* Card top banner */}
                <div className={`relative h-24 bg-gradient-to-br ${grad} flex items-center justify-center`}>
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                    <span className="text-white font-extrabold text-lg">{initials(displayName)}</span>
                  </div>
                  {/* Status dot */}
                  <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm ${
                    uni.isActive ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"
                  }`}>
                    {uni.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                    {uni.isActive ? t("active") : t("inactive")}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">{displayName}</h3>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin size={11} className="text-gray-400 shrink-0" />
                      <span className="truncate">
                        {uni.city}
                        {uni.country ? `${locSep}${formatCountryLabel(uni.country, lang)}` : ""}
                      </span>
                    </div>
                    {uni.language && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Globe size={11} className="text-gray-400 shrink-0" />
                        <span>{formatInstructionLanguages(uni.language, t)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-semibold ${
                          uni.admissionStatus === "OPEN"
                            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                            : "text-rose-700 bg-rose-50 border-rose-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${uni.admissionStatus === "OPEN" ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {uni.admissionStatus === "OPEN" ? t("admissionOpen") : t("admissionClosed")}
                      </span>
                    </div>
                    {uni.admissionDeadline && (
                      <div className="text-[11px] text-gray-400">
                        {t("admissionDeadlineLabel")}{" "}
                        {new Date(uni.admissionDeadline).toLocaleDateString(dateLocale)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="px-4 pb-4 flex items-center gap-2">
                  <Link href={`/dashboard/universities/${uni.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-semibold transition-all">
                    <Eye size={13} /> {t("view")}
                  </Link>
                  {userRole && canAccess(userRole, "universities", "update") && (
                    <Link href={`/dashboard/universities/${uni.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-all">
                      <Edit2 size={13} /> {t("edit")}
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
            {t("dashboardPaginationSummary")
              .replace("{from}", String((page - 1) * PAGE_SIZE + 1))
              .replace("{to}", String(Math.min(page * PAGE_SIZE, filtered.length)))
              .replace("{total}", String(filtered.length))}
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
