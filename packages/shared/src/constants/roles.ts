export const ROLES = ["admin", "student"] as const;
export type Role = (typeof ROLES)[number];

export const ACCESS_TYPES = {
  ADMIN: 1,
  STUDENT: 2,
} as const;

export type AccessType = (typeof ACCESS_TYPES)[keyof typeof ACCESS_TYPES];
