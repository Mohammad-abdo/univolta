"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/constants";
import { type UserRole } from "@/lib/permissions";
import { buildCan, fetchMeAuthz } from "@/lib/authz";
import {
  LayoutDashboard,
  LayoutGrid,
  Images,
  Globe2,
  PanelBottom,
  Inbox,
  GraduationCap,
  BookOpen,
  ClipboardList,
  HelpCircle,
  Users,
  LogOut,
  X,
  Bell,
  BarChart3,
  Layers,
  Wallet,
  Star,
  KeyRound,
  UsersRound,
  DollarSign,
  Building2,
  FolderTree,
  Calendar,
  CalendarRange,
  Award,
  SlidersHorizontal,
  ScrollText,
  Mail,
  UserCircle,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { t, getLanguage } from "@/lib/i18n";
import { Toaster } from "react-hot-toast";
import { figmaAssets } from "@/lib/figma-assets";
import { fetchPublicSiteSettings } from "@/lib/site-settings";
import { getImageUrl } from "@/lib/image-utils";
import { CreditBar } from "@/components/credit-bar";

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
      { href: "/dashboard/partner", label: t("dashboard"), icon: LayoutDashboard },
      {
        href: "/dashboard/partner/students",
        label: t("students"),
        icon: UsersRound,
      },
      {
        href: "/dashboard/partner/payments",
        label: t("payments"),
        icon: Wallet,
      },
      {
        href: "/dashboard/partner/programs",
        label: t("programs"),
        icon: BookOpen,
      },
      {
        href: "/dashboard/partner/departments",
        label: t("departments"),
        icon: FolderTree,
      },
      {
        href: "/dashboard/partner/semesters",
        label: t("semesters"),
        icon: Calendar,
      },
      {
        href: "/dashboard/partner/educational-years",
        label: t("educationalYears"),
        icon: CalendarRange,
      },
      {
        href: "/dashboard/partner/degrees",
        label: t("degrees"),
        icon: Award,
      },
      {
        href: "/dashboard/partner/reports",
        label: t("reports"),
        icon: BarChart3,
      },
      {
        href: "/dashboard/partner/email-center",
        label: "Email Center",
        icon: Mail,
      },
      {
        href: "/dashboard/partner/profile",
        label: t("universityProfile"),
        icon: Building2,
      },
      {
        href: "/dashboard/partner/alerts",
        label: t("notifications"),
        icon: Bell,
      },
      {
        href: "/dashboard/partner/settings",
        label: t("settings"),
        icon: SlidersHorizontal,
      },
    ];
  }

  // Admin/Editor menu items
  return [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    {
      href: "/dashboard/cms",
      label: t("sidebarCmsOverview"),
      icon: LayoutGrid,
    },
    {
      href: "/dashboard/cms/homepage",
      label: t("sidebarCmsHomepage"),
      icon: Images,
    },
    {
      href: "/dashboard/cms/site-settings",
      label: t("sidebarCmsSiteSettings"),
      icon: Globe2,
    },
    {
      href: "/dashboard/cms/footer",
      label: t("sidebarCmsFooter"),
      icon: PanelBottom,
    },
    {
      href: "/dashboard/cms/messages",
      label: t("sidebarCmsMessages"),
      icon: Inbox,
    },
    {
      href: "/dashboard/cms/terms",
      label: "Terms & Conditions",
      icon: ScrollText,
    },
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
      href: "/dashboard/services",
      label: t("servicesSectionBadge"),
      icon: Layers,
      permission: { resource: "services", action: "read" },
    },
    {
      href: "/dashboard/applications",
      label: t("applications"),
      icon: ClipboardList,
      permission: { resource: "applications", action: "read" },
    },
    {
      href: "/dashboard/advisors",
      label: t("sidebarAdvisors"),
      icon: UserCircle,
      permission: { resource: "advisors", action: "read" },
    },
    {
      href: "/dashboard/payments",
      label: t("payments"),
      icon: DollarSign,
      permission: { resource: "payments", action: "read" },
    },
    {
      href: "/dashboard/arrivals",
      label: "Student Arrivals",
      icon: CalendarRange,
      permission: { resource: "applications", action: "read" },
    },
    {
      href: "/dashboard/testimonials",
      label: t("testimonials"),
      icon: Star,
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
      href: "/dashboard/access-control",
      label: `${t("roles")} & ${t("permissions")}`,
      icon: KeyRound,
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
  const [can, setCan] = useState<((resource: string, action: string) => boolean) | null>(null);
  const [currentLang, setCurrentLang] = useState<string>(() =>
    typeof window !== "undefined" && getLanguage() === "ar" ? "ar" : "en"
  );
  const [siteLogoUrl, setSiteLogoUrl] = useState<string>(figmaAssets.logo);
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/dashboard/login";

  useEffect(() => {
    setCurrentLang(getLanguage());
    const refreshLanguage = () => setCurrentLang(getLanguage());
    window.addEventListener("focus", refreshLanguage);
    window.addEventListener("storage", refreshLanguage);
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshLanguage();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", refreshLanguage);
      window.removeEventListener("storage", refreshLanguage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    fetchPublicSiteSettings()
      .then((settings) => {
        if (settings["site.logoUrl"]) {
          setSiteLogoUrl(getImageUrl(settings["site.logoUrl"]) || figmaAssets.logo);
        }
      })
      .catch(() => {});
  }, []);

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
            const isAdminAreaUser = role === "admin" || role === "editor";
            const isUniversityAreaUser = isUniversityRole || isPartnerUser;

            // If user is authenticated, redirect to appropriate dashboard
            if (isAdminAreaUser || isUniversityAreaUser) {
              if (isUniversityAreaUser) {
                router.push("/dashboard/partner");
              } else {
                router.push("/dashboard");
              }
              return;
            }

            // Student/other valid users: do NOT clear token and do NOT redirect.
            // They can still access their own section (/profile).
            setIsLoading(false);
            return;
          }

          // Token is invalid, allow access to login page
          if (response.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
          }
        } catch (error) {
          // Error checking auth: allow access to login page without forcing logout.
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
        const me = await fetchMeAuthz();
        const role = me.role?.toLowerCase() as UserRole;

        // Allow admin, editor, university role, or partners (users with universityId) to access dashboard
        const isPartnerUser = !!me.universityId;
        const isUniversityRole = role === "university";
        if (role !== "admin" && role !== "editor" && role !== "university" && !isPartnerUser) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          router.push("/dashboard/login");
          return;
        }

        setUserRole(role);
        setIsPartner(isPartnerUser || isUniversityRole);
        setCan(() => buildCan(me.permissions || []));
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
    if (!can) return false;
    return can(item.permission.resource as any, item.permission.action as any);
  });

  const layoutDir = currentLang === "ar" ? "rtl" : "ltr";

  return (
    <div className="dashboard min-h-screen bg-gray-50" dir={layoutDir}>
      {/* Header — inset after sidebar using logical props (works with dir on root) */}
      <DashboardHeader
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Sidebar - Desktop (position + width from globals.css .dashboard-sidebar-desktop) */}
      <aside
        className="dashboard-sidebar-desktop border-e border-[#e4e8f6] bg-gradient-to-b from-[#f6f8ff] via-white to-[#fafbff] shadow-[inset_-1px_0_0_rgba(82,96,206,0.06)]"
        dir={layoutDir}
      >
        <div className="border-b border-[#e8ebf7]/90 bg-white/75 px-4 py-5 backdrop-blur-[2px]">
          <div className="relative mx-auto mb-4 h-12 w-full max-w-[200px]">
            <Image
              src={siteLogoUrl}
              alt="Logo"
              fill
              className="object-contain object-start"
              sizes="200px"
              unoptimized
              priority
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-[rgba(82,96,206,0.12)] px-3 py-1 text-xs font-montserrat-semibold text-[#5260ce]">
              {userRole === "admin"
                ? t("admin")
                : userRole === "university" || isPartner
                  ? t("university")
                  : t("editor")}
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
            {userRole === "university" || isPartner
              ? t("universityControlPanel")
              : userRole === "admin"
                ? t("sidebarSubtitleAdmin")
                : userRole === "editor"
                  ? t("sidebarSubtitleEditor")
                  : ""}
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  isActive
                    ? "bg-white font-montserrat-semibold text-[#5260ce] shadow-sm ring-1 ring-[#5260ce]/15"
                    : "font-montserrat-regular text-[#374151] hover:bg-white/90 hover:text-[#5260ce]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isActive ? "bg-[rgba(82,96,206,0.12)] text-[#5260ce]" : "bg-transparent text-[#6b7280]"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.25 : 2} />
                </span>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-[#e8ebf7] bg-white/80 p-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex w-full items-center justify-center gap-2 rounded-xl border-[#dce2ff] text-[#5260ce] hover:bg-[rgba(82,96,206,0.08)]"
          >
            <LogOut className="h-4 w-4" />
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
            className="fixed start-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 flex-col border-e border-[#e4e8f6] bg-gradient-to-b from-[#f6f8ff] via-white to-[#fafbff] shadow-xl transition-transform duration-300 ease-in-out"
            dir={layoutDir}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2 border-b border-[#e8ebf7] bg-white/75 px-4 py-4">
              <div className="min-w-0 flex-1">
                <div className="relative mx-auto mb-3 h-10 w-full max-w-[180px]">
                  <Image
                    src={siteLogoUrl}
                    alt="Logo"
                    fill
                    className="object-contain object-start"
                    sizes="180px"
                    unoptimized
                  />
                </div>
                <span className="inline-flex rounded-full bg-[rgba(82,96,206,0.12)] px-2.5 py-0.5 text-[11px] font-montserrat-semibold text-[#5260ce]">
                  {userRole === "admin"
                    ? t("admin")
                    : userRole === "university" || isPartner
                      ? t("university")
                      : t("editor")}
                </span>
                <p className="mt-1.5 text-[10px] leading-snug text-gray-500">
                  {userRole === "university" || isPartner
                    ? t("universityControlPanel")
                    : userRole === "admin"
                      ? t("sidebarSubtitleAdmin")
                      : userRole === "editor"
                        ? t("sidebarSubtitleEditor")
                        : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="shrink-0 rounded-lg p-2 hover:bg-gray-100"
                aria-label={currentLang === "ar" ? "إغلاق القائمة" : "Close menu"}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                      isActive
                        ? "bg-white font-montserrat-semibold text-[#5260ce] shadow-sm ring-1 ring-[#5260ce]/15"
                        : "font-montserrat-regular text-[#374151] hover:bg-white/90 hover:text-[#5260ce]"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isActive ? "bg-[rgba(82,96,206,0.12)] text-[#5260ce]" : "bg-transparent text-[#6b7280]"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.25 : 2} />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-[#e8ebf7] bg-white/90 p-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex w-full items-center justify-center gap-2 rounded-xl border-[#dce2ff] text-[#5260ce] hover:bg-[rgba(82,96,206,0.08)]"
              >
                <LogOut className="h-4 w-4" />
                {t("logout")}
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content — offset via .dashboard-main-panel (logical margin) */}
      <main className="dashboard-main-panel mt-14 min-h-[calc(100vh-3.5rem)] px-2 py-3 md:mt-16 md:min-h-[calc(100vh-4rem)] md:px-6 md:py-6">
        <div className="dashboard-main-inner">{children}</div>
      </main>

      <CreditBar className="dashboard-main-panel border-gray-200" />

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
