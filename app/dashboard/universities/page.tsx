"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { canAccess, type UserRole } from "@/lib/permissions";
import { API_BASE_URL } from "@/lib/constants";
import { DataTable, type Column, type FilterOption } from "@/components/ui/data-table";

interface University {
  id: string;
  name: string;
  slug: string;
  country: string;
  city: string;
  language: string;
  isActive: boolean;
}

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const router = useRouter();

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
    fetchUniversities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnauthorized = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    router.push("/dashboard/login");
  };

  const fetchUniversities = async () => {
    try {
      const data = await apiGet<University[]>("/universities");
      setUniversities(data);
    } catch (error: any) {
      if (error.statusCode === 401 || error.statusCode === 403) {
        handleUnauthorized();
      } else {
        showToast.error("Failed to load universities");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this university?")) {
      return;
    }

    try {
      await apiDelete(`/universities/${id}`);
      await fetchUniversities();
    } catch (error: any) {
      console.error("Error deleting university:", error);
      if (error.statusCode === 401 || error.statusCode === 403) {
        handleUnauthorized();
      } else {
        showToast.error("Failed to delete university");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-montserrat-bold text-[#121c67] mb-2 md:mb-0">
            Universities
          </h1>
          {userRole && canAccess(userRole, "universities", "update") && universities.length > 0 && (
            <p className="text-xs md:text-sm text-gray-600 mt-1 md:hidden">
              Click "Edit" button to modify a university
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
          {userRole && canAccess(userRole, "universities", "update") && universities.length > 0 && (
            <span className="hidden md:block text-sm text-gray-600 whitespace-nowrap">
              Click "Edit" button to modify a university
            </span>
          )}
          {userRole && canAccess(userRole, "universities", "create") && (
            <Link href="/dashboard/universities/add" className="w-full sm:w-auto">
              <Button className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add University</span>
                <span className="sm:hidden">Add Univ</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      <DataTable
        data={universities}
        columns={[
          {
            key: "name",
            header: "Name",
            render: (university) => (
              <div className="text-sm font-montserrat-semibold text-gray-900">
                {university.name}
              </div>
            ),
          },
          {
            key: "location",
            header: "Location",
            render: (university) => (
              <div className="text-sm text-gray-600">
                {university.city}, {university.country}
              </div>
            ),
          },
          {
            key: "language",
            header: "Language",
            render: (university) => (
              <div className="text-sm text-gray-600">{university.language}</div>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (university) => (
              <span
                className={`px-2 py-1 text-xs font-montserrat-semibold rounded-full ${
                  university.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {university.isActive ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (university) => (
              <div className="flex items-center justify-end gap-2 flex-wrap">
                {userRole && canAccess(userRole, "universities", "update") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 px-2 md:px-3"
                  >
                    <Link href={`/dashboard/universities/${university.id}/edit`}>
                      <Edit className="w-4 h-4 md:mr-1" />
                      <span className="hidden md:inline">Edit</span>
                    </Link>
                  </Button>
                )}
                {userRole && canAccess(userRole, "universities", "delete") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(university.id)}
                    className="text-red-600 hover:text-red-900 hover:bg-red-50 px-2 md:px-3"
                  >
                    <Trash2 className="w-4 h-4 md:mr-1" />
                    <span className="hidden md:inline">Delete</span>
                  </Button>
                )}
              </div>
            ),
          },
        ]}
        searchable
        searchPlaceholder="Search universities..."
        searchKeys={["name", "city", "country", "language"]}
        filters={[
          {
            key: "isActive",
            label: "Status",
            options: [
              { value: "all", label: "All Status" },
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ],
          },
          {
            key: "language",
            label: "Language",
            options: [
              { value: "all", label: "All Languages" },
              ...Array.from(new Set(universities.map((u) => u.language))).map((lang) => ({
                value: lang,
                label: lang,
              })),
            ],
          },
        ]}
        pagination={{
          page: 1,
          pageSize: 10,
          total: universities.length,
          onPageChange: () => {},
        }}
        emptyMessage="No universities found. Add your first university to get started."
        loading={loading}
      />
    </div>
  );
}






