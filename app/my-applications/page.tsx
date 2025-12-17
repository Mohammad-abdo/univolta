"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
import Link from "next/link";
import { FileText, CheckCircle, Clock, XCircle, Eye } from "lucide-react";
import { t } from "@/lib/i18n";

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  status: "PENDING" | "REVIEW" | "APPROVED" | "REJECTED";
  notes?: string;
  createdAt: string;
  university?: { id: string; name: string; slug: string };
  program?: { id: string; name: string; slug: string };
  applicationFee?: number;
  additionalFee?: number;
  totalFee?: number;
  paymentStatus?: string;
  payment?: {
    id: string;
    paymentStatus: string;
    paidAt?: string;
    amount?: number;
    currency?: string;
  };
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        setAuthenticated(true);
        fetchApplications();
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      window.location.href = "/login";
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Application[]>("/applications");
      console.log("✅ Fetched applications for student:", data);
      if (Array.isArray(data)) {
        setApplications(data);
        console.log(`✅ Found ${data.length} application(s)`);
      } else {
        console.error("❌ Applications data is not an array:", data);
        setApplications([]);
      }
    } catch (error: any) {
      console.error("❌ Error fetching applications:", error);
      console.error("Error details:", error.message || error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    PENDING: {
      icon: Clock,
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      label: t("pendingReview"),
    },
    REVIEW: {
      icon: FileText,
      color: "bg-blue-100 text-blue-800 border-blue-300",
      label: t("underReview"),
    },
    APPROVED: {
      icon: CheckCircle,
      color: "bg-green-100 text-green-800 border-green-300",
      label: t("approved"),
    },
    REJECTED: {
      icon: XCircle,
      color: "bg-red-100 text-red-800 border-red-300",
      label: t("rejected"),
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-64">{t("loading")}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafe] pb-16 md:pb-0">
      <Navbar />
      <main className="pt-0 md:pt-[120px] pb-4 md:pb-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-5">
          <div className="mb-6 md:mb-8">
            <h1 className="font-montserrat-bold text-2xl md:text-[34px] text-[#121c67] mb-2">
              {t("myApplications")}
            </h1>
            <p className="text-sm md:text-base text-gray-600">{t("trackStatus")}</p>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-6 md:p-12 text-center">
              <FileText className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="font-montserrat-semibold text-lg md:text-xl text-[#121c67] mb-2">
                {t("noApplications")}
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-6">
                {t("startJourney")}
              </p>
              <Button
                className="bg-[#5260ce] hover:bg-[#4350b0] text-white text-sm md:text-base"
                asChild
              >
                <Link href="/universities">{t("browseUniversities")}</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {applications.map((app) => {
                const StatusIcon = statusConfig[app.status].icon;
                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3 mb-3">
                          <div
                            className={`flex items-center gap-2 px-2 md:px-3 py-1 rounded-full border ${statusConfig[app.status].color}`}
                          >
                            <StatusIcon className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="font-montserrat-semibold text-xs md:text-sm">
                              {statusConfig[app.status].label}
                            </span>
                          </div>
                          {app.paymentStatus && (
                            <span className={`text-xs md:text-sm px-2 py-1 rounded-full font-semibold ${
                              app.paymentStatus.toLowerCase() === "paid" 
                                ? "bg-green-100 text-green-800" 
                                : app.paymentStatus.toLowerCase() === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              Payment: {app.paymentStatus}
                            </span>
                          )}
                          {app.payment?.paymentStatus && (
                            <span className={`text-xs md:text-sm px-2 py-1 rounded-full font-semibold ${
                              app.payment.paymentStatus.toLowerCase() === "completed" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              Status: {app.payment.paymentStatus}
                            </span>
                          )}
                        </div>

                        <h3 className="font-montserrat-bold text-lg md:text-xl text-[#121c67] mb-2">
                          {app.program?.name || t("program")}
                        </h3>
                        <p className="text-sm md:text-base text-gray-600 mb-1">
                          {app.university?.name || t("university")}
                        </p>
                        <p className="text-xs md:text-sm text-gray-500 mb-4">
                          Applied on {new Date(app.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>

                        {(app.applicationFee || app.totalFee) && (
                          <div className="flex flex-col sm:flex-row gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                            {app.applicationFee && (
                              <span>Application Fee: ${app.applicationFee}</span>
                            )}
                            {app.totalFee && (
                              <span className="font-semibold">Total: ${app.totalFee}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="border-[#5260ce] text-[#5260ce] text-sm md:text-base w-full md:w-auto"
                          asChild
                        >
                          <Link href={`/my-applications/${app.id}`}>
                            <Eye className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                            {t("viewDetails")}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

