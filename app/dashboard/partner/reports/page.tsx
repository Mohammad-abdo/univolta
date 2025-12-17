"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Calendar, TrendingUp, Users, DollarSign, BookOpen, BarChart3, PieChart, Activity } from "lucide-react";
import { apiGet } from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { showToast } from "@/lib/toast";

interface ReportData {
  totalApplications: number;
  totalPayments: number;
  totalRevenue: number;
  totalPrograms: number;
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
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("all");

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange !== "all") {
        params.append("dateRange", dateRange);
      }
      const data = await apiGet(`/partner/reports?${params.toString()}`);
      setReportData(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: "pdf" | "csv") => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        showToast.error("Please log in to export reports");
        return;
      }

      const params = new URLSearchParams();
      if (dateRange !== "all") {
        params.append("dateRange", dateRange);
      }
      params.append("format", format);
      
      const response = await fetch(`${API_BASE_URL}/partner/reports/export?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: format === "pdf" ? "text/html" : "text/csv",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Export failed";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        showToast.error(errorMessage);
        return;
      }

      // Handle different content types
      const contentType = response.headers.get("content-type") || "";
      
      if (format === "csv" || contentType.includes("csv")) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `university-report-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (format === "pdf" || contentType.includes("html")) {
        // For PDF, backend returns HTML that can be printed
        const html = await response.text();
        const blob = new Blob([html], { type: "text/html" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `university-report-${new Date().toISOString().split("T")[0]}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Also open in new window for printing
        const printWindow = window.open();
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
        }
      }
    } catch (error: any) {
      console.error("Error exporting report:", error);
      showToast.error(error.message || "Failed to export report. Please try again.");
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

  const revenueData = reportData?.revenueByMonth || [];
  const applicationsData = reportData?.applicationsByMonth || [];
  const maxRevenue = getMaxValue(revenueData.map((d) => Number(d.revenue)));
  const maxApplications = getMaxValue(applicationsData.map((d) => d.count));

  // Calculate percentages for pie charts
  const totalApplications = reportData?.applicationsByStatus 
    ? Object.values(reportData.applicationsByStatus).reduce((a, b) => a + b, 0)
    : 0;
  const totalPayments = reportData?.paymentsByStatus
    ? Object.values(reportData.paymentsByStatus).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-montserrat-bold text-[#121c67] mb-2">
            {t("reports") || "Analytics & Reports"}
          </h1>
          <p className="text-gray-600">Comprehensive insights into your university performance</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button
            onClick={() => exportReport("pdf")}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button
            onClick={() => exportReport("csv")}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 opacity-90" />
            <TrendingUp className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-blue-100 text-sm mb-1">Total Applications</p>
          <p className="text-3xl font-montserrat-bold">
            {reportData?.totalApplications || 0}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 opacity-90" />
            <TrendingUp className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-green-100 text-sm mb-1">Total Revenue</p>
          <p className="text-3xl font-montserrat-bold">
            ${Number(reportData?.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="w-8 h-8 opacity-90" />
            <Activity className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-purple-100 text-sm mb-1">Total Programs</p>
          <p className="text-3xl font-montserrat-bold">
            {reportData?.totalPrograms || 0}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 opacity-90" />
            <BarChart3 className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-orange-100 text-sm mb-1">Total Payments</p>
          <p className="text-3xl font-montserrat-bold">
            {reportData?.totalPayments || 0}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications by Status - Pie Chart Style */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-montserrat-bold text-[#121c67] flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Applications by Status
            </h2>
          </div>
          <div className="space-y-4">
            {totalApplications > 0 ? (
              <>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">Pending</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-700">
                      {reportData?.applicationsByStatus?.PENDING || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {totalApplications > 0 
                        ? ((reportData?.applicationsByStatus?.PENDING || 0) / totalApplications * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">In Review</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-700">
                      {reportData?.applicationsByStatus?.REVIEW || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {totalApplications > 0 
                        ? ((reportData?.applicationsByStatus?.REVIEW || 0) / totalApplications * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">Approved</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-700">
                      {reportData?.applicationsByStatus?.APPROVED || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {totalApplications > 0 
                        ? ((reportData?.applicationsByStatus?.APPROVED || 0) / totalApplications * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">Rejected</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-700">
                      {reportData?.applicationsByStatus?.REJECTED || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {totalApplications > 0 
                        ? ((reportData?.applicationsByStatus?.REJECTED || 0) / totalApplications * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-8">No application data available</p>
            )}
          </div>
        </div>

        {/* Payments by Status */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-montserrat-bold text-[#121c67] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Payments by Status
            </h2>
          </div>
          <div className="space-y-4">
            {totalPayments > 0 ? (
              <>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">Pending</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-700">
                      {reportData?.paymentsByStatus?.pending || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {totalPayments > 0 
                        ? ((reportData?.paymentsByStatus?.pending || 0) / totalPayments * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">Completed</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-700">
                      {reportData?.paymentsByStatus?.completed || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {totalPayments > 0 
                        ? ((reportData?.paymentsByStatus?.completed || 0) / totalPayments * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">Failed</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-700">
                      {reportData?.paymentsByStatus?.failed || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {totalPayments > 0 
                        ? ((reportData?.paymentsByStatus?.failed || 0) / totalPayments * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-8">No payment data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      {revenueData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-montserrat-bold text-[#121c67] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Revenue Trend (Last 12 Months)
            </h2>
          </div>
          <div className="space-y-3">
            {revenueData.map((item, index) => {
              const percentage = (Number(item.revenue) / maxRevenue) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{item.month}</span>
                    <span className="text-sm font-bold text-[#121c67]">
                      ${Number(item.revenue).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 15 && (
                        <span className="text-xs font-semibold text-white">
                          ${Number(item.revenue).toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Applications Trend Chart */}
      {applicationsData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-montserrat-bold text-[#121c67] flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Applications Trend (Last 12 Months)
            </h2>
          </div>
          <div className="space-y-3">
            {applicationsData.map((item, index) => {
              const percentage = (item.count / maxApplications) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{item.month}</span>
                    <span className="text-sm font-bold text-[#121c67]">
                      {item.count} {item.count === 1 ? "application" : "applications"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 15 && (
                        <span className="text-xs font-semibold text-white">
                          {item.count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-montserrat-bold text-[#121c67] mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#5260ce]" />
          Summary Statistics
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Metric</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Value</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Total Applications</td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-[#121c67]">
                  {reportData?.totalApplications || 0}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-500">100%</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Approved Applications</td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                  {reportData?.applicationsByStatus?.APPROVED || 0}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-500">
                  {totalApplications > 0 
                    ? ((reportData?.applicationsByStatus?.APPROVED || 0) / totalApplications * 100).toFixed(1)
                    : 0}%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Total Revenue</td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-[#121c67]">
                  ${Number(reportData?.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-500">-</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Completed Payments</td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                  {reportData?.paymentsByStatus?.completed || 0}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-500">
                  {totalPayments > 0 
                    ? ((reportData?.paymentsByStatus?.completed || 0) / totalPayments * 100).toFixed(1)
                    : 0}%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Active Programs</td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-[#121c67]">
                  {reportData?.totalPrograms || 0}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-500">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
