import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { figmaAssets } from "@/lib/figma-assets";
import { notFound } from "next/navigation";
import {
  Check,
  Search,
  Clock,
  Globe,
  DollarSign,
  BookOpen,
  Calendar,
  GraduationCap,
  Users,
  Trophy,
  ArrowRight,
  ChevronRight,
  MapPin,
  Layers,
  Star,
} from "lucide-react";
import { getImageUrl, getImageUrlOrFallback } from "@/lib/image-utils";
import { ProgramRegisterButton } from "@/components/program-register-button";
import { tServer } from "@/lib/i18n";
import { cookies } from "next/headers";
import type { Language } from "@/lib/i18n";
import {
  formatDegreeLabel,
  formatDurationLabel,
  formatTuitionPeriod,
  formatInstructionLanguages,
  formatFacultyDepartmentLabel,
  formatStudyMethodLabel,
  formatClassScheduleLabel,
  formatCountryLabel,
  localizeEnglishDatePhrases,
} from "@/lib/university-program-display";
import { API_BASE_URL } from "@/lib/constants";
import { pickLocalizedStringArray } from "@/lib/localized";

async function fetchProgram(slug: string) {
  try {
    const cookieStore = await cookies();
    const lang = cookieStore.get("language")?.value === "ar" ? "ar" : "en";
    const response = await fetch(`${API_BASE_URL}/public/programs/${slug}`, {
      cache: "no-store",
      headers: { "X-Locale": lang, "Accept-Language": lang },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchUniversityPrograms(universitySlug: string) {
  try {
    const cookieStore = await cookies();
    const lang = cookieStore.get("language")?.value === "ar" ? "ar" : "en";
    const response = await fetch(
      `${API_BASE_URL}/public/universities/${universitySlug}/programs`,
      { cache: "no-store", headers: { "X-Locale": lang, "Accept-Language": lang } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function fetchSimilarPrograms(
  programName: string,
  excludeId: string,
  universitySlug: string,
  lang: Language
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/public/universities/${universitySlug}/programs`,
      { cache: "no-store", headers: { "X-Locale": lang, "Accept-Language": lang } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data)) return [];

    const similar = data
      .filter(
        (p: any) =>
          p.id !== excludeId &&
          p.name.toLowerCase().includes(programName.toLowerCase().split(" ")[0])
      )
      .slice(0, 3);

    if (similar.length < 3) {
      try {
        const allProgramsRes = await fetch(`${API_BASE_URL}/public/universities`, {
          cache: "no-store",
          headers: { "X-Locale": lang, "Accept-Language": lang },
        });
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
                      bannerUrl: uni.bannerUrl,
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
                p.name.toLowerCase().includes(programName.toLowerCase().split(" ")[0])
            )
            .slice(0, 3 - similar.length);
          return [...similar, ...additional].slice(0, 3);
        }
      } catch {}
    }
    return similar;
  } catch {
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

  if (!program) notFound();

  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value as Language) || "en";
  const t = (key: string) => tServer(key, lang);

  const universityPrograms = await fetchUniversityPrograms(
    slug || program.university?.slug || ""
  );
  const similarPrograms = await fetchSimilarPrograms(
    program.name,
    program.id,
    slug || program.university?.slug || "",
    lang
  );

  const coreSubjects = pickLocalizedStringArray(program.coreSubjects, lang);

  let programImages: string[] = [];
  try {
    programImages = Array.isArray(program.programImages)
      ? program.programImages
      : JSON.parse(program.programImages || "[]");
  } catch { programImages = []; }

  programImages = programImages
    .filter((img) => img && typeof img === "string" && img.trim().length > 0)
    .map((img) => {
      const t2 = img.trim();
      return t2.startsWith("http://") || t2.startsWith("https://") ? t2 : getImageUrl(t2);
    });

  const programsByDepartment: Record<string, any[]> = {};
  universityPrograms.forEach((p: any) => {
    const deptRaw = p.department || "Other";
    if (!programsByDepartment[deptRaw]) programsByDepartment[deptRaw] = [];
    programsByDepartment[deptRaw].push(p);
  });

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

  // Info stat tiles for the specialization card
  const infoStats = [
    {
      icon: GraduationCap,
      label: t("degreeOfStudy"),
      value: program.degree
        ? formatDegreeLabel(program.degree, t)
        : program.studyYear != null
          ? String(program.studyYear)
          : t("notAvailable"),
    },
    {
      icon: Clock,
      label: t("studyPeriod"),
      value: formatDurationLabel(program.duration, t) || t("notAvailable"),
    },
    {
      icon: DollarSign,
      label: t("tuitionFeesEstimated"),
      value: formatTuitionPeriod(program.tuition, t) || t("notAvailable"),
    },
    { icon: BookOpen, label: t("programName"), value: program.name },
    {
      icon: Globe,
      label: t("languageOfInstruction"),
      value: formatInstructionLanguages(program.language, t) || t("notAvailable"),
    },
    {
      icon: Calendar,
      label: t("startOfStudy"),
      value: localizeEnglishDatePhrases(program.startDate, lang) || t("notAvailable"),
    },
    {
      icon: Clock,
      label: t("studyTime"),
      value: formatClassScheduleLabel(program.classSchedule, t) || t("notAvailable"),
    },
    {
      icon: Layers,
      label: t("studyMethod"),
      value: formatStudyMethodLabel(program.studyMethod, t) || t("undefined"),
    },
  ];

  const heroBanner =
    getImageUrlOrFallback(
      program.bannerImage || programImages?.[0],
      figmaAssets.heroImage
    );

  return (
    <div className="min-h-screen bg-[#f9fafe] pb-16 md:pb-0">
      <Navbar />

      <main className="pt-0 md:pt-[110px] pb-16 md:pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-5">

          {/* ── HERO BANNER ──────────────────────────────────────────────── */}
          <div className="relative h-[280px] md:h-[520px] rounded-[20px] md:rounded-[32px] overflow-hidden mb-8 md:mb-10 animate-hero-reveal shadow-[0_24px_80px_rgba(82,96,206,0.2)]">
            <Image
              src={heroBanner}
              alt={program.name}
              fill
              className="object-cover"
              priority
              unoptimized
            />

            {/* Layered gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#121c67]/90 via-[#121c67]/55 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121c67]/80 via-transparent to-transparent" />

            {/* Dot pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
            />

            {/* Floating orb */}
            <div className="absolute top-10 right-20 w-48 h-48 rounded-full bg-[#75d3f7]/15 blur-3xl" />

            {/* Top: breadcrumb + badges */}
            <div className="absolute top-4 md:top-6 left-5 md:left-8 right-5 md:right-8 flex items-start justify-between">
              {/* Breadcrumb */}
              <nav className="hidden md:flex items-center gap-1.5 text-white/60 text-xs font-montserrat-regular animate-fade-up">
                <Link href="/" className="hover:text-white/90 transition-colors">{t("breadcrumbHome")}</Link>
                <ChevronRight className="w-3 h-3" />
                <Link href="/universities" className="hover:text-white/90 transition-colors">{t("breadcrumbUniversities")}</Link>
                <ChevronRight className="w-3 h-3" />
                <Link href={`/universities/${slug}`} className="hover:text-white/90 transition-colors">{program.university?.name}</Link>
                <ChevronRight className="w-3 h-3" />
                <Link href={`/universities/${slug}/programs`} className="hover:text-white/90 transition-colors">{t("breadcrumbPrograms")}</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-white/90 truncate max-w-[200px]">{program.name}</span>
              </nav>

              {/* Right badges */}
              <div className="flex items-center gap-2 animate-fade-up ml-auto">
                {program.degree && (
                  <Badge className="bg-[#5260ce]/80 text-white text-xs font-montserrat-semibold backdrop-blur-sm border-0 shadow-md px-3 py-1.5">
                    <GraduationCap className="w-3 h-3 mr-1.5" />
                    {formatDegreeLabel(program.degree, t)}
                  </Badge>
                )}
                {program.language && (
                  <Badge className="bg-white/20 text-white text-xs font-montserrat-semibold backdrop-blur-sm border border-white/30 px-3 py-1.5">
                    <Globe className="w-3 h-3 mr-1.5" />
                    {formatInstructionLanguages(program.language, t)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Bottom: logo + title + CTA */}
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 flex items-end justify-between gap-4">
              {/* Left: logo + title */}
              <div className="flex items-end gap-4 md:gap-5 flex-1 min-w-0">
                {program.university?.logoUrl && (
                  <div className="relative w-16 h-16 md:w-[110px] md:h-[110px] border-4 border-white rounded-2xl overflow-hidden shrink-0 bg-white shadow-xl animate-fade-up">
                    <Image
                      src={getImageUrlOrFallback(program.university.logoUrl, figmaAssets.logo)}
                      alt={program.university.name}
                      fill
                      className="object-contain p-1.5 md:p-2"
                      priority
                      unoptimized
                    />
                  </div>
                )}
                <div className="pb-1 flex-1 min-w-0">
                  <p className="text-white/70 text-xs md:text-sm font-montserrat-regular mb-1 animate-fade-up">
                    {program.university?.name}
                    {program.university?.country &&
                      ` · ${formatCountryLabel(program.university.country, lang)}`}
                  </p>
                  <h1 className="font-montserrat-bold text-xl md:text-[38px] leading-tight text-white drop-shadow-lg line-clamp-2 animate-fade-up-d100">
                    {program.name}
                  </h1>
                  {program.tuition && (
                    <p className="text-[#75d3f7] text-sm md:text-base font-montserrat-semibold mt-1 animate-fade-up-d200">
                      {formatTuitionPeriod(program.tuition, t)}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: register button */}
              <div className="hidden md:block shrink-0 animate-fade-up-d200">
                <ProgramRegisterButton programId={program.id} universitySlug={slug} />
              </div>
            </div>
          </div>

          {/* Mobile register button */}
          <div className="md:hidden mb-5">
            <ProgramRegisterButton programId={program.id} universitySlug={slug} />
          </div>

          {/* ── MAIN LAYOUT ──────────────────────────────────────────────── */}
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">

            {/* ══ LEFT / MAIN COLUMN ══ */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">

              {/* ─ Specialization Info ─ */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-7 shadow-sm animate-fade-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-[rgba(82,96,206,0.1)] flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-[#5260ce]" />
                  </div>
                  <h2 className="font-montserrat-bold text-xl md:text-[24px] text-[#121c67] section-title-accent pb-1">
                    {t("specializationInformation")}
                  </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {infoStats.map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="bg-[#f9fafe] border border-gray-100 rounded-xl p-3 md:p-4 flex flex-col gap-2 hover:border-[#5260ce]/20 hover:shadow-sm transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[rgba(82,96,206,0.08)] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#5260ce]" />
                      </div>
                      <p className="font-montserrat-regular text-xs text-[#8b8c9a] leading-tight">{label}</p>
                      <p className="font-montserrat-semibold text-sm text-[#121c67] leading-snug">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─ Tour Gallery ─ */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-7 shadow-sm animate-fade-up-d100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-[rgba(82,96,206,0.1)] flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-[#5260ce]" />
                  </div>
                  <h2 className="font-montserrat-bold text-xl md:text-[24px] text-[#121c67] section-title-accent pb-1">
                    {t("tourInsideDepartment")}
                  </h2>
                </div>

                {/* Gallery grid: first image large, rest smaller */}
                {programImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {programImages.slice(0, 5).map((img, i) => (
                      <div
                        key={i}
                        className={`relative overflow-hidden rounded-xl group ${i === 0 ? "col-span-2 md:col-span-2 row-span-2 h-52 md:h-64" : "h-24 md:h-[120px]"}`}
                      >
                        <Image
                          src={getImageUrlOrFallback(img, figmaAssets.heroImage)}
                          alt={t("tourImageAlt").replace("{n}", String(i + 1))}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>
                    ))}
                    {/* Fill with placeholders if needed */}
                    {Array.from({ length: Math.max(0, 5 - programImages.length) }).map((_, i) => (
                      <div
                        key={`ph-${i}`}
                        className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#f0f4ff] to-[#e8eaf6] ${programImages.length === 0 && i === 0 ? "col-span-2 md:col-span-2 row-span-2 h-52 md:h-64" : "h-24 md:h-[120px]"}`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-[#5260ce]/20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#f0f4ff] to-[#e8eaf6] ${i === 0 ? "col-span-2 md:col-span-2 row-span-2 h-52 md:h-64" : "h-24 md:h-[120px]"}`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-[#5260ce]/20" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ─ About the Program ─ */}
              {program.about && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-7 shadow-sm animate-fade-up-d200">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-[rgba(82,96,206,0.1)] flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-[#5260ce]" />
                    </div>
                    <h2 className="font-montserrat-bold text-xl md:text-[24px] text-[#121c67] section-title-accent pb-1">
                      {t("aboutTheProgram")}
                    </h2>
                  </div>
                  <p className="font-montserrat-regular text-sm md:text-base text-[#65666f] leading-relaxed whitespace-pre-line">
                    {program.about}
                  </p>
                </div>
              )}

              {/* ─ Core Subjects ─ */}
              {coreSubjects.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-7 shadow-sm animate-fade-up-d200">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-[rgba(82,96,206,0.1)] flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5 text-[#5260ce]" />
                    </div>
                    <h2 className="font-montserrat-bold text-xl md:text-[24px] text-[#121c67] section-title-accent pb-1">
                      {t("coreSubjects")}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {coreSubjects.map((subject, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#f9fafe] border border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#5260ce] to-[#75d3f7] flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-white text-[10px] font-montserrat-bold">{i + 1}</span>
                        </div>
                        <p className="font-montserrat-regular text-sm text-[#2e2e2e] leading-relaxed">{subject}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─ Admission Requirements ─ */}
              {program.university?.admissionRequirements &&
                Array.isArray(program.university.admissionRequirements) &&
                program.university.admissionRequirements.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-7 shadow-sm animate-fade-up-d300">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-[rgba(82,96,206,0.1)] flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5 text-[#5260ce]" />
                    </div>
                    <h2 className="font-montserrat-bold text-xl md:text-[24px] text-[#121c67] section-title-accent pb-1">
                      {t("admissionRequirements")}
                    </h2>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {program.university.admissionRequirements.map((req: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#f9fafe] border border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                        <p className="font-montserrat-regular text-sm text-[#2e2e2e] leading-relaxed">{req}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─ Available Services ─ */}
              {program.university?.services &&
                Array.isArray(program.university.services) &&
                program.university.services.length > 0 && (
                <div className="bg-gradient-to-br from-[#121c67] to-[#5260ce] rounded-2xl p-5 md:p-7 shadow-sm animate-fade-up-d300">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="font-montserrat-bold text-xl md:text-[24px] text-white">
                      {t("availableServicesViaUniVolta")}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {program.university.services.map((service: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/15">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                        <p className="font-montserrat-regular text-sm text-white/90">{service}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ══ RIGHT SIDEBAR ══ */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm lg:sticky lg:top-[130px]">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-montserrat-regular text-[#5260ce] mb-0.5">{program.university?.name}</p>
                    <h3 className="font-montserrat-bold text-lg text-[#121c67]">
                      {t("availableMajors")}
                      <span className="text-sm font-montserrat-regular text-[#8b8c9a] ml-1.5">({universityPrograms.length})</span>
                    </h3>
                  </div>
                </div>

                {/* Search */}
                <div className="bg-[#f9fafe] border border-[#e0e6f1] rounded-xl px-3 py-2.5 flex gap-2.5 items-center mb-4">
                  <Search className="w-4 h-4 text-[#8b8c9a] shrink-0" />
                  <input
                    type="text"
                    placeholder={t("searchPrograms")}
                    className="flex-1 bg-transparent border-none outline-none font-montserrat-regular text-sm text-[#2e2e2e] placeholder:text-[#8b8c9a]"
                  />
                </div>

                {/* Degree Tabs */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-[rgba(82,96,206,0.08)] border border-[#5260ce]/20 rounded-xl px-3 py-2.5 flex flex-col items-center">
                    <span className="font-montserrat-bold text-lg text-[#5260ce] leading-none">{bachelorCount}</span>
                    <span className="font-montserrat-regular text-xs text-[#5260ce]/70 mt-0.5">{t("bachelors")}</span>
                  </div>
                  <div className="bg-[#f9fafe] border border-gray-100 rounded-xl px-3 py-2.5 flex flex-col items-center">
                    <span className="font-montserrat-bold text-lg text-[#121c67] leading-none">{masterCount}</span>
                    <span className="font-montserrat-regular text-xs text-[#8b8c9a] mt-0.5">{t("masters")}</span>
                  </div>
                </div>

                {/* Programs list */}
                <div className="flex flex-col gap-0.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                  {Object.entries(programsByDepartment).map(([deptRaw, programs]) => (
                    <div key={deptRaw} className="mb-3">
                      <p className="font-montserrat-semibold text-xs text-[#8b8c9a] uppercase tracking-wider px-2 mb-1.5">
                        {(deptRaw === "Other" ? t("otherDepartment") : formatFacultyDepartmentLabel(deptRaw, lang))} · {programs.length}
                      </p>
                      <div className="flex flex-col gap-0.5">
                        {programs.map((p: any) => {
                          const isActive = p.id === program.id;
                          return (
                            <Link
                              key={p.id}
                              href={`/universities/${slug}/programs/${p.slug}`}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                                isActive
                                  ? "bg-[rgba(82,96,206,0.08)] border-l-[3px] border-[#5260ce]"
                                  : "hover:bg-gray-50 border-l-[3px] border-transparent"
                              }`}
                            >
                              <span className={`font-montserrat-regular text-sm leading-snug ${isActive ? "text-[#5260ce] font-semibold" : "text-[#2e2e2e]"}`}>
                                {p.name}
                              </span>
                              {p.tuition ? (
                                <span className="font-montserrat-semibold text-xs text-[#5260ce] shrink-0 ml-2">{formatTuitionPeriod(p.tuition, t)}</span>
                              ) : (
                                isActive && <ArrowRight className="w-3.5 h-3.5 text-[#5260ce] shrink-0 ml-2" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Apply CTA */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold h-11 rounded-xl shadow-[0_4px_16px_rgba(82,96,206,0.3)] hover:shadow-[0_6px_20px_rgba(82,96,206,0.4)] transition-all group" asChild>
                    <Link href={`/universities/${slug}/programs`} className="flex items-center justify-center gap-2">
                      {t("viewAllPrograms")}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── SIMILAR PROGRAMS ──────────────────────────────────────────── */}
          {similarPrograms.length > 0 && (
            <div className="mt-14 md:mt-20">
              <div className="flex items-end gap-4 mb-8">
                <div>
                  <p className="text-sm font-montserrat-regular text-[#5260ce] mb-1">{t("discoverMore")}</p>
                  <h2 className="font-montserrat-bold text-2xl md:text-[34px] text-[#121c67] leading-tight section-title-accent pb-1">
                    {t("similarOptionsAtOtherUniversities")}
                  </h2>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {similarPrograms.map((similar: any) => {
                  const simLogo   = similar.university?.logoUrl;
                  const simBanner = similar.university?.bannerUrl || figmaAssets.heroImage;
                  return (
                    <Card key={similar.id} className="group overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-400 hover:-translate-y-2 bg-white h-full flex flex-col">
                      {/* Banner */}
                      <div className="relative h-48 overflow-hidden shrink-0">
                        <Image
                          src={getImageUrlOrFallback(simBanner, figmaAssets.heroImage)}
                          alt={similar.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(18,28,103,0.75)] via-[rgba(18,28,103,0.25)] to-transparent" />

                        {/* Degree badge */}
                        {similar.degree && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-[#5260ce]/90 text-white text-xs font-montserrat-semibold shadow-sm border-0">
                              <GraduationCap className="w-3 h-3 mr-1" />{formatDegreeLabel(similar.degree, t)}
                            </Badge>
                          </div>
                        )}

                        {/* Logo */}
                        {simLogo && (
                          <div className="absolute bottom-3 left-4">
                            <div className="w-12 h-12 rounded-xl bg-white shadow-lg p-1.5 overflow-hidden">
                              <div className="relative w-full h-full">
                                <Image src={getImageUrlOrFallback(simLogo, figmaAssets.logo)} alt={similar.university?.name} fill className="object-contain" unoptimized />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Program name overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 pt-8">
                          <h3 className={`font-montserrat-bold text-base text-white leading-tight line-clamp-2 ${simLogo ? "pl-16" : ""}`}>
                            {similar.name}
                          </h3>
                        </div>
                      </div>

                      <CardContent className="pt-4 pb-2 px-5 flex-1 flex flex-col gap-3">
                        {/* University info */}
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#5260ce] shrink-0" />
                          <span className="text-xs font-montserrat-regular text-[#65666f] truncate">
                            {similar.university?.name}
                            {similar.university?.country && ` · ${similar.university.country}`}
                          </span>
                        </div>

                        {/* Stats badges */}
                        <div className="flex gap-2 flex-wrap">
                          {similar.duration && (
                            <Badge variant="outline" className="border-[#5260ce]/30 text-[#2e2e2e] bg-[rgba(82,96,206,0.06)] text-xs font-montserrat-regular gap-1 rounded-full">
                              <Clock className="w-3 h-3 text-[#5260ce]" />{formatDurationLabel(similar.duration, t)}
                            </Badge>
                          )}
                          {similar.language && (
                            <Badge variant="outline" className="border-[#75d3f7] text-[#2e2e2e] bg-[rgba(117,211,247,0.08)] text-xs font-montserrat-regular gap-1 rounded-full">
                              <Globe className="w-3 h-3 text-[#5260ce]" />{formatInstructionLanguages(similar.language, t)}
                            </Badge>
                          )}
                          {similar.tuition && (
                            <Badge className="bg-[rgba(82,96,206,0.1)] text-[#5260ce] text-xs font-montserrat-semibold border-0 rounded-full">
                              {formatTuitionPeriod(similar.tuition, t)}
                            </Badge>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="pt-3 pb-5 px-5">
                        <Button
                          className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm h-11 rounded-xl transition-all duration-300 hover:shadow-[0_8px_24px_rgba(82,96,206,0.35)] group/btn"
                          asChild
                        >
                          <Link
                            href={`/universities/${similar.university?.slug || slug}/programs/${similar.slug}`}
                            className="flex items-center justify-center gap-2"
                          >
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
