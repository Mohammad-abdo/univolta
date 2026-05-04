"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { API_BASE_URL } from "@/lib/constants";
import { getLocaleHeaders } from "@/lib/api";
import { Plus, Minus, MessageCircle, ChevronDown } from "lucide-react";
import { t, getLanguage, type Language } from "@/lib/i18n";

type FAQ = { id: string; question: string; answer: string };

// ── Single accordion item ───────────────────────────────────────────────────
function FAQItem({
  faq,
  index,
  isOpen,
  isRTL,
  onToggle,
}: {
  faq: FAQ;
  index: number;
  isOpen: boolean;
  isRTL: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
        isOpen
          ? "border-[#5260ce] shadow-[0_8px_32px_rgba(82,96,206,0.15)]"
          : "border-gray-100 bg-white shadow-sm hover:border-[#5260ce]/30 hover:shadow-md"
      }`}
    >
      <button
        className={`w-full flex items-center gap-4 p-5 md:p-6 text-${isRTL ? "right" : "left"} transition-colors duration-200 ${
          isOpen ? "bg-[#5260ce]" : "bg-white hover:bg-gray-50/50"
        }`}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        {/* Number badge */}
        <span
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-montserrat-bold transition-colors ${
            isOpen ? "bg-white/20 text-white" : "bg-[#5260ce]/10 text-[#5260ce]"
          }`}
        >
          {index + 1}
        </span>

        {/* Question */}
        <span
          className={`flex-1 font-montserrat-bold text-base md:text-[17px] leading-snug ${
            isOpen ? "text-white" : "text-[#121c67]"
          } ${isRTL ? "text-right" : "text-left"}`}
        >
          {faq.question}
        </span>

        {/* Icon */}
        <span
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
            isOpen ? "bg-white/20 rotate-180" : "bg-[#5260ce]/10"
          }`}
        >
          <ChevronDown
            className={`w-4 h-4 transition-colors ${isOpen ? "text-white" : "text-[#5260ce]"}`}
          />
        </span>
      </button>

      {/* Answer */}
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className={`px-5 md:px-6 py-4 md:py-5 bg-white ${isRTL ? "text-right" : "text-left"}`}>
          <p className="font-montserrat-regular text-[15px] md:text-base text-[#4a4b56] leading-relaxed">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Contact card ─────────────────────────────────────────────────────────────
function ContactCard({ isRTL }: { isRTL: boolean }) {
  return (
    <ScrollReveal direction="up" delay={200}>
      <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#5260ce] to-[#121c67] p-7 md:p-8 text-center shadow-[0_12px_48px_rgba(82,96,206,0.25)]">
        <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-montserrat-bold text-white text-lg md:text-xl mb-2">
          {t("faqContactPrompt")}
        </h3>
        <p className="font-montserrat-regular text-white/75 text-sm md:text-base mb-5 leading-relaxed">
          {t("faqContactSub")}
        </p>
        <Button
          asChild
          className="bg-white text-[#5260ce] hover:bg-gray-100 font-montserrat-semibold h-[44px] px-7 rounded-xl transition-all hover:-translate-y-0.5"
        >
          <Link href="/contact" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <MessageCircle className="w-4 h-4" />
            {t("contact")}
          </Link>
        </Button>
      </div>
    </ScrollReveal>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [lang, setLang] = useState<Language>(getLanguage());

  useEffect(() => {
    const id = setInterval(() => setLang(getLanguage()), 300);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/public/faqs`, {
          headers: { ...getLocaleHeaders() },
        });
        if (res.ok) {
          const data = await res.json();
          const list: FAQ[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
          setFaqs(list);
          setOpenIndex(list.length > 0 ? 0 : null);
        } else {
          throw new Error("bad response");
        }
      } catch {
        setFaqs(
          ["1", "2", "3", "4", "5", "6", "7"].map((n) => ({
            id: n,
            question: t(`faq${n}Question`),
            answer: t(`faq${n}Answer`),
          }))
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [lang]);

  const isRTL = lang === "ar";

  return (
    <section className="py-14 md:py-20 bg-[#f9fafe]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-5">

        {/* ── Section header ── */}
        <ScrollReveal direction="up">
          <div className={`text-center mb-10 md:mb-14 ${isRTL ? "rtl" : ""}`}>
            <Badge className="mb-4 bg-[rgba(82,96,206,0.1)] text-[#5260ce] border border-[#5260ce]/20 font-montserrat-semibold px-4 py-1.5">
              {t("faq")}
            </Badge>
            <h2 className="font-montserrat-bold text-2xl md:text-[36px] text-[#121c67] leading-tight mb-4">
              {t("everythingYouNeedToKnow")}
            </h2>
            <p className="font-montserrat-regular text-[#65666f] text-base md:text-lg max-w-[580px] mx-auto leading-relaxed">
              {t("faqDescription")}
            </p>
          </div>
        </ScrollReveal>

        {/* ── Two-column layout ── */}
        <div className={`grid lg:grid-cols-[1fr_420px] gap-8 md:gap-12 ${isRTL ? "lg:grid-cols-[420px_1fr] rtl" : ""}`}>

          {/* Accordion */}
          <div className={`space-y-3 ${isRTL ? "lg:order-2" : ""}`}>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-12 text-[#65666f]">{t("noFaqsAvailable")}</div>
            ) : (
              faqs.map((faq, i) => (
                <ScrollReveal key={faq.id || i} direction="up" delay={i * 50}>
                  <FAQItem
                    faq={faq}
                    index={i}
                    isOpen={openIndex === i}
                    isRTL={isRTL}
                    onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                  />
                </ScrollReveal>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className={`space-y-4 ${isRTL ? "lg:order-1" : ""}`}>
            {/* Summary card */}
            <ScrollReveal direction={isRTL ? "right" : "left"}>
              <div className={`rounded-2xl bg-white border border-gray-100 p-7 shadow-sm ${isRTL ? "text-right" : "text-left"}`}>
                <div className="w-12 h-12 rounded-2xl bg-[#5260ce]/10 flex items-center justify-center mb-5">
                  <Plus className="w-6 h-6 text-[#5260ce]" />
                </div>
                <h3 className="font-montserrat-bold text-[#121c67] text-lg mb-2">
                  {t("everythingYouNeedToKnow")}
                </h3>
                <p className="font-montserrat-regular text-[#65666f] text-sm md:text-[15px] leading-relaxed">
                  {t("faqDescription")}
                </p>
              </div>
            </ScrollReveal>

            {/* CTA card */}
            <ContactCard isRTL={isRTL} />

            {/* CTA banner — start journey */}
            <ScrollReveal direction={isRTL ? "right" : "left"} delay={300}>
              <div className="rounded-2xl overflow-hidden border border-[#5260ce]/15">
                <div className="bg-gradient-to-br from-[#f0f4ff] to-[#e8edff] p-7 md:p-8">
                  <h3 className={`font-montserrat-bold text-[#121c67] text-lg mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                    {t("startUniversityJourney")}
                  </h3>
                  <p className={`font-montserrat-regular text-[#65666f] text-sm mb-5 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}>
                    {t("startJourneyDescription")}
                  </p>
                  <Button
                    asChild
                    className="w-full bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold h-[44px] rounded-xl transition-all hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(82,96,206,0.3)]"
                  >
                    <Link href="/universities">{t("browseUniversitiesButton")}</Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
