"use client";

import { useState, useEffect } from "react";
import { Users, DollarSign, BookOpen, TrendingUp, FileText, CheckCircle, XCircle, Clock, ArrowUp, ArrowDown } from "lucide-react";
import { apiGet } from "@/lib/api";
import Link from "next/link";
import { t } from "@/lib/i18n";

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

export default function PartnerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const stats = await apiGet<Stats>("/partner/dashboard/stats");
      
      // Fetch reports data for charts
      const reports = await apiGet("/partner/reports") as any;
      
      // Fetch recent applications
      const applicationsData = await apiGet("/partner/applications?page=1&limit=5") as any;
      
      // Fetch programs with application counts
      const programsData = await apiGet("/partner/programs");
      const topPrograms = (Array.isArray(programsData) ? programsData : []).slice(0, 5).map((p: any) => ({
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600 bg-green-50";
      case "REJECTED":
        return "text-red-600 bg-red-50";
      case "REVIEW":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getMaxValue = (data: number[]) => {
    return Math.max(...data, 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t("loading")}</div>
      </div>
    );
  }

  const stats = data?.stats;
  const revenueData = data?.revenueByMonth || [];
  const applicationsData = data?.applicationsByMonth || [];
  const maxRevenue = getMaxValue(revenueData.map((d) => typeof d.revenue === 'number' ? d.revenue : Number(d.revenue) || 0));
  const maxApplications = getMaxValue(applicationsData.map((d) => typeof d.count === 'number' ? d.count : Number(d.count) || 0));

  return (
    <div>
      <h1 className="text-3xl font-montserrat-bold text-[#121c67] mb-6">
        {t("universityControlPanel") || "University Control Panel"}
      </h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t("students") || "Students"}</p>
              <p className="text-2xl font-montserrat-bold text-[#121c67]">
                {stats?.applications || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">{t("totalApplications")}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <Link
            href="/dashboard/partner/students"
            className="text-sm text-[#5260ce] hover:underline mt-2 inline-block"
          >
            {t("viewAll") || "View all"} →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t("payments") || "Payments"}</p>
              <p className="text-2xl font-montserrat-bold text-[#121c67]">
                {stats?.payments || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">{t("totalTransactions")}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <Link
            href="/dashboard/partner/payments"
            className="text-sm text-[#5260ce] hover:underline mt-2 inline-block"
          >
            {t("viewAll") || "View all"} →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t("programs") || "Programs"}</p>
              <p className="text-2xl font-montserrat-bold text-[#121c67]">
                {stats?.programs || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">{t("activePrograms")}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <Link
            href="/dashboard/partner/programs"
            className="text-sm text-[#5260ce] hover:underline mt-2 inline-block"
          >
            {t("viewAll") || "View all"} →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t("totalRevenue") || "Total Revenue"}</p>
              <p className="text-2xl font-montserrat-bold text-[#121c67]">
                ${typeof stats?.totalRevenue === 'number' ? stats.totalRevenue.toFixed(2) : (Number(stats?.totalRevenue) || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{t("allTimeRevenue")}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-montserrat-semibold text-[#121c67] mb-4">
            {t("revenueTrendLast6Months")}
          </h2>
          {revenueData.length > 0 ? (
            <div className="space-y-3">
              {revenueData.slice(-6).map((item, index) => {
                const revenueValue = typeof item.revenue === 'number' ? item.revenue : Number(item.revenue) || 0;
                const percentage = maxRevenue > 0 ? (revenueValue / maxRevenue) * 100 : 0;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-gray-600 font-medium">
                      {item.month.substring(0, 3)}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 10 && (
                          <span className="text-xs font-semibold text-white">
                            ${revenueValue.toFixed(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-20 text-right text-sm font-semibold text-[#121c67]">
                      ${revenueValue.toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No revenue data available</p>
          )}
        </div>

        {/* Applications Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-montserrat-semibold text-[#121c67] mb-4">
            {t("applicationsTrendLast6Months")}
          </h2>
          {applicationsData.length > 0 ? (
            <div className="space-y-3">
              {applicationsData.slice(-6).map((item, index) => {
                const percentage = (item.count / maxApplications) * 100;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-gray-600 font-medium">
                      {item.month.substring(0, 3)}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 10 && (
                          <span className="text-xs font-semibold text-white">
                            {item.count}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-20 text-right text-sm font-semibold text-[#121c67]">
                      {item.count}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No applications data available</p>
          )}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Applications by Status */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-montserrat-semibold text-[#121c67] mb-4">
            {t("applicationsByStatus")}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="font-medium">Pending</span>
              </div>
              <span className="text-xl font-bold text-yellow-600">
                {data?.applicationsByStatus?.PENDING || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium">In Review</span>
              </div>
              <span className="text-xl font-bold text-blue-600">
                {data?.applicationsByStatus?.REVIEW || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">Approved</span>
              </div>
              <span className="text-xl font-bold text-green-600">
                {data?.applicationsByStatus?.APPROVED || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium">Rejected</span>
              </div>
              <span className="text-xl font-bold text-red-600">
                {data?.applicationsByStatus?.REJECTED || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Payments by Status */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-montserrat-semibold text-[#121c67] mb-4">
            {t("paymentsByStatus")}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="font-medium">Pending</span>
              </div>
              <span className="text-xl font-bold text-yellow-600">
                {data?.paymentsByStatus?.pending || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">Completed</span>
              </div>
              <span className="text-xl font-bold text-green-600">
                {data?.paymentsByStatus?.completed || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium">Failed</span>
              </div>
              <span className="text-xl font-bold text-red-600">
                {data?.paymentsByStatus?.failed || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-montserrat-semibold text-[#121c67]">
              {t("recentApplications")}
            </h2>
            <Link
              href="/dashboard/partner/students"
              className="text-sm text-[#5260ce] hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {data?.recentApplications && data.recentApplications.length > 0 ? (
              data.recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{app.fullName}</p>
                    <p className="text-sm text-gray-500">{app.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {app.program?.name || "No program"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      app.status
                    )}`}
                  >
                    {app.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">{t("noRecentApplications")}</p>
            )}
          </div>
        </div>

        {/* Top Programs */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-montserrat-semibold text-[#121c67]">
              {t("topPrograms")}
            </h2>
            <Link
              href="/dashboard/partner/programs"
              className="text-sm text-[#5260ce] hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {data?.topPrograms && data.topPrograms.length > 0 ? (
              data.topPrograms.map((program, index) => (
                <div
                  key={program.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{program.name}</p>
                      <p className="text-xs text-gray-500">
                        {program.applications} applications
                      </p>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">{t("noProgramsAvailable")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-montserrat-semibold text-[#121c67] mb-4">
          {t("quickActions") || "Quick Actions"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/partner/students/add"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#5260ce] hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-montserrat-semibold text-[#121c67] group-hover:text-[#5260ce] transition-colors">
                {t("addStudent") || "Add Student"}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              {t("addNewStudentApplication") || "Add a new student application"}
            </p>
          </Link>

          <Link
            href="/dashboard/partner/programs/add"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#5260ce] hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-montserrat-semibold text-[#121c67] group-hover:text-[#5260ce] transition-colors">
                {t("addProgram") || "Add Program"}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              {t("addEditPrograms") || "Add or edit programs"}
            </p>
          </Link>

          <Link
            href="/dashboard/partner/reports"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#5260ce] hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-montserrat-semibold text-[#121c67] group-hover:text-[#5260ce] transition-colors">
                {t("viewReports") || "View Reports"}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              {t("viewDetailedReports") || "View detailed analytics and reports"}
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
