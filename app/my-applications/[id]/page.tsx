"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, FileText, CheckCircle, XCircle,
  Download, Upload, MessageCircle, Phone, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentHeader } from "@/components/student-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { showToast } from "@/lib/toast";
import { API_BASE_URL } from "@/lib/constants";
import { getImageUrl } from "@/lib/image-utils";
import { apiGet } from "@/lib/api";
import { t } from "@/lib/i18n";

/* ─── Types ─────────────────────────────────────────────────────── */
interface Application {
  id: string;
  fullName: string;
  email: string;
  status: "PENDING" | "REVIEW" | "APPROVED" | "REJECTED";
  notes?: string;
  additionalNotes?: string;
  additionalServices?: string[];
  createdAt: string;
  updatedAt: string;
  university?: { id: string; name: string; slug: string; logoUrl?: string; country?: string };
  program?: { id: string; name: string; slug: string; degree?: string };
  applicationFee?: number;
  additionalFee?: number;
  totalFee?: number;
  remainingBalance?: number;
  arrivalDate?: string;
  acceptanceLetterUrl?: string;
  acceptanceLetterFileName?: string;
  payment?: {
    id: string; amount: number; currency: string;
    paymentMethod: string; paymentStatus: string;
    transactionId?: string; paidAt?: string;
    invoiceUrl?: string; invoiceFileName?: string;
  };
  statusHistory?: StatusHistoryItem[];
  advisor?: {
    id: string;
    name: string;
    title: string;
    institution: string | null;
    availability: string | null;
    whatsappE164: string;
  } | null;
}

interface DocumentItem {
  id: string; documentType: string; fileName: string;
  fileUrl: string; fileSize?: number; uploadedAt: string;
  documentStatus?: string;  // pending | approved | rejected
  rejectionReason?: string;
}

interface StatusHistoryItem {
  id: string; previousStatus?: string; newStatus: string;
  changedBy?: string; reason?: string; notes?: string; createdAt: string;
}

interface UserData { id: string; name: string; email: string }

/* ─── Status config ─────────────────────────────────────────────── */
const STATUS_CFG: Record<string, { pill: string }> = {
  PENDING:  { pill: "bg-orange-50 text-orange-500 border-orange-100" },
  REVIEW:   { pill: "bg-blue-50   text-blue-500   border-blue-100"   },
  APPROVED: { pill: "bg-green-50  text-green-600  border-green-100"  },
  REJECTED: { pill: "bg-red-50    text-red-500    border-red-100"    },
};

function appStatusLabel(code: string): string {
  switch (code) {
    case "PENDING":
      return t("partnerStatusPending");
    case "REVIEW":
      return t("partnerStatusInReview");
    case "APPROVED":
      return t("partnerStatusApproved");
    case "REJECTED":
      return t("partnerStatusRejected");
    default:
      return t("partnerStatusPending");
  }
}

