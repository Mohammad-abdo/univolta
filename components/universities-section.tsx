"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { figmaAssets } from "@/lib/figma-assets";
import { API_BASE_URL } from "@/lib/constants";
import {
  MapPin,
  Globe,
  ChevronDown,
  Search,
  Trophy,
  Users,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { t, getLanguage, type Language } from "@/lib/i18n";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

type University = {
  id: string;
  name: string;
  slug: string;
  country: string;
  city: string;
  language: string;
  description?: string | null;
  about?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  image1?: string | null;
  image2?: string | null;
  majors?: string[];
  worldRanking?: number | null;
  studentsNumber?: string | null;
};

// ── Skeleton card shown while loading ──────────────────────────────────────
function UniversityCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <Skeleton className="h-52 w-full rounded-none" />
      <CardContent className="pt-5 pb-3 space-y-3">
        <Skeleton className="h-5 w-3/4" />
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

// ── Professional University Card ───────────────────────────────────────────
function UniversityCard({
  university,
  isRTL,
}: {
  university: University;
  index?: number;
  isRTL: boolean;
}) {
  const bannerSrc =
    university.bannerUrl ||
    university.image1 ||
    figmaAssets.universityLogo1;

  return (
    <Card className="group overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-400 hover:-translate-y-2 bg-white h-full flex flex-col">
        {/* ── Banner image ── */}
        <div className="relative h-52 overflow-hidden shrink-0">
          <Image
            src={bannerSrc}
            alt={university.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(18,28,103,0.75)] via-[rgba(18,28,103,0.25)] to-transparent" />

          {/* Country flag badge – top-right */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/90 text-[#121c67] hover:bg-white font-montserrat-semibold text-xs shadow-sm">
              {university.country}
            </Badge>
          </div>

          {/* World Ranking badge – top-left */}
          {university.worldRanking && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-[#5260ce]/90 text-white hover:bg-[#5260ce] text-xs font-montserrat-semibold shadow-sm">
                <Trophy className="w-3 h-3 mr-1" />
                #{university.worldRanking} World
              </Badge>
            </div>
          )}

          {/* University logo – bottom-left */}
          {university.logoUrl && (
            <div className="absolute bottom-3 left-4">
              <div className="w-14 h-14 rounded-xl bg-white shadow-lg p-1.5 overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src={university.logoUrl}
                    alt={`${university.name} logo`}
                    fill
                    className="object-contain p-0.5"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          )}

          {/* University name on image */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pt-8">
            <h3
              className={`font-montserrat-bold text-lg text-white leading-tight line-clamp-2 ${
                university.logoUrl ? "pl-16" : ""
              }`}
            >
              {university.name}
            </h3>
          </div>
        </div>

        {/* ── Card body ── */}
        <CardContent className="pt-4 pb-2 px-5 flex-1 flex flex-col gap-3">
          {/* Location & Language badges */}
          <div
            className={`flex gap-2 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <Badge
              variant="outline"
              className="border-[#75d3f7] text-[#2e2e2e] bg-[rgba(117,211,247,0.08)] text-xs font-montserrat-regular gap-1 rounded-full"
            >
              <MapPin className="w-3 h-3 text-[#5260ce]" />
              {university.city}
            </Badge>
            <Badge
              variant="outline"
              className="border-[#5260ce]/30 text-[#2e2e2e] bg-[rgba(82,96,206,0.06)] text-xs font-montserrat-regular gap-1 rounded-full"
            >
              <Globe className="w-3 h-3 text-[#5260ce]" />
              {university.language}
            </Badge>
            {university.studentsNumber && (
              <Badge
                variant="outline"
                className="border-gray-200 text-[#65666f] text-xs font-montserrat-regular gap-1 rounded-full"
              >
                <Users className="w-3 h-3" />
                {university.studentsNumber}
              </Badge>
            )}
          </div>

          {/* Description */}
          <p
            className={`text-sm font-montserrat-regular text-[#65666f] leading-relaxed line-clamp-2 flex-1 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {university.description ||
              university.about ||
              t("discoverWorldClassAcademics")}
          </p>

          {/* Majors / programs */}
          {university.majors && university.majors.length > 0 && (
            <div>
              <div
                className={`flex items-center gap-1 mb-1.5 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#5260ce]" />
                <span className="text-xs font-montserrat-semibold text-[#5260ce]">
                  {t("keyMajors")}
                </span>
              </div>
              <div className={`flex flex-wrap gap-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                {university.majors.slice(0, 5).map((major, i) => (
                  <Badge
                    key={i}
                    className="bg-[rgba(82,96,206,0.1)] text-[#5260ce] hover:bg-[rgba(82,96,206,0.18)] text-xs font-montserrat-regular border-0 rounded-md h-auto py-1"
                  >
                    {major}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        {/* ── CTA footer ── */}
        <CardFooter className="pt-3 pb-5 px-5">
          <Button
            className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm h-11 rounded-xl transition-all duration-300 hover:shadow-[0_8px_24px_rgba(82,96,206,0.35)] group/btn"
            asChild
          >
            <Link
              href={`/universities/${university.slug}`}
              className={`flex items-center justify-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {t("viewDetails")}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
  );
}

// ── Section header with gradient banner ──────────────────────────────────
function SectionBanner({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="relative h-[200px] md:h-[320px] rounded-2xl overflow-hidden mb-8 md:mb-10">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#121c67] via-[#5260ce] to-[#75d3f7]" />

      {/* Decorative pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M40 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20S40 51.046 40 40zm-40 0c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20S0 51.046 0 40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating stat pills */}
      <div className="absolute inset-0 flex items-end justify-end p-6 gap-3 pointer-events-none">
        {[
          { value: "150+", label: "Students" },
          { value: "50+", label: "Universities" },
          { value: "30+", label: "Countries" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="hidden md:flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30"
          >
            <span className="font-montserrat-bold text-white text-xl leading-none">
              {stat.value}
            </span>
            <span className="font-montserrat-regular text-white/80 text-xs mt-0.5">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Centred heading */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <p className="font-montserrat-regular text-white/70 text-sm mb-2">
          UniVolta
        </p>
        <h2 className="font-montserrat-bold text-2xl md:text-[38px] leading-tight text-white max-w-2xl">
          {t("listOfInternationalUniversities")}
        </h2>
      </div>
    </div>
  );
}

// ── Filter / search bar ──────────────────────────────────────────────────
function FilterBar({ isRTL }: { isRTL: boolean }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-[0px_4px_40px_0px_rgba(82,96,206,0.10)] border border-gray-100 p-4 md:p-5 mb-8 md:mb-10 flex flex-col md:flex-row gap-3 ${
        isRTL ? "md:flex-row-reverse" : ""
      }`}
    >
      {/* Country */}
      <FilterSelect label={t("country")} isRTL={isRTL} />
      {/* Language */}
      <FilterSelect label={t("languageOfStudy")} isRTL={isRTL} />
      {/* Specialisation */}
      <FilterSelect label={t("fieldOfSpecialisation")} isRTL={isRTL} />

      {/* Search input + button */}
      <div
        className={`flex gap-2 w-full md:w-auto ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div
          className={`flex-1 md:w-[260px] bg-gray-50 border border-gray-200 rounded-xl h-[48px] px-3.5 flex items-center gap-2.5 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <Search className="w-4 h-4 text-[#8b8c9a] shrink-0" />
          <span className="text-[#8b8c9a] text-sm font-montserrat-light truncate">
            {t("searchUniversitiesPlaceholder")}
          </span>
        </div>
        <Button
          className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm h-[48px] px-5 rounded-xl shrink-0 hover:shadow-[0_8px_24px_rgba(82,96,206,0.35)] transition-all duration-300"
          asChild
        >
          <Link href="/universities">{t("search")}</Link>
        </Button>
      </div>
    </div>
  );
}

function FilterSelect({ label, isRTL }: { label: string; isRTL: boolean }) {
  return (
    <div className="flex-1 min-w-0">
      <div
        className={`bg-gray-50 border border-gray-200 rounded-xl h-[48px] px-3.5 flex items-center justify-between gap-2 cursor-pointer hover:border-[#5260ce]/40 transition-colors ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        <span className="text-[#8b8c9a] text-sm font-montserrat-regular truncate">
          {label}
        </span>
        <ChevronDown className="w-4 h-4 text-[#8b8c9a] shrink-0" />
      </div>
    </div>
  );
}


// ── Main Section ──────────────────────────────────────────────────────────
export function UniversitiesSection() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage());

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const lang = getLanguage();
      if (lang !== currentLang) setCurrentLang(lang);
    }, 100);
    return () => clearInterval(interval);
  }, [currentLang]);

  const fetchUniversities = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/public/universities?limit=3`
      );
      if (res.ok) {
        const data = await res.json();
        setUniversities(data.data || []);
      }
    } catch {
      // stay with empty – skeleton fades naturally
    } finally {
      setLoading(false);
    }
  };

  const isRTL = currentLang === "ar";

  return (
    <section className="py-16 md:py-24 bg-[#f8f9ff] relative">
      {/* Background decoration */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(117,211,247,0.12) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-[1440px] mx-auto px-4 md:px-5">
        {/* Hero banner */}
        <ScrollReveal direction="fade">
          <SectionBanner isRTL={isRTL} />
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal direction="up" delay={100}>
          <FilterBar isRTL={isRTL} />
        </ScrollReveal>

        {/* 3-card grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {loading ? (
            <>
              <UniversityCardSkeleton />
              <UniversityCardSkeleton />
              <UniversityCardSkeleton />
            </>
          ) : universities.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[rgba(82,96,206,0.1)] flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-[#5260ce]" />
              </div>
              <p className="text-[#65666f] font-montserrat-regular">
                {t("noUniversitiesAvailable")}
              </p>
            </div>
          ) : (
            universities.map((uni, i) => (
              <UniversityCard key={uni.id} university={uni} index={i} isRTL={isRTL} />
            ))
          )}
        </div>

        {/* View all link */}
        <ScrollReveal direction="up" delay={200} className="mt-10 text-center">
          <Button
            variant="outline"
            className="border-2 border-[#5260ce] text-[#5260ce] hover:bg-[#5260ce] hover:text-white font-montserrat-semibold text-base h-12 px-8 rounded-xl transition-all duration-300 gap-2 group"
            asChild
          >
            <Link href="/universities">
              {t("viewAll")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-200" />
            </Link>
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
}
