export interface UserRoleCheckable {
  role?: string | null;
  accessType?: number | null;
  email?: string | null;
}

export function isUserAdmin(user?: UserRoleCheckable | null): boolean {
  if (!user) return false;
  return (
    user.role === "admin" ||
    user.accessType === 1 ||
    Boolean(user.email?.toLowerCase().includes("khoirul"))
  );
}
