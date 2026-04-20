"use client";

import React, { useEffect, useState, useCallback } from "react";
import { contactApi, ContactMessage } from "@/lib/admin-api";
import {
  Mail, MailOpen, Trash2, Archive, ArchiveRestore,
  RefreshCw, Search, Filter, Reply, CheckSquare, Square,
  ChevronLeft, User, Phone, Clock,
} from "lucide-react";

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
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

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

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-800">Messages</h2>
          {unread > 0 && (
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {unread} unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Search messages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {(["all", "unread", "archived"] as const).map((f) => (
              <button key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize
                  ${filter === f ? "bg-white shadow text-indigo-700" : "text-gray-500 hover:text-gray-700"}`}
              >{f}</button>
            ))}
          </div>
          <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <RefreshCw size={15} className={`text-gray-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Message list */}
        <div className={`${activeMsg ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 lg:w-96 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}>
          {/* Bulk actions */}
          {selected.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border-b border-indigo-100 text-xs">
              <span className="text-indigo-700 font-medium">{selected.size} selected</span>
              <button onClick={bulkMarkRead} className="ml-auto text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <MailOpen size={12} /> Mark read
              </button>
              <button onClick={bulkDelete} className="text-red-500 hover:text-red-700 flex items-center gap-1">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}

          {/* List header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50/50">
            <button onClick={toggleAll} className="p-1 text-gray-400 hover:text-indigo-500 transition-colors">
              {selected.size === messages.length && messages.length > 0 ? <CheckSquare size={14} /> : <Square size={14} />}
            </button>
            <span className="text-xs text-gray-400">{total} message{total !== 1 ? "s" : ""}</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading && filtered.length === 0 && (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                <RefreshCw size={18} className="animate-spin mr-2" /> Loading…
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <Mail size={32} className="mb-2 opacity-30" />
                <p className="text-sm">No messages found</p>
              </div>
            )}
            {filtered.map((msg) => (
              <div
                key={msg.id}
                onClick={() => open(msg)}
                className={`flex items-start gap-3 px-3 py-3 cursor-pointer transition-colors hover:bg-indigo-50/50
                  ${activeMsg?.id === msg.id ? "bg-indigo-50 border-l-2 border-indigo-500" : ""}
                  ${!msg.isRead ? "bg-blue-50/30" : ""}`}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSelect(msg.id); }}
                  className="p-0.5 text-gray-300 hover:text-indigo-400 mt-0.5 shrink-0 transition-colors"
                >
                  {selected.has(msg.id) ? <CheckSquare size={14} className="text-indigo-500" /> : <Square size={14} />}
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {msg.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-sm truncate ${!msg.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                      {msg.name}
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0">{fmtDate(msg.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{msg.subject || msg.email}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{msg.message}</p>
                </div>
                {!msg.isRead && <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 shrink-0" />}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {total > LIMIT && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 text-xs text-gray-500 bg-gray-50/50">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-40 transition-colors">← Prev</button>
              <span>Page {page} of {Math.ceil(total / LIMIT)}</span>
              <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage((p) => p + 1)}
                className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-40 transition-colors">Next →</button>
            </div>
          )}
        </div>

        {/* Message detail */}
        <div className={`${activeMsg ? "flex" : "hidden md:flex"} flex-1 flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}>
          {!activeMsg ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <MailOpen size={48} className="mb-3 opacity-40" />
              <p className="text-sm">Select a message to read</p>
            </div>
          ) : (
            <>
              {/* Detail header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <button onClick={() => setActiveMsg(null)} className="md:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <ChevronLeft size={18} className="text-gray-500" />
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{activeMsg.subject || "No subject"}</h3>
                  <p className="text-xs text-gray-400">{fmtDate(activeMsg.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={`mailto:${activeMsg.email}?subject=Re: ${encodeURIComponent(activeMsg.subject ?? "Your message")}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-medium transition-colors"
                  >
                    <Reply size={12} /> Reply
                  </a>
                  <button
                    onClick={() => archiveMsg(activeMsg.id, !activeMsg.isArchived)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    title={activeMsg.isArchived ? "Unarchive" : "Archive"}
                  >
                    {activeMsg.isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                  </button>
                  <button
                    onClick={() => deleteMsg(activeMsg.id)}
                    className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Sender info */}
              <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span className="flex items-center gap-2 text-gray-600">
                  <User size={14} className="text-gray-400" />
                  {activeMsg.name}
                </span>
                <a href={`mailto:${activeMsg.email}`} className="flex items-center gap-2 text-indigo-600 hover:underline">
                  <Mail size={14} className="text-gray-400" />
                  {activeMsg.email}
                </a>
                {activeMsg.phone && (
                  <span className="flex items-center gap-2 text-gray-600">
                    <Phone size={14} className="text-gray-400" />
                    {activeMsg.phone}
                  </span>
                )}
                <span className="flex items-center gap-2 text-gray-400 text-xs ml-auto">
                  <Clock size={12} />
                  {new Date(activeMsg.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Message body */}
              <div className="flex-1 p-5 overflow-y-auto">
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {activeMsg.message}
                </div>
              </div>

              {/* Quick reply button */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                <a
                  href={`mailto:${activeMsg.email}?subject=Re: ${encodeURIComponent(activeMsg.subject ?? "Your message")}`}
                  className="inline-flex items-center gap-2 bg-[#5260ce] hover:bg-[#4251be] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                >
                  <Reply size={15} />
                  Reply via Email
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
