"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, ArrowRight } from "lucide-react";
import { t } from "@/lib/i18n";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/constants";

interface Application {
  id: string;
  fullName: string;
  university?: { name: string };
  program?: { name: string };
  totalFee?: number;
  paymentStatus?: string;
}

export default function ApplicationSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const applicationId = searchParams.get("id");

  useEffect(() => {
    if (applicationId) {
      fetchApplication();
    } else {
      setLoading(false);
    }
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      // Use public endpoint that doesn't require authentication
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/public`);
      if (response.ok) {
        const data = await response.json();
        setApplication(data);
      } else {
        console.error("Failed to fetch application:", response.status);
      }
    } catch (error) {
      console.error("Error fetching application:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-64">Loading...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafe] pb-16 md:pb-0">
      <Navbar />
      <main className="pt-0 md:pt-[120px] pb-4 md:pb-20">
        <div className="max-w-[800px] mx-auto px-4 md:px-5">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-12 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="font-montserrat-bold text-2xl md:text-[32px] text-[#121c67] mb-3 md:mb-4">
              {t("applicationSubmitted")}
            </h1>
            <p className="text-gray-600 text-base md:text-lg mb-6 md:mb-8">
              {t("thankYou")}
            </p>

            {/* Application Details */}
            {application && (
              <div className="bg-gray-50 rounded-lg p-4 md:p-6 mb-6 md:mb-8 text-left">
                <h3 className="font-montserrat-semibold text-base md:text-lg text-[#121c67] mb-3 md:mb-4">
                  {t("applicationDetails")}
                </h3>
                <div className="space-y-2 text-sm md:text-base text-gray-700">
                  <p>
                    <span className="font-semibold">Name:</span> {application.fullName}
                  </p>
                  {application.program && (
                    <p>
                      <span className="font-semibold">Program:</span> {application.program.name}
                    </p>
                  )}
                  {application.university && (
                    <p>
                      <span className="font-semibold">University:</span> {application.university.name}
                    </p>
                  )}
                  {application.totalFee && (
                    <p>
                      <span className="font-semibold">Total Fee:</span> ${application.totalFee}
                    </p>
                  )}
                  {application.paymentStatus && (
                    <p>
                      <span className="font-semibold">Payment Status:</span> {application.paymentStatus}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-4 md:p-6 mb-6 md:mb-8 text-left">
              <h3 className="font-montserrat-semibold text-base md:text-lg text-[#121c67] mb-3">
                {t("whatsNext")}
              </h3>
              <ul className="space-y-2 text-sm md:text-base text-gray-700 list-disc list-inside">
                <li>{t("confirmationEmail")}</li>
                <li>{t("reviewTime")}</li>
                <li>{t("trackApplication")}</li>
                <li>{t("notifyDecision")}</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Button
                className="bg-[#5260ce] hover:bg-[#4350b0] text-white text-sm md:text-base"
                asChild
              >
                <Link href="/my-applications">
                  <FileText className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                  {t("viewMyApplications")}
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-[#5260ce] text-[#5260ce] text-sm md:text-base"
                asChild
              >
                <Link href="/universities">
                  {t("browseMorePrograms")}
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

