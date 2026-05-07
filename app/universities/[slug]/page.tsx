import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { figmaAssets } from "@/lib/figma-assets";
import { notFound } from "next/navigation";
import { Check, MapPin, DollarSign, Search, Trophy, Globe, Users, GraduationCap, Calendar, BarChart3, ArrowRight, BookOpen, CircleDot } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLanguage, t, tServer, type Language } from "@/lib/i18n";
import { cookies } from "next/headers";
import { getImageUrl, getImageUrlOrFallback } from "@/lib/image-utils";
import { API_BASE_URL } from "@/lib/constants";

async function fetchUniversity(slug: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/public/universities/${slug}`,
      {
        next: { revalidate: 60 },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(
        `Failed to fetch university: ${response.status} ${response.statusText}`,
        errorText
      );
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error && !error.message.includes("fetch")) {
      console.error("Error fetching university:", error);
    }
    return null;
  }
}

async function fetchOtherUniversities(country: string, excludeSlug: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/public/universities?country=${encodeURIComponent(
        country
      )}&limit=3`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.data?.filter((uni: any) => uni.slug !== excludeSlug) || [];
  } catch (error) {
    console.error("Error fetching other universities:", error);
    return [];
  }
}

export default async function UniversityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  let slug: string;

  try {
    const resolvedParams = await params;
    slug = resolvedParams.slug;
  } catch (error) {
    console.error("Error resolving params:", error);
    notFound();
    return null;
  }

  if (!slug || typeof slug !== "string") {
    notFound();
    return null;
  }

  const university = await fetchUniversity(slug);

  if (!university || !university.id) {
    notFound();
    return null;
  }

  const otherUniversities = await fetchOtherUniversities(
    university.country,
    university.slug
  );
  
  // Get language from cookies (fallback to "en")
  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value as Language) || "en";
  const t = (key: string) => tServer(key, lang);

  const admissionRequirements = Array.isArray(university.admissionRequirements)
    ? university.admissionRequirements
    : [];

  const services = Array.isArray(university.services)
    ? university.services
    : [];

  const tourImages = Array.isArray(university.tourImages)
    ? university.tourImages
    : [];

  // Group programs by degree type
  const bachelorPrograms =
    university.programs?.filter(
      (p: any) =>
        p.degree?.toLowerCase().includes("bachelor") ||
        p.degree?.toLowerCase().includes("undergraduate")
    ) || [];
  const masterPrograms =
    university.programs?.filter(
      (p: any) =>
        p.degree?.toLowerCase().includes("master") ||
        p.degree?.toLowerCase().includes("graduate")
    ) || [];

  // Group programs by department/specialization
  const programsByDepartment: Record<string, any[]> = {};
  university.programs?.forEach((program: any) => {
    const department =
      program.department || program.name.split(" ")[0] || t("otherDepartment");
    if (!programsByDepartment[department]) {
      programsByDepartment[department] = [];
    }
    programsByDepartment[department].push(program);
  });

  const totalPrograms = university.programs?.length || 0;

  // Get country flag based on country name
  const getCountryFlag = (country: string) => {
    const countryLower = country.toLowerCase();
    if (
      countryLower.includes("usa") ||
      countryLower.includes("united states") ||
      countryLower.includes("america")
    ) {
      return figmaAssets.usaFlag;
    } else if (countryLower.includes("france")) {
      return figmaAssets.flagFrance;
    } else if (countryLower.includes("canada")) {
      return figmaAssets.flagCanada;
    } else if (countryLower.includes("germany")) {
      return figmaAssets.flagGermany;
    }
    return figmaAssets.usaFlag; // Default
  };

  // Get language flag
  const getLanguageFlag = (language: string) => {
    const langLower = language.toLowerCase();
    if (langLower.includes("english")) {
      return figmaAssets.usaFlag;
    } else if (langLower.includes("french")) {
      return figmaAssets.flagFrance;
    } else if (langLower.includes("german")) {
      return figmaAssets.flagGermany;
    }
    return figmaAssets.usaFlag; // Default
  };

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      <Navbar />
      <main className="pt-0 md:pt-[100px] pb-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-5">
          {/* Hero Banner */}
          <div className="relative h-[260px] md:h-[420px] rounded-[20px] md:rounded-[28px] overflow-hidden mb-6 md:mb-10 animate-hero-reveal">
            <Image
              src={getImageUrlOrFallback(university.bannerUrl, figmaAssets.heroImage)}
              alt={university.name}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#121c67]/80 via-[#121c67]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Admission status badge top-left */}
            <div className="absolute top-4 left-4">
              {(() => {
                const isOpen = university.admissionStatus !== "CLOSED";
                const deadlineText = (() => {
                  if (!isOpen || !university.admissionDeadline) return "";
                  const locale = lang === "ar" ? "ar-EG" : "en-GB";
                  const date = new Date(university.admissionDeadline).toLocaleDateString(locale, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  return t("admissionUntil").replace("{date}", date);
                })();
                return (
                  <span
                    className={`inline-flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm border ${
                      isOpen
                        ? "bg-green-500/90 text-white border-green-400"
                        : "bg-red-500/90 text-white border-red-400"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full inline-block ${isOpen ? "bg-white animate-ping" : "bg-white/70"}`}
                      style={isOpen ? { animationDuration: "1.2s" } : {}}
                    />
                    <span className="relative -ml-3.5">
                      <span className={`w-2 h-2 rounded-full inline-block ${isOpen ? "bg-white" : "bg-white/70"}`} />
                    </span>
                    <span className="whitespace-nowrap">
                      {isOpen ? t("admissionOpen") : t("admissionClosed")}
                    </span>
                    {deadlineText && (
                      <span className={`opacity-85 ${lang === "ar" ? "me-1" : ""}`}>
                        <span className="mx-1">·</span>
                        <span className="whitespace-nowrap">{deadlineText}</span>
                      </span>
                    )}
                  </span>
                );
              })()}
            </div>

            {/* Ranking badge top-right */}
            {university.worldRanking && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-[#5260ce]/90 text-white text-xs font-montserrat-semibold shadow-md backdrop-blur-sm border-0 px-3 py-1.5">
                  <Trophy className="w-3 h-3 mr-1.5" />
                  #{university.worldRanking} {t("worldRankingLabel")}
                </Badge>
              </div>
            )}

            {/* Bottom content row (separated blocks) */}
            <div
              className={`absolute left-5 right-5 bottom-5 md:left-10 md:right-10 md:bottom-8 flex flex-col items-start md:items-end justify-between gap-4 ${
                lang === "ar" ? "md:flex-row-reverse" : "md:flex-row"
              }`}
            >
              <div
                className={`flex items-end gap-3 md:gap-4 min-w-0 w-full md:max-w-[65%] ${
                  lang === "ar" ? "flex-row-reverse text-right" : "text-left"
                }`}
              >
                {(university.logoUrl || university.logo) && (
                  <div className="relative w-16 h-16 md:w-[110px] md:h-[110px] border-4 border-white rounded-2xl overflow-hidden shrink-0 bg-white shadow-xl">
                    <Image
                      src={getImageUrlOrFallback(university.logoUrl || university.logo, figmaAssets.logo)}
                      alt={university.name}
                      fill
                      className="object-contain p-1 md:p-2"
                      unoptimized
                    />
                  </div>
                )}
                <div className="pb-1 min-w-0">
                  <p className="text-white/70 text-xs md:text-sm font-montserrat-regular mb-1 truncate">{university.country}</p>
                  <h1 className="font-montserrat-bold text-xl md:text-[36px] leading-tight text-white drop-shadow-lg line-clamp-2 md:line-clamp-1">
                    {university.name}
                  </h1>
                </div>
              </div>

              <div className={`shrink-0 w-full md:w-auto ${lang === "ar" ? "text-left md:text-left" : "text-right md:text-right"}`}>
                <Button
                  className="w-full md:w-auto bg-white hover:bg-gray-50 text-[#5260ce] font-montserrat-semibold text-sm md:text-base h-10 md:h-12 px-4 md:px-7 rounded-xl shadow-lg transition-all hover:shadow-xl"
                  asChild
                >
                  <Link href={`/universities/${slug}/programs`} className="flex items-center gap-2">
                    {t("viewAcademicPrograms")}
                    <ArrowRight className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`} />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About University Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-7 flex flex-col gap-5 shadow-sm hover:shadow-md transition-shadow animate-fade-up">
                <h3 className="font-montserrat-bold text-lg md:text-xl text-[#121c67] section-title-accent pb-1">
                  {t("about")} {university.name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-3">
                    <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                      {t("country")}
                    </p>
                    <div className="bg-[rgba(117,211,247,0.1)] border border-[#75d3f7] rounded-lg px-3 py-2 flex gap-2 items-center">
                      <div className="relative w-6 h-6 shrink-0">
                        <Image
                          src={getCountryFlag(university.country)}
                          alt={t("countryAlt")}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                        {university.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                      {t("city")}
                    </p>
                    <div className={`bg-[rgba(117,211,247,0.1)] border border-[#75d3f7] rounded-lg px-3 py-2 flex gap-2 items-center ${getLanguage() === "ar" ? "flex-row-reverse" : ""}`}>
                      <MapPin className="w-6 h-6 shrink-0 text-[#5260ce]" />
                      <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                        {university.city}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                      {t("languageOfStudy")}
                    </p>
                    <div className="bg-[rgba(117,211,247,0.1)] border border-[#75d3f7] rounded-lg px-3 py-2 flex gap-2 items-center">
                      <div className="relative w-6 h-6 shrink-0">
                        <Image
                          src={getLanguageFlag(university.language)}
                          alt={t("languageAlt")}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                        {university.language}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                      {t("tuitionFees")}
                    </p>
                    <div className={`bg-[rgba(117,211,247,0.1)] border border-[#75d3f7] rounded-lg px-3 py-2 flex gap-2 items-center ${getLanguage() === "ar" ? "flex-row-reverse" : ""}`}>
                      <DollarSign className="w-6 h-6 shrink-0 text-[#5260ce]" />
                      <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                        {university.programs?.[0]?.tuition || "$56,000+/year"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Card */}
              {university.establishmentYear && (
                <div className="bg-gradient-to-br from-[#121c67] to-[#5260ce] rounded-2xl p-5 md:p-7 flex flex-col gap-5 shadow-md animate-fade-up-d100">
                  <h3 className="font-montserrat-bold text-lg md:text-xl text-white">
                    {t("statisticsAbout")} {university.name}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {[
                      { label: t("establishmentYear"), value: university.establishmentYear, icon: Calendar, show: !!university.establishmentYear },
                      { label: t("worldRanking"),      value: `#${university.worldRanking}`, icon: Trophy,  show: !!university.worldRanking },
                      { label: t("localRanking"),      value: `#${university.localRanking}`, icon: BarChart3, show: !!university.localRanking },
                      { label: t("programmesNumber"),  value: totalPrograms,                 icon: BookOpen, show: true },
                      { label: t("studentsNumber"),    value: university.studentsNumber,     icon: Users,    show: !!university.studentsNumber },
                    ].filter(s => s.show).map(stat => {
                      const Icon = stat.icon;
                      return (
                        <div key={stat.label} className="bg-white/15 backdrop-blur-sm rounded-xl p-3 flex flex-col gap-2 border border-white/20">
                          <Icon className="w-4 h-4 text-[#75d3f7]" />
                          <p className="font-montserrat-bold text-xl text-white leading-none">{stat.value}</p>
                          <p className="font-montserrat-regular text-xs text-white/70">{stat.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tour Gallery Card */}
              {tourImages.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-7 flex flex-col gap-5 shadow-sm animate-fade-up-d200">
                  <h3 className="font-montserrat-bold text-lg md:text-xl text-[#121c67] section-title-accent pb-1">
                    {t("tourInside")} {university.name}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {tourImages.slice(0, 6).map((img: string, index: number) => (
                      <div key={index} className={`relative rounded-xl overflow-hidden group ${index === 0 ? "col-span-2 md:col-span-1 h-[180px]" : "h-[130px]"}`}>
                        <Image
                          src={getImageUrl(img)}
                          alt={`Tour ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* About the University Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-7 flex flex-col gap-5 shadow-sm animate-fade-up-d300">
                <h3 className="font-montserrat-bold text-lg md:text-xl text-[#121c67] section-title-accent pb-1">
                  {t("aboutTheUniversity")}
                </h3>
                <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                  {university.about ||
                    t("defaultUniversityDescription")
                      .replace("{year}", university.establishmentYear || "1885")
                      .replace("{city}", university.city)
                      .replace("{country}", university.country)
                      .replace("{name}", university.name)}
                </p>
              </div>

              {/* Admission Requirements Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-7 flex flex-col gap-5 shadow-sm animate-fade-up-d400">
                <h3 className="font-montserrat-bold text-lg md:text-xl text-[#121c67] section-title-accent pb-1">
                  {t("admissionRequirements")}
                </h3>
                <div className="flex flex-col gap-3">
                  {(admissionRequirements.length > 0
                    ? admissionRequirements
                    : [t("highAcademicPerformance"), t("englishProficiency"), t("satActScores"), t("personalStatement")]
                  ).map((req: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-[#f9fafe] border border-gray-100">
                      <div className="w-5 h-5 rounded-full bg-[#5260ce]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-[#5260ce]" />
                      </div>
                      <p className="font-montserrat-regular text-sm md:text-base text-[#2e2e2e] leading-relaxed">{req}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Services Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-7 flex flex-col gap-5 shadow-sm">
                <h3 className="font-montserrat-bold text-lg md:text-xl text-[#121c67] section-title-accent pb-1">
                  {t("availableServicesViaUniVolta")}
                </h3>
                <div className="flex flex-col gap-2.5">
                  {services.length > 0 ? (
                    services.map((service: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                          {service.replace("✅", "").trim()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                          {t("applicationSupport")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                          {t("documentReview")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                          {t("guidanceThroughAdmission")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                          {t("optionalServices")}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 flex flex-col gap-5 lg:sticky lg:top-[120px] shadow-sm animate-fade-up">
                <div className="flex items-center justify-between">
                  <h3 className="font-montserrat-bold text-lg text-[#121c67] section-title-accent pb-1">
                    {t("availableMajors")}
                  </h3>
                  <span className="text-sm font-montserrat-semibold text-[#5260ce] bg-[#5260ce]/10 px-2.5 py-1 rounded-full">
                    {totalPrograms}
                  </span>
                </div>

                {/* Search Bar */}
                <div className={`bg-gray-50 border border-[#e0e6f1] rounded-xl px-3 md:px-3.5 py-2.5 md:py-3.5 flex gap-2 md:gap-3 items-center ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                  <Search className={`w-5 h-5 md:w-6 md:h-6 shrink-0 text-[#8b8c9a] ${lang === "ar" ? "ml-3" : "mr-0"}`} />
                  <p className="font-montserrat-light text-sm md:text-[16px] leading-[1.4] text-[#8b8c9a]">
                    {t("searchUniversities")}
                  </p>
                </div>

                {/* Bachelor's/Master's Tabs */}
                <div className="flex gap-2 md:gap-5">
                  <Link
                    href={`/universities/${slug}/programs?degree=bachelor`}
                    className="flex-1 bg-[rgba(117,211,247,0.1)] border border-[#75d3f7] rounded-[10px] px-2 md:px-4 py-2 md:py-2.5 flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <p className="font-montserrat-regular text-sm md:text-[18px] leading-[1.4] text-[#121c67] text-center">
                      {t("bachelors")} ({bachelorPrograms.length})
                    </p>
                  </Link>
                  <Link
                    href={`/universities/${slug}/programs?degree=master`}
                    className="flex-1 border border-[#b1b2bf] rounded-[10px] px-2 md:px-4 py-2 md:py-2.5 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-montserrat-regular text-sm md:text-[18px] leading-[1.4] text-[#65666f] text-center">
                      {t("masters")} ({masterPrograms.length})
                    </p>
                  </Link>
                </div>

                {/* Programs List by Department */}
                <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto">
                  {Object.entries(programsByDepartment).map(
                    ([department, programs]) => (
                      <div
                        key={department}
                        className="border-b border-[#e0e6f1] pb-3 last:border-b-0"
                      >
                        <p className="font-montserrat-semibold text-[16px] text-[#121c67] mb-2">
                          {department} ({programs.length}{" "}
                          {programs.length === 1 ? t("program") : t("programs")})
                        </p>
                        <div className="flex flex-col gap-2">
                          {programs.slice(0, 5).map((p: any) => (
                            <Link
                              key={p.id}
                              href={`/universities/${slug}/programs/${p.slug}`}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <span className="font-montserrat-regular text-[14px] text-[#2e2e2e]">
                                {p.name}
                              </span>
                              {p.tuition && (
                                <span className="font-montserrat-semibold text-[14px] text-[#5260ce]">
                                  {p.tuition}
                                </span>
                              )}
                            </Link>
                          ))}
                          {programs.length > 5 && (
                            <Link
                              href={`/universities/${slug}/programs?department=${encodeURIComponent(
                                department
                              )}`}
                              className="text-sm text-[#5260ce] hover:underline mt-1"
                            >
                              {t("viewAllPrograms")} {programs.length} {t("programs")} →
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Other Universities Section — same card design as home page */}
          {otherUniversities.length > 0 && (
            <div className="mt-12 md:mt-20">
              <div className="flex items-end gap-4 mb-8">
                <div>
                  <p className="text-sm font-montserrat-regular text-[#5260ce] mb-1">Discover More</p>
                  <h2 className="font-montserrat-bold text-2xl md:text-[34px] text-[#121c67] leading-tight section-title-accent pb-1">
                    {t("otherUniversitiesIn")} {university.country}
                  </h2>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {otherUniversities.map((uni: any) => {
                  const uniLogo = uni.logoUrl || uni.logo;
                  const uniBanner = uni.bannerUrl || uni.image1 || figmaAssets.universityLogo1;
                  return (
                    <Card key={uni.id} className="group overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-400 hover:-translate-y-2 bg-white h-full flex flex-col">
                      {/* Banner */}
                      <div className="relative h-52 overflow-hidden shrink-0">
                        <Image
                          src={uniBanner}
                          alt={uni.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(18,28,103,0.75)] via-[rgba(18,28,103,0.25)] to-transparent" />
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-white/90 text-[#121c67] hover:bg-white font-montserrat-semibold text-xs shadow-sm">{uni.country}</Badge>
                        </div>
                        {uni.worldRanking && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-[#5260ce]/90 text-white text-xs font-montserrat-semibold shadow-sm">
                              <Trophy className="w-3 h-3 mr-1" />#{uni.worldRanking} {t("worldShort")}
                            </Badge>
                          </div>
                        )}
                        {uniLogo && (
                          <div className="absolute bottom-3 left-4">
                            <div className="w-14 h-14 rounded-xl bg-white shadow-lg p-1.5 overflow-hidden">
                              <div className="relative w-full h-full">
                                <Image src={uniLogo} alt={uni.name} fill className="object-contain p-0.5" unoptimized />
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-4 pt-8">
                          <h3 className={`font-montserrat-bold text-lg text-white leading-tight line-clamp-2 ${uniLogo ? "pl-16" : ""}`}>{uni.name}</h3>
                        </div>
                      </div>
                      <CardContent className="pt-4 pb-2 px-5 flex-1 flex flex-col gap-3">
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="border-[#75d3f7] text-[#2e2e2e] bg-[rgba(117,211,247,0.08)] text-xs font-montserrat-regular gap-1 rounded-full">
                            <MapPin className="w-3 h-3 text-[#5260ce]" />{uni.city || uni.country}
                          </Badge>
                          <Badge variant="outline" className="border-[#5260ce]/30 text-[#2e2e2e] bg-[rgba(82,96,206,0.06)] text-xs font-montserrat-regular gap-1 rounded-full">
                            <Globe className="w-3 h-3 text-[#5260ce]" />{uni.language}
                          </Badge>
                        </div>
                        <p className="text-sm font-montserrat-regular text-[#65666f] leading-relaxed line-clamp-2 flex-1">
                          {uni.description || uni.about || t("discoverWorldClassAcademics")}
                        </p>
                        {uni.majors && uni.majors.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1 mb-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-[#5260ce]" />
                              <span className="text-xs font-montserrat-semibold text-[#5260ce]">{t("keyMajors")}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {uni.majors.slice(0, 5).map((major: string, i: number) => (
                                <Badge key={i} className="bg-[rgba(82,96,206,0.1)] text-[#5260ce] hover:bg-[rgba(82,96,206,0.18)] text-xs font-montserrat-regular border-0 rounded-md h-auto py-1">{major}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="pt-3 pb-5 px-5">
                        <Button className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm h-11 rounded-xl transition-all duration-300 hover:shadow-[0_8px_24px_rgba(82,96,206,0.35)] group/btn" asChild>
                          <Link href={`/universities/${uni.slug}`} className="flex items-center justify-center gap-2">
                            {t("viewDetails")}
                            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
