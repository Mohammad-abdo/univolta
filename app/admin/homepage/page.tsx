"use client";

import React, { useEffect, useState, useCallback } from "react";
import { settingsApi, HeroSlide, HomeSectionConfig } from "@/lib/admin-api";
import {
  Save, Plus, Trash2, GripVertical, Eye, EyeOff,
  RefreshCw, CheckCircle, AlertCircle, Image as ImageIcon, ChevronDown, ChevronUp,
} from "lucide-react";
import Image from "next/image";

const DEFAULT_SECTIONS: HomeSectionConfig[] = [
  { id: "whyUs",        label: "Why Us",        enabled: true, order: 1 },
  { id: "stats",        label: "Stats",         enabled: true, order: 2 },
  { id: "universities", label: "Universities",  enabled: true, order: 3 },
  { id: "programs",     label: "Programs",      enabled: true, order: 4 },
  { id: "howItWorks",   label: "How It Works",  enabled: true, order: 5 },
  { id: "testimonials", label: "Testimonials",  enabled: true, order: 6 },
  { id: "cta",          label: "Call To Action", enabled: true, order: 7 },
  { id: "faq",          label: "FAQ",           enabled: true, order: 8 },
  { id: "egyptBusiness",label: "Egypt Business", enabled: true, order: 9 },
];

