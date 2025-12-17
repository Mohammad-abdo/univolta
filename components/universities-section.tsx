"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { figmaAssets } from "@/lib/figma-assets";
import { API_BASE_URL } from "@/lib/constants";
import { MapPin, Globe, ChevronDown, Search } from "lucide-react";
import { t, getLanguage, type Language } from "@/lib/i18n";

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
};

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
      if (lang !== currentLang) {
        setCurrentLang(lang);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [currentLang]);

  const fetchUniversities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/universities?limit=3`);
      if (response.ok) {
        const data = await response.json();
        setUniversities(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching universities:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1440px] mx-auto px-5">
        {/* Hero Banner */}
        <div className="relative h-[200px] md:h-[350px] rounded-[16px] md:rounded-[24px] overflow-hidden mb-6 md:mb-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#5260ce] to-[#75d3f7]">
            <div className="absolute inset-0 bg-[rgba(18,28,103,0.4)]" />
          </div>
          <h2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-montserrat-bold text-xl md:text-[34px] leading-[1.4] text-white text-center px-4">
            {t("listOfInternationalUniversities")}
          </h2>
        </div>

        {/* Filters and Search Bar */}
        {(() => {
          const currentLang = getLanguage();
          const isRTL = currentLang === "ar";
          return (
            <div className={`bg-white rounded-[16px] md:rounded-[24px] shadow-[0px_4px_40px_0px_rgba(82,96,206,0.12)] p-4 md:p-6 mb-6 md:mb-10 flex flex-col md:flex-row gap-3 md:gap-5 ${isRTL ? "md:flex-row-reverse" : ""}`}>
          {/* Country Dropdown */}
          <div className="flex-1 min-w-0 w-full md:w-auto">
              <div className={`bg-gray-50 border border-[#e0e6f1] rounded-lg h-[48px] md:h-[52px] px-3 md:px-3.5 py-2.5 md:py-3 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                <p className="font-montserrat-regular text-sm md:text-[16px] leading-[1.4] text-[#b1b2bf]" dir={isRTL ? "rtl" : "ltr"}>{t("country")}</p>
                <ChevronDown className="w-4 h-4 text-[#b1b2bf] shrink-0" />
              </div>
            </div>

            {/* Language Dropdown */}
            <div className="flex-1 min-w-0 w-full md:w-auto">
              <div className={`bg-gray-50 border border-[#e0e6f1] rounded-lg h-[48px] md:h-[52px] px-3 md:px-3.5 py-2.5 md:py-3 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                <p className="font-montserrat-regular text-sm md:text-[16px] leading-[1.4] text-[#b1b2bf]" dir={isRTL ? "rtl" : "ltr"}>{t("languageOfStudy")}</p>
                <ChevronDown className="w-4 h-4 text-[#b1b2bf] shrink-0" />
              </div>
            </div>

            {/* Field of Specialisation Dropdown */}
            <div className="flex-1 min-w-0 w-full md:w-auto">
              <div className={`bg-gray-50 border border-[#e0e6f1] rounded-lg h-[48px] md:h-[52px] px-3 md:px-3.5 py-2.5 md:py-3 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                <p className="font-montserrat-regular text-sm md:text-[16px] leading-[1.4] text-[#b1b2bf]" dir={isRTL ? "rtl" : "ltr"}>{t("fieldOfSpecialisation")}</p>
                <ChevronDown className="w-4 h-4 text-[#b1b2bf] shrink-0" />
              </div>
            </div>

              {/* Search Input and Button */}
              <div className={`flex flex-col sm:flex-row gap-2 md:gap-3 rounded-xl md:rounded-2xl w-full md:w-auto ${isRTL ? "sm:flex-row-reverse" : ""}`}>
                <div className={`bg-gray-50 border border-[#e0e6f1] rounded-lg md:rounded-xl px-3 md:px-3.5 py-2.5 md:py-3.5 flex gap-2 md:gap-3 items-center flex-1 md:w-[310px] ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Search className={`w-5 h-5 md:w-6 md:h-6 text-[#8b8c9a] shrink-0 ${isRTL ? "ml-2 md:ml-3" : ""}`} />
                  <p className="font-montserrat-light text-sm md:text-[16px] leading-[1.4] text-[#8b8c9a]" dir={isRTL ? "rtl" : "ltr"}>{t("searchUniversitiesPlaceholder")}</p>
                </div>
                <Button className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm md:text-[16px] h-[48px] md:h-[52px] w-full sm:w-auto sm:min-w-[124px] rounded-lg md:rounded-xl shrink-0">
                  {t("search")}
                </Button>
              </div>
            </div>
          );
        })()}

        {/* University Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">{t("loadingUniversities")}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
            {universities.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">{t("noUniversitiesAvailable")}</p>
              </div>
            ) : (
              universities.map((university) => (
                <div
                  key={university.id}
                  className="bg-white border-[5px] border-white rounded-xl overflow-hidden flex flex-col shadow-md"
                >
              {/* Image Section with Logo and Name Badge */}
              <div className="relative pb-[67px]">
                {/* University Image */}
                <div className="h-[220px] -mb-[67px] relative rounded-xl overflow-hidden">
                  <div className="absolute inset-0">
                    <Image
                      src={university.bannerUrl || university.image1 || figmaAssets.universityLogo1}
                      alt={university.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
                
                {/* Logo and Name Badge */}
                <div className="relative flex gap-1 h-[86px] px-6 items-center -mt-[67px] rounded-br-xl">
                  <div className="bg-[#5260ce] flex gap-1 h-[49px] items-center rounded-bl-[40px] rounded-br-xl rounded-tl-[40px]">
                    {/* University Logo */}
                    {university.logoUrl && (
                      <div className="relative w-[76px] h-[76px] border-[5px] border-white rounded-full overflow-hidden shrink-0">
                        <Image
                          src={university.logoUrl}
                          alt={university.name}
                          fill
                          className="object-contain p-2"
                          unoptimized
                        />
                      </div>
                    )}
                    {/* University Name */}
                    <div className="px-4 py-6 h-[49px] flex items-center w-[302px]">
                      <p className="font-montserrat-bold text-[18px] leading-[1.4] text-white w-[217px]">
                        {university.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex flex-col gap-[10px] px-5 pt-4">
                {/* Description */}
                <div className="flex gap-[10px] items-center justify-center px-5">
                  <p className="flex-1 font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                    {university.description || university.about || t("discoverWorldClassAcademics")}
                  </p>
                </div>

                {/* Location & Language Tags */}
                <div className="flex gap-3 px-5">
                  {/* Location Tag */}
                  <div className="bg-[rgba(117,211,247,0.1)] border border-[#75d3f7] rounded-lg px-2 py-1.5 flex gap-1 items-center">
                    <MapPin className="w-6 h-6 text-[#2e2e2e] shrink-0" />
                    <p className="font-montserrat-regular text-[18px] leading-[1.4] text-[#2e2e2e]">
                      {university.city}, {university.country}
                    </p>
                  </div>

                  {/* Language Tag */}
                  <div className="bg-[rgba(117,211,247,0.1)] border border-[#75d3f7] rounded-lg px-2 py-1.5 flex gap-1 items-center">
                    <Globe className="w-6 h-6 text-[#2e2e2e] shrink-0" />
                    <p className="font-montserrat-regular text-[18px] leading-[1.4] text-[#2e2e2e]">
                      {university.language}
                    </p>
                  </div>
                </div>

                {/* Key Majors Section */}
                {university.majors && university.majors.length > 0 && (
                  <div className="flex flex-col gap-[10px] w-full">
                    {/* Key Majors Label */}
                    <div className="px-5">
                      <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#2e2e2e]">
                        {t("keyMajors")}
                      </p>
                    </div>

                    {/* Major Tags - Two Rows */}
                    <div className="flex flex-col gap-[10px]">
                      {/* First Row */}
                      <div className="px-5 flex flex-wrap gap-2.5">
                        {university.majors.slice(0, 2).map((major, i) => (
                          <div
                            key={i}
                            className="bg-[rgba(117,211,247,0.2)] rounded-md px-2 py-2 h-[26px] flex items-center justify-center overflow-hidden"
                          >
                            <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#121c67] text-center">
                              {major}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Second Row */}
                      {university.majors.length > 2 && (
                        <div className="px-5 flex flex-wrap gap-2.5">
                          {university.majors.slice(2, 5).map((major, i) => (
                            <div
                              key={i}
                              className="bg-[rgba(117,211,247,0.2)] rounded-md px-2 py-2 h-[26px] flex items-center justify-center overflow-hidden"
                            >
                              <p className="font-montserrat-regular text-[16px] leading-[1.4] text-[#121c67] text-center">
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
                <div className="px-5 pb-5 pt-0">
                  <Button
                    className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-[16px] h-[48px] w-full rounded-xl"
                    asChild
                  >
                    <Link href={`/universities/${university.slug}`}>
                      {t("viewDetails")}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
              ))
            )}
          </div>
        )}
        
        {/* View All Link */}
        <div className="mt-10 text-center">
          <Link
            href="/universities"
            className="inline-flex items-center gap-2 text-[#5260ce] font-montserrat-semibold text-[18px] hover:underline"
          >
            {t("viewAll")}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
