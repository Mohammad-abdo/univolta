"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { t, getLanguage } from "@/lib/i18n";
import { getImageUrl } from "@/lib/image-utils";
import { showToast } from "@/lib/toast";

interface Application {
  id: string;
  fullName: string;
  email: string;
  status: "PENDING" | "REVIEW" | "APPROVED" | "REJECTED";
  createdAt: string;
  university?: { id: string; name: string; slug: string; logoUrl?: string; country?: string };
  program?: { id: string; name: string; slug: string; degree?: string };
  totalFee?: number;
  payment?: { id: string; paymentStatus: string; paidAt?: string; amount?: number };
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

const STATUS_CFG = {
  PENDING:  { label: "Pending",     bg: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  REVIEW:   { label: "Under Review", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  APPROVED: { label: "Accepted",    bg: "bg-green-50 text-green-700 border-green-200" },
  REJECTED: { label: "Rejected",    bg: "bg-red-50 text-red-600 border-red-200" },
};

/* ─── Stat Card ─────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center shrink-0 text-[#5260ce]">
        {icon}
      </div>
      <div>
        <p className="text-sm text-[#65666f] font-montserrat-regular">{label}</p>
        <p className="text-3xl font-montserrat-bold text-[#121c67] leading-none mt-1">{value}</p>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [user, setUser]  = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLanguage();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [apps, userData] = await Promise.all([
        apiGet<Application[]>("/applications").catch(() => [] as Application[]),
        fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
        }).then((r) => r.ok ? r.json() : null).catch(() => null),
      ]);
      setApplications(apps);
      setUser(userData);
    } catch {
      showToast.error("Failed to load your data");
    } finally {
      setLoading(false);
    }
  };

  const total    = applications.length;
  const pending  = applications.filter((a) => a.status === "PENDING" || a.status === "REVIEW").length;
  const accepted = applications.filter((a) => a.status === "APPROVED").length;
  const rejected = applications.filter((a) => a.status === "REJECTED").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#5260ce] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1100px]">
      {/* Welcome */}
      <div>
        <h1 className="font-montserrat-bold text-2xl md:text-[28px] text-[#121c67]">
          Welcome back, {user?.name?.split(" ")[0] || "Student"}!
        </h1>
        <p className="text-sm text-[#65666f] font-montserrat-regular mt-1">
          Track your applications and manage your documents
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Applications"   value={total}    icon={<FileText  className="w-5 h-5" />} />
        <StatCard label="Pending Applications" value={pending}  icon={<Clock     className="w-5 h-5" />} />
        <StatCard label="Accepted Applications" value={accepted} icon={<CheckCircle className="w-5 h-5" />} />
        <StatCard label="Rejected Applications" value={rejected} icon={<XCircle   className="w-5 h-5" />} />
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-montserrat-bold text-lg text-[#121c67]">Recent Applications</h2>
        </div>

        {applications.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-[#65666f] font-montserrat-regular text-sm">No applications yet</p>
            <Button className="mt-4 bg-[#5260ce] hover:bg-[#4350b0] text-white rounded-xl" asChild>
              <Link href="/universities">Browse Universities</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-[#FAFBFF]">
                  <th className="text-left px-5 py-3 font-montserrat-semibold text-[#65666f] text-xs uppercase tracking-wide">University</th>
                  <th className="text-left px-5 py-3 font-montserrat-semibold text-[#65666f] text-xs uppercase tracking-wide">Program</th>
                  <th className="text-left px-5 py-3 font-montserrat-semibold text-[#65666f] text-xs uppercase tracking-wide">Degree</th>
                  <th className="text-left px-5 py-3 font-montserrat-semibold text-[#65666f] text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 font-montserrat-semibold text-[#65666f] text-xs uppercase tracking-wide">Submission date</th>
                  <th className="text-left px-5 py-3 font-montserrat-semibold text-[#65666f] text-xs uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const cfg = STATUS_CFG[app.status] ?? STATUS_CFG.PENDING;
                  const logo = getImageUrl(app.university?.logoUrl || "");
                  return (
                    <tr key={app.id} className="border-b border-gray-50 hover:bg-[#FAFBFF] transition-colors">
                      {/* University */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {logo ? (
                            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-100 shrink-0 bg-white">
                              <Image src={logo} alt="" fill className="object-contain p-1" unoptimized />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0 text-[#5260ce] font-bold text-xs">
                              {app.university?.name?.charAt(0) || "U"}
                            </div>
                          )}
                          <div>
                            <p className="font-montserrat-semibold text-[#121c67]">
                              {app.university?.name || "—"}
                            </p>
                            {app.university?.country && (
                              <p className="text-xs text-[#8b8c9a]">{app.university.country}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Program */}
                      <td className="px-5 py-4 text-[#2e2e2e] font-montserrat-regular max-w-[200px]">
                        {app.program?.name || "—"}
                      </td>
                      {/* Degree */}
                      <td className="px-5 py-4 text-[#65666f]">
                        {app.program?.degree || "—"}
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-montserrat-semibold border ${cfg.bg}`}>
                          {cfg.label}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="px-5 py-4 text-[#65666f] whitespace-nowrap">
                        {new Date(app.createdAt).toLocaleDateString("en-US", {
                          month: "numeric", day: "numeric", year: "numeric",
                        })}
                      </td>
                      {/* Action */}
                      <td className="px-5 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#5260ce]/30 text-[#5260ce] hover:bg-[#5260ce] hover:text-white rounded-lg text-xs h-8 px-3 transition-colors"
                          asChild
                        >
                          <Link href={`/my-applications/${app.id}`} className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            View Details
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
