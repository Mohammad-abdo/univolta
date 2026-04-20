"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { figmaAssets } from "@/lib/figma-assets";
import { API_BASE_URL } from "@/lib/constants";
import { t, getLanguage, type Language } from "@/lib/i18n";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

type Testimonial = {
  id: string;
  author: string;
  content: string;
  rating: number;
  university?: string;
  country?: string;
  avatarUrl?: string | null;
};

const AVATARS = [figmaAssets.student1, figmaAssets.student2, figmaAssets.student3];

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lang, setLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLang(getLanguage());
    const id = setInterval(() => setLang(getLanguage()), 300);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { fetchTestimonials(); }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/public/testimonials?limit=6`);
      if (res.ok) {
        const data = await res.json();
        setTestimonials(Array.isArray(data) ? data : data.data || []);
      }
    } catch {
      // fall through to fallback
    } finally {
      setLoading(false);
    }
  };

  const isRTL = mounted && lang === "ar";
  const tl = (key: string) => t(key, lang);

  const fallback: Testimonial[] = [
    { id: "1", author: tl("testimonial1Author"), content: tl("testimonial1Content"), rating: 5, university: "University of Toronto", country: "Canada" },
    { id: "2", author: tl("testimonial2Author"), content: tl("testimonial2Content"), rating: 5, university: "MIT", country: "USA" },
    { id: "3", author: tl("testimonial3Author"), content: tl("testimonial3Content"), rating: 5, university: "Oxford University", country: "UK" },
  ];

  const source = testimonials.length > 0 ? testimonials : fallback;
  const PAGE = 3;
  const visible = source.slice(currentIndex, currentIndex + PAGE);
  const canPrev = currentIndex > 0;
  const canNext = currentIndex + PAGE < source.length;

  return (
    <section className="py-12 md:py-20 bg-[#f8f9ff] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 md:px-5">

        {/* Header row */}
        <ScrollReveal direction="up">
          <div className={`flex flex-col md:flex-row items-start justify-between mb-8 md:mb-12 gap-5 ${isRTL ? "md:flex-row-reverse" : ""}`}>
            <div className={`max-w-[560px] ${isRTL ? "text-right" : ""}`}>
              <p className="text-sm md:text-base font-montserrat-regular text-[#5260ce] mb-2">{tl("ourStudent")}</p>
              <h2 className="text-2xl md:text-[34px] font-montserrat-bold text-[#121c67] mb-3">
                {tl("studentSuccessStories")}
              </h2>
              <p className="text-base md:text-[18px] font-montserrat-regular text-[#7c7b7c] leading-relaxed">
                {tl("studentSuccessStoriesDesc")}
              </p>
            </div>

            {/* nav buttons — only show when there are enough testimonials */}
            {source.length > PAGE && (
              <div className={`hidden md:flex gap-3 shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-[#5260ce]/20 hover:bg-[rgba(82,96,206,0.08)] disabled:opacity-30"
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={!canPrev}
                  aria-label="Previous"
                >
                  {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </Button>
                <Button
                  size="icon"
                  className="rounded-full bg-[#5260ce] hover:bg-[#4350b0] disabled:opacity-30"
                  onClick={() => setCurrentIndex((i) => Math.min(source.length - PAGE, i + 1))}
                  disabled={!canNext}
                  aria-label="Next"
                >
                  {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </Button>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-60 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {visible.map((item, idx) => (
              <ScrollReveal key={item.id} direction="up" delay={idx * 80}>
                <div className={`group h-full bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-[0_2px_16px_rgba(82,96,206,0.07)] hover:shadow-[0_8px_40px_rgba(82,96,206,0.13)] hover:-translate-y-1 transition-all duration-300 flex flex-col ${isRTL ? "text-right" : ""}`}>
                  {/* quote icon */}
                  <div className={`mb-3 ${isRTL ? "text-right" : ""}`}>
                    <Quote className="w-7 h-7 text-[#5260ce]/25" />
                  </div>

                  {/* stars */}
                  <div className={`flex gap-0.5 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* content */}
                  <p className="flex-1 font-montserrat-regular text-sm md:text-[15px] text-[#2e2e2e] leading-relaxed mb-5">
                    &ldquo;{item.content}&rdquo;
                  </p>

                  {/* author */}
                  <div className={`flex items-center gap-3 pt-4 border-t border-gray-100 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0 relative border-2 border-[#5260ce]/10">
                      <Image
                        src={item.avatarUrl || AVATARS[idx % AVATARS.length]}
                        alt={item.author}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-montserrat-bold text-sm text-[#121c67] truncate">{item.author}</p>
                      <p className="text-xs font-montserrat-regular text-[#65666f] truncate">
                        {[item.university, item.country].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* Mobile pagination dots */}
        {source.length > PAGE && (
          <div className={`flex justify-center gap-2 mt-6 md:hidden`}>
            {Array.from({ length: Math.ceil(source.length / PAGE) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i * PAGE)}
                className={`rounded-full transition-all ${Math.floor(currentIndex / PAGE) === i ? "w-6 h-2 bg-[#5260ce]" : "w-2 h-2 bg-[#5260ce]/25"}`}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
