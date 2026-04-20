"use client";

import React, { useEffect, useState, useCallback } from "react";
import { settingsApi } from "@/lib/admin-api";
import { getImageUrl } from "@/lib/image-utils";
import {
  Save, Upload, Globe, RefreshCw, CheckCircle, AlertCircle,
  Settings, Type, Image as ImageIcon, X, Eye,
} from "lucide-react";
import Image from "next/image";

type Tab = "general" | "logos";

interface FormState {
  siteName:      string;
  tagline:       string;
  logoUrl:       string;
  footerLogoUrl: string;
}

const DEFAULT: FormState = {
  siteName:      "UniVolta",
  tagline:       "Your Gateway to Egyptian Universities",
  logoUrl:       "",
  footerLogoUrl: "",
};

export default function SiteSettingsPage() {
  const [form,       setForm]       = useState<FormState>(DEFAULT);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [tab,        setTab]        = useState<Tab>("general");
  const [uploading,  setUploading]  = useState<"logoUrl" | "footerLogoUrl" | null>(null);
  const [toast,      setToast]      = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadSettings = useCallback(async () => {
    try {
      const s = await settingsApi.getAll();
      setForm({
        siteName:      (s["site.name"]         as string) ?? DEFAULT.siteName,
        tagline:       (s["site.tagline"]       as string) ?? DEFAULT.tagline,
        logoUrl:       (s["site.logoUrl"]       as string) ?? "",
        footerLogoUrl: (s["site.footerLogoUrl"] as string) ?? "",
      });
    } catch { /* use defaults */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const save = async () => {
    setSaving(true);
    try {
      await Promise.all([
        settingsApi.set("site.name",         form.siteName),
        settingsApi.set("site.tagline",       form.tagline),
        settingsApi.set("site.logoUrl",       form.logoUrl),
        settingsApi.set("site.footerLogoUrl", form.footerLogoUrl),
      ]);
      showToast("success", "Settings saved successfully!");
    } catch (e: any) {
      showToast("error", e.message ?? "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "logoUrl" | "footerLogoUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    const token = localStorage.getItem("accessToken");
    const base  = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
    const fd    = new FormData();
    fd.append("image", file);
    try {
      const res  = await fetch(`${base}/upload/image`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (data.url) setForm((prev) => ({ ...prev, [field]: data.url }));
      else showToast("error", "Upload failed — no URL returned");
    } catch { showToast("error", "Upload failed"); }
    finally { setUploading(null); }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-12 h-12 border-4 border-[#5260ce] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading settings…</p>
      </div>
    );
  }

  const inp = "w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5260ce]/30 focus:border-[#5260ce] transition-all";

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "general", label: "General",  icon: <Type      size={15} /> },
    { key: "logos",   label: "Logos",    icon: <ImageIcon size={15} /> },
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-semibold
          ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#78350f] rounded-2xl p-6 text-white">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 10% 90%, #f59e0b 0%, transparent 50%), radial-gradient(circle at 90% 10%, #5260ce 0%, transparent 50%)" }} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Settings size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Site Settings</h1>
            <p className="text-white/60 text-sm mt-0.5">Manage your brand identity and visual assets</p>
          </div>
        </div>
        {/* Preview strip */}
        <div className="relative mt-5 bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
          {form.logoUrl ? (
            <div className="relative w-8 h-8 shrink-0">
              <Image src={getImageUrl(form.logoUrl) || form.logoUrl} alt="logo" fill className="object-contain" unoptimized />
            </div>
          ) : (
            <Globe size={18} className="text-white/40 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{form.siteName || "Site Name"}</p>
            <p className="text-white/50 text-xs truncate">{form.tagline || "Your tagline here…"}</p>
          </div>
          <span className="ml-auto text-[10px] text-white/40 bg-white/10 px-2 py-1 rounded-lg font-medium shrink-0">Live preview</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100/80 p-1 rounded-2xl inline-flex">
        {tabs.map((t) => (
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

      {/* ── TAB: General ─────────────────────────────────────── */}
      {tab === "general" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Type size={16} className="text-[#5260ce]" /> General Information
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Basic identity details shown across your site</p>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                <div className="w-5 h-5 rounded-lg bg-indigo-100 text-[#5260ce] flex items-center justify-center">
                  <Type size={10} />
                </div>
                Site Name
              </label>
              <input
                type="text"
                className={inp}
                value={form.siteName}
                onChange={(e) => setForm((prev) => ({ ...prev, siteName: e.target.value }))}
                placeholder="UniVolta"
              />
              <p className="text-xs text-gray-400 mt-1.5">Shown in browser tab, header logo text and meta title</p>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                <div className="w-5 h-5 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Type size={10} />
                </div>
                Tagline / Subtitle
              </label>
              <input
                type="text"
                className={inp}
                value={form.tagline}
                onChange={(e) => setForm((prev) => ({ ...prev, tagline: e.target.value }))}
                placeholder="Your Gateway to Egyptian Universities"
              />
              <p className="text-xs text-gray-400 mt-1.5">Shown below the logo or as a meta description</p>
            </div>

            {/* Character counts */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-400 font-medium">Site Name length</p>
                <p className={`text-lg font-bold mt-0.5 ${form.siteName.length > 40 ? "text-red-500" : "text-gray-700"}`}>
                  {form.siteName.length} <span className="text-xs font-normal text-gray-400">/ 40 chars</span>
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-400 font-medium">Tagline length</p>
                <p className={`text-lg font-bold mt-0.5 ${form.tagline.length > 80 ? "text-red-500" : "text-gray-700"}`}>
                  {form.tagline.length} <span className="text-xs font-normal text-gray-400">/ 80 chars</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Logos ───────────────────────────────────────── */}
      {tab === "logos" && (
        <div className="space-y-4">
          {([
            {
              key:   "logoUrl" as const,
              label: "Header Logo",
              hint:  "Shown in the top navigation bar",
              spec:  "Transparent PNG · 200 × 60 px recommended",
              bg:    "bg-white",
            },
            {
              key:   "footerLogoUrl" as const,
              label: "Footer Logo",
              hint:  "Shown in the site footer",
              spec:  "Light/white version of logo · transparent PNG",
              bg:    "bg-[#1e1b4b]",
            },
          ]).map(({ key, label, hint, spec, bg }) => (
            <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <ImageIcon size={15} className="text-[#5260ce]" /> {label}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">{hint}</p>
              </div>
              <div className="p-6 space-y-4">
                {/* Preview box */}
                <div className={`relative rounded-xl border-2 border-dashed border-gray-200 overflow-hidden h-28 flex items-center justify-center ${bg}`}>
                  {form[key] ? (
                    <>
                      <div className="relative w-40 h-16">
                        <Image src={getImageUrl(form[key]) || form[key]} alt={label} fill className="object-contain" unoptimized />
                      </div>
                      <button
                        onClick={() => setForm((prev) => ({ ...prev, [key]: "" }))}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                      >
                        <X size={13} />
                      </button>
                      <a
                        href={getImageUrl(form[key]) || form[key]}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                      >
                        <Eye size={12} />
                      </a>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <ImageIcon size={28} className="opacity-30" />
                      <p className="text-xs font-medium">No logo uploaded</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">{spec}</p>

                {/* Upload button */}
                <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed cursor-pointer font-semibold text-sm transition-all
                  ${uploading === key
                    ? "border-[#5260ce] bg-indigo-50 text-[#5260ce]"
                    : "border-gray-200 text-gray-600 hover:border-[#5260ce] hover:bg-indigo-50 hover:text-[#5260ce]"}`}>
                  {uploading === key
                    ? <><RefreshCw size={15} className="animate-spin" /> Uploading…</>
                    : <><Upload size={15} /> Click to Upload Image</>
                  }
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, key)} disabled={!!uploading} />
                </label>

                {/* URL input */}
                <div className="relative">
                  <input
                    type="url"
                    placeholder="or paste image URL: https://…"
                    className={inp}
                    value={form[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Bar */}
      <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-sm border-t border-gray-100 -mx-6 px-6 py-4 flex items-center justify-between">
        <p className="text-xs text-gray-400 font-medium">Changes are not saved automatically</p>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[#5260ce] hover:bg-[#4251be] active:scale-95 text-white text-sm font-bold px-7 py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-60"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
