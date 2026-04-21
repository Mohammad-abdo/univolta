"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiPut } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { canAccess, type UserRole } from "@/lib/permissions";
import { API_BASE_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  DollarSign,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  BookOpen,
  Edit,
  Save,
  X,
  Send,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { t } from "@/lib/i18n";

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  personalAddress?: string;
  dateOfBirth?: string;
  academicQualification?: string;
  identityNumber?: string;
  country?: string;
  status: "PENDING" | "REVIEW" | "APPROVED" | "REJECTED";
  notes?: string;
  additionalNotes?: string;
  additionalServices?: string[];
  createdAt: string;
  updatedAt: string;
  university?: { id: string; name: string; slug: string };
  program?: { id: string; name: string; slug: string };
  applicationFee?: number;
  additionalFee?: number;
  totalFee?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  documents?: Document[];
  payment?: Payment;
  statusHistory?: StatusHistory[];
  user?: { id: string; name: string; email: string };
}

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt: string;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  paidAt?: string;
  invoiceUrl?: string;
  invoiceFileName?: string;
  createdAt: string;
}

interface StatusHistory {
  id: string;
  previousStatus?: string;
  newStatus: string;
  changedBy?: string;
  reason?: string;
  notes?: string;
  createdAt: string;
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusReason, setStatusReason] = useState("");
  const [rejectionPreset, setRejectionPreset] = useState("");
  const [customRejection, setCustomRejection] = useState("");

  // Missing documents
  const DOCUMENT_OPTIONS = [
    "High School Certificate / شهادة الثانوية",
    "Passport / جواز السفر",
    "Personal Photos / صور شخصية",
    "Language Certificate / شهادة لغة",
    "Birth Certificate / شهادة الميلاد",
    "Transcript / كشف الدرجات",
    "Other / أخرى",
  ];
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [sendingDocs, setSendingDocs] = useState(false);

  // Rejection preset reasons
  const REJECTION_REASONS = [
    "Insufficient GPA / المعدل غير كافي",
    "Missing documents / نقص مستندات",
    "University requirements not met / شروط الجامعة غير مستوفاة",
    "Other / أخرى",
  ];

  useEffect(() => {
    const applicationId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : null;
    if (applicationId) {
      fetchUserRole();
      fetchApplication();
    } else {
      setLoading(false);
    }
  }, [params?.id]);

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

  const fetchApplication = async () => {
    const applicationId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : null;
    if (!applicationId) {
      setLoading(false);
      showToast.error("Application ID is missing");
      return;
    }
    try {
      const data = await apiGet<Application>(`/applications/${applicationId}`);
      setApplication(data);
      setNotes(data.notes || "");
    } catch (error: any) {
      showToast.error("Failed to load application details");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: Application["status"]) => {
    if (!application) return;
    const finalReason =
      newStatus === "REJECTED"
        ? rejectionPreset === "Other / أخرى" || rejectionPreset === ""
          ? customRejection || statusReason || undefined
          : rejectionPreset
        : statusReason || undefined;

    setUpdatingStatus(true);
    try {
      await apiPut(`/applications/${application.id}/status`, {
        status: newStatus,
        reason: finalReason,
      });
      await fetchApplication();
      setStatusReason("");
      setRejectionPreset("");
      setCustomRejection("");
      showToast.success("Status updated successfully!");
    } catch (error: any) {
      showToast.error(error.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const sendMissingDocs = async () => {
    if (!application || selectedDocs.length === 0) return;
    setSendingDocs(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/applications/${application.id}/missing-documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ documents: selectedDocs }),
      });
      if (!res.ok) throw new Error("Failed to send missing documents email");
      setSelectedDocs([]);
      showToast.success("Missing documents email sent to student!");
    } catch (error: any) {
      showToast.error(error.message || "Failed to send email");
    } finally {
      setSendingDocs(false);
    }
  };

  const saveNotes = async () => {
    if (!application) return;

    setSavingNotes(true);
    try {
      await apiPut(`/applications/${application.id}`, { notes });
      setEditingNotes(false);
      showToast.success("Notes saved successfully!");
      await fetchApplication();
    } catch (error: any) {
      showToast.error(error.message || "Failed to save notes");
    } finally {
      setSavingNotes(false);
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
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{t("applicationNotFound")}</h2>
          <Button asChild>
            <Link href="/dashboard/applications">{t("backToApplications")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[application.status].icon;
  const canUpdate = userRole && canAccess(userRole, "applications", "update");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/applications")}
          >
            <ArrowLeft className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
            {t("back")}
          </Button>
          <div>
            <h1 className="text-3xl font-montserrat-bold text-[#121c67]">
              {t("studentApplicationDetails")}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ID: {application.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusConfig[application.status].color}`}
        >
          <StatusIcon className="w-5 h-5" />
          <span className="font-montserrat-semibold">
            {statusConfig[application.status].label}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-montserrat-bold text-[#121c67] mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              {t("personalInfo")}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">{t("fullName")}</label>
                <p className="text-gray-900">{application.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {t("email")}
                </label>
                <p className="text-gray-900">{application.email}</p>
              </div>
              {application.phone && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {t("phone")}
                  </label>
                  <p className="text-gray-900">{application.phone}</p>
                </div>
              )}
              {application.country && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {t("country")}
                  </label>
                  <p className="text-gray-900">{application.country}</p>
                </div>
              )}
              {application.dateOfBirth && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {t("dateOfBirth")}
                  </label>
                  <p className="text-gray-900">
                    {new Date(application.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              )}
              {application.academicQualification && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    {t("academicQualification")}
                  </label>
                  <p className="text-gray-900">{application.academicQualification}</p>
                </div>
              )}
              {application.identityNumber && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">{t("idPassportNumber")}</label>
                  <p className="text-gray-900">{application.identityNumber}</p>
                </div>
              )}
              {application.personalAddress && (
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {t("address")}
                  </label>
                  <p className="text-gray-900">{application.personalAddress}</p>
                </div>
              )}
            </div>
          </div>

          {/* Program Information */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-montserrat-bold text-[#121c67] mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {t("programInfo")}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">{t("university")}</label>
                <p className="text-gray-900">
                  {application.university?.name || t("nA")}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">{t("program")}</label>
                <p className="text-gray-900">
                  {application.program?.name || t("nA")}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Services */}
          {application.additionalServices && application.additionalServices.length > 0 && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-xl font-montserrat-bold text-[#121c67] mb-4">
                {t("additionalServices")}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {application.additionalServices.map((service, index) => (
                  <li key={index}>{service}</li>
                ))}
              </ul>
              {application.additionalNotes && (
                <div className="mt-4 pt-4 border-t">
                  <label className="text-sm font-semibold text-gray-600">{t("notes")}</label>
                  <p className="text-gray-700 mt-1">{application.additionalNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Documents */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-montserrat-bold text-[#121c67] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t("documents")} ({application.documents?.length || 0})
            </h2>
            {!application.documents || application.documents.length === 0 ? (
              <p className="text-gray-500">{t("noDocumentsUploaded")}</p>
            ) : (
              <div className="space-y-3">
                {application.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#5260ce]" />
                      <div>
                        <p className="font-semibold text-gray-900">{doc.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {doc.documentType ? doc.documentType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : t("nA")}
                          {doc.fileSize && ` • ${(doc.fileSize / 1024).toFixed(2)} KB`}
                        </p>
                      </div>
                    </div>
                    <a
                      href={doc.fileUrl.startsWith("http") ? doc.fileUrl : `${API_BASE_URL.replace("/api/v1", "")}${doc.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#5260ce] hover:underline flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      {t("download")}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status History */}
          {application.statusHistory && application.statusHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-xl font-montserrat-bold text-[#121c67] mb-4">
                {t("statusHistoryTitle")}
              </h2>
              <div className="space-y-4">
                {application.statusHistory.map((history, index) => (
                  <div key={history.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? "bg-[#5260ce]" : "bg-gray-300"
                      }`} />
                      {index < application.statusHistory!.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {history.previousStatus ? `${history.previousStatus} → ${history.newStatus}` : history.newStatus}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(history.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          statusConfig[history.newStatus as keyof typeof statusConfig]?.color || "bg-gray-100 text-gray-800"
                        }`}>
                          {history.newStatus}
                        </span>
                      </div>
                      {history.reason && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-semibold">{t("reason")}:</span> {history.reason}
                        </p>
                      )}
                      {history.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-semibold">{t("notes")}:</span> {history.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {canUpdate && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-montserrat-bold text-[#121c67]">
                  {t("adminNotes")}
                </h2>
                {!editingNotes && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingNotes(true)}
                  >
                    <Edit className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                    {t("edit")}
                  </Button>
                )}
              </div>
              {editingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5260ce] focus:border-transparent"
                    rows={4}
                    placeholder="Add notes about this application..."
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={saveNotes}
                      disabled={savingNotes}
                      size="sm"
                    >
                      <Save className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                      {savingNotes ? t("saving") : t("save")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingNotes(false);
                        setNotes(application.notes || "");
                      }}
                      size="sm"
                    >
                      <X className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                      {t("cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {application.notes || t("noNotesAdded")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Update */}
          {canUpdate && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4">
              <h3 className="text-lg font-montserrat-bold text-[#121c67]">
                {t("updateStatus")}
              </h3>

              {/* Status selector */}
              <select
                value={application.status}
                onChange={(e) => {
                  const val = e.target.value as Application["status"];
                  setRejectionPreset("");
                  setCustomRejection("");
                  setStatusReason("");
                  updateStatus(val);
                }}
                disabled={updatingStatus}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5260ce]"
              >
                <option value="PENDING">{t("pendingReview")}</option>
                <option value="REVIEW">{t("underReview")}</option>
                <option value="APPROVED">{t("approved")}</option>
                <option value="REJECTED">{t("rejected")}</option>
              </select>

              {/* Rejection reason (only shown when REJECTED) */}
              {application.status === "REJECTED" && (
                <div className="space-y-2 border border-red-200 rounded-lg p-3 bg-red-50">
                  <p className="text-xs font-semibold text-red-700 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Rejection Reason
                  </p>
                  <select
                    value={rejectionPreset}
                    onChange={(e) => setRejectionPreset(e.target.value)}
                    className="w-full p-2 text-sm border border-red-300 rounded-lg focus:ring-2 focus:ring-red-400"
                  >
                    <option value="">— Select reason —</option>
                    {REJECTION_REASONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {(rejectionPreset === "Other / أخرى" || !rejectionPreset) && (
                    <textarea
                      value={customRejection}
                      onChange={(e) => setCustomRejection(e.target.value)}
                      placeholder="Enter custom rejection reason…"
                      className="w-full p-2 text-sm border border-red-300 rounded-lg focus:ring-2 focus:ring-red-400"
                      rows={2}
                    />
                  )}
                </div>
              )}

              {/* Generic reason for non-rejection statuses */}
              {application.status !== "REJECTED" && (
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder={t("reasonForChange")}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5260ce] text-sm"
                  rows={2}
                />
              )}

              {updatingStatus && (
                <p className="text-sm text-gray-500 animate-pulse">{t("updating")}</p>
              )}
            </div>
          )}

          {/* Missing Documents */}
          {canUpdate && (
            <div className="bg-white rounded-lg shadow border border-amber-200 p-6 space-y-3">
              <h3 className="text-lg font-montserrat-bold text-[#121c67] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Request Missing Documents
              </h3>
              <p className="text-xs text-gray-500">Select documents then send — student receives an email instantly.</p>
              <div className="space-y-2">
                {DOCUMENT_OPTIONS.map((doc) => (
                  <label key={doc} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc)}
                      onChange={(e) =>
                        setSelectedDocs((prev) =>
                          e.target.checked ? [...prev, doc] : prev.filter((d) => d !== doc)
                        )
                      }
                      className="accent-[#5260ce] w-4 h-4"
                    />
                    <span className="text-gray-700">{doc}</span>
                  </label>
                ))}
              </div>
              <Button
                onClick={sendMissingDocs}
                disabled={selectedDocs.length === 0 || sendingDocs}
                size="sm"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Send className="w-4 h-4 mr-1" />
                {sendingDocs ? "Sending…" : `Send Email (${selectedDocs.length} selected)`}
              </Button>
            </div>
          )}

          {/* Payment Information */}
          {(application.payment || application.totalFee) && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-montserrat-bold text-[#121c67] mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {t("paymentInformation")}
              </h3>
              <div className="space-y-2 text-sm">
                {application.applicationFee && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("applicationFee")}:</span>
                    <span className="font-semibold">${application.applicationFee}</span>
                  </div>
                )}
                {application.additionalFee && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("additionalFees")}:</span>
                    <span className="font-semibold">${application.additionalFee}</span>
                  </div>
                )}
                {application.totalFee && (
                  <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                    <span>{t("total")}:</span>
                    <span className="text-[#5260ce]">${application.totalFee}</span>
                  </div>
                )}
                {application.payment && (
                  <div className="pt-2 border-t space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("status")}:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        application.payment.paymentStatus === "completed"
                          ? "bg-green-100 text-green-800"
                          : application.payment.paymentStatus === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {application.payment.paymentStatus === "completed" ? t("completed") : application.payment.paymentStatus === "failed" ? t("failed") : application.payment.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("method")}:</span>
                      <span className="font-semibold">
                        {application.payment?.paymentMethod ? application.payment.paymentMethod.replace(/_/g, " ") : t("nA")}
                      </span>
                    </div>
                    {application.payment.transactionId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("transactionId")}:</span>
                        <span className="font-mono text-xs">{application.payment.transactionId.slice(0, 8)}...</span>
                      </div>
                    )}
                    {application.payment.paidAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("paidAt")}:</span>
                        <span className="text-xs">
                          {new Date(application.payment.paidAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {application.payment.invoiceUrl && (
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-600">{t("paymentInvoice") || "Payment Invoice"}:</span>
                        <a
                          href={application.payment.invoiceUrl.startsWith("http") 
                            ? application.payment.invoiceUrl 
                            : `${API_BASE_URL.replace("/api/v1", "")}${application.payment.invoiceUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#5260ce] hover:underline flex items-center gap-1 text-sm"
                        >
                          <Download className="w-4 h-4" />
                          {application.payment.invoiceFileName || t("downloadInvoice") || "Download Invoice"}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Application Info */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-montserrat-bold text-[#121c67] mb-4">
              {t("applicationInformation")}
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div>
                <span className="font-semibold">{t("applicationId")}:</span>
                <p className="font-mono text-xs mt-1">{application.id}</p>
              </div>
              <div>
                <span className="font-semibold">{t("submitted")}:</span>
                <p className="mt-1">
                  {new Date(application.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="font-semibold">{t("lastUpdated")}:</span>
                <p className="mt-1">
                  {new Date(application.updatedAt).toLocaleString()}
                </p>
              </div>
              {application.user && (
                <div>
                  <span className="font-semibold">{t("user")}:</span>
                  <p className="mt-1">{application.user.name} ({application.user.email})</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

