"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPut, apiDelete } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { canAccess, type UserRole } from "@/lib/permissions";
import { API_BASE_URL } from "@/lib/constants";
import {
  Plus, Trash2, Save, X, Search, RefreshCw,
  Users, Shield, UserCheck, UserX, Edit2, ChevronLeft, ChevronRight,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "editor" | "user";
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

const ROLE_STYLES: Record<string, string> = {
  admin:  "bg-violet-100 text-violet-700 border border-violet-200",
  editor: "bg-blue-100   text-blue-700   border border-blue-200",
  user:   "bg-gray-100   text-gray-600   border border-gray-200",
};

const PAGE_SIZE = 10;

export default function UsersPage() {
  const [users,         setUsers]         = useState<User[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [editingId,     setEditingId]     = useState<string | null>(null);
  const [editForm,      setEditForm]      = useState<{ role: UserRole; isActive: boolean } | null>(null);
  const [userRole,      setUserRole]      = useState<UserRole | null>(null);
  const [search,        setSearch]        = useState("");
  const [roleFilter,    setRoleFilter]    = useState("all");
  const [statusFilter,  setStatusFilter]  = useState("all");
  const [page,          setPage]          = useState(1);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const d = await res.json();
            setUserRole(d.role?.toLowerCase() as UserRole);
          }
        }
      } catch { /* silent */ }
      fetchUsers();
    };
    init();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiGet<User[]>("/users");
      setUsers(data);
    } catch { showToast.error("Failed to load users"); }
    finally { setLoading(false); }
  };

  const handleSave = async (id: string) => {
    if (!editForm) return;
    try {
      await apiPut(`/users/${id}`, editForm);
      await fetchUsers();
      setEditingId(null);
      setEditForm(null);
      showToast.success("User updated!");
    } catch (e: any) { showToast.error(e.message || "Update failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await apiDelete(`/users/${id}`);
      showToast.success("User deleted!");
      fetchUsers();
    } catch (e: any) { showToast.error(e.message || "Delete failed"); }
  };

  const canEdit   = userRole && canAccess(userRole, "users", "update");
  const canCreate = userRole && canAccess(userRole, "users", "create");
  const canDelete = userRole && canAccess(userRole, "users", "delete");

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "all"   || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || String(u.isActive) === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeCount = users.filter((u) => u.isActive).length;
  const adminCount  = users.filter((u) => u.role === "admin").length;

  const avatarColor = (name: string) => {
    const colors = ["from-violet-500 to-purple-600", "from-blue-500 to-indigo-600", "from-pink-500 to-rose-600", "from-emerald-500 to-teal-600", "from-orange-500 to-amber-600"];
    return colors[(name.charCodeAt(0) || 0) % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#5260ce] to-[#4350b0] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <Users size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Users Management</h1>
              <p className="text-indigo-200 text-sm">Manage roles, permissions and access</p>
            </div>
          </div>
          {canCreate && (
            <Link
              href="/dashboard/users/add"
              className="inline-flex items-center gap-2 bg-white text-[#5260ce] hover:bg-indigo-50 active:scale-95 text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <Plus size={16} /> Add User
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mt-5 flex-wrap">
          {[
            { label: "Total Users",   value: users.length,  icon: <Users size={14} /> },
            { label: "Active",        value: activeCount,   icon: <UserCheck size={14} /> },
            { label: "Inactive",      value: users.length - activeCount, icon: <UserX size={14} /> },
            { label: "Admins",        value: adminCount,    icon: <Shield size={14} /> },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 bg-white/15 rounded-xl px-4 py-2">
              <span className="text-indigo-200">{s.icon}</span>
              <span className="text-xl font-bold">{s.value}</span>
              <span className="text-indigo-200 text-xs font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="user">User</option>
        </select>
        <select
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="all">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button onClick={fetchUsers} className="w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors">
          <RefreshCw size={14} className={`text-gray-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-3 text-gray-500">
            <RefreshCw size={18} className="animate-spin" />
            <span className="text-sm">Loading users…</span>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
            <Users size={36} className="opacity-20" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Last Login</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                    {(canEdit || canDelete) && (
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor(user.name)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-4">
                        {editingId === user.id && editForm ? (
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                            className="border border-indigo-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          >
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="user">User</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${ROLE_STYLES[user.role] ?? ROLE_STYLES.user}`}>
                            {user.role === "admin" && <Shield size={10} />}
                            {user.role}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        {editingId === user.id && editForm ? (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <div
                              onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                              className={`relative w-10 h-5 rounded-full transition-colors ${editForm.isActive ? "bg-emerald-500" : "bg-gray-300"}`}
                            >
                              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editForm.isActive ? "translate-x-5" : "translate-x-0"}`} />
                            </div>
                            <span className="text-xs text-gray-600 font-medium">{editForm.isActive ? "Active" : "Inactive"}</span>
                          </label>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            user.isActive ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-red-100 text-red-600 border border-red-200"
                          }`}>
                            {user.isActive ? <UserCheck size={10} /> : <UserX size={10} />}
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        )}
                      </td>

                      {/* Last login */}
                      <td className="px-4 py-4 text-xs text-gray-400 hidden md:table-cell">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Never"}
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-4 text-xs text-gray-400 hidden lg:table-cell">
                        {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>

                      {/* Actions */}
                      {(canEdit || canDelete) && (
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {editingId === user.id ? (
                              <>
                                <button
                                  onClick={() => handleSave(user.id)}
                                  className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                  title="Save"
                                >
                                  <Save size={14} />
                                </button>
                                <button
                                  onClick={() => { setEditingId(null); setEditForm(null); }}
                                  className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                {canEdit && (
                                  <button
                                    onClick={() => { setEditingId(user.id); setEditForm({ role: user.role, isActive: user.isActive }); }}
                                    className="p-2 rounded-xl bg-indigo-50 text-indigo-500 hover:bg-indigo-100 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Edit"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    onClick={() => handleDelete(user.id)}
                                    className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
                <span className="text-xs text-gray-500">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                        p === page ? "bg-[#5260ce] text-white" : "hover:bg-gray-200 text-gray-600"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
