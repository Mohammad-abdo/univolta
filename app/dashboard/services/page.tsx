"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiDelete, apiGet, apiPut } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Edit, Plus, Power, Search, Trash2 } from "lucide-react";

type ServiceRecord = {
  id: string;
  title: string;
  description: string;
  price: string;
  mainImage?: string | null;
  images?: string[];
  isActive?: boolean;
  points?: Array<{ title: string; description: string }>;
  subServices?: Array<{ title: string; price: number }>;
};

const formatPrice = (value: string | number | null | undefined) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return "$0";
  return `$${numeric.toLocaleString(undefined, {
    minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const fetchServices = async () => {
    try {
      const query = new URLSearchParams();
      if (search.trim()) query.set("search", search.trim());
      if (statusFilter !== "all") query.set("status", statusFilter);
      const data = await apiGet<ServiceRecord[]>(`/services${query.toString() ? `?${query.toString()}` : ""}`);
      setServices(data);
    } catch (error: any) {
      showToast.error(error.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [statusFilter]);

  const activeCount = useMemo(() => services.filter((x) => x.isActive).length, [services]);

  const removeService = async (id: string) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await apiDelete(`/services/${id}`);
      showToast.success("Service deleted");
      await fetchServices();
    } catch (error: any) {
      showToast.error(error.message || "Delete failed");
    }
  };

  const toggleStatus = async (item: ServiceRecord) => {
    try {
      await apiPut(`/services/${item.id}/status`, { isActive: !item.isActive });
      showToast.success(item.isActive ? "Service deactivated" : "Service activated");
      await fetchServices();
    } catch (error: any) {
      showToast.error(error.message || "Status update failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-montserrat-bold text-[#121c67]">Services</h1>
          <p className="text-sm text-gray-500">Total: {services.length} | Active: {activeCount}</p>
        </div>
        <Link href="/dashboard/services/add">
          <Button className="bg-[#5260ce] hover:bg-[#4350b0]">
            <Plus className="mr-1 h-4 w-4" /> Add Service
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="flex items-center gap-2 rounded-lg border px-3">
            <Search className="h-4 w-4 text-gray-500" />
            <input className="w-full py-2 outline-none" placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="rounded-lg border px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
          <Button variant="outline" onClick={fetchServices}>Apply Filter</Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">Loading...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-2xl border bg-white">
              <div className="relative h-44 w-full bg-gray-100">
                {item.mainImage ? (
                  <Image src={item.mainImage} alt={item.title} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>
                )}
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="line-clamp-1 text-lg font-semibold text-[#121c67]">{item.title}</h3>
                  <span className={`rounded-full px-2 py-1 text-xs ${item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-gray-600">{item.description}</p>
                <p className="font-semibold text-[#4350b0]">{formatPrice(item.price)}</p>
                <p className="text-xs text-gray-500">
                  Points: {item.points?.length || 0} | Sub-services: {item.subServices?.length || 0}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/dashboard/services/${item.id}/edit`}>
                    <Button size="sm" variant="outline"><Edit className="mr-1 h-4 w-4" />Edit</Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => toggleStatus(item)}>
                    <Power className="mr-1 h-4 w-4" />{item.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => removeService(item.id)}>
                    <Trash2 className="mr-1 h-4 w-4" />Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {services.length === 0 && <div className="col-span-full py-12 text-center text-gray-500">No services found.</div>}
        </div>
      )}
    </div>
  );
}
