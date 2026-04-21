"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Upload,
  MessageCircle,
  Phone,
} from "lucide-react";
import { showToast } from "@/lib/toast";
import { API_BASE_URL } from "@/lib/constants";
import { getImageUrl } from "@/lib/image-utils";
import { apiGet } from "@/lib/api";

/* ─── Types ────────────────────────────────────────────────────────────── */
interface Application {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  personalAddress?: string;
  dateOfBirth?: string;
  academicQualification?: string;
  identityNumber?: string;
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
  paymentStatus?: string;
  paymentMethod?: string;
  payment?: {
    id: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    paymentStatus: string;
    transactionId?: string;
    paidAt?: string;
    invoiceUrl?: string;
    invoiceFileName?: string;
  };
  statusHistory?: StatusHistoryItem[];
}

interface DocumentItem {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  uploadedAt: string;
}

interface StatusHistoryItem {
  id: string;
  previousStatus?: string;
  newStatus: string;
  changedBy?: string;
  reason?: string;
  notes?: string;
  createdAt: string;
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:  { label: "Pending",      color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200 text-yellow-700" },
  REVIEW:   { label: "Under Review", color: "text-blue-700",   bg: "bg-blue-50 border-blue-200 text-blue-700" },
  APPROVED: { label: "Accepted",     color: "text-green-700",  bg: "bg-green-50 border-green-200 text-green-700" },
  REJECTED: { label: "Rejected",     color: "text-red-600",    bg: "bg-red-50 border-red-200 text-red-600" },
};

const DOC_LABEL: Record<string, string> = {
  high_school_card: "High School Certificate",
  language_proof:   "Language Certificate",
  passport:         "Passport",
  other:            "Other Document",
  FLIGHT_TICKET:    "Flight Ticket",
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ─── Progress Steps ─────────────────────────────────────────────────────── */
const STEPS = [
  "Application Timeline",
  "Documents Verified",
  "Under Review",
  "Decision Made",
  "Offer Accepted",
];

function stepsDone(status: string): number {
  switch (status) {
    case "PENDING":  return 1;
    case "REVIEW":   return 3;
    case "APPROVED": return 5;
    case "REJECTED": return 3;
    default: return 1;
  }
}

/* ─── Admission Update Card ─────────────────────────────────────────────── */
function UpdateCard({ item, appStatus }: { item: StatusHistoryItem; appStatus: string }) {
  const cfg = STATUS_CFG[item.newStatus] ?? STATUS_CFG.PENDING;
  const isApproved = item.newStatus === "APPROVED";
  const isRejected = item.newStatus === "REJECTED";

  const title = isApproved
    ? "Congratulations! Offer Accepted"
    : isRejected
    ? "Application Rejected"
    : item.newStatus === "REVIEW"
    ? "Application Under Review"
    : "Application Submitted Successfully!";

  const desc = isApproved
    ? "Your application has been accepted. Welcome to the program!"
    : isRejected
    ? (item.reason || "Your application has been reviewed and was not successful.")
    : item.newStatus === "REVIEW"
    ? "Your application is currently being reviewed by our admissions team."
    : "Your application has been received and is now under review.";

  const borderColor = isApproved ? "border-green-200 bg-green-50" : isRejected ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50";
  const iconColor   = isApproved ? "text-green-600" : isRejected ? "text-red-500" : "text-blue-600";
  const dotColor    = isApproved ? "bg-green-500" : isRejected ? "bg-red-500" : "bg-blue-500";

  return (
    <div className={`rounded-xl border p-4 ${borderColor}`}>
      <div className="flex items-start gap-2 mb-1">
        <div className={`w-5 h-5 rounded-full ${dotColor} flex items-center justify-center shrink-0 mt-0.5`}>
          {isRejected ? <XCircle className="w-3 h-3 text-white" /> : <CheckCircle className="w-3 h-3 text-white" />}
        </div>
        <p className={`font-montserrat-bold text-sm ${iconColor}`}>{title}</p>
      </div>
      <p className="text-xs text-[#65666f] leading-relaxed ml-7">{desc}</p>
      <p className="text-xs text-[#8b8c9a] mt-2 ml-7">{fmtDate(item.createdAt)}</p>
    </div>
  );
}

/* ─── Page Component ─────────────────────────────────────────────────────── */
export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : null;

  const [application, setApplication] = useState<Application | null>(null);
  const [documents,   setDocuments]   = useState<DocumentItem[]>([]);
  const [loading,     setLoading]     = useState(true);

  // Flight ticket upload
  const [flightTicketFile,     setFlightTicketFile]     = useState<File | null>(null);
  const [uploadingFlight,      setUploadingFlight]      = useState(false);
  const [flightTicketUploaded, setFlightTicketUploaded] = useState(false);

  // Invoice
  const [invoiceFile,     setInvoiceFile]     = useState<File | null>(null);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);

