"use client";

import React, { useEffect, useState, useCallback } from "react";
import { settingsApi, HeroSlide, HomeSectionConfig } from "@/lib/admin-api";
import { getImageUrl } from "@/lib/image-utils";
import {
  Save, Plus, Trash2, Eye, EyeOff, RefreshCw,
  CheckCircle, AlertCircle, ChevronUp, ChevronDown,
  Layers, Layout, Sparkles, Upload, X, ImageIcon,
  ArrowLeft, Edit3, GripVertical,
} from "lucide-react";
import Image from "next/image";

type View = "list" | "edit";

const DEFAULT_SECTIONS: HomeSectionConfig[] = [
  { id: "whyUs",        label: "Why Us",         enabled: true, order: 1 },
  { id: "stats",        label: "Stats",          enabled: true, order: 2 },
  { id: "universities", label: "Universities",   enabled: true, order: 3 },
  { id: "programs",     label: "Programs",       enabled: true, order: 4 },
  { id: "howItWorks",   label: "How It Works",   enabled: true, order: 5 },
  { id: "testimonials", label: "Testimonials",   enabled: true, order: 6 },
  { id: "cta",          label: "Call To Action", enabled: true, order: 7 },
  { id: "faq",          label: "FAQ",            enabled: true, order: 8 },
  { id: "egyptBusiness",label: "Egypt Business", enabled: true, order: 9 },
];

