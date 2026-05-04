"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiDelete } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { canAccess, type UserRole } from "@/lib/permissions";
import { API_BASE_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Link2 } from "lucide-react";

export interface ApplicationAdvisor {
  id: string;
  name: string;
  title: string;
  institution: string | null;
  availability: string | null;
  whatsappE164: string;
  referralToken: string;
  sortOrder: number;
  isActive: boolean;
}

export default function AdvisorsPage() {
  const [rows, setRows] = useState<ApplicationAdvisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(typeof window !== "undefined" ? window.location.origin : "");
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (response.ok) {
            const userData = await response.json();
            setUserRole(userData.role?.toLowerCase() as UserRole);
          }
        }
      } catch {
        /* ignore */
      }
    };
    fetchUserRole();
    (async () => {
      try {
        const data = await apiGet<ApplicationAdvisor[]>("/advisors");
        setRows(data);
      } catch {
        showToast.error("Failed to load advisors");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const copyReferral = (token: string) => {
    const url = `${origin}/r/${token}`;
    void navigator.clipboard.writeText(url);
    showToast.success("Referral link copied");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this advisor?")) return;
    try {
      await apiDelete(`/advisors/${id}`);
      showToast.success("Advisor deleted");
      setRows((r) => r.filter((x) => x.id !== id));
    } catch (e: unknown) {
      showToast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">Application advisors</h1>
        {userRole && canAccess(userRole, "advisors", "create") && (
          <Link href="/dashboard/advisors/add">
            <Button className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Add advisor
            </Button>
          </Link>
        )}
      </div>
      <div className="space-y-4">
        {rows.map((a) => (
          <div key={a.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div>
                <h3 className="font-montserrat-semibold text-lg">{a.name}</h3>
                <p className="text-sm text-gray-600">{a.title}</p>
                {a.institution && <p className="text-sm text-gray-500">{a.institution}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  WhatsApp: {a.whatsappE164} · Order: {a.sortOrder}{" "}
                  {!a.isActive && <span className="text-orange-600 font-semibold">(inactive)</span>}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => copyReferral(a.referralToken)}>
                  <Link2 className="w-4 h-4 mr-1" />
                  Copy referral link
                </Button>
                {userRole && canAccess(userRole, "advisors", "update") && (
                  <Link href={`/dashboard/advisors/${a.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                )}
                {userRole && canAccess(userRole, "advisors", "delete") && (
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-center py-12 text-gray-500">No advisors yet.</div>}
      </div>
    </div>
  );
}
