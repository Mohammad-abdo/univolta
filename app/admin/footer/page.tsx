"use client";

import React, { useEffect, useState, useCallback } from "react";
import { settingsApi, FooterContent } from "@/lib/admin-api";
import {
  Save, Plus, Trash2, RefreshCw, CheckCircle, AlertCircle,
  Globe, Link2, Phone, Mail, MapPin, Copyright, Share2,
  Facebook, Instagram, Twitter, Linkedin, ExternalLink,
} from "lucide-react";

type Tab = "contact" | "links" | "social";

const DEFAULT: FooterContent = {
  phone:      "+20 100 000 0000",
  email:      "info@univolta.com",
  address:    "Cairo, Egypt",
  copyright:  "© 2024 UniVolta. All rights reserved.",
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

const SOCIAL_ICON: Record<string, React.ReactNode> = {
  facebook:  <Facebook  size={14} />,
  instagram: <Instagram size={14} />,
  twitter:   <Twitter   size={14} />,
  linkedin:  <Linkedin  size={14} />,
};

export default function FooterManager() {
  const [data,    setData]    = useState<FooterContent>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [tab,     setTab]     = useState<Tab>("contact");
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

  const addLink = (key: "quickLinks" | "socialLinks") => {
    const newItem = key === "quickLinks"
      ? { label: "", href: "" }
      : { platform: "", href: "" };
    setData((prev) => ({ ...prev, [key]: [...(prev[key] ?? []), newItem] }));
  };

  const removeLink = (key: "quickLinks" | "socialLinks", idx: number) =>
    setData((prev) => ({ ...prev, [key]: (prev[key] ?? []).filter((_, i) => i !== idx) }));

  const updateLink = (
    key: "quickLinks" | "socialLinks",
    idx: number,
    field: "label" | "href" | "platform",
    value: string
  ) =>
    setData((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-12 h-12 border-4 border-[#5260ce] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading footer settings…</p>
      </div>
    );
  }

  const inp = "w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5260ce]/30 focus:border-[#5260ce] transition-all";

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "contact", label: "Contact Info", icon: <Phone   size={15} /> },
    { key: "links",   label: "Quick Links",  icon: <Link2   size={15} />, count: data.quickLinks?.length ?? 0 },
    { key: "social",  label: "Social Media", icon: <Share2  size={15} />, count: data.socialLinks?.length ?? 0 },
  ];

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
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f766e] rounded-2xl p-6 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 20%, #5260ce 0%, transparent 50%)" }} />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Globe size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Footer Manager</h1>
              <p className="text-white/60 text-sm mt-0.5">Contact info · Navigation links · Social media</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-center backdrop-blur-sm">
              <p className="text-xl font-bold">{(data.quickLinks?.length ?? 0) + (data.socialLinks?.length ?? 0)}</p>
              <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">Total Links</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100/80 p-1 rounded-2xl w-full md:w-auto md:inline-flex">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === t.key
                ? "bg-white text-[#5260ce] shadow-md shadow-black/5"
                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
            }`}
          >
            <span className={tab === t.key ? "text-[#5260ce]" : "text-gray-400"}>{t.icon}</span>
            {t.label}
            {t.count !== undefined && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                tab === t.key ? "bg-[#5260ce]/10 text-[#5260ce]" : "bg-gray-200 text-gray-500"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: Contact Info ─────────────────────────────────── */}
      {tab === "contact" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Phone size={16} className="text-[#5260ce]" /> Contact Information
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Displayed in the footer section of your website</p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                <div className="w-5 h-5 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Phone size={10} /></div>
                Phone Number
              </label>
              <input className={inp} value={data.phone ?? ""} onChange={(e) => setField("phone", e.target.value)} placeholder="+20 100 000 0000" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                <div className="w-5 h-5 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"><Mail size={10} /></div>
                Email Address
              </label>
              <input className={inp} type="email" value={data.email ?? ""} onChange={(e) => setField("email", e.target.value)} placeholder="info@univolta.com" />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                <div className="w-5 h-5 rounded-lg bg-red-100 text-red-500 flex items-center justify-center"><MapPin size={10} /></div>
                Address
              </label>
              <input className={inp} value={data.address ?? ""} onChange={(e) => setField("address", e.target.value)} placeholder="Cairo, Egypt" />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                <div className="w-5 h-5 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center"><Copyright size={10} /></div>
                Copyright Text
              </label>
              <input className={inp} value={data.copyright ?? ""} onChange={(e) => setField("copyright", e.target.value)} placeholder="© 2024 UniVolta. All rights reserved." />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Quick Links ──────────────────────────────────── */}
      {tab === "links" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Link2 size={16} className="text-[#5260ce]" /> Quick Links
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Navigation links shown in the footer</p>
            </div>
            <button
              onClick={() => addLink("quickLinks")}
              className="inline-flex items-center gap-2 bg-[#5260ce] hover:bg-[#4251be] active:scale-95 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-200"
            >
              <Plus size={15} /> Add Link
            </button>
          </div>

          <div className="p-6 space-y-3">
            {(data.quickLinks ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                  <Link2 size={22} className="opacity-40" />
                </div>
                <p className="font-medium text-sm">No links yet</p>
                <button
                  onClick={() => addLink("quickLinks")}
                  className="inline-flex items-center gap-2 bg-[#5260ce] hover:bg-[#4251be] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all mt-1"
                >
                  <Plus size={15} /> Add Your First Link
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[24px_1fr_1fr_36px] gap-3 px-1 mb-1">
                  <div />
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Label</p>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">URL / Path</p>
                  <div />
                </div>
                {(data.quickLinks ?? []).map((link, idx) => (
                  <div key={idx} className="grid grid-cols-[24px_1fr_1fr_36px] gap-3 items-center group">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <input
                      className={inp}
                      placeholder="e.g. Home"
                      value={link.label}
                      onChange={(e) => updateLink("quickLinks", idx, "label", e.target.value)}
                    />
                    <div className="relative">
                      <input
                        className={`${inp} pr-9`}
                        placeholder="/path or https://…"
                        value={link.href}
                        onChange={(e) => updateLink("quickLinks", idx, "href", e.target.value)}
                      />
                      {link.href && (
                        <a href={link.href} target="_blank" rel="noreferrer"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-indigo-500 transition-colors">
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => removeLink("quickLinks", idx)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-300 hover:text-white hover:bg-red-500 transition-all border border-gray-200 hover:border-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addLink("quickLinks")}
                  className="w-full mt-2 flex items-center justify-center gap-2 border-2 border-dashed border-indigo-200 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-xl py-3 text-sm font-semibold transition-all"
                >
                  <Plus size={16} /> Add Another Link
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Social Media ─────────────────────────────────── */}
      {tab === "social" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Share2 size={16} className="text-[#5260ce]" /> Social Media Links
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Social platform icons in the footer</p>
            </div>
            <button
              onClick={() => addLink("socialLinks")}
              className="inline-flex items-center gap-2 bg-[#5260ce] hover:bg-[#4251be] active:scale-95 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-200"
            >
              <Plus size={15} /> Add Platform
            </button>
          </div>

          <div className="p-6 space-y-3">
            {(data.socialLinks ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                  <Share2 size={22} className="opacity-40" />
                </div>
                <p className="font-medium text-sm">No social links yet</p>
                <button
                  onClick={() => addLink("socialLinks")}
                  className="inline-flex items-center gap-2 bg-[#5260ce] hover:bg-[#4251be] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all mt-1"
                >
                  <Plus size={15} /> Add First Platform
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[24px_160px_1fr_36px] gap-3 px-1 mb-1">
                  <div />
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Platform</p>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Profile URL</p>
                  <div />
                </div>
                {(data.socialLinks ?? []).map((link, idx) => {
                  const platformKey = ((link as any).platform ?? "").toLowerCase();
                  const icon = SOCIAL_ICON[platformKey];
                  return (
                    <div key={idx} className="grid grid-cols-[24px_160px_1fr_36px] gap-3 items-center group">
                      <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {icon ?? <Globe size={13} />}
                        </div>
                        <input
                          className={`${inp} pl-8`}
                          placeholder="e.g. Facebook"
                          value={(link as any).platform ?? ""}
                          onChange={(e) => updateLink("socialLinks", idx, "platform", e.target.value)}
                        />
                      </div>
                      <div className="relative">
                        <input
                          className={`${inp} pr-9`}
                          placeholder="https://…"
                          value={link.href}
                          onChange={(e) => updateLink("socialLinks", idx, "href", e.target.value)}
                        />
                        {link.href && (
                          <a href={link.href} target="_blank" rel="noreferrer"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-indigo-500 transition-colors">
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => removeLink("socialLinks", idx)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-300 hover:text-white hover:bg-red-500 transition-all border border-gray-200 hover:border-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
                <button
                  onClick={() => addLink("socialLinks")}
                  className="w-full mt-2 flex items-center justify-center gap-2 border-2 border-dashed border-indigo-200 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-xl py-3 text-sm font-semibold transition-all"
                >
                  <Plus size={16} /> Add Another Platform
                </button>
              </>
            )}
          </div>
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
          {saving ? "Saving…" : "Save Footer"}
        </button>
      </div>
    </div>
  );
}
