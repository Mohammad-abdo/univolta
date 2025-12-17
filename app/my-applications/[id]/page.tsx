"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle, Clock, XCircle, Download, DollarSign, Upload, Receipt } from "lucide-react";
import { t } from "@/lib/i18n";
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
  notes?: string;
  additionalNotes?: string;
  additionalServices?: string[];
  createdAt: string;
  university?: { id: string; name: string; slug: string };
  program?: { id: string; name: string; slug: string };
  applicationFee?: number;
  additionalFee?: number;
  totalFee?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  payment?: {
    id: string;
    paymentStatus: string;
    paidAt?: string;
    amount?: number;
    currency?: string;
    invoiceUrl?: string;
    invoiceFileName?: string;
  };
}

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  useEffect(() => {
    const applicationId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : null;
    if (applicationId) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [params?.id]);

  const checkAuth = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        fetchApplication();
        fetchDocuments();
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push("/login");
    }
  };

  const fetchApplication = async () => {
    const applicationId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : null;
    if (!applicationId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await apiGet<Application>(`/applications/${applicationId}`);
      console.log("✅ Fetched application details:", data);
      setApplication(data);
      // Set invoice URL if exists
      if (data.payment?.invoiceUrl) {
        setInvoiceUrl(data.payment.invoiceUrl);
      }
    } catch (error: any) {
      console.error("❌ Error fetching application:", error);
      console.error("Error details:", error.message || error);
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    const applicationId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : null;
    if (!applicationId) return;
    
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/documents`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleInvoiceUpload = async () => {
    if (!invoiceFile || !application?.payment) {
      showToast.error("Please select an invoice file");
      return;
    }

    try {
      setUploadingInvoice(true);
      const accessToken = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("invoice", invoiceFile);

      const response = await fetch(`${API_BASE_URL}/payments/${application.id}/invoice`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload invoice");
      }

      const data = await response.json();
      setInvoiceUrl(data.payment.invoiceUrl);
      setInvoiceFile(null);
      showToast.success("Invoice uploaded successfully!");
      
      // Refresh application data
      fetchApplication();
    } catch (error: any) {
      console.error("Error uploading invoice:", error);
      showToast.error(error.message || "Failed to upload invoice");
    } finally {
      setUploadingInvoice(false);
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

  if (!application) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Application Not Found</h2>
            <Button asChild>
              <Link href="/my-applications">Back to Applications</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const StatusIcon = statusConfig[application.status].icon;

  return (
    <div className="min-h-screen bg-[#f9fafe] pb-16 md:pb-0">
      <Navbar />
      <main className="pt-0 md:pt-[120px] pb-4 md:pb-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-5">
          <Button
            variant="outline"
            className="mb-4 md:mb-6 text-sm md:text-base"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            Back
          </Button>

          <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 mb-4">
                  <h2 className="font-montserrat-bold text-xl md:text-2xl text-[#121c67]">
                    {t("applicationDetails")}
                  </h2>
                  <div
                    className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border ${statusConfig[application.status].color}`}
                  >
                    <StatusIcon className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="font-montserrat-semibold text-xs md:text-sm">
                      {statusConfig[application.status].label}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-montserrat-semibold text-lg text-[#121c67] mb-2">
                      {t("programInformation")}
                    </h3>
                    <p className="text-gray-700 mb-1">
                      <span className="font-semibold">{t("program")}:</span> {application.program?.name || t("nA")}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">{t("university")}:</span> {application.university?.name || t("nA")}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-montserrat-semibold text-lg text-[#121c67] mb-2">
                      {t("personalInformation")}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3 text-gray-700">
                      <p><span className="font-semibold">Full Name:</span> {application.fullName}</p>
                      <p><span className="font-semibold">Email:</span> {application.email}</p>
                      {application.phone && (
                        <p><span className="font-semibold">Phone:</span> {application.phone}</p>
                      )}
                      {application.country && (
                        <p><span className="font-semibold">Country:</span> {application.country}</p>
                      )}
                      {application.dateOfBirth && (
                        <p><span className="font-semibold">Date of Birth:</span> {new Date(application.dateOfBirth).toLocaleDateString()}</p>
                      )}
                      {application.academicQualification && (
                        <p><span className="font-semibold">Qualification:</span> {application.academicQualification}</p>
                      )}
                      {application.identityNumber && (
                        <p><span className="font-semibold">ID/Passport:</span> {application.identityNumber}</p>
                      )}
                      {application.personalAddress && (
                        <p className="md:col-span-2">
                          <span className="font-semibold">{t("address")}:</span> {application.personalAddress}
                        </p>
                      )}
                    </div>
                  </div>

                  {application.additionalServices && application.additionalServices.length > 0 && (
                    <div>
                    <h3 className="font-montserrat-semibold text-lg text-[#121c67] mb-2">
                      {t("additionalServices")}
                    </h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {application.additionalServices.map((service, index) => (
                          <li key={index}>{service}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {application.notes && (
                    <div>
                      <h3 className="font-montserrat-semibold text-lg text-[#121c67] mb-2">
                        {t("notes")}
                      </h3>
                      <p className="text-gray-700">{application.notes}</p>
                    </div>
                  )}

                  {application.additionalNotes && (
                    <div>
                      <h3 className="font-montserrat-semibold text-lg text-[#121c67] mb-2">
                        {t("additionalNotes")}
                      </h3>
                      <p className="text-gray-700">{application.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents Card */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h3 className="font-montserrat-semibold text-lg text-[#121c67] mb-4">
                  {t("uploadedDocuments")}
                </h3>
                {documents.length === 0 ? (
                  <p className="text-gray-500">{t("noDocumentsUploaded")}</p>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[#5260ce]" />
                          <div>
                            <p className="font-semibold">{doc.fileName}</p>
                            <p className="text-sm text-gray-500">
                              {doc.documentType ? doc.documentType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : t("nA")}
                            </p>
                          </div>
                        </div>
                        <a
                          href={doc.fileUrl.startsWith("http") ? doc.fileUrl : `${API_BASE_URL.replace("/api/v1", "")}${doc.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#5260ce] hover:underline"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Payment Info */}
              {(application.applicationFee || application.totalFee) && (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-[#5260ce]" />
                    <h3 className="font-montserrat-semibold text-lg text-[#121c67]">
                      {t("paymentInformation")}
                    </h3>
                  </div>
                  <div className="space-y-2 text-gray-700">
                    {application.applicationFee && (
                      <div className="flex justify-between">
                        <span>{t("applicationFee")}:</span>
                        <span className="font-semibold">${application.applicationFee}</span>
                      </div>
                    )}
                    {application.additionalFee && (
                      <div className="flex justify-between">
                        <span>{t("additionalFees")}:</span>
                        <span className="font-semibold">${application.additionalFee}</span>
                      </div>
                    )}
                    {application.totalFee && (
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-semibold">{t("total")}:</span>
                        <span className="font-bold text-[#5260ce]">${application.totalFee}</span>
                      </div>
                    )}
                    {application.paymentStatus && (
                      <div className="pt-2 border-t">
                        <p className="text-sm">
                          <span className="font-semibold">{t("status")}:</span> {application.paymentStatus}
                        </p>
                        {application.paymentMethod && (
                          <p className="text-sm">
                            <span className="font-semibold">{t("method")}:</span> {application.paymentMethod.replace(/_/g, " ")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Invoice Upload Section */}
                  {application.payment && (application.payment.paymentStatus === "completed" || application.paymentStatus === "paid") && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-montserrat-semibold text-sm text-[#121c67] mb-3 flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        {t("paymentInvoice") || "Payment Invoice"}
                      </h4>
                      {invoiceUrl || application.payment.invoiceUrl ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[#5260ce]" />
                              <span className="text-sm text-gray-700">
                                {application.payment.invoiceFileName || "invoice.pdf"}
                              </span>
                            </div>
                            <a
                              href={(invoiceUrl || application.payment.invoiceUrl)?.startsWith("http") 
                                ? (invoiceUrl || application.payment.invoiceUrl) 
                                : `${API_BASE_URL.replace("/api/v1", "")}${invoiceUrl || application.payment.invoiceUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#5260ce] hover:underline"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                          <p className="text-xs text-gray-500">
                            {t("invoiceUploaded") || "Invoice uploaded. You can download it anytime."}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                            className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2"
                          />
                          <Button
                            onClick={handleInvoiceUpload}
                            disabled={!invoiceFile || uploadingInvoice}
                            className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white text-sm"
                          >
                            {uploadingInvoice ? (
                              <>
                                <Upload className="w-4 h-4 mr-2 animate-spin" />
                                {t("uploading") || "Uploading..."}
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                {t("uploadInvoice") || "Upload Invoice"}
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-gray-500">
                            {t("uploadInvoiceNote") || "Upload your payment invoice (PDF, DOC, or image). Max 10MB."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Application Info */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h3 className="font-montserrat-semibold text-lg text-[#121c67] mb-4">
                  {t("applicationInformation")}
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold">Application ID:</span> {application.id.slice(0, 8)}...
                  </p>
                  <p>
                    <span className="font-semibold">{t("submitted")}:</span>{" "}
                    {new Date(application.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

