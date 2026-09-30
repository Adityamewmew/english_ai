import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["student", "admin"]).default("student"),
  accessType: z.coerce.number().int().min(1).max(2).optional(),
  currentCefr: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).default("A1"),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().optional().or(z.literal("")),
  role: z.enum(["student", "admin"]).default("student"),
  accessType: z.coerce.number().int().min(1).max(2).optional(),
  currentCefr: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).default("A1"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
