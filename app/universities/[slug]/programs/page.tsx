"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useParams, useRouter, usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Link from "next/link";
import { figmaAssets } from "@/lib/figma-assets";
import { API_BASE_URL } from "@/lib/constants";
import { getImageUrl, getImageUrlOrFallback } from "@/lib/image-utils";
import Image from "next/image";
import { t, getLanguage } from "@/lib/i18n";
import { getLocaleHeaders } from "@/lib/api";
import {
  Wrench, Monitor, FlaskConical, Palette, Stethoscope, Brain,
  TrendingUp, Scale, Palmtree, Compass, ChevronLeft, ChevronRight,
  GraduationCap, Clock, Globe, DollarSign, ArrowRight, Trophy,
} from "lucide-react";
import { ProgramRegisterButton } from "@/components/program-register-button";
import {
  formatDegreeLabel,
  formatDurationLabel,
  formatTuitionPeriod,
  formatInstructionLanguages,
  formatFacultyDepartmentLabel,
} from "@/lib/university-program-display";

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
  worldRanking?: number | null;
}

const faculties = [
  { name: "Faculty of Engineering",              icon: Wrench },
  { name: "Faculty of Computer & IT",            icon: Monitor },
  { name: "Faculty of Sciences",                 icon: FlaskConical },
  { name: "Faculty of Arts & Humanities",        icon: Palette },
  { name: "Faculty of Medicine & Health Sciences", icon: Stethoscope },
  { name: "Faculty of Psychology & Education",   icon: Brain },
  { name: "Faculty of Business & Economics",     icon: TrendingUp },
  { name: "Faculty of Law",                      icon: Scale },
  { name: "Faculty of Tourism & Hospitality",    icon: Palmtree },
  { name: "Faculty of Design & Architecture",    icon: Compass },
];

function ProgramCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-gray-100 shadow-sm">
      <Skeleton className="h-48 w-full rounded-none" />
      <CardContent className="pt-4 pb-2 px-5 space-y-3">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-5 w-3/4" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-5 px-5 gap-2">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </CardFooter>
    </Card>
  );
}

