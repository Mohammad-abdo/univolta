"use client";

import React, { useEffect, useState, useCallback } from "react";
import { contactApi, ContactMessage } from "@/lib/admin-api";
import {
  Mail, MailOpen, Trash2, Archive, ArchiveRestore,
  RefreshCw, Search, Reply, CheckSquare, Square,
  ChevronLeft, User, Phone, Clock, Inbox, MessageSquare,
} from "lucide-react";
import { t, getLanguage } from "@/lib/i18n";

export default function MessagesPage() {
  const [messages,  setMessages]  = useState<ContactMessage[]>([]);
  const [total,     setTotal]     = useState(0);
  const [unread,    setUnread]    = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState<"all" | "unread" | "archived">("all");
  const [selected,  setSelected]  = useState<Set<string>>(new Set());
  const [activeMsg, setActiveMsg] = useState<ContactMessage | null>(null);

  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contactApi.list({
        page,
        limit:    LIMIT,
        archived: filter === "archived",
        unread:   filter === "unread",
      });
      setMessages(res.messages);
      setTotal(res.total);
      setUnread(res.unreadCount);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  const open = async (msg: ContactMessage) => {
    setActiveMsg(msg);
    if (!msg.isRead) {
      await contactApi.markRead([msg.id]).catch(() => {});
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, isRead: true } : m));
      setUnread((n) => Math.max(0, n - 1));
    }
  };

  const deleteMsg = async (id: string) => {
    await contactApi.delete(id).catch(() => {});
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (activeMsg?.id === id) setActiveMsg(null);
  };

  const archiveMsg = async (id: string, archived: boolean) => {
    await contactApi.archive(id, archived).catch(() => {});
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (activeMsg?.id === id) setActiveMsg(null);
  };

  const bulkMarkRead = async () => {
    const ids = [...selected];
    await contactApi.markRead(ids).catch(() => {});
    setMessages((prev) => prev.map((m) => selected.has(m.id) ? { ...m, isRead: true } : m));
    setSelected(new Set());
  };

  const bulkDelete = async () => {
    for (const id of selected) await contactApi.delete(id).catch(() => {});
    setMessages((prev) => prev.filter((m) => !selected.has(m.id)));
    setSelected(new Set());
    if (activeMsg && selected.has(activeMsg.id)) setActiveMsg(null);
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const toggleAll = () =>
    setSelected(selected.size === messages.length ? new Set() : new Set(messages.map((m) => m.id)));

  const filtered = search
    ? messages.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.subject?.toLowerCase().includes(search.toLowerCase()) ||
        m.message.toLowerCase().includes(search.toLowerCase())
      )
    : messages;

  const fmtDate = (d: string) => {
    const locale = getLanguage() === "ar" ? "ar-EG" : "en-US";
    return new Date(d).toLocaleDateString(locale, { month: "short", day: "numeric" });
  };

  const fmtDateTime = (d: string) => {
    const locale = getLanguage() === "ar" ? "ar-EG" : "en-US";
    return new Date(d).toLocaleString(locale);
  };

  const filterLabel = (f: typeof filter) => {
    if (f === "all") return t("dashMessagesFilterAll");
    if (f === "unread") return t("dashMessagesFilterUnread");
    return t("dashMessagesFilterArchived");
  };

  const avatarColor = (name: string) => {
    const colors = ["from-violet-500 to-purple-600", "from-blue-500 to-indigo-600", "from-pink-500 to-rose-600", "from-emerald-500 to-teal-600", "from-orange-500 to-amber-600"];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#5260ce] to-[#7c3aed] rounded-2xl p-5 text-white flex items-center gap-4 flex-wrap">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <MessageSquare size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">{t("dashMessagesPageTitle")}</h1>
          <p className="text-indigo-200 text-sm">{t("dashMessagesPageSubtitle")}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {unread > 0 && (
            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-1.5">
              <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
              <span className="text-sm font-semibold">
                {unread} {t("dashMessagesUnreadLabel")}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5">
            <Inbox size={14} />
            <span className="text-sm font-medium">
              {total} {t("dashMessagesTotalLabel")}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
            placeholder={t("dashMessagesSearchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {(["all", "unread", "archived"] as const).map((f) => (
            <button key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${filter === f ? "bg-white shadow text-indigo-700" : "text-gray-500 hover:text-gray-700"}`}
            >{filterLabel(f)}</button>
          ))}
        </div>
        <button onClick={load} className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors">
          <RefreshCw size={14} className={`text-gray-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main split */}
      <div className="flex gap-4 flex-1 min-h-[520px]">
        {/* Message list */}
        <div className={`${activeMsg ? "hidden md:flex" : "flex"} flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full md:w-80 lg:w-96 shrink-0`}>
          {/* Bulk bar */}
          {selected.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-xs">
              <span className="font-semibold flex-1">
                {selected.size} {t("dashMessagesSelectedLabel")}
              </span>
              <button onClick={bulkMarkRead} className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition-colors">
                <MailOpen size={12} /> {t("dashMessagesMarkRead")}
              </button>
              <button onClick={bulkDelete} className="flex items-center gap-1 bg-red-500/80 hover:bg-red-500 px-2 py-1 rounded-lg transition-colors">
                <Trash2 size={12} /> {t("delete")}
              </button>
            </div>
          )}

          {/* List header */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-gray-50/50">
            <button onClick={toggleAll} className="p-1 text-gray-400 hover:text-indigo-500 transition-colors">
              {selected.size === messages.length && messages.length > 0
                ? <CheckSquare size={15} className="text-indigo-500" />
                : <Square size={15} />}
            </button>
            <span className="text-xs font-medium text-gray-500 flex-1">
              {total} {total !== 1 ? t("dashMessagesMessageMany") : t("dashMessagesMessageOne")}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading && filtered.length === 0 && (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm gap-2">
                <RefreshCw size={16} className="animate-spin" /> {t("dashMessagesListLoading")}
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
                <Mail size={36} className="opacity-20" />
                <p className="text-sm">{t("dashMessagesEmpty")}</p>
              </div>
            )}
            {filtered.map((msg) => (
              <div
                key={msg.id}
                onClick={() => open(msg)}
                className={`flex items-start gap-3 px-3 py-3.5 cursor-pointer transition-colors group
                  ${activeMsg?.id === msg.id ? "bg-indigo-50 border-l-2 border-l-indigo-500" : "hover:bg-gray-50/80"}
                  ${!msg.isRead ? "bg-blue-50/40" : ""}`}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSelect(msg.id); }}
                  className="p-0.5 text-gray-300 hover:text-indigo-400 mt-1 shrink-0 transition-colors"
                >
                  {selected.has(msg.id) ? <CheckSquare size={14} className="text-indigo-500" /> : <Square size={14} />}
                </button>
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor(msg.name)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                  {msg.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className={`text-sm truncate ${!msg.isRead ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                      {msg.name}
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0">{fmtDate(msg.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate font-medium">{msg.subject || msg.email}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{msg.message}</p>
                </div>
                {!msg.isRead && <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full mt-1.5 shrink-0" />}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {total > LIMIT && (
            <div className="flex items-center justify-between px-3 py-2.5 border-t border-gray-100 text-xs text-gray-500 bg-gray-50/50">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors font-medium">← {t("dashMessagesPaginationPrev")}</button>
              <span className="font-medium">{page} / {Math.ceil(total / LIMIT)}</span>
              <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors font-medium">{t("dashMessagesPaginationNext")} →</button>
            </div>
          )}
        </div>

        {/* Message detail */}
        <div className={`${activeMsg ? "flex" : "hidden md:flex"} flex-1 flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-0`}>
          {!activeMsg ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
                <MailOpen size={28} className="opacity-50" />
              </div>
              <p className="text-sm font-medium text-gray-400">{t("dashMessagesSelectPrompt")}</p>
            </div>
          ) : (
            <>
              {/* Detail header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <button onClick={() => setActiveMsg(null)} className="md:hidden p-1.5 rounded-xl hover:bg-gray-200 transition-colors shrink-0">
                  <ChevronLeft size={18} className="text-gray-500" />
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{activeMsg.subject || t("dashMessagesNoSubject")}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{fmtDateTime(activeMsg.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={`mailto:${activeMsg.email}?subject=Re: ${encodeURIComponent(activeMsg.subject ?? "Your message")}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Reply size={13} /> {t("dashMessagesReply")}
                  </a>
                  <button
                    onClick={() => archiveMsg(activeMsg.id, !activeMsg.isArchived)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    title={activeMsg.isArchived ? t("dashMessagesUnarchiveTitle") : t("dashMessagesArchiveTitle")}
                  >
                    {activeMsg.isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                  </button>
                  <button
                    onClick={() => deleteMsg(activeMsg.id)}
                    className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Sender info */}
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor(activeMsg.name)} flex items-center justify-center text-white font-bold shrink-0`}>
                    {activeMsg.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{activeMsg.name}</p>
                    <a href={`mailto:${activeMsg.email}`} className="text-xs text-indigo-600 hover:underline">{activeMsg.email}</a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500">
                  {activeMsg.phone && (
                    <span className="flex items-center gap-1.5"><Phone size={11} className="text-gray-400" /> {activeMsg.phone}</span>
                  )}
                  <span className="flex items-center gap-1.5"><Clock size={11} className="text-gray-400" /> {fmtDateTime(activeMsg.createdAt)}</span>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 p-5 overflow-y-auto">
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                  {activeMsg.message}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                <a
                  href={`mailto:${activeMsg.email}?subject=Re: ${encodeURIComponent(activeMsg.subject ?? "Your message")}`}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  <Reply size={15} /> {t("dashMessagesReplyViaEmail")}
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
