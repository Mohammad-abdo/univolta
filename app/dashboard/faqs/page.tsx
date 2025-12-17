"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiDelete } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { canAccess, type UserRole } from "@/lib/permissions";
import { API_BASE_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  isPublished: boolean;
  sortOrder: number;
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

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
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const data = await apiGet<FAQ[]>("/faqs");
      setFaqs(data);
    } catch (error: any) {
      showToast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) {
      return;
    }

    try {
      await apiDelete(`/faqs/${id}`);
      showToast.success("FAQ deleted successfully!");
      await fetchFAQs();
    } catch (error: any) {
      showToast.error(error.message || "Failed to delete FAQ");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">FAQs</h1>
        {userRole && canAccess(userRole, "faqs", "create") && (
          <Link href="/dashboard/faqs/add">
            <Button className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
          </Link>
        )}
      </div>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-montserrat-semibold text-lg">{faq.question}</h3>
              {faq.category && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {faq.category}
                </span>
              )}
            </div>
            <p className="text-gray-700 mb-2">{faq.answer}</p>
            <div className="flex items-center justify-between mt-4">
              <span className={`inline-block px-2 py-1 rounded text-xs ${
                faq.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}>
                {faq.isPublished ? "Published" : "Draft"}
              </span>
              {(userRole && (canAccess(userRole, "faqs", "update") || canAccess(userRole, "faqs", "delete"))) && (
                <div className="flex items-center gap-2">
                  {userRole && canAccess(userRole, "faqs", "update") && (
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {userRole && canAccess(userRole, "faqs", "delete") && (
                    <button
                      onClick={() => handleDelete(faq.id)}
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
        {faqs.length === 0 && (
          <div className="text-center py-12 text-gray-500">No FAQs found</div>
        )}
      </div>
    </div>
  );
}

