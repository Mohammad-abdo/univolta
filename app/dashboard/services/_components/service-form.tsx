"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiPost, apiPut, apiUploadImage, apiUploadImages } from "@/lib/api";
import { getImageUrl } from "@/lib/image-utils";
import { showToast } from "@/lib/toast";
import { getLanguage, t, type Language } from "@/lib/i18n";
import {
  CircleDollarSign,
  FileText,
  ImagePlus,
  Layers3,
  ListChecks,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";

export type ServicePoint = {
  title: string;
  titleAr?: string | null;
  description: string;
  descriptionAr?: string | null;
};

export type SubService = {
  title: string;
  titleAr?: string | null;
  description: string;
  descriptionAr?: string | null;
  price: number;
  images: string[];
};

export type ServicePayload = {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  price: string;
  discount: string;
  mainImage: string;
  images: string[];
  isActive: boolean;
  points: ServicePoint[];
  subServices: SubService[];
};

const emptyForm: ServicePayload = {
  title: "",
  titleAr: "",
  description: "",
  descriptionAr: "",
  price: "0",
  discount: "0",
  mainImage: "",
  images: [],
  isActive: true,
  points: [{ title: "", titleAr: "", description: "", descriptionAr: "" }],
  subServices: [{ title: "", titleAr: "", description: "", descriptionAr: "", price: 0, images: [] }],
};

type Props = {
  mode: "create" | "edit";
  serviceId?: string;
  initialData?: Partial<ServicePayload>;
};

export default function ServiceForm({ mode, serviceId, initialData }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const [form, setForm] = useState<ServicePayload>({
    ...emptyForm,
    ...initialData,
    points: initialData?.points?.length ? initialData.points : emptyForm.points,
    subServices: initialData?.subServices?.length ? initialData.subServices : emptyForm.subServices,
  });

  const totalCalculatedPrice = useMemo(() => {
    const base = Number(form.price || 0);
    const sub = form.subServices.reduce((acc, item) => acc + Number(item.price || 0), 0);
    return base + sub;
  }, [form.price, form.subServices]);

  useEffect(() => {
    setLang(getLanguage());
  }, []);

  const uploadMainImage = async (file: File) => {
    const result = await apiUploadImage(file);
    setForm((prev) => ({ ...prev, mainImage: result.url }));
  };

  const uploadServiceImages = async (files: FileList) => {
    const result = await apiUploadImages(Array.from(files));
    setForm((prev) => ({ ...prev, images: [...prev.images, ...result.files.map((f) => f.url)] }));
  };

  const uploadSubServiceImages = async (index: number, files: FileList) => {
    const result = await apiUploadImages(Array.from(files));
    setForm((prev) => ({
      ...prev,
      subServices: prev.subServices.map((item, i) =>
        i === index ? { ...item, images: [...item.images, ...result.files.map((f) => f.url)] } : item
      ),
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        titleAr: form.titleAr || null,
        description: form.description,
        descriptionAr: form.descriptionAr || null,
        price: Number(form.price || 0),
        discount: Number(form.discount || 0),
        mainImage: form.mainImage || null,
        images: form.images,
        isActive: form.isActive,
        points: form.points.filter((p) => p.title.trim() && p.description.trim()),
        subServices: form.subServices
          .filter((s) => s.title.trim() && s.description.trim() && s.images.length > 0)
          .map((s) => ({ ...s, price: Number(s.price || 0) })),
      };

      if (mode === "edit" && serviceId) {
        await apiPut(`/services/${serviceId}`, payload);
        showToast.success(t("dashboardServiceUpdated", lang));
      } else {
        await apiPost("/services", payload);
        showToast.success(t("dashboardServiceCreated", lang));
      }
      router.push("/dashboard/services");
      router.refresh();
    } catch (error: any) {
      showToast.error(error.message || t("dashboardServiceSaveFailed", lang));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 rounded-3xl border border-[#dce2ff] bg-gradient-to-b from-white to-[#f8f9ff] p-6 md:p-8" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="rounded-2xl border border-[#e3e8ff] bg-white p-4 md:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#5260ce]" />
          <h2 className="text-lg font-semibold text-[#1f2a6e]">{t("dashboardServiceInformation", lang)}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("dashboardTitleEn", lang)}</span>
            <input className="w-full rounded-xl border px-3 py-2.5" placeholder={t("dashboardServiceTitlePlaceholderEn", lang)} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("dashboardTitleAr", lang)}</span>
            <input className="w-full rounded-xl border px-3 py-2.5" placeholder={t("dashboardServiceTitlePlaceholderAr", lang)} value={form.titleAr} onChange={(e) => setForm((p) => ({ ...p, titleAr: e.target.value }))} dir="rtl" />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1.5">
            <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <CircleDollarSign className="h-3.5 w-3.5 text-[#5260ce]" />
              {t("dashboardBasePrice", lang)}
            </span>
            <input className="w-full rounded-xl border px-3 py-2.5" type="number" min="0" step="0.01" placeholder="0" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("dashboardDiscount", lang)}</span>
            <input className="w-full rounded-xl border px-3 py-2.5" type="number" min="0" step="0.01" placeholder="0" value={form.discount} onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))} />
          </label>
        </div>
        <label className="mt-4 block space-y-1.5">
          <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <FileText className="h-3.5 w-3.5 text-[#5260ce]" />
            {t("dashboardDescriptionEn", lang)}
          </span>
          <textarea className="min-h-[120px] w-full rounded-xl border px-3 py-2.5" placeholder={t("dashboardServiceDescriptionPlaceholderEn", lang)} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />
        </label>
        <label className="mt-4 block space-y-1.5">
          <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <FileText className="h-3.5 w-3.5 text-[#5260ce]" />
            {t("dashboardDescriptionAr", lang)}
          </span>
          <textarea className="min-h-[120px] w-full rounded-xl border px-3 py-2.5" placeholder={t("dashboardServiceDescriptionPlaceholderAr", lang)} value={form.descriptionAr} onChange={(e) => setForm((p) => ({ ...p, descriptionAr: e.target.value }))} dir="rtl" />
        </label>
      </div>

      <div className="rounded-2xl border border-[#e3e8ff] bg-white p-4 md:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
          <p className="flex items-center gap-2 font-semibold text-[#1f2a6e]">
            <ImagePlus className="h-4.5 w-4.5 text-[#5260ce]" />
            {t("dashboardServiceMediaVisibility", lang)}
          </p>
          <label className="inline-flex items-center gap-2 rounded-full border border-[#d7defe] bg-[#f4f6ff] px-3 py-1.5 font-medium text-[#4350b0]">
            <ShieldCheck className="h-4 w-4 text-[#5260ce]" />
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
            {t("active", lang)}
          </label>
          <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[#4350b0]">
            {t("dashboardFinalPrice", lang)}: ${totalCalculatedPrice.toFixed(2)}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-dashed border-[#cbd5ff] bg-[#f9faff] p-4">
            <p className="mb-2 text-sm font-semibold text-[#1f2a6e]">{t("dashboardMainImage", lang)}</p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#5260ce] px-3 py-2 text-sm font-semibold text-white hover:bg-[#4350b0]">
              <UploadCloud className="h-4 w-4 text-white" />
              {t("dashboardUploadMainImage", lang)}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadMainImage(e.target.files[0])} />
            </label>
            {form.mainImage ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
                <img src={getImageUrl(form.mainImage)} alt="Main service" className="h-44 w-full object-cover" />
              </div>
            ) : null}
          </div>
          <div className="rounded-xl border border-dashed border-[#cbd5ff] bg-[#f9faff] p-4">
            <p className="mb-2 text-sm font-semibold text-[#1f2a6e]">{t("dashboardGalleryImages", lang)}</p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#5260ce] ring-1 ring-[#cfd7ff] hover:bg-[#f3f5ff]">
              <UploadCloud className="h-4 w-4 text-[#5260ce]" />
              {t("dashboardUploadGalleryImages", lang)}
              <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => e.target.files && uploadServiceImages(e.target.files)} />
            </label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {form.images.map((url, idx) => (
                <div key={`${url}-${idx}`} className="relative overflow-hidden rounded-lg border border-gray-200">
                  <img src={getImageUrl(url)} alt={`Service image ${idx + 1}`} className="h-24 w-full object-cover" />
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                    onClick={() => setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))}
                  >
                    <X className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e3e8ff] bg-white p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold text-[#1f2a6e]">
            <ListChecks className="h-4.5 w-4.5 text-[#5260ce]" />
            {t("dashboardPoints", lang)}
          </h3>
          <Button type="button" variant="outline" onClick={() => setForm((p) => ({ ...p, points: [...p.points, { title: "", titleAr: "", description: "", descriptionAr: "" }] }))}>
            <Plus className="mr-1 h-4 w-4 text-[#5260ce]" /> {t("dashboardAddPoint", lang)}
          </Button>
        </div>
        {form.points.map((point, idx) => (
          <div key={idx} className="mb-3 grid gap-3 rounded-xl border border-gray-200 p-3 md:grid-cols-2">
            <input className="rounded-lg border px-3 py-2" placeholder={t("dashboardPointTitleEn", lang)} value={point.title} onChange={(e) => setForm((p) => ({ ...p, points: p.points.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)) }))} />
            <input className="rounded-lg border px-3 py-2" placeholder={t("dashboardPointTitleAr", lang)} value={point.titleAr || ""} onChange={(e) => setForm((p) => ({ ...p, points: p.points.map((x, i) => (i === idx ? { ...x, titleAr: e.target.value } : x)) }))} dir="rtl" />
            <input className="rounded-lg border px-3 py-2" placeholder={t("dashboardPointDescriptionEn", lang)} value={point.description} onChange={(e) => setForm((p) => ({ ...p, points: p.points.map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)) }))} />
            <div className="flex gap-2">
              <input className="flex-1 rounded-lg border px-3 py-2" placeholder={t("dashboardPointDescriptionAr", lang)} value={point.descriptionAr || ""} onChange={(e) => setForm((p) => ({ ...p, points: p.points.map((x, i) => (i === idx ? { ...x, descriptionAr: e.target.value } : x)) }))} dir="rtl" />
              <Button type="button" variant="outline" onClick={() => setForm((p) => ({ ...p, points: p.points.filter((_, i) => i !== idx) }))}>
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#e3e8ff] bg-white p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold text-[#1f2a6e]">
            <Layers3 className="h-4.5 w-4.5 text-[#5260ce]" />
            {t("dashboardSubServices", lang)}
          </h3>
          <Button type="button" variant="outline" onClick={() => setForm((p) => ({ ...p, subServices: [...p.subServices, { title: "", titleAr: "", description: "", descriptionAr: "", price: 0, images: [] }] }))}>
            <Plus className="mr-1 h-4 w-4 text-[#5260ce]" /> {t("dashboardAddSubService", lang)}
          </Button>
        </div>
        {form.subServices.map((sub, idx) => (
          <div key={idx} className="mb-3 space-y-3 rounded-xl border border-gray-200 p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <input className="rounded-lg border px-3 py-2" placeholder={t("dashboardSubServiceTitleEn", lang)} value={sub.title} onChange={(e) => setForm((p) => ({ ...p, subServices: p.subServices.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)) }))} />
              <input className="rounded-lg border px-3 py-2" placeholder={t("dashboardSubServiceTitleAr", lang)} value={sub.titleAr || ""} onChange={(e) => setForm((p) => ({ ...p, subServices: p.subServices.map((x, i) => (i === idx ? { ...x, titleAr: e.target.value } : x)) }))} dir="rtl" />
              <input className="rounded-lg border px-3 py-2" type="number" min="0" step="0.01" placeholder={t("dashboardSubServicePrice", lang)} value={sub.price} onChange={(e) => setForm((p) => ({ ...p, subServices: p.subServices.map((x, i) => (i === idx ? { ...x, price: Number(e.target.value || 0) } : x)) }))} />
              <Button type="button" variant="outline" onClick={() => setForm((p) => ({ ...p, subServices: p.subServices.filter((_, i) => i !== idx) }))}>
                <X className="h-4 w-4 text-red-500" /> {t("remove", lang)}
              </Button>
            </div>
            <textarea className="w-full rounded-lg border px-3 py-2" placeholder={t("dashboardSubServiceDescriptionEn", lang)} value={sub.description} onChange={(e) => setForm((p) => ({ ...p, subServices: p.subServices.map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)) }))} />
            <textarea className="w-full rounded-lg border px-3 py-2" placeholder={t("dashboardSubServiceDescriptionAr", lang)} value={sub.descriptionAr || ""} onChange={(e) => setForm((p) => ({ ...p, subServices: p.subServices.map((x, i) => (i === idx ? { ...x, descriptionAr: e.target.value } : x)) }))} dir="rtl" />
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#5260ce] ring-1 ring-[#cfd7ff] hover:bg-[#f3f5ff]">
              <UploadCloud className="h-4 w-4 text-[#5260ce]" />
              {t("dashboardUploadSubServiceImages", lang)}
              <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => e.target.files && uploadSubServiceImages(idx, e.target.files)} />
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {sub.images.map((imageUrl, imageIndex) => (
                <div key={`${imageUrl}-${imageIndex}`} className="relative overflow-hidden rounded-lg border border-gray-200">
                  <img src={getImageUrl(imageUrl)} alt={`Sub service ${idx + 1} image ${imageIndex + 1}`} className="h-24 w-full object-cover" />
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        subServices: prev.subServices.map((item, i) =>
                          i === idx ? { ...item, images: item.images.filter((_, ii) => ii !== imageIndex) } : item
                        ),
                      }))
                    }
                  >
                    <X className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button className="bg-[#5260ce] hover:bg-[#4350b0]" type="submit" disabled={saving}>
          <Save className="h-4 w-4 text-white" />
          {saving ? t("saving", lang) : mode === "edit" ? t("dashboardUpdateService", lang) : t("dashboardCreateService", lang)}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/services")}>
          <X className="h-4 w-4 text-gray-700" />
          {t("cancel", lang)}
        </Button>
      </div>
    </form>
  );
}