function docTypeLabel(documentType: string): string {
  const m: Record<string, string> = {
    high_school_card: t("docTypeHighSchool"),
    language_proof: t("docTypeLanguage"),
    passport: t("docTypePassport"),
    personal_photo: t("docTypePhoto"),
    statement: t("docTypeStatement"),
    other: t("docTypeOther"),
    FLIGHT_TICKET: t("docTypeFlight"),
  };
  return (
    m[documentType] ||
    documentType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function advisorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
}

/* ─── Progress steps ─────────────────────────────────────────────── */
const STEP_KEYS = [
  "appStepTimeline",
  "appStepDocsVerified",
  "appStepUnderReview",
  "appStepDecision",
  "appStepOfferAccepted",
] as const;

function stepsDone(s: string) {
  switch (s) {
    case "PENDING":  return 1;
    case "REVIEW":   return 3;
    case "APPROVED": return 5;
    case "REJECTED": return 3;
    default: return 1;
  }
}

/* ─── Admission update card ─────────────────────────────────────── */
function UpdateCard({ item }: { item: StatusHistoryItem }) {
  const isApproved = item.newStatus === "APPROVED";
  const isRejected = item.newStatus === "REJECTED";
  const isReview   = item.newStatus === "REVIEW";

  const title = isApproved
    ? t("appDetailBannerAcceptedTitle")
    : isRejected
      ? t("appDetailBannerRejectedTitle")
      : isReview
        ? t("appDetailBannerReviewTitle")
        : t("appDetailBannerSubmittedTitle");

  const desc = isApproved
    ? t("appDetailBannerAcceptedSubtitle")
    : isRejected
      ? item.reason || t("appDetailBannerRejectedSubtitle")
      : isReview
        ? t("appDetailBannerReviewSubtitle")
        : t("appDetailBannerSubmittedSubtitle");

  const card  = isApproved ? "border-green-200 bg-green-50"
    : isRejected             ? "border-red-200 bg-red-50"
    :                          "border-blue-200 bg-blue-50";
  const dot   = isApproved ? "bg-green-500" : isRejected ? "bg-red-500" : "bg-blue-500";
  const title_ = isApproved ? "text-green-700" : isRejected ? "text-red-600" : "text-blue-700";

  return (
    <div className={`rounded-xl border p-4 ${card}`}>
      <div className="flex items-start gap-2.5 mb-1.5">
        <div className={`w-5 h-5 rounded-full ${dot} flex items-center justify-center shrink-0 mt-0.5`}>
          {isRejected
            ? <XCircle className="w-3 h-3 text-white" />
            : <CheckCircle className="w-3 h-3 text-white" />}
        </div>
        <p className={`font-semibold text-sm ${title_}`}>{title}</p>
      </div>
      <p className="text-xs text-[#718096] leading-relaxed ml-7">{desc}</p>
      <p className="text-[11px] text-[#A0AEC0] mt-2 ml-7">{fmtDate(item.createdAt)}</p>
    </div>
  );
}

/* ─── Payment badge ─────────────────────────────────────────────── */
function PayBadge({ status, appStatus }: { status?: string; appStatus: string }) {
  const s = status?.toLowerCase();
  if (s === "completed" || s === "paid")
    return <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100 font-semibold">{t("payBadgePaid")}</span>;
  if (appStatus === "REJECTED")
    return <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200 font-semibold">{t("payBadgeCanceled")}</span>;
  return <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-500 border border-orange-100 font-semibold">{t("payBadgePending")}</span>;
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appId  = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : null;

  const [user,        setUser]        = useState<UserData | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [documents,   setDocuments]   = useState<DocumentItem[]>([]);
  const [loading,     setLoading]     = useState(true);

  const [flightFile,       setFlightFile]       = useState<File | null>(null);
  const [uploadingFlight,  setUploadingFlight]  = useState(false);
  const [flightUploaded,   setFlightUploaded]   = useState(false);
  const [invoiceFile,      setInvoiceFile]      = useState<File | null>(null);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);

  useEffect(() => { if (appId) init(); }, [appId]);

  const init = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.push("/login"); return; }
    try {
      const me = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (me.status === 401) {
        // Definitively invalid — log out
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/login"); return;
      }
      if (me.ok) setUser(await me.json());
      // Non-401 errors (network/server) — still allow the page to load
    } catch {
      // Network error — continue loading page
    }
    fetchAll();
  };

  const fetchAll = async () => {
    if (!appId) return;
    try {
      setLoading(true);
      const [app, docs] = await Promise.all([
        apiGet<Application>(`/applications/${appId}`),
        fetch(`${API_BASE_URL}/applications/${appId}/documents`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
        }).then((r) => r.ok ? r.json() : []).catch(() => []),
      ]);
      setApplication(app);
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch { setApplication(null); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/");
  };

  const handleFlightUpload = async () => {
    if (!flightFile || !appId) return;
    setUploadingFlight(true);
    try {
      const fd = new FormData();
      fd.append("document", flightFile);
      fd.append("documentType", "FLIGHT_TICKET");
      const res = await fetch(`${API_BASE_URL}/applications/${appId}/documents`, {
        method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` }, body: fd,
      });
      if (!res.ok) throw new Error(t("toastUploadFailed"));
      setFlightFile(null); setFlightUploaded(true);
      showToast.success(t("toastFlightTicketUploaded")); fetchAll();
    } catch (e: any) { showToast.error(e.message || t("toastUploadFailed")); }
    finally { setUploadingFlight(false); }
  };

  const handleInvoiceUpload = async () => {
    if (!invoiceFile) return;
    setUploadingInvoice(true);
    try {
      const fd = new FormData();
      fd.append("invoice", invoiceFile);
      const res = await fetch(`${API_BASE_URL}/payments/${appId}/invoice`, {
        method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` }, body: fd,
      });
      if (!res.ok) throw new Error(t("toastUploadFailed"));
      setInvoiceFile(null); showToast.success(t("toastInvoiceUploaded")); fetchAll();
    } catch (e: any) { showToast.error(e.message || t("toastUploadFailed")); }
    finally { setUploadingInvoice(false); }
  };

  /* Loading / error */
  if (loading || !application) {
    return (
      <div className="min-h-screen bg-white">
        <StudentHeader user={user} onLogout={handleLogout} activePage="applications" />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          {loading
            ? <div className="w-10 h-10 border-4 border-[#5260ce] border-t-transparent rounded-full animate-spin" />
            : <div className="text-center">
                <p className="text-[#718096] mb-4">{t("applicationNotFound")}</p>
                <Button asChild><Link href="/profile">{t("appDetailBackToProfile")}</Link></Button>
              </div>
          }
        </div>
      </div>
    );
  }

  const cfg      = STATUS_CFG[application.status] ?? STATUS_CFG.PENDING;
  const done     = stepsDone(application.status);
  const services = Array.isArray(application.additionalServices) ? application.additionalServices : [];
  const logoSrc  = getImageUrl(application.university?.logoUrl || "") || null;
  const shortId  = `OX-${new Date(application.createdAt).getFullYear()}-R-${application.id.slice(0, 4).toUpperCase()}`;
  const hasFlight = flightUploaded || documents.some((d) => d.documentType === "FLIGHT_TICKET");
  const totalPaid = application.payment && (
    application.payment.paymentStatus === "completed" || application.payment.paymentStatus === "paid"
  ) ? Number(application.payment.amount) : 0;

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      <StudentHeader user={user} onLogout={handleLogout} activePage="applications" />

      <main className="pt-[64px]">
        <div className="max-w-[900px] mx-auto px-4 md:px-6 py-6">

          {/* Back */}
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center gap-1.5 text-[#718096] text-sm mb-5 hover:text-[#1B2559] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {t("appDetailBack")}
          </button>

          {/* ── App Header ─────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5">
            <div className="flex items-start gap-4">
              {logoSrc ? (
                <div className="relative w-14 h-14 rounded-full overflow-hidden border border-gray-200 bg-white shrink-0">
                  <Image src={logoSrc} alt="" fill className="object-contain p-1.5" unoptimized />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#EBF3FD] flex items-center justify-center text-[#5260ce] font-bold text-xl shrink-0">
                  {application.university?.name?.charAt(0) || "U"}
                </div>
              )}
              <div>
                <h1 className="font-bold text-[19px] text-[#1B2559] leading-tight">
                  {application.program?.name || t("appDetailProgramFallback")}
                </h1>
                <p className="text-sm text-[#4A5568] mt-0.5">{application.university?.name || t("appDetailUniversityFallback")}</p>
                {application.program?.degree && (
                  <p className="text-xs text-[#A0AEC0] mt-0.5">{application.program.degree}</p>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-[#A0AEC0] mb-1">{t("appDetailApplicationIdPrefix")} {shortId}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${cfg.pill}`}>
                {appStatusLabel(application.status)}
              </span>
              <p className="text-xs text-[#A0AEC0] mt-1.5">
                {t("appDetailLastUpdatedPrefix")} {fmtDate(application.updatedAt || application.createdAt)}
              </p>
            </div>
          </div>

          {/* ── Progress Bar ─────────────────────────────────────────── */}
          <div className="bg-[#EEF2FF] rounded-2xl px-5 md:px-8 py-5 mb-6 overflow-x-auto">
            <div className="flex items-start min-w-[520px]">
              {STEP_KEYS.map((stepKey, i) => {
                const complete = i < done;
                return (
                  <div key={stepKey} className="flex items-start flex-1">
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        complete ? "bg-[#5260ce] border-[#5260ce]" : "bg-white border-gray-200"
                      }`}>
                        {complete
                          ? <CheckCircle className="w-4 h-4 text-white fill-white" />
                          : <div className="w-2 h-2 rounded-full bg-gray-300" />
                        }
                      </div>
                      <p className={`text-[10px] md:text-xs mt-1.5 text-center leading-tight max-w-[72px] font-semibold ${complete ? "text-[#1B2559]" : "text-[#A0AEC0]"}`}>
                        {t(stepKey)}
                      </p>
                      {complete && i === 0 && (
                        <p className="text-[9px] text-[#A0AEC0] text-center mt-0.5">{fmtDate(application.createdAt)}</p>
                      )}
                    </div>
                    {i < STEP_KEYS.length - 1 && (
                      <div className={`flex-1 h-0.5 mt-4 mx-2 rounded-full ${i < done - 1 ? "bg-[#5260ce]" : "bg-gray-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Application Advisor */}
          {application.advisor && (
            <div className="mb-6 bg-white rounded-2xl border border-gray-100 p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-4 min-w-0">
                <div
                  className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-[#5260ce] to-[#75d3f7]"
                  aria-hidden
                >
                  {advisorInitials(application.advisor.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1B2559] uppercase tracking-wider mb-0.5">
                    {t("appDetailApplicationAdvisor")}
                  </p>
                  <h3 className="font-bold text-lg text-[#1B2559] leading-tight">{application.advisor.name}</h3>
                  <p className="text-sm text-[#4A5568]">{application.advisor.title}</p>
                  {application.advisor.institution ? (
                    <p className="text-sm text-[#718096] mt-0.5">{application.advisor.institution}</p>
                  ) : null}
                  {application.advisor.availability ? (
                    <p className="text-xs text-[#A0AEC0] mt-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />
                      <span>{application.advisor.availability}</span>
                    </p>
                  ) : null}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 border-[#CBD5F5] text-[#1B2559] hover:bg-[#EEF2FF] rounded-full px-5"
                onClick={() => {
                  const digits = application.advisor!.whatsappE164.replace(/\D/g, "");
                  if (digits) window.open(`https://wa.me/${digits}`, "_blank", "noopener,noreferrer");
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {t("appDetailSendMessage")}
              </Button>
            </div>
          )}

          {/* ── Two-column body ──────────────────────────────────────── */}
          <div className="grid md:grid-cols-2 gap-5">

            {/* LEFT */}
            <div className="space-y-4">

              {/* Services Required */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-[#1B2559] mb-3 text-[15px]">{t("appDetailServicesRequired")}</h3>
                <div className="divide-y divide-gray-50">
                  {services.length > 0 ? (
                    services.map((s, i) => (
                      <div key={i} className="py-2.5 text-sm text-[#4A5568]">{s}</div>
                    ))
                  ) : (
                    <div className="py-2 text-sm text-[#4A5568]">{t("appDetailAdmissionDefault")}</div>
                  )}
                </div>
              </div>

              {/* Services Note */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-[#1B2559] mb-3 text-[15px]">{t("appDetailServicesNote")}</h3>
                <p className="text-sm text-[#4A5568]">
                  {application.additionalNotes || t("appDetailAdmissionDefault")}
                </p>
              </div>

              {/* Payment History */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-[#1B2559] mb-4 text-[15px]">{t("appDetailPaymentHistory")}</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-2 text-xs font-medium text-[#A0AEC0]">{t("appDetailColDate")}</th>
                      <th className="text-left pb-2 text-xs font-medium text-[#A0AEC0]">{t("appDetailColDescription")}</th>
                      <th className="text-left pb-2 text-xs font-medium text-[#A0AEC0]">{t("appDetailColAmount")}</th>
                      <th className="text-left pb-2 text-xs font-medium text-[#A0AEC0]">{t("appDetailColStatus")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {application.applicationFee ? (
                      <tr className="border-b border-gray-50">
                        <td className="py-3 text-[#718096] text-xs">{fmtDate(application.createdAt)}</td>
                        <td className="py-3 text-[#4A5568]">{t("appDetailFeeApplication")}</td>
                        <td className="py-3 font-semibold text-[#1B2559]">${Number(application.applicationFee).toFixed(0)}</td>
                        <td className="py-3"><PayBadge status={application.payment?.paymentStatus} appStatus={application.status} /></td>
                      </tr>
                    ) : null}
                    {application.additionalFee && Number(application.additionalFee) > 0 ? (
                      <tr className="border-b border-gray-50">
                        <td className="py-3 text-[#718096] text-xs">{fmtDate(application.updatedAt || application.createdAt)}</td>
                        <td className="py-3 text-[#4A5568]">{t("appDetailFeeDeposit")}</td>
                        <td className="py-3 font-semibold text-[#1B2559]">${Number(application.additionalFee).toFixed(0)}</td>
                        <td className="py-3"><PayBadge status={application.payment?.paymentStatus} appStatus={application.status} /></td>
                      </tr>
                    ) : null}
                    {!application.applicationFee && !application.additionalFee && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-[#A0AEC0] text-xs">{t("appDetailNoPaymentRecords")}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden bg-gray-50/60">
                  <div className="flex justify-between px-4 py-2.5 text-sm border-b border-gray-100">
                    <span className="text-[#718096]">{t("appDetailTotalPaid")}</span>
                    <span className="font-semibold text-[#1B2559]">${totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2.5 text-sm">
                    <span className="text-[#718096]">{t("appDetailRemainingBalance")}</span>
                    <span className={`font-semibold ${Number(application.remainingBalance ?? 0) > 0 ? "text-orange-600" : "text-[#1B2559]"}`}>
                      ${Number(application.remainingBalance ?? 0).toLocaleString()}
                    </span>
                  </div>
                  {application.arrivalDate && (
                    <div className="flex justify-between px-4 py-2.5 text-sm border-t border-gray-100">
                      <span className="text-[#718096]">{t("appDetailArrivalDate")}</span>
                      <span className="font-semibold text-sky-700">
                        {new Date(application.arrivalDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Acceptance Letter download (student) */}
                {application.status === "APPROVED" && application.acceptanceLetterUrl && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                    <span className="text-emerald-600 text-xl">🎓</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-emerald-800">{t("appDetailAcceptanceLetterAvailable")}</p>
                      <p className="text-xs text-emerald-600 truncate">{application.acceptanceLetterFileName || "acceptance-letter"}</p>
                    </div>
                    <a
                      href={application.acceptanceLetterUrl.startsWith("http")
                        ? application.acceptanceLetterUrl
                        : `${API_BASE_URL.replace("/api/v1", "")}${application.acceptanceLetterUrl}`}
                      target="_blank" rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1 text-xs font-semibold text-emerald-700 border border-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> {t("download")}
                    </a>
                  </div>
                )}

                {/* Payment actions */}
                {application.payment?.invoiceUrl ? (
                  <a
                    href={application.payment.invoiceUrl.startsWith("http")
                      ? application.payment.invoiceUrl
                      : `${API_BASE_URL.replace("/api/v1", "")}${application.payment.invoiceUrl}`}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-4 flex items-center gap-2 text-sm text-[#5260ce] hover:underline"
                  >
                    <Download className="w-4 h-4" /> {t("appDetailDownloadInvoiceLink")}
                  </a>
                ) : application.payment ? (
                  <div className="mt-4 space-y-2">
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 text-gray-600" />
                    <Button onClick={handleInvoiceUpload} disabled={!invoiceFile || uploadingInvoice}
                      className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white text-sm h-9 rounded-xl">
                      {uploadingInvoice ? t("uploadingEllipsis") : t("appDetailBtnUploadInvoice")}
                    </Button>
                  </div>
                ) : (
                  <Button className="mt-4 bg-[#1B2559] hover:bg-[#0d1554] text-white text-sm h-9 px-5 rounded-xl" asChild>
                    <Link href={`/universities/${application.university?.slug || ""}/register`}>Make Payment</Link>
                  </Button>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-4">

              {/* Submitted Documents */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#1B2559] text-[15px]">{t("uploadedDocuments")}</h3>
                  <label className="cursor-pointer">
                    <input type="file" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f && appId) uploadDoc(f, appId, fetchAll);
                    }} />
                    <span className="flex items-center gap-1.5 text-xs text-[#5260ce] border border-[#5260ce]/30 px-3 py-1.5 rounded-lg hover:bg-[#5260ce]/5 transition-colors font-semibold">
                      <Upload className="w-3.5 h-3.5" /> {t("appDetailUploadDocument")}
                    </span>
                  </label>
                </div>

                {documents.length === 0 ? (
                  <p className="text-sm text-[#A0AEC0] text-center py-6">{t("appDetailNoDocumentsYet")}</p>
                ) : (
                  <ul className="space-y-0">
                    {documents.map((doc) => {
                      const label   = docTypeLabel(doc.documentType);
                      const url     = doc.fileUrl.startsWith("http") ? doc.fileUrl : `${API_BASE_URL.replace("/api/v1", "")}${doc.fileUrl}`;
                      // Use per-doc status if available, else fall back to app status
                      const perDocStatus = doc.documentStatus;
                      const docStat = perDocStatus === "approved" ? t("docStatusVerified")
                        : perDocStatus === "rejected" ? t("docStatusRejected")
                        : perDocStatus === "pending" ? t("docStatusPendingReview")
                        : application.status === "APPROVED" ? t("docStatusVerified")
                        : application.status === "REJECTED" ? t("docStatusRejected")
                        : t("docStatusPending");
                      const badge = (perDocStatus === "approved" || (!perDocStatus && application.status === "APPROVED"))
                        ? "bg-green-50 text-green-600 border-green-100"
                        : (perDocStatus === "rejected" || (!perDocStatus && application.status === "REJECTED"))
                        ? "bg-red-50 text-red-500 border-red-100"
                        : "bg-orange-50 text-orange-500 border-orange-100";
                      return (
                        <li key={doc.id} className="py-3 border-b border-gray-50 last:border-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-[#EBF3FD] flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4 text-[#5B9BD5]" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm text-[#1B2559] truncate">{label}</p>
                                <p className="text-xs text-[#A0AEC0]">{t("appDetailUploadedLabel")} {fmtDate(doc.uploadedAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${badge}`}>{docStat}</span>
                              <a href={url} target="_blank" rel="noopener noreferrer"
                                className="text-[#A0AEC0] hover:text-[#5260ce] transition-colors">
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                          {doc.documentStatus === "rejected" && doc.rejectionReason && (
                            <p className="mt-1.5 ml-10 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">
                              ⚠ {t("appDetailDocRejectedPrefix")} {doc.rejectionReason}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Flight ticket upload */}
                {application.status === "APPROVED" && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-sm text-[#1B2559] mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      {t("appDetailUploadFlightHeading")}
                    </h4>
                    {hasFlight ? (
                      <p className="text-sm text-green-600 flex items-center gap-1.5 font-semibold">
                        <CheckCircle className="w-4 h-4" /> {t("appDetailFlightUploaded")}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setFlightFile(e.target.files?.[0] || null)}
                          className="w-full text-xs border border-gray-200 rounded-lg p-2 text-gray-600" />
                        <Button onClick={handleFlightUpload} disabled={!flightFile || uploadingFlight}
                          className="w-full bg-green-600 hover:bg-green-700 text-white text-sm h-9 rounded-xl">
                          {uploadingFlight ? t("uploadingEllipsis") : t("appDetailBtnUploadFlight")}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Admission Updates */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-[#1B2559] mb-4 text-[15px]">Admission Updates</h3>
                <div className="space-y-3">
                  {application.statusHistory && application.statusHistory.length > 0
                    ? [...application.statusHistory].reverse().map((item) => (
                        <UpdateCard key={item.id} item={item} />
                      ))
                    : <UpdateCard item={{ id: "init", newStatus: application.status, reason: application.notes, createdAt: application.createdAt }} />
                  }
                </div>
              </div>
            </div>
          </div>

          {/* ── Application Advisor ──────────────────────────────────── */}
          <div className="mt-5 bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-[#1B2559] mb-4 text-[15px]">{t("appDetailApplicationAdvisor")}</h3>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Avatar with initials */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5260ce] to-[#75d3f7] flex items-center justify-center text-white font-bold text-lg shrink-0 select-none">
                  SJ
                </div>
                <div>
                  <p className="font-bold text-[#1B2559]">Sarah Johnson</p>
                  <p className="text-sm text-[#718096]">Senior Education Advisor</p>
                  <p className="text-sm text-[#A0AEC0]">{application.university?.name || t("companyName")}</p>
                  <p className="text-xs text-[#A0AEC0] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {t("appDetailAdvisorAvailable")}
                  </p>
                </div>
              </div>
              <Button variant="outline"
                className="border-[#5260ce]/30 text-[#5260ce] hover:bg-[#5260ce] hover:text-white rounded-xl flex items-center gap-2 shrink-0 transition-colors"
                asChild>
                <Link href="/contact">
                  <MessageCircle className="w-4 h-4" /> {t("appDetailSendMessage")}
                </Link>
              </Button>
            </div>
          </div>

          {/* ── Bottom Buttons ────────────────────────────────────────── */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Button
              className="bg-[#1B2559] hover:bg-[#0d1554] text-white font-semibold rounded-xl flex items-center gap-2 h-11 px-7"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4" /> Download Application
            </Button>
            <Button variant="outline"
              className="border-[#5260ce]/30 text-[#5260ce] hover:bg-[#5260ce] hover:text-white font-semibold rounded-xl flex items-center gap-2 h-11 px-7 transition-colors"
              asChild>
              <Link href="/contact">
                <Phone className="w-4 h-4" /> {t("appDetailContactSupport")}
              </Link>
            </Button>
          </div>

        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────── */
async function uploadDoc(file: File, appId: string, onDone: () => void) {
  const fd = new FormData();
  fd.append("document", file);
  fd.append("documentType", "other");
  try {
    const res = await fetch(`${API_BASE_URL}/applications/${appId}/documents`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
      body: fd,
    });
    if (res.ok) onDone();
  } catch {}
}
