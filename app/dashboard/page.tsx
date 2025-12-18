"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { showToast } from "@/lib/toast";
import {
  canAccess,
  type UserRole,
  type Resource,
  type Action,
} from "@/lib/permissions";
import { API_BASE_URL } from "@/lib/constants";
import {
  GraduationCap,
  BookOpen,
  FileText,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Plus,
  Eye,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { t, getLanguage } from "@/lib/i18n";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  month: string;
  applications: number;
  revenue: number;
  approved: number;
  pending: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    universities: 0,
    programs: 0,
    applications: 0,
    users: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    reviewApplications: 0,
    totalRevenue: 0,
    activeUniversities: 0,
    programsByDegree: { bachelor: 0, master: 0, phd: 0, diploma: 0 },
    applicationsThisMonth: 0,
    revenueThisMonth: 0,
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [topUniversities, setTopUniversities] = useState<any[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [programsByCountry, setProgramsByCountry] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentLang, setCurrentLang] = useState<string>("en");
  const router = useRouter();

  useEffect(() => {
    setCurrentLang(getLanguage());
    const interval = setInterval(() => {
      const lang = getLanguage();
      if (lang !== currentLang) {
        setCurrentLang(lang);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [currentLang]);

  useEffect(() => {
    fetchStats();
    fetchRecentApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) return;

      const userData = await userResponse.json();
      const role = userData.role?.toLowerCase() as UserRole;
      setUserRole(role);

      const promises: Promise<any>[] = [];

      if (canAccess(role, "universities", "read")) {
        promises.push(apiGet<any[]>("/universities").catch(() => []));
      } else {
        promises.push(Promise.resolve([]));
      }

      if (canAccess(role, "programs", "read")) {
        promises.push(apiGet<any[]>("/programs").catch(() => []));
      } else {
        promises.push(Promise.resolve([]));
      }

      if (canAccess(role, "applications", "read")) {
        promises.push(apiGet<any[]>("/applications").catch(() => []));
      } else {
        promises.push(Promise.resolve([]));
      }

      if (canAccess(role, "users", "read")) {
        promises.push(apiGet<any[]>("/users").catch(() => []));
      } else {
        promises.push(Promise.resolve([]));
      }

      const [universities, programs, applications, users] = await Promise.all(
        promises
      );

      const pendingApplications = applications.filter(
        (app: any) => app.status === "PENDING"
      ).length;
      const approvedApplications = applications.filter(
        (app: any) => app.status === "APPROVED"
      ).length;
      const rejectedApplications = applications.filter(
        (app: any) => app.status === "REJECTED"
      ).length;
      const reviewApplications = applications.filter(
        (app: any) => app.status === "REVIEW"
      ).length;

      // Calculate additional stats
      const activeUniversities = universities.filter((u: any) => u.isActive !== false).length;
      const bachelorPrograms = programs.filter((p: any) => 
        p.degree?.toLowerCase().includes("bachelor") || p.degree?.toLowerCase().includes("undergraduate")
      ).length;
      const masterPrograms = programs.filter((p: any) => 
        p.degree?.toLowerCase().includes("master") || p.degree?.toLowerCase().includes("graduate")
      ).length;
      const phdPrograms = programs.filter((p: any) => 
        p.degree?.toLowerCase().includes("phd") || p.degree?.toLowerCase().includes("doctorate")
      ).length;
      const diplomaPrograms = programs.filter((p: any) => 
        p.degree?.toLowerCase().includes("diploma") || p.degree?.toLowerCase().includes("certificate")
      ).length;

      // Calculate revenue from paid applications
      const totalRevenue = applications.reduce((sum: number, app: any) => {
        return sum + (Number(app.totalFee) || 0);
      }, 0);

      // Applications this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const applicationsThisMonth = applications.filter((app: any) => {
        const appDate = new Date(app.createdAt);
        return appDate >= startOfMonth;
      }).length;

      // Revenue this month
      const revenueThisMonth = applications
        .filter((app: any) => {
          const appDate = new Date(app.createdAt);
          return appDate >= startOfMonth;
        })
        .reduce((sum: number, app: any) => {
          return sum + (Number(app.totalFee) || 0);
        }, 0);

      // Generate monthly chart data (last 12 months)
      const monthlyData: ChartData[] = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthApps = applications.filter((app: any) => {
          const appDate = new Date(app.createdAt);
          return appDate >= monthStart && appDate <= monthEnd;
        });

        const monthRevenue = monthApps.reduce((sum: number, app: any) => {
          return sum + (Number(app.totalFee) || 0);
        }, 0);

        const monthApproved = monthApps.filter((app: any) => app.status === "APPROVED").length;
        const monthPending = monthApps.filter((app: any) => app.status === "PENDING").length;

        monthlyData.push({
          month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          applications: monthApps.length,
          revenue: monthRevenue,
          approved: monthApproved,
          pending: monthPending,
        });
      }
      setChartData(monthlyData);

      // Top universities by program count
      const universityProgramCounts: Record<string, { count: number; university: any }> = {};
      programs.forEach((program: any) => {
        if (program.universityId) {
          if (!universityProgramCounts[program.universityId]) {
            const uni = universities.find((u: any) => u.id === program.universityId);
            universityProgramCounts[program.universityId] = {
              count: 0,
              university: uni,
            };
          }
          universityProgramCounts[program.universityId].count += 1;
        }
      });

      const topUnis = Object.values(universityProgramCounts)
        .map((item) => ({
          ...item.university,
          programCount: item.count,
        }))
        .filter((uni) => uni.id)
        .sort((a: any, b: any) => b.programCount - a.programCount)
        .slice(0, 10);

      setTopUniversities(topUnis);

      // Programs by country
      const countryProgramCounts: Record<string, number> = {};
      universities.forEach((uni: any) => {
        if (uni.country) {
          countryProgramCounts[uni.country] = (countryProgramCounts[uni.country] || 0) + 
            programs.filter((p: any) => p.universityId === uni.id).length;
        }
      });

      const countryData = Object.entries(countryProgramCounts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      setProgramsByCountry(countryData);

      setStats({
        universities: universities.length || 0,
        programs: programs.length || 0,
        applications: applications.length || 0,
        users: users.length || 0,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        reviewApplications,
        totalRevenue,
        activeUniversities,
        programsByDegree: { 
          bachelor: bachelorPrograms, 
          master: masterPrograms,
          phd: phdPrograms,
          diploma: diplomaPrograms,
        },
        applicationsThisMonth,
        revenueThisMonth,
      });
    } catch (error: any) {
      showToast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentApplications = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) return;

      const userData = await userResponse.json();
      const role = userData.role?.toLowerCase() as UserRole;

      if (canAccess(role, "applications", "read")) {
        const applications = await apiGet<any[]>("/applications").catch(() => []);
        // Get 5 most recent applications
        const recent = applications
          .sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5);
        setRecentApplications(recent);
      }
    } catch (error: any) {
      // Silent fail for recent applications
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#5260ce] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-gray-600">{t("loadingDashboard")}</div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: t("universities"),
      value: stats.universities,
      color: "from-blue-500 to-blue-600",
      icon: GraduationCap,
      permission: {
        resource: "universities" as const,
        action: "read" as const,
      },
      href: "/dashboard/universities",
    },
    {
      title: t("programs"),
      value: stats.programs,
      color: "from-green-500 to-green-600",
      icon: BookOpen,
      permission: { resource: "programs" as const, action: "read" as const },
      href: "/dashboard/programs",
    },
    {
      title: t("applications"),
      value: stats.applications,
      color: "from-purple-500 to-purple-600",
      icon: FileText,
      permission: {
        resource: "applications" as const,
        action: "read" as const,
      },
      href: "/dashboard/applications",
    },
    {
      title: t("users"),
      value: stats.users,
      color: "from-orange-500 to-orange-600",
      icon: Users,
      permission: { resource: "users" as const, action: "read" as const },
      href: "/dashboard/users",
    },
  ].filter(
    (card) =>
      !userRole ||
      canAccess(userRole, card.permission.resource, card.permission.action)
  );

  const applicationStatusData = [
    { name: t("approved"), value: stats.approvedApplications, color: "#10b981" },
    { name: t("pending"), value: stats.pendingApplications, color: "#f59e0b" },
    { name: t("review"), value: stats.reviewApplications, color: "#3b82f6" },
    { name: t("rejected"), value: stats.rejectedApplications, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  const programsByDegreeData = [
    { name: t("bachelors"), value: stats.programsByDegree.bachelor, color: "#3b82f6" },
    { name: t("masters"), value: stats.programsByDegree.master, color: "#10b981" },
    { name: t("phd"), value: stats.programsByDegree.phd, color: "#8b5cf6" },
    { name: t("diploma"), value: stats.programsByDegree.diploma, color: "#f59e0b" },
  ].filter((item) => item.value > 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "APPROVED":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "REVIEW":
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "REVIEW":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#5260ce] to-[#4350b0] rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-montserrat-bold mb-2">
              {t("welcomeBack")} 👋
            </h1>
            <p className="text-blue-100 text-sm sm:text-base md:text-lg">
              {t("whatsHappening")}
            </p>
          </div>
          <div className="hidden md:block flex-shrink-0 ml-4">
            <TrendingUp className="w-20 h-20 lg:w-24 lg:h-24 text-blue-200 opacity-50" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              href={stat.href}
              className="group bg-white rounded-lg md:rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-[#5260ce] transform hover:-translate-y-1"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className={`p-2 md:p-3 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <ArrowRight className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-[#5260ce] transition-all flex-shrink-0 ${currentLang === "ar" ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-montserrat-regular text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl md:text-3xl font-montserrat-bold text-[#121c67]">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Revenue & Applications Overview Cards */}
      {userRole && canAccess(userRole, "applications", "read") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-montserrat-regular text-green-700">{t("totalRevenue")}</p>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-montserrat-bold text-green-800">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <p className="text-xs text-green-600 mt-1">{t("allTime")}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-montserrat-regular text-blue-700">{t("thisMonth")}</p>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-montserrat-bold text-blue-800">
              {stats.applicationsThisMonth}
            </p>
            <p className="text-xs text-blue-600 mt-1">{t("newApplications")}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-montserrat-regular text-purple-700">{t("revenueThisMonth")}</p>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-montserrat-bold text-purple-800">
              {formatCurrency(stats.revenueThisMonth)}
            </p>
            <p className="text-xs text-purple-600 mt-1">{t("currentMonth")}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-md p-6 border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-montserrat-regular text-orange-700">{t("activeUniversities")}</p>
              <GraduationCap className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-montserrat-bold text-orange-800">
              {stats.activeUniversities}
            </p>
            <p className="text-xs text-orange-600 mt-1">{t("outOf")} {stats.universities} {t("total")}</p>
          </div>
        </div>
      )}

      {/* Charts Row 1: Applications & Revenue Trends */}
      {userRole && canAccess(userRole, "applications", "read") && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications Trend Line Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-montserrat-bold text-[#121c67] flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                {t("applicationsTrend")}
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#fff", 
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", r: 4 }}
                  name={t("applications")}
                />
                <Line 
                  type="monotone" 
                  dataKey="approved" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 3 }}
                  name={t("approved")}
                />
                <Line 
                  type="monotone" 
                  dataKey="pending" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b", r: 3 }}
                  name={t("pending")}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Trend Area Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-montserrat-bold text-[#121c67] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                {t("revenueTrend")}
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#fff", 
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Charts Row 2: Distribution Charts */}
      {userRole && canAccess(userRole, "applications", "read") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Application Status Pie Chart */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-montserrat-bold text-[#121c67] flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                {t("applicationStatusDistribution")}
              </h2>
            </div>
            {applicationStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={applicationStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {applicationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                {t("noApplicationDataAvailable")}
              </div>
            )}
          </div>

          {/* Programs by Degree Bar Chart */}
          {userRole && canAccess(userRole, "programs", "read") && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-montserrat-bold text-[#121c67] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  {t("programsByDegreeType")}
                </h2>
              </div>
              {programsByDegreeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={programsByDegreeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6b7280"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#fff", 
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {programsByDegreeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  {t("noProgramDataAvailable")}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Charts Row 3: Top Universities & Programs by Country */}
      {userRole && canAccess(userRole, "universities", "read") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Universities Bar Chart */}
          {topUniversities.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-montserrat-bold text-[#121c67] flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  {t("topUniversitiesByPrograms")}
                </h2>
                <Link
                  href="/dashboard/universities"
                  className="text-sm text-[#5260ce] hover:underline font-montserrat-semibold flex items-center gap-1"
                >
                  {t("viewAll")}
                  <ArrowRight className={`w-4 h-4 ${currentLang === "ar" ? "rotate-180" : ""}`} />
                </Link>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={topUniversities.slice(0, 8)}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                    width={120}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#fff", 
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="programCount" radius={[0, 8, 8, 0]} fill="#5260ce" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Programs by Country Bar Chart */}
          {programsByCountry.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-montserrat-bold text-[#121c67] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  {t("programsByCountry")}
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={programsByCountry}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="country" 
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#fff", 
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Recent Applications */}
      {userRole && canAccess(userRole, "applications", "read") && recentApplications.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-montserrat-bold text-[#121c67]">
              {t("recentApplications")}
            </h2>
            <Link
              href="/dashboard/applications"
              className="text-sm text-[#5260ce] hover:underline font-montserrat-semibold flex items-center gap-1"
            >
              {t("viewAll")}
              <ArrowRight className={`w-4 h-4 ${currentLang === "ar" ? "rotate-180" : ""}`} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentApplications.map((app: any, index: number) => (
              <Link
                key={app.id}
                href={`/dashboard/applications/${app.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-[#5260ce] hover:shadow-md transition-all duration-200 group"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                    </div>
                    <div className="flex-1">
                      <p className="font-montserrat-semibold text-[#121c67] group-hover:text-[#5260ce] transition-colors">
                        {app.fullName}
                      </p>
                      <p className="text-sm text-gray-600">{app.email}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-montserrat-semibold ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className={`w-5 h-5 text-gray-400 group-hover:text-[#5260ce] transition-all ${currentLang === "ar" ? "mr-4 group-hover:-translate-x-1 rotate-180" : "ml-4 group-hover:translate-x-1"}`} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-montserrat-bold text-[#121c67] mb-6">
          {t("quickActions")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userRole && canAccess(userRole, "universities", "read") && (
            <Link
              href="/dashboard/universities"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#5260ce] hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-montserrat-semibold text-[#121c67] group-hover:text-[#5260ce] transition-colors">
                  {t("manageUniversities")}
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                {canAccess(userRole, "universities", "create")
                  ? t("addEditRemoveUniversities")
                  : t("viewUniversities")}
              </p>
            </Link>
          )}
          {userRole && canAccess(userRole, "applications", "read") && (
            <Link
              href="/dashboard/applications"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#5260ce] hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-montserrat-semibold text-[#121c67] group-hover:text-[#5260ce] transition-colors">
                  {t("reviewApplications")}
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                {t("viewManageApplications")}
              </p>
            </Link>
          )}
          {userRole && canAccess(userRole, "programs", "read") && (
            <Link
              href="/dashboard/programs"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#5260ce] hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-montserrat-semibold text-[#121c67] group-hover:text-[#5260ce] transition-colors">
                  {t("managePrograms")}
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                {canAccess(userRole, "programs", "create")
                  ? t("addEditRemovePrograms")
                  : t("viewPrograms")}
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
