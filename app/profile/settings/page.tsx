"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Camera, CheckCircle, Eye, EyeOff, Lock, Mail, Phone, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentHeader } from "@/components/student-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { API_BASE_URL } from "@/lib/constants";
import { getImageUrl } from "@/lib/image-utils";
import { showToast } from "@/lib/toast";

interface UserData {
  id: string; name: string; email: string; phone?: string;
  createdAt?: string;
  profile?: { avatarUrl?: string; bio?: string };
}

export default function ProfileSettingsPage() {
  const router = useRouter();

  const [user,    setUser]    = useState<UserData | null>(null);
  const [ready,   setReady]   = useState(false);

  /* form state */
  const [name,    setName]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  /* avatar state */
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* password state */
  const [currentPw,   setCurrentPw]   = useState("");
  const [newPw,       setNewPw]       = useState("");
  const [confirmPw,   setConfirmPw]   = useState("");
  const [showCurr,    setShowCurr]    = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [savingPw,    setSavingPw]    = useState(false);

  /* auth */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.replace("/login?redirect=%2Fprofile%2Fsettings"); return; }
    fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (r.status === 401) { router.replace("/login"); return; }
        if (!r.ok) { setReady(true); return; }
        const data: UserData = await r.json();
        setUser(data);
        setName(data.name || "");
        setPhone(data.phone || "");
        setReady(true);
      })
      .catch(() => setReady(true));
  }, [router]);

  /* avatar pick */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  /* save profile */
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken") || "";
      const fd    = new FormData();
      fd.append("name",  name.trim());
      fd.append("phone", phone.trim());
      if (avatarFile) fd.append("avatar", avatarFile);

      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method:  "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body:    fd,
      });
      if (!res.ok) throw new Error("Failed to save");
      const updated: UserData = await res.json();
      setUser(updated);
      setAvatarFile(null);
      if (updated.profile?.avatarUrl) setAvatarPreview(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      showToast.success("Profile updated!");
    } catch {
      showToast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  /* change password */
  const handleChangePassword = async () => {
    if (!currentPw || !newPw) { showToast.error("Fill in all password fields"); return; }
    if (newPw !== confirmPw)  { showToast.error("New passwords don't match"); return; }
    if (newPw.length < 6)     { showToast.error("Password must be at least 6 characters"); return; }
    setSavingPw(true);
    try {
      const token = localStorage.getItem("accessToken") || "";
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method:  "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed");
      }
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      showToast.success("Password changed successfully!");
    } catch (e: any) {
      showToast.error(e.message || "Failed to change password");
    } finally {
      setSavingPw(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/");
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#5260ce] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* Compute avatar src */
  const storedAvatar = getImageUrl(user?.profile?.avatarUrl || "");
  const avatarSrc    = avatarPreview || storedAvatar || null;
  const initial      = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-[#F8FAFF] pb-20 md:pb-0">
      <StudentHeader user={user} onLogout={handleLogout} activePage="settings" />

      <main style={{ paddingTop: 64 }}>
        <div className="max-w-[780px] mx-auto px-4 md:px-6 py-8">

          {/* Back */}
          <Link href="/profile" className="flex items-center gap-1.5 text-[#718096] text-sm mb-6 hover:text-[#1B2559] transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          {/* Page title */}
          <div className="mb-7">
            <h1 className="text-[24px] font-bold text-[#1B2559]">Profile Settings</h1>
            <p className="text-sm text-[#A0AEC0] mt-1">Manage your account information and photo</p>
          </div>

          {/* ── Profile card ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-5">

            {/* Avatar section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group mb-3">
                {/* Avatar circle */}
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-[#5260ce]/20">
                  {avatarSrc ? (
                    <Image src={avatarSrc} alt="Avatar" fill className="object-cover" unoptimized sizes="112px" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#5260ce] to-[#75d3f7] flex items-center justify-center text-white font-bold text-4xl">
                      {initial}
                    </div>
                  )}
                </div>
                {/* Camera overlay */}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-7 h-7 text-white" />
                </button>
                {/* Hidden file input */}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              <p className="text-[15px] font-bold text-[#1B2559]">{user?.name || "Student"}</p>
              <p className="text-xs text-[#A0AEC0]">{user?.email}</p>
              {user?.createdAt && (
                <p className="text-xs text-[#A0AEC0] mt-0.5">
                  Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              )}

              {/* Change photo button */}
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-3 flex items-center gap-1.5 text-xs text-[#5260ce] hover:text-[#4350b0] border border-[#5260ce]/30 px-4 py-1.5 rounded-full transition-colors hover:bg-[#5260ce]/5"
              >
                <Camera className="w-3.5 h-3.5" /> Change Photo
              </button>
              {avatarFile && (
                <p className="text-xs text-[#5260ce] mt-1.5 font-medium">"{avatarFile.name}" selected — save to upload</p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mb-7" />

            {/* Form fields */}
            <div className="space-y-5">

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#4A5568] mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full h-11 pl-9 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-[#1B2559] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#5260ce] transition-colors"
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-xs font-semibold text-[#4A5568] mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
                  <input
                    type="email"
                    value={user?.email || ""}
                    readOnly
                    className="w-full h-11 pl-9 pr-4 rounded-xl border border-gray-100 bg-[#F8FAFF] text-sm text-[#718096] cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-[#A0AEC0] mt-1">Email cannot be changed. Contact support if needed.</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-[#4A5568] mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-11 pl-9 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-[#1B2559] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#5260ce] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className="mt-7 flex items-center gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#5260ce] hover:bg-[#4350b0] text-white rounded-xl h-11 px-8 font-semibold flex items-center gap-2 transition-all"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : saved ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
              </Button>
              {saved && (
                <span className="text-sm text-green-600 flex items-center gap-1 font-medium">
                  <CheckCircle className="w-4 h-4" /> Changes saved
                </span>
              )}
            </div>
          </div>

          {/* ── Change Password card ──────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <h2 className="font-bold text-[#1B2559] text-[15px]">Change Password</h2>
                <p className="text-xs text-[#A0AEC0]">Choose a strong password to protect your account</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Current password */}
              <div>
                <label className="block text-xs font-semibold text-[#4A5568] mb-1.5">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurr ? "text" : "password"}
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-gray-200 bg-white text-sm text-[#1B2559] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#5260ce] transition-colors"
                  />
                  <button onClick={() => setShowCurr((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-[#5260ce]">
                    {showCurr ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block text-xs font-semibold text-[#4A5568] mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-gray-200 bg-white text-sm text-[#1B2559] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#5260ce] transition-colors"
                  />
                  <button onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-[#5260ce]">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-semibold text-[#4A5568] mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Repeat new password"
                    className={`w-full h-11 pl-4 pr-4 rounded-xl border bg-white text-sm text-[#1B2559] placeholder:text-[#A0AEC0] focus:outline-none transition-colors ${
                      confirmPw && confirmPw !== newPw
                        ? "border-red-300 focus:border-red-400"
                        : "border-gray-200 focus:border-[#5260ce]"
                    }`}
                  />
                  {confirmPw && confirmPw === newPw && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                </div>
                {confirmPw && confirmPw !== newPw && (
                  <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                )}
              </div>
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={savingPw || !currentPw || !newPw || newPw !== confirmPw}
              className="mt-6 bg-[#1B2559] hover:bg-[#0d1554] text-white rounded-xl h-11 px-8 font-semibold flex items-center gap-2"
            >
              {savingPw
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                : <><Lock className="w-4 h-4" /> Update Password</>
              }
            </Button>
          </div>

        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
