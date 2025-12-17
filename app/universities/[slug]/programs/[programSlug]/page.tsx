import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { figmaAssets } from "@/lib/figma-assets";
import { notFound } from "next/navigation";
import { Check, Search, CheckCircle } from "lucide-react";
import { getImageUrl, getImageUrlOrFallback } from "@/lib/image-utils";
import { ProgramRegisterButton } from "@/components/program-register-button";
import { tServer } from "@/lib/i18n";
import { cookies } from "next/headers";
import type { Language } from "@/lib/i18n";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

async function fetchProgram(slug: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/public/programs/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching program:", error);
    return null;
  }
}

async function fetchUniversityPrograms(universitySlug: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/public/universities/${universitySlug}/programs`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching university programs:", error);
    return [];
  }
}

async function fetchSimilarPrograms(
  programName: string,
  excludeId: string,
  universitySlug: string
) {
  try {
    // Fetch programs from public endpoint
    const response = await fetch(
      `${API_BASE_URL}/public/universities/${universitySlug}/programs`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    // Filter similar programs by name similarity
    const similar = data
      .filter(
        (p: any) =>
          p.id !== excludeId &&
          p.name.toLowerCase().includes(programName.toLowerCase().split(" ")[0])
      )
      .slice(0, 3);

    // If not enough similar programs, get from other universities
    if (similar.length < 3) {
      try {
        const allProgramsRes = await fetch(
          `${API_BASE_URL}/public/universities`,
          {
            next: { revalidate: 60 },
          }
        );
        if (allProgramsRes.ok) {
          const allUnis = await allProgramsRes.json();
          const allPrograms: any[] = [];

          if (allUnis.data && Array.isArray(allUnis.data)) {
            allUnis.data.forEach((uni: any) => {
              if (uni.programs && Array.isArray(uni.programs)) {
                allPrograms.push(
                  ...uni.programs.map((p: any) => ({
                    ...p,
                    university: {
                      id: uni.id,
                      name: uni.name,
                      slug: uni.slug,
                      country: uni.country,
                      logoUrl: uni.logoUrl || uni.logo,
                    },
                  }))
                );
              }
            });
          }

          const additional = allPrograms
            .filter(
              (p: any) =>
                p.id !== excludeId &&
                p.university?.slug !== universitySlug &&
                p.name
                  .toLowerCase()
                  .includes(programName.toLowerCase().split(" ")[0])
            )
            .slice(0, 3 - similar.length);

          return [...similar, ...additional].slice(0, 3);
        }
      } catch (error) {
        console.error("Error fetching additional similar programs:", error);
      }
    }

    return similar;
  } catch (error) {
    console.error("Error fetching similar programs:", error);
    return [];
  }
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string; programSlug: string }>;
}) {
  const { slug, programSlug } = await params;
  const program = await fetchProgram(programSlug);

  if (!program) {
    notFound();
  }
  
  // Get language from cookies (fallback to "en")
  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value as Language) || "en";
  const t = (key: string) => tServer(key, lang);

  const universityPrograms = await fetchUniversityPrograms(
    slug || program.university?.slug || ""
  );
  const similarPrograms = await fetchSimilarPrograms(
    program.name,
    program.id,
    slug || program.university?.slug || ""
  );

  // Safely parse JSON fields that might come as strings
  let coreSubjects: string[] = [];
  try {
    if (Array.isArray(program.coreSubjects)) {
      coreSubjects = program.coreSubjects;
    } else if (typeof program.coreSubjects === "string") {
      coreSubjects = JSON.parse(program.coreSubjects);
    }
  } catch {
    coreSubjects = [];
  }

  let programImages: string[] = [];
  try {
    if (Array.isArray(program.programImages)) {
      programImages = program.programImages;
    } else if (typeof program.programImages === "string") {
      programImages = JSON.parse(program.programImages);
    }
  } catch {
    programImages = [];
  }

  // Ensure we have valid image URLs - convert relative paths to full URLs
  programImages = programImages
    .filter((img) => img && typeof img === "string" && img.trim().length > 0)
    .map((img) => {
      const trimmed = img.trim();
      // If it's already a full URL, return as is, otherwise convert
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
      }
      return getImageUrl(trimmed);
    });

  // Group programs by department/specialization
  const programsByDepartment: Record<string, any[]> = {};
  universityPrograms.forEach((p: any) => {
    const dept = p.department || "Other";
    if (!programsByDepartment[dept]) {
      programsByDepartment[dept] = [];
    }
    programsByDepartment[dept].push(p);
  });

  // Count bachelor's and master's
  const bachelorCount = universityPrograms.filter(
    (p: any) =>
      p.degree?.toLowerCase().includes("bachelor") ||
      p.degree?.toLowerCase().includes("undergraduate")
  ).length;
  const masterCount = universityPrograms.filter(
    (p: any) =>
      p.degree?.toLowerCase().includes("master") ||
      p.degree?.toLowerCase().includes("graduate")
  ).length;

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      <Navbar />
      <main className="pt-0 md:pt-[100px] pb-16 md:pb-20">
        <div className="max-w-[1440px] mx-auto px-5">
          {/* Hero Banner - Exactly like image with overlay */}
          <div className="relative h-[500px] rounded-[24px] overflow-hidden mb-10">
            <div className="absolute inset-0">
              <Image
                src={getImageUrlOrFallback(
                  program.bannerImage || programImages?.[0],
                  figmaAssets.heroImage
                )}
                alt={program.name}
                fill
                className="object-cover"
                loading="eager"
                priority
                unoptimized
              />
            </div>
            {/* Overlay with Logo, Title, and Register Button - Exactly like image */}
            <div className="absolute inset-0 flex items-end pb-8 px-8">
              <div className="flex items-center justify-between w-full">
                {/* Left side - Circular Logo and Program Title */}
                <div className="flex gap-5 items-center">
                  {program.university?.logoUrl && (
                    <div className="relative w-[134px] h-[134px] border-[5px] border-white rounded-full overflow-hidden shrink-0 bg-white shadow-lg">
                      <Image
                        src={getImageUrlOrFallback(
                          program.university.logoUrl,
                          figmaAssets.logo
                        )}
                        alt={program.university.name}
                        fill
                        className="object-contain p-2"
                        loading="eager"
                        priority
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <h1 className="font-montserrat-bold text-[34px] leading-[1.4] text-white drop-shadow-lg">
                      {program.name}
                    </h1>
                    <p className="font-montserrat-regular text-[20px] leading-[1.4] text-white drop-shadow-lg">
                      {program.university?.name}
                    </p>
                  </div>
                </div>
                {/* Right side - Register Now Button */}
                <ProgramRegisterButton
                  programId={program.id}
                  universitySlug={slug}
                />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Specialization Information Card - Exactly like image */}
              <div className="bg-white border-[5px] border-white rounded-xl p-6 flex flex-col gap-5 shadow-[0px_4px_40px_0px_rgba(82,96,206,0.12)]">
                <h3 className="font-montserrat-bold text-[24px] leading-[1.4] text-[#5260ce]">
                  {t("specializationInformation")}
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-3">
                    <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                      {t("degreeOfStudy")}
                    </p>
                    <p className="font-montserrat-regular text-[18px] leading-[1.4] text-[#2e2e2e]">
                      {program.degree || program.studyYear || "N/A"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                      {t("studyPeriod")}
                    </p>
                    <p className="font-montserrat-regular text-[18px] leading-[1.4] text-[#2e2e2e]">
                      {program.duration || "N/A"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                      {t("tuitionFeesEstimated")}
                    </p>
                    <p className="font-montserrat-regular text-[18px] leading-[1.4] text-[#2e2e2e]">
                      {program.tuition || "N/A"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                      {t("programName")}
                    </p>
                    <p className="font-montserrat-regular text-[18px] leading-[1.4] text-[#2e2e2e]">
                      {program.name}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                      {t("languageOfInstruction")}
                    </p>
                    <p className="font-montserrat-regular text-[18px] leading-[1.4] text-[#2e2e2e]">
                      {program.language || "N/A"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                      {t("startOfStudy")}
                    </p>
                    <p className="font-montserrat-regular text-[18px] leading-[1.4] text-[#2e2e2e]">
                      {program.startDate || "N/A"}{" "}
                      {program.lastApplicationDate && t("lastDateForApplication")}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                      {t("studyTime")}
                    </p>
                    <p className="font-montserrat-regular text-[18px] leading-[1.4] text-[#2e2e2e]">
                      {program.classSchedule || "N/A"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                      {t("studyMethod")}
                    </p>
                    <p className="font-montserrat-regular text-[18px] leading-[1.4] text-[#2e2e2e]">
                      {program.studyMethod || t("undefined")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tour Gallery Card - Always show, exactly 5 images like image */}
              <div className="bg-white border-[5px] border-white rounded-xl p-6 flex flex-col gap-5 shadow-[0px_4px_40px_0px_rgba(82,96,206,0.12)]">
                <h3 className="font-montserrat-bold text-[24px] leading-[1.4] text-[#5260ce]">
                  {t("tourInsideDepartment")}
                </h3>
                <div className="flex gap-4">
                  {programImages.length > 0 ? (
                    programImages
                      .slice(0, 5)
                      .map((img: string, index: number) => (
                        <div
                          key={index}
                          className="flex-1 h-[130px] relative rounded-xl overflow-hidden bg-gray-100"
                        >
                          <Image
                            src={getImageUrlOrFallback(
                              img,
                              figmaAssets.heroImage
                            )}
                            alt={`Tour ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ))
                  ) : (
                    // Show placeholder images if none exist
                    Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex-1 h-[130px] relative rounded-xl overflow-hidden bg-gray-100"
                      >
                        <Image
                          src={figmaAssets.heroImage}
                          alt={`Tour ${index + 1}`}
                          fill
                          className="object-cover opacity-50"
                          unoptimized
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* About the Program Card */}
              {program.about && (
                <div className="bg-white border-[5px] border-white rounded-xl p-6 flex flex-col gap-5 shadow-[0px_4px_40px_0px_rgba(82,96,206,0.12)]">
                  <h3 className="font-montserrat-bold text-[24px] leading-[1.4] text-[#5260ce]">
                    {t("aboutTheProgram")}
                  </h3>
                  <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e] whitespace-pre-line">
                    {program.about}
                  </p>
                </div>
              )}

              {/* Core Subjects Card */}
              {coreSubjects.length > 0 && (
                <div className="bg-white border-[5px] border-white rounded-xl p-6 flex flex-col gap-5 shadow-[0px_4px_40px_0px_rgba(82,96,206,0.12)]">
                  <h3 className="font-montserrat-bold text-[24px] leading-[1.4] text-[#5260ce]">
                    {t("coreSubjects")}
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {coreSubjects.map((subject: string, index: number) => (
                      <p
                        key={index}
                        className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]"
                      >
                        • {subject}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Admission Requirements Card */}
              {program.university?.admissionRequirements &&
                Array.isArray(program.university.admissionRequirements) &&
                program.university.admissionRequirements.length > 0 && (
                  <div className="bg-white border-[5px] border-white rounded-xl p-6 flex flex-col gap-5 shadow-[0px_4px_40px_0px_rgba(82,96,206,0.12)]">
                    <h3 className="font-montserrat-bold text-[24px] leading-[1.4] text-[#5260ce]">
                      {t("admissionRequirements")}
                    </h3>
                    <div className="flex flex-col gap-2.5">
                      {program.university.admissionRequirements.map(
                        (req: string, index: number) => (
                          <p
                            key={index}
                            className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]"
                          >
                            • {req}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Available Services Card */}
              {program.university?.services &&
                Array.isArray(program.university.services) &&
                program.university.services.length > 0 && (
                  <div className="bg-white border-[5px] border-white rounded-xl p-6 flex flex-col gap-5 shadow-[0px_4px_40px_0px_rgba(82,96,206,0.12)]">
                    <h3 className="font-montserrat-bold text-[24px] leading-[1.4] text-[#5260ce]">
                      {t("availableServicesViaUniVolta")}
                    </h3>
                    <div className="flex flex-col gap-2.5">
                      {program.university.services.map(
                        (service: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-600 shrink-0" />
                            <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                              {service}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Right Column - Sidebar - Exactly like image */}
            <div className="lg:col-span-1">
              <div className="bg-white border-[5px] border-white rounded-xl p-6 flex flex-col gap-6 sticky top-[120px] shadow-[0px_4px_40px_0px_rgba(82,96,206,0.12)]">
                <h3 className="font-montserrat-bold text-[24px] leading-[1.4] text-[#5260ce]">
                  {t("availableMajors")}{" "}
                  <span className="font-montserrat-regular text-[20px]">
                    ({universityPrograms.length})
                  </span>
                </h3>

                {/* Search Bar */}
                <div className="bg-gray-50 border border-[#e0e6f1] rounded-xl px-3.5 py-3.5 flex gap-3 items-center">
                  <Search className="w-5 h-5 text-[#8b8c9a] shrink-0" />
                  <input
                    type="text"
                    placeholder={t("searchPrograms")}
                    className="flex-1 bg-transparent border-none outline-none font-montserrat-light text-[16px] leading-[1.4] text-[#8b8c9a] placeholder:text-[#8b8c9a]"
                  />
                </div>

                {/* Bachelor's/Master's Tabs */}
                <div className="flex gap-5">
                  <div className="flex-1 bg-[rgba(117,211,247,0.1)] border border-[#75d3f7] rounded-[10px] px-4 py-2.5 flex items-center justify-center">
                    <p className="font-montserrat-regular text-[18px] leading-[1.4] text-[#121c67]">
                      {t("bachelors")} ({bachelorCount})
                    </p>
                  </div>
                  <div className="flex-1 border border-[#b1b2bf] rounded-[10px] px-4 py-2.5 flex items-center justify-center">
                    <p className="font-montserrat-regular text-[18px] leading-[1.4] text-[#65666f]">
                      {t("masters")} ({masterCount})
                    </p>
                  </div>
                </div>

                {/* Programs by Department */}
                <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
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
                          {programs.map((p: any) => (
                            <Link
                              key={p.id}
                              href={`/universities/${slug}/programs/${p.slug}`}
                              className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                                p.id === program.id
                                  ? "bg-[rgba(82,96,206,0.1)]"
                                  : ""
                              }`}
                            >
                              <span
                                className={`font-montserrat-regular text-[14px] ${
                                  p.id === program.id
                                    ? "text-[#5260ce] font-semibold"
                                    : "text-[#2e2e2e]"
                                }`}
                              >
                                {p.name}
                              </span>
                              {p.tuition && (
                                <span className="font-montserrat-semibold text-[14px] text-[#5260ce]">
                                  {p.tuition}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Similar Options Section - Exactly like image */}
          {similarPrograms.length > 0 && (
            <div className="mt-20">
              <div className="flex items-center gap-3 mb-8">
                <h2 className="font-montserrat-bold text-[34px] leading-[1.4] text-[#121c67]">
                  {t("similarOptionsAtOtherUniversities")}
                </h2>
                <div className="relative w-8 h-8">
                  <Image
                    src={figmaAssets.whyUsVector5}
                    alt=""
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {similarPrograms.map((similar: any) => (
                  <div
                    key={similar.id}
                    className="bg-white border-[5px] border-white rounded-xl p-6 flex flex-col gap-4 shadow-[0px_4px_40px_0px_rgba(82,96,206,0.12)]"
                  >
                    <div className="flex items-center gap-3">
                      {similar.university?.logoUrl && (
                        <div className="relative w-16 h-16 border-2 border-gray-200 rounded-full overflow-hidden shrink-0">
                          <Image
                            src={getImageUrlOrFallback(
                              similar.university.logoUrl,
                              figmaAssets.logo
                            )}
                            alt={similar.university.name}
                            fill
                            className="object-contain p-1"
                            unoptimized
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-montserrat-semibold text-[16px] text-[#121c67]">
                          {similar.university?.name}
                        </p>
                        <p className="font-montserrat-regular text-[14px] text-gray-600">
                          {similar.university?.country}
                        </p>
                      </div>
                    </div>
                    <p className="font-montserrat-semibold text-[18px] text-[#121c67]">
                      {similar.name}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="bg-[rgba(117,211,247,0.1)] border border-[#75d3f7] rounded-lg px-2 py-1 text-sm">
                        {similar.university?.country}
                      </span>
                      <span className="bg-[rgba(117,211,247,0.1)] border border-[#75d3f7] rounded-lg px-2 py-1 text-sm">
                        {similar.language}
                      </span>
                      {similar.tuition && (
                        <span className="bg-[rgba(117,211,247,0.1)] border border-[#75d3f7] rounded-lg px-2 py-1 text-sm font-semibold text-[#5260ce]">
                          {similar.tuition}
                        </span>
                      )}
                    </div>
                    <Button
                      className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-[14px] h-[40px] w-full rounded-lg mt-2"
                      asChild
                    >
                      <Link
                        href={`/universities/${
                          similar.university?.slug || slug
                        }/programs/${similar.slug}`}
                      >
                        {t("viewDetails")}
                      </Link>
                    </Button>
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
