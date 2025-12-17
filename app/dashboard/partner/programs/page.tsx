"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, BookOpen, Calendar, Globe, DollarSign, Users } from "lucide-react";
import { apiGet, apiDelete } from "@/lib/api";
import { showToast } from "@/lib/toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import Image from "next/image";
import { getImageUrlOrFallback } from "@/lib/image-utils";
import { figmaAssets } from "@/lib/figma-assets";

interface Program {
  id: string;
  name: string;
  slug: string;
  degree: string | null;
  duration: string | null;
  language: string | null;
  tuition: string | null;
  bannerImage?: string | null;
  programImages?: string[] | null;
  isActive: boolean;
  _count: {
    applications: number;
  };
}

export default function PartnerProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("all");

  useEffect(() => {
    fetchPrograms();
  }, [search, degreeFilter]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (search) {
        params.append("search", search);
      }

      if (degreeFilter !== "all") {
        params.append("degree", degreeFilter);
      }

      const data = await apiGet(`/partner/programs?${params.toString()}`);
      setPrograms(data || []);
    } catch (error: any) {
      showToast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete") || "Are you sure you want to delete this program?")) {
      return;
    }

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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">
          {t("programs") || "Programs"}
        </h1>
        <Link href="/dashboard/partner/programs/add">
          <Button className="bg-[#5260ce] hover:bg-[#4350b0]">
            <Plus className="w-4 h-4 mr-2" />
            {t("addProgram") || "Add Program"}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            {t("noPrograms") || "No programs found"}
          </div>
        ) : (
          programs.map((program) => {
            const programImage = program.bannerImage || 
              (Array.isArray(program.programImages) && program.programImages.length > 0 
                ? program.programImages[0] 
                : null);
            
            return (
              <div
                key={program.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Program Image */}
                <div className="relative h-48 w-full bg-gradient-to-br from-purple-100 to-blue-100">
                  {programImage ? (
                    <Image
                      src={getImageUrlOrFallback(programImage, figmaAssets.universityLogo1)}
                      alt={program.name}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        // If image fails, show fallback icon
                        const img = e.currentTarget;
                        img.style.display = "none";
                        const parent = img.parentElement;
                        if (parent) {
                          const existingFallback = parent.querySelector(".fallback-icon");
                          if (!existingFallback) {
                            const fallback = document.createElement("div");
                            fallback.className = "fallback-icon absolute inset-0 flex items-center justify-center";
                            fallback.innerHTML = '<svg class="w-16 h-16 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>';
                            parent.appendChild(fallback);
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-purple-300" />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${
                        program.isActive
                          ? "bg-green-500/90 text-white"
                          : "bg-gray-500/90 text-white"
                      }`}
                    >
                      {program.isActive ? t("active") || "Active" : t("inactive") || "Inactive"}
                    </span>
                  </div>
                  {/* Degree Badge */}
                  {program.degree && (
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/90 text-[#121c67] backdrop-blur-sm">
                        {program.degree}
                      </span>
                    </div>
                  )}
                </div>

                {/* Program Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-montserrat-bold text-[#121c67] mb-3 line-clamp-2">
                    {program.name}
                  </h3>

                  {/* Program Details */}
                  <div className="space-y-3 mb-4 flex-1">
                    {program.duration && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span>
                          <span className="font-semibold">{t("duration") || "Duration"}:</span>{" "}
                          {program.duration}
                        </span>
                      </div>
                    )}
                    {program.language && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span>
                          <span className="font-semibold">{t("language") || "Language"}:</span>{" "}
                          {program.language}
                        </span>
                      </div>
                    )}
                    {program.tuition && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span>
                          <span className="font-semibold">{t("tuition") || "Tuition"}:</span>{" "}
                          {program.tuition}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-orange-600" />
                      <span>
                        <span className="font-semibold">{t("applications") || "Applications"}:</span>{" "}
                        <span className="font-bold text-[#121c67]">{program._count.applications}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
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



