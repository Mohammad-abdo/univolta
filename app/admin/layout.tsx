"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Home,
  MessageSquare,
  AlignJustify,
  X,
  LogOut,
  ChevronRight,
  Bell,
  Globe,
} from "lucide-react";

interface NavItem {
  href:  string;
  label: string;
  icon:  React.ReactNode;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin",              label: "Dashboard",       icon: <LayoutDashboard size={18} /> },
  { href: "/admin/site-settings",label: "Site Settings",   icon: <Settings         size={18} /> },
  { href: "/admin/homepage",     label: "Home Page",       icon: <Home             size={18} /> },
  { href: "/admin/footer",       label: "Footer",          icon: <Globe            size={18} /> },
  { href: "/admin/messages",     label: "Messages",        icon: <MessageSquare    size={18} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [open, setOpen]           = useState(false);
  const [unread, setUnread]       = useState(0);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("accessToken");
    if (!token) { router.replace("/login"); return; }

    // Try to parse user info from token
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "admin") { router.replace("/"); return; }
      if (payload.name) setAdminName(payload.name);
    } catch {
      router.replace("/login");
    }

    // Fetch unread message count
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1"}/contact?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.unreadCount !== undefined) setUnread(d.unreadCount); })
      .catch(() => {});
  }, [router]);

  const navWithBadge = NAV_ITEMS.map((item) =>
    item.href === "/admin/messages" ? { ...item, badge: unread } : item
  );

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.replace("/login");
  };

  return (
    <div className="min-h-screen flex bg-[#f8f9fc]">
      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 flex flex-col
          bg-gradient-to-b from-[#1e1b4b] to-[#312e81]
          shadow-2xl transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:flex
        `}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shadow">
              <Globe size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">UniVolta</p>
              <p className="text-indigo-300 text-xs mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navWithBadge.map((item) => {
            const active = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group relative
                  ${active
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-indigo-200 hover:bg-white/10 hover:text-white"}
                `}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {(item.badge ?? 0) > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
                {active && (
                  <ChevronRight size={14} className="text-indigo-300" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-400/40 flex items-center justify-center text-white text-sm font-bold">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{adminName}</p>
              <p className="text-indigo-300 text-xs">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-indigo-200 hover:bg-white/10 hover:text-white text-sm transition-all"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── MAIN ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shadow-sm">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(true)}
          >
            <AlignJustify size={20} className="text-gray-600" />
          </button>

          <div className="flex-1">
            <h1 className="text-gray-800 font-semibold text-sm">
              {navWithBadge.find((n) =>
                n.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(n.href)
              )?.label ?? "Admin"}
            </h1>
          </div>

          {unread > 0 && (
            <Link
              href="/admin/messages"
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            </Link>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
