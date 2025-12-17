"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiDelete } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { canAccess, type UserRole } from "@/lib/permissions";
import { API_BASE_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Testimonial {
  id: string;
  author: string;
  role?: string;
  content: string;
  rating?: number;
  isPublished: boolean;
  university?: { name: string };
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const fetchTestimonials = async () => {
    try {
      const data = await apiGet<Testimonial[]>("/testimonials");
      setTestimonials(data);
    } catch (error: any) {
      showToast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch user role
    const fetchUserRole = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setUserRole(userData.role?.toLowerCase() as UserRole);
          }
      }
    } catch (error) {
      // Silent fail for role check
    }
    };

    fetchUserRole();
    fetchTestimonials();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) {
      return;
    }

    try {
      await apiDelete(`/testimonials/${id}`);
      showToast.success("Testimonial deleted successfully!");
      await fetchTestimonials();
    } catch (error: any) {
      showToast.error(error.message || "Failed to delete testimonial");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">Testimonials</h1>
        {userRole && canAccess(userRole, "testimonials", "create") && (
          <Link href="/dashboard/testimonials/add">
            <Button className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </Link>
        )}
      </div>
      <div className="grid gap-4">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-montserrat-semibold text-lg">{testimonial.author}</h3>
                {testimonial.role && <p className="text-sm text-gray-500">{testimonial.role}</p>}
              </div>
              {testimonial.rating && (
                <div className="text-yellow-500">{"★".repeat(testimonial.rating)}</div>
              )}
            </div>
            <p className="text-gray-700 mb-2">{testimonial.content}</p>
            {testimonial.university && (
              <p className="text-sm text-gray-500">University: {testimonial.university.name}</p>
            )}
            <div className="flex items-center justify-between mt-4">
              <span className={`inline-block px-2 py-1 rounded text-xs ${
                testimonial.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}>
                {testimonial.isPublished ? "Published" : "Draft"}
              </span>
              {(userRole && (canAccess(userRole, "testimonials", "update") || canAccess(userRole, "testimonials", "delete"))) && (
                <div className="flex items-center gap-2">
                  {userRole && canAccess(userRole, "testimonials", "update") && (
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {userRole && canAccess(userRole, "testimonials", "delete") && (
                    <button
                      onClick={() => handleDelete(testimonial.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {testimonials.length === 0 && (
          <div className="text-center py-12 text-gray-500">No testimonials found</div>
        )}
      </div>
    </div>
  );
}

