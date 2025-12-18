"use client";

import { useState, useEffect } from "react";
import { Search, DollarSign, Eye } from "lucide-react";
import { apiGet } from "@/lib/api";
import Link from "next/link";
import { t } from "@/lib/i18n";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string | null;
  createdAt: string;
  application: {
    id: string;
    fullName: string;
    email: string;
    program: {
      name: string;
    } | null;
  };
}

export default function PartnerPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    revenue: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, [search, statusFilter, page]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (search) {
        params.append("search", search);
      }

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const data = await apiGet(`/partner/payments?${params.toString()}`) as any;
      setPayments(data?.payments || []);
      setTotalPages(data?.pagination?.totalPages || 1);

      // Calculate stats
      const allPayments = data?.payments || [];
      setStats({
        total: allPayments.length,
        completed: allPayments.filter((p: Payment) => p.paymentStatus === "completed").length,
        pending: allPayments.filter((p: Payment) => p.paymentStatus === "pending").length,
        revenue: allPayments
          .filter((p: Payment) => p.paymentStatus === "completed")
          .reduce((sum: number, p: Payment) => sum + Number(p.amount), 0),
      });
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-montserrat-bold text-[#121c67] mb-6">
        {t("payments")}
      </h1>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">{t("totalPayments")}</p>
          <p className="text-2xl font-montserrat-bold text-[#121c67]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">{t("completed")}</p>
          <p className="text-2xl font-montserrat-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">{t("pending")}</p>
          <p className="text-2xl font-montserrat-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">{t("totalRevenue")}</p>
          <p className="text-2xl font-montserrat-bold text-[#5260ce]">
            ${stats.revenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t("searchPayments")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">{t("allStatus")}</option>
            <option value="pending">{t("pending")}</option>
            <option value="completed">{t("completed")}</option>
            <option value="failed">{t("failed")}</option>
            <option value="refunded">{t("refunded")}</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("student")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("program")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("amount")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("paymentMethod")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("status")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("transactionId")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("date")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  {t("noPayments")}
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.application.fullName}
                    </div>
                    <div className="text-xs text-gray-500">{payment.application.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {payment.application.program?.name || t("nA")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${payment.amount} {payment.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 capitalize">
                      {payment.paymentMethod ? payment.paymentMethod.replace("_", " ") : t("nA")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        payment.paymentStatus
                      )}`}
                    >
                      {payment.paymentStatus === "completed" ? t("completed") :
                       payment.paymentStatus === "failed" ? t("failed") :
                       payment.paymentStatus === "refunded" ? t("refunded") :
                       payment.paymentStatus === "blocked" ? t("blocked") :
                       t("pending")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 font-mono">
                      {payment.transactionId || t("nA")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/dashboard/partner/students/${payment.application.id}`}
                      className="text-[#5260ce] hover:text-[#4350b0] flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      {t("viewApp")}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            {t("previous")}
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {t("page")} {page} {t("of")} {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            {t("next")}
          </button>
        </div>
      )}
    </div>
  );
}



