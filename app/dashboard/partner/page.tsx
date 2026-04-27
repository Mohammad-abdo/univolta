"use client";

import { useState, useEffect } from "react";
import {
  Users,
  DollarSign,
  BookOpen,
  TrendingUp,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import Link from "next/link";
import { t, getLanguage, type Language } from "@/lib/i18n";

interface Stats {
  applications: number;
  payments: number;
  programs: number;
  totalRevenue: number;
}

interface DashboardData {
  stats: Stats;
  applicationsByStatus: {
    PENDING: number;
    REVIEW: number;
    APPROVED: number;
    REJECTED: number;
  };
  paymentsByStatus: {
    pending: number;
    completed: number;
    failed: number;
  };
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
  applicationsByMonth: Array<{
    month: string;
    count: number;
  }>;
  recentApplications: Array<{
    id: string;
    fullName: string;
    email: string;
    status: string;
    createdAt: string;
    program: { name: string } | null;
  }>;
  topPrograms: Array<{
    id: string;
    name: string;
    applications: number;
  }>;
}

function applicationStatusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return t("partnerStatusPending");
    case "REVIEW":
      return t("partnerStatusInReview");
    case "APPROVED":
      return t("partnerStatusApproved");
    case "REJECTED":
      return t("partnerStatusRejected");
    default:
      return status;
  }
}

function applicationStatusStyles(status: string): string {
  switch (status) {
    case "APPROVED":
      return "text-green-700 bg-green-50 ring-1 ring-green-600/15";
    case "REJECTED":
      return "text-red-700 bg-red-50 ring-1 ring-red-600/15";
    case "REVIEW":
      return "text-amber-800 bg-amber-50 ring-1 ring-amber-600/15";
    default:
      return "text-slate-700 bg-slate-100 ring-1 ring-slate-400/20";
  }
}

