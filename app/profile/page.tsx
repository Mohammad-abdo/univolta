"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { apiPut } from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
import { User, Mail, Phone, MapPin, Save, CheckCircle, Shield } from "lucide-react";
import { t } from "@/lib/i18n";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  profile?: { address?: string; city?: string; country?: string };
}

function ProfileInput({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  disabled,
  note,
  placeholder,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  type?: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  note?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 font-montserrat-semibold text-sm text-[#121c67] mb-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-[#5260ce]" />}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        disabled={disabled}
        placeholder={placeholder}
        className="input-enhanced disabled:bg-[#f9fafe] disabled:text-[#8b8c9a] disabled:cursor-not-allowed"
      />
      {note && <p className="text-xs text-[#8b8c9a] mt-1">{note}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", city: "", country: "",
  });

  const set = (key: string) => (v: string) => setFormData((prev) => ({ ...prev, [key]: v }));

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) { router.push("/login"); return; }
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const userData = await response.json();
        setProfile(userData);
        setFormData({
          name:    userData.name || "",
          email:   userData.email || "",
          phone:   userData.phone || userData.profile?.phone || "",
          address: userData.profile?.address || "",
          city:    userData.profile?.city || "",
          country: userData.profile?.country || "",
        });
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPut("/users/me", {
        name: formData.name,
        phone: formData.phone,
        profile: { address: formData.address, city: formData.city, country: formData.country },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafe]">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5260ce]" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafe] pb-16 md:pb-0">
      <Navbar />
      <main className="pt-0 md:pt-[120px] pb-8 md:pb-24">
        <div className="max-w-[820px] mx-auto px-4 md:px-5">

          {/* Page Header */}
          <ScrollReveal direction="up">
            <div className="mb-6 md:mb-8 py-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#5260ce]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#5260ce]" />
                </div>
                <h1 className="font-montserrat-bold text-2xl md:text-3xl text-[#121c67]">
                  {t("myProfile")}
                </h1>
              </div>
              <p className="text-sm text-[#65666f] font-montserrat-regular">{t("manageAccount")}</p>
            </div>
          </ScrollReveal>

          {/* Avatar + Role Badge */}
          <ScrollReveal direction="up" delay={100}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5260ce] to-[#75d3f7] flex items-center justify-center text-white font-montserrat-bold text-2xl shrink-0">
                {formData.name ? formData.name[0].toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="font-montserrat-bold text-xl text-[#121c67]">{formData.name || "User"}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="w-3.5 h-3.5 text-[#5260ce]" />
                  <span className="text-xs font-montserrat-semibold text-[#5260ce] capitalize">{profile?.role || "student"}</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Personal Information */}
          <ScrollReveal direction="up" delay={150}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
              <h2 className="font-montserrat-bold text-lg text-[#121c67] mb-5 section-title-accent">
                {t("personalInfo")}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <ProfileInput label={t("fullName")}  icon={User}  value={formData.name}  onChange={set("name")}  placeholder="Your full name" />
                <ProfileInput label={t("email")}     icon={Mail}  value={formData.email} disabled note={t("emailCannotChange")} />
                <ProfileInput label={t("phone")}     icon={Phone} value={formData.phone} onChange={set("phone")} type="tel" placeholder="+1 234 567 890" />
                <ProfileInput label={t("role")}      value={profile?.role || ""} disabled />
              </div>
            </div>
          </ScrollReveal>

          {/* Address Information */}
          <ScrollReveal direction="up" delay={200}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="font-montserrat-bold text-lg text-[#121c67] mb-5 section-title-accent">
                {t("addressInfo")}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <ProfileInput label={t("address")} icon={MapPin} value={formData.address} onChange={set("address")} placeholder="Street address" />
                </div>
                <ProfileInput label={t("city")}    value={formData.city}    onChange={set("city")}    placeholder="City" />
                <ProfileInput label={t("country")} value={formData.country} onChange={set("country")} placeholder="Country" />
              </div>
            </div>
          </ScrollReveal>

          {/* Save Button */}
          <ScrollReveal direction="up" delay={250}>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold rounded-xl px-8 h-11 shadow-[0_4px_16px_rgba(82,96,206,0.25)] hover:shadow-[0_6px_24px_rgba(82,96,206,0.35)] transition-all"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    {t("saving")}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {t("saveChanges")}
                  </span>
                )}
              </Button>
              {saved && (
                <span className="flex items-center gap-2 text-green-600 font-montserrat-semibold text-sm animate-fade-up">
                  <CheckCircle className="w-4 h-4" />
                  Changes saved!
                </span>
              )}
            </div>
          </ScrollReveal>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
