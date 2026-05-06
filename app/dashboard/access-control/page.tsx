"use client";

import { useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import { type UserRole } from "@/lib/permissions";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import { t } from "@/lib/i18n";
import { Save, RefreshCw, Shield, Users, KeyRound, Plus, Trash2, X, Check } from "lucide-react";
import { fetchMeAuthz } from "@/lib/authz";

type Permission = {
  id: string;
  resource: string;
  action: string;
  description?: string;
};

type Role = {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: Permission[];
  userCount: number;
};

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "editor" | "user";
  isActive: boolean;
};

export default function AccessControlPage() {
  const [meRole, setMeRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [usersLoading, setUsersLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [usersQuery, setUsersQuery] = useState("");
  const [rolesQuery, setRolesQuery] = useState("");
  const [expandedResources, setExpandedResources] = useState<Record<string, boolean>>({});

  const [rolePermissionIds, setRolePermissionIds] = useState<string[]>([]);

  const [activePanel, setActivePanel] = useState<"roles" | "permissions">("roles");

  const [showCreateRole, setShowCreateRole] = useState(false);
  const [createRoleForm, setCreateRoleForm] = useState<{
    name: string;
    description: string;
    permissionIds: string[];
  }>({ name: "", description: "", permissionIds: [] });

  const [showCreatePermission, setShowCreatePermission] = useState(false);
  const [createPermissionForm, setCreatePermissionForm] = useState<{
    resource: string;
    action: string;
    description: string;
  }>({ resource: "", action: "", description: "" });

  const [editingPermissionId, setEditingPermissionId] = useState<string | null>(null);
  const [editPermissionForm, setEditPermissionForm] = useState<{
    resource: string;
    action: string;
    description: string;
  } | null>(null);

  const canAdmin = meRole === "admin";

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) || null,
    [users, selectedUserId]
  );

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) || null,
    [roles, selectedRoleId]
  );

  const filteredUsers = useMemo(() => {
    const q = usersQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q)
      );
    });
  }, [users, usersQuery]);

  const filteredRoles = useMemo(() => {
    const q = rolesQuery.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => (r.name || "").toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q));
  }, [roles, rolesQuery]);

  const permissionsByResource = useMemo(() => {
    const map: Record<string, Permission[]> = {};
    for (const p of permissions) {
      map[p.resource] = map[p.resource] || [];
      map[p.resource].push(p);
    }
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.action.localeCompare(b.action)));
    return map;
  }, [permissions]);

  const rolePermissionIdSet = useMemo(() => new Set(rolePermissionIds), [rolePermissionIds]);

  const rolePermCounts = useMemo(() => {
    const total = permissions.length;
    const selected = rolePermissionIds.length;
    return { selected, total };
  }, [permissions.length, rolePermissionIds.length]);

  const fetchMeRole = async () => {
    try {
      const me = await fetchMeAuthz();
      setMeRole(me.role?.toLowerCase() as UserRole);
    } catch {
      // ignore
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await apiGet<User[]>("/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      showToast.error(e.message || "Failed to load users");
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchRolesAndPermissions = async () => {
    setRolesLoading(true);
    try {
      const [rolesData, permissionsData] = await Promise.all([
        apiGet<Role[]>("/roles"),
        apiGet<Permission[]>("/roles/permissions"),
      ]);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermissions(Array.isArray(permissionsData) ? permissionsData : []);
    } catch (e: any) {
      showToast.error(e.message || "Failed to load roles/permissions");
      setRoles([]);
      setPermissions([]);
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchPermissionsOnly = async () => {
    setRolesLoading(true);
    try {
      const permissionsData = await apiGet<Permission[]>("/roles/permissions");
      setPermissions(Array.isArray(permissionsData) ? permissionsData : []);
    } catch (e: any) {
      showToast.error(e.message || "Failed to load permissions");
      setPermissions([]);
    } finally {
      setRolesLoading(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchUsers(), fetchRolesAndPermissions()]);
  };

  useEffect(() => {
    (async () => {
      await fetchMeRole();
      await refreshAll();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep role editor form in sync with selection
  useEffect(() => {
    if (!selectedRole) {
      setRolePermissionIds([]);
      return;
    }
    setRolePermissionIds((selectedRole.permissions || []).map((p) => p.id));
  }, [selectedRoleId]); // intentionally only on role change

  const assignRoleToUser = async (newRole: User["role"]) => {
    if (!canAdmin) {
      showToast.error("Admin only can assign roles.");
      return;
    }
    if (!selectedUser) return;
    try {
      await apiPut(`/users/${selectedUser.id}`, {
        role: newRole,
        isActive: selectedUser.isActive,
      });
      showToast.success("User role updated!");
      await fetchUsers();
    } catch (e: any) {
      showToast.error(e.message || "Failed to update user role");
    }
  };

  const saveRolePermissions = async () => {
    if (!canAdmin) {
      showToast.error("Admin only can edit role permissions.");
      return;
    }
    if (!selectedRole) return;
    try {
      await apiPut(`/roles/${selectedRole.id}`, {
        name: selectedRole.name,
        description: selectedRole.description || "",
        permissionIds: rolePermissionIds,
      });
      showToast.success("Role permissions updated!");
      await fetchRolesAndPermissions();
    } catch (e: any) {
      showToast.error(e.message || "Failed to update role permissions");
    }
  };

  const createPermission = async () => {
    if (!canAdmin) {
      showToast.error("Admin only can create permissions.");
      return;
    }
    if (!createPermissionForm.resource.trim() || !createPermissionForm.action.trim()) {
      showToast.error("Resource and action are required");
      return;
    }
    try {
      await apiPost("/roles/permissions", {
        resource: createPermissionForm.resource.trim(),
        action: createPermissionForm.action.trim(),
        description: createPermissionForm.description.trim() || undefined,
      });
      showToast.success("Permission created!");
      setShowCreatePermission(false);
      setCreatePermissionForm({ resource: "", action: "", description: "" });
      await fetchRolesAndPermissions();
    } catch (e: any) {
      showToast.error(e.message || "Failed to create permission");
    }
  };

  const startEditPermission = (p: Permission) => {
    if (!canAdmin) return;
    setEditingPermissionId(p.id);
    setEditPermissionForm({
      resource: p.resource,
      action: p.action,
      description: p.description || "",
    });
  };

  const cancelEditPermission = () => {
    setEditingPermissionId(null);
    setEditPermissionForm(null);
  };

  const savePermission = async (permissionId: string) => {
    if (!canAdmin) {
      showToast.error("Admin only can edit permissions.");
      return;
    }
    if (!editPermissionForm) return;
    if (!editPermissionForm.resource.trim() || !editPermissionForm.action.trim()) {
      showToast.error("Resource and action are required");
      return;
    }
    try {
      try {
        await apiPut(`/roles/permissions/${permissionId}`, {
          resource: editPermissionForm.resource.trim(),
          action: editPermissionForm.action.trim(),
          description: editPermissionForm.description.trim() || undefined,
        });
      } catch {
        await apiPatch(`/roles/permissions/${permissionId}`, {
          resource: editPermissionForm.resource.trim(),
          action: editPermissionForm.action.trim(),
          description: editPermissionForm.description.trim() || undefined,
        });
      }
      showToast.success("Permission updated!");
      cancelEditPermission();
      await fetchRolesAndPermissions();
    } catch (e: any) {
      showToast.error(e.message || "Failed to update permission");
    }
  };

  const deletePermission = async (p: Permission) => {
    if (!canAdmin) {
      showToast.error("Admin only can delete permissions.");
      return;
    }
    if (!confirm(`Delete permission "${p.resource}:${p.action}"?`)) return;
    try {
      await apiDelete(`/roles/permissions/${p.id}`);
      showToast.success("Permission deleted!");
      if (editingPermissionId === p.id) cancelEditPermission();
      await fetchRolesAndPermissions();
    } catch (e: any) {
      showToast.error(e.message || "Failed to delete permission");
    }
  };

  const createRole = async () => {
    if (!canAdmin) {
      showToast.error("Admin only can create roles.");
      return;
    }
    if (!createRoleForm.name.trim()) {
      showToast.error("Role name is required");
      return;
    }
    try {
      await apiPost("/roles", {
        name: createRoleForm.name.trim(),
        description: createRoleForm.description.trim(),
        permissionIds: createRoleForm.permissionIds,
      });
      showToast.success("Role created!");
      setShowCreateRole(false);
      setCreateRoleForm({ name: "", description: "", permissionIds: [] });
      await fetchRolesAndPermissions();
    } catch (e: any) {
      showToast.error(e.message || "Failed to create role");
    }
  };

  const deleteRole = async (role: Role) => {
    if (!canAdmin) {
      showToast.error("Admin only can delete roles.");
      return;
    }
    if (role.isSystem) {
      showToast.error("System roles can't be deleted.");
      return;
    }
    if (!confirm(`Delete role "${role.name}"?`)) return;
    try {
      await apiDelete(`/roles/${role.id}`);
      showToast.success("Role deleted!");
      if (selectedRoleId === role.id) setSelectedRoleId(null);
      await fetchRolesAndPermissions();
    } catch (e: any) {
      showToast.error(e.message || "Failed to delete role");
    }
  };

  const userColumns: Column<User>[] = [
    {
      key: "name",
      header: "User",
      render: (u) => (
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 truncate">{u.name}</div>
          <div className="text-xs text-gray-500 truncate">{u.email}</div>
        </div>
      ),
    },
    { key: "role", header: "Role", render: (u) => <span className="uppercase text-xs">{u.role}</span> },
    {
      key: "actions",
      header: "Assign",
      render: (u) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={selectedUserId === u.id ? "default" : "outline"}
            onClick={() => setSelectedUserId(u.id)}
            className={selectedUserId === u.id ? "bg-[#5260ce] hover:bg-[#4350b0]" : ""}
          >
            Select
          </Button>
        </div>
      ),
    },
  ];

  const roleColumns: Column<Role>[] = [
    {
      key: "name",
      header: "Role",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#5260ce]" />
          <span className="font-semibold text-gray-900">{r.name}</span>
          {r.isSystem && <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600">system</span>}
        </div>
      ),
    },
    { key: "userCount", header: "Users", render: (r) => <span className="text-sm text-gray-700">{r.userCount}</span> },
    {
      key: "actions",
      header: "Edit",
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant={selectedRoleId === r.id ? "default" : "outline"}
            onClick={() => setSelectedRoleId(r.id)}
            className={selectedRoleId === r.id ? "bg-[#5260ce] hover:bg-[#4350b0]" : ""}
          >
            Select
          </Button>
          {canAdmin && !r.isSystem && (
            <Button size="sm" variant="outline" onClick={() => deleteRole(r)} title="Delete role">
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const permissionColumns: Column<Permission>[] = [
    {
      key: "resource",
      header: "Resource",
      render: (p) =>
        editingPermissionId === p.id && editPermissionForm ? (
          <input
            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
            value={editPermissionForm.resource}
            onChange={(e) => setEditPermissionForm({ ...editPermissionForm, resource: e.target.value })}
          />
        ) : (
          <span className="font-semibold text-gray-900">{p.resource}</span>
        ),
    },
    {
      key: "action",
      header: "Action",
      render: (p) =>
        editingPermissionId === p.id && editPermissionForm ? (
          <input
            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
            value={editPermissionForm.action}
            onChange={(e) => setEditPermissionForm({ ...editPermissionForm, action: e.target.value })}
          />
        ) : (
          <span className="font-mono text-xs text-gray-800">{p.action}</span>
        ),
    },
    {
      key: "description",
      header: "Description",
      render: (p) =>
        editingPermissionId === p.id && editPermissionForm ? (
          <input
            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
            value={editPermissionForm.description}
            onChange={(e) => setEditPermissionForm({ ...editPermissionForm, description: e.target.value })}
          />
        ) : (
          <span className="text-sm text-gray-600">{p.description || "-"}</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (p) => {
        if (!canAdmin) return null;
        const isEditing = editingPermissionId === p.id && !!editPermissionForm;
        return (
          <div className="flex items-center justify-end gap-2">
            {isEditing ? (
              <>
                <Button size="sm" className="bg-[#5260ce] hover:bg-[#4350b0]" onClick={() => savePermission(p.id)}>
                  <Save className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEditPermission}>
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => startEditPermission(p)}>
                  {t("accessControlEdit")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => deletePermission(p)} title="Delete permission">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64">{t("authPageLoading")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-montserrat-bold text-[#121c67]">
            {t("accessControlTitle")}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {t("accessControlSubtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={refreshAll} disabled={usersLoading || rolesLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${usersLoading || rolesLoading ? "animate-spin" : ""}`} />
            {t("accessControlRefresh")}
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant={activePanel === "roles" ? "default" : "outline"}
              onClick={() => setActivePanel("roles")}
              className={activePanel === "roles" ? "bg-[#5260ce] hover:bg-[#4350b0]" : ""}
            >
              {t("accessControlRolesTab")}
            </Button>
            <Button
              variant={activePanel === "permissions" ? "default" : "outline"}
              onClick={async () => {
                setActivePanel("permissions");
                await fetchPermissionsOnly();
              }}
              className={activePanel === "permissions" ? "bg-[#5260ce] hover:bg-[#4350b0]" : ""}
            >
              {t("accessControlPermissionsTab")}
            </Button>
          </div>
          {!canAdmin && (
            <div className="text-xs text-gray-600 border border-gray-200 bg-gray-50 rounded px-3 py-2">
              {t("accessControlAdminOnly")}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#5260ce]" />
            <h2 className="text-lg font-montserrat-bold text-[#121c67]">{t("accessControlUsersSection")}</h2>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={usersQuery}
              onChange={(e) => setUsersQuery(e.target.value)}
              placeholder={t("accessControlSearchUsersPlaceholder")}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <DataTable
              data={filteredUsers}
              columns={userColumns}
              searchable={false}
              emptyMessage={t("accessControlNoUsersFound")}
              loading={usersLoading}
            />
          </div>

          <div className="border-t pt-3">
            <div className="text-sm font-semibold text-gray-800 mb-2">{t("accessControlAssignRoleTitle")}</div>
            {selectedUser ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">{selectedUser.name}</span>{" "}
                  <span className="text-gray-500">({selectedUser.email})</span>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={selectedUser.role}
                    onChange={(e) => assignRoleToUser(e.target.value as User["role"])}
                    disabled={!canAdmin}
                  >
                    <option value="admin">admin</option>
                    <option value="editor">editor</option>
                    <option value="user">user</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">{t("accessControlSelectUserHint")}</div>
            )}
          </div>
        </div>

        {/* Roles & Permissions */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#5260ce]" />
            <h2 className="text-lg font-montserrat-bold text-[#121c67]">
              {activePanel === "roles" ? t("accessControlRolesAndPermissions") : t("accessControlPermissionsTab")}
            </h2>
            <div className="ml-auto flex items-center gap-2">
              {canAdmin && activePanel === "roles" && (
                <Button size="sm" onClick={() => setShowCreateRole(true)} className="bg-[#5260ce] hover:bg-[#4350b0]">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("accessControlAddRole")}
                </Button>
              )}
              {canAdmin && activePanel === "permissions" && (
                <Button
                  size="sm"
                  onClick={() => setShowCreatePermission(true)}
                  className="bg-[#5260ce] hover:bg-[#4350b0]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("accessControlAddPermission")}
                </Button>
              )}
            </div>
          </div>

          {activePanel === "roles" ? (
            <>
              <input
                value={rolesQuery}
                onChange={(e) => setRolesQuery(e.target.value)}
                placeholder={t("accessControlSearchRolesPlaceholder")}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              />
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <DataTable
                  data={filteredRoles}
                  columns={roleColumns}
                  searchable={false}
                  emptyMessage={t("accessControlNoRolesFound")}
                  loading={rolesLoading}
                />
              </div>
            </>
          ) : (
            <DataTable
              data={permissions}
              columns={permissionColumns}
              searchable
              searchPlaceholder={t("accessControlSearchPermissionsPlaceholder")}
              searchKeys={["resource", "action", "description"]}
              emptyMessage={t("accessControlNoPermissionsFound")}
              loading={rolesLoading}
            />
          )}

          {activePanel === "roles" && (
            <div className="border-t pt-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm font-semibold text-gray-800">{t("accessControlEditRolePermissions")}</div>
              <div className="flex items-center gap-2">
                {selectedRole && (
                  <div className="text-xs text-gray-600 border border-gray-200 bg-gray-50 rounded px-2 py-1">
                    {rolePermCounts.selected}/{rolePermCounts.total}
                  </div>
                )}
                <Button
                  onClick={saveRolePermissions}
                  disabled={!canAdmin || !selectedRole}
                  className="bg-[#5260ce] hover:bg-[#4350b0]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {t("save")}
                </Button>
              </div>
            </div>

            {selectedRole ? (
              <div className="mt-3">
                <div className="text-sm text-gray-700 mb-2">
                  {t("accessControlSelectedRole")} <span className="font-semibold">{selectedRole.name}</span>
                </div>
                <div className="max-h-[420px] overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-3">
                  {Object.entries(permissionsByResource).map(([resource, perms]) => {
                    const expanded = expandedResources[resource] ?? true;
                    const allChecked = perms.every((p) => rolePermissionIdSet.has(p.id));
                    const someChecked = perms.some((p) => rolePermissionIdSet.has(p.id));
                    return (
                      <div key={resource} className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setExpandedResources((prev) => ({ ...prev, [resource]: !expanded }))}
                          className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-700 uppercase">{resource}</span>
                            {someChecked && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-600">
                                {perms.filter((p) => rolePermissionIdSet.has(p.id)).length}/{perms.length}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{expanded ? "−" : "+"}</span>
                        </button>

                        {expanded && (
                          <>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!canAdmin}
                                onClick={() => {
                                  setRolePermissionIds((prev) => {
                                    const set = new Set(prev);
                                    for (const p of perms) set.add(p.id);
                                    return Array.from(set);
                                  });
                                }}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Select all
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!canAdmin}
                                onClick={() => {
                                  setRolePermissionIds((prev) => prev.filter((id) => !perms.some((p) => p.id === id)));
                                }}
                              >
                                Clear
                              </Button>
                              {allChecked && (
                                <span className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1">
                                  All selected
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {perms.map((p) => {
                                const checked = rolePermissionIdSet.has(p.id);
                                return (
                                  <label
                                    key={p.id}
                                    className={`flex items-center gap-2 text-sm rounded-full border px-3 py-1.5 ${
                                      checked ? "border-indigo-300 bg-indigo-50 text-indigo-900" : "border-gray-200 bg-white text-gray-700"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      disabled={!canAdmin}
                                      onChange={(e) => {
                                        const nextChecked = e.target.checked;
                                        setRolePermissionIds((prev) => {
                                          if (nextChecked) return prev.includes(p.id) ? prev : [...prev, p.id];
                                          return prev.filter((x) => x !== p.id);
                                        });
                                      }}
                                      className="w-4 h-4 text-[#5260ce] border-gray-300 rounded focus:ring-[#5260ce]"
                                    />
                                    <span className="font-mono text-xs">{p.action}</span>
                                    {p.description && <span className="text-xs text-gray-500">{p.description}</span>}
                                  </label>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 mt-2">{t("accessControlSelectRoleHint")}</div>
            )}
          </div>
          )}
        </div>
      </div>

      {showCreatePermission && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-gray-200 shadow-xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-montserrat-bold text-[#121c67]">Create permission</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCreatePermission(false);
                  setCreatePermissionForm({ resource: "", action: "", description: "" });
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("accessControlResource")}</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={createPermissionForm.resource}
                  onChange={(e) => setCreatePermissionForm((p) => ({ ...p, resource: e.target.value }))}
                  placeholder="e.g. applications"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("accessControlAction")}</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={createPermissionForm.action}
                  onChange={(e) => setCreatePermissionForm((p) => ({ ...p, action: e.target.value }))}
                  placeholder="e.g. read"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t("accessControlDescription")}</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[80px]"
                  value={createPermissionForm.description}
                  onChange={(e) => setCreatePermissionForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Optional"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreatePermission(false);
                    setCreatePermissionForm({ resource: "", action: "", description: "" });
                  }}
                >
                  {t("accessControlCancel")}
                </Button>
                <Button onClick={createPermission} className="bg-[#5260ce] hover:bg-[#4350b0]">
                  <Save className="w-4 h-4 mr-2" />
                  {t("accessControlCreate")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateRole && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-gray-200 shadow-xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-montserrat-bold text-[#121c67]">Create role</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCreateRole(false);
                  setCreateRoleForm({ name: "", description: "", permissionIds: [] });
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={createRoleForm.name}
                  onChange={(e) => setCreateRoleForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Role name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[80px]"
                  value={createRoleForm.description}
                  onChange={(e) => setCreateRoleForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Optional"
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <div className="text-sm font-semibold text-gray-800 mb-2">Permissions</div>
                <div className="max-h-[260px] overflow-y-auto space-y-3 pr-1">
                  {Object.entries(permissionsByResource).map(([resource, perms]) => (
                    <div key={resource} className="space-y-2">
                      <div className="text-xs font-semibold text-gray-600 uppercase">{resource}</div>
                      <div className="flex flex-wrap gap-2">
                        {perms.map((perm) => {
                          const checked = createRoleForm.permissionIds.includes(perm.id);
                          return (
                            <label key={perm.id} className="flex items-center gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  const nextChecked = e.target.checked;
                                  setCreateRoleForm((prev) => ({
                                    ...prev,
                                    permissionIds: nextChecked
                                      ? prev.permissionIds.includes(perm.id)
                                        ? prev.permissionIds
                                        : [...prev.permissionIds, perm.id]
                                      : prev.permissionIds.filter((id) => id !== perm.id),
                                  }));
                                }}
                                className="w-4 h-4 text-[#5260ce] border-gray-300 rounded focus:ring-[#5260ce]"
                              />
                              <span className="font-mono text-xs">{perm.action}</span>
                              {perm.description && <span className="text-xs text-gray-500">{perm.description}</span>}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateRole(false);
                    setCreateRoleForm({ name: "", description: "", permissionIds: [] });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={createRole} className="bg-[#5260ce] hover:bg-[#4350b0]">
                  <Save className="w-4 h-4 mr-2" />
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

