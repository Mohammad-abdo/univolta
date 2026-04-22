"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ServiceForm, { ServicePayload } from "../../_components/service-form";
import { apiGet } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { ArrowLeft, PencilRuler, ShieldCheck } from "lucide-react";

type ServiceApi = {
  id: string;
  title: string;
  description: string;
  price: string;
  discount: string;
  mainImage?: string | null;
  images?: string[];
  isActive?: boolean;
  points?: Array<{ title: string; description: string }>;
  subServices?: Array<{ title: string; description: string; price: number; images: string[] }>;
};

export default function EditServicePage() {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<Partial<ServicePayload> | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet<ServiceApi>(`/services/${params.id}`);
        setInitial({
          title: data.title,
          description: data.description,
          price: String(data.price || "0"),
          discount: String(data.discount || "0"),
          mainImage: data.mainImage || "",
          images: data.images || [],
          isActive: Boolean(data.isActive),
          points: data.points || [],
          subServices: data.subServices || [],
        });
      } catch (error: any) {
        showToast.error(error.message || "Failed to load service");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) load();
  }, [params.id]);

  if (loading) return <div className="py-20 text-center">Loading...</div>;
  if (!initial) return <div className="py-20 text-center text-red-500">Service not found.</div>;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#dce2ff] bg-gradient-to-r from-[#f4f6ff] to-white p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-3xl font-montserrat-bold text-[#121c67]">
            <PencilRuler className="h-7 w-7 text-[#5260ce]" />
            Edit Service
          </h1>
          <Link href="/dashboard/services" className="inline-flex items-center gap-2 rounded-lg border border-[#cad4ff] bg-white px-3 py-2 text-sm font-semibold text-[#4350b0] hover:bg-[#f3f5ff]">
            <ArrowLeft className="h-4 w-4 text-[#5260ce]" />
            Back to services
          </Link>
        </div>
        <p className="mb-3 text-sm text-gray-600">
          Update service details, images, points, and sub-services with a modern editing experience.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#edf2ff] px-3 py-1.5 text-xs font-semibold text-[#4350b0]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#5260ce]" />
          Editing ID: {params.id}
        </div>
      </div>
      <ServiceForm mode="edit" serviceId={params.id} initialData={initial} />
    </div>
  );
}
