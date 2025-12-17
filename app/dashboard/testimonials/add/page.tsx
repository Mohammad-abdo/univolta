"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { apiPost, apiGet } from "@/lib/api";
import { showToast } from "@/lib/toast";
import Link from "next/link";

interface University {
  id: string;
  name: string;
}

export default function AddTestimonialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [formData, setFormData] = useState({
    author: "",
    role: "",
    title: "",
    content: "",
    rating: 5,
    isPublished: true,
    universityId: "",
  });

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const data = await apiGet<University[]>("/universities");
      setUniversities(data);
    } catch (error: any) {
      showToast.error("Failed to load universities");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiPost("/testimonials", {
        ...formData,
        universityId: formData.universityId || undefined,
      });

      showToast.success("Testimonial created successfully!");
      router.push("/dashboard/testimonials");
    } catch (error: any) {
      const errorMsg = error.message || "Failed to create testimonial";
      showToast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/testimonials">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">
          Add New Testimonial
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
              Author Name *
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
          </div>

          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              Role/Position
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g., Student, Graduate"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-montserrat-semibold text-sm mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Optional testimonial title"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-montserrat-semibold text-sm mb-2">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            />
          </div>

          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              Rating
            </label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            >
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
          </div>

          <div>
            <label className="block font-montserrat-semibold text-sm mb-2">
              University
            </label>
            <select
              value={formData.universityId}
              onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
            >
              <option value="">Select a university (optional)</option>
              {universities.map((university) => (
                <option key={university.id} value={university.id}>
                  {university.name}
                </option>
              ))}
            </select>
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
            {loading ? "Creating..." : "Create Testimonial"}
          </Button>
          <Link href="/dashboard/testimonials">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}





