"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Building2,
  Calendar,
  Clock3,
  DollarSign,
  Edit,
  Globe,
  GraduationCap,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { apiDelete, apiGet } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { getImageUrlOrFallback } from "@/lib/image-utils";
import { figmaAssets } from "@/lib/figma-assets";

interface Program {
  id: string;
  name: string;
  slug: string;
  degree: string | null;
  department: string | null;
  duration: string | null;
  language: string | null;
  tuition: string | null;
  tuitionNotes?: string | null;
  studyYear?: string | null;
  classSchedule?: string | null;
  coreSubjects?: string[] | null;
  about?: string | null;
  lastApplicationDate?: string | null;
  bannerImage?: string | null;
  programImages?: string[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { applications: number };
}

export default function PartnerProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchPrograms();
  }, [search, degreeFilter, statusFilter]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (degreeFilter !== "all") params.append("degree", degreeFilter);
      if (statusFilter !== "all") params.append("isActive", statusFilter === "active" ? "true" : "false");
      const data = (await apiGet(`/partner/programs?${params.toString()}`)) as any;
      setPrograms(Array.isArray(data) ? data : []);
    } catch {
      showToast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete") || "Are you sure you want to delete this program?")) return;
    try {
      await apiDelete(`/partner/programs/${id}`);
      showToast.success("Program deleted successfully");
      fetchPrograms();
    } catch (error: any) {
      showToast.error(error.message || t("deleteError") || "Failed to delete program");
    }
  };

  if (loading && programs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">{t("programs") || "Programs"}</h1>
        <Link href="/dashboard/partner/programs/add">
          <Button className="bg-[#5260ce] hover:bg-[#4350b0]">
            <Plus className="w-4 h-4 mr-2" />
            {t("addProgram") || "Add Program"}
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t("searchPrograms") || "Search programs..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select
            value={degreeFilter}
            onChange={(e) => setDegreeFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">{t("allDegrees") || "All Degrees"}</option>
            <option value="Bachelor">{t("bachelor") || "Bachelor"}</option>
            <option value="Master">{t("master") || "Master"}</option>
            <option value="PhD">{t("phd") || "PhD"}</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">{t("all") || "All Statuses"}</option>
            <option value="active">{t("active") || "Active"}</option>
            <option value="inactive">{t("inactive") || "Inactive"}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {programs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
            {t("noPrograms") || "No programs found"}
          </div>
        ) : (
          programs.map((program) => {
            const programImage =
              program.bannerImage ||
              (Array.isArray(program.programImages) && program.programImages.length > 0
                ? program.programImages[0]
                : null);

            return (
              <div key={program.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="relative h-48 w-full bg-gradient-to-br from-purple-100 to-blue-100">
                  {programImage ? (
                    <Image
                      src={getImageUrlOrFallback(programImage, figmaAssets.universityLogo1)}
                      alt={program.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-purple-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${
                        program.isActive ? "bg-green-500/90 text-white" : "bg-gray-500/90 text-white"
                      }`}
                    >
                      {program.isActive ? t("active") || "Active" : t("inactive") || "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="p-5 md:p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-montserrat-bold text-[#121c67]">{program.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{program.slug}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      <span>{program.department || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GraduationCap className="w-4 h-4 text-violet-600" />
                      <span>{program.degree || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>{program.duration || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>{program.language || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>{program.tuition || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-orange-600" />
                      <span>{program._count.applications} {t("applications") || "applications"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2">
                      <Clock3 className="w-4 h-4 text-cyan-600" />
                      <span>
                        {t("lastDate") || "Last application date"}:{" "}
                        {program.lastApplicationDate ? new Date(program.lastApplicationDate).toLocaleDateString() : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2 text-sm">
                    <div>
                      <span className="font-semibold text-[#121c67]">{t("studyYear") || "Study Year"}:</span>{" "}
                      <span className="text-gray-700">{program.studyYear || "-"}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#121c67]">{t("classSchedule") || "Class Schedule"}:</span>{" "}
                      <span className="text-gray-700">{program.classSchedule || "-"}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#121c67]">{t("tuitionNotes") || "Tuition Notes"}:</span>{" "}
                      <span className="text-gray-700">{program.tuitionNotes || "-"}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#121c67] mb-2">{t("about") || "About Program"}</p>
                    <p className="text-sm text-gray-700 leading-6 whitespace-pre-wrap">{program.about || "-"}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#121c67] mb-2">{t("coreSubjects") || "Core Subjects"}</p>
                    <div className="flex flex-wrap gap-2">
                      {(program.coreSubjects || []).length > 0 ? (
                        (program.coreSubjects || []).map((subject) => (
                          <span
                            key={subject}
                            className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100"
                          >
                            {subject}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    <p>{t("createdAt") || "Created"}: {new Date(program.createdAt).toLocaleString()}</p>
                    <p>{t("updatedAt") || "Updated"}: {new Date(program.updatedAt).toLocaleString()}</p>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <Link
                      href={`/dashboard/partner/programs/${program.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5260ce] text-white rounded-lg hover:bg-[#4350b0] transition-colors font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      {t("edit") || "Edit"}
                    </Link>
                    <button
                      onClick={() => handleDelete(program.id)}
                      className="px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                      title={t("delete") || "Delete"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}



