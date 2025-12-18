"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiRequest } from "@/lib/api";
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
  Ban,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { t } from "@/lib/i18n";
import { getImageUrl } from "@/lib/image-utils";
import { showToast } from "@/lib/toast";

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
  isBlocked?: boolean;
  blockedReason?: string;
  blockedAt?: string;
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
  documents?: Document[];
  payment?: Payment;
  statusHistory?: StatusHistory[];
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

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusReason, setStatusReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Application["status"] | null>(null);
  const [blocking, setBlocking] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchApplication();
    }
  }, [params.id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Application>(`/partner/applications/${params.id}`);
      setApplication(data);
    } catch (error: any) {
      showToast.error("Failed to load application details");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: Application["status"]) => {
    if (!application) return;

    setUpdatingStatus(true);
    try {
      await apiRequest(`/partner/applications/${application.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: newStatus,
          reason: statusReason || undefined,
          notes: statusReason || undefined,
        }),
      });
      await fetchApplication();
      setStatusReason("");
      setSelectedStatus(null);
      showToast.success("Status updated successfully!");
    } catch (error: any) {
      showToast.error(error.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updatePaymentStatus = async (newStatus: string) => {
    if (!application || !application.payment) return;

    setUpdatingPayment(true);
    try {
      await apiRequest(`/payments/${application.id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: newStatus,
        }),
      });
      await fetchApplication();
      setSelectedPaymentStatus(null);
      showToast.success(t("paymentStatusUpdatedSuccessfully"));
    } catch (error: any) {
      showToast.error(error.message || t("failedToUpdatePaymentStatus"));
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleBlock = async (isBlocked: boolean) => {
    if (!application) return;

    let reason = blockReason;
    if (isBlocked && !reason) {
      const promptResult = prompt("Please provide a reason for blocking this student:");
      if (!promptResult) {
        showToast.error("Blocking reason is required");
        return;
      }
      reason = promptResult;
    }

    setBlocking(true);
    try {
      await apiRequest(`/partner/applications/${application.id}/block`, {
        method: "PATCH",
        body: JSON.stringify({
          isBlocked,
          blockedReason: reason || undefined,
        }),
      });
      await fetchApplication();
      setBlockReason("");
      showToast.success(isBlocked ? "Student blocked successfully!" : "Student unblocked successfully!");
    } catch (error: any) {
      showToast.error(error.message || "Failed to update block status");
    } finally {
      setBlocking(false);
    }
  };

  const handleDelete = async () => {
    if (!application) return;

    if (!confirm(`Are you sure you want to delete ${application.fullName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiRequest(`/partner/applications/${application.id}`, {
        method: "DELETE",
      });
      showToast.success("Student deleted successfully!");
      router.push("/dashboard/partner/students");
    } catch (error: any) {
      showToast.error(error.message || "Failed to delete student");
    }
  };

  const statusConfig = {
    PENDING: {
      icon: Clock,
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      label: "Pending Review",
    },
    REVIEW: {
      icon: FileText,
      color: "bg-blue-100 text-blue-800 border-blue-300",
      label: "Under Review",
    },
    APPROVED: {
      icon: CheckCircle,
      color: "bg-green-100 text-green-800 border-green-300",
      label: "Approved",
    },
    REJECTED: {
      icon: XCircle,
      color: "bg-red-100 text-red-800 border-red-300",
      label: "Rejected",
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t("loading")}</div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{t("applicationNotFound")}</h2>
          <Button asChild>
            <Link href="/dashboard/partner/students">{t("backToStudents")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[application.status].icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/partner/students")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
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
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusConfig[application.status].color}`}
          >
            <StatusIcon className="w-5 h-5" />
            <span className="font-montserrat-semibold">
              {statusConfig[application.status].label}
            </span>
          </div>
          {application.isBlocked && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-red-100 text-red-800 border-red-300">
              <Ban className="w-5 h-5" />
              <span className="font-montserrat-semibold">{t("blocked")}</span>
            </div>
          )}
          <Link href={`/dashboard/partner/students/${application.id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              {t("edit")}
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => handleBlock(!application.isBlocked)}
            disabled={blocking}
            className={application.isBlocked ? "text-green-600 hover:text-green-700" : "text-orange-600 hover:text-orange-700"}
          >
            {application.isBlocked ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {t("unblock")}
              </> 
            ) : (
              <>
                <Ban className="w-4 h-4 mr-2" />
                {t("block")}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t("delete")}
          </Button>
        </div>
      </div>

      {/* Blocked Warning */}
      {application.isBlocked && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Ban className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 mb-1">{t("studentIsBlocked")}</h3>
              {application.blockedReason && (
                <p className="text-sm text-red-700">{t("reason")}: {application.blockedReason}</p>
              )}
              {application.blockedAt && (
                <p className="text-xs text-red-600 mt-1">
                  {t("blockedOn")}: {new Date(application.blockedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-montserrat-bold text-[#121c67] mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              {t("personalInformation")}
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
              {t("programInformation")}
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
                  <label className="text-sm font-semibold text-gray-600">{t("additionalNotes")}</label>
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
                      href={getImageUrl(doc.fileUrl) || `${API_BASE_URL}${doc.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-[#5260ce] text-white rounded-lg hover:bg-[#4350b0] transition-colors"
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
                {application.statusHistory.map((history) => (
                  <div
                    key={history.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      {history.newStatus === "APPROVED" && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {history.newStatus === "REJECTED" && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      {history.newStatus === "REVIEW" && (
                        <FileText className="w-5 h-5 text-blue-600" />
                      )}
                      {history.newStatus === "PENDING" && (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {history.previousStatus || t("created")} → {history.newStatus}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(history.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {history.reason && (
                        <p className="text-sm text-gray-600">{t("reason")}: {history.reason}</p>
                      )}
                      {history.notes && (
                        <p className="text-sm text-gray-600 mt-1">{t("notes")}: {history.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-montserrat-bold text-[#121c67] mb-4 flex items-center gap-2">
              <Edit className="w-5 h-5" />
              {t("updateStatus")}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  {t("newStatus")}
                </label>
                <select
                  value={selectedStatus || application.status}
                  onChange={(e) => setSelectedStatus(e.target.value as Application["status"])}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
                >
                  <option value="PENDING">{t("pending")}</option>
                  <option value="REVIEW">{t("review")}</option>
                  <option value="APPROVED">{t("approved")}</option>
                  <option value="REJECTED">{t("rejected")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  {t("reason")} / {t("notes")}
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  rows={3}
                  placeholder={t("reasonForChange")}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
                />
              </div>
              {selectedStatus && selectedStatus !== application.status && (
                <Button
                  onClick={() => updateStatus(selectedStatus)}
                  disabled={updatingStatus}
                  className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white"
                >
                  {updatingStatus ? t("updating") : t("updateStatus")}
                </Button>
              )}
            </div>
          </div>

          {/* Payment Information */}
          {application.payment && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-xl font-montserrat-bold text-[#121c67] mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {t("paymentInformation")}
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-600">{t("amount")}</label>
                  <p className="text-lg font-bold text-gray-900">
                    {application.payment.currency} {Number(application.payment.amount).toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">{t("paymentMethod")}</label>
                  <p className="text-gray-900">{application.payment.paymentMethod}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">{t("status")}</label>
                  {selectedPaymentStatus === null ? (
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          application.payment.paymentStatus === "completed"
                            ? "bg-green-100 text-green-800"
                            : application.payment.paymentStatus === "failed"
                            ? "bg-red-100 text-red-800"
                            : application.payment.paymentStatus === "blocked"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {application.payment.paymentStatus === "completed" ? t("completed") :
                         application.payment.paymentStatus === "failed" ? t("failed") :
                         application.payment.paymentStatus === "blocked" ? t("blocked") :
                         t("pending")}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPaymentStatus(application.payment?.paymentStatus || "pending")}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {t("changeStatus")}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <select
                        value={selectedPaymentStatus}
                        onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#5260ce] focus:border-[#5260ce]"
                      >
                        <option value="pending">{t("pending")}</option>
                        <option value="completed">{t("completed")}</option>
                        <option value="failed">{t("failed")}</option>
                        <option value="blocked">{t("blocked")}</option>
                      </select>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updatePaymentStatus(selectedPaymentStatus)}
                          disabled={updatingPayment || selectedPaymentStatus === application.payment?.paymentStatus}
                          className="flex-1 bg-[#5260ce] hover:bg-[#4350b0] text-white"
                        >
                          {updatingPayment ? t("updating") : t("updatePaymentStatus")}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedPaymentStatus(null)}
                          disabled={updatingPayment}
                        >
                          {t("cancel")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                {application.payment.transactionId && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">{t("transactionId")}</label>
                    <p className="text-gray-900 font-mono text-sm">
                      {application.payment.transactionId}
                    </p>
                  </div>
                )}
                {application.payment.paidAt && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">{t("paidAt")}</label>
                    <p className="text-gray-900">
                      {new Date(application.payment.paidAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Application Fees */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-montserrat-bold text-[#121c67] mb-4">
              Fee Information
            </h2>
            <div className="space-y-3">
              {application.applicationFee && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Application Fee:</span>
                  <span className="font-semibold">
                    ${Number(application.applicationFee).toFixed(2)}
                  </span>
                </div>
              )}
              {application.additionalFee && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Additional Fee:</span>
                  <span className="font-semibold">
                    ${Number(application.additionalFee).toFixed(2)}
                  </span>
                </div>
              )}
              {application.totalFee && (
                <div className="flex justify-between pt-3 border-t">
                  <span className="font-semibold text-gray-900">Total Fee:</span>
                  <span className="font-bold text-lg text-[#121c67]">
                    ${Number(application.totalFee).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Application Notes */}
          {application.notes && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-xl font-montserrat-bold text-[#121c67] mb-4">
                {t("internalNotes")}
              </h2>
              <p className="text-gray-700">{application.notes}</p>
            </div>
          )}

          {/* Application Dates */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-montserrat-bold text-[#121c67] mb-4">
              {t("applicationTimeline")}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-600">{t("submitted")}</label>
                <p className="text-gray-900">
                  {new Date(application.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">{t("lastUpdated")}</label>
                <p className="text-gray-900">
                  {new Date(application.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

