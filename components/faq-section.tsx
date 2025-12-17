"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { figmaAssets } from "@/lib/figma-assets";
import { API_BASE_URL } from "@/lib/constants";
import { Plus, Minus } from "lucide-react";
import { t, getLanguage, type Language } from "@/lib/i18n";

type FAQ = {
  id: string;
  question: string;
  answer: string;
};

interface FAQSectionProps {
  showIllustration?: boolean;
}

export function FAQSection({ showIllustration = false }: FAQSectionProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage());

  useEffect(() => {
    fetchFAQs();
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

  const fetchFAQs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/faqs`);
      if (response.ok) {
        const data = await response.json();
        const faqsData = Array.isArray(data) ? data : [];
        setFaqs(faqsData);
        // Set first FAQ as open if available
        if (faqsData.length > 0) {
          setOpenIndex(0);
        }
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      // Use fallback FAQs
      setFaqs([
        {
          id: "1",
          question: t("faq1Question"),
          answer: t("faq1Answer"),
        },
        {
          id: "2",
          question: t("faq2Question"),
          answer: t("faq2Answer"),
        },
        {
          id: "3",
          question: t("faq3Question"),
          answer: t("faq3Answer"),
        },
        {
          id: "4",
          question: t("faq4Question"),
          answer: t("faq4Answer"),
        },
        {
          id: "5",
          question: t("faq5Question"),
          answer: t("faq5Answer"),
        },
        {
          id: "6",
          question: t("faq6Question"),
          answer: t("faq6Answer"),
        },
        {
          id: "7",
          question: t("faq7Question"),
          answer: t("faq7Answer"),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
  const ctaIllustration = showIllustration ? figmaAssets.faqCtaIllustration : figmaAssets.ctaBannerImage;

  return (
    <section
      className={`py-20 bg-white relative ${showIllustration ? "" : "overflow-hidden"}`}
    >
      <div className="max-w-[1440px] mx-auto px-5">
        {(() => {
          const currentLang = getLanguage();
          const isRTL = currentLang === "ar";
          return (
            <div className={`grid lg:grid-cols-2 gap-12 ${isRTL ? "lg:grid-cols-2" : ""}`}>
              {/* Left Content */}
              <div
                className={`space-y-6 ${showIllustration ? "relative pb-24" : ""} ${isRTL ? "lg:order-2" : ""}`}
              >
            <div>
              <p className="text-base font-montserrat-regular text-[#5260ce] mb-2">{t("faq")}</p>
              <div className="relative w-[86px] h-[5px] mb-4 inline-block">
                <Image
                  src={figmaAssets.vector5}
                  alt=""
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
            <h2 className="text-2xl md:text-[34px] font-montserrat-bold text-[#121c67]">
              {t("everythingYouNeedToKnow")}
            </h2>
            <p className="text-base md:text-[18px] font-montserrat-regular text-[#7c7b7c] leading-relaxed max-w-full md:max-w-[447px]">
              {t("faqDescription")}
            </p>
            <Button 
              size="lg" 
              className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm md:text-base h-[48px] md:h-[52px] px-4 md:px-6 rounded-lg md:rounded-xl w-full sm:w-auto"
              asChild
            >
              <Link href="/contact">{t("contact")}</Link>
            </Button>

            {showIllustration && (() => {
              const currentLang = getLanguage();
              const isRTL = currentLang === "ar";
              return (
                <div className={`hidden xl:block absolute ${isRTL ? "-right-[180px]" : "-left-[180px]"} top-[140px] w-[520px] h-[500px]`}>
                  <Image
                    src={figmaAssets.faqIllustrationStudent}
                    alt="Student exploring FAQ answers"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              );
            })()}
          </div>

              {/* Right Content - FAQ Items */}
              {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">{t("loadingFaqs")}</p>
            </div>
          ) : (
            <div className="space-y-[30px]">
              {faqs.length === 0 ? (
                <p className="text-gray-500">{t("noFaqsAvailable")}</p>
              ) : (
                faqs.map((faq, index) => {
                  const isOpen = openIndex === index && faq.answer;
                  return (
                    <div
                      key={faq.id || index}
                      className={`bg-white border-[3px] md:border-[5px] rounded-lg md:rounded-xl overflow-hidden transition-all ${
                        isOpen 
                          ? "border-[#5260ce]" 
                          : "border-white"
                      }`}
                    >
                      <button
                        className={`w-full p-3 md:p-5 flex items-center justify-between text-left ${isOpen ? 'bg-[#5260ce]' : 'bg-white'}`}
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                      >
                        <span className={`font-montserrat-bold text-base md:text-[18px] ${isOpen ? 'text-white' : 'text-[#121c67]'} pr-2 md:pr-4 flex-1`}>
                          {faq.question}
                        </span>
                        {faq.answer && (
                          <div className="w-5 h-5 md:w-6 md:h-6 shrink-0 flex items-center justify-center">
                            {isOpen ? (
                              <Minus className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            ) : (
                              <Plus className="w-4 h-4 md:w-5 md:h-5 text-[#121c67]" />
                            )}
                          </div>
                        )}
                      </button>
                      {isOpen && faq.answer && (
                        <div className="px-3 md:px-5 pb-3 md:pb-5">
                          <p className="text-sm md:text-[18px] font-montserrat-light text-[#121c67] leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              </div>
            )}
            </div>
          );
        })()}

        {/* CTA Banner */}
        <div className="mt-20 relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#5260ce] to-[#75d3f7] text-white">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>
          <div className="relative max-w-[1280px] mx-auto px-5 py-16">
            {showIllustration && (() => {
              const currentLang = getLanguage();
              const isRTL = currentLang === "ar";
              return (
                <div className={`pointer-events-none absolute ${isRTL ? "right-[60px]" : "left-[60px]"} top-[40px] w-[360px] h-[360px] opacity-60`}>
                  <Image
                    src={figmaAssets.faqCtaVector}
                    alt=""
                  fill
                  className="object-contain"
                  aria-hidden="true"
                  unoptimized
                />
              </div>
            )})()}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="relative w-[80px] h-[5px] inline-block">
                  <Image
                    src={figmaAssets.vector5}
                    alt=""
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <h2 className="text-[34px] font-montserrat-bold text-white">
                  {t("startUniversityJourney")}
                </h2>
                <p className="text-lg font-montserrat-light text-white/90 leading-relaxed max-w-[451px]">
                  {t("startJourneyDescription")}
                </p>
                <Button 
                  size="lg" 
                  className="bg-white text-[#5260ce] hover:bg-gray-100 font-montserrat-semibold text-base h-[52px] px-8 rounded-xl"
                  asChild
                >
                  <Link href="/universities">{t("browseUniversitiesButton")}</Link>
                </Button>
              </div>
              <div className="hidden lg:block relative w-full h-[478px]">
                <Image
                  src={ctaIllustration}
                  alt="Students"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
