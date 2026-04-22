"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ServiceForm, { ServicePayload } from "../../_components/service-form";
import { apiGet } from "@/lib/api";
import { showToast } from "@/lib/toast";

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
    <div className="space-y-4">
      <h1 className="text-3xl font-montserrat-bold text-[#121c67]">Edit Service</h1>
      <ServiceForm mode="edit" serviceId={params.id} initialData={initial} />
    </div>
  );
}
