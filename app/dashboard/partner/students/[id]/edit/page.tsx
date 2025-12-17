"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiPut } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { t } from "@/lib/i18n";

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  personalAddress?: string;
  dateOfBirth?: string;
  academicQualification?: string;
  identityNumber?: string;
  country?: string;
  additionalNotes?: string;
  notes?: string;
}

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Application>({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    personalAddress: "",
    dateOfBirth: "",
    academicQualification: "",
    identityNumber: "",
    country: "",
    additionalNotes: "",
    notes: "",
  });

  useEffect(() => {
    if (params.id) {
      fetchApplication();
    }
  }, [params.id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Application>(`/partner/applications/${params.id}`);
      setFormData({
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split("T")[0] : "",
      });
    } catch (error: any) {
      const errorMsg = error.message || "Failed to load student data";
      showToast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await apiPut(`/partner/applications/${params.id}`, {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : undefined,
      });
      showToast.success("Student information updated successfully!");
      router.push(`/dashboard/partner/students/${params.id}`);
    } catch (error: any) {
      const errorMsg = error.message || "Failed to update student information";
      showToast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setSaving(false);
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
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/partner/students/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">
          {t("editStudent") || "Edit Student"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-montserrat-bold text-[#121c67] border-b pb-2">
            {t("personalInformation") || "Personal Information"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("fullName") || "Full Name"} *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("email") || "Email"} *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("phone") || "Phone"}
              </label>
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("dateOfBirth") || "Date of Birth"}
              </label>
              <input
                type="date"
                value={formData.dateOfBirth || ""}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("country") || "Country"}
              </label>
              <input
                type="text"
                value={formData.country || ""}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("identityNumber") || "Identity Number"}
              </label>
              <input
                type="text"
                value={formData.identityNumber || ""}
                onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("personalAddress") || "Personal Address"}
              </label>
              <textarea
                value={formData.personalAddress || ""}
                onChange={(e) => setFormData({ ...formData, personalAddress: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("academicQualification") || "Academic Qualification"}
              </label>
              <input
                type="text"
                value={formData.academicQualification || ""}
                onChange={(e) => setFormData({ ...formData, academicQualification: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("additionalNotes") || "Additional Notes"}
              </label>
              <textarea
                value={formData.additionalNotes || ""}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("notes") || "Internal Notes"}
              </label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
                placeholder="Internal notes (not visible to student)"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? t("saving") || "Saving..." : t("saveChanges") || "Save Changes"}
          </Button>
          <Link href={`/dashboard/partner/students/${params.id}`}>
            <Button type="button" variant="outline">
              {t("cancel") || "Cancel"}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

