"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Bell, Search, ChevronDown, LogOut, FileText, Globe,
  Home, Settings, CheckCheck, X, CheckCircle, XCircle, Info, AlertTriangle,
} from "lucide-react";
import { figmaAssets } from "@/lib/figma-assets";
import { API_BASE_URL } from "@/lib/constants";
import { getImageUrl } from "@/lib/image-utils";

export interface StudentUser {
  id?: string;
  name: string;
  email?: string;
  profile?: { avatarUrl?: string };
}

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

interface Props {
  user: StudentUser | null;
  onLogout: () => void;
  activePage?: "dashboard" | "applications" | "settings";
}

/* ── Time-ago helper ── */
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ── Notification icon by type ── */
function NotifIcon({ type }: { type: string }) {
  const cls = "w-4 h-4 shrink-0";
  if (type === "success") return <CheckCircle className={`${cls} text-green-500`} />;
  if (type === "error")   return <XCircle     className={`${cls} text-red-500`}   />;
  if (type === "warning") return <AlertTriangle className={`${cls} text-amber-500`} />;
  return <Info className={`${cls} text-blue-500`} />;
}

export function StudentHeader({ user, onLogout, activePage }: Props) {
  const router = useRouter();

  const [search,     setSearch]     = useState("");
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [bellOpen,   setBellOpen]   = useState(false);
  const [notifs,     setNotifs]     = useState<Notification[]>([]);
  const [unread,     setUnread]     = useState(0);
  const [loadNotifs, setLoadNotifs] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  /* close dropdowns on outside click */
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* fetch notifications */
  const fetchNotifs = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    setLoadNotifs(true);
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifs(data.notifications || []);
        setUnread(data.unreadCount || 0);
      }
    } catch {}
    finally { setLoadNotifs(false); }
  }, []);

  /* load unread count on mount */
  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  /* open bell → mark visible notifications as read after delay */
  const handleBellOpen = () => {
    setBellOpen((o) => !o);
    setMenuOpen(false);
    if (!bellOpen) {
      fetchNotifs();
      setTimeout(markAllRead, 3000); // auto mark after 3s of viewing
    }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
      });
      setUnread(0);
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const deleteNotif = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  };

  const initial   = user?.name?.charAt(0)?.toUpperCase() || "U";
  const avatarUrl = getImageUrl(user?.profile?.avatarUrl || "");

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50" style={{ height: 64 }}>
      <div className="max-w-[1280px] mx-auto h-full px-4 md:px-8 flex items-center gap-3">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center">
          <div className="relative w-28 h-8">
            <Image src={figmaAssets.logo} alt="Univolta" fill className="object-contain object-left" unoptimized />
          </div>
        </Link>

        {/* Back to Website pill */}
        <Link
          href="/"
          className="hidden md:flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#5260ce] px-3 py-1.5 rounded-lg hover:bg-[#F0F4FF] transition-colors shrink-0 border border-gray-100"
        >
          <Globe className="w-3.5 h-3.5" />
          Website
        </Link>

        <div className="hidden md:block h-5 w-px bg-gray-100 shrink-0" />

        {/* Search */}
        <div className="flex-1 hidden md:block max-w-[460px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  router.push(search.trim() ? `/universities?search=${encodeURIComponent(search)}` : "/universities");
              }}
              placeholder="Search universities..."
              suppressHydrationWarning
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 bg-[#F5F6FA] text-sm text-[#2e2e2e] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#5260ce]/60 transition-colors"
            />
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1 ml-auto shrink-0">

          {/* Mobile home icon */}
          <Link href="/" className="md:hidden p-2 rounded-xl hover:bg-[#F0F4FF] transition-colors text-[#6B7280]" title="Website">
            <Home className="w-5 h-5" />
          </Link>

          {/* ── Bell + Notification dropdown ────────────────────────── */}
          <div ref={bellRef} className="relative">
            <button
              onClick={handleBellOpen}
              className="relative p-2 rounded-xl hover:bg-[#F0F4FF] transition-colors"
            >
              <Bell className="w-5 h-5 text-[#6B7280]" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 mt-2 w-[360px] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-[#F9FAFE]">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#5260ce]" />
                    <span className="font-bold text-sm text-[#1B2559]">Notifications</span>
                    {unread > 0 && (
                      <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unread} new</span>
                    )}
                  </div>
                  {notifs.length > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-[#5260ce] hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                {/* Notification list */}
                <div className="max-h-[360px] overflow-y-auto">
                  {loadNotifs ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="w-6 h-6 border-2 border-[#5260ce] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : notifs.length === 0 ? (
                    <div className="py-12 text-center">
                      <Bell className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                      <p className="text-sm text-[#A0AEC0]">No notifications yet</p>
                    </div>
                  ) : (
                    notifs.map((n) => (
                      <Link
                        key={n.id}
                        href={n.link || "/profile"}
                        onClick={() => setBellOpen(false)}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-[#F9FAFE] transition-colors group ${!n.isRead ? "bg-[#F0F4FF]" : ""}`}
                      >
                        {/* Type icon */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          n.type === "success" ? "bg-green-50"
                          : n.type === "error" ? "bg-red-50"
                          : n.type === "warning" ? "bg-amber-50"
                          : "bg-blue-50"
                        }`}>
                          <NotifIcon type={n.type} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] leading-tight ${!n.isRead ? "font-semibold text-[#1B2559]" : "text-[#374151]"}`}>
                            {n.title}
                          </p>
                          <p className="text-[11px] text-[#718096] mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                          <p className="text-[10px] text-[#A0AEC0] mt-1">{timeAgo(n.createdAt)}</p>
                        </div>

                        {/* Unread dot + delete */}
                        <div className="flex flex-col items-center gap-1.5 shrink-0">
                          {!n.isRead && <div className="w-2 h-2 rounded-full bg-[#5260ce]" />}
                          <button
                            onClick={(e) => deleteNotif(e, n.id)}
                            className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifs.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-gray-100 bg-[#F9FAFE]">
                    <Link href="/my-applications" onClick={() => setBellOpen(false)} className="text-xs text-[#5260ce] hover:underline">
                      View all applications →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Avatar + dropdown ─────────────────────────────────── */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => { setMenuOpen((o) => !o); setBellOpen(false); }}
              className="flex items-center gap-1 p-1 rounded-xl hover:bg-[#F0F4FF] transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#5260ce]/20 shrink-0">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="" width={32} height={32} className="object-cover w-full h-full" unoptimized />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#5260ce] to-[#75d3f7] flex items-center justify-center text-white font-bold text-sm select-none">
                    {initial}
                  </div>
                )}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[#6B7280] hidden md:block transition-transform ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_8px_32px_rgba(82,96,206,0.15)] border border-gray-100 overflow-hidden z-50">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100 bg-[#F9FAFE] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt="" width={36} height={36} className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#5260ce] to-[#75d3f7] flex items-center justify-center text-white font-bold text-sm">
                        {initial}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1B2559] truncate">{user?.name || "Student"}</p>
                    {user?.email && <p className="text-[11px] text-[#A0AEC0] truncate">{user.email}</p>}
                  </div>
                </div>

                {/* Nav links */}
                <Link href="/profile" onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${activePage === "dashboard" ? "text-[#5260ce] font-semibold bg-[#F0F4FF]" : "text-[#374151] hover:bg-gray-50"}`}>
                  <Home className="w-4 h-4 text-[#5260ce]" />
                  My Dashboard
                </Link>
                <Link href="/my-applications" onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${activePage === "applications" ? "text-[#5260ce] font-semibold bg-[#F0F4FF]" : "text-[#374151] hover:bg-gray-50"}`}>
                  <FileText className="w-4 h-4 text-[#5260ce]" />
                  My Applications
                </Link>
                <Link href="/profile/settings" onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${activePage === "settings" ? "text-[#5260ce] font-semibold bg-[#F0F4FF]" : "text-[#374151] hover:bg-gray-50"}`}>
                  <Settings className="w-4 h-4 text-[#5260ce]" />
                  Profile Settings
                </Link>
                <Link href="/" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#374151] hover:bg-gray-50 transition-colors">
                  <Globe className="w-4 h-4 text-[#5260ce]" />
                  Back to Website
                </Link>

                <div className="border-t border-gray-100" />
                <button onClick={() => { setMenuOpen(false); onLogout(); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
