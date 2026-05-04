"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { figmaAssets } from "@/lib/figma-assets";
import { getImageUrl, getImageUrlOrFallback } from "@/lib/image-utils";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Globe, GraduationCap, ChevronLeft, ChevronRight, SlidersHorizontal, Trophy, Users, ArrowRight } from "lucide-react";
import { t } from "@/lib/i18n";
import { API_BASE_URL } from "@/lib/constants";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

type University = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  logoUrl?: string | null;
  country: string;
  city: string;
  language: string;
  description?: string | null;
  about?: string | null;
  image1?: string | null;
  bannerUrl?: string | null;
  worldRanking?: number | null;
  studentsNumber?: string | null;
  majors?: string[];
};

type Meta = { total: number; page: number; limit: number; pages: number };

function UniversityCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <Skeleton className="h-52 w-full rounded-none" />
      <CardContent className="pt-5 pb-3 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2 flex-wrap">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-5 px-5">
        <Skeleton className="h-11 w-full rounded-xl" />
      </CardFooter>
    </Card>
  );
}

/** Identical to the UniversityCard in universities-section.tsx (home page) */
function UniversityCard({ university, index }: { university: University; index: number }) {
  const logoSrc = university.logoUrl || university.logo;
  const bannerSrc = university.bannerUrl || university.image1 || figmaAssets.universityLogo1;

  return (
    <ScrollReveal direction="up" delay={index * 140} threshold={0.08}>
      <Card className="group overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-400 hover:-translate-y-2 bg-white h-full flex flex-col">
        {/* Banner image */}
        <div className="relative h-52 overflow-hidden shrink-0">
          <Image
            src={getImageUrlOrFallback(bannerSrc, figmaAssets.universityLogo1)}
            alt={university.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(18,28,103,0.75)] via-[rgba(18,28,103,0.25)] to-transparent" />

          {/* Country badge – top-right */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/90 text-[#121c67] hover:bg-white font-montserrat-semibold text-xs shadow-sm">
              {university.country}
            </Badge>
          </div>

          {/* World ranking badge – top-left */}
          {university.worldRanking && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-[#5260ce]/90 text-white hover:bg-[#5260ce] text-xs font-montserrat-semibold shadow-sm">
                <Trophy className="w-3 h-3 mr-1" />
                #{university.worldRanking} World
              </Badge>
            </div>
          )}

          {/* University logo – bottom-left */}
          {logoSrc && (
            <div className="absolute bottom-3 left-4">
              <div className="w-14 h-14 rounded-xl bg-white shadow-lg p-1.5 overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src={getImageUrl(logoSrc)}
                    alt={`${university.name} logo`}
                    fill
                    className="object-contain p-0.5"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          )}

          {/* University name on image – bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pt-8">
            <h3 className={`font-montserrat-bold text-lg text-white leading-tight line-clamp-2 ${logoSrc ? "pl-16" : ""}`}>
              {university.name}
            </h3>
          </div>
        </div>

        {/* Card body */}
        <CardContent className="pt-4 pb-2 px-5 flex-1 flex flex-col gap-3">
          {/* Location & Language badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="border-[#75d3f7] text-[#2e2e2e] bg-[rgba(117,211,247,0.08)] text-xs font-montserrat-regular gap-1 rounded-full">
              <MapPin className="w-3 h-3 text-[#5260ce]" />
              {university.city}
            </Badge>
            <Badge variant="outline" className="border-[#5260ce]/30 text-[#2e2e2e] bg-[rgba(82,96,206,0.06)] text-xs font-montserrat-regular gap-1 rounded-full">
              <Globe className="w-3 h-3 text-[#5260ce]" />
              {university.language}
            </Badge>
            {university.studentsNumber && (
              <Badge variant="outline" className="border-gray-200 text-[#65666f] text-xs font-montserrat-regular gap-1 rounded-full">
                <Users className="w-3 h-3" />
                {university.studentsNumber}
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-sm font-montserrat-regular text-[#65666f] leading-relaxed line-clamp-2 flex-1">
            {university.description || university.about || t("discoverWorldClassAcademics")}
          </p>

          {/* Majors */}
          {university.majors && university.majors.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#5260ce]" />
                <span className="text-xs font-montserrat-semibold text-[#5260ce]">{t("keyMajors")}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {university.majors.slice(0, 5).map((major, i) => (
                  <Badge key={i} className="bg-[rgba(82,96,206,0.1)] text-[#5260ce] hover:bg-[rgba(82,96,206,0.18)] text-xs font-montserrat-regular border-0 rounded-md h-auto py-1">
                    {major}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        {/* CTA footer */}
        <CardFooter className="pt-3 pb-5 px-5">
          <Button
            className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm h-11 rounded-xl transition-all duration-300 hover:shadow-[0_8px_24px_rgba(82,96,206,0.35)] group/btn"
            asChild
          >
            <Link href={`/universities/${university.slug}`} className="flex items-center justify-center gap-2">
              {t("viewDetails")}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </ScrollReveal>
  );
}

function UniversitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [universities, setUniversities] = useState<University[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 12, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    language: searchParams.get("language") || "",
    specialization: searchParams.get("specialization") || "",
    search: searchParams.get("search") || "",
    page: parseInt(searchParams.get("page") || "1"),
  });

  useEffect(() => {
    fetchUniversities();
  }, [filters]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const [uniRes, specRes] = await Promise.all([
        fetch(`${API_BASE_URL}/public/universities?limit=100`),
        fetch(`${API_BASE_URL}/programs/specializations`),
      ]);
      if (uniRes.ok) {
        const data = await uniRes.json();
        const items: University[] = data.data || [];
        setAvailableLanguages([...new Set(items.map((u) => u.language).filter(Boolean))].sort() as string[]);
      }
      if (specRes.ok) {
        const specData = await specRes.json();
        setAvailableSpecializations(
          [...new Set((Array.isArray(specData) ? specData : []).map((s: { specialization?: string }) => s.specialization).filter(Boolean))].sort() as string[]
        );
      }
    } catch {
      /* silent */
    }
  };

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.language) params.append("language", filters.language);
      if (filters.specialization) params.append("specialization", filters.specialization);
      if (filters.search) params.append("search", filters.search);
      params.append("page", filters.page.toString());
      params.append("limit", "12");
      const response = await fetch(`${API_BASE_URL}/public/universities?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUniversities(data.data || []);
        setMeta(data.meta || { total: 0, page: 1, limit: 12, pages: 1 });
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleSearch = () => {
    const newFilters = { ...filters, page: 1 };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    updateURL(newFilters);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateURL = (f: typeof filters) => {
    const params = new URLSearchParams();
    if (f.language) params.append("language", f.language);
    if (f.specialization) params.append("specialization", f.specialization);
    if (f.search) params.append("search", f.search);
    if (f.page > 1) params.append("page", f.page.toString());
    router.push(`/universities?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[#f9fafe] pb-16 md:pb-0">
      <Navbar />
      <main className="pt-0 md:pt-[100px] pb-4 md:pb-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-5">

          {/* Hero Banner */}
          <ScrollReveal direction="fade">
            <div className="relative h-[150px] md:h-[320px] rounded-[16px] md:rounded-[28px] overflow-hidden mb-5 md:mb-10 animate-hero-reveal">
              <Image
                src={figmaAssets.heroImage || figmaAssets.faqHeroBackground}
                alt="Universities"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#121c67]/70 via-[#121c67]/40 to-transparent" />

              <div className="absolute inset-0 flex flex-col items-start justify-center px-6 md:px-12">
                <div className="flex items-center gap-2 mb-3 animate-fade-up">
                  <GraduationCap className="w-5 h-5 text-[#75d3f7]" />
                  <span className="text-white/80 text-sm font-montserrat-regular">Explore the World</span>
                </div>
                <h2 className="font-montserrat-bold text-xl md:text-[38px] leading-tight text-white max-w-md animate-fade-up-d100">
                  {t("listOfInternationalUniversities")}
                </h2>
                {meta.total > 0 && (
                  <p className="text-white/70 text-sm mt-2 font-montserrat-regular animate-fade-up-d200">
                    {meta.total} universities available
                  </p>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Filters */}
          <ScrollReveal direction="up" delay={100}>
            <div className="bg-white rounded-2xl shadow-[0px_4px_40px_rgba(82,96,206,0.10)] p-4 md:p-6 mb-6 md:mb-10">
              <div className="flex items-center gap-2 mb-3 md:hidden">
                <SlidersHorizontal className="w-4 h-4 text-[#5260ce]" />
                <span className="font-montserrat-semibold text-sm text-[#121c67]">Filter Universities</span>
              </div>
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <select
                  value={filters.language}
                  onChange={(e) => handleFilterChange("language", e.target.value)}
                  className="flex-1 bg-[#f9fafe] border border-[#e0e6f1] rounded-xl h-11 md:h-12 px-3 font-montserrat-regular text-sm text-[#2e2e2e] focus:outline-none focus:ring-2 focus:ring-[#5260ce]/30 focus:border-[#5260ce] transition-all"
                >
                  <option value="">{t("languageOfStudy")}</option>
                  {availableLanguages.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>

                <select
                  value={filters.specialization}
                  onChange={(e) => handleFilterChange("specialization", e.target.value)}
                  className="flex-1 bg-[#f9fafe] border border-[#e0e6f1] rounded-xl h-11 md:h-12 px-3 font-montserrat-regular text-sm text-[#2e2e2e] focus:outline-none focus:ring-2 focus:ring-[#5260ce]/30 focus:border-[#5260ce] transition-all"
                >
                  <option value="">{t("fieldOfSpecialisation")}</option>
                  {availableSpecializations.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>

                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 flex-1 md:flex-none">
                  <div className="flex-1 sm:min-w-0 md:w-72 bg-[#f9fafe] border border-[#e0e6f1] rounded-xl px-3 flex gap-2 items-center focus-within:ring-2 focus-within:ring-[#5260ce]/30 focus-within:border-[#5260ce] transition-all">
                    <Search className="w-4 h-4 text-[#8b8c9a] shrink-0" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder={t("searchUniversitiesPlaceholder")}
                      className="flex-1 font-montserrat-regular text-sm text-[#2e2e2e] bg-transparent border-none outline-none placeholder:text-[#8b8c9a] py-3"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm h-11 md:h-12 px-5 rounded-xl shrink-0 w-full sm:w-auto"
                  >
                    {t("search")}
                  </Button>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Results count */}
          {!loading && universities.length > 0 && (
            <p className="font-montserrat-regular text-sm text-[#8b8c9a] mb-4">
              Showing {universities.length} of {meta.total} universities
            </p>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-10">
              {Array.from({ length: 6 }).map((_, i) => <UniversityCardSkeleton key={i} />)}
            </div>
          )}

          {/* Cards Grid */}
          {!loading && (
            <>
              {universities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#f0f4ff] flex items-center justify-center mb-5">
                    <GraduationCap className="w-10 h-10 text-[#5260ce]/50" />
                  </div>
                  <h3 className="font-montserrat-bold text-xl text-[#121c67] mb-2">{t("noUniversitiesFound")}</h3>
                  <p className="font-montserrat-regular text-[#65666f] text-sm mb-6">Try adjusting your filters or search term</p>
                  <Button
                    onClick={() => {
                      const reset = { country: "", language: "", specialization: "", search: "", page: 1 };
                      setFilters(reset);
                      updateURL(reset);
                    }}
                    variant="outline"
                    className="border-[#5260ce] text-[#5260ce] hover:bg-[#5260ce]/5 rounded-xl"
                  >
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-10">
                  {universities.map((university, index) => (
                    <UniversityCard key={university.id} university={university} index={index} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {meta.pages > 1 && (
                <ScrollReveal direction="up">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => handlePageChange(Math.max(1, meta.page - 1))}
                      disabled={meta.page === 1}
                      className="w-10 h-10 rounded-xl border border-[#e0e6f1] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f0f4ff] hover:border-[#5260ce]/30 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#5260ce]" />
                    </button>
                    {Array.from({ length: Math.min(5, meta.pages) }, (_, i) => {
                      let pageNum: number;
                      if (meta.pages <= 5) pageNum = i + 1;
                      else if (meta.page <= 3) pageNum = i + 1;
                      else if (meta.page >= meta.pages - 2) pageNum = meta.pages - 4 + i;
                      else pageNum = meta.page - 2 + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-montserrat-regular text-sm transition-all ${
                            pageNum === meta.page
                              ? "bg-[#5260ce] text-white shadow-[0_4px_12px_rgba(82,96,206,0.35)]"
                              : "border border-[#e0e6f1] text-[#2e2e2e] hover:bg-[#f0f4ff] hover:border-[#5260ce]/30"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(Math.min(meta.pages, meta.page + 1))}
                      disabled={meta.page === meta.pages}
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

export default function UniversitiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f9fafe]">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5260ce] mx-auto mb-3" />
            <p className="font-montserrat-regular text-sm text-[#8b8c9a]">{t("loadingUniversities")}</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <UniversitiesContent />
    </Suspense>
  );
}
