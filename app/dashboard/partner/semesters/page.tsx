"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

interface Semester {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function SemestersPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Semester[]>("/partner/semesters");
      setSemesters(data || []);
    } catch (error: any) {
      showToast.error("Failed to load semesters");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiPut(`/partner/semesters/${editingId}`, formData);
      } else {
        await apiPost("/partner/semesters", formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", startDate: "", endDate: "", isActive: true });
      showToast.success(editingId ? "Semester updated successfully!" : "Semester created successfully!");
      fetchSemesters();
    } catch (error: any) {
      showToast.error(error.message || "Failed to save semester");
    }
  };

  const handleEdit = (semester: Semester) => {
    setFormData({
      name: semester.name,
      startDate: semester.startDate ? new Date(semester.startDate).toISOString().split("T")[0] : "",
      endDate: semester.endDate ? new Date(semester.endDate).toISOString().split("T")[0] : "",
      isActive: semester.isActive,
    });
    setEditingId(semester.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete") || "Are you sure you want to delete this semester?")) {
      return;
    }

    try {
      await apiDelete(`/partner/semesters/${id}`);
      showToast.success("Semester deleted successfully!");
      fetchSemesters();
    } catch (error: any) {
      showToast.error(error.message || "Failed to delete semester");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">
          {t("semesters") || "Semesters"}
        </h1>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: "", startDate: "", endDate: "", isActive: true });
          }}
          className="bg-[#5260ce] hover:bg-[#4350b0]"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("addSemester") || "Add Semester"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-montserrat-bold text-[#121c67] mb-4">
            {editingId ? t("editSemester") || "Edit Semester" : t("addSemester") || "Add Semester"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("name") || "Name"} * (e.g., "Fall 2024", "Spring 2025")
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-montserrat-semibold text-sm mb-2">
                  {t("startDate") || "Start Date"}
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
                />
              </div>
              <div>
                <label className="block font-montserrat-semibold text-sm mb-2">
                  {t("endDate") || "End Date"}
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm">
                {t("active") || "Active"}
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-[#5260ce] hover:bg-[#4350b0]">
                {editingId ? t("update") || "Update" : t("create") || "Create"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: "", startDate: "", endDate: "", isActive: true });
                }}
              >
                {t("cancel") || "Cancel"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {semesters.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            {t("noSemesters") || "No semesters found"}
          </div>
        ) : (
          semesters.map((semester) => (
            <div
              key={semester.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-montserrat-semibold text-[#121c67]">{semester.name}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        semester.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {semester.isActive ? t("active") || "Active" : t("inactive") || "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {(semester.startDate || semester.endDate) && (
                <div className="text-sm text-gray-600 mb-4">
                  {semester.startDate && (
                    <p>
                      <span className="font-semibold">{t("startDate") || "Start"}:</span>{" "}
                      {new Date(semester.startDate).toLocaleDateString()}
                    </p>
                  )}
                  {semester.endDate && (
                    <p>
                      <span className="font-semibold">{t("endDate") || "End"}:</span>{" "}
                      {new Date(semester.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(semester)}
                  variant="outline"
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {t("edit") || "Edit"}
                </Button>
                <Button
                  onClick={() => handleDelete(semester.id)}
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

