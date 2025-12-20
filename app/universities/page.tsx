"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { figmaAssets } from "@/lib/figma-assets";
import { getImageUrl, getImageUrlOrFallback } from "@/lib/image-utils";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { t } from "@/lib/i18n";
import { API_BASE_URL } from "@/lib/constants";

type University = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  country: string;
  city: string;
  language: string;
  description?: string | null;
  about?: string | null;
  image1?: string | null;
  image2?: string | null;
  bannerUrl?: string | null;
  majors?: string[];
};

type Meta = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

function UniversitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [universities, setUniversities] = useState<University[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 12, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    country: searchParams.get("country") || "",
    language: searchParams.get("language") || "",
    specialization: searchParams.get("specialization") || "",
    search: searchParams.get("search") || "",
    page: parseInt(searchParams.get("page") || "1"),
  });

  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>([]);

  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);

  useEffect(() => {
    fetchUniversities();
    fetchFilterOptions();
  }, [filters]);

  const fetchFilterOptions = async () => {
    try {
      const [uniRes, specRes] = await Promise.all([
        fetch(`${API_BASE_URL}/public/universities?limit=100`),
        fetch(`${API_BASE_URL}/programs/specializations`),
      ]);
      
      if (uniRes.ok) {
        const data = await uniRes.json();
        const countryValues = (data.data || []).map((u: University) => u.country).filter((c: any): c is string => typeof c === 'string') as string[];
        const languageValues = (data.data || []).map((u: University) => u.language).filter((l: any): l is string => typeof l === 'string') as string[];
        const countries: string[] = [...new Set(countryValues)].sort();
        const languages: string[] = [...new Set(languageValues)].sort();
        setAvailableCountries(countries);
        setAvailableLanguages(languages);
      }

      if (specRes.ok) {
        const specData = await specRes.json();
        const specializations = [...new Set(
          (Array.isArray(specData) ? specData : []).map((s: any) => s.specialization).filter(Boolean)
        )].sort();
        setAvailableSpecializations(specializations);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.country) params.append("country", filters.country);
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
    } catch (error) {
      console.error("Error fetching universities:", error);
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

  const updateURL = (newFilters: typeof filters) => {
    const params = new URLSearchParams();
    if (newFilters.country) params.append("country", newFilters.country);
    if (newFilters.language) params.append("language", newFilters.language);
    if (newFilters.specialization) params.append("specialization", newFilters.specialization);
    if (newFilters.search) params.append("search", newFilters.search);
    if (newFilters.page > 1) params.append("page", newFilters.page.toString());
    router.push(`/universities?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      <Navbar />
      <main className="pt-0 md:pt-[100px] pb-4 md:pb-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-5">
          {/* Hero Banner */}
          <div className="relative h-[150px] md:h-[350px] rounded-[12px] md:rounded-[24px] overflow-hidden mb-4 md:mb-10">
            <div className="absolute inset-0">
              <Image
                src={figmaAssets.heroImage}
                alt="Universities"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-[rgba(18,28,103,0.4)]" />
            </div>
            <h2 className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 font-montserrat-bold text-xl md:text-[34px] leading-[1.4] text-white px-4 text-center w-full">
              {t("listOfInternationalUniversities")}
            </h2>
          </div>

          {/* Filters and Search Bar */}
          <div className="bg-white rounded-[12px] md:rounded-[24px] shadow-[0px_4px_40px_0px_rgba(82,96,206,0.12)] p-3 md:p-6 mb-4 md:mb-10 flex flex-col md:flex-row gap-3 md:gap-5">
            {/* Country Dropdown */}
            <div className="flex-1 min-w-0 w-full md:w-auto">
              <select
                value={filters.country}
                onChange={(e) => handleFilterChange("country", e.target.value)}
                className="w-full bg-gray-50 border border-[#e0e6f1] rounded-lg h-[48px] md:h-[52px] px-3 md:px-3.5 py-2.5 md:py-3 font-montserrat-regular text-sm md:text-[16px] text-[#2e2e2e] focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              >
                <option value="">{t("country")}</option>
                {availableCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Dropdown */}
            <div className="flex-1 min-w-0 w-full md:w-auto">
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange("language", e.target.value)}
                className="w-full bg-gray-50 border border-[#e0e6f1] rounded-lg h-[48px] md:h-[52px] px-3 md:px-3.5 py-2.5 md:py-3 font-montserrat-regular text-sm md:text-[16px] text-[#2e2e2e] focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              >
                <option value="">{t("languageOfStudy")}</option>
                {availableLanguages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>

            {/* Field of Specialisation Dropdown */}
            <div className="flex-1 min-w-0 w-full md:w-auto">
              <select
                value={filters.specialization}
                onChange={(e) => handleFilterChange("specialization", e.target.value)}
                className="w-full bg-gray-50 border border-[#e0e6f1] rounded-lg h-[48px] md:h-[52px] px-3 md:px-3.5 py-2.5 md:py-3 font-montserrat-regular text-sm md:text-[16px] text-[#2e2e2e] focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              >
                <option value="">{t("fieldOfSpecialisation")}</option>
                {availableSpecializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input and Button */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 rounded-xl md:rounded-2xl w-full md:w-auto">
              <div className="bg-gray-50 border border-[#e0e6f1] rounded-lg md:rounded-xl px-3 md:px-3.5 py-2.5 md:py-3.5 flex gap-2 md:gap-3 items-center flex-1 md:w-[310px]">
                <Search className="w-5 h-5 md:w-6 md:h-6 text-[#8b8c9a] shrink-0" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={t("searchUniversitiesPlaceholder")}
                  className="flex-1 font-montserrat-light text-sm md:text-[16px] leading-[1.4] text-[#2e2e2e] bg-transparent border-none outline-none placeholder:text-[#8b8c9a]"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm md:text-[16px] h-[48px] md:h-[52px] w-full sm:w-auto md:w-[124px] rounded-lg md:rounded-xl shrink-0"
              >
                {t("search")}
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <p className="font-montserrat-regular text-[18px] text-[#8b8c9a]">{t("loadingUniversities")}</p>
            </div>
          )}

          {/* University Cards Grid */}
          {!loading && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-[30px] mb-6 md:mb-10">
                {universities.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <p className="font-montserrat-regular text-[18px] text-[#8b8c9a]">
                      {t("noUniversitiesFound")}
                    </p>
                  </div>
                ) : (
                  universities.map((university) => (
                    <div
                      key={university.id}
                      className="bg-white border-[3px] md:border-[5px] border-white rounded-xl overflow-hidden flex flex-col shadow-md"
                    >
                      {/* Image Section with Logo and Name Badge */}
                      <div className="relative pb-[50px] md:pb-[67px]">
                        {/* University Image */}
                        <div className="h-[160px] md:h-[220px] -mb-[50px] md:-mb-[67px] relative rounded-xl overflow-hidden">
                          <div className="absolute inset-0">
                            <Image
                              src={getImageUrlOrFallback(
                                university.image1 || university.bannerUrl,
                                figmaAssets.universityLogo1
                              )}
                              alt={university.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            {university.image2 && (
                              <Image
                                src={getImageUrl(university.image2)}
                                alt=""
                                fill
                                className="object-cover opacity-40"
                                unoptimized
                              />
                            )}
                          </div>
                        </div>

                        {/* Logo and Name Badge */}
                        <div className="relative flex gap-1 h-[60px] md:h-[86px] px-3 md:px-6 items-center -mt-[50px] md:-mt-[67px] rounded-br-xl">
                          <div className="bg-[#5260ce] flex gap-1 h-[40px] md:h-[49px] items-center rounded-bl-[30px] md:rounded-bl-[40px] rounded-br-xl rounded-tl-[30px] md:rounded-tl-[40px]">
                            {/* University Logo */}
                            {university.logo && (
                              <div className="relative w-[50px] h-[50px] md:w-[76px] md:h-[76px] border-[3px] md:border-[5px] border-white rounded-full overflow-hidden shrink-0">
                                <Image
                                  src={getImageUrl(university.logo)}
                                  alt={university.name}
                                  fill
                                  className="object-contain p-1 md:p-2"
                                  unoptimized
                                />
                              </div>
                            )}
                            {/* University Name */}
                            <div className="px-2 md:px-4 py-3 md:py-6 h-[40px] md:h-[49px] flex items-center">
                              <p className="font-montserrat-bold text-sm md:text-[18px] leading-[1.4] text-white line-clamp-1">
                                {university.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex flex-col gap-2 md:gap-[10px] px-3 md:px-5 pt-3 md:pt-4">
                        {/* Description */}
                        <div className="flex gap-2 md:gap-[10px] items-center justify-center px-2 md:px-5">
                          <p className="flex-1 font-montserrat-regular text-sm md:text-[16px] leading-[1.4] text-[#2e2e2e] line-clamp-2 md:line-clamp-none">
                            {university.description || university.about || t("discoverWorldClassAcademics")}
                          </p>
                        </div>

                        {/* Location & Language Tags */}
                        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 px-2 md:px-5">
                          {/* Location Tag */}
                          <div className="bg-[rgba(117,211,247,0.1)] border border-[#75d3f7] rounded-lg px-2 py-1.5 flex gap-1 items-center">
                            <div className="relative w-5 h-5 md:w-6 md:h-6 shrink-0">
                              <Image
                                src={figmaAssets.usaFlag}
                                alt="Location"
                                fill
                                className="object-contain"
                                unoptimized
                              />
                            </div>
                            <p className="font-montserrat-regular text-sm md:text-[18px] leading-[1.4] text-[#2e2e2e] truncate">
                              {university.city}, {university.country}
                            </p>
                          </div>

                          <div className="bg-[rgba(117,211,247,0.1)] border border-[#75d3f7] rounded-lg px-2 py-1.5 flex gap-1 items-center">
                            <div className="relative w-5 h-5 md:w-6 md:h-6 shrink-0">
                              <Image
                                src={figmaAssets.englishFlag}
                                alt="Language"
                                fill
                                className="object-contain"
                                unoptimized
                              />
                            </div>
                            <p className="font-montserrat-regular text-sm md:text-[18px] leading-[1.4] text-[#2e2e2e] truncate">
                              {university.language}
                            </p>
                          </div>
                        </div>

                        {/* Key Majors Section */}
                        {university.majors && university.majors.length > 0 && (
                          <div className="flex flex-col gap-2 md:gap-[10px] w-full">
                            {/* Key Majors Label */}
                            <div className="px-2 md:px-5">
                              <p className="font-montserrat-regular text-sm md:text-[16px] leading-[1.4] text-[#2e2e2e]">
                                {t("keyMajors")}
                              </p>
                            </div>

                            {/* Major Tags */}
                            <div className="flex flex-col gap-2 md:gap-[10px]">
                              <div className="px-2 md:px-5 flex flex-wrap gap-2 md:gap-2.5">
                                {university.majors.slice(0, 2).map((major) => (
                                  <div
                                    key={major}
                                    className="bg-[rgba(117,211,247,0.2)] rounded-md px-2 py-1.5 md:py-2 h-auto md:h-[26px] flex items-center justify-center overflow-hidden"
                                  >
                                    <p className="font-montserrat-regular text-xs md:text-[16px] leading-[1.4] text-[#121c67] text-center">
                                      {major}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              {university.majors.length > 2 && (
                                <div className="px-2 md:px-5 flex flex-wrap gap-2 md:gap-2.5">
                                  {university.majors.slice(2, 5).map((major) => (
                                    <div
                                      key={major}
                                      className="bg-[rgba(117,211,247,0.2)] rounded-md px-2 py-1.5 md:py-2 h-auto md:h-[26px] flex items-center justify-center overflow-hidden"
                                    >
                                      <p className="font-montserrat-regular text-xs md:text-[16px] leading-[1.4] text-[#121c67] text-center">
                                        {major}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* View Details Button */}
                        <div className="px-3 md:px-5 pb-4 md:pb-5 pt-2 md:pt-0">
                          <Button
                            className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm md:text-[16px] h-[44px] md:h-[48px] w-full rounded-xl"
                            asChild
                          >
                            <Link href={`/universities/${university.slug}`}>{t("viewDetails")}</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {meta.pages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => handlePageChange(Math.max(1, meta.page - 1))}
                    disabled={meta.page === 1}
                    className="w-[50px] h-[50px] rounded-lg border border-[#e0e6f1] flex items-center justify-center rotate-180 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <Image
                      src={figmaAssets.arrowRight}
                      alt="Previous"
                      width={24}
                      height={24}
                      unoptimized
                    />
                  </button>
                  {Array.from({ length: Math.min(5, meta.pages) }, (_, i) => {
                    let pageNum;
                    if (meta.pages <= 5) {
                      pageNum = i + 1;
                    } else if (meta.page <= 3) {
                      pageNum = i + 1;
                    } else if (meta.page >= meta.pages - 2) {
                      pageNum = meta.pages - 4 + i;
                    } else {
                      pageNum = meta.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-[50px] h-[50px] rounded-lg flex items-center justify-center font-montserrat-regular text-[18px] ${
                          pageNum === meta.page
                            ? "bg-[#5260ce] text-white"
                            : "border border-[#e0e6f1] text-[#2e2e2e] hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(Math.min(meta.pages, meta.page + 1))}
                    disabled={meta.page === meta.pages}
                    className="w-[50px] h-[50px] rounded-lg border border-[#e0e6f1] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <Image
                      src={figmaAssets.arrowRight}
                      alt="Next"
                      width={24}
                      height={24}
                      unoptimized
                    />
                  </button>
                </div>
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
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="font-montserrat-regular text-[18px] text-[#8b8c9a]">{t("loadingUniversities")}</p>
        </div>
        <Footer />
      </div>
    }>
      <UniversitiesContent />
    </Suspense>
  );
}