const DEFAULT_SLIDES: HeroSlide[] = [
  { id: "s1", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80", badge: "Study in Egypt 🇪🇬", titleEn: "Your Future Starts in Egypt", titleAr: "مستقبلك يبدأ في مصر" },
  { id: "s2", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80", badge: "Top Universities 🎓", titleEn: "World-Class Education",        titleAr: "تعليم عالمي المستوى" },
  { id: "s3", image: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=1200&q=80", badge: "Apply Now 🚀",        titleEn: "500+ Programs Available",     titleAr: "أكثر من 500 برنامج دراسي" },
];

export default function HomepageManager() {
  const [slides,   setSlides]   = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [sections, setSections] = useState<HomeSectionConfig[]>(DEFAULT_SECTIONS);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [tab,      setTab]      = useState<"hero" | "sections">("hero");
  const [expanded, setExpanded] = useState<string | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    try {
      const s = await settingsApi.getAll();
      if (Array.isArray(s["hero.slides"])    && (s["hero.slides"] as HeroSlide[]).length)    setSlides(s["hero.slides"]    as HeroSlide[]);
      if (Array.isArray(s["home.sections"])  && (s["home.sections"] as HomeSectionConfig[]).length) setSections(s["home.sections"] as HomeSectionConfig[]);
    } catch { /* use defaults */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      await Promise.all([
        settingsApi.set("hero.slides",    slides),
        settingsApi.set("home.sections",  sections),
      ]);
      showToast("success", "Homepage settings saved!");
    } catch (e: any) {
      showToast("error", e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ── Slide helpers ─────────────────────────────────────────────────── */
  const addSlide = () => {
    setSlides((prev) => [
      ...prev,
      { id: `s${Date.now()}`, image: "", badge: "New Slide", titleEn: "", titleAr: "" },
    ]);
  };

  const removeSlide = (id: string) => setSlides((prev) => prev.filter((s) => s.id !== id));

  const updateSlide = (id: string, patch: Partial<HeroSlide>) =>
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const moveSlide = (id: string, dir: -1 | 1) => {
    setSlides((prev) => {
      const idx  = prev.findIndex((s) => s.id === id);
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };

  const handleUploadSlideImage = async (id: string, file: File) => {
    const token = localStorage.getItem("accessToken");
    const base  = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
    const fd    = new FormData();
    fd.append("file", file);
    try {
      const res  = await fetch(`${base}/upload`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (data.url) updateSlide(id, { image: data.url });
    } catch { showToast("error", "Image upload failed"); }
  };

  /* ── Section helpers ───────────────────────────────────────────────── */
  const toggleSection = (id: string) =>
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));

  const moveSection = (id: string, dir: -1 | 1) => {
    setSections((prev) => {
      const idx  = prev.findIndex((s) => s.id === id);
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <RefreshCw size={24} className="animate-spin mr-2" /> Loading…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
          ${toast.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(["hero", "sections"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? "bg-white shadow text-indigo-700" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "hero" ? "Hero Slides" : "Page Sections"}
          </button>
        ))}
      </div>

      {/* Hero Slides */}
      {tab === "hero" && (
        <div className="space-y-4">
          {slides.map((slide, idx) => (
            <div key={slide.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header row */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                <GripVertical size={16} className="text-gray-300" />
                <span className="text-xs font-semibold text-gray-400 bg-white border border-gray-200 rounded-lg px-2 py-0.5">
                  Slide {idx + 1}
                </span>
                <p className="flex-1 text-sm font-medium text-gray-700 truncate">{slide.badge || "Untitled slide"}</p>
                <button onClick={() => moveSlide(slide.id, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors">
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => moveSlide(slide.id, 1)} disabled={idx === slides.length - 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors">
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => setExpanded(expanded === slide.id ? null : slide.id)}
                  className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 transition-colors"
                >
                  {expanded === slide.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <button onClick={() => removeSlide(slide.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-300 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Expanded editor */}
              {expanded === slide.id && (
                <div className="p-5 space-y-4">
                  {/* Image preview + upload */}
                  <div className="flex items-start gap-4">
                    {slide.image ? (
                      <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                        <Image src={slide.image} alt="slide" fill className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className="w-32 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 shrink-0">
                        <ImageIcon size={24} />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl cursor-pointer transition-colors">
                        Upload image
                        <input type="file" accept="image/*" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadSlideImage(slide.id, f); }} />
                      </label>
                      <input
                        type="url"
                        placeholder="Or paste image URL…"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        value={slide.image}
                        onChange={(e) => updateSlide(slide.id, { image: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Badge text</label>
                      <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        value={slide.badge ?? ""} onChange={(e) => updateSlide(slide.id, { badge: e.target.value })} placeholder="Study in Egypt 🇪🇬" />
                    </div>
                    <div />
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Title (English)</label>
                      <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        value={slide.titleEn ?? ""} onChange={(e) => updateSlide(slide.id, { titleEn: e.target.value })} placeholder="Your Future Starts Here" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Title (Arabic)</label>
                      <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 text-right" dir="rtl"
                        value={slide.titleAr ?? ""} onChange={(e) => updateSlide(slide.id, { titleAr: e.target.value })} placeholder="مستقبلك يبدأ هنا" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Subtitle (English)</label>
                      <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        value={slide.subEn ?? ""} onChange={(e) => updateSlide(slide.id, { subEn: e.target.value })} placeholder="Discover amazing programs…" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Subtitle (Arabic)</label>
                      <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 text-right" dir="rtl"
                        value={slide.subAr ?? ""} onChange={(e) => updateSlide(slide.id, { subAr: e.target.value })} placeholder="اكتشف برامج رائعة…" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button onClick={addSlide}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-indigo-200 text-indigo-500 hover:border-indigo-400 hover:text-indigo-700 rounded-2xl py-4 text-sm font-medium transition-all">
            <Plus size={18} /> Add Slide
          </button>
        </div>
      )}

      {/* Page Sections */}
      {tab === "sections" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Toggle sections on/off and drag to reorder them on the home page.</p>
          {sections.map((sec, idx) => (
            <div key={sec.id} className={`flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl shadow-sm border transition-all
              ${sec.enabled ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
              <GripVertical size={16} className="text-gray-300 shrink-0" />
              <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-500 text-xs font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <p className="flex-1 text-sm font-medium text-gray-700">{sec.label}</p>
              <button onClick={() => moveSection(sec.id, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors">
                <ChevronUp size={14} />
              </button>
              <button onClick={() => moveSection(sec.id, 1)} disabled={idx === sections.length - 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors">
                <ChevronDown size={14} />
              </button>
              <button
                onClick={() => toggleSection(sec.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                  ${sec.enabled ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
              >
                {sec.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
                {sec.enabled ? "Visible" : "Hidden"}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[#5260ce] hover:bg-[#4251be] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-60"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
