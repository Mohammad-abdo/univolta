"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Eye, FileText, Edit, Trash2, Ban, CheckCircle, X } from "lucide-react";
import { apiGet, apiDelete, apiRequest } from "@/lib/api";
import { showToast } from "@/lib/toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

interface Application {
  id: string;
  fullName: string;
  email: string;
  status: string;
  isBlocked?: boolean;
  blockedReason?: string;
  createdAt: string;
  program: {
    name: string;
  } | null;
  payment: {
    paymentStatus: string;
    amount: number;
  } | null;
  _count: {
    documents: number;
  };
}

export default function PartnerStudentsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [blockedFilter, setBlockedFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "block" | "unblock" | "delete" | null;
    id: string | null;
    name: string | null;
    reason?: string;
  }>({
    open: false,
    type: null,
    id: null,
    name: null,
  });
  const [blockReason, setBlockReason] = useState("");

  useEffect(() => {
    fetchApplications();
  }, [search, statusFilter, blockedFilter, page]);

  const fetchApplications = async () => {
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

      if (blockedFilter !== "all") {
        params.append("isBlocked", blockedFilter === "blocked" ? "true" : "false");
      }

      const data = await apiGet(`/partner/applications?${params.toString()}`);
      setApplications(data.applications || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error: any) {
      showToast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "REVIEW":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
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

  const handleBlock = async (id: string, isBlocked: boolean, reason?: string) => {
    if (isBlocked && !reason) {
      setConfirmDialog({
        open: true,
        type: "block",
        id,
        name: null,
      });
      setBlockReason("");
      return;
    }
    
    setConfirmDialog({
      open: true,
      type: isBlocked ? "block" : "unblock",
      id,
      name: null,
      reason: reason || undefined,
    });
  };

  const handleDelete = async (id: string, name: string) => {
    setConfirmDialog({
      open: true,
      type: "delete",
      id,
      name,
    });
  };

  const confirmAction = async () => {
    if (!confirmDialog.id || !confirmDialog.type) return;

    const { id, type, reason } = confirmDialog;
    let blockedReason = reason || blockReason;

    try {
      if (type === "block" || type === "unblock") {
        if (type === "block" && !blockedReason) {
          showToast.error(t("blockingReasonRequired"));
          return;
        }
        await apiRequest(`/partner/applications/${id}/block`, {
          method: "PATCH",
          body: JSON.stringify({
            isBlocked: type === "block",
            blockedReason: type === "block" ? blockedReason : undefined,
          }),
        });
        showToast.success(type === "block" ? t("studentBlockedSuccessfully") : t("studentUnblockedSuccessfully"));
        fetchApplications();
      } else if (type === "delete") {
        await apiDelete(`/partner/applications/${id}`);
        showToast.success(t("studentDeletedSuccessfully"));
        fetchApplications();
      }
      setConfirmDialog({ open: false, type: null, id: null, name: null });
      setBlockReason("");
    } catch (error: any) {
      if (type === "block" || type === "unblock") {
        showToast.error(error.message || (type === "block" ? t("failedToBlockStudent") : t("failedToUnblockStudent")));
      } else {
        showToast.error(error.message || t("failedToDeleteStudent"));
      }
    }
  };

  const cancelAction = () => {
    setConfirmDialog({ open: false, type: null, id: null, name: null });
    setBlockReason("");
  };

  if (loading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">
          {t("students") || "Students"}
        </h1>
        <Link href="/dashboard/partner/students/add">
          <Button className="bg-[#5260ce] hover:bg-[#4350b0]">
            <Plus className="w-4 h-4 mr-2" />
            {t("addStudent") || "Add Student"}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t("searchStudents") || "Search by name or email..."}
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
            <option value="PENDING">{t("pending")}</option>
            <option value="REVIEW">{t("review")}</option>
            <option value="APPROVED">{t("approved")}</option>
            <option value="REJECTED">{t("rejected")}</option>
          </select>
          <select
            value={blockedFilter}
            onChange={(e) => {
              setBlockedFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">{t("allStudents")}</option>
            <option value="blocked">{t("blocked")}</option>
            <option value="active">{t("active")}</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("name")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("email")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("program")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("status")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("payment")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("documents")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("blockStatus")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  {t("noApplications")}
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className={`hover:bg-gray-50 ${app.isBlocked ? "bg-red-50" : ""}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{app.fullName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{app.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{app.program?.name || t("nA")}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {app.payment ? (
                      <div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                            app.payment.paymentStatus
                          )}`}
                        >
                          {app.payment.paymentStatus}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          ${app.payment.amount}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">{t("noPayment") || "No payment"}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <FileText className="w-4 h-4" />
                      {app._count.documents}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {app.isBlocked ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                        <Ban className="w-3 h-3" />
                        {t("blocked") || "Blocked"}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {t("active") || "Active"}
                      </span>
                    )}
                    {app.blockedReason && (
                      <div className="text-xs text-red-600 mt-1" title={app.blockedReason}>
                        {app.blockedReason.length > 30 ? app.blockedReason.substring(0, 30) + "..." : app.blockedReason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/partner/students/${app.id}`}
                        className="text-[#5260ce] hover:text-[#4350b0]"
                        title={t("view") || "View"}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/partner/students/${app.id}/edit`}
                        className="text-blue-600 hover:text-blue-700"
                        title={t("edit") || "Edit"}
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleBlock(app.id, !app.isBlocked, app.blockedReason || undefined)}
                        className={`${app.isBlocked ? "text-green-600 hover:text-green-700" : "text-orange-600 hover:text-orange-700"}`}
                        title={app.isBlocked ? t("unblock") || "Unblock" : t("block") || "Block"}
                      >
                        {app.isBlocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(app.id, app.fullName)}
                        className="text-red-600 hover:text-red-700"
                        title={t("delete") || "Delete"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            {t("previous") || "Previous"}
          </Button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {t("page") || "Page"} {page} {t("of") || "of"} {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            {t("next") || "Next"}
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {confirmDialog.type === "block" && t("block")}
                {confirmDialog.type === "unblock" && t("unblock")}
                {confirmDialog.type === "delete" && t("delete")}
              </h3>
              <button
                onClick={cancelAction}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              {confirmDialog.type === "block" && t("confirmBlockStudent")}
              {confirmDialog.type === "unblock" && t("confirmUnblockStudent")}
              {confirmDialog.type === "delete" && t("confirmDeleteStudent").replace("{name}", confirmDialog.name || "")}
            </p>
            {confirmDialog.type === "block" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("provideBlockReason")}
                </label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
                  rows={3}
                  placeholder={t("provideBlockReason")}
                />
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelAction}>
                {t("cancel")}
              </Button>
              <Button
                className={confirmDialog.type === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-[#5260ce] hover:bg-[#4350b0]"}
                onClick={confirmAction}
              >
                {confirmDialog.type === "block" && t("block")}
                {confirmDialog.type === "unblock" && t("unblock")}
                {confirmDialog.type === "delete" && t("delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



