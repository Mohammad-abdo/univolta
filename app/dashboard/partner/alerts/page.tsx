"use client";

import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { apiGet, apiRequest, apiDelete } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";

interface Alert {
  id: string;
  type: string;
  severity: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  title: string;
  message: string;
  resource?: string;
  resourceId?: string;
  isRead: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  university?: {
    id: string;
    name: string;
  };
  metadata?: any;
}

export default function PartnerAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    fetchAlerts();
  }, [page, filter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await apiGet<{
        alerts: Alert[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(`/alerts?page=${page}&limit=20&unreadOnly=${filter === "unread"}`);
      setAlerts(data.alerts);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      await apiRequest(`/alerts/${alertId}/read`, {
        method: "PATCH",
      });
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, isRead: true } : alert
        )
      );
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest("/alerts/read-all", {
        method: "PATCH",
      });
      setAlerts((prev) => prev.map((alert) => ({ ...alert, isRead: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteAlert = async (alertId: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      await apiDelete(`/alerts/${alertId}`);
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      showToast.success("Notification deleted successfully");
    } catch (error) {
      console.error("Error deleting alert:", error);
      showToast.error("Failed to delete notification");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "SUCCESS":
        return "bg-green-100 text-green-800 border-green-200";
      case "WARNING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ERROR":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "SUCCESS":
        return "✓";
      case "WARNING":
        return "⚠";
      case "ERROR":
        return "✕";
      default:
        return "ℹ";
    }
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">
          Notifications
        </h1>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => {
            setFilter("all");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => {
            setFilter("unread");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "unread"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-montserrat-regular">
              No notifications found
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !alert.isRead ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border ${getSeverityColor(
                      alert.severity
                    )}`}
                  >
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className={`text-base font-semibold ${
                              !alert.isRead ? "text-gray-900" : "text-gray-700"
                            }`}
                          >
                            {alert.title}
                          </p>
                          {!alert.isRead && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>
                            {formatDistanceToNow(new Date(alert.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          {alert.resource && (
                            <span className="px-2 py-1 bg-gray-100 rounded">
                              {alert.resource}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!alert.isRead && (
                          <button
                            onClick={() => markAsRead(alert.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            aria-label="Mark as read"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          aria-label="Delete alert"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

