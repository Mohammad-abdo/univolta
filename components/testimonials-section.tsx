"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { figmaAssets } from "@/lib/figma-assets";
import { API_BASE_URL } from "@/lib/constants";
import { t, getLanguage, type Language } from "@/lib/i18n";

type Testimonial = {
  id: string;
  author: string;
  content: string;
  rating: number;
  university?: string;
  country?: string;
  avatarUrl?: string | null;
};

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage());

  useEffect(() => {
    fetchTestimonials();
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

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/testimonials?limit=6`);
      if (response.ok) {
        const data = await response.json();
        setTestimonials(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayedTestimonials = testimonials.slice(currentIndex, currentIndex + 3);
  const canGoNext = currentIndex + 3 < testimonials.length;
  const canGoPrev = currentIndex > 0;

  const nextTestimonials = () => {
    if (canGoNext) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevTestimonials = () => {
    if (canGoPrev) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Fallback testimonials if API fails
  const fallbackTestimonials: Testimonial[] = [
    {
      id: "1",
      author: t("testimonial1Author"),
      content: t("testimonial1Content"),
      rating: 5,
      university: "University of Toronto",
      country: "Canada",
    },
    {
      id: "2",
      author: t("testimonial2Author"),
      content: t("testimonial2Content"),
      rating: 5,
      university: "MIT",
      country: "USA",
    },
    {
      id: "3",
      author: t("testimonial3Author"),
      content: t("testimonial3Content"),
      rating: 5,
      university: "Oxford University",
      country: "UK",
    },
  ];

  const testimonialsToShow = testimonials.length > 0 ? displayedTestimonials : fallbackTestimonials.slice(0, 3);
  const studentAvatars = [figmaAssets.student1, figmaAssets.student2, figmaAssets.student3];
  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-4 md:px-5">
        {/* Section Header */}
        {(() => {
          const currentLang = getLanguage();
          const isRTL = currentLang === "ar";
          return (
            <div className={`flex flex-col md:flex-row items-start justify-between mb-8 md:mb-12 gap-4 ${isRTL ? "md:flex-row-reverse" : ""}`}>
              <div className="max-w-full md:max-w-[560px]">
            <p className="text-sm md:text-base font-montserrat-regular text-[#5260ce] mb-2">{t("ourStudent")}</p>
            <div className="relative w-[131px] h-[5px] mb-4 inline-block">
              <Image
                src={figmaAssets.vector5}
                alt=""
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <h2 className="text-2xl md:text-[34px] font-montserrat-bold text-[#121c67] mb-4">
              {t("studentSuccessStories")}
            </h2>
            <p className="text-base md:text-[18px] font-montserrat-regular text-[#7c7b7c] leading-relaxed">
              {t("studentSuccessStoriesDesc")}
            </p>
          </div>
              <div className={`hidden md:flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="bg-[rgba(82,96,206,0.1)] rounded-[40px]"
                  onClick={prevTestimonials}
                  disabled={!canGoPrev}
                >
                  {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </Button>
                <Button 
                  size="icon" 
                  className="bg-[#5260ce] hover:bg-[#4350b0] rounded-[40px]"
                  onClick={nextTestimonials}
                  disabled={!canGoNext}
                >
                  {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </Button>
              </div>
            </div>
          );
        })()}

        {/* Testimonials Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">{t("loadingTestimonials")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-[30px]">
            {testimonialsToShow.map((testimonial, index) => (
              <div
                key={testimonial.id || index}
                className="bg-white border-[3px] md:border-[5px] border-[rgba(117,211,247,0.4)] rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                {/* Rating */}
                <div className="flex gap-0.5 mb-3 md:mb-4">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 md:w-6 md:h-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-base md:text-[18px] font-montserrat-light text-[#2e2e2e] leading-relaxed mb-4 md:mb-6 min-h-[100px] md:min-h-[120px]">
                  &quot;{testimonial.content}&quot;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-[50px] h-[50px] md:w-[60px] md:h-[60px] rounded-full border border-white overflow-hidden relative bg-gray-200 shrink-0">
                    {testimonial.avatarUrl ? (
                      <Image
                        src={testimonial.avatarUrl}
                        alt={testimonial.author}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <Image
                        src={studentAvatars[index % studentAvatars.length]}
                        alt={testimonial.author}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-montserrat-bold text-sm md:text-[14px] text-[#2e2e2e] truncate">{testimonial.author}</p>
                    <p className="text-xs md:text-[14px] font-montserrat-regular text-[#2e2e2e] truncate">
                      {testimonial.university || ""} {testimonial.country ? `, ${testimonial.country}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
