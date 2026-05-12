"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/constants";
import { showToast } from "@/lib/toast";
import { Plus, Trash2, GripVertical, Save, RotateCcw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pickLocalized } from "@/lib/localized";

interface TermsItem {
  type: "body" | "list";
  content?: string | { en: string; ar?: string };
  items?: Array<string | { en: string; ar?: string }>;
}

interface TermsSection {
  id: string;
  title: string | { en: string; ar?: string };
  titleAr?: string;
  data: TermsItem;
}

interface TermsData {
  welcomeMessage: string | { en: string; ar?: string };
  welcomeMessageAr?: string;
  sections: TermsSection[];
  lastUpdated?: string;
}

const DEFAULT_DATA: TermsData = {
  welcomeMessage: { en: "Welcome to UniVolta. By accessing and using our website, you agree to comply with the following terms and conditions. Please read them carefully.", ar: "مرحباً بك في UniVolta. من خلال الوصول إلى موقعنا واستخدامه، فإنك توافق على الامتثال للشروط والأحكام التالية." },
  sections: [
    { id: "1", title: { en: "1. About the Platform", ar: "١. عن المنصة" }, data: { type: "body", content: { en: "UniVolta is an online platform that facilitates student applications to international universities.", ar: "UniVolta منصة إلكترونية تُسهّل تقديم طلبات الطلاب إلى الجامعات الدولية." } } },
    { id: "2", title: { en: "2. Acceptance of Terms", ar: "٢. قبول الشروط" }, data: { type: "body", content: { en: "By using this platform, you acknowledge that you have read, understood, and agreed to these terms.", ar: "باستخدامك لهذه المنصة، فإنك تقر بأنك قرأت وفهمت ووافقت على هذه الشروط." } } },
    { id: "3", title: { en: "3. User Account", ar: "٣. حساب المستخدم" }, data: { type: "list", items: [{ en: "You must provide accurate and complete information.", ar: "يجب تقديم معلومات دقيقة وكاملة." }, { en: "You are responsible for maintaining the confidentiality of your credentials.", ar: "أنت مسؤول عن الحفاظ على سرية بيانات تسجيل الدخول." }, { en: "UniVolta reserves the right to suspend accounts that violate policies.", ar: "تحتفظ UniVolta بحق تعليق الحسابات التي تخالف السياسات." }] } },
  ],
};

