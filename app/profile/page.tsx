"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import { apiGet, apiPut } from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
import { User, Mail, Phone, MapPin, Save } from "lucide-react";
import { t } from "@/lib/i18n";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  profile?: {
    address?: string;
    city?: string;
    country?: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setProfile(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || userData.profile?.phone || "",
          address: userData.profile?.address || "",
          city: userData.profile?.city || "",
          country: userData.profile?.country || "",
        });
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update user profile via API
      await apiPut("/users/me", {
        name: formData.name,
        phone: formData.phone,
        profile: {
          address: formData.address,
          city: formData.city,
          country: formData.country,
        },
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-64">Loading...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafe] pb-16 md:pb-0">
      <Navbar />
      <main className="pt-0 md:pt-[120px] pb-4 md:pb-20">
        <div className="max-w-[800px] mx-auto px-4 md:px-5">
          <div className="mb-6 md:mb-8">
            <h1 className="font-montserrat-bold text-2xl md:text-[34px] text-[#121c67] mb-2">
              {t("myProfile")}
            </h1>
            <p className="text-sm md:text-base text-gray-600">{t("manageAccount")}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-8">
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h2 className="font-montserrat-semibold text-lg md:text-xl text-[#121c67] mb-3 md:mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 md:w-5 md:h-5" />
                  {t("personalInfo")}
                </h2>
                <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block font-montserrat-semibold text-sm mb-2">
                      {t("fullName")}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-montserrat-semibold text-sm mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {t("email")}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">{t("emailCannotChange")}</p>
                  </div>
                  <div>
                    <label className="block font-montserrat-semibold text-sm mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {t("phone")}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-montserrat-semibold text-sm mb-2">
                      {t("role")}
                    </label>
                    <input
                      type="text"
                      value={profile?.role || ""}
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 capitalize"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h2 className="font-montserrat-semibold text-lg md:text-xl text-[#121c67] mb-3 md:mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                  {t("addressInfo")}
                </h2>
                <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-montserrat-semibold text-sm mb-2">
                      {t("address")}
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-montserrat-semibold text-sm mb-2">
                      {t("city")}
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-montserrat-semibold text-sm mb-2">
                      {t("country")}
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#5260ce] hover:bg-[#4350b0] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? t("saving") : t("saveChanges")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