const DEFAULT_SLIDES: HeroSlide[] = [
  { id: "s1", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80", badge: "Study in Egypt 🇪🇬", titleEn: "Your Future Starts in Egypt", titleAr: "مستقبلك يبدأ في مصر" },
  { id: "s2", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80", badge: "Top Universities 🎓", titleEn: "World-Class Education", titleAr: "تعليم عالمي المستوى" },
  { id: "s3", image: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=1200&q=80", badge: "Apply Now 🚀",        titleEn: "500+ Programs Available", titleAr: "أكثر من 500 برنامج دراسي" },
];

const EMPTY_SLIDE = (): HeroSlide => ({
  id:      `s${Date.now()}`,
  image:   "",
  badge:   "",
  titleEn: "",
  titleAr: "",
  subEn:   "",
  subAr:   "",
});

export default function HomepageManager() {
  const [slides,        setSlides]        = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [sections,      setSections]      = useState<HomeSectionConfig[]>(DEFAULT_SECTIONS);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [tab,           setTab]           = useState<"slides" | "sections">("slides");
  const [view,          setView]          = useState<View>("list");
  const [editSlide,     setEditSlide]     = useState<HeroSlide | null>(null);
  const [isNew,         setIsNew]         = useState(false);
  const [toast,         setToast]         = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    try {
      const s = await settingsApi.getAll();
      if (Array.isArray(s["hero.slides"]) && (s["hero.slides"] as HeroSlide[]).length)
        setSlides(s["hero.slides"] as HeroSlide[]);
      if (Array.isArray(s["home.sections"]) && (s["home.sections"] as HomeSectionConfig[]).length)
        setSections(s["home.sections"] as HomeSectionConfig[]);
    } catch { /* use defaults */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Save all ──────────────────────────────────────────────── */
  const saveAll = async (updatedSlides?: HeroSlide[]) => {
    setSaving(true);
    try {
      await Promise.all([
        settingsApi.set("hero.slides",   updatedSlides ?? slides),
        settingsApi.set("home.sections", sections),
      ]);
      showToast("success", "Homepage saved!");
    } catch (e: any) {
      showToast("error", e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ── Upload image ──────────────────────────────────────────── */
  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    const token = localStorage.getItem("accessToken");
    const base  = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
    const fd    = new FormData();
    fd.append("image", file);                            // ← field: "image"
    try {
      const res  = await fetch(`${base}/upload/image`, { // ← endpoint: /upload/image
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    fd,
      });
      const data = await res.json();
      if (data.url) return data.url as string;
      showToast("error", "Upload failed — no URL returned");
      return null;
    } catch {
      showToast("error", "Image upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  /* ── Slide CRUD ────────────────────────────────────────────── */
  const openNew = () => {
    setEditSlide(EMPTY_SLIDE());
    setIsNew(true);
    setView("edit");
  };

  const openEdit = (slide: HeroSlide) => {
    setEditSlide({ ...slide });
    setIsNew(false);
    setView("edit");
  };

  const cancelEdit = () => { setView("list"); setEditSlide(null); };

  const saveSlide = async () => {
    if (!editSlide) return;
    if (!editSlide.titleEn && !editSlide.titleAr) {
      showToast("error", "Please enter at least one title (English or Arabic)");
      return;
    }
    let updated: HeroSlide[];
    if (isNew) {
      updated = [...slides, editSlide];
    } else {
      updated = slides.map((s) => (s.id === editSlide.id ? editSlide : s));
    }
    setSlides(updated);
    await saveAll(updated);
    setView("list");
    setEditSlide(null);
  };

  const deleteSlide = async (id: string) => {
    if (!confirm("Delete this banner slide?")) return;
    const updated = slides.filter((s) => s.id !== id);
    setSlides(updated);
    await saveAll(updated);
  };

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

  /* ── Section helpers ───────────────────────────────────────── */
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

  /* ── Loading ───────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-12 h-12 border-4 border-[#5260ce] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading homepage settings…</p>
      </div>
    );
  }

  const inp = "w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5260ce]/30 focus:border-[#5260ce] transition-all";

  /* ════════════════════════════════════════════════════════════
     VIEW: EDIT / CREATE SLIDE
  ════════════════════════════════════════════════════════════ */
  if (view === "edit" && editSlide) {
    return (
      <div className="space-y-5 max-w-3xl">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-semibold
            ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
            {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95] rounded-2xl p-6 text-white">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #818cf8 0%, transparent 50%)" }} />
          <div className="relative flex items-center gap-4">
            <button
              onClick={cancelEdit}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl flex items-center justify-center transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center">
              {isNew ? <Plus size={20} /> : <Edit3 size={20} />}
            </div>
            <div>
              <h1 className="text-xl font-extrabold">{isNew ? "Add New Banner" : "Edit Banner"}</h1>
              <p className="text-indigo-300 text-sm mt-0.5">{isNew ? "Create a new hero slide for the homepage" : `Editing: ${editSlide.badge || editSlide.titleEn || "Slide"}`}</p>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <ImageIcon size={16} className="text-[#5260ce]" /> Banner Image
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Full-width background image for this slide. Recommended: 1920×1080px</p>
          </div>
          <div className="p-6 space-y-4">
            {/* Preview */}
            <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center group">
              {editSlide.image ? (
                <>
                  <Image src={getImageUrl(editSlide.image) || editSlide.image} alt="preview" fill className="object-cover" unoptimized />
                  {/* Overlay with info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
                    {editSlide.badge && (
                      <span className="text-xs font-bold bg-white/20 backdrop-blur-sm border border-white/30 text-white px-2 py-1 rounded-lg w-fit mb-1">
                        {editSlide.badge}
                      </span>
                    )}
                    {editSlide.titleEn && (
                      <p className="text-white font-bold text-sm truncate">{editSlide.titleEn}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setEditSlide((prev) => prev ? { ...prev, image: "" } : prev)}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <ImageIcon size={36} className="opacity-30" />
                  <p className="text-sm font-medium">No image selected</p>
                  <p className="text-xs">Upload or paste a URL below</p>
                </div>
              )}
            </div>

            {/* Upload */}
            <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed cursor-pointer font-semibold text-sm transition-all
              ${uploading ? "border-[#5260ce] bg-indigo-50 text-[#5260ce]" : "border-gray-200 text-gray-600 hover:border-[#5260ce] hover:bg-indigo-50/50 hover:text-[#5260ce]"}`}>
              {uploading
                ? <><RefreshCw size={15} className="animate-spin" /> Uploading image…</>
                : <><Upload size={15} /> Upload Image</>
              }
              <input type="file" accept="image/*" className="hidden" disabled={uploading}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await uploadImage(f);
                  if (url) setEditSlide((prev) => prev ? { ...prev, image: url } : prev);
                }}
              />
            </label>

            {/* URL input */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Or paste image URL</label>
              <input
                type="url"
                className={inp}
                placeholder="https://images.unsplash.com/…"
                value={editSlide.image}
                onChange={(e) => setEditSlide((prev) => prev ? { ...prev, image: e.target.value } : prev)}
              />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Edit3 size={16} className="text-[#5260ce]" /> Text Content
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Text overlay displayed on top of the banner image</p>
          </div>
          <div className="p-6 space-y-5">
            {/* Badge */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Badge / Label</label>
              <input
                className={inp}
                placeholder="e.g. Study in Egypt 🇪🇬"
                value={editSlide.badge ?? ""}
                onChange={(e) => setEditSlide((prev) => prev ? { ...prev, badge: e.target.value } : prev)}
              />
              <p className="text-xs text-gray-400 mt-1">Small pill badge shown above the title</p>
            </div>

            {/* Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded">EN</span>
                  Title (English)
                </label>
                <input
                  className={inp}
                  placeholder="Your Future Starts Here"
                  value={editSlide.titleEn ?? ""}
                  onChange={(e) => setEditSlide((prev) => prev ? { ...prev, titleEn: e.target.value } : prev)}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  <span className="bg-green-100 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded">AR</span>
                  Title (Arabic)
                </label>
                <input
                  className={`${inp} text-right`}
                  dir="rtl"
                  placeholder="مستقبلك يبدأ هنا"
                  value={editSlide.titleAr ?? ""}
                  onChange={(e) => setEditSlide((prev) => prev ? { ...prev, titleAr: e.target.value } : prev)}
                />
              </div>
            </div>

            {/* Subtitles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded">EN</span>
                  Subtitle (English)
                </label>
                <textarea
                  className={`${inp} resize-none h-20`}
                  placeholder="Discover amazing programs across Egypt's top universities…"
                  value={editSlide.subEn ?? ""}
                  onChange={(e) => setEditSlide((prev) => prev ? { ...prev, subEn: e.target.value } : prev)}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  <span className="bg-green-100 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded">AR</span>
                  Subtitle (Arabic)
                </label>
                <textarea
                  className={`${inp} resize-none h-20 text-right`}
                  dir="rtl"
                  placeholder="اكتشف برامج رائعة في أفضل جامعات مصر…"
                  value={editSlide.subAr ?? ""}
                  onChange={(e) => setEditSlide((prev) => prev ? { ...prev, subAr: e.target.value } : prev)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 -mx-6 px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={cancelEdit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-all"
          >
            <X size={15} /> Cancel
          </button>
          <button
            onClick={saveSlide}
            disabled={saving || uploading}
            className="flex items-center gap-2 bg-[#5260ce] hover:bg-[#4251be] active:scale-95 text-white font-bold text-sm px-7 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-60"
          >
            {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Saving…" : (isNew ? "Add Banner" : "Save Changes")}
          </button>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════
     VIEW: LIST
  ════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-semibold
          ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95] rounded-2xl p-6 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #818cf8 0%, transparent 50%), radial-gradient(circle at 80% 20%, #c084fc 0%, transparent 50%)" }} />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Homepage Manager</h1>
              <p className="text-indigo-300 text-sm mt-0.5">Hero banners · Page sections · Content</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{slides.length}</p>
              <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">Banners</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{sections.filter((s) => s.enabled).length}</p>
              <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">Active Sections</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100/80 p-1 rounded-2xl inline-flex">
        {([
          { key: "slides",   label: "Hero Banners",  icon: <Layers size={15} /> },
          { key: "sections", label: "Page Sections", icon: <Layout size={15} /> },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === t.key
                ? "bg-white text-[#5260ce] shadow-md shadow-black/5"
                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
            }`}
          >
            <span className={tab === t.key ? "text-[#5260ce]" : "text-gray-400"}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SLIDES TAB ─────────────────────────────────────────── */}
      {tab === "slides" && (
        <div className="space-y-4">
          {/* Add button */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              {slides.length} banner{slides.length !== 1 ? "s" : ""} · drag arrows to reorder
            </p>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 bg-[#5260ce] hover:bg-[#4251be] active:scale-95 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-200"
            >
              <Plus size={16} /> Add Banner
            </button>
          </div>

          {/* Slide cards */}
          {slides.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                <ImageIcon size={24} className="text-gray-300" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-600">No banners yet</p>
                <p className="text-sm text-gray-400 mt-1">Add your first hero banner slide</p>
              </div>
              <button
                onClick={openNew}
                className="inline-flex items-center gap-2 bg-[#5260ce] hover:bg-[#4251be] text-white text-sm font-bold px-6 py-3 rounded-xl transition-all"
              >
                <Plus size={16} /> Add First Banner
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {slides.map((slide, idx) => (
                <div key={slide.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                  {/* Image */}
                  <div className="relative h-40 bg-gray-100 overflow-hidden">
                    {slide.image ? (
                      <Image src={getImageUrl(slide.image) || slide.image} alt={slide.titleEn ?? "slide"} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                        <ImageIcon size={28} className="opacity-30" />
                        <p className="text-xs">No image</p>
                      </div>
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                      <button
                        onClick={() => openEdit(slide)}
                        className="flex items-center gap-1.5 bg-white text-[#5260ce] text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:bg-indigo-50"
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => deleteSlide(slide.id)}
                        className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {/* Order badge */}
                    <div className="absolute top-2 left-2 w-7 h-7 bg-black/50 backdrop-blur-sm text-white text-xs font-bold rounded-lg flex items-center justify-center">
                      #{idx + 1}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    {slide.badge && (
                      <span className="inline-block text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full mb-1.5">
                        {slide.badge}
                      </span>
                    )}
                    <p className="font-bold text-gray-800 text-sm truncate">{slide.titleEn || slide.titleAr || "Untitled slide"}</p>
                    {slide.titleAr && <p className="text-xs text-gray-400 truncate text-right mt-0.5" dir="rtl">{slide.titleAr}</p>}

                    {/* Actions row */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <div className="flex gap-1">
                        <button onClick={() => moveSlide(slide.id, -1)} disabled={idx === 0}
                          className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 flex items-center justify-center transition-colors">
                          <ChevronUp size={13} />
                        </button>
                        <button onClick={() => moveSlide(slide.id, 1)} disabled={idx === slides.length - 1}
                          className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 flex items-center justify-center transition-colors">
                          <ChevronDown size={13} />
                        </button>
                      </div>
                      <button
                        onClick={() => openEdit(slide)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#5260ce] hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Edit3 size={12} /> Edit Banner
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Save order button */}
          {slides.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => saveAll()}
                disabled={saving}
                className="flex items-center gap-2 bg-[#5260ce] hover:bg-[#4251be] active:scale-95 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-60"
              >
                {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? "Saving…" : "Save Order"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── SECTIONS TAB ───────────────────────────────────────── */}
      {tab === "sections" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              {sections.filter((s) => s.enabled).length}/{sections.length} sections visible on homepage
            </p>
            <button
              onClick={() => saveAll()}
              disabled={saving}
              className="flex items-center gap-2 bg-[#5260ce] hover:bg-[#4251be] active:scale-95 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-60"
            >
              {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? "Saving…" : "Save Sections"}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Section · Toggle visibility · Reorder</p>
            </div>
            <div className="divide-y divide-gray-50">
              {sections.map((sec, idx) => (
                <div key={sec.id} className={`flex items-center gap-4 px-5 py-4 transition-all ${!sec.enabled ? "opacity-50" : ""}`}>
                  <GripVertical size={16} className="text-gray-300 shrink-0" />
                  <span className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="flex-1 text-sm font-semibold text-gray-700">{sec.label}</p>
                  <div className="flex gap-1">
                    <button onClick={() => moveSection(sec.id, -1)} disabled={idx === 0}
                      className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 flex items-center justify-center transition-colors">
                      <ChevronUp size={13} />
                    </button>
                    <button onClick={() => moveSection(sec.id, 1)} disabled={idx === sections.length - 1}
                      className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 flex items-center justify-center transition-colors">
                      <ChevronDown size={13} />
                    </button>
                  </div>
                  {/* Toggle switch */}
                  <button
                    onClick={() => toggleSection(sec.id)}
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${sec.enabled ? "bg-emerald-500" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${sec.enabled ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                  <span className={`w-14 text-right text-xs font-semibold flex items-center justify-end gap-1 ${sec.enabled ? "text-emerald-600" : "text-gray-400"}`}>
                    {sec.enabled ? <><Eye size={11} /> On</> : <><EyeOff size={11} /> Off</>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
