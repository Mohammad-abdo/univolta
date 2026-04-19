"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { apiGet } from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
import Link from "next/link";
import { FileText, CheckCircle, Clock, XCircle, Eye, GraduationCap, ArrowRight } from "lucide-react";
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
  payment?: { id: string; paymentStatus: string; paidAt?: string; amount?: number; currency?: string };
}

const statusConfig = {
  PENDING:  { icon: Clock,        color: "bg-yellow-50 text-yellow-700 border-yellow-200", borderClass: "app-card-pending",  dot: "bg-yellow-400",  label: "" },
  REVIEW:   { icon: FileText,     color: "bg-blue-50 text-blue-700 border-blue-200",       borderClass: "app-card-review",   dot: "bg-blue-500",    label: "" },
  APPROVED: { icon: CheckCircle,  color: "bg-green-50 text-green-700 border-green-200",    borderClass: "app-card-approved", dot: "bg-green-500",   label: "" },
  REJECTED: { icon: XCircle,      color: "bg-red-50 text-red-600 border-red-200",          borderClass: "app-card-rejected", dot: "bg-red-500",     label: "" },
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) { window.location.href = "/login"; return; }
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        fetchApplications();
      } else {
        window.location.href = "/login";
      }
    } catch {
      window.location.href = "/login";
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Application[]>("/applications");
      setApplications(Array.isArray(data) ? data : []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Populate labels after statusConfig is defined
  statusConfig.PENDING.label  = t("pendingReview");
  statusConfig.REVIEW.label   = t("underReview");
  statusConfig.APPROVED.label = t("approved");
  statusConfig.REJECTED.label = t("rejected");

  return (
    <div className="min-h-screen bg-[#f9fafe] pb-16 md:pb-0">
      <Navbar />
      <main className="pt-0 md:pt-[120px] pb-8 md:pb-24">
        <div className="max-w-[900px] mx-auto px-4 md:px-5">

          {/* Page Header */}
          <ScrollReveal direction="up">
            <div className="mb-6 md:mb-8 py-6 md:py-8 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#5260ce]/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#5260ce]" />
                </div>
                <h1 className="font-montserrat-bold text-2xl md:text-3xl text-[#121c67]">
                  {t("myApplications")}
                </h1>
              </div>
              <p className="text-sm md:text-base text-[#65666f] font-montserrat-regular">{t("trackStatus")}</p>
            </div>
          </ScrollReveal>

          {/* Loading state */}
          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-9 w-32 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && applications.length === 0 && (
            <ScrollReveal direction="fade">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 md:p-16 text-center">
                <div className="w-20 h-20 rounded-full bg-[#f0f4ff] flex items-center justify-center mx-auto mb-5">
                  <GraduationCap className="w-10 h-10 text-[#5260ce]/50" />
                </div>
                <h3 className="font-montserrat-bold text-xl text-[#121c67] mb-2">{t("noApplications")}</h3>
                <p className="text-[#65666f] text-sm font-montserrat-regular mb-6 max-w-xs mx-auto">{t("startJourney")}</p>
                <Button className="bg-[#5260ce] hover:bg-[#4350b0] text-white rounded-xl px-6 shadow-[0_4px_16px_rgba(82,96,206,0.25)]" asChild>
                  <Link href="/universities" className="flex items-center gap-2">
                    {t("browseUniversities")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          )}

          {/* Application cards */}
          {!loading && applications.length > 0 && (
            <div className="space-y-4">
              {applications.map((app, index) => {
                const cfg = statusConfig[app.status];
                const StatusIcon = cfg.icon;
                return (
                  <ScrollReveal key={app.id} direction="up" delay={index * 80}>
                    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 hover:shadow-md transition-all duration-300 ${cfg.borderClass}`}>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          {/* Status row */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-montserrat-semibold ${cfg.color} ${app.status === "PENDING" ? "animate-status-pending" : ""}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {cfg.label}
                            </div>
                            {app.payment?.paymentStatus && (
                              <Badge variant="outline" className={`text-xs ${
                                app.payment.paymentStatus.toLowerCase() === "completed"
                                  ? "border-green-300 text-green-700 bg-green-50"
                                  : "border-gray-200 text-gray-600"
                              }`}>
                                Payment: {app.payment.paymentStatus}
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-montserrat-bold text-lg md:text-xl text-[#121c67] mb-1 leading-tight">
                            {app.program?.name || t("program")}
                          </h3>
                          <p className="font-montserrat-regular text-sm text-[#5260ce] mb-1">
                            {app.university?.name || t("university")}
                          </p>
                          <p className="font-montserrat-regular text-xs text-[#8b8c9a]">
                            Applied on {new Date(app.createdAt).toLocaleDateString("en-US", {
                              year: "numeric", month: "long", day: "numeric",
                            })}
                          </p>

                          {app.totalFee && (
                            <p className="mt-2 text-xs font-montserrat-semibold text-[#2e2e2e]">
                              Total: ${app.totalFee.toLocaleString()}
                            </p>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          className="border-[#5260ce] text-[#5260ce] hover:bg-[#5260ce] hover:text-white rounded-xl transition-all duration-200 flex items-center gap-2 shrink-0"
                          asChild
                        >
                          <Link href={`/my-applications/${app.id}`}>
                            <Eye className="w-4 h-4" />
                            {t("viewDetails")}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </ScrollReveal>
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
