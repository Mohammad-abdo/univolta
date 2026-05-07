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
    questionEn: "",
    questionAr: "",
    answerEn: "",
    answerAr: "",
    category: "",
    isPublished: true,
    sortOrder: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiPost("/faqs", {
        question: {
          en: formData.questionEn.trim(),
          ar: formData.questionAr.trim() || "",
        },
        answer: {
          en: formData.answerEn.trim(),
          ar: formData.answerAr.trim() || "",
        },
        category: formData.category.trim() || undefined,
        isPublished: formData.isPublished,
        sortOrder: formData.sortOrder,
      });

      showToast.success("FAQ created successfully!");
      router.push("/dashboard/faqs");
    } catch (error: any) {
      let errorMsg = error.message || "Failed to create FAQ";
      // If the API provided details, append them
      if (error.details && Array.isArray(error.details)) {
        errorMsg += ": " + error.details.map((d: any) => `${d.path.join(".")}: ${d.message}`).join(", ");
      }
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
          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              Question (English) *
            </label>
            <input
              type="text"
              value={formData.questionEn}
              onChange={(e) => setFormData({ ...formData, questionEn: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
          </div>
          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              Question (Arabic)
            </label>
            <input
              type="text"
              value={formData.questionAr}
              onChange={(e) => setFormData({ ...formData, questionAr: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              dir="rtl"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-montserrat-semibold text-sm mb-2">
              Answer (English) *
            </label>
            <textarea
              value={formData.answerEn}
              onChange={(e) => setFormData({ ...formData, answerEn: e.target.value })}
              required
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-montserrat-semibold text-sm mb-2">
              Answer (Arabic)
            </label>
            <textarea
              value={formData.answerAr}
              onChange={(e) => setFormData({ ...formData, answerAr: e.target.value })}
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              dir="rtl"
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





