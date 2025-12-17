"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Lock, Mail, User, Phone } from "lucide-react";
import { apiGet, apiPut } from "@/lib/api";
import Link from "next/link";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userData = await apiGet<UserData>("/auth/me");
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      setError(error.message || "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      // Update profile
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
      };

      // Only update password if new password is provided
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          setError("Current password is required to change password");
          setSaving(false);
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError("New passwords do not match");
          setSaving(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          setError("New password must be at least 6 characters");
          setSaving(false);
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      await apiPut("/users/me", updateData);
      setSuccess("Settings updated successfully!");
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error updating settings:", error);
      setError(error.message || "Failed to update settings");
    } finally {
      setSaving(false);
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
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/partner">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-montserrat-bold text-[#121c67]">
          Account Settings
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {/* Profile Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-montserrat-bold text-[#121c67] border-b pb-2 flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Full Name *
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
              <label className="block font-montserrat-semibold text-sm mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email *
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
              <label className="block font-montserrat-semibold text-sm mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="space-y-4">
          <h2 className="text-xl font-montserrat-bold text-[#121c67] border-b pb-2 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </h2>
          <p className="text-sm text-gray-600">
            Leave password fields empty if you don't want to change your password.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                New Password
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-montserrat-semibold text-sm mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5260ce]"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Link href="/dashboard/partner">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

