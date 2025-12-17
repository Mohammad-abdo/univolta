"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";

interface ProgramRegisterButtonProps {
  programId: string;
  universitySlug: string;
}

export function ProgramRegisterButton({ programId, universitySlug }: ProgramRegisterButtonProps) {
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkApplicationStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId]);

  // Re-check when component becomes visible (user navigates back to page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkApplicationStatus();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId]);

  const checkApplicationStatus = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      
      // If no token, user is not logged in - show Register Now
      if (!accessToken) {
        setHasApplied(false);
        setLoading(false);
        return;
      }

      // Get current user info to check role
      const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) {
        setHasApplied(false);
        setLoading(false);
        return;
      }

      const userData = await userResponse.json();
      
      // CRITICAL: Only check for STUDENTS (role === "user")
      // Admins, editors, and university users are NOT students
      // They should always see "Register Now" button
      if (userData.role !== "user") {
        setHasApplied(false);
        setLoading(false);
        return;
      }

      // User is a STUDENT - check if they have paid for this program
      // Backend automatically filters applications by userId for students
      const response = await fetch(`${API_BASE_URL}/applications`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        setHasApplied(false);
        setLoading(false);
        return;
      }

      const applications = await response.json();
      
      if (!Array.isArray(applications)) {
        setHasApplied(false);
        setLoading(false);
        return;
      }
      
      // Find if student has a PAID application for this specific program
      const paidApplication = applications.find((app: any) => {
        // Must be for this program
        if (app.programId !== programId) return false;
        
        // Must belong to this student (double check)
        if (app.userId !== userData.id) return false;
        
        // Check payment status - must be "paid" (case-insensitive)
        const paymentStatus = (app.paymentStatus || "").toLowerCase().trim();
        const isPaid = paymentStatus === "paid";
        
        // Also check payment record if exists
        const paymentStatusFromPayment = (app.payment?.paymentStatus || "").toLowerCase().trim();
        const hasCompletedPayment = paymentStatusFromPayment === "completed";
        
        return isPaid || hasCompletedPayment;
      });
      
      // If found paid application, show "Already Paid"
      setHasApplied(!!paidApplication);
      
      if (paidApplication) {
        console.log("✅ Student has PAID for this program:", {
          programId,
          applicationId: paidApplication.id,
          paymentStatus: paidApplication.paymentStatus,
          paymentRecordStatus: paidApplication.payment?.paymentStatus
        });
      } else {
        console.log("❌ Student has NOT paid for this program:", {
          programId,
          totalApplications: applications.length,
          applicationsForThisProgram: applications.filter((app: any) => app.programId === programId)
        });
      }
      
    } catch (error) {
      console.error("Error checking application status:", error);
      setHasApplied(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Button
        className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-[16px] h-[52px] px-8 rounded-xl shadow-lg"
        disabled
      >
        Loading...
      </Button>
    );
  }

  if (hasApplied) {
    return (
      <Button
        className="bg-green-600 hover:bg-green-700 text-white font-montserrat-semibold text-sm md:text-[16px] h-[44px] md:h-[52px] px-4 md:px-8 rounded-xl shadow-lg flex items-center gap-2"
        disabled
      >
        <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
        <span className="hidden sm:inline">Already Paid</span>
        <span className="sm:hidden">Paid</span>
      </Button>
    );
  }

  return (
    <Button
      className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm md:text-[16px] h-[44px] md:h-[52px] px-4 md:px-8 rounded-xl shadow-lg"
      asChild
    >
      <Link href={`/universities/${universitySlug}/register?program=${programId}`}>
        Register Now
      </Link>
    </Button>
  );
}

