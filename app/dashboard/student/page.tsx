"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  User,
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Eye,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { t, getLanguage } from "@/lib/i18n";

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  status: "PENDING" | "REVIEW" | "APPROVED" | "REJECTED";
  createdAt: string;
  university?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
  program?: {
    id: string;
    name: string;
    slug: string;
    degree?: string;
    duration?: string;
  };
  applicationFee?: number;
  totalFee?: number;
  payment?: {
    id: string;
    amount: number;
    currency: string;
    paymentStatus: string;
    paidAt?: string;
  };
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profile?: {
    avatarUrl?: string;
    bio?: string;
  };
}

export default function StudentDashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState<string>("en");

  useEffect(() => {
    setCurrentLang(getLanguage());
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [applicationsData, userData] = await Promise.all([
        apiGet<Application[]>("/applications").catch(() => []),
        fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
          .then((res) => res.json())
          .catch(() => null),
      ]);

      setApplications(applicationsData);
      setUser(userData);
    } catch (error: any) {
      showToast.error("Failed to load your data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          icon: CheckCircle,
          color: "bg-green-100 text-green-800 border-green-300",
          label: t("approved") || "Approved",
        };
      case "PENDING":
        return {
          icon: Clock,
          color: "bg-yellow-100 text-yellow-800 border-yellow-300",
          label: t("pending") || "Pending",
        };
      case "REVIEW":
        return {
          icon: FileText,
          color: "bg-blue-100 text-blue-800 border-blue-300",
          label: t("underReview") || "Under Review",
        };
      case "REJECTED":
        return {
          icon: XCircle,
          color: "bg-red-100 text-red-800 border-red-300",
          label: t("rejected") || "Rejected",
        };
      default:
        return {
          icon: Clock,
          color: "bg-gray-100 text-gray-800 border-gray-300",
          label: status,
        };
    }
  };

  const getPaymentStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
        return {
          color: "text-green-600",
          label: t("paid") || "Paid",
        };
      case "pending":
        return {
          color: "text-yellow-600",
          label: t("pending") || "Pending",
        };
      case "failed":
        return {
          color: "text-red-600",
          label: t("failed") || "Failed",
        };
      default:
        return {
          color: "text-gray-600",
          label: status || t("notPaid") || "Not Paid",
        };
    }
  };

  const approvedApplications = applications.filter((app) => app.status === "APPROVED");
  const pendingApplications = applications.filter((app) => app.status === "PENDING" || app.status === "REVIEW");
  const totalPaid = applications.reduce((sum, app) => {
    if (app.payment?.paymentStatus === "completed" || app.payment?.paymentStatus === "paid") {
      return sum + (Number(app.payment.amount) || 0);
    }
    return sum;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#5260ce] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-gray-600">{t("loading") || "Loading..."}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#5260ce] to-[#4350b0] rounded-2xl p-6 md:p-8 text-white shadow-lg animate-scale-in">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-montserrat-bold mb-2">
              {t("welcomeBack") || "Welcome Back"}, {user?.name || "Student"} 👋
            </h1>
            <p className="text-blue-100 text-lg">
              {t("trackYourApplications") || "Track your applications and manage your profile"}
            </p>
          </div>
          <Link href="/dashboard/student/profile">
            <Button className="bg-white text-[#5260ce] hover:bg-blue-50 transition-smooth">
              <User className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
              {t("manageProfile") || "Manage Profile"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover-lift animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-montserrat-regular text-gray-600 mb-1">
            {t("totalApplications") || "Total Applications"}
          </p>
          <p className="text-3xl font-montserrat-bold text-[#121c67]">{applications.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover-lift animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-montserrat-regular text-gray-600 mb-1">
            {t("approved") || "Approved"}
          </p>
          <p className="text-3xl font-montserrat-bold text-[#121c67]">{approvedApplications.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover-lift animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-montserrat-regular text-gray-600 mb-1">
            {t("pending") || "Pending"}
          </p>
          <p className="text-3xl font-montserrat-bold text-[#121c67]">{pendingApplications.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover-lift animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm font-montserrat-regular text-gray-600 mb-1">
            {t("totalPaid") || "Total Paid"}
          </p>
          <p className="text-3xl font-montserrat-bold text-[#121c67]">
            ${totalPaid.toLocaleString()}
          </p>
        </div>
      </div>

      {/* My Programs (Approved Applications) */}
      {approvedApplications.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 animate-slide-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-montserrat-bold text-[#121c67] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              {t("myPrograms") || "My Programs"}
            </h2>
            <Link
              href="/dashboard/student/programs"
              className="text-sm text-[#5260ce] hover:underline font-montserrat-semibold flex items-center gap-1"
            >
              {t("viewAll") || "View All"}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedApplications.slice(0, 4).map((app, index) => {
              const statusConfig = getStatusConfig(app.status);
              const StatusIcon = statusConfig.icon;
              return (
                <div
                  key={app.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-smooth animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-montserrat-bold text-lg text-[#121c67] mb-1">
                        {app.program?.name || "Program"}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{app.university?.name || "University"}</p>
                      {app.program?.degree && (
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mb-2">
                          {app.program.degree}
                        </span>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full border flex items-center gap-1 ${statusConfig.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-xs font-montserrat-semibold">{statusConfig.label}</span>
                    </div>
                  </div>
                  {app.payment && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t("paymentStatus") || "Payment Status"}:</span>
                        <span className={`text-sm font-semibold ${getPaymentStatusConfig(app.payment.paymentStatus).color}`}>
                          {getPaymentStatusConfig(app.payment.paymentStatus).label}
                        </span>
                      </div>
                      {app.payment.paidAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {t("paidOn") || "Paid on"}: {new Date(app.payment.paidAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                  <Link href={`/dashboard/student/applications/${app.id}`}>
                    <Button
                      variant="outline"
                      className="w-full mt-3 border-[#5260ce] text-[#5260ce] hover:bg-[#5260ce] hover:text-white transition-smooth"
                    >
                      <Eye className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                      {t("viewDetails") || "View Details"}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Applications */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 animate-slide-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-montserrat-bold text-[#121c67] flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            {t("allApplications") || "All Applications"}
          </h2>
          <Link
            href="/dashboard/student/applications"
            className="text-sm text-[#5260ce] hover:underline font-montserrat-semibold flex items-center gap-1"
          >
            {t("viewAll") || "View All"}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-montserrat-semibold text-[#121c67]">
                  {t("program") || "Program"}
                </th>
                <th className="text-left py-3 px-4 font-montserrat-semibold text-[#121c67]">
                  {t("university") || "University"}
                </th>
                <th className="text-left py-3 px-4 font-montserrat-semibold text-[#121c67]">
                  {t("status") || "Status"}
                </th>
                <th className="text-left py-3 px-4 font-montserrat-semibold text-[#121c67]">
                  {t("payment") || "Payment"}
                </th>
                <th className="text-left py-3 px-4 font-montserrat-semibold text-[#121c67]">
                  {t("date") || "Date"}
                </th>
                <th className="text-left py-3 px-4 font-montserrat-semibold text-[#121c67]">
                  {t("actions") || "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.slice(0, 5).map((app, index) => {
                const statusConfig = getStatusConfig(app.status);
                const StatusIcon = statusConfig.icon;
                const paymentConfig = app.payment ? getPaymentStatusConfig(app.payment.paymentStatus) : null;
                return (
                  <tr
                    key={app.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-smooth animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="py-4 px-4">
                      <div className="font-montserrat-semibold text-[#121c67]">{app.program?.name || "-"}</div>
                      {app.program?.degree && (
                        <div className="text-sm text-gray-500">{app.program.degree}</div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-700">{app.university?.name || "-"}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {paymentConfig ? (
                        <span className={`text-sm font-semibold ${paymentConfig.color}`}>
                          {paymentConfig.label}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">{t("notPaid") || "Not Paid"}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <Link href={`/dashboard/student/applications/${app.id}`}>
                        <Button variant="outline" size="sm" className="border-[#5260ce] text-[#5260ce]">
                          <Eye className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
                          {t("view") || "View"}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {applications.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>{t("noApplications") || "No applications yet"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