function ProgramCard({ program, slug, index }: { program: Program; slug: string; index: number }) {
  const bannerSrc = program.bannerImage || program.programImages?.[0];
  const lang = getLanguage();

  return (
    <ScrollReveal direction="up" delay={index * 100} threshold={0.06}>
      <Card className="group overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-400 hover:-translate-y-2 bg-white h-full flex flex-col">
        {/* Banner */}
        <div className="relative h-48 overflow-hidden shrink-0">
          {bannerSrc ? (
            <Image
              src={getImageUrlOrFallback(bannerSrc, figmaAssets.universityLogo1)}
              alt={program.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#121c67] via-[#5260ce] to-[#75d3f7]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(18,28,103,0.75)] via-[rgba(18,28,103,0.2)] to-transparent" />

          {/* Degree badge top-right */}
          {program.degree && (
            <div className="absolute top-3 right-3">
              <Badge className={`text-xs font-montserrat-semibold border-0 shadow-sm ${program.degree.toLowerCase().includes("master") ? "bg-[#5260ce]/90 text-white" : "bg-white/90 text-[#121c67]"}`}>
                {formatDegreeLabel(program.degree, t)}
              </Badge>
            </div>
          )}

          {/* GraduationCap watermark when no image */}
          {!bannerSrc && (
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="w-16 h-16 text-white/20" />
            </div>
          )}

          {/* Program name on image */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pt-6">
            <p className="text-white/60 text-xs font-montserrat-regular mb-0.5">
              {program.department ? formatFacultyDepartmentLabel(program.department, lang) : ""}
            </p>
            <h3 className="font-montserrat-bold text-base text-white leading-tight line-clamp-2">
              {program.name}
            </h3>
          </div>
        </div>

        {/* Card body */}
        <CardContent className="pt-4 pb-2 px-5 flex-1 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {program.duration && (
              <div className="flex items-center gap-1.5 bg-[rgba(117,211,247,0.08)] border border-[#75d3f7]/40 rounded-lg px-2.5 py-1.5">
                <Clock className="w-3.5 h-3.5 text-[#5260ce] shrink-0" />
                <span className="text-xs text-[#2e2e2e] font-montserrat-regular truncate">{formatDurationLabel(program.duration, t)}</span>
              </div>
            )}
            {program.language && (
              <div className="flex items-center gap-1.5 bg-[rgba(82,96,206,0.06)] border border-[#5260ce]/20 rounded-lg px-2.5 py-1.5">
                <Globe className="w-3.5 h-3.5 text-[#5260ce] shrink-0" />
                <span className="text-xs text-[#2e2e2e] font-montserrat-regular truncate">{formatInstructionLanguages(program.language, t)}</span>
              </div>
            )}
            {program.tuition && (
              <div className="col-span-2 flex items-center gap-1.5 bg-[rgba(82,96,206,0.06)] border border-[#5260ce]/20 rounded-lg px-2.5 py-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#5260ce] shrink-0" />
                <span className="text-xs font-montserrat-semibold text-[#5260ce]">
                  {formatTuitionPeriod(
                    program.tuition.startsWith("$") ? program.tuition : `$${program.tuition}`,
                    t
                  )}
                </span>
              </div>
            )}
          </div>
        </CardContent>

        {/* CTA footer */}
        <CardFooter className="pt-2 pb-5 px-5 gap-2">
          <Button
            variant="outline"
            className="flex-1 border-[#5260ce] text-[#5260ce] hover:bg-[#5260ce] hover:text-white rounded-xl h-10 text-sm transition-all duration-200 font-montserrat-semibold"
            asChild
          >
            <Link href={`/universities/${slug}/programs/${program.slug}`}>
              {t("viewDetails")}
            </Link>
          </Button>
          <div className="flex-1">
            <ProgramRegisterButton programId={program.id} universitySlug={slug} />
          </div>
        </CardFooter>
      </Card>
    </ScrollReveal>
  );
}

function ProgramsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const slug = params?.slug as string;

  const [university, setUniversity] = useState<University | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const degreeFromUrl = (searchParams?.get("degree") || "").toLowerCase();
  const initialDegree = degreeFromUrl === "master" ? "master" : "bachelor";
  const [selectedDegree, setSelectedDegree] = useState<"bachelor" | "master">(initialDegree);
  const [selectedFaculty, setSelectedFaculty] = useState<string>(searchParams?.get("department") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const programsPerPage = 6;

  useEffect(() => { fetchData(); }, [slug, selectedDegree, selectedFaculty]);

  // Keep state in sync if URL changes (e.g., coming from university detail tabs)
  useEffect(() => {
    const d = (searchParams?.get("degree") || "").toLowerCase();
    const next: "bachelor" | "master" = d === "master" ? "master" : "bachelor";
    if (next !== selectedDegree) {
      setSelectedDegree(next);
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uniRes, progRes] = await Promise.all([
        fetch(`${API_BASE_URL}/public/universities/${slug}`, { headers: getLocaleHeaders() }),
        fetch(`${API_BASE_URL}/public/universities/${slug}/programs`, { headers: getLocaleHeaders() }),
      ]);
      if (uniRes.ok) {
        const d = await uniRes.json();
        setUniversity({ id: d.id, name: d.name, slug: d.slug, logoUrl: d.logoUrl || d.logo, bannerUrl: d.bannerUrl, worldRanking: d.worldRanking });
      }
      if (progRes.ok) {
        const d = await progRes.json();
        setPrograms(Array.isArray(d) ? d.map((p: any) => ({ ...p, bannerImage: p.bannerImage || null, programImages: Array.isArray(p.programImages) ? p.programImages : [] })) : []);
      } else {
        setPrograms([]);
      }
    } catch {
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = programs.filter((p) => {
    const d = p.degree?.toLowerCase() || "";
    if (selectedDegree === "bachelor" && !d.includes("bachelor") && !d.includes("undergraduate")) return false;
    if (selectedDegree === "master"   && !d.includes("master")   && !d.includes("graduate"))    return false;
    if (selectedFaculty) return p.department?.toLowerCase().includes(selectedFaculty.toLowerCase()) || p.name?.toLowerCase().includes(selectedFaculty.toLowerCase());
    return true;
  });

  const totalPages   = Math.ceil(filteredPrograms.length / programsPerPage);
  const startIndex   = (currentPage - 1) * programsPerPage;
  const paginatedPrograms = filteredPrograms.slice(startIndex, startIndex + programsPerPage);
  const bachelorCount = programs.filter(p => { const d = p.degree?.toLowerCase() || ""; return d.includes("bachelor") || d.includes("undergraduate"); }).length;
  const masterCount   = programs.filter(p => { const d = p.degree?.toLowerCase() || ""; return d.includes("master")   || d.includes("graduate"); }).length;
  const deptLang = getLanguage();

  return (
    <div className="min-h-screen bg-[#f9fafe] pb-16 md:pb-0">
      <Navbar />
      <main className="pt-0 md:pt-[100px] pb-6 md:pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-5">

          {/* Hero Banner */}
          <ScrollReveal direction="fade">
            <div className="relative h-[220px] md:h-[340px] rounded-[20px] md:rounded-[28px] overflow-hidden mb-6 md:mb-10 animate-hero-reveal">
              <Image
                src={getImageUrlOrFallback(university?.bannerUrl, figmaAssets.heroImage)}
                alt={university?.name || t("breadcrumbPrograms")}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#121c67]/80 via-[#121c67]/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {university?.worldRanking && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-[#5260ce]/90 text-white text-xs font-montserrat-semibold border-0 backdrop-blur-sm px-3 py-1.5">
                    <Trophy className="w-3 h-3 mr-1.5" />#{university.worldRanking} {t("worldShort")}
                  </Badge>
                </div>
              )}

              <div className="absolute left-5 bottom-5 md:left-10 md:bottom-8 flex items-end gap-4">
                {university?.logoUrl && (
                  <div className="relative w-14 h-14 md:w-[90px] md:h-[90px] border-4 border-white rounded-2xl overflow-hidden shrink-0 bg-white shadow-xl">
                    <Image src={getImageUrlOrFallback(university.logoUrl, figmaAssets.logo)} alt={university.name} fill className="object-contain p-1.5" unoptimized />
                  </div>
                )}
                <div className="pb-1">
                  <p className="text-white/60 text-xs font-montserrat-regular mb-1 animate-fade-up">{t("programsSubtitleAcademic")}</p>
                  <h1 className="font-montserrat-bold text-xl md:text-[32px] leading-tight text-white drop-shadow-lg animate-fade-up-d100">
                    {university?.name || t("programsTitleFallback")}
                  </h1>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Degree Tabs + Faculty Filters */}
          <ScrollReveal direction="up" delay={80}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 md:mb-8 space-y-5">
              {/* Degree level tabs */}
              <div>
                <p className="font-montserrat-semibold text-sm text-[#121c67] mb-3">{t("degreeLevel")}</p>
                <div className="flex gap-3">
                  {[
                    { key: "bachelor", label: `${t("bachelors")} (${bachelorCount})` },
                    { key: "master",   label: `${t("masters")}   (${masterCount})` },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => {
                        const next = key as "bachelor" | "master";
                        setSelectedDegree(next);
                        setCurrentPage(1);
                        const sp = new URLSearchParams(searchParams?.toString() || "");
                        sp.set("degree", next);
                        router.replace(`${pathname}?${sp.toString()}`);
                      }}
                      className={`flex-1 md:flex-none md:px-8 py-2.5 rounded-xl font-montserrat-semibold text-sm transition-all duration-200 ${
                        selectedDegree === key
                          ? "bg-[#5260ce] text-white shadow-[0_4px_16px_rgba(82,96,206,0.3)]"
                          : "bg-[#f9fafe] border border-gray-200 text-[#65666f] hover:border-[#5260ce]/40 hover:text-[#5260ce]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Faculty chips */}
              <div>
                <p className="font-montserrat-semibold text-sm text-[#121c67] mb-3">{t("academicDepartments")}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setSelectedFaculty(""); setCurrentPage(1); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-montserrat-semibold transition-all duration-200 ${
                      !selectedFaculty ? "bg-[#5260ce] text-white border-[#5260ce]" : "bg-white text-[#65666f] border-gray-200 hover:border-[#5260ce]/40 hover:text-[#5260ce]"
                    }`}
                  >
                    {t("allDepartmentsFilter")}
                  </button>
                  {faculties.map((f) => {
                    const Icon = f.icon;
                    const isActive = selectedFaculty === f.name;
                    const chipLabel =
                      deptLang === "ar"
                        ? formatFacultyDepartmentLabel(f.name, deptLang).replace(/^كلية\s+/u, "")
                        : f.name.replace(/^Faculty of /i, "");
                    return (
                      <button
                        key={f.name}
                        onClick={() => { setSelectedFaculty(isActive ? "" : f.name); setCurrentPage(1); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-montserrat-regular transition-all duration-200 ${
                          isActive ? "bg-[#5260ce] text-white border-[#5260ce]" : "bg-white text-[#2e2e2e] border-gray-200 hover:border-[#5260ce]/40 hover:text-[#5260ce]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{chipLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Results count */}
          {!loading && filteredPrograms.length > 0 && (
            <p className="font-montserrat-regular text-sm text-[#8b8c9a] mb-4">
              {t("programsShowing")
                .replace("{shown}", String(paginatedPrograms.length))
                .replace("{total}", String(filteredPrograms.length))}
            </p>
          )}

          {/* Skeleton loading */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-8">
              {Array.from({ length: 6 }).map((_, i) => <ProgramCardSkeleton key={i} />)}
            </div>
          )}

          {/* Programs Grid */}
          {!loading && (
            <>
              {paginatedPrograms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#f0f4ff] flex items-center justify-center mb-5">
                    <GraduationCap className="w-10 h-10 text-[#5260ce]/50" />
                  </div>
                  <h3 className="font-montserrat-bold text-xl text-[#121c67] mb-2">{t("noProgramsFound")}</h3>
                  <button
                    onClick={() => { setSelectedFaculty(""); setCurrentPage(1); }}
                    className="mt-4 text-sm text-[#5260ce] underline font-montserrat-semibold"
                  >
                    {t("clearFilters")}
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-10">
                  {paginatedPrograms.map((program, index) => (
                    <ProgramCard key={program.id} program={program} slug={slug} index={index} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <ScrollReveal direction="up">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-xl border border-[#e0e6f1] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f0f4ff] hover:border-[#5260ce]/30 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#5260ce]" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl font-montserrat-semibold text-sm transition-all ${
                          currentPage === page
                            ? "bg-[#5260ce] text-white shadow-[0_4px_12px_rgba(82,96,206,0.35)]"
                            : "border border-[#e0e6f1] text-[#2e2e2e] hover:bg-[#f0f4ff]"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-xl border border-[#e0e6f1] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f0f4ff] hover:border-[#5260ce]/30 transition-all"
                    >
                      <ChevronRight className="w-4 h-4 text-[#5260ce]" />
                    </button>
                  </div>
                </ScrollReveal>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export default function ProgramsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f9fafe]">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5260ce] mx-auto mb-3" />
            <p className="font-montserrat-regular text-sm text-[#8b8c9a]">{t("loading")}</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <ProgramsContent />
    </Suspense>
  );
}
