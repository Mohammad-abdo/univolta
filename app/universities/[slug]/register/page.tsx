"use client";

import { useState, useEffect } from "react";
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
import {
  apiPost,
  apiPut,
  apiUploadImage,
  apiUploadDocument,
  apiProcessPayment,
} from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
import { t } from "@/lib/i18n";

// Steps will be defined inside component to use translations

export default function UniversityRegisterPage() {
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
        setError(error.message || "Failed to create application");
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
            setError("Failed to update services. Please try again.");
          }
        } finally {
          setLoading(false);
        }
      } else {
        setError("Application ID is missing. Please go back to step 1.");
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
      setError("Please complete step 1 first");
      return;
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Please upload PDF, DOC, DOCX, or image files only.");
      return;
    }

    // Validate file size (20MB limit)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      setError("File size exceeds 20MB limit. Please upload a smaller file.");
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
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Error uploading document:", error);
      if (error.message) {
        setError(error.message);
      } else {
        setError("Failed to upload document. Please try again.");
      }
    } finally {
      setUploading(null);
    }
  };

  const handlePayment = async () => {
    if (!applicationId) {
      setError("Application ID is missing. Please go back to step 1.");
      return;
    }

    // Validate payment method
    if (!formData.paymentMethod) {
      setError("Please select a payment method");
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
        setError("Payment failed. Please check your payment details and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="font-montserrat-regular text-[18px] text-[#8b8c9a]">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Allow anonymous registration - no need to check authentication

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      <Navbar />
      <main className="pt-0 md:pt-[100px] pb-4 md:pb-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-5">
          {/* Hero Banner */}
          <div className="relative h-[200px] md:h-[350px] rounded-[16px] md:rounded-[24px] overflow-hidden mb-6 md:mb-10">
            <div className="absolute inset-0">
              <Image
                src="/80871096_078_230602_3d_studies_14_poster 1.png"
                alt="University registration"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-[rgba(18,28,103,0.4)]" />
            </div>
            <h2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-montserrat-bold text-xl md:text-[34px] leading-[1.4] text-white px-4 text-center">
              University registration
            </h2>
          </div>

          {/* Main Container with Light Blue Background */}
          <div className="bg-[rgba(232,234,246,0.3)] rounded-[16px] md:rounded-[24px]">
            <div className="grid lg:grid-cols-4 gap-4 md:gap-8">
              {/* Left Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-[#5260ce] rounded-xl p-4 md:p-6 text-white lg:sticky lg:top-[120px] shadow-lg">
                  <h3 className="font-montserrat-bold text-sm md:text-[16px] leading-normal mb-2 text-white line-clamp-2">
                    Enrol in the {program?.name || "Program"} major at{" "}
                    {university?.name || "University"}
                  </h3>
                  <p className="text-xs md:text-[13px] mb-4 text-white/90 font-montserrat-regular">
                    You have 4 steps to register.
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
                <div className="bg-white rounded-xl p-4 md:p-8 shadow-md">
                  {error && (
                    <div className="mb-4 p-3 md:p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-2 md:gap-3">
                      <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-montserrat-semibold text-sm md:text-base text-red-800 mb-1">
                          Error
                        </p>
                        <p className="text-red-700 text-xs md:text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Student Data */}
                  {currentStep === 1 && (
                    <div>
                      <p className="font-montserrat-regular text-xs md:text-[14px] text-[#8b8c9a] mb-1">
                        Registration Form
                      </p>
                      <h3 className="font-montserrat-bold text-xl md:text-[28px] text-[#121c67] mb-2 flex items-center gap-2">
                        <User className="w-5 h-5 md:w-6 md:h-6" />
                        Student Data
                      </h3>
                      <p className="text-sm md:text-base text-[#65666f] mb-4 md:mb-6">
                        Please enter your personal and academic information
                        accurately for your application to be processed
                        correctly.
                      </p>
                      <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                        <div>
                          <label className="block font-montserrat-semibold text-sm mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                fullName: e.target.value,
                              })
                            }
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          />
                        </div>
                        <div>
                          <label className="block font-montserrat-semibold text-sm mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          />
                        </div>
                        <div>
                          <label className="block font-montserrat-semibold text-sm mb-2">
                            Personal address
                          </label>
                          <input
                            type="text"
                            value={formData.personalAddress}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                personalAddress: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          />
                        </div>
                        <div>
                          <label className="block font-montserrat-semibold text-sm mb-2">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.country}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                country: e.target.value,
                              })
                            }
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          />
                        </div>
                        <div>
                          <label className="block font-montserrat-semibold text-sm mb-2">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dateOfBirth: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          />
                        </div>
                        <div>
                          <label className="block font-montserrat-semibold text-sm mb-2">
                            Academic qualification
                          </label>
                          <input
                            type="text"
                            value={formData.academicQualification}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                academicQualification: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          />
                        </div>
                        <div>
                          <label className="block font-montserrat-semibold text-sm mb-2">
                            Identity or passport number
                          </label>
                          <input
                            type="text"
                            value={formData.identityNumber}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                identityNumber: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          />
                        </div>
                        <div>
                          <label className="block font-montserrat-semibold text-sm mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Additional Services */}
                  {currentStep === 2 && (
                    <div>
                      <p className="font-montserrat-regular text-xs md:text-[14px] text-[#8b8c9a] mb-1">
                        Registration Form
                      </p>
                      <h3 className="font-montserrat-bold text-xl md:text-[28px] text-[#121c67] mb-2 flex items-center gap-2">
                        <Star className="w-5 h-5 md:w-6 md:h-6" />
                        Additional Services
                      </h3>
                      <p className="text-sm md:text-base text-[#65666f] mb-4 md:mb-6">
                        Do you need support services during your studies? Choose
                        what suits you.
                      </p>
                      <div className="space-y-4 md:space-y-6">
                        <div>
                          <label className="block font-montserrat-semibold text-sm mb-3">
                            Type of request
                          </label>
                          <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-[#5260ce] transition-colors">
                              <input
                                type="radio"
                                name="requestType"
                                value="admission_only"
                                checked={
                                  formData.requestType === "admission_only"
                                }
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    requestType: e.target.value as any,
                                  })
                                }
                                className="w-4 h-4 text-[#5260ce]"
                              />
                              <span className="font-montserrat-regular">
                                University Admission Only
                              </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-[#5260ce] transition-colors">
                              <input
                                type="radio"
                                name="requestType"
                                value="admission_accommodation"
                                checked={
                                  formData.requestType ===
                                  "admission_accommodation"
                                }
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    requestType: e.target.value as any,
                                  })
                                }
                                className="w-4 h-4 text-[#5260ce]"
                              />
                              <span className="font-montserrat-regular">
                                Admission + Student Accommodation
                              </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-[#5260ce] transition-colors">
                              <input
                                type="radio"
                                name="requestType"
                                value="admission_transfer"
                                checked={
                                  formData.requestType === "admission_transfer"
                                }
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    requestType: e.target.value as any,
                                  })
                                }
                                className="w-4 h-4 text-[#5260ce]"
                              />
                              <span className="font-montserrat-regular">
                                Admission + Airport Transfer
                              </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-[#5260ce] transition-colors">
                              <input
                                type="radio"
                                name="requestType"
                                value="admission_accommodation_transfer"
                                checked={
                                  formData.requestType ===
                                  "admission_accommodation_transfer"
                                }
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    requestType: e.target.value as any,
                                  })
                                }
                                className="w-4 h-4 text-[#5260ce]"
                              />
                              <span className="font-montserrat-regular">
                                Admission + Accommodation + Airport Transfer
                              </span>
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block font-montserrat-semibold text-sm mb-2">
                            The required city
                          </label>
                          <select
                            value={formData.universityCity}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                universityCity: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          >
                            <option value="">Select the required city</option>
                            <option value="New York">New York</option>
                            <option value="Los Angeles">Los Angeles</option>
                            <option value="Chicago">Chicago</option>
                            <option value="Boston">Boston</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-montserrat-semibold text-sm mb-2">
                            Expected arrival date
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
                              placeholder="Specify the expected arrival date"
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                              📅
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block font-montserrat-semibold text-sm mb-2">
                            Additional notes
                          </label>
                          <textarea
                            value={formData.additionalNotes}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                additionalNotes: e.target.value,
                              })
                            }
                            placeholder="...write your notes here"
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Upload Documents */}
                  {currentStep === 3 && (
                    <div>
                      <p className="font-montserrat-regular text-xs md:text-[14px] text-[#8b8c9a] mb-1">
                        Registration Form
                      </p>
                      <h3 className="font-montserrat-bold text-xl md:text-[28px] text-[#121c67] mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5 md:w-6 md:h-6" />
                        Upload Documents
                      </h3>
                      <p className="text-sm md:text-base text-[#65666f] mb-4 md:mb-6">
                        Please enter your personal and academic information
                        accurately for your application to be processed
                        correctly.
                      </p>
                      <div className="space-y-4 md:space-y-6">
                        {[
                          {
                            type: "high_school_card",
                            label: "High School Certificate",
                          },
                          {
                            type: "language_proof",
                            label: "Language certificate",
                          },
                          { type: "passport", label: "Passport" },
                          {
                            type: "other",
                            label: "Other documents (optional)",
                          },
                        ].map(({ type, label }) => (
                          <div key={type}>
                            <label className="block font-montserrat-semibold text-sm mb-2">
                              {label}
                            </label>
                            {formData.documents[type] ? (
                              <div className="flex items-center gap-2 p-4 border border-gray-300 rounded-lg bg-gray-50">
                                <span className="flex-1 text-sm">
                                  {formData.documents[type].file.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newDocs = { ...formData.documents };
                                    delete newDocs[type];
                                    setFormData({
                                      ...formData,
                                      documents: newDocs,
                                    });
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#5260ce] transition-colors bg-gray-50">
                                <div className="text-center">
                                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                  <p className="text-sm text-gray-600">
                                    {uploading === type
                                      ? "Uploading..."
                                      : "Drag the file here or browse files on your device"}
                                  </p>
                                </div>
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
                            Do you have any feedback?
                          </label>
                          <textarea
                            value={formData.feedback}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                feedback: e.target.value,
                              })
                            }
                            placeholder="User feedback..."
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Payment */}
                  {currentStep === 4 && (
                    <div>
                      <p className="font-montserrat-regular text-xs md:text-[14px] text-[#8b8c9a] mb-1">
                        Registration Form
                      </p>
                      <h3 className="font-montserrat-bold text-xl md:text-[28px] text-[#121c67] mb-2 flex items-center gap-2">
                        <Shield className="w-5 h-5 md:w-6 md:h-6" />
                        Payment
                      </h3>
                      <p className="text-sm md:text-base text-[#65666f] mb-4 md:mb-6">
                        Pay the application fee using the method that suits you
                        to confirm the request. The payment status will be
                        updated automatically.
                      </p>

                      {/* Application Summary */}
                      <div className="bg-[#F0F4FF] rounded-lg p-4 md:p-6 mb-4 md:mb-6 border border-[#E0E6F1]">
                        <h4 className="font-montserrat-semibold text-sm md:text-base text-[#5260ce] mb-3 md:mb-4">
                          Application Summary
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                          <div>
                            <span className="text-gray-600">
                              University Name:
                            </span>
                          </div>
                          <div>
                            <span className="font-montserrat-semibold text-gray-900">
                              {university?.name || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Programme Name:
                            </span>
                          </div>
                          <div>
                            <span className="font-montserrat-semibold text-gray-900">
                              {program?.name || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Application Fee:
                            </span>
                          </div>
                          <div>
                            <span className="font-montserrat-semibold text-gray-900">
                              $100
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Processing Fee:
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
                                Total:
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
                          Payment Options
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
                              Credit card
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
                              PayPal
                            </span>
                          </label>
                        </div>

                        {formData.paymentMethod === "credit_card" && (
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block font-montserrat-semibold text-sm mb-2">
                                Card number
                              </label>
                              <input
                                type="text"
                                value={formData.cardNumber}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    cardNumber: e.target.value,
                                  })
                                }
                                placeholder="Card Number"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                              />
                            </div>
                            <div>
                              <label className="block font-montserrat-semibold text-sm mb-2">
                                Card holder name
                              </label>
                              <input
                                type="text"
                                value={formData.cardholderName}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    cardholderName: e.target.value,
                                  })
                                }
                                placeholder="Cardholder Name"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                              />
                            </div>
                            <div>
                              <label className="block font-montserrat-semibold text-sm mb-2">
                                Expiration date
                              </label>
                              <input
                                type="text"
                                value={formData.expiryDate}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    expiryDate: e.target.value,
                                  })
                                }
                                placeholder="Expiry Date"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                              />
                            </div>
                            <div>
                              <label className="block font-montserrat-semibold text-sm mb-2">
                                CVV
                              </label>
                              <input
                                type="text"
                                value={formData.cvv}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    cvv: e.target.value,
                                  })
                                }
                                placeholder="CVV"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                              />
                            </div>
                          </div>
                        )}

                        {formData.paymentMethod === "paypal" && (
                          <div>
                            <label className="block font-montserrat-semibold text-sm mb-2">
                              PayPal account email
                            </label>
                            <input
                              type="email"
                              value={formData.paypalEmail}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  paypalEmail: e.target.value,
                                })
                              }
                              placeholder="user.uers@gmail.com"
                              className="w-full border border-gray-300 rounded-lg px-4 py-2"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 md:mt-8">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        onClick={handlePrevious}
                        variant="outline"
                        className="bg-[#75d3f7] text-white hover:bg-[#5fb8d9] border-none text-sm md:text-base w-full sm:w-auto"
                      >
                        Previous
                      </Button>
                    )}
                    <div className={currentStep > 1 ? "sm:ml-auto w-full sm:w-auto" : "sm:ml-auto w-full sm:w-auto"}>
                      {currentStep < 4 ? (
                        <Button
                          type="button"
                          onClick={handleNext}
                          disabled={loading}
                          className="bg-[#5260ce] hover:bg-[#4350b0] text-white text-sm md:text-base w-full sm:w-auto"
                        >
                          {loading ? "Processing..." : "Next"}
                        </Button>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                          {currentStep > 1 && (
                            <Button
                              type="button"
                              onClick={handlePrevious}
                              variant="outline"
                              className="bg-[#75d3f7] text-white hover:bg-[#5fb8d9] border-none text-sm md:text-base w-full sm:w-auto"
                            >
                              Previous
                            </Button>
                          )}
                          <Button
                            type="button"
                            onClick={handlePayment}
                            disabled={loading}
                            className="bg-[#5260ce] hover:bg-[#4350b0] text-white text-sm md:text-base w-full sm:w-auto"
                          >
                            {loading ? t("processing") : t("confirmOrder")}
                          </Button>
                        </div>
                      )}
                    </div>
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
