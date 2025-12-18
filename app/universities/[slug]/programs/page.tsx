"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { figmaAssets } from "@/lib/figma-assets";
import { API_BASE_URL } from "@/lib/constants";
import { getImageUrl, getImageUrlOrFallback } from "@/lib/image-utils";
import Image from "next/image";
import { t, getLanguage, type Language } from "@/lib/i18n";
import { 
  Wrench, 
  Monitor, 
  FlaskConical, 
  Palette, 
  Stethoscope, 
  Brain, 
  TrendingUp, 
  Scale, 
  Palmtree, 
  Compass,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BarChart3,
  Languages,
  Gem
} from "lucide-react";
import { ProgramRegisterButton } from "@/components/program-register-button";

interface Program {
  id: string;
  name: string;
  slug: string;
  degree?: string;
  duration?: string;
  language?: string;
  tuition?: string;
  department?: string;
  bannerImage?: string;
  programImages?: string[];
}

interface University {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
}

const faculties = [
  { name: "Faculty of Engineering", icon: Wrench },
  { name: "Faculty of Computer & IT", icon: Monitor },
  { name: "Faculty of Sciences", icon: FlaskConical },
  { name: "Faculty of Arts & Humanities", icon: Palette },
  { name: "Faculty of Medicine & Health Sciences", icon: Stethoscope },
  { name: "Faculty of Psychology & Education", icon: Brain },
  { name: "Faculty of Business & Economics", icon: TrendingUp },
  { name: "Faculty of Law", icon: Scale },
  { name: "Faculty of Tourism & Hospitality", icon: Palmtree },
  { name: "Faculty of Design & Architecture", icon: Compass },
];

function ProgramsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  
  const [university, setUniversity] = useState<University | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDegree, setSelectedDegree] = useState<"bachelor" | "master">("bachelor");
  const [selectedFaculty, setSelectedFaculty] = useState<string>(searchParams?.get("department") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const programsPerPage = 6;

  useEffect(() => {
    fetchData();
  }, [slug, selectedDegree, selectedFaculty]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch university
      const uniRes = await fetch(`${API_BASE_URL}/public/universities/${slug}`);
      if (uniRes.ok) {
        const uniData = await uniRes.json();
        setUniversity({
          id: uniData.id,
          name: uniData.name,
          slug: uniData.slug,
          logoUrl: uniData.logoUrl || uniData.logo || null,
          bannerUrl: uniData.bannerUrl || null,
        });
      } else {
        console.error("Failed to fetch university:", uniRes.status);
      }

      // Fetch programs using public endpoint
      const progRes = await fetch(`${API_BASE_URL}/public/universities/${slug}/programs`);
      if (progRes.ok) {
        const progData = await progRes.json();
        // Process programs to ensure images are properly formatted
        const processedPrograms = Array.isArray(progData) 
          ? progData.map((p: any) => ({
              ...p,
              bannerImage: p.bannerImage || null,
              programImages: Array.isArray(p.programImages) ? p.programImages : [],
              department: p.department || null,
            }))
          : [];
        setPrograms(processedPrograms);
      } else {
        console.error("Failed to fetch programs:", progRes.status);
        setPrograms([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter programs
  const filteredPrograms = programs.filter((p) => {
    // Filter by degree
    const degreeLower = p.degree?.toLowerCase() || "";
    if (selectedDegree === "bachelor") {
      if (!degreeLower.includes("bachelor") && !degreeLower.includes("undergraduate")) {
        return false;
      }
    } else if (selectedDegree === "master") {
      if (!degreeLower.includes("master") && !degreeLower.includes("graduate")) {
        return false;
      }
    }
    
    // Filter by faculty/department if selected
    if (selectedFaculty) {
      return p.department?.toLowerCase().includes(selectedFaculty.toLowerCase()) || 
             p.name?.toLowerCase().includes(selectedFaculty.toLowerCase());
    }
    
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPrograms.length / programsPerPage);
  const startIndex = (currentPage - 1) * programsPerPage;
  const paginatedPrograms = filteredPrograms.slice(startIndex, startIndex + programsPerPage);

  const bachelorCount = programs.filter((p) => {
    const d = p.degree?.toLowerCase() || "";
    return d.includes("bachelor") || d.includes("undergraduate");
  }).length;

  const masterCount = programs.filter((p) => {
    const d = p.degree?.toLowerCase() || "";
    return d.includes("master") || d.includes("graduate");
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t("loading")}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      <Navbar />
      <main className="pt-0 md:pt-[100px] pb-4 md:pb-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-5">
          {/* Hero Banner - Exactly like image */}
          <div className="relative h-[250px] md:h-[400px] rounded-[16px] md:rounded-[24px] overflow-hidden mb-6 md:mb-10">
            <div className="absolute inset-0">
              <Image
                src={getImageUrlOrFallback(university?.bannerUrl, figmaAssets.heroImage)}
                alt={university?.name || "Programs"}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-[rgba(18,28,103,0.4)]" />
            </div>
            {/* Logo and Name - Bottom Left */}
            <div className="absolute left-4 md:left-10 bottom-4 md:bottom-10 flex gap-2 md:gap-5 items-center">
              {university?.logoUrl && (
                <div className="relative w-[60px] h-[60px] md:w-[134px] md:h-[134px] border-[3px] md:border-[5px] border-white rounded-full overflow-hidden shrink-0 bg-white">
                  <Image
                    src={getImageUrlOrFallback(university.logoUrl, figmaAssets.logo)}
                    alt={university.name}
                    fill
                    className="object-contain p-1 md:p-2"
                    unoptimized
                  />
                </div>
              )}
              <h1 className="font-montserrat-bold text-lg md:text-[34px] leading-[1.4] text-white line-clamp-2">
                {university?.name || t("university")}
              </h1>
            </div>
          </div>

          {/* Degree Level Filter - Exactly like image */}
          <div className="mb-4 md:mb-6">
            <label className="font-montserrat-regular text-sm md:text-[18px] text-[#2e2e2e] mb-2 block">
              {t("degreeLevel")}
            </label>
            <select
              value={selectedDegree}
              onChange={(e) => {
                setSelectedDegree(e.target.value as "bachelor" | "master");
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 md:px-4 py-2 text-sm md:text-[16px] w-full md:min-w-[200px]"
            >
              <option value="bachelor">{t("bachelors")} ({bachelorCount})</option>
              <option value="master">{t("masters")} ({masterCount})</option>
            </select>
          </div>

          {/* Academic Departments - Exactly like image */}
          <div className="mb-6 md:mb-8">
            <h3 className="font-montserrat-bold text-lg md:text-[24px] text-[#121c67] mb-3 md:mb-4">
              {t("academicDepartments")}
            </h3>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {faculties.map((faculty) => {
                const Icon = faculty.icon;
                const isSelected = selectedFaculty === faculty.name;
                return (
                  <button
                    key={faculty.name}
                    onClick={() => {
                      setSelectedFaculty(isSelected ? "" : faculty.name);
                      setCurrentPage(1);
                    }}
                    className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg border transition-colors text-xs md:text-[16px] ${
                      isSelected
                        ? "bg-[#5260ce] text-white border-[#5260ce]"
                        : "bg-white text-[#2e2e2e] border-[#e0e6f1] hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="font-montserrat-regular line-clamp-1">
                      {faculty.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Programs Grid - Exactly like image */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-[30px] mb-6 md:mb-10">
            {paginatedPrograms.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">{t("noProgramsFound")}</p>
              </div>
            ) : (
              paginatedPrograms.map((program) => (
                <div
                  key={program.id}
                  className="bg-white border-[3px] md:border-[5px] border-white rounded-xl overflow-hidden flex flex-col shadow-[0px_4px_40px_0px_rgba(82,96,206,0.12)] hover:shadow-lg transition-shadow"
                >
                  {/* Program Image */}
                  <div className="h-[160px] md:h-[220px] relative rounded-t-xl overflow-hidden bg-gray-200">
                    {program.bannerImage || (Array.isArray(program.programImages) && program.programImages.length > 0) ? (
                      <Image
                        src={getImageUrlOrFallback(
                          program.bannerImage || program.programImages?.[0],
                          figmaAssets.universityLogo1
                        )}
                        alt={program.name}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          // If image fails, show fallback
                          const img = e.currentTarget;
                          img.style.display = "none";
                          const parent = img.parentElement;
                          if (parent && !parent.querySelector(".fallback-gradient")) {
                            const fallback = document.createElement("div");
                            fallback.className = "fallback-gradient absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center";
                            fallback.innerHTML = '<svg class="w-16 h-16 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>';
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                        <GraduationCap className="w-16 h-16 text-purple-300" />
                      </div>
                    )}
                  </div>

                  {/* Program Details */}
                  <div className="p-4 md:p-6 flex flex-col gap-3 md:gap-4 bg-white">
                    {/* Program Name Section */}
                    <div className="flex flex-col gap-1">
                      <p className="font-montserrat-regular text-xs md:text-[14px] leading-[1.4] text-[#8b8c9a]">
                        {t("programName")}
                      </p>
                      <h3 className="font-montserrat-bold text-base md:text-[20px] leading-[1.4] text-[#2e2e2e] line-clamp-2">
                        {program.name}
                      </h3>
                    </div>

                    {/* Program Info Badges - 2x2 Grid exactly like image */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Bachelor Badge */}
                      {program.degree && (
                        <div className="bg-[rgba(117,211,247,0.2)] border border-[#75d3f7] rounded-lg px-2 md:px-3 py-1.5 md:py-2 flex items-center gap-1.5 md:gap-2">
                          <GraduationCap className="w-3 h-3 md:w-4 md:h-4 text-white bg-[#75d3f7] rounded p-0.5" />
                          <span className="font-montserrat-regular text-xs md:text-[14px] text-[#121c67] truncate">
                            {program.degree.includes("Bachelor") || program.degree.includes("bachelor") 
                              ? "Bachelor" 
                              : program.degree.includes("Master") || program.degree.includes("master")
                              ? "Master"
                              : program.degree}
                          </span>
                        </div>
                      )}
                      
                      {/* Duration Badge */}
                      {program.duration && (
                        <div className="bg-[rgba(82,96,206,0.15)] border border-[#5260ce] rounded-lg px-2 md:px-3 py-1.5 md:py-2 flex items-center gap-1.5 md:gap-2">
                          <BarChart3 className="w-3 h-3 md:w-4 md:h-4 text-white bg-[#5260ce] rounded p-0.5" />
                          <span className="font-montserrat-regular text-xs md:text-[14px] text-[#121c67] truncate">
                            {program.duration.includes("Year") || program.duration.includes("year")
                              ? program.duration
                              : `${program.duration} Years`}
                          </span>
                        </div>
                      )}
                      
                      {/* Language Badge */}
                      {program.language && (
                        <div className="bg-[rgba(117,211,247,0.2)] border border-[#75d3f7] rounded-lg px-2 md:px-3 py-1.5 md:py-2 flex items-center gap-1.5 md:gap-2">
                          <Languages className="w-3 h-3 md:w-4 md:h-4 text-white bg-[#75d3f7] rounded p-0.5" />
                          <span className="font-montserrat-regular text-xs md:text-[14px] text-[#121c67] truncate">
                            {program.language}
                          </span>
                        </div>
                      )}
                      
                      {/* Tuition Badge */}
                      {program.tuition && (
                        <div className="bg-[rgba(82,96,206,0.15)] border border-[#5260ce] rounded-lg px-2 md:px-3 py-1.5 md:py-2 flex items-center gap-1.5 md:gap-2">
                          <Gem className="w-3 h-3 md:w-4 md:h-4 text-white bg-[#5260ce] rounded p-0.5" />
                          <span className="font-montserrat-regular text-xs md:text-[14px] text-[#121c67] truncate">
                            {program.tuition.startsWith("$") ? program.tuition : `$${program.tuition}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Buttons - Exactly like image */}
                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-[#5260ce] text-[#5260ce] hover:bg-[rgba(82,96,206,0.1)] font-montserrat-semibold text-sm md:text-[16px] h-[44px] md:h-[48px] rounded-xl"
                        asChild
                      >
                        <Link href={`/universities/${slug}/programs/${program.slug}`}>
                          {t("viewDetails")}
                        </Link>
                      </Button>
                      <div className="flex-1">
                        <ProgramRegisterButton
                          programId={program.id}
                          universitySlug={slug}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination - Exactly like image */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-montserrat-semibold text-[16px] transition-colors ${
                    currentPage === page
                      ? "bg-[#5260ce] text-white"
                      : "bg-white text-[#2e2e2e] border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ProgramsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t("loading")}</div>
        </div>
        <Footer />
      </div>
    }>
      <ProgramsContent />
    </Suspense>
  );
}
