"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, GraduationCap } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

interface Degree {
  id: string;
  name: string;
  abbreviation: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function DegreesPage() {
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    fetchDegrees();
  }, []);

  const fetchDegrees = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Degree[]>("/partner/degrees");
      setDegrees(data || []);
    } catch (error: any) {
      showToast.error("Failed to load degrees");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiPut(`/partner/degrees/${editingId}`, formData);
      } else {
        await apiPost("/partner/degrees", formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", abbreviation: "", description: "", isActive: true });
      showToast.success(editingId ? "Degree updated successfully!" : "Degree created successfully!");
      fetchDegrees();
    } catch (error: any) {
      showToast.error(error.message || "Failed to save degree");
    }
  };

  const handleEdit = (degree: Degree) => {
    setFormData({
      name: degree.name,
      abbreviation: degree.abbreviation || "",
      description: degree.description || "",
      isActive: degree.isActive,
    });
    setEditingId(degree.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete") || "Are you sure you want to delete this degree?")) {
      return;
    }

    try {
      await apiDelete(`/partner/degrees/${id}`);
      showToast.success("Degree deleted successfully!");
      fetchDegrees();
    } catch (error: any) {
      showToast.error(error.message || "Failed to delete degree");
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
          {t("degrees") || "Degrees"}
        </h1>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: "", abbreviation: "", description: "", isActive: true });
          }}
          className="bg-[#5260ce] hover:bg-[#4350b0]"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("addDegree") || "Add Degree"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-montserrat-bold text-[#121c67] mb-4">
            {editingId ? t("editDegree") || "Edit Degree" : t("addDegree") || "Add Degree"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("name") || "Name"} * (e.g., "Bachelor's", "Master's", "PhD")
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>
            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("abbreviation") || "Abbreviation"} (e.g., "BSc", "MSc", "PhD")
              </label>
              <input
                type="text"
                value={formData.abbreviation}
                onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>
            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("description") || "Description"}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
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
                  setFormData({ name: "", abbreviation: "", description: "", isActive: true });
                }}
              >
                {t("cancel") || "Cancel"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {degrees.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            {t("noDegrees") || "No degrees found"}
          </div>
        ) : (
          degrees.map((degree) => (
            <div
              key={degree.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-montserrat-semibold text-[#121c67]">{degree.name}</h3>
                    {degree.abbreviation && (
                      <p className="text-sm text-gray-500">{degree.abbreviation}</p>
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        degree.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {degree.isActive ? t("active") || "Active" : t("inactive") || "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {degree.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{degree.description}</p>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(degree)}
                  variant="outline"
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {t("edit") || "Edit"}
                </Button>
                <Button
                  onClick={() => handleDelete(degree.id)}
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

