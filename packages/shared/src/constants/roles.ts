export const ROLES = ["admin", "student"] as const;
export type Role = (typeof ROLES)[number];

export const ACCESS_TYPES = {
  ADMIN: 1,
  STUDENT: 2,
} as const;

export type AccessType = (typeof ACCESS_TYPES)[keyof typeof ACCESS_TYPES];

export const DEFAULT_ADMIN_EMAILS = [
  "mrkhoirul@gmail.com",
  "mrkhoriul@gmail.com",
  "purnamaaditya939@gmail.com",
  "admin@eddys.ai",
  "admin@eddy.ai",
] as const;

export interface CheckableUser {
  role?: string | null;
  accessType?: number | null;
  email?: string | null;
}

export function isUserAdmin(user?: CheckableUser | null): boolean {
  if (!user) return false;
  const emailLower = (user.email || "").toLowerCase().trim();
  const envAdminEmails =
    typeof process !== "undefined" && process.env?.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
      : [];

  return (
    user.role === "admin" ||
    user.accessType === 1 ||
    (DEFAULT_ADMIN_EMAILS as readonly string[]).includes(emailLower) ||
    envAdminEmails.includes(emailLower)
  );
}
