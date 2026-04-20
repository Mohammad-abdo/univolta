"use client";

import React, { useEffect, useState, useCallback } from "react";
import { settingsApi, FooterContent } from "@/lib/admin-api";
import { Save, Plus, Trash2, RefreshCw, CheckCircle, AlertCircle, Globe, Link2 } from "lucide-react";

const DEFAULT: FooterContent = {
  phone:     "+20 100 000 0000",
  email:     "info@univolta.com",
  address:   "Cairo, Egypt",
  copyright: "© 2024 UniVolta. All rights reserved.",
  quickLinks: [
    { label: "Home",         href: "/" },
    { label: "Universities", href: "/universities" },
    { label: "Programs",     href: "/programs" },
    { label: "About Us",     href: "/about" },
    { label: "Contact",      href: "/contact" },
    { label: "FAQ",          href: "/faq" },
  ],
  socialLinks: [
    { platform: "Facebook",  href: "https://facebook.com" },
    { platform: "Instagram", href: "https://instagram.com" },
    { platform: "Twitter",   href: "https://twitter.com" },
    { platform: "LinkedIn",  href: "https://linkedin.com" },
  ],
};

export default function FooterManager() {
  const [data,    setData]    = useState<FooterContent>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    try {
      const s = await settingsApi.getAll();
      if (s["footer.content"]) setData({ ...DEFAULT, ...(s["footer.content"] as FooterContent) });
    } catch { /* use defaults */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      await settingsApi.set("footer.content", data);
      showToast("success", "Footer saved successfully!");
    } catch (e: any) {
      showToast("error", e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const setField = (key: keyof FooterContent, value: unknown) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const addLink  = (key: "quickLinks" | "socialLinks") =>
    setField(key, [...(data[key] ?? []), { label: "", href: "" }]);

  const removeLink = (key: "quickLinks" | "socialLinks", idx: number) =>
    setField(key, (data[key] ?? []).filter((_, i) => i !== idx));

  const updateLink = (
    key: "quickLinks" | "socialLinks",
    idx: number,
    field: "label" | "href" | "platform",
    value: string
  ) =>
    setField(
      key,
      (data[key] ?? []).map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <RefreshCw size={24} className="animate-spin mr-2" /> Loading…
      </div>
    );
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
          ${toast.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Contact Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-bold text-gray-800 text-lg">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Phone number</label>
            <input className={inputCls} value={data.phone ?? ""} onChange={(e) => setField("phone", e.target.value)} placeholder="+20 100 000 0000" />
          </div>
          <div>
            <label className={labelCls}>Email address</label>
            <input className={inputCls} type="email" value={data.email ?? ""} onChange={(e) => setField("email", e.target.value)} placeholder="info@univolta.com" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Address</label>
            <input className={inputCls} value={data.address ?? ""} onChange={(e) => setField("address", e.target.value)} placeholder="Cairo, Egypt" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Copyright text</label>
            <input className={inputCls} value={data.copyright ?? ""} onChange={(e) => setField("copyright", e.target.value)} placeholder="© 2024 UniVolta. All rights reserved." />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <Link2 size={18} className="text-indigo-400" /> Quick Links
          </h2>
          <button onClick={() => addLink("quickLinks")}
            className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-xl transition-all">
            <Plus size={12} /> Add Link
          </button>
        </div>
        {(data.quickLinks ?? []).map((link, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input className={`${inputCls} flex-1`} placeholder="Label" value={link.label}
              onChange={(e) => updateLink("quickLinks", idx, "label", e.target.value)} />
            <input className={`${inputCls} flex-1`} placeholder="/path or https://..." value={link.href}
              onChange={(e) => updateLink("quickLinks", idx, "href", e.target.value)} />
            <button onClick={() => removeLink("quickLinks", idx)} className="p-2 text-gray-300 hover:text-red-400 transition-colors shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <Globe size={18} className="text-indigo-400" /> Social Media Links
          </h2>
          <button onClick={() => addLink("socialLinks")}
            className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-xl transition-all">
            <Plus size={12} /> Add
          </button>
        </div>
        {(data.socialLinks ?? []).map((link, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input className={`${inputCls} w-32`} placeholder="Platform" value={(link as any).platform ?? ""}
              onChange={(e) => updateLink("socialLinks", idx, "platform", e.target.value)} />
            <input className={`${inputCls} flex-1`} placeholder="https://..." value={link.href}
              onChange={(e) => updateLink("socialLinks", idx, "href", e.target.value)} />
            <button onClick={() => removeLink("socialLinks", idx)} className="p-2 text-gray-300 hover:text-red-400 transition-colors shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[#5260ce] hover:bg-[#4251be] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-60"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving…" : "Save Footer"}
        </button>
      </div>
    </div>
  );
}
