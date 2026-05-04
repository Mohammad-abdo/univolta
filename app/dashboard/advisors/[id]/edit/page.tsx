"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Link2 } from "lucide-react";
import { apiGet, apiPut } from "@/lib/api";
import { showToast } from "@/lib/toast";

export default function EditAdvisorPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [origin, setOrigin] = useState("");
  const [form, setForm] = useState({
    name: "",
    title: "",
    institution: "",
    availability: "",
    whatsappE164: "",
    sortOrder: 0,
    isActive: true,
    referralToken: "",
  });

  useEffect(() => {
    setOrigin(typeof window !== "undefined" ? window.location.origin : "");
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const a = await apiGet<{
          name: string;
          title: string;
          institution: string | null;
          availability: string | null;
          whatsappE164: string;
          sortOrder: number;
          isActive: boolean;
          referralToken: string;
        }>(`/advisors/${id}`);
        if (cancelled) return;
        setForm({
          name: a.name,
          title: a.title,
          institution: a.institution ?? "",
          availability: a.availability ?? "",
          whatsappE164: a.whatsappE164,
          sortOrder: a.sortOrder,
          isActive: a.isActive,
          referralToken: a.referralToken,
        });
      } catch {
        showToast.error("Failed to load advisor");
        router.push("/dashboard/advisors");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  const copyReferral = () => {
    const url = `${origin}/r/${form.referralToken}`;
    void navigator.clipboard.writeText(url);
    showToast.success("Referral link copied");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError("");
    setSaving(true);
    try {
      await apiPut(`/advisors/${id}`, {
        name: form.name.trim(),
        title: form.title.trim(),
        institution: form.institution.trim() || undefined,
        availability: form.availability.trim() || undefined,
        whatsappE164: form.whatsappE164.trim(),
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      });
      showToast.success("Advisor updated");
      router.push("/dashboard/advisors");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update";
      showToast.error(msg);
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!id) {
    return <div className="p-6">Invalid</div>;
  }
  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading…</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/advisors">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">Edit advisor</h1>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={copyReferral}>
          <Link2 className="w-4 h-4 mr-1" />
          Copy referral link
        </Button>
        <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">
          {origin}/r/{form.referralToken}
        </code>
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
            value={form.availability}
            onChange={(e) => setForm({ ...form, availability: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">WhatsApp (E.164) *</label>
          <input
            required
            className="w-full border rounded-lg px-3 py-2"
            value={form.whatsappE164}
            onChange={(e) => setForm({ ...form, whatsappE164: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Sort order</label>
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
          <Button type="submit" disabled={saving} className="bg-[#5260ce] text-white">
            {saving ? "Saving…" : "Save"}
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
