export type UserRole = "admin" | "staff";

export const USER_ROLES: UserRole[] = ["admin", "staff"];

export const USER_ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  staff: "Staff",
};
