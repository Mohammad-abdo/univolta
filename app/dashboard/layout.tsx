"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/constants";
import { canAccess, type UserRole } from "@/lib/permissions";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  FileText,
  MessageSquare,
  HelpCircle,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
  DollarSign,
  Bell,
  BarChart3,
  Settings,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { t, getLanguage } from "@/lib/i18n";
import { Toaster } from "react-hot-toast";

interface MenuItem {
  href: string;
  label: string;
  icon: any;
  permission?: { resource: string; action: string };
}

// Menu items will be translated dynamically
const getMenuItems = (isPartner: boolean = false, role?: UserRole): MenuItem[] => {
  // Partner/University menu items
  if (isPartner || role === "university") {
    return [
      { href: "/dashboard/partner", label: t("dashboard") || "Dashboard", icon: LayoutDashboard },
      {
        href: "/dashboard/partner/students",
        label: t("students") || "Students",
        icon: Users,
      },
      {
        href: "/dashboard/partner/payments",
        label: t("payments") || "Payments",
        icon: DollarSign,
      },
      {
        href: "/dashboard/partner/programs",
        label: t("programs") || "Programs",
        icon: BookOpen,
      },
      {
        href: "/dashboard/partner/departments",
        label: t("departments") || "Departments",
        icon: GraduationCap,
      },
      {
        href: "/dashboard/partner/semesters",
        label: t("semesters") || "Semesters",
        icon: FileText,
      },
      {
        href: "/dashboard/partner/educational-years",
        label: t("educationalYears") || "Educational Years",
        icon: BookOpen,
      },
      {
        href: "/dashboard/partner/degrees",
        label: t("degrees") || "Degrees",
        icon: GraduationCap,
      },
      {
        href: "/dashboard/partner/reports",
        label: t("reports") || "Reports",
        icon: BarChart3,
      },
      {
        href: "/dashboard/partner/profile",
        label: t("universityProfile") || "University Profile",
        icon: Settings,
      },
      {
        href: "/dashboard/partner/alerts",
        label: t("notifications") || "Notifications",
        icon: Bell,
      },
      {
        href: "/dashboard/partner/settings",
        label: t("settings") || "Settings",
        icon: Settings,
      },
    ];
  }

  // Admin/Editor menu items
  return [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    {
      href: "/dashboard/universities",
      label: t("universities"),
      icon: GraduationCap,
      permission: { resource: "universities", action: "read" },
    },
    {
      href: "/dashboard/programs",
      label: t("programs"),
      icon: BookOpen,
      permission: { resource: "programs", action: "read" },
    },
    {
      href: "/dashboard/applications",
      label: t("applications"),
      icon: FileText,
      permission: { resource: "applications", action: "read" },
    },
    {
      href: "/dashboard/payments",
      label: t("payments"),
      icon: DollarSign,
      permission: { resource: "applications", action: "read" },
    },
    {
      href: "/dashboard/testimonials",
      label: t("testimonials"),
      icon: MessageSquare,
      permission: { resource: "testimonials", action: "read" },
    },
    {
      href: "/dashboard/faqs",
      label: t("faq"),
      icon: HelpCircle,
      permission: { resource: "faqs", action: "read" },
    },
    {
      href: "/dashboard/users",
      label: t("users"),
      icon: Users,
      permission: { resource: "users", action: "read" },
    },
    {
      href: "/dashboard/permissions",
      label: t("permissions"),
      icon: Shield,
      permission: { resource: "users", action: "read" },
    },
    {
      href: "/dashboard/roles",
      label: t("roles"),
      icon: Shield,
      permission: { resource: "users", action: "read" },
    },
  ];
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isPartner, setIsPartner] = useState(false);
  const [currentLang, setCurrentLang] = useState<string>("en");
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/dashboard/login";

  useEffect(() => {
    setCurrentLang(getLanguage());
    // Listen for language changes
    const interval = setInterval(() => {
      const lang = getLanguage();
      if (lang !== currentLang) {
        setCurrentLang(lang);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [currentLang]);

  useEffect(() => {
    // For login page, check if user is already authenticated and redirect
    if (isLoginPage) {
      const checkIfAuthenticated = async () => {
        try {
          if (typeof window === "undefined") {
            setIsLoading(false);
            return;
          }

          const accessToken = localStorage.getItem("accessToken");
          if (!accessToken) {
            setIsLoading(false);
            return;
          }

          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            const role = userData.role?.toLowerCase() as UserRole;
            const isPartnerUser = !!userData.universityId;
            const isUniversityRole = role === "university";

            // If user is authenticated, redirect to appropriate dashboard
            if (role === "admin" || role === "editor" || role === "university" || isPartnerUser) {
              if (role === "university" || isPartnerUser) {
                router.push("/dashboard/partner");
              } else {
                router.push("/dashboard");
              }
              return;
            }
          }

          // Token is invalid, allow access to login page
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        } catch (error) {
          // Error checking auth, allow access to login page
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
          }
        } finally {
          setIsLoading(false);
        }
      };

      checkIfAuthenticated();
      return;
    }

    // For other pages, check auth normally
    checkAuth();
  }, [isLoginPage, router]);

  const checkAuth = async () => {
    try {
      if (typeof window === "undefined") {
        router.push("/dashboard/login");
        return;
      }

      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (accessToken && refreshToken) {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          router.push("/dashboard/login");
          return;
        }

        const userData = await response.json();
        const role = userData.role?.toLowerCase() as UserRole;

        // Allow admin, editor, university role, or partners (users with universityId) to access dashboard
        const isPartnerUser = !!userData.universityId;
        const isUniversityRole = role === "university";
        if (role !== "admin" && role !== "editor" && role !== "university" && !isPartnerUser) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          router.push("/dashboard/login");
          return;
        }

        setUserRole(role);
        setIsPartner(isPartnerUser || isUniversityRole);
        setIsAuthenticated(true);
        return;
      }

      router.push("/dashboard/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      try {
        if (accessToken) {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        }
      } catch (error) {
        console.error("Failed to log out via API", error);
      } finally {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }
    router.push("/dashboard/login");
  };

  // If on login page, render children directly without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t("loading")}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Filter menu items based on user permissions
  const menuItems = getMenuItems(isPartner, userRole || undefined).filter((item) => {
    if (!item.permission) return true; // Dashboard is always accessible
    return canAccess(
      userRole,
      item.permission.resource as any,
      item.permission.action as any
    );
  });

  return (
    <div className="dashboard min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:block fixed left-0 rtl:left-auto rtl:right-0 top-0 h-full w-64 bg-white border-r rtl:border-r-0 rtl:border-l border-gray-200 z-40">
        <div className="p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-montserrat-bold text-[#121c67]">
            UniVolta{" "}
            {userRole === "admin"
              ? t("admin") || "Admin"
              : userRole === "university" || isPartner
              ? t("university") || "University"
              : t("editor") || "Editor"}
          </h1>
          <p className="text-xs text-gray-500 mt-1 capitalize">
            {userRole === "university" || isPartner
              ? t("universityControlPanel") || "University Control Panel"
              : userRole}
          </p>
        </div>
        <nav className="px-2 md:px-4 overflow-y-auto h-[calc(100vh-200px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 mb-1 md:mb-2 rounded-lg transition-colors text-sm md:text-base ${
                  isActive
                    ? "bg-[rgba(82,96,206,0.1)] text-[#5260ce] font-montserrat-semibold"
                    : "hover:bg-[rgba(82,96,206,0.1)] text-[#2e2e2e] font-montserrat-regular"
                }`}
              >
                <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 hidden md:block">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {t("logout")}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <aside
            className={`fixed ${currentLang === "ar" ? "right-0" : "left-0"} top-16 h-[calc(100vh-4rem)] w-64 bg-white z-40 transform transition-transform duration-300 ease-in-out shadow-xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-montserrat-bold text-[#121c67]">
                    UniVolta{" "}
                    {userRole === "admin"
                      ? t("admin") || "Admin"
                      : userRole === "university" || isPartner
                      ? t("university") || "University"
                      : t("editor") || "Editor"}
                  </h1>
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    {userRole === "university" || isPartner
                      ? t("universityControlPanel") || "University Control Panel"
                      : userRole}
                  </p>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <nav className="px-2 overflow-y-auto h-[calc(100vh-250px)]">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 mb-1 rounded-lg transition-colors text-sm ${
                      isActive
                        ? "bg-[rgba(82,96,206,0.1)] text-[#5260ce] font-montserrat-semibold"
                        : "hover:bg-[rgba(82,96,206,0.1)] text-[#2e2e2e] font-montserrat-regular"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {t("logout")}
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className={`ml-0 rtl:ml-0 rtl:mr-0 mt-16 md:mt-16 md:ml-64 rtl:md:ml-0 rtl:md:mr-64 px-2 py-3 md:p-6 min-h-[calc(100vh-4rem)] overflow-x-hidden ${currentLang === "ar" ? "rtl" : "ltr"}`}>
        <div className="max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}
