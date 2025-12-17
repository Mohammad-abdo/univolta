"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPut, apiPost, apiDelete } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { canAccess, type UserRole, getRolePermissions } from "@/lib/permissions";
import { API_BASE_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";

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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ role: UserRole; isActive: boolean } | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // Fetch current user role
    const fetchUserRole = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setUserRole(userData.role?.toLowerCase() as UserRole);
          }
        }
      } catch (error) {
        // Silent fail for role check
      }
    };

    fetchUserRole();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiGet<User[]>("/users");
      setUsers(data);
    } catch (error: any) {
      showToast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditForm({ role: user.role, isActive: user.isActive });
  };

  const handleCancel = () => {
    setEditingUserId(null);
    setEditForm(null);
  };

  const handleSave = async (userId: string) => {
    if (!editForm) return;

    try {
      await apiPut(`/users/${userId}`, editForm);
      await fetchUsers();
      setEditingUserId(null);
      setEditForm(null);
      showToast.success("User updated successfully!");
    } catch (error: any) {
      showToast.error(error.message || "Failed to update user");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const roleColors = {
    admin: "bg-red-100 text-red-800",
    editor: "bg-blue-100 text-blue-800",
    user: "bg-gray-100 text-gray-800",
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      await apiDelete(`/users/${userId}`);
      showToast.success("User deleted successfully!");
      await fetchUsers();
    } catch (error: any) {
      showToast.error(error.message || "Failed to delete user");
    }
  };

  const canEditUsers = userRole && canAccess(userRole, "users", "update");
  const canCreateUsers = userRole && canAccess(userRole, "users", "create");
  const canDeleteUsers = userRole && canAccess(userRole, "users", "delete");

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <h1 className="text-2xl md:text-3xl font-montserrat-bold text-[#121c67]">Users Management</h1>
        {canCreateUsers && (
          <Link href="/dashboard/users/add" className="w-full sm:w-auto">
            <Button className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add User</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        )}
      </div>
      
      {/* Permissions Info */}
      {userRole && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-montserrat-semibold text-[#121c67] mb-2">Your Permissions</h2>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-semibold">Role:</span>{" "}
            <span className="px-2 py-1 bg-[#5260ce] text-white rounded text-xs uppercase">
              {userRole}
            </span>
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {getRolePermissions(userRole).map((permission) => (
              <span
                key={permission}
                className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
              >
                {permission}
              </span>
            ))}
          </div>
        </div>
      )}

      <DataTable
        data={users}
        columns={[
          {
            key: "name",
            header: "Name",
            render: (user) => <div className="text-sm font-medium">{user.name}</div>,
          },
          {
            key: "email",
            header: "Email",
            render: (user) => <div className="text-sm text-gray-600">{user.email}</div>,
          },
          {
            key: "role",
            header: "Role",
            render: (user) =>
              editingUserId === user.id && editForm ? (
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="user">User</option>
                </select>
              ) : (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                  {user.role}
                </span>
              ),
          },
          {
            key: "status",
            header: "Status",
            render: (user) =>
              editingUserId === user.id && editForm ? (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#5260ce] border-gray-300 rounded"
                  />
                  <span className="text-sm">Active</span>
                </label>
              ) : (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              ),
          },
          {
            key: "lastLogin",
            header: "Last Login",
            render: (user) => (
              <div className="text-sm text-gray-500">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
              </div>
            ),
          },
          ...(canEditUsers || canDeleteUsers
            ? [
                {
                  key: "actions",
                  header: "Actions",
                  render: (user: User) => (
                    <div className="flex items-center gap-2">
                      {editingUserId === user.id ? (
                        <>
                          <button
                            onClick={() => handleSave(user.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={handleCancel} className="text-red-600 hover:text-red-900">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {canEditUsers && (
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {canDeleteUsers && (
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ),
                } as Column<User>,
              ]
            : []),
        ]}
        searchable
        searchPlaceholder="Search users by name or email..."
        searchKeys={["name", "email"]}
        filters={[
          {
            key: "role",
            label: "Role",
            options: [
              { value: "all", label: "All Roles" },
              { value: "admin", label: "Admin" },
              { value: "editor", label: "Editor" },
              { value: "user", label: "User" },
            ],
          },
          {
            key: "isActive",
            label: "Status",
            options: [
              { value: "all", label: "All Status" },
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ],
          },
        ]}
        pagination={{
          page: 1,
          pageSize: 10,
          total: users.length,
          onPageChange: () => {},
        }}
        emptyMessage="No users found"
        loading={loading}
      />
    </div>
  );
}
