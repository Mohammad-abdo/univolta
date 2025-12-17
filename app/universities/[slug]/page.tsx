import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { figmaAssets } from "@/lib/figma-assets";
import { notFound } from "next/navigation";
import { Check, MapPin, DollarSign, Search } from "lucide-react";
import { getLanguage, t, tServer, type Language } from "@/lib/i18n";
import { cookies } from "next/headers";
import { getImageUrl, getImageUrlOrFallback } from "@/lib/image-utils";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

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
      program.department || program.name.split(" ")[0] || "Other";
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
          {/* Hero Banner - Exactly like image */}
          <div className="relative h-[250px] md:h-[400px] rounded-[16px] md:rounded-[24px] overflow-hidden mb-6 md:mb-10">
            <div className="absolute inset-0">
              <Image
                src={getImageUrlOrFallback(
                  university.bannerUrl,
                  figmaAssets.heroImage
                )}
                alt={university.name}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-[rgba(18,28,103,0.4)]" />
            </div>
            {/* Logo and Name - Bottom Left */}
            <div className="absolute left-4 bottom-4 md:left-10 md:bottom-10 flex flex-col md:flex-row gap-2 md:gap-5 items-start md:items-center">
              {(university.logoUrl || university.logo) && (
                <div className="relative w-[60px] h-[60px] md:w-[134px] md:h-[134px] border-[3px] md:border-[5px] border-white rounded-full overflow-hidden shrink-0 bg-white">
                  <Image
                    src={getImageUrlOrFallback(
                      university.logoUrl || university.logo,
                      figmaAssets.logo
                    )}
                    alt={university.name}
                    fill
                    className="object-contain p-1 md:p-2"
                    unoptimized
                  />
                </div>
              )}
              <h1 className="font-montserrat-bold text-lg md:text-[34px] leading-[1.4] text-white max-w-[calc(100%-80px)] md:max-w-none">
                {university.name}
              </h1>
            </div>
            {/* View Academic Programs Button - Bottom Right */}
            <div className="absolute right-4 bottom-4 md:right-10 md:bottom-10 left-4 md:left-auto">
              <Button
                className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm md:text-[16px] h-[40px] md:h-[52px] w-full md:w-[260px] rounded-xl shadow-lg"
                asChild
              >
                <Link href={`/universities/${slug}/programs`}>
                  {t("viewAcademicPrograms")}
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About University Card - Exactly like image */}
              <div className="bg-white border-[3px] md:border-[5px] border-white rounded-xl p-4 md:p-6 flex flex-col gap-4 md:gap-5 shadow-[0px_4px_40px_0px_rgba(82,96,206,0.12)]">
                <h3 className="font-montserrat-bold text-lg md:text-[24px] leading-[1.4] text-[#5260ce]">
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
                          alt="Country"
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
                          alt="Language"
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
                <div className="bg-white border-[3px] md:border-[5px] border-white rounded-xl p-4 md:p-6 flex flex-col gap-4 md:gap-5 shadow-[0px_4px_40px_0px_rgba(82,96,206,0.12)]">
                  <h3 className="font-montserrat-bold text-lg md:text-[24px] leading-[1.4] text-[#5260ce]">
                    {t("statisticsAbout")} {university.name}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {university.establishmentYear && (
                      <div className="flex flex-col gap-3">
                        <p className="font-montserrat-regular text-[14px] leading-[1.4] text-[#8b8c9a]">
                          {t("establishmentYear")}
                        </p>
                        <p className="font-montserrat-regular text-[18px] leading-[1.4] text-[#2e2e2e]">
                          {university.establishmentYear}
                        </p>
                      </div>
                    )}
                    {university.worldRanking && (
                      <div className="flex flex-col gap-3">
                        <p className="font-montserrat-regular text-[14px] leading-[1.4] text-[#8b8c9a]">
                          {t("worldRanking")}
                        </p>
                        <p className="font-montserrat-regular text-[18px] leading-[1.4] text-[#2e2e2e]">
                          {university.worldRanking}
                        </p>
                      </div>
                    )}
                    {university.localRanking && (
                      <div className="flex flex-col gap-3">
                        <p className="font-montserrat-regular text-[14px] leading-[1.4] text-[#8b8c9a]">
                          {t("localRanking")}
                        </p>
                        <p className="font-montserrat-regular text-[18px] leading-[1.4] text-[#2e2e2e]">
                          {university.localRanking}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-col gap-3">
                      <p className="font-montserrat-regular text-[14px] leading-[1.4] text-[#8b8c9a]">
                        {t("programmesNumber")}
                      </p>
                      <p className="font-montserrat-regular text-[18px] leading-[1.4] text-[#2e2e2e]">
                        {totalPrograms}
                      </p>
                    </div>
                    {university.studentsNumber && (
                      <div className="flex flex-col gap-3">
                        <p className="font-montserrat-regular text-[14px] leading-[1.4] text-[#8b8c9a]">
                          {t("studentsNumber")}
                        </p>
                        <p className="font-montserrat-regular text-[18px] leading-[1.4] text-[#2e2e2e]">
                          {university.studentsNumber}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tour Gallery Card */}
              {tourImages.length > 0 && (
                <div className="bg-white border-[3px] md:border-[5px] border-white rounded-xl p-4 md:p-6 flex flex-col gap-4 md:gap-5 shadow-[0px_4px_40px_0px_rgba(82,96,206,0.12)]">
                  <h3 className="font-montserrat-bold text-lg md:text-[24px] leading-[1.4] text-[#5260ce]">
                    {t("tourInside")} {university.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 md:gap-4">
                    {tourImages
                      .slice(0, 5)
                      .map((img: string, index: number) => (
                        <div
                          key={index}
                          className="flex-1 min-w-[calc(50%-4px)] md:min-w-0 h-[100px] md:h-[130px] relative rounded-xl overflow-hidden"
                        >
                          <Image
                            src={getImageUrl(img)}
                            alt={`Tour ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* About the University Card */}
              <div className="bg-white border-[3px] md:border-[5px] border-white rounded-xl p-4 md:p-6 flex flex-col gap-4 md:gap-5 shadow-[0px_4px_40px_0px_rgba(82,96,206,0.12)]">
                <h3 className="font-montserrat-bold text-lg md:text-[24px] leading-[1.4] text-[#5260ce]">
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
              <div className="bg-white border-[3px] md:border-[5px] border-white rounded-xl p-4 md:p-6 flex flex-col gap-4 md:gap-5 shadow-[0px_4px_40px_0px_rgba(82,96,206,0.12)]">
                <h3 className="font-montserrat-bold text-lg md:text-[24px] leading-[1.4] text-[#5260ce]">
                  {t("admissionRequirements")}
                </h3>
                <div className="flex flex-col gap-2.5">
                  {admissionRequirements.length > 0 ? (
                    admissionRequirements.map((req: string, index: number) => (
                      <p
                        key={index}
                        className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]"
                      >
                        • {req}
                      </p>
                    ))
                  ) : (
                    <>
                      <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                        • {t("highAcademicPerformance")}
                      </p>
                      <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                        • {t("englishProficiency")}
                      </p>
                      <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                        • {t("satActScores")}
                      </p>
                      <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                        • {t("personalStatement")}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Available Services Card */}
              <div className="bg-white border-[3px] md:border-[5px] border-white rounded-xl p-4 md:p-6 flex flex-col gap-4 md:gap-5 shadow-[0px_4px_40px_0px_rgba(82,96,206,0.12)]">
                <h3 className="font-montserrat-bold text-lg md:text-[24px] leading-[1.4] text-[#5260ce]">
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

            {/* Right Column - Sidebar - Exactly like image */}
            <div className="lg:col-span-1">
              <div className="bg-white border-[3px] md:border-[5px] border-white rounded-xl p-4 md:p-6 flex flex-col gap-4 md:gap-6 lg:sticky lg:top-[120px] shadow-[0px_4px_40px_0px_rgba(82,96,206,0.12)]">
                <h3 className="font-montserrat-bold text-lg md:text-[24px] leading-[1.4] text-[#5260ce]">
                  {t("availableMajors")}{" "}
                  <span className="font-montserrat-regular text-base md:text-[20px]">
                    ({totalPrograms})
                  </span>
                </h3>

                {/* Search Bar */}
                <div className={`bg-gray-50 border border-[#e0e6f1] rounded-xl px-3 md:px-3.5 py-2.5 md:py-3.5 flex gap-2 md:gap-3 items-center ${lang === "ar" ? "flex-row-reverse" : ""}`}>
                  <Search className={`w-5 h-5 md:w-6 md:h-6 shrink-0 text-[#8b8c9a] ${lang === "ar" ? "ml-3" : "mr-0"}`} />
                  <p className="font-montserrat-light text-sm md:text-[16px] leading-[1.4] text-[#8b8c9a]">
                    {t("searchUniversities")}
                  </p>
                </div>

                {/* Bachelor's/Master's Tabs */}
                <div className="flex gap-2 md:gap-5">
                  <div className="flex-1 bg-[rgba(117,211,247,0.1)] border border-[#75d3f7] rounded-[10px] px-2 md:px-4 py-2 md:py-2.5 flex items-center justify-center">
                    <p className="font-montserrat-regular text-sm md:text-[18px] leading-[1.4] text-[#121c67] text-center">
                      {t("bachelors")} ({bachelorPrograms.length})
                    </p>
                  </div>
                  <div className="flex-1 border border-[#b1b2bf] rounded-[10px] px-2 md:px-4 py-2 md:py-2.5 flex items-center justify-center">
                    <p className="font-montserrat-regular text-sm md:text-[18px] leading-[1.4] text-[#65666f] text-center">
                      {t("masters")} ({masterPrograms.length})
                    </p>
                  </div>
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

          {/* Other Universities Section */}
          {otherUniversities.length > 0 && (
            <div className="mt-12 md:mt-20">
              <h2 className="font-montserrat-bold text-xl md:text-[34px] leading-[1.4] text-[#121c67] mb-4">
                {t("otherUniversitiesIn")} {university.country}{" "}
                {getCountryFlag(university.country) && "🇺🇸"}
              </h2>
              <div className="relative w-[84px] h-[10px] mb-8">
                <Image
                  src={figmaAssets.whyUsVector5}
                  alt=""
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
                {otherUniversities.map((uni: any) => (
                  <div
                    key={uni.id}
                    className="bg-white border-[5px] border-white rounded-xl overflow-hidden flex flex-col shadow-[0px_4px_40px_0px_rgba(82,96,206,0.12)]"
                  >
                    <div className="relative pb-[67px]">
                      <div className="h-[220px] -mb-[67px] relative rounded-xl overflow-hidden">
                        <div className="absolute inset-0">
                          <Image
                            src={
                              uni.image1 ||
                              uni.bannerUrl ||
                              figmaAssets.universityLogo1
                            }
                            alt={uni.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </div>
                      <div className="relative flex gap-1 h-[86px] px-6 items-center -mt-[67px] rounded-br-xl">
                        <div className="bg-[#5260ce] flex gap-1 h-[49px] items-center rounded-bl-[40px] rounded-br-xl rounded-tl-[40px]">
                          {(uni.logoUrl || uni.logo) && (
                            <div className="relative w-[76px] h-[76px] border-[5px] border-white rounded-full overflow-hidden shrink-0">
                              <Image
                                src={
                                  uni.logoUrl || uni.logo || figmaAssets.logo
                                }
                                alt={uni.name}
                                fill
                                className="object-contain p-2"
                                unoptimized
                              />
                            </div>
                          )}
                          <div className="px-4 py-6 h-[49px] flex items-center">
                            <p className="font-montserrat-bold text-[18px] leading-[1.4] text-white">
                              {uni.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-[10px] px-5 pt-4">
                      <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e] px-5">
                        {uni.description ||
                          uni.about ||
                          t("discoverWorldClassAcademics")}
                      </p>
                      <div className="flex gap-3 px-5">
                        <div className="bg-[rgba(117,211,247,0.1)] border border-[#75d3f7] rounded-lg px-2 py-1.5 flex gap-1 items-center">
                          <div className="relative w-6 h-6 shrink-0">
                            <Image
                              src={getCountryFlag(uni.country)}
                              alt="Location"
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                          <p className="font-montserrat-regular text-[18px] leading-[1.4] text-[#2e2e2e]">
                            {uni.country}
                          </p>
                        </div>
                        <div className="bg-[rgba(117,211,247,0.1)] border border-[#75d3f7] rounded-lg px-2 py-1.5 flex gap-1 items-center">
                          <div className="relative w-6 h-6 shrink-0">
                            <Image
                              src={getLanguageFlag(uni.language)}
                              alt="Language"
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                          <p className="font-montserrat-regular text-[18px] leading-[1.4] text-[#2e2e2e]">
                            {uni.language}
                          </p>
                        </div>
                      </div>
                      {uni.majors && uni.majors.length > 0 && (
                        <div className="px-5">
                          <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e] mb-2">
                            {t("keyMajors")}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {uni.majors.slice(0, 5).map((major: string) => (
                              <div
                                key={major}
                                className="bg-[rgba(117,211,247,0.2)] rounded-md px-2 py-1 h-[26px] flex items-center justify-center"
                              >
                                <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#121c67] text-center">
                                  {major}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="px-5 pb-5 pt-0">
                        <Button
                          className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-[16px] h-[48px] w-full rounded-xl"
                          asChild
                        >
                          <Link href={`/universities/${uni.slug}`}>
                            {t("viewDetails")}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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
