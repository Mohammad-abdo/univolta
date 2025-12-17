"use client";

import { useState, useEffect } from "react";
import { canAccess, getRolePermissions, type UserRole, type Resource, type Action } from "@/lib/permissions";
import { API_BASE_URL } from "@/lib/constants";

export default function PermissionsPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const roles: UserRole[] = ["admin", "editor", "user"];
  const resources: Resource[] = ["universities", "programs", "applications", "testimonials", "faqs", "users", "settings"];
  const actions: Action[] = ["create", "read", "update", "delete"];

  return (
    <div>
      <h1 className="text-3xl font-montserrat-bold text-[#121c67] mb-6">
        Roles & Permissions
      </h1>

      {/* Current User Info */}
      {userRole && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-montserrat-semibold text-[#121c67] mb-2">Your Current Role</h2>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-semibold">Role:</span>{" "}
            <span className="px-3 py-1 bg-[#5260ce] text-white rounded text-sm uppercase font-semibold">
              {userRole}
            </span>
          </p>
          <div className="mt-3">
            <p className="text-sm font-semibold text-gray-700 mb-2">Your Permissions:</p>
            <div className="flex flex-wrap gap-2">
              {getRolePermissions(userRole).map((permission) => (
                <span
                  key={permission}
                  className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Permissions Matrix */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-montserrat-semibold text-gray-700 uppercase">
                  Resource
                </th>
                {roles.map((role) => (
                  <th
                    key={role}
                    className={`px-6 py-3 text-center text-xs font-montserrat-semibold uppercase ${
                      role === userRole ? "bg-blue-100 text-blue-800" : "text-gray-700"
                    }`}
                  >
                    {role}
                    {role === userRole && " (You)"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resources.map((resource) => (
                <tr key={resource} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-montserrat-semibold text-sm text-gray-900 capitalize">
                      {resource}
                    </span>
                  </td>
                  {roles.map((role) => (
                    <td key={role} className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {actions.map((action) => {
                          const hasPermission = canAccess(role, resource, action);
                          return (
                            <span
                              key={action}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                hasPermission
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                              title={`${resource}:${action}`}
                            >
                              {action.charAt(0).toUpperCase()}
                            </span>
                          );
                        })}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-center">
                        {actions.filter((action) => canAccess(role, resource, action)).length}/
                        {actions.length}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-montserrat-semibold text-sm text-gray-700 mb-2">Legend:</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">C</span>
            <span className="text-gray-600">Create</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">R</span>
            <span className="text-gray-600">Read</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">U</span>
            <span className="text-gray-600">Update</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">D</span>
            <span className="text-gray-600">Delete</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-gray-100 text-gray-400 rounded">-</span>
            <span className="text-gray-600">No Permission</span>
          </div>
        </div>
      </div>

      {/* Role Descriptions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-montserrat-semibold text-lg text-red-700 mb-2">Admin</h3>
          <p className="text-sm text-gray-600">
            Full access to all resources. Can manage users, settings, and all content.
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-montserrat-semibold text-lg text-blue-700 mb-2">Editor</h3>
          <p className="text-sm text-gray-600">
            Can create and update content (universities, programs, testimonials, FAQs). Cannot delete universities/programs or manage users.
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-montserrat-semibold text-lg text-gray-700 mb-2">User</h3>
          <p className="text-sm text-gray-600">
            Limited access. Can read content and create applications/testimonials. Cannot access dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}





