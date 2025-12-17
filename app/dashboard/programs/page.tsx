"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { canAccess, type UserRole } from "@/lib/permissions";
import { API_BASE_URL } from "@/lib/constants";
import { DataTable } from "@/components/ui/data-table";

interface Program {
  id: string;
  name: string;
  slug: string;
  degree?: string;
  duration?: string;
  language?: string;
  tuition?: string;
  isActive: boolean;
  university: { name: string };
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
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
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const data = await apiGet<Program[]>("/programs");
      setPrograms(data);
    } catch (error: any) {
      showToast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <h1 className="text-2xl md:text-3xl font-montserrat-bold text-[#121c67]">Programs</h1>
        {userRole && canAccess(userRole, "programs", "create") && (
          <Link href="/dashboard/programs/add" className="w-full sm:w-auto">
            <Button className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add Program</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        )}
      </div>

      <DataTable
        data={programs}
        columns={[
          {
            key: "name",
            header: "Name",
            render: (program) => <div className="text-sm font-medium">{program.name}</div>,
          },
          {
            key: "university",
            header: "University",
            render: (program) => <div className="text-sm text-gray-600">{program.university.name}</div>,
          },
          {
            key: "degree",
            header: "Degree",
            render: (program) => <div className="text-sm text-gray-600">{program.degree || "-"}</div>,
          },
          {
            key: "duration",
            header: "Duration",
            render: (program) => <div className="text-sm text-gray-600">{program.duration || "-"}</div>,
          },
          {
            key: "status",
            header: "Status",
            render: (program) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  program.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {program.isActive ? "Active" : "Inactive"}
              </span>
            ),
          },
          ...(userRole &&
          (canAccess(userRole, "programs", "update") || canAccess(userRole, "programs", "delete"))
            ? [
                {
                  key: "actions",
                  header: "Actions",
                  render: (program: Program) => (
                    <div className="flex items-center gap-2">
                      {userRole && canAccess(userRole, "programs", "update") && (
                        <Link href={`/dashboard/programs/${program.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                      {userRole && canAccess(userRole, "programs", "delete") && (
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ),
                },
              ]
            : []),
        ]}
        searchable
        searchPlaceholder="Search programs..."
        searchKeys={["name", "degree", "duration"]}
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
        ]}
        pagination={{
          page: 1,
          pageSize: 10,
          total: programs.length,
          onPageChange: () => {},
        }}
        emptyMessage="No programs found"
        loading={loading}
      />
    </div>
  );
}