export default function PartnerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const stats = await apiGet<Stats>("/partner/dashboard/stats");
      const reports = (await apiGet("/partner/reports")) as {
        applicationsByStatus?: DashboardData["applicationsByStatus"];
        paymentsByStatus?: DashboardData["paymentsByStatus"];
        revenueByMonth?: DashboardData["revenueByMonth"];
        applicationsByMonth?: DashboardData["applicationsByMonth"];
      };
      const applicationsData = (await apiGet("/partner/applications?page=1&limit=5")) as {
        applications?: DashboardData["recentApplications"];
      };
      const programsData = await apiGet("/partner/programs");
      const topPrograms = (Array.isArray(programsData) ? programsData : []).slice(0, 5).map((p: { id: string; name: string; _count?: { applications?: number } }) => ({
        id: p.id,
        name: p.name,
        applications: p._count?.applications || 0,
      }));

      setData({
        stats,
        applicationsByStatus: reports?.applicationsByStatus || {
          PENDING: 0,
          REVIEW: 0,
          APPROVED: 0,
          REJECTED: 0,
        },
        paymentsByStatus: reports?.paymentsByStatus || {
          pending: 0,
          completed: 0,
          failed: 0,
        },
        revenueByMonth: reports?.revenueByMonth || [],
        applicationsByMonth: reports?.applicationsByMonth || [],
        recentApplications: applicationsData?.applications || [],
        topPrograms,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMaxValue = (values: number[]) => Math.max(...values, 1);

  if (loading) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#5260ce]/25 bg-[#f9fafe]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#5260ce] border-t-transparent" aria-hidden />
        <p className="text-sm font-medium text-[#65666f]">{t("loading")}</p>
      </div>
    );
  }

  const lang: Language = getLanguage();
  const isRTL = lang === "ar";
  const stats = data?.stats;
  const revenueRows = data?.revenueByMonth || [];
  const applicationsRows = data?.applicationsByMonth || [];
  const maxRevenue = getMaxValue(
    revenueRows.map((d) => (typeof d.revenue === "number" ? d.revenue : Number(d.revenue) || 0))
  );
  const maxApplications = getMaxValue(
    applicationsRows.map((d) => (typeof d.count === "number" ? d.count : Number(d.count) || 0))
  );

  const statCards = [
    {
      label: t("students"),
      value: stats?.applications ?? 0,
      hint: t("totalApplications"),
      icon: Users,
      iconWrap: "bg-sky-50 text-sky-600 ring-1 ring-sky-600/10",
      href: "/dashboard/partner/students",
    },
    {
      label: t("payments"),
      value: stats?.payments ?? 0,
      hint: t("totalTransactions"),
      icon: DollarSign,
      iconWrap: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/10",
      href: "/dashboard/partner/payments",
    },
    {
      label: t("programs"),
      value: stats?.programs ?? 0,
      hint: t("activePrograms"),
      icon: BookOpen,
      iconWrap: "bg-violet-50 text-violet-600 ring-1 ring-violet-600/10",
      href: "/dashboard/partner/programs",
    },
    {
      label: t("totalRevenue"),
      value: `$${(typeof stats?.totalRevenue === "number" ? stats.totalRevenue : Number(stats?.totalRevenue) || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      hint: t("allTimeRevenue"),
      icon: TrendingUp,
      iconWrap: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/12",
      href: null as string | null,
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-1 border-b border-gray-100 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#121c67] md:text-3xl">
          {t("universityControlPanel")}
        </h1>
        <p className="max-w-2xl text-sm text-[#65666f] md:text-base">
          {t("partnerDashboardSubtitle")}
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const inner = (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8b8c9a]">{card.label}</p>
                  <p className="truncate text-2xl font-bold tabular-nums text-[#121c67] md:text-[1.65rem]">{card.value}</p>
                  <p className="text-xs text-[#65666f]">{card.hint}</p>
                </div>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconWrap}`}>
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
              </div>
              {card.href ? (
                <Link
                  href={card.href}
                  className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#5260ce] transition-colors hover:text-[#3d4ab8] ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  {t("viewAll")}
                  <ChevronRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
                </Link>
              ) : (
                <div className="mt-4 h-5" aria-hidden />
              )}
            </>
          );
          if (card.href) {
            return (
              <Link
                key={card.label}
                href={card.href}
                className="group block rounded-2xl border border-gray-200/90 bg-white p-5 shadow-[0_2px_20px_rgba(18,28,103,0.06)] transition-all hover:-translate-y-0.5 hover:border-[#5260ce]/25 hover:shadow-[0_12px_36px_-8px_rgba(82,96,206,0.18)]"
              >
                {inner}
              </Link>
            );
          }
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-[0_2px_20px_rgba(18,28,103,0.06)]"
            >
              {inner}
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-[0_2px_20px_rgba(18,28,103,0.06)] md:p-6">
          <h2 className="mb-5 text-lg font-semibold text-[#121c67]">{t("revenueTrendLast6Months")}</h2>
          {revenueRows.length > 0 ? (
            <ul className="space-y-3">
              {revenueRows.slice(-6).map((item, index) => {
                const revenueValue = typeof item.revenue === "number" ? item.revenue : Number(item.revenue) || 0;
                const pct = maxRevenue > 0 ? (revenueValue / maxRevenue) * 100 : 0;
                const monthShort =
                  item.month.length > 3 ? item.month.slice(0, 3) : item.month;
                return (
                  <li key={`${item.month}-${index}`} className="grid grid-cols-[3.5rem_minmax(0,1fr)_5.5rem] items-center gap-3 text-sm">
                    <span className="font-medium text-[#65666f]">{monthShort}</span>
                    <div className="min-w-0">
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-[width] duration-500"
                          style={{ width: `${Math.max(pct, 0)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-end text-sm font-semibold tabular-nums text-[#121c67]">
                      ${revenueValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-10 text-center text-sm text-[#65666f]">{t("partnerChartNoRevenue")}</p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-[0_2px_20px_rgba(18,28,103,0.06)] md:p-6">
          <h2 className="mb-5 text-lg font-semibold text-[#121c67]">{t("applicationsTrendLast6Months")}</h2>
          {applicationsRows.length > 0 ? (
            <ul className="space-y-3">
              {applicationsRows.slice(-6).map((item, index) => {
                const pct = maxApplications > 0 ? (item.count / maxApplications) * 100 : 0;
                const monthShort = item.month.length > 3 ? item.month.slice(0, 3) : item.month;
                return (
                  <li key={`${item.month}-${index}`} className="grid grid-cols-[3.5rem_minmax(0,1fr)_3rem] items-center gap-3 text-sm">
                    <span className="font-medium text-[#65666f]">{monthShort}</span>
                    <div className="min-w-0">
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#5260ce] to-[#4350b0] transition-[width] duration-500"
                          style={{ width: `${Math.max(pct, 0)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-end text-sm font-semibold tabular-nums text-[#121c67]">{item.count}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-10 text-center text-sm text-[#65666f]">{t("partnerChartNoApplications")}</p>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-[0_2px_20px_rgba(18,28,103,0.06)] md:p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#121c67]">{t("applicationsByStatus")}</h2>
          <ul className="space-y-3">
            <li className="flex items-center justify-between gap-3 rounded-xl bg-amber-50/90 px-4 py-3 ring-1 ring-amber-200/60">
              <span className="flex items-center gap-2 font-medium text-amber-900">
                <Clock className="h-5 w-5 shrink-0 text-amber-600" />
                {t("partnerStatusPending")}
              </span>
              <span className="text-xl font-bold tabular-nums text-amber-800">{data?.applicationsByStatus?.PENDING ?? 0}</span>
            </li>
            <li className="flex items-center justify-between gap-3 rounded-xl bg-sky-50/90 px-4 py-3 ring-1 ring-sky-200/60">
              <span className="flex items-center gap-2 font-medium text-sky-900">
                <FileText className="h-5 w-5 shrink-0 text-sky-600" />
                {t("partnerStatusInReview")}
              </span>
              <span className="text-xl font-bold tabular-nums text-sky-800">{data?.applicationsByStatus?.REVIEW ?? 0}</span>
            </li>
            <li className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50/90 px-4 py-3 ring-1 ring-emerald-200/60">
              <span className="flex items-center gap-2 font-medium text-emerald-900">
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                {t("partnerStatusApproved")}
              </span>
              <span className="text-xl font-bold tabular-nums text-emerald-800">{data?.applicationsByStatus?.APPROVED ?? 0}</span>
            </li>
            <li className="flex items-center justify-between gap-3 rounded-xl bg-red-50/90 px-4 py-3 ring-1 ring-red-200/60">
              <span className="flex items-center gap-2 font-medium text-red-900">
                <XCircle className="h-5 w-5 shrink-0 text-red-600" />
                {t("partnerStatusRejected")}
              </span>
              <span className="text-xl font-bold tabular-nums text-red-800">{data?.applicationsByStatus?.REJECTED ?? 0}</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-[0_2px_20px_rgba(18,28,103,0.06)] md:p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#121c67]">{t("paymentsByStatus")}</h2>
          <ul className="space-y-3">
            <li className="flex items-center justify-between gap-3 rounded-xl bg-amber-50/90 px-4 py-3 ring-1 ring-amber-200/60">
              <span className="flex items-center gap-2 font-medium text-amber-900">
                <Clock className="h-5 w-5 shrink-0 text-amber-600" />
                {t("partnerPaymentPending")}
              </span>
              <span className="text-xl font-bold tabular-nums text-amber-800">{data?.paymentsByStatus?.pending ?? 0}</span>
            </li>
            <li className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50/90 px-4 py-3 ring-1 ring-emerald-200/60">
              <span className="flex items-center gap-2 font-medium text-emerald-900">
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                {t("completed")}
              </span>
              <span className="text-xl font-bold tabular-nums text-emerald-800">{data?.paymentsByStatus?.completed ?? 0}</span>
            </li>
            <li className="flex items-center justify-between gap-3 rounded-xl bg-red-50/90 px-4 py-3 ring-1 ring-red-200/60">
              <span className="flex items-center gap-2 font-medium text-red-900">
                <XCircle className="h-5 w-5 shrink-0 text-red-600" />
                {t("failed")}
              </span>
              <span className="text-xl font-bold tabular-nums text-red-800">{data?.paymentsByStatus?.failed ?? 0}</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-[0_2px_20px_rgba(18,28,103,0.06)] md:p-6">
          <div className={`mb-4 flex items-center justify-between gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <h2 className="text-lg font-semibold text-[#121c67]">{t("recentApplications")}</h2>
            <Link href="/dashboard/partner/students" className="shrink-0 text-sm font-semibold text-[#5260ce] hover:text-[#3d4ab8]">
              {t("viewAll")}
            </Link>
          </div>
          <ul className="space-y-2">
            {data?.recentApplications && data.recentApplications.length > 0 ? (
              data.recentApplications.map((app) => (
                <li
                  key={app.id}
                  className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-[#fafbff] px-4 py-3 transition-colors hover:border-[#5260ce]/20 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#121c67]">{app.fullName}</p>
                    <p className="truncate text-sm text-[#65666f]">{app.email}</p>
                    <p className="mt-0.5 text-xs text-[#8b8c9a]">{app.program?.name || t("noProgramDash")}</p>
                  </div>
                  <span className={`shrink-0 self-start rounded-full px-3 py-1 text-xs font-semibold sm:self-center ${applicationStatusStyles(app.status)}`}>
                    {applicationStatusLabel(app.status)}
                  </span>
                </li>
              ))
            ) : (
              <li className="py-8 text-center text-sm text-[#65666f]">{t("noRecentApplications")}</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-[0_2px_20px_rgba(18,28,103,0.06)] md:p-6">
          <div className={`mb-4 flex items-center justify-between gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <h2 className="text-lg font-semibold text-[#121c67]">{t("topPrograms")}</h2>
            <Link href="/dashboard/partner/programs" className="shrink-0 text-sm font-semibold text-[#5260ce] hover:text-[#3d4ab8]">
              {t("viewAll")}
            </Link>
          </div>
          <ul className="space-y-2">
            {data?.topPrograms && data.topPrograms.length > 0 ? (
              data.topPrograms.map((program, index) => (
                <li
                  key={program.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-[#fafbff] px-4 py-3 transition-colors hover:border-[#5260ce]/20"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#121c67]">{program.name}</p>
                      <p className="text-xs text-[#65666f]">
                        {program.applications} {t("applicationsCountShort")}
                      </p>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
                </li>
              ))
            ) : (
              <li className="py-8 text-center text-sm text-[#65666f]">{t("noProgramsAvailable")}</li>
            )}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-[0_2px_20px_rgba(18,28,103,0.06)] md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-[#121c67]">{t("quickActions")}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/dashboard/partner/students/add"
            className="group rounded-xl border border-gray-200 bg-[#fafbff] p-4 transition-all hover:border-[#5260ce]/35 hover:shadow-md"
          >
            <div className={`mb-2 flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700 transition-colors group-hover:bg-sky-200/80">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-[#121c67] group-hover:text-[#5260ce]">{t("addStudent")}</h3>
            </div>
            <p className="text-sm leading-relaxed text-[#65666f]">{t("addNewStudentApplication")}</p>
          </Link>
          <Link
            href="/dashboard/partner/programs/add"
            className="group rounded-xl border border-gray-200 bg-[#fafbff] p-4 transition-all hover:border-[#5260ce]/35 hover:shadow-md"
          >
            <div className={`mb-2 flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 transition-colors group-hover:bg-violet-200/80">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-[#121c67] group-hover:text-[#5260ce]">{t("addProgram")}</h3>
            </div>
            <p className="text-sm leading-relaxed text-[#65666f]">{t("addEditPrograms")}</p>
          </Link>
          <Link
            href="/dashboard/partner/reports"
            className="group rounded-xl border border-gray-200 bg-[#fafbff] p-4 transition-all hover:border-[#5260ce]/35 hover:shadow-md"
          >
            <div className={`mb-2 flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 transition-colors group-hover:bg-emerald-200/80">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-[#121c67] group-hover:text-[#5260ce]">{t("viewReports")}</h3>
            </div>
            <p className="text-sm leading-relaxed text-[#65666f]">{t("viewDetailedReports")}</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