export default function TermsEditorPage() {
  const [data, setData] = useState<TermsData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"en" | "ar">("en");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch(`${API_BASE_URL}/settings/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((settings) => {
        if (settings["terms.sections"]) {
          const raw = settings["terms.sections"] as TermsData;
          // Backward compatible: if legacy `welcomeMessageAr/titleAr` exist, keep them but prefer `{en,ar}` when present.
          setData(raw);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    const token = localStorage.getItem("accessToken");
    try {
      const payload = { ...data, lastUpdated: new Date().toISOString() };
      const res = await fetch(`${API_BASE_URL}/settings/terms.sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ value: payload }),
      });
      if (!res.ok) throw new Error();
      setData(payload);
      showToast.success("Terms saved successfully");
    } catch {
      showToast.error("Failed to save terms");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => { setData(DEFAULT_DATA); showToast.success("Reset to defaults"); };

  const addSection = () => {
    const id = Date.now().toString();
    setData((d) => ({
      ...d,
      sections: [...d.sections, { id, title: { en: "", ar: "" }, data: { type: "body", content: { en: "", ar: "" } } }],
    }));
  };

  const removeSection = (id: string) =>
    setData((d) => ({ ...d, sections: d.sections.filter((s) => s.id !== id) }));

  const updateSection = (id: string, patch: Partial<TermsSection>) =>
    setData((d) => ({
      ...d,
      sections: d.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));

  const updateSectionData = (id: string, patch: Partial<TermsItem>) =>
    setData((d) => ({
      ...d,
      sections: d.sections.map((s) =>
        s.id === id ? { ...s, data: { ...s.data, ...patch } } : s
      ),
    }));

  const addListItem = (id: string) =>
    setData((d) => ({
      ...d,
      sections: d.sections.map((s) =>
        s.id === id
          ? { ...s, data: { ...s.data, items: [...(s.data.items ?? []), { en: "", ar: "" }] } }
          : s
      ),
    }));

  const updateListItem = (sectionId: string, idx: number, val: { en: string; ar?: string }) =>
    setData((d) => ({
      ...d,
      sections: d.sections.map((s) =>
        s.id === sectionId
          ? { ...s, data: { ...s.data, items: s.data.items?.map((it, i) => (i === idx ? val : it)) } }
          : s
      ),
    }));

  const removeListItem = (sectionId: string, idx: number) =>
    setData((d) => ({
      ...d,
      sections: d.sections.map((s) =>
        s.id === sectionId
          ? { ...s, data: { ...s.data, items: s.data.items?.filter((_, i) => i !== idx) } }
          : s
      ),
    }));

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5260ce] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(82,96,206,0.12)]">
            <FileText className="h-5 w-5 text-[#5260ce]" />
          </div>
          <div>
            <h1 className="text-xl font-montserrat-bold text-[#121c67]">Terms & Conditions Editor</h1>
            <p className="text-xs text-gray-500">
              {data.lastUpdated ? `Last updated: ${new Date(data.lastUpdated).toLocaleDateString()}` : "Not yet saved"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reset} className="gap-1.5 text-gray-600">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button size="sm" onClick={save} disabled={saving} className="gap-1.5 bg-[#5260ce] hover:bg-[#4352b8]">
            <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Language Tab */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
        {(["en", "ar"] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setActiveTab(lang)}
            className={`rounded-lg px-4 py-1.5 text-sm font-montserrat-semibold transition-all ${
              activeTab === lang ? "bg-white text-[#5260ce] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {lang === "en" ? "🇬🇧 English" : "🇸🇦 Arabic"}
          </button>
        ))}
      </div>

      {/* Welcome Message */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <label className="mb-2 block text-sm font-montserrat-semibold text-[#121c67]">
          Welcome / Intro Message {activeTab === "ar" && "(Arabic)"}
        </label>
        <textarea
          rows={3}
          dir={activeTab === "ar" ? "rtl" : "ltr"}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#5260ce] focus:outline-none focus:ring-2 focus:ring-[#5260ce]/20 resize-none"
          value={
            activeTab === "en"
              ? pickLocalized(data.welcomeMessage, "en")
              : pickLocalized(data.welcomeMessage, "ar")
          }
          onChange={(e) =>
            setData((d) => ({
              ...d,
              welcomeMessage: {
                en: activeTab === "en" ? e.target.value : pickLocalized(d.welcomeMessage, "en"),
                ar: activeTab === "ar" ? e.target.value : pickLocalized(d.welcomeMessage, "ar"),
              },
            }))
          }
        />
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-montserrat-bold text-[#121c67]">
            Sections <span className="text-sm font-normal text-gray-400">({data.sections.length})</span>
          </h2>
          <Button size="sm" variant="outline" onClick={addSection} className="gap-1.5 border-[#5260ce] text-[#5260ce]">
            <Plus className="h-3.5 w-3.5" /> Add Section
          </Button>
        </div>

        {data.sections.map((section, idx) => (
          <div key={section.id} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-gray-50 bg-[#f8f9ff] px-4 py-3">
              <GripVertical className="h-4 w-4 shrink-0 text-gray-300" />
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5260ce] text-[10px] font-montserrat-bold text-white">
                {idx + 1}
              </span>
              <input
                dir={activeTab === "ar" ? "rtl" : "ltr"}
                className="flex-1 bg-transparent text-sm font-montserrat-semibold text-[#121c67] focus:outline-none placeholder:text-gray-400"
                placeholder={activeTab === "en" ? "Section title…" : "عنوان القسم…"}
                value={activeTab === "en" ? pickLocalized(section.title, "en") : pickLocalized(section.title, "ar")}
                onChange={(e) =>
                  updateSection(section.id, {
                    title: {
                      en: activeTab === "en" ? e.target.value : pickLocalized(section.title, "en"),
                      ar: activeTab === "ar" ? e.target.value : pickLocalized(section.title, "ar"),
                    },
                  })
                }
              />
              <button
                onClick={() => removeSection(section.id)}
                className="shrink-0 rounded-lg p-1.5 text-red-400 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Type toggle */}
              <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5 w-fit text-xs">
                {(["body", "list"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      updateSectionData(section.id, {
                        type,
                        content: type === "body" ? { en: "", ar: "" } : undefined,
                        items: type === "list" ? [{ en: "", ar: "" }] : undefined,
                      })
                    }
                    className={`rounded-md px-3 py-1 font-montserrat-semibold transition-all ${section.data.type === type ? "bg-white text-[#5260ce] shadow-sm" : "text-gray-400"}`}
                  >
                    {type === "body" ? "Paragraph" : "Bullet List"}
                  </button>
                ))}
              </div>

              {section.data.type === "body" ? (
                <textarea
                  rows={3}
                  dir={activeTab === "ar" ? "rtl" : "ltr"}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#5260ce] focus:outline-none focus:ring-2 focus:ring-[#5260ce]/20 resize-none"
                  placeholder={activeTab === "en" ? "Section content…" : "محتوى القسم…"}
                  value={activeTab === "en" ? pickLocalized(section.data.content, "en") : pickLocalized(section.data.content, "ar")}
                  onChange={(e) =>
                    updateSectionData(section.id, {
                      content: {
                        en: activeTab === "en" ? e.target.value : pickLocalized(section.data.content, "en"),
                        ar: activeTab === "ar" ? e.target.value : pickLocalized(section.data.content, "ar"),
                      },
                    })
                  }
                />
              ) : (
                <div className="space-y-2">
                  {(section.data.items ?? []).map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#5260ce]" />
                      <input
                        dir={activeTab === "ar" ? "rtl" : "ltr"}
                        className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#5260ce] focus:outline-none focus:ring-2 focus:ring-[#5260ce]/20"
                        placeholder={activeTab === "en" ? `Item ${i + 1}…` : `البند ${i + 1}…`}
                        value={activeTab === "en" ? pickLocalized(item, "en") : pickLocalized(item, "ar")}
                        onChange={(e) => {
                          const en = activeTab === "en" ? e.target.value : pickLocalized(item, "en");
                          const ar = activeTab === "ar" ? e.target.value : pickLocalized(item, "ar");
                          updateListItem(section.id, i, { en, ar });
                        }}
                      />
                      <button
                        onClick={() => removeListItem(section.id, i)}
                        className="shrink-0 rounded-lg p-1.5 text-red-400 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addListItem(section.id)}
                    className="flex items-center gap-1.5 text-xs text-[#5260ce] hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Add item
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {data.sections.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-12 text-center">
            <FileText className="mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-400">No sections yet. Click "Add Section" to get started.</p>
          </div>
        )}
      </div>

      {/* Bottom Save */}
      <div className="flex justify-end pt-2">
        <Button onClick={save} disabled={saving} className="gap-2 bg-[#5260ce] px-8 hover:bg-[#4352b8]">
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}
