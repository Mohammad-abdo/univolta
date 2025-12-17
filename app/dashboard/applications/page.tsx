"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPut } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { canAccess, type UserRole } from "@/lib/permissions";
import { API_BASE_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Search, Filter, Eye, Download } from "lucide-react";
import { t } from "@/lib/i18n";
import { DataTable } from "@/components/ui/data-table";

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

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    fetchUserRole();
    fetchApplications();
  }, []);

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
      // Silent fail for role check
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Application[]>(`/applications`);
      setApplications(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      showToast.error(error.message || "Failed to load applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };


  const updateStatus = async (id: string, status: Application["status"]) => {
    try {
      await apiPut(`/applications/${id}/status`, { status });
      showToast.success(t("statusUpdatedSuccessfully"));
      await fetchApplications();
    } catch (error: any) {
      showToast.error(error.message || "Failed to update status");
    }
  };

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    REVIEW: "bg-blue-100 text-blue-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  const statusCounts = {
    all: applications.length,
    PENDING: applications.filter((a) => a.status === "PENDING").length,
    REVIEW: applications.filter((a) => a.status === "REVIEW").length,
    APPROVED: applications.filter((a) => a.status === "APPROVED").length,
    REJECTED: applications.filter((a) => a.status === "REJECTED").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <h1 className="text-2xl md:text-3xl font-montserrat-bold text-[#121c67]">{t("applications")}</h1>
      </div>

      <DataTable
        data={applications}
        columns={[
          {
            key: "fullName",
            header: t("fullName"),
            render: (app) => <div className="font-medium text-gray-900">{app.fullName}</div>,
          },
          {
            key: "email",
            header: t("email"),
            render: (app) => <div className="text-sm text-gray-900">{app.email}</div>,
          },
          {
            key: "university",
            header: t("university"),
            render: (app) => <div className="text-sm text-gray-900">{app.university?.name || "-"}</div>,
          },
          {
            key: "program",
            header: t("program"),
            render: (app) => <div className="text-sm text-gray-900">{app.program?.name || "-"}</div>,
          },
          {
            key: "status",
            header: t("status"),
            render: (app) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[app.status]}`}>
                {t(app.status.toLowerCase() + "Review") || app.status}
              </span>
            ),
          },
          {
            key: "payment",
            header: t("payment"),
            render: (app) =>
              app.paymentStatus ? (
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    app.paymentStatus === "paid" || app.paymentStatus === "completed"
                      ? "bg-green-100 text-green-800"
                      : app.paymentStatus === "failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {app.paymentStatus}
                </span>
              ) : (
                <span className="text-gray-400 text-xs">-</span>
              ),
          },
          {
            key: "date",
            header: t("date"),
            render: (app) => (
              <div className="text-sm text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</div>
            ),
          },
          {
            key: "actions",
            header: t("actions"),
            render: (app) => (
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/applications/${app.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                    {t("viewDetails")}
                  </Button>
                </Link>
                {userRole && canAccess(userRole, "applications", "update") && (
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value as Application["status"])}
                    className="text-xs border rounded px-2 py-1 focus:ring-2 focus:ring-[#5260ce]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="PENDING">{t("pending")}</option>
                    <option value="REVIEW">{t("review")}</option>
                    <option value="APPROVED">{t("approved")}</option>
                    <option value="REJECTED">{t("rejected")}</option>
                  </select>
                )}
              </div>
            ),
          },
        ]}
        searchable
        searchPlaceholder={t("searchApplications")}
        searchKeys={["fullName", "email"]}
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "all", label: `${t("allStatus")} (${statusCounts.all})` },
              { value: "PENDING", label: `${t("pending")} (${statusCounts.PENDING})` },
              { value: "REVIEW", label: `${t("review")} (${statusCounts.REVIEW})` },
              { value: "APPROVED", label: `${t("approved")} (${statusCounts.APPROVED})` },
              { value: "REJECTED", label: `${t("rejected")} (${statusCounts.REJECTED})` },
            ],
          },
        ]}
        pagination={{
          page: 1,
          pageSize: 10,
          total: applications.length,
          onPageChange: () => {},
        }}
        emptyMessage="No applications found"
        loading={loading}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Applications</div>
          <div className="text-2xl font-bold text-[#121c67]">{statusCounts.all}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow border border-yellow-200 p-4">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-800">{statusCounts.PENDING}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow border border-green-200 p-4">
          <div className="text-sm text-gray-600">Approved</div>
          <div className="text-2xl font-bold text-green-800">{statusCounts.APPROVED}</div>
        </div>
        <div className="bg-red-50 rounded-lg shadow border border-red-200 p-4">
          <div className="text-sm text-gray-600">Rejected</div>
          <div className="text-2xl font-bold text-red-800">{statusCounts.REJECTED}</div>
        </div>
      </div>
    </div>
  );
}

