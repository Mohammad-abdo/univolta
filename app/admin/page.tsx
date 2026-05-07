"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Home,
  Settings,
  Globe,
  ShieldCheck,
  ArrowRight,
  Mail,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { t } from "@/lib/i18n";

interface Stats {
  totalMessages: number;
  unreadMessages: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalMessages: 0, unreadMessages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const base  = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

    fetch(`${base}/contact?limit=1`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        setStats({ totalMessages: d.total ?? 0, unreadMessages: d.unreadCount ?? 0 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      href:    "/admin/messages",
      icon:    <MessageSquare size={22} />,
      label:   t("sidebarCmsMessages"),
      value:   loading ? "–" : String(stats.totalMessages),
      sub:     loading ? "" : t("adminUnreadMessagesCount").replace("{count}", String(stats.unreadMessages)),
      color:   "from-[#5260ce] to-[#7c3aed]",
      textBg:  "bg-indigo-50",
      textCol: "text-indigo-600",
    },
    {
      href:    "/admin/homepage",
      icon:    <Home size={22} />,
      label:   t("sidebarCmsHomepage"),
      value:   t("adminManage"),
      sub:     t("adminHomeCardSub"),
      color:   "from-[#0ea5e9] to-[#2563eb]",
      textBg:  "bg-sky-50",
      textCol: "text-sky-600",
    },
    {
      href:    "/admin/site-settings",
      icon:    <Settings size={22} />,
      label:   t("sidebarCmsSiteSettings"),
      value:   t("adminConfigure"),
      sub:     t("adminSiteSettingsCardSub"),
      color:   "from-[#f59e0b] to-[#d97706]",
      textBg:  "bg-amber-50",
      textCol: "text-amber-600",
    },
    {
      href:    "/admin/footer",
      icon:    <Globe size={22} />,
      label:   t("sidebarCmsFooter"),
      value:   t("edit"),
      sub:     t("adminFooterCardSub"),
      color:   "from-[#10b981] to-[#059669]",
      textBg:  "bg-emerald-50",
      textCol: "text-emerald-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#1e1b4b] to-[#312e81] rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">{t("adminWelcomeTitle")}</h2>
        <p className="text-indigo-200 text-sm">
          {t("adminWelcomeSubtitle")}
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 mt-4 bg-indigo-500/70 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
        >
          <ShieldCheck size={15} />
          {t("adminOpenFullDashboard")}
          <ArrowRight size={14} />
        </Link>
        {stats.unreadMessages > 0 && (
          <Link
            href="/admin/messages?unread=true"
            className="inline-flex items-center gap-2 mt-4 ml-3 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
          >
            <Mail size={15} />
            {t("adminYouHaveUnread").replace("{count}", String(stats.unreadMessages))}
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
          >
            <div className={`h-1.5 bg-gradient-to-r ${card.color}`} />
            <div className="p-5">
              <div className={`w-10 h-10 ${card.textBg} ${card.textCol} rounded-xl flex items-center justify-center mb-4`}>
                {card.icon}
              </div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-gray-400 text-xs mt-0.5">{card.sub}</p>
              <div className={`flex items-center gap-1 mt-3 ${card.textCol} text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity`}>
                <span>{t("adminGoTo").replace("{label}", card.label)}</span>
                <ArrowRight size={12} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-indigo-500" />
          {t("quickActions")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: "/dashboard", label: t("adminQuickOpenBackend"), sub: t("adminQuickOpenBackendSub") },
            { href: "/admin/homepage", label: t("adminQuickEditHero"),     sub: t("adminQuickEditHeroSub") },
            { href: "/admin/homepage", label: t("adminQuickToggleSections"), sub: t("adminQuickToggleSectionsSub") },
            { href: "/admin/site-settings", label: t("adminQuickUpdateLogos"),    sub: t("adminQuickUpdateLogosSub") },
            { href: "/admin/footer",   label: t("adminQuickUpdateContact"),  sub: t("adminQuickUpdateContactSub") },
          ].map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors group"
            >
              <CheckCircle size={16} className="text-indigo-400 mt-0.5 shrink-0 group-hover:text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">{a.label}</p>
                <p className="text-xs text-gray-400">{a.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
