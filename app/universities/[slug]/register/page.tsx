"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Upload,
  X,
  User,
  Star,
  FileText,
  Shield,
  ArrowLeft,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  apiPost,
  apiPut,
  apiUploadImage,
  apiUploadDocument,
  apiProcessPayment,
} from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
import { getDirection, getLanguage, t } from "@/lib/i18n";

const egyptianCities = [
  { en: "Cairo", ar: "القاهرة" },
  { en: "Alexandria", ar: "الإسكندرية" },
  { en: "Giza", ar: "الجيزة" },
  { en: "Shubra El Kheima", ar: "شبرا الخيمة" },
  { en: "Port Said", ar: "بورسعيد" },
  { en: "Suez", ar: "السويس" },
  { en: "Mansoura", ar: "المنصورة" },
  { en: "Tanta", ar: "طنطا" },
  { en: "Asyut", ar: "أسيوط" },
  { en: "Ismailia", ar: "الإسماعيلية" },
  { en: "Fayyum", ar: "الفيوم" },
  { en: "Zagazig", ar: "الزقازيق" },
  { en: "Aswan", ar: "أسوان" },
  { en: "Damietta", ar: "دمياط" },
  { en: "Damanhur", ar: "دمنهور" },
  { en: "Minya", ar: "المنيا" },
  { en: "Beni Suef", ar: "بني سويف" },
  { en: "Qena", ar: "قنا" },
  { en: "Sohag", ar: "سوهاج" },
  { en: "Hurghada", ar: "الغردقة" },
  { en: "6th of October", ar: "السادس من أكتوبر" },
  { en: "Shibin El Kom", ar: "شبين الكوم" },
  { en: "Banha", ar: "بنها" },
  { en: "Kafr El Sheikh", ar: "كفر الشيخ" },
  { en: "Arish", ar: "العريش" },
  { en: "Mallawi", ar: "ملوي" },
  { en: "Qalyub", ar: "قليوب" },
  { en: "Obour", ar: "العبور" },
  { en: "New Cairo", ar: "القاهرة الجديدة" },
  { en: "New Administrative Capital", ar: "العاصمة الإدارية الجديدة" },
  { en: "Luxor", ar: "الأقصر" },
  { en: "Marsa Matruh", ar: "مرسى مطروح" },
  { en: "Sharm El Sheikh", ar: "شرم الشيخ" },
  { en: "El Mahalla El Kubra", ar: "المحلة الكبرى" },
  { en: "Kafr El Dawwar", ar: "كفر الدوار" },
];

// Steps will be defined inside component to use translations

function UniversityRegisterContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Student Data
    fullName: "",
    email: "",
    personalAddress: "",
    country: "",
    dateOfBirth: "",
    academicQualification: "",
    identityNumber: "",
    phone: "",
    // Step 2: Additional Services
    requestType: "admission_only" as
      | "admission_only"
      | "admission_accommodation"
      | "admission_transfer"
      | "admission_accommodation_transfer",
    universityCity: "",
    expectedArrivalDate: "",
    additionalNotes: "",
    // Step 3: Documents
    documents: {} as Record<string, { file: File; url: string }>,
    feedback: "",
    // Step 4: Payment
    paymentMethod: "credit_card" as "credit_card" | "paypal",
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
    paypalEmail: "",
  });

  const [university, setUniversity] = useState<any>(null);
  const [program, setProgram] = useState<any>(null);
  const lang = getLanguage();
  const isRTL = lang === "ar";

  // Check authentication on mount (optional - students can register without login)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear it but don't redirect
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Error checking auth, but don't redirect - allow anonymous registration
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [slug, router, searchParams]);

  // Fetch university and program data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const uniRes = await fetch(
          `${API_BASE_URL}/public/universities/${slug}`
        );
        if (uniRes.ok) {
          const uniData = await uniRes.json();
          setUniversity(uniData);

          const programId = searchParams?.get("program");
          if (programId && uniData.programs) {
            // Find program in the university's programs list
            const foundProgram = Array.isArray(uniData.programs)
              ? uniData.programs.find(
                  (p: any) => p.id === programId || p.slug === programId
                )
              : null;
            if (foundProgram) {
              setProgram(foundProgram);
            } else {
              // Fallback: try fetching from programs list endpoint
              const progListRes = await fetch(
                `${API_BASE_URL}/public/universities/${slug}/programs`
              );
              if (progListRes.ok) {
                const progList = await progListRes.json();
                const foundProgram2 = Array.isArray(progList)
                  ? progList.find(
                      (p: any) => p.id === programId || p.slug === programId
                    )
                  : null;
                if (foundProgram2) {
                  setProgram(foundProgram2);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug, searchParams]);

  // Validate current step before allowing progression
  const validateCurrentStep = (): boolean => {
    if (currentStep === 1) {
      // Validate required fields
      if (!formData.fullName?.trim()) {
        setError(t("fullNameRequired"));
        return false;
      }
      if (!formData.email?.trim()) {
        setError(t("emailRequired"));
        return false;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setError(t("validEmailRequired"));
        return false;
      }
      if (!formData.country?.trim()) {
        setError(t("countryRequired"));
        return false;
      }
      // Validate university and program are selected
      if (!university?.id) {
        setError(t("universityRequired"));
        return false;
      }
      if (!program?.id) {
        setError(t("programRequired"));
        return false;
      }
      return true;
    } else if (currentStep === 2) {
      // Step 2 doesn't require validation - all fields are optional
      return true;
    } else if (currentStep === 3) {
      // Check if at least one required document is uploaded
      const requiredDocs = ["high_school_card", "language_proof", "passport"];
      const hasRequiredDoc = requiredDocs.some(doc => formData.documents[doc]);
      if (!hasRequiredDoc) {
        setError(t("documentRequired"));
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = async () => {
    // Validate current step
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep === 1) {
      // Create application
      setLoading(true);
      try {
        const response = (await apiPost<{ id: string }>("/applications", {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          personalAddress: formData.personalAddress,
          dateOfBirth: formData.dateOfBirth,
          academicQualification: formData.academicQualification,
          identityNumber: formData.identityNumber,
          country: formData.country,
          universityId: university?.id,
          programId: program?.id,
          applicationFee: 100, // Default application fee
        })) as { id: string };

        setApplicationId(response.id);
        setCurrentStep(2);
        setError("");
      } catch (error: any) {
        setError(error.message || t("failedToCreateApplication"));
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 2) {
      // Update application with services
      if (applicationId) {
        setLoading(true);
        setError("");
        try {
          // Map request type to services array
          const services: string[] = [];
          if (
            formData.requestType === "admission_accommodation" ||
            formData.requestType === "admission_accommodation_transfer"
          ) {
            services.push("accommodation");
          }
          if (
            formData.requestType === "admission_transfer" ||
            formData.requestType === "admission_accommodation_transfer"
          ) {
            services.push("airport_transfer");
          }

          const additionalFee = services.length * 15; // $15 per service
          await apiPut(`/applications/${applicationId}`, {
            additionalServices: services.length > 0 ? services : undefined,
            additionalNotes: formData.additionalNotes?.trim() || undefined,
            additionalFee,
            totalFee: 100 + additionalFee,
          });
          setCurrentStep(3);
          setError("");
        } catch (error: any) {
          console.error("Error updating application:", error);
          if (error.error) {
            setError(error.error);
          } else if (error.message) {
            setError(error.message);
          } else {
            setError(t("failedToUpdateServices"));
          }
        } finally {
          setLoading(false);
        }
      } else {
        setError(t("applicationIdMissing"));
        return;
      }
    } else if (currentStep === 3) {
      // Documents are uploaded on selection, just move to next step
      setCurrentStep(4);
      setError("");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
    }
  };

  const handleDocumentUpload = async (type: string, file: File) => {
    if (!applicationId) {
      setError(t("completeStepOneFirst"));
      return;
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError(t("invalidFileType"));
      return;
    }

    // Validate file size (20MB limit)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      setError(t("fileTooLarge20Mb"));
      return;
    }

    setUploading(type);
    setError("");
    try {
      const result = await apiUploadDocument(applicationId, file, type);
      if (result?.id) {
        setFormData({
          ...formData,
          documents: {
            ...formData.documents,
            [type]: { file, url: URL.createObjectURL(file) },
          },
        });
        setError(""); // Clear any previous errors
      } else {
        throw new Error(t("invalidServerResponse"));
      }
    } catch (error: any) {
      console.error("Error uploading document:", error);
      if (error.message) {
        setError(error.message);
      } else {
        setError(t("failedToUploadDocument"));
      }
    } finally {
      setUploading(null);
    }
  };

  const handlePayment = async () => {
    if (!applicationId) {
      setError(t("applicationIdMissing"));
      return;
    }

    // Validate payment method
    if (!formData.paymentMethod) {
      setError(t("paymentMethodRequired"));
      return;
    }

    // Validate credit card fields if credit card is selected
    if (formData.paymentMethod === "credit_card") {
      if (!formData.cardNumber?.trim()) {
        setError(t("cardNumberRequired"));
        return;
      }
      if (!formData.cardholderName?.trim()) {
        setError(t("cardholderNameRequired"));
        return;
      }
      if (!formData.expiryDate?.trim()) {
        setError(t("expiryDateRequired"));
        return;
      }
      if (!formData.cvv?.trim()) {
        setError(t("cvvRequired"));
        return;
      }
    }

    // Validate PayPal email if PayPal is selected
    if (formData.paymentMethod === "paypal") {
      if (!formData.paypalEmail?.trim()) {
        setError(t("paypalEmailRequired"));
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.paypalEmail.trim())) {
        setError(t("validPaypalEmailRequired"));
        return;
      }
    }

    setLoading(true);
    setError("");
    try {
      // Calculate fees based on request type
      const services: string[] = [];
      if (
        formData.requestType === "admission_accommodation" ||
        formData.requestType === "admission_accommodation_transfer"
      ) {
        services.push("accommodation");
      }
      if (
        formData.requestType === "admission_transfer" ||
        formData.requestType === "admission_accommodation_transfer"
      ) {
        services.push("airport_transfer");
      }
      const totalAmount = 100 + services.length * 15;

      await apiProcessPayment(applicationId, {
        paymentMethod: formData.paymentMethod,
        amount: totalAmount,
        ...(formData.paymentMethod === "credit_card" && {
          cardNumber: formData.cardNumber.trim(),
          cardholderName: formData.cardholderName.trim(),
          expiryDate: formData.expiryDate.trim(),
          cvv: formData.cvv.trim(),
        }),
        ...(formData.paymentMethod === "paypal" && {
          paypalEmail: formData.paypalEmail.trim(),
        }),
      });

      router.push(`/applications/success?id=${applicationId}`);
    } catch (error: any) {
      console.error("Error processing payment:", error);
      if (error.error) {
        setError(error.error);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError(t("paymentFailedTryAgain"));
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f9fafe] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5260ce] mx-auto mb-4" />
          <p className="font-montserrat-regular text-sm text-[#8b8c9a]">Loading application form…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafe] pb-16 md:pb-0" dir={getDirection()}>
      <Navbar />
      <main className="pt-0 md:pt-[100px] pb-4 md:pb-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-5">
          {/* Hero Banner */}
          <div className="relative h-[200px] md:h-[320px] rounded-[20px] md:rounded-[28px] overflow-hidden mb-6 md:mb-10 animate-hero-reveal">
            <Image
              src="/80871096_078_230602_3d_studies_14_poster 1.png"
              alt="University registration"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#121c67]/80 via-[#5260ce]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs mb-3 px-3 py-1">
                {t("secureApplication")}
              </Badge>
              <h2 className="font-montserrat-bold text-xl md:text-[38px] leading-tight text-white drop-shadow-lg animate-fade-up">
                {t("universityRegistrationTitle")}
              </h2>
              <p className="text-white/70 text-sm md:text-base mt-2 font-montserrat-regular animate-fade-up-d100">
                {t("completeApplicationIn4Steps")}
              </p>
            </div>
          </div>

          {/* Admission Closed Warning */}
          {university && university.admissionStatus === "CLOSED" && (
            <div className="mb-6 bg-red-50 border border-red-300 rounded-2xl p-5 flex items-start gap-4">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-red-500 shrink-0 animate-pulse" />
              <div>
                <p className="font-montserrat-bold text-red-700 text-base mb-1">{t("admissionClosed")}</p>
                <p className="text-sm text-red-600">
                  {t("applicationsTo")} <strong>{university.name}</strong> {t("currentlyClosed")}. {t("cannotSubmitNow")} {t("checkBackOrExploreOthers")}
                </p>
                <a
                  href="/universities"
                  className="inline-block mt-3 text-sm text-white bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg font-montserrat-semibold transition-colors"
                >
                  {t("browseOtherUniversities")}
                </a>
              </div>
            </div>
          )}

          {/* Main Container */}
          <div className={`bg-white/70 backdrop-blur-sm rounded-[20px] md:rounded-[28px] border border-gray-100 shadow-sm ${university?.admissionStatus === "CLOSED" ? "pointer-events-none opacity-50 select-none" : ""}`}>
            <div className="grid lg:grid-cols-4 gap-4 md:gap-8">
              {/* Left Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-[#5260ce] rounded-xl p-4 md:p-6 text-white lg:sticky lg:top-[120px] shadow-lg">
                  <h3 className="font-montserrat-bold text-sm md:text-[16px] leading-normal mb-2 text-white line-clamp-2">
                    {t("enrolInProgram")} {program?.name || t("program")} {t("majorAt")} {university?.name || t("university")}
                  </h3>
                  <p className="text-xs md:text-[13px] mb-4 text-white/90 font-montserrat-regular">
                    {t("youHave4Steps")}
                  </p>

                  {/* Progress Lines */}
                  <div className="flex gap-1 mb-6">
                    {(() => {
                      const steps = [
                        { id: 1 },
                        { id: 2 },
                        { id: 3 },
                        { id: 4 },
                      ];
                      return steps.map((step, index) => {
                      const isStepCompleted = currentStep > step.id;
                      const isStepActive = currentStep === step.id;
                      return (
                        <div
                          key={step.id}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            isStepCompleted || isStepActive
                              ? "bg-white"
                              : "bg-white/30"
                          }`}
                        />
                      );
                    });
                    })()}
                  </div>

                  <div className="space-y-2">
                    {(() => {
                      const steps = [
                        {
                          id: 1,
                          title: t("studentData"),
                          key: "student",
                          description: t("studentDataDesc"),
                          icon: User,
                        },
                        {
                          id: 2,
                          title: t("additionalServices"),
                          key: "services",
                          description: t("additionalServicesDesc"),
                          icon: Star,
                        },
                        {
                          id: 3,
                          title: t("uploadDocuments"),
                          key: "documents",
                          description: t("uploadDocumentsDesc"),
                          icon: FileText,
                        },
                        {
                          id: 4,
                          title: t("payment"),
                          key: "payment",
                          description: t("paymentDesc"),
                          icon: Shield,
                        },
                      ];
                      return steps.map((step) => {
                      const IconComponent = step.icon;
                      const isCompleted = currentStep > step.id;
                      const isActive = currentStep === step.id;
                      const canNavigate = isActive || isCompleted;

                      return (
                        <div
                          key={step.id}
                          onClick={() => {
                            // Only allow navigation to completed steps or current step
                            if (canNavigate) {
                              setCurrentStep(step.id);
                              setError("");
                            }
                          }}
                          className={`flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded-lg transition-all ${
                            isActive
                              ? "bg-white text-[#5260ce] shadow-md"
                              : isCompleted
                              ? "bg-white/15 text-white cursor-pointer hover:bg-white/20"
                              : "bg-transparent text-white/60 cursor-not-allowed opacity-60"
                          }`}
                        >
                          <div
                            className={`shrink-0 mt-0.5 ${
                              isActive
                                ? "text-[#5260ce]"
                                : isCompleted
                                ? "text-white"
                                : "text-white/70"
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
                            ) : (
                              <IconComponent
                                className="w-4 h-4 md:w-5 md:h-5"
                                strokeWidth={2}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span
                              className={`font-montserrat-semibold block mb-1 text-xs md:text-[13px] leading-[1.4] ${
                                isActive ? "text-[#5260ce]" : "text-white"
                              }`}
                            >
                              {step.title}
                            </span>
                            <span
                              className={`text-[10px] md:text-[11px] leading-[1.4] ${
                                isActive ? "text-gray-600" : "text-white/75"
                              }`}
                            >
                              {step.description}
                            </span>
                          </div>
                        </div>
                      );
                    });
                    })()}
                  </div>
                  <div className="mt-4 md:mt-6 flex justify-center">
                    <Image
                      src="/117030 1.png"
                      alt=""
                      width={100}
                      height={100}
                      className="opacity-90 md:w-[140px] md:h-[140px]"
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm border border-gray-100">
                  {error && (
                    <div className="mb-4 p-3 md:p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-2 md:gap-3">
                      <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-montserrat-semibold text-sm md:text-base text-red-800 mb-1">
                          {t("error")}
                        </p>
                        <p className="text-red-700 text-xs md:text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Student Data */}
                  {currentStep === 1 && (
                    <div className="animate-card-enter">
                      <p className="font-montserrat-regular text-xs md:text-sm text-[#5260ce] mb-1 uppercase tracking-wider">
                        {t("stepOf", lang).replace("{step}", "1").replace("{total}", "4")}
                      </p>
                      <h3 className="font-montserrat-bold text-xl md:text-[26px] text-[#121c67] mb-2 flex items-center gap-2 section-title-accent pb-1">
                        <User className="w-5 h-5 md:w-6 md:h-6 text-[#5260ce]" />
                        {t("studentData")}
                      </h3>
                      <p className="text-sm text-[#65666f] mb-5 font-montserrat-regular">
                        {t("studentDataHelp")}
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { label: t("fullName"),               key: "fullName",              type: "text",  required: true },
                          { label: t("email"),                  key: "email",                 type: "email", required: true },
                          { label: t("personalAddress"),        key: "personalAddress",       type: "text",  required: false },
                          { label: t("country"),                key: "country",               type: "text",  required: true },
                          { label: t("dateOfBirth"),            key: "dateOfBirth",           type: "date",  required: false },
                          { label: t("academicQualification"),  key: "academicQualification", type: "text",  required: false },
                          { label: t("idPassportNumber"),       key: "identityNumber",        type: "text",  required: false },
                          { label: t("phone"),                  key: "phone",                 type: "tel",   required: false },
                        ].map(({ label, key, type, required }) => (
                          <div key={key}>
                            <label className="block font-montserrat-semibold text-sm mb-1.5 text-[#121c67]">
                              {label} {required && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type={type}
                              value={(formData as any)[key]}
                              onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                              required={required}
                              className="input-enhanced"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Additional Services */}
                  {currentStep === 2 && (
                    <div className="animate-card-enter">
                      <p className="font-montserrat-regular text-xs md:text-sm text-[#5260ce] mb-1 uppercase tracking-wider">
                        {t("stepOf", lang).replace("{step}", "2").replace("{total}", "4")}
                      </p>
                      <h3 className="font-montserrat-bold text-xl md:text-[26px] text-[#121c67] mb-2 flex items-center gap-2 section-title-accent pb-1">
                        <Star className="w-5 h-5 md:w-6 md:h-6 text-[#5260ce]" />
                        {t("additionalServices")}
                      </h3>
                      <p className="text-sm text-[#65666f] mb-5 font-montserrat-regular">
                        {t("additionalServicesPageDesc")}
                      </p>
                      <div className="space-y-5">
                        <div>
                          <label className="block font-montserrat-semibold text-sm mb-3">
                            {t("typeOfRequest")}
                          </label>
                          <div className="grid md:grid-cols-2 gap-3">
                            {[
                              { value: "admission_only",                      label: t("admissionOnly"),                                   desc: "$100" },
                              { value: "admission_accommodation",             label: t("admissionAccommodation"),                          desc: "$115" },
                              { value: "admission_transfer",                  label: t("admissionTransfer"),                               desc: "$115" },
                              { value: "admission_accommodation_transfer",    label: t("admissionAccommodationTransfer"),                  desc: "$130" },
                            ].map(({ value, label, desc }) => (
                              <label key={value} className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${formData.requestType === value ? "border-[#5260ce] bg-[rgba(82,96,206,0.05)]" : "border-gray-200 hover:border-[#5260ce]/40"}`}>
                                <input type="radio" name="requestType" value={value} checked={formData.requestType === value} onChange={(e) => setFormData({ ...formData, requestType: e.target.value as any })} className="w-4 h-4 mt-0.5 text-[#5260ce] shrink-0" />
                                <div>
                                  <p className="font-montserrat-semibold text-sm text-[#121c67]">{label}</p>
                                  <p className="text-xs text-[#5260ce] mt-0.5">{desc}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block font-montserrat-semibold text-sm mb-2">
                            {t("requiredCity")}
                          </label>
                          <select
                            value={formData.universityCity}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                universityCity: e.target.value,
                              })
                            }
                            className="input-enhanced"
                          >
                            <option value="">{t("selectRequiredCity")}</option>
                            {egyptianCities.map((city) => (
                              <option key={city.en} value={city.en}>
                                {isRTL ? city.ar : city.en}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-montserrat-semibold text-sm mb-2">
                            {t("expectedArrivalDate")}
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={formData.expectedArrivalDate}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  expectedArrivalDate: e.target.value,
                                })
                              }
                              placeholder={t("specifyArrivalDate")}
                              className="input-enhanced pr-10"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                              📅
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block font-montserrat-semibold text-sm mb-2">
                            {t("additionalNotes")}
                          </label>
                          <textarea
                            value={formData.additionalNotes}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                additionalNotes: e.target.value,
                              })
                            }
                            placeholder={t("writeNotesHere")}
                            rows={4}
                            className="input-enhanced"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Upload Documents */}
                  {currentStep === 3 && (
                    <div className="animate-card-enter">
                      <p className="font-montserrat-regular text-xs md:text-sm text-[#5260ce] mb-1 uppercase tracking-wider">
                        {t("stepOf", lang).replace("{step}", "3").replace("{total}", "4")}
                      </p>
                      <h3 className="font-montserrat-bold text-xl md:text-[26px] text-[#121c67] mb-2 flex items-center gap-2 section-title-accent pb-1">
                        <FileText className="w-5 h-5 md:w-6 md:h-6 text-[#5260ce]" />
                        {t("uploadDocuments")}
                      </h3>
                      <p className="text-sm text-[#65666f] mb-5 font-montserrat-regular">
                        {t("uploadDocumentsPageDesc")}
                      </p>
                      <div className="space-y-4 md:space-y-6">
                        {[
                          {
                            type: "high_school_card",
                            label: t("highSchoolCertificate"),
                          },
                          {
                            type: "language_proof",
                            label: t("languageCertificate"),
                          },
                          { type: "passport", label: t("passport") },
                          {
                            type: "other",
                            label: t("otherDocumentsOptional"),
                          },
                        ].map(({ type, label }) => (
                          <div key={type}>
                            <label className="block font-montserrat-semibold text-sm mb-2">
                              {label}
                            </label>
                            {formData.documents[type] ? (
                              <div className="flex items-center gap-3 p-4 border border-green-200 rounded-xl bg-green-50">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                  <Check className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="flex-1 text-sm font-montserrat-regular text-green-800 truncate">
                                  {formData.documents[type].file.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newDocs = { ...formData.documents };
                                    delete newDocs[type];
                                    setFormData({ ...formData, documents: newDocs });
                                  }}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[#5260ce]/30 rounded-xl cursor-pointer hover:border-[#5260ce] hover:bg-[rgba(82,96,206,0.03)] transition-all bg-[#f9fafe]">
                                {uploading === type ? (
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5260ce]" />
                                ) : (
                                  <>
                                    <Upload className="w-7 h-7 text-[#5260ce]/60 mb-2" />
                                    <p className="text-xs text-[#65666f] font-montserrat-regular text-center px-3">{t("clickOrDragUpload")}</p>
                                  </>
                                )}
                                <input
                                  type="file"
                                  className="hidden"
                                  disabled={uploading === type}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleDocumentUpload(type, file);
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        ))}
                        <div>
                          <label className="block font-montserrat-semibold text-sm mb-2">
                            {t("haveFeedback")}
                          </label>
                          <textarea
                            value={formData.feedback}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                feedback: e.target.value,
                              })
                            }
                            placeholder={t("feedbackPlaceholder")}
                            rows={4}
                            className="input-enhanced"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Payment */}
                  {currentStep === 4 && (
                    <div className="animate-card-enter">
                      <p className="font-montserrat-regular text-xs md:text-sm text-[#5260ce] mb-1 uppercase tracking-wider">
                        {t("stepOf", lang).replace("{step}", "4").replace("{total}", "4")}
                      </p>
                      <h3 className="font-montserrat-bold text-xl md:text-[26px] text-[#121c67] mb-2 flex items-center gap-2 section-title-accent pb-1">
                        <Shield className="w-5 h-5 md:w-6 md:h-6 text-[#5260ce]" />
                        {t("securePayment")}
                      </h3>
                      <p className="text-sm text-[#65666f] mb-5 font-montserrat-regular">
                        {t("securePaymentDesc")}
                      </p>

                      {/* Application Summary */}
                      <div className="bg-gradient-to-br from-[#f0f4ff] to-[#e8eaf6] rounded-2xl p-5 md:p-6 mb-5 border border-[#5260ce]/10">
                        <h4 className="font-montserrat-semibold text-sm md:text-base text-[#5260ce] mb-3 md:mb-4">
                          {t("applicationSummary")}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                          <div>
                            <span className="text-gray-600">
                              {t("universityName")}:
                            </span>
                          </div>
                          <div>
                            <span className="font-montserrat-semibold text-gray-900">
                              {university?.name || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              {t("programName")}:
                            </span>
                          </div>
                          <div>
                            <span className="font-montserrat-semibold text-gray-900">
                              {program?.name || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              {t("applicationFee")}:
                            </span>
                          </div>
                          <div>
                            <span className="font-montserrat-semibold text-gray-900">
                              $100
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              {t("additionalFees")}:
                            </span>
                          </div>
                          <div>
                            <span className="font-montserrat-semibold text-gray-900">
                              $
                              {(() => {
                                const services: string[] = [];
                                if (
                                  formData.requestType ===
                                    "admission_accommodation" ||
                                  formData.requestType ===
                                    "admission_accommodation_transfer"
                                ) {
                                  services.push("accommodation");
                                }
                                if (
                                  formData.requestType ===
                                    "admission_transfer" ||
                                  formData.requestType ===
                                    "admission_accommodation_transfer"
                                ) {
                                  services.push("airport_transfer");
                                }
                                return services.length * 15;
                              })()}
                            </span>
                          </div>
                          <div className="col-span-2 border-t border-gray-300 pt-3 mt-2">
                            <div className="flex justify-between">
                              <span className="font-montserrat-semibold text-[#5260ce]">
                                {t("total")}:
                              </span>
                              <span className="font-montserrat-semibold text-[#5260ce]">
                                $
                                {(() => {
                                  const services: string[] = [];
                                  if (
                                    formData.requestType ===
                                      "admission_accommodation" ||
                                    formData.requestType ===
                                      "admission_accommodation_transfer"
                                  ) {
                                    services.push("accommodation");
                                  }
                                  if (
                                    formData.requestType ===
                                      "admission_transfer" ||
                                    formData.requestType ===
                                      "admission_accommodation_transfer"
                                  ) {
                                    services.push("airport_transfer");
                                  }
                                  return 100 + services.length * 15;
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Options */}
                      <div className="mb-6">
                        <label className="block font-montserrat-semibold text-sm mb-3">
                          {t("paymentOptions")}
                        </label>
                        <div className="flex gap-4 mb-4">
                          <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-[#5260ce] transition-colors flex-1">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="credit_card"
                              checked={formData.paymentMethod === "credit_card"}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  paymentMethod: e.target.value as any,
                                })
                              }
                              className="w-4 h-4 text-[#5260ce]"
                            />
                            <CreditCard className="w-5 h-5 text-[#5260ce]" />
                            <span className="font-montserrat-regular">
                              {t("creditCard")}
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-[#5260ce] transition-colors flex-1">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="paypal"
                              checked={formData.paymentMethod === "paypal"}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  paymentMethod: e.target.value as any,
                                })
                              }
                              className="w-4 h-4 text-[#5260ce]"
                            />
                            <div className="w-5 h-5 bg-[#0070ba] rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                PP
                              </span>
                            </div>
                            <span className="font-montserrat-regular">
                              {t("paypal")}
                            </span>
                          </label>
                        </div>

                        {formData.paymentMethod === "credit_card" && (
                          <div className="bg-[#f9fafe] rounded-xl p-4 border border-gray-100 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block font-montserrat-semibold text-sm mb-1.5 text-[#121c67]">{t("cardNumber")}</label>
                                <input type="text" value={formData.cardNumber} onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })} placeholder="1234 5678 9012 3456" className="input-enhanced" />
                              </div>
                              <div>
                                <label className="block font-montserrat-semibold text-sm mb-1.5 text-[#121c67]">{t("cardholderName")}</label>
                                <input type="text" value={formData.cardholderName} onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })} placeholder="John Doe" className="input-enhanced" />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block font-montserrat-semibold text-sm mb-1.5 text-[#121c67]">{t("expiry")}</label>
                                  <input type="text" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} placeholder="MM/YY" className="input-enhanced" />
                                </div>
                                <div>
                                  <label className="block font-montserrat-semibold text-sm mb-1.5 text-[#121c67]">{t("cvv")}</label>
                                  <input type="text" value={formData.cvv} onChange={(e) => setFormData({ ...formData, cvv: e.target.value })} placeholder="123" className="input-enhanced" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {formData.paymentMethod === "paypal" && (
                          <div className="bg-[#f9fafe] rounded-xl p-4 border border-gray-100">
                            <label className="block font-montserrat-semibold text-sm mb-1.5 text-[#121c67]">{t("paypalEmail")}</label>
                            <input type="email" value={formData.paypalEmail} onChange={(e) => setFormData({ ...formData, paypalEmail: e.target.value })} placeholder="your@paypal.com" className="input-enhanced" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-gray-100">
                    {currentStep > 1 ? (
                      <Button type="button" onClick={handlePrevious} variant="outline" className="border-[#5260ce] text-[#5260ce] hover:bg-[#5260ce] hover:text-white px-6 h-11 rounded-xl font-montserrat-semibold transition-all">
                        {isRTL ? `→ ${t("previous")}` : `← ${t("previous")}`}
                      </Button>
                    ) : <div />}
                    {currentStep < 4 ? (
                      <Button type="button" onClick={handleNext} disabled={loading} className="bg-[#5260ce] hover:bg-[#4350b0] text-white px-8 h-11 rounded-xl font-montserrat-semibold shadow-[0_4px_16px_rgba(82,96,206,0.3)] hover:shadow-[0_6px_20px_rgba(82,96,206,0.4)] transition-all ml-auto">
                        {loading ? (
                          <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />{t("processing")}</span>
                        ) : (isRTL ? `${t("continue")} ←` : `${t("continue")} →`)}
                      </Button>
                    ) : (
                      <Button type="button" onClick={handlePayment} disabled={loading} className="bg-gradient-to-r from-[#5260ce] to-[#4350b0] text-white px-8 h-11 rounded-xl font-montserrat-semibold shadow-[0_4px_16px_rgba(82,96,206,0.3)] transition-all ml-auto">
                        {loading ? (
                          <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />{t("processing")}</span>
                        ) : `🔒 ${t("confirmOrder")}`}
                      </Button>
                    )}
                  </div>
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

export default function UniversityRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f9fafe] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5260ce] mx-auto mb-4" />
          <p className="font-montserrat-regular text-sm text-[#8b8c9a]">{t("loadingRegistration")}</p>
        </div>
      </div>
    }>
      <UniversityRegisterContent />
    </Suspense>
  );
}
