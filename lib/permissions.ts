// Frontend permissions utility matching backend permissions

export type Resource = 
  | "universities"
  | "programs"
  | "applications"
  | "testimonials"
  | "faqs"
  | "users"
  | "settings";

export type Action = "create" | "read" | "update" | "delete";

export type UserRole = "admin" | "editor" | "user" | "university";

export type Permission = `${Resource}:${Action}`;

// Define permissions for each role (matching backend)
export const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    "universities:create",
    "universities:read",
    "universities:update",
    "universities:delete",
    "programs:create",
    "programs:read",
    "programs:update",
    "programs:delete",
    "applications:create",
    "applications:read",
    "applications:update",
    "applications:delete",
    "testimonials:create",
    "testimonials:read",
    "testimonials:update",
    "testimonials:delete",
    "faqs:create",
    "faqs:read",
    "faqs:update",
    "faqs:delete",
    "users:create",
    "users:read",
    "users:update",
    "users:delete",
    "settings:create",
    "settings:read",
    "settings:update",
    "settings:delete",
  ],
  editor: [
    "universities:create",
    "universities:read",
    "universities:update",
    "programs:create",
    "programs:read",
    "programs:update",
    "applications:read",
    "applications:update",
    "testimonials:create",
    "testimonials:read",
    "testimonials:update",
    "testimonials:delete",
    "faqs:create",
    "faqs:read",
    "faqs:update",
    "faqs:delete",
  ],
  user: [
    "universities:read",
    "programs:read",
    "applications:create",
    "applications:read",
    "testimonials:create",
    "testimonials:read",
    "faqs:read",
  ],
  university: [
    "universities:read",
    "universities:update", // Can update their own university
    "programs:create",
    "programs:read",
    "programs:update",
    "programs:delete", // Can manage their own programs
    "applications:read",
    "applications:update", // Can manage applications for their university
    "testimonials:read",
    "faqs:read",
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has permission for a resource and action
 */
export function canAccess(role: UserRole, resource: Resource, action: Action): boolean {
  const permission: Permission = `${resource}:${action}`;
  return hasPermission(role, permission);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] ?? [];
}

/**
 * Check if user can access dashboard (admin, editor, or university)
 */
export function canAccessDashboard(role: UserRole): boolean {
  return role === "admin" || role === "editor" || role === "university";
}



