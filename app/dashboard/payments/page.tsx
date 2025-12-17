"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { canAccess, type UserRole } from "@/lib/permissions";
import { API_BASE_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Search, Filter, DollarSign, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { t } from "@/lib/i18n";

interface Payment {
  id: string;
  applicationId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
  application?: {
    id: string;
    fullName: string;
    email: string;
    university?: { name: string };
    program?: { name: string };
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUserRole();
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [searchTerm, statusFilter, methodFilter, payments]);

  const fetchUserRole = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.role?.toLowerCase() as UserRole);
        }
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const fetchPayments = async () => {
    try {
      // Fetch all applications with payments
      const applications = await apiGet<any[]>("/applications");
      const paymentsList: Payment[] = [];

      // Extract payments from applications
      for (const app of applications) {
        if (app.payment) {
          paymentsList.push({
            ...app.payment,
            applicationId: app.payment.applicationId || app.id, // Ensure applicationId is set
            application: {
              id: app.id,
              fullName: app.fullName,
              email: app.email,
              university: app.university,
              program: app.program,
            },
          });
        } else if (app.paymentStatus) {
          // Create payment object from application payment fields
          paymentsList.push({
            id: `temp-${app.id}`,
            applicationId: app.id,
            amount: app.totalFee || app.applicationFee || 0,
            currency: "USD",
            paymentMethod: app.paymentMethod || "unknown",
            paymentStatus: app.paymentStatus,
            createdAt: app.createdAt,
            application: {
              id: app.id,
              fullName: app.fullName,
              email: app.email,
              university: app.university,
              program: app.program,
            },
          });
        }
      }

      setPayments(paymentsList);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.application?.fullName.toLowerCase().includes(term) ||
          payment.application?.email.toLowerCase().includes(term) ||
          payment.transactionId?.toLowerCase().includes(term) ||
          payment.applicationId.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.paymentStatus === statusFilter);
    }

    // Method filter
    if (methodFilter !== "all") {
      filtered = filtered.filter((payment) => payment.paymentMethod === methodFilter);
    }

    setFilteredPayments(filtered);
  };

  const statusConfig = {
    completed: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Completed" },
    paid: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Paid" },
    pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pending" },
    failed: { color: "bg-red-100 text-red-800", icon: XCircle, label: "Failed" },
    refunded: { color: "bg-gray-100 text-gray-800", icon: XCircle, label: "Refunded" },
  };

  const getStatusConfig = (status: string) => {
    const lowerStatus = status.toLowerCase();
    return statusConfig[lowerStatus as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800",
      icon: Clock,
      label: status,
    };
  };

  const statusCounts = {
    all: payments.length,
    completed: payments.filter((p) => p.paymentStatus === "completed" || p.paymentStatus === "paid").length,
    pending: payments.filter((p) => p.paymentStatus === "pending").length,
    failed: payments.filter((p) => p.paymentStatus === "failed").length,
  };

  const totalRevenue = payments
    .filter((p) => p.paymentStatus === "completed" || p.paymentStatus === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">{t("payments")}</h1>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="text-sm text-gray-600">{t("totalPayments")}</div>
          <div className="text-2xl font-bold text-[#121c67]">{statusCounts.all}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow border border-green-200 p-4">
          <div className="text-sm text-gray-600">{t("completed")}</div>
          <div className="text-2xl font-bold text-green-800">{statusCounts.completed}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow border border-yellow-200 p-4">
          <div className="text-sm text-gray-600">{t("pending")}</div>
          <div className="text-2xl font-bold text-yellow-800">{statusCounts.pending}</div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow border border-blue-200 p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm text-gray-600">{t("totalRevenue")}</div>
              <div className="text-2xl font-bold text-blue-800">${totalRevenue.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t("searchApplications")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5260ce] focus:border-transparent"
            />
          </div>
          {showFilters && (
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5260ce]"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5260ce]"
              >
                <option value="all">All Methods</option>
                <option value="credit_card">Credit Card</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => {
                const statusCfg = getStatusConfig(payment.paymentStatus);
                const StatusIcon = statusCfg.icon;
                return (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {payment.application?.fullName || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.application?.email || "N/A"}
                        </div>
                        {payment.application?.university && (
                          <div className="text-xs text-gray-400">
                            {payment.application.university.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${Number(payment.amount).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">{payment.currency}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                        {payment.paymentMethod ? payment.paymentMethod.replace(/_/g, " ") : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusCfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-600">
                        {payment.transactionId ? (
                          <span title={payment.transactionId}>
                            {payment.transactionId.slice(0, 12)}...
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                      {payment.paidAt && (
                        <div className="text-xs text-gray-400">
                          Paid: {new Date(payment.paidAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {payment.applicationId || payment.application?.id ? (
                        <Link href={`/dashboard/applications/${payment.applicationId || payment.application?.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View App
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-xs">N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredPayments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm || statusFilter !== "all" || methodFilter !== "all"
              ? "No payments match your filters"
              : "No payments found"}
          </div>
        )}
      </div>
    </div>
  );
}

