import { apiGet } from "@/lib/api";
import { type UserRole } from "@/lib/permissions";

export type PermissionTuple = { resource: string; action: string };

export type MeAuthz = {
  id: string;
  name: string | null;
  email: string;
  phone?: string | null;
  role: UserRole;
  universityId?: string | null;
  effectiveRole?: { id: string; name: string; isSystem: boolean } | null;
  permissions: PermissionTuple[];
};

function key(resource: string, action: string) {
  return `${resource}:${action}`;
}

export async function fetchMeAuthz(): Promise<MeAuthz> {
  return apiGet<MeAuthz>("/users/me");
}

export function buildCan(permissions: PermissionTuple[]) {
  const set = new Set(permissions.map((p) => key(p.resource, p.action)));
  return (resource: string, action: string) => set.has(key(resource, action));
}

