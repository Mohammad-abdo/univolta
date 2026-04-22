"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiPost, apiPut, apiUploadImage, apiUploadImages } from "@/lib/api";
import { getImageUrl } from "@/lib/image-utils";
import { showToast } from "@/lib/toast";
import { Plus, X } from "lucide-react";

export type ServicePoint = {
  title: string;
  description: string;
};

export type SubService = {
  title: string;
  description: string;
  price: number;
  images: string[];
};

export type ServicePayload = {
  title: string;
  description: string;
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
  description: "",
  price: "0",
  discount: "0",
  mainImage: "",
  images: [],
  isActive: true,
  points: [{ title: "", description: "" }],
  subServices: [{ title: "", description: "", price: 0, images: [] }],
};

type Props = {
  mode: "create" | "edit";
  serviceId?: string;
  initialData?: Partial<ServicePayload>;
};

export default function ServiceForm({ mode, serviceId, initialData }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
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
        description: form.description,
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
        showToast.success("Service updated");
      } else {
        await apiPost("/services", payload);
        showToast.success("Service created");
      }
      router.push("/dashboard/services");
      router.refresh();
    } catch (error: any) {
      showToast.error(error.message || "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6">
      <div className="grid gap-4 md:grid-cols-3">
        <input className="rounded-lg border px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
        <input className="rounded-lg border px-3 py-2" type="number" min="0" step="0.01" placeholder="Base Price" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
        <input className="rounded-lg border px-3 py-2" type="number" min="0" step="0.01" placeholder="Discount" value={form.discount} onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))} />
      </div>

      <textarea className="min-h-[110px] w-full rounded-lg border px-3 py-2" placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="font-semibold">Main Image:</label>
        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadMainImage(e.target.files[0])} />
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
          Active
        </label>
        <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[#4350b0]">
          Final price: ${totalCalculatedPrice.toFixed(2)}
        </span>
      </div>
      {form.mainImage ? (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <img src={getImageUrl(form.mainImage)} alt="Main service" className="h-48 w-full object-cover" />
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Service Images</h3>
          <input type="file" accept="image/*" multiple onChange={(e) => e.target.files && uploadServiceImages(e.target.files)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {form.images.map((url, idx) => (
            <div key={`${url}-${idx}`} className="relative overflow-hidden rounded-lg border border-gray-200">
              <img src={getImageUrl(url)} alt={`Service image ${idx + 1}`} className="h-28 w-full object-cover" />
              <button
                type="button"
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                onClick={() => setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Points</h3>
          <Button type="button" variant="outline" onClick={() => setForm((p) => ({ ...p, points: [...p.points, { title: "", description: "" }] }))}>
            <Plus className="mr-1 h-4 w-4" /> Add point
          </Button>
        </div>
        {form.points.map((point, idx) => (
          <div key={idx} className="grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border px-3 py-2" placeholder="Point title" value={point.title} onChange={(e) => setForm((p) => ({ ...p, points: p.points.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)) }))} />
            <div className="flex gap-2">
              <input className="flex-1 rounded-lg border px-3 py-2" placeholder="Point description" value={point.description} onChange={(e) => setForm((p) => ({ ...p, points: p.points.map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)) }))} />
              <Button type="button" variant="outline" onClick={() => setForm((p) => ({ ...p, points: p.points.filter((_, i) => i !== idx) }))}>Remove</Button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Sub Services</h3>
          <Button type="button" variant="outline" onClick={() => setForm((p) => ({ ...p, subServices: [...p.subServices, { title: "", description: "", price: 0, images: [] }] }))}>
            <Plus className="mr-1 h-4 w-4" /> Add sub service
          </Button>
        </div>
        {form.subServices.map((sub, idx) => (
          <div key={idx} className="space-y-3 rounded-xl border p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <input className="rounded-lg border px-3 py-2" placeholder="Sub title" value={sub.title} onChange={(e) => setForm((p) => ({ ...p, subServices: p.subServices.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)) }))} />
              <input className="rounded-lg border px-3 py-2" type="number" min="0" step="0.01" placeholder="Sub price" value={sub.price} onChange={(e) => setForm((p) => ({ ...p, subServices: p.subServices.map((x, i) => (i === idx ? { ...x, price: Number(e.target.value || 0) } : x)) }))} />
              <Button type="button" variant="outline" onClick={() => setForm((p) => ({ ...p, subServices: p.subServices.filter((_, i) => i !== idx) }))}>Remove</Button>
            </div>
            <textarea className="w-full rounded-lg border px-3 py-2" placeholder="Sub description" value={sub.description} onChange={(e) => setForm((p) => ({ ...p, subServices: p.subServices.map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)) }))} />
            <input type="file" accept="image/*" multiple onChange={(e) => e.target.files && uploadSubServiceImages(idx, e.target.files)} />
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
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button className="bg-[#5260ce] hover:bg-[#4350b0]" type="submit" disabled={saving}>
          {saving ? "Saving..." : mode === "edit" ? "Update Service" : "Create Service"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/services")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
