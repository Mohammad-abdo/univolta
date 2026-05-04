"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { apiPost } from "@/lib/api";
import { showToast } from "@/lib/toast";

export default function AddAdvisorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    title: "",
    institution: "",
    availability: "",
    whatsappE164: "",
    sortOrder: 0,
    isActive: true,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiPost("/advisors", {
        name: form.name.trim(),
        title: form.title.trim(),
        institution: form.institution.trim() || undefined,
        availability: form.availability.trim() || undefined,
        whatsappE164: form.whatsappE164.trim(),
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      });
      showToast.success("Advisor created");
      router.push("/dashboard/advisors");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create advisor";
      showToast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/advisors">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">Add advisor</h1>
      </div>
      <form onSubmit={submit} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 max-w-xl space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <div>
          <label className="block text-sm font-semibold mb-1">Name *</label>
          <input
            required
            className="w-full border rounded-lg px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Title *</label>
          <input
            required
            className="w-full border rounded-lg px-3 py-2"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Institution</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={form.institution}
            onChange={(e) => setForm({ ...form, institution: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Availability</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. Mon–Fri, 9:00 AM – 6:00 PM GMT"
            value={form.availability}
            onChange={(e) => setForm({ ...form, availability: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">WhatsApp (E.164) *</label>
          <input
            required
            className="w-full border rounded-lg px-3 py-2"
            placeholder="201234567890"
            value={form.whatsappE164}
            onChange={(e) => setForm({ ...form, whatsappE164: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">Country code + number, digits only (spaces ok).</p>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Sort order (round-robin)</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 0 })}
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          <span className="text-sm font-semibold">Active</span>
        </label>
        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={loading} className="bg-[#5260ce] text-white">
            {loading ? "Saving…" : "Create"}
          </Button>
          <Link href="/dashboard/advisors">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
