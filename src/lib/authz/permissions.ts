import type { UserRole } from "@/lib/authz/roles";

const permissionMap = {
  managePeople: ["ADMIN"],
  manageOrg: ["ADMIN"],
  manageCycles: ["ADMIN"],
  viewReports: ["ADMIN"],
  viewTeam: ["ADMIN", "LEADER"],
  viewOwnDevelopment: ["ADMIN", "LEADER", "EMPLOYEE"],
} as const;

export type Permission = keyof typeof permissionMap;

export function can(role: UserRole, permission: Permission) {
  return (permissionMap[permission] as readonly UserRole[]).includes(role);
}
