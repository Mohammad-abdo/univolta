"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { apiPost } from "@/lib/api";
import { showToast } from "@/lib/toast";
import Link from "next/link";

export default function AddFAQPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    isPublished: true,
    sortOrder: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiPost("/faqs", formData);

      showToast.success("FAQ created successfully!");
      router.push("/dashboard/faqs");
    } catch (error: any) {
      const errorMsg = error.message || "Failed to create FAQ";
      showToast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/faqs">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">
          Add New FAQ
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block font-montserrat-semibold text-sm mb-2">
              Question *
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-montserrat-semibold text-sm mb-2">
              Answer *
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              required
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
          </div>

          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., General, Admissions, Visa"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
          </div>

          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              Sort Order
            </label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              min={0}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
            <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 text-[#5260ce] border-gray-300 rounded focus:ring-[#5260ce]"
              />
              <span className="font-montserrat-semibold text-sm">Published</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold"
          >
            {loading ? "Creating..." : "Create FAQ"}
          </Button>
          <Link href="/dashboard/faqs">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}





