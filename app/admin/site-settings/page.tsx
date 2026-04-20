"use client";

import React, { useEffect, useState, useCallback } from "react";
import { settingsApi } from "@/lib/admin-api";
import { Save, Upload, Globe, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";

interface FormState {
  siteName:       string;
  tagline:        string;
  logoUrl:        string;
  footerLogoUrl:  string;
}

const DEFAULT: FormState = {
  siteName:      "UniVolta",
  tagline:       "Your Gateway to Egyptian Universities",
  logoUrl:       "",
  footerLogoUrl: "",
};

export default function SiteSettingsPage() {
  const [form, setForm]     = useState<FormState>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState<{ type: "success" | "error"; msg: string } | null>(null);

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
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
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

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logoUrl" | "footerLogoUrl"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token  = localStorage.getItem("accessToken");
    const base   = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
    const fd     = new FormData();
    fd.append("file", file);

    try {
      const res  = await fetch(`${base}/upload`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    fd,
      });
      const data = await res.json();
      if (data.url) setForm((prev) => ({ ...prev, [field]: data.url }));
    } catch {
      showToast("error", "Upload failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <RefreshCw size={24} className="animate-spin mr-2" /> Loading…
      </div>
    );
  }

  const field = (label: string, key: keyof FormState, type: "text" | "url" = "text") => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        value={form[key]}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
      />
    </div>
  );

  const logoField = (
    label: string,
    key: "logoUrl" | "footerLogoUrl",
    hint: string
  ) => (
    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      <p className="text-xs text-gray-400 mb-3">{hint}</p>

      <div className="flex items-center gap-4 mb-3">
        {form[key] ? (
          <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-white">
            <Image src={form[key]} alt={label} fill className="object-contain p-2" unoptimized />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">
            <Globe size={28} />
          </div>
        )}
        <div className="space-y-2">
          <label className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload size={14} />
            Upload image
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, key)} />
          </label>
          <p className="text-xs text-gray-400">or paste a URL below</p>
        </div>
      </div>

      <input
        type="url"
        placeholder="https://..."
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        value={form[key]}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
          ${toast.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="font-bold text-gray-800 text-lg">General Information</h2>
        {field("Site Name",  "siteName")}
        {field("Tagline / Subtitle", "tagline")}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="font-bold text-gray-800 text-lg">Logos</h2>
        {logoField("Site Logo (Header)", "logoUrl", "Shown in the navigation bar. Recommended: transparent PNG, 200×60px")}
        {logoField("Footer Logo",        "footerLogoUrl", "Shown in the site footer. Recommended: light version of logo")}
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[#5260ce] hover:bg-[#4251be] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-60"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
