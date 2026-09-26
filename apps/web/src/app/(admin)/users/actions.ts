"use server";

import { userService } from "@/services/user.service";
import { requireRole } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user";

export async function createUser(formData: FormData) {
  const guard = await requireRole(["admin"]);
  if (!guard.success) {
    return { success: false, message: guard.message };
  }

  const raw = Object.fromEntries(formData);
  const parsed = createUserSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Validasi gagal" };
  }

  const result = await userService.create(parsed.data, guard.session.userId);

  if (result.success) {
    revalidatePath("/users");
  }

  return result;
}

export async function updateUser(id: string, formData: FormData) {
  const guard = await requireRole(["admin"]);
  if (!guard.success) {
    return { success: false, message: guard.message };
  }

  const raw = Object.fromEntries(formData);
  const parsed = updateUserSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Validasi gagal" };
  }

  const result = await userService.update(id, parsed.data, guard.session.userId);

  if (result.success) {
    revalidatePath("/users");
  }

  return result;
}

export async function deleteUser(id: string) {
  const guard = await requireRole(["admin"]);
  if (!guard.success) {
    return { success: false, message: guard.message };
  }

  if (guard.session.userId === id) {
    return { success: false, message: "Tidak dapat menghapus akun admin yang sedang aktif" };
  }

  const result = await userService.delete(id, guard.session.userId);

  if (result.success) {
    revalidatePath("/users");
  }

  return result;
}
