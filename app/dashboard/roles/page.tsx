"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { canAccess, type UserRole } from "@/lib/permissions";
import { API_BASE_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Save, X, Shield, Users as UsersIcon } from "lucide-react";
import { showToast } from "@/lib/toast";
import { DataTable, type Column } from "@/components/ui/data-table";
import { t } from "@/lib/i18n";

interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: Permission[];
  userCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; description: string; permissionIds: string[] } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "", permissionIds: [] as string[] });
  const [newPermission, setNewPermission] = useState({ resource: "", action: "", description: "" });

  useEffect(() => {
    fetchUserRole();
    fetchData();
  }, []);

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
      console.error("Error fetching user role:", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        apiGet<Role[]>("/roles"),
        apiGet<Permission[]>("/roles/permissions"),
      ]);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermissions(Array.isArray(permissionsData) ? permissionsData : []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      showToast.error(error.message || "Failed to load roles and permissions");
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRoleId(role.id);
    setEditForm({
      name: role.name,
      description: role.description || "",
      permissionIds: role.permissions.map((p) => p.id),
    });
  };

  const handleCancel = () => {
    setEditingRoleId(null);
    setEditForm(null);
    setShowAddForm(false);
    setNewRole({ name: "", description: "", permissionIds: [] });
  };

  const handleSave = async (roleId: string) => {
    if (!editForm) return;

    try {
      await apiPut(`/roles/${roleId}`, editForm);
      showToast.success("Role updated successfully!");
      await fetchData();
      handleCancel();
    } catch (error: any) {
      console.error("Error updating role:", error);
      showToast.error(error.message || "Failed to update role");
    }
  };

  const handleCreate = async () => {
    if (!newRole.name.trim()) {
      showToast.error("Role name is required");
      return;
    }

    try {
      await apiPost("/roles", newRole);
      showToast.success("Role created successfully!");
      await fetchData();
      handleCancel();
    } catch (error: any) {
      console.error("Error creating role:", error);
      showToast.error(error.message || "Failed to create role");
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) {
      return;
    }

    try {
      await apiDelete(`/roles/${roleId}`);
      showToast.success("Role deleted successfully!");
      await fetchData();
    } catch (error: any) {
      console.error("Error deleting role:", error);
      showToast.error(error.message || "Failed to delete role");
    }
  };

  const handleCreatePermission = async () => {
    if (!newPermission.resource.trim() || !newPermission.action.trim()) {
      showToast.error("Resource and action are required");
      return;
    }

    try {
      await apiPost("/roles/permissions", {
        resource: newPermission.resource.trim(),
        action: newPermission.action.trim(),
        description: newPermission.description?.trim() || undefined,
      });
      showToast.success("Permission created successfully!");
      await fetchData();
      setShowPermissionModal(false);
      setNewPermission({ resource: "", action: "", description: "" });
    } catch (error: any) {
      console.error("Error creating permission:", error);
      showToast.error(error.message || "Failed to create permission");
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    if (!confirm("Are you sure you want to delete this permission?")) {
      return;
    }

    try {
      await apiDelete(`/roles/permissions/${permissionId}`);
      showToast.success("Permission deleted successfully!");
      await fetchData();
    } catch (error: any) {
      console.error("Error deleting permission:", error);
      showToast.error(error.message || "Failed to delete permission");
    }
  };

  const canManageRoles = userRole && canAccess(userRole, "users", "create");

  // Group permissions by resource
  const permissionsByResource = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const roleColumns: Column<Role>[] = [
    {
      key: "name",
      header: "Name",
      render: (role) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#5260ce]" />
          {editingRoleId === role.id && editForm ? (
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
            />
          ) : (
            <span className="font-montserrat-semibold text-gray-900">{role.name}</span>
          )}
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (role) =>
        editingRoleId === role.id && editForm ? (
          <input
            type="text"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
            placeholder="Role description"
          />
        ) : (
          <span className="text-sm text-gray-600">{role.description || "-"}</span>
        ),
    },
    {
      key: "permissions",
      header: "Permissions",
      render: (role) => (
        <div className="flex flex-wrap gap-1">
          {editingRoleId === role.id && editForm ? (
            <div className="text-xs text-gray-500">Click to edit permissions</div>
          ) : (
            role.permissions.slice(0, 3).map((perm) => (
              <span key={perm.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {perm.resource}:{perm.action}
              </span>
            ))
          )}
          {role.permissions.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              +{role.permissions.length - 3} more
            </span>
          )}
        </div>
      ),
    },
    {
      key: "users",
      header: "Users",
      render: (role) => (
        <div className="flex items-center gap-1 text-sm">
          <UsersIcon className="w-4 h-4 text-gray-500" />
          <span>{role.userCount}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (role) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            role.isSystem ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"
          }`}
        >
          {role.isSystem ? "System" : "Custom"}
        </span>
      ),
    },
    ...(canManageRoles
      ? [
          {
            key: "actions",
            header: "Actions",
            render: (role: Role) => (
              <div className="flex items-center gap-2">
                {editingRoleId === role.id ? (
                  <>
                    <button
                      onClick={() => handleSave(role.id)}
                      className="text-green-600 hover:text-green-900 p-1"
                      title="Save"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={handleCancel} className="text-red-600 hover:text-red-900 p-1" title="Cancel">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    {!role.isSystem && (
                      <>
                        <button
                          onClick={() => handleEdit(role)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={role.userCount > 0}
                          title={role.userCount > 0 ? "Cannot delete role with assigned users" : "Delete"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            ),
          } as Column<Role>,
        ]
      : []),
  ];

  const permissionColumns: Column<Permission>[] = [
    {
      key: "resource",
      header: "Resource",
      render: (perm) => <span className="font-semibold capitalize text-gray-900">{perm.resource}</span>,
    },
    {
      key: "action",
      header: "Action",
      render: (perm) => <span className="text-gray-700">{perm.action}</span>,
    },
    {
      key: "description",
      header: "Description",
      render: (perm) => <span className="text-sm text-gray-600">{perm.description || "-"}</span>,
    },
    ...(canManageRoles
      ? [
          {
            key: "actions",
            header: "Actions",
            render: (perm: Permission) => (
              <button
                onClick={() => handleDeletePermission(perm.id)}
                className="text-red-600 hover:text-red-900 p-1"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ),
          } as Column<Permission>,
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-montserrat-bold text-[#121c67]">
            {t("rolesPermissions")}
          </h1>
          <p className="text-sm text-gray-600 mt-1">{t("manageRolesPermissions")}</p>
        </div>
        {canManageRoles && (
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-[#5260ce] hover:bg-[#4350b0] text-white font-montserrat-semibold text-sm md:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t("addRole")}</span>
              <span className="sm:hidden">{t("add")}</span>
            </Button>
            <Button
              onClick={() => setShowPermissionModal(true)}
              variant="outline"
              className="font-montserrat-semibold text-sm md:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t("addPermission")}</span>
              <span className="sm:hidden">{t("add")}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Add Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-montserrat-bold text-[#121c67]">
                {t("createNewPermission")}
              </h2>
              <button
                onClick={() => {
                  setShowPermissionModal(false);
                  setNewPermission({ resource: "", action: "", description: "" });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-montserrat-semibold text-sm mb-2">
                  {t("resource")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPermission.resource}
                  onChange={(e) => setNewPermission({ ...newPermission, resource: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#5260ce] text-sm md:text-base"
                  placeholder="e.g., universities, programs, applications"
                />
              </div>
              <div>
                <label className="block font-montserrat-semibold text-sm mb-2">
                  {t("action")} <span className="text-red-500">*</span>
                </label>
                <select
                  value={newPermission.action}
                  onChange={(e) => setNewPermission({ ...newPermission, action: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#5260ce] text-sm md:text-base"
                >
                  <option value="">{t("selectAction")}</option>
                  <option value="create">{t("create")}</option>
                  <option value="read">{t("read")}</option>
                  <option value="update">{t("update")}</option>
                  <option value="delete">{t("delete")}</option>
                </select>
              </div>
              <div>
                <label className="block font-montserrat-semibold text-sm mb-2">{t("description")}</label>
                <textarea
                  value={newPermission.description}
                  onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#5260ce] text-sm md:text-base"
                  placeholder={t("permissionDescription")}
                  rows={3}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleCreatePermission}
                  className="bg-[#5260ce] hover:bg-[#4350b0] flex-1 text-sm md:text-base"
                >
                  {t("createPermission")}
                </Button>
                <Button
                  onClick={() => {
                    setShowPermissionModal(false);
                    setNewPermission({ resource: "", action: "", description: "" });
                  }}
                  variant="outline"
                  className="flex-1 text-sm md:text-base"
                >
                  {t("cancel")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Role Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-montserrat-bold text-[#121c67] mb-4">
            {t("createNewRole")}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">
                {t("roleName")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#5260ce] text-sm md:text-base"
                placeholder="e.g., moderator"
              />
            </div>
            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">{t("roleDescription")}</label>
              <input
                type="text"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#5260ce] text-sm md:text-base"
                placeholder={t("roleDescription")}
              />
            </div>
            <div>
              <label className="block font-montserrat-semibold text-sm mb-2">{t("permissions")}</label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-4">
                {Object.entries(permissionsByResource).map(([resource, perms]) => (
                  <div key={resource} className="mb-4">
                    <h4 className="font-semibold text-sm capitalize mb-2 text-gray-700">{resource}</h4>
                    <div className="flex flex-wrap gap-2">
                      {perms.map((perm) => (
                        <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newRole.permissionIds.includes(perm.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewRole({ ...newRole, permissionIds: [...newRole.permissionIds, perm.id] });
                              } else {
                                setNewRole({
                                  ...newRole,
                                  permissionIds: newRole.permissionIds.filter((id) => id !== perm.id),
                                });
                              }
                            }}
                            className="w-4 h-4 text-[#5260ce] border-gray-300 rounded focus:ring-[#5260ce]"
                          />
                          <span className="text-sm text-gray-700">{perm.action}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleCreate}
                className="bg-[#5260ce] hover:bg-[#4350b0] flex-1 text-sm md:text-base"
              >
                {t("createRole")}
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1 text-sm md:text-base">
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {editingRoleId && editForm && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-montserrat-bold text-[#121c67] mb-4">Edit Role Permissions</h2>
          <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg p-4">
            {Object.entries(permissionsByResource).map(([resource, perms]) => (
              <div key={resource} className="mb-4">
                <h4 className="font-semibold text-sm capitalize mb-2 text-gray-700">{resource}</h4>
                <div className="flex flex-wrap gap-2">
                  {perms.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.permissionIds.includes(perm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditForm({ ...editForm, permissionIds: [...editForm.permissionIds, perm.id] });
                          } else {
                            setEditForm({
                              ...editForm,
                              permissionIds: editForm.permissionIds.filter((id) => id !== perm.id),
                            });
                          }
                        }}
                        className="w-4 h-4 text-[#5260ce] border-gray-300 rounded focus:ring-[#5260ce]"
                      />
                      <span className="text-sm text-gray-700">{perm.action}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roles Table */}
      <div>
        <h2 className="text-lg md:text-xl font-montserrat-bold text-[#121c67] mb-4">{t("allRoles")}</h2>
        <DataTable
          data={roles}
          columns={roleColumns}
          searchable
          searchPlaceholder="Search roles..."
          searchKeys={["name", "description"]}
          pagination={{
            page: 1,
            pageSize: 10,
            total: roles.length,
            onPageChange: () => {},
          }}
          emptyMessage={t("noData")}
          loading={loading}
        />
      </div>

      {/* Permissions Table */}
      <div>
        <h2 className="text-lg md:text-xl font-montserrat-bold text-[#121c67] mb-4">
          {t("allPermissions")}
        </h2>
        <DataTable
          data={permissions}
          columns={permissionColumns}
          searchable
          searchPlaceholder="Search permissions..."
          searchKeys={["resource", "action", "description"]}
          filters={
            permissions.length > 0
              ? [
                  {
                    key: "resource",
                    label: "Resource",
                    options: [
                      { value: "all", label: "All Resources" },
                      ...Array.from(new Set(permissions.map((p) => p.resource))).map((resource) => ({
                        value: resource,
                        label: resource.charAt(0).toUpperCase() + resource.slice(1),
                      })),
                    ],
                  },
                ]
              : []
          }
          pagination={{
            page: 1,
            pageSize: 10,
            total: permissions.length,
            onPageChange: () => {},
          }}
          emptyMessage={t("noData")}
          loading={loading}
        />
      </div>
    </div>
  );
}