  useEffect(() => {
    if (appId) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [appId]);

  const checkAuth = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.push("/login"); return; }
    const r = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null);
    if (r?.ok) {
      fetchAll();
    } else {
      router.push("/login");
    }
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
    } catch {
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFlightTicketUpload = async () => {
    if (!flightTicketFile || !appId) return;
    setUploadingFlight(true);
    try {
      const fd = new FormData();
      fd.append("document", flightTicketFile);
      fd.append("documentType", "FLIGHT_TICKET");
      const res = await fetch(`${API_BASE_URL}/applications/${appId}/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      setFlightTicketFile(null);
      setFlightTicketUploaded(true);
      showToast.success("Flight ticket uploaded!");
      fetchAll();
    } catch (e: any) {
      showToast.error(e.message || "Upload failed");
    } finally {
      setUploadingFlight(false);
    }
  };

  const handleInvoiceUpload = async () => {
    if (!invoiceFile || !application?.payment) return;
    setUploadingInvoice(true);
    try {
      const fd = new FormData();
      fd.append("invoice", invoiceFile);
      const res = await fetch(`${API_BASE_URL}/payments/${appId}/invoice`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      setInvoiceFile(null);
      showToast.success("Invoice uploaded!");
      fetchAll();
    } catch (e: any) {
      showToast.error(e.message || "Upload failed");
    } finally {
      setUploadingInvoice(false);
    }
  };

  /* ── Loading / Error states ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-[#5260ce] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-lg text-gray-600">Application not found.</p>
          <Button asChild><Link href="/my-applications">Back</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const statusCfg  = STATUS_CFG[application.status] ?? STATUS_CFG.PENDING;
  const done       = stepsDone(application.status);
  const services   = Array.isArray(application.additionalServices) ? application.additionalServices as string[] : [];
  const logoSrc    = getImageUrl(application.university?.logoUrl || "") || null;
  const appShortId = `OX-${new Date(application.createdAt).getFullYear()}-${application.id.slice(0, 4).toUpperCase()}`;
  const totalPaid  = application.payment && (application.payment.paymentStatus === "completed" || application.payment.paymentStatus === "paid")
    ? Number(application.payment.amount) : 0;

  const hasFlight = flightTicketUploaded || documents.some((d) => d.documentType === "FLIGHT_TICKET");

  return (
    <div className="min-h-screen bg-[#F8F9FE] pb-16 md:pb-0">
      <Navbar />
      <main className="pt-0 md:pt-[100px] pb-12 md:pb-20">
        <div className="max-w-[960px] mx-auto px-4 md:px-6">

          {/* Back */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[#65666f] text-sm mb-5 hover:text-[#121c67] transition-colors mt-4 md:mt-0"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* ── Top Header Card ───────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 mb-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              {/* University + Program */}
              <div className="flex items-center gap-4">
                {logoSrc ? (
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border border-gray-200 bg-white shrink-0">
                    <Image src={logoSrc} alt="" fill className="object-contain p-1.5" unoptimized />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#5260ce] font-bold text-lg shrink-0">
                    {application.university?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <h1 className="font-montserrat-bold text-lg md:text-xl text-[#121c67] leading-tight">
                    {application.program?.name || "Program"}
                  </h1>
                  <p className="text-sm text-[#5260ce] font-montserrat-regular mt-0.5">
                    {application.university?.name || "University"}
                  </p>
                  {application.program?.degree && (
                    <p className="text-xs text-[#8b8c9a] mt-0.5">{application.program.degree}</p>
                  )}
                </div>
              </div>

              {/* App ID + Status + Date */}
              <div className="text-right shrink-0">
                <p className="text-xs text-[#8b8c9a] mb-1">Application ID: {appShortId}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-montserrat-semibold border ${statusCfg.bg}`}>
                  {statusCfg.label}
                </span>
                <p className="text-xs text-[#8b8c9a] mt-1.5">
                  Last updated: {fmtDate(application.updatedAt || application.createdAt)}
                </p>
              </div>
            </div>

            {/* ── Progress Steps ── */}
            <div className="mt-6 bg-[#F0F3FF] rounded-xl px-4 md:px-6 py-4 overflow-x-auto">
              <div className="flex items-center min-w-[480px]">
                {STEPS.map((step, i) => {
                  const isComplete = i < done;
                  const isActive   = i === done - 1;
                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                            isComplete
                              ? "bg-[#5260ce] border-[#5260ce]"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle className="w-4 h-4 text-white fill-white" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                          )}
                        </div>
                        <span
                          className={`text-[10px] md:text-xs mt-1.5 text-center leading-tight max-w-[72px] font-montserrat-semibold ${
                            isComplete ? "text-[#5260ce]" : "text-[#8b8c9a]"
                          }`}
                        >
                          {step}
                          {isComplete && isActive && (
                            <span className="block text-[9px] text-[#8b8c9a] font-montserrat-regular">
                              {fmtDate(application.updatedAt || application.createdAt)}
                            </span>
                          )}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-1 md:mx-2 rounded-full transition-all ${
                            i < done - 1 ? "bg-[#5260ce]" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Two-Column Body ───────────────────────────────────────────── */}
          <div className="grid md:grid-cols-2 gap-5">

            {/* LEFT COLUMN */}
            <div className="space-y-5">

              {/* Services Required */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-montserrat-bold text-[#121c67] mb-3">Services Required</h3>
                {services.length > 0 ? (
                  <ul className="space-y-2.5">
                    {services.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#2e2e2e] border-b border-gray-50 pb-2.5 last:border-0 last:pb-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#5260ce] mt-1.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#65666f]">University Admission</p>
                )}

                {/* Services Note */}
                {application.additionalNotes && (
                  <>
                    <h4 className="font-montserrat-bold text-[#121c67] mt-4 mb-2 text-sm">Services Note</h4>
                    <p className="text-sm text-[#65666f]">{application.additionalNotes}</p>
                  </>
                )}
              </div>

              {/* Payment History */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-montserrat-bold text-[#121c67] mb-4">Payment History</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-2 font-montserrat-semibold text-[#65666f] text-xs">Date</th>
                      <th className="text-left pb-2 font-montserrat-semibold text-[#65666f] text-xs">Description</th>
                      <th className="text-left pb-2 font-montserrat-semibold text-[#65666f] text-xs">Amount</th>
                      <th className="text-left pb-2 font-montserrat-semibold text-[#65666f] text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {application.applicationFee ? (
                      <tr className="border-b border-gray-50">
                        <td className="py-2.5 text-[#65666f]">{fmtDate(application.createdAt)}</td>
                        <td className="py-2.5 text-[#2e2e2e]">Application Fee</td>
                        <td className="py-2.5 font-montserrat-semibold">${Number(application.applicationFee).toFixed(0)}</td>
                        <td className="py-2.5">
                          <PayStatusBadge status={application.payment?.paymentStatus} appStatus={application.status} />
                        </td>
                      </tr>
                    ) : null}
                    {application.additionalFee && Number(application.additionalFee) > 0 ? (
                      <tr className="border-b border-gray-50">
                        <td className="py-2.5 text-[#65666f]">{fmtDate(application.updatedAt || application.createdAt)}</td>
                        <td className="py-2.5 text-[#2e2e2e]">Additional Services Fee</td>
                        <td className="py-2.5 font-montserrat-semibold">${Number(application.additionalFee).toFixed(0)}</td>
                        <td className="py-2.5">
                          <PayStatusBadge status={application.payment?.paymentStatus} appStatus={application.status} />
                        </td>
                      </tr>
                    ) : null}
                    {!application.applicationFee && !application.additionalFee && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-[#8b8c9a] text-xs">No payment records yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="mt-4 border-t border-gray-100 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#65666f]">Total Paid:</span>
                    <span className="font-montserrat-semibold text-[#121c67]">
                      ${totalPaid.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#65666f]">Remaining Balance:</span>
                    <span className="font-montserrat-semibold text-[#121c67]">$0</span>
                  </div>
                </div>

                {/* Make Payment / Invoice */}
                {application.payment && (
                  <div className="mt-4 space-y-2">
                    {application.payment.invoiceUrl ? (
                      <a
                        href={application.payment.invoiceUrl.startsWith("http")
                          ? application.payment.invoiceUrl
                          : `${API_BASE_URL.replace("/api/v1", "")}${application.payment.invoiceUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#5260ce] hover:underline"
                      >
                        <Download className="w-4 h-4" />
                        Download Invoice
                      </a>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                          className="w-full text-xs border border-gray-200 rounded-lg p-2 text-gray-600"
                        />
                        <Button
                          onClick={handleInvoiceUpload}
                          disabled={!invoiceFile || uploadingInvoice}
                          className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white text-sm h-9 rounded-xl"
                        >
                          {uploadingInvoice ? "Uploading…" : "Upload Invoice"}
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {!application.payment && (
                  <Button
                    className="mt-4 bg-[#121c67] hover:bg-[#0d1554] text-white text-sm h-9 px-5 rounded-xl"
                    asChild
                  >
                    <Link href={`/universities/${application.university?.slug || ""}/register`}>
                      Make Payment
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-5">

              {/* Submitted Documents */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-montserrat-bold text-[#121c67]">Submitted Documents</h3>
                  <label className="cursor-pointer">
                    <input type="file" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadDocument(file, appId!, fetchAll);
                    }} />
                    <span className="flex items-center gap-1.5 text-xs text-[#5260ce] border border-[#5260ce]/30 px-3 py-1.5 rounded-lg hover:bg-[#5260ce]/5 transition-colors font-montserrat-semibold">
                      <Upload className="w-3.5 h-3.5" />
                      Upload Document
                    </span>
                  </label>
                </div>

                {documents.length === 0 ? (
                  <p className="text-sm text-[#8b8c9a] text-center py-4">No documents uploaded yet</p>
                ) : (
                  <ul className="space-y-2.5">
                    {documents.map((doc) => {
                      const docLabel = DOC_LABEL[doc.documentType] || doc.documentType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                      const docUrl = doc.fileUrl.startsWith("http")
                        ? doc.fileUrl
                        : `${API_BASE_URL.replace("/api/v1", "")}${doc.fileUrl}`;
                      const docStatus = application.status === "APPROVED" ? "Verified" : application.status === "REJECTED" ? "Rejected" : "Pending";
                      const badgeCls  = application.status === "APPROVED" ? "bg-green-50 text-green-700 border-green-200" : application.status === "REJECTED" ? "bg-red-50 text-red-600 border-red-200" : "bg-yellow-50 text-yellow-700 border-yellow-200";
                      return (
                        <li key={doc.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-[#5260ce]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-montserrat-semibold text-sm text-[#121c67] truncate">{docLabel}</p>
                              <p className="text-xs text-[#8b8c9a]">Uploaded: {fmtDate(doc.uploadedAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className={`text-xs px-2 py-0.5 rounded border font-montserrat-semibold ${badgeCls}`}>
                              {docStatus}
                            </span>
                            <a href={docUrl} target="_blank" rel="noopener noreferrer" className="text-[#5260ce] hover:text-[#121c67] transition-colors">
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Flight ticket upload after APPROVED */}
                {application.status === "APPROVED" && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <h4 className="font-montserrat-bold text-sm text-[#121c67] mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                      Upload Flight Ticket
                    </h4>
                    {hasFlight ? (
                      <p className="text-sm text-green-700 font-montserrat-semibold flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> Flight ticket uploaded
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setFlightTicketFile(e.target.files?.[0] || null)}
                          className="w-full text-xs border border-gray-200 rounded-lg p-2 text-gray-600"
                        />
                        <Button
                          onClick={handleFlightTicketUpload}
                          disabled={!flightTicketFile || uploadingFlight}
                          className="w-full bg-green-600 hover:bg-green-700 text-white text-sm h-9 rounded-xl"
                        >
                          {uploadingFlight ? "Uploading…" : "Upload Flight Ticket"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Admission Updates */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-montserrat-bold text-[#121c67] mb-4">Admission Updates</h3>
                {application.statusHistory && application.statusHistory.length > 0 ? (
                  <div className="space-y-3">
                    {[...application.statusHistory].reverse().map((item) => (
                      <UpdateCard key={item.id} item={item} appStatus={application.status} />
                    ))}
                  </div>
                ) : (
                  /* Fallback: show a single card based on current status */
                  <UpdateCard
                    item={{
                      id:        "init",
                      newStatus: application.status,
                      reason:    application.notes || undefined,
                      createdAt: application.createdAt,
                    }}
                    appStatus={application.status}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── Application Advisor / Support ─────────────────────────────── */}
          <div className="mt-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
                <span className="text-2xl">👩‍💼</span>
              </div>
              <div>
                <p className="font-montserrat-bold text-[#121c67]">Application Advisor</p>
                <p className="text-sm text-[#65666f]">Univolta Support Team</p>
                <p className="text-xs text-[#8b8c9a] flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> Available: Mon–Fri, 9:00 AM – 6:00 PM GMT
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-[#5260ce]/30 text-[#5260ce] hover:bg-[#5260ce] hover:text-white rounded-xl flex items-center gap-2 shrink-0 transition-colors"
              asChild
            >
              <Link href="/contact">
                <MessageCircle className="w-4 h-4" />
                Send Message
              </Link>
            </Button>
          </div>

          {/* ── Bottom Action Buttons ─────────────────────────────────────── */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Button
              className="bg-[#121c67] hover:bg-[#0d1554] text-white font-montserrat-semibold rounded-xl flex items-center gap-2 h-11"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4" />
              Download Application
            </Button>
            <Button
              variant="outline"
              className="border-[#5260ce]/30 text-[#5260ce] hover:bg-[#5260ce] hover:text-white font-montserrat-semibold rounded-xl flex items-center gap-2 h-11 transition-colors"
              asChild
            >
              <Link href="/contact">
                <Phone className="w-4 h-4" />
                Contact Support
              </Link>
            </Button>
          </div>

        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

/* ─── Helpers (local) ──────────────────────────────────────────────────── */
function PayStatusBadge({ status, appStatus }: { status?: string; appStatus: string }) {
  const s = status?.toLowerCase();
  if (s === "completed" || s === "paid")
    return <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 font-montserrat-semibold">Paid</span>;
  if (appStatus === "REJECTED")
    return <span className="text-xs px-2 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-200 font-montserrat-semibold">Cancelled</span>;
  return <span className="text-xs px-2 py-0.5 rounded bg-yellow-50 text-yellow-700 border border-yellow-200 font-montserrat-semibold">Pending</span>;
}

async function uploadDocument(file: File, appId: string, onDone: () => void) {
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
