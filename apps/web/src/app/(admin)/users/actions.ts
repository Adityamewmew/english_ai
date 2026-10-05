"use server";

import { usersApi } from "@/features/users/api/users.api";
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

  try {
    const user = await usersApi.register(parsed.data);
    revalidatePath("/users");
    return { success: true, message: "Pengguna berhasil ditambahkan", data: user };
  } catch (err: any) {
    return { success: false, message: err?.message || "Gagal membuat pengguna" };
  }
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

  try {
    const payload: any = { ...parsed.data };
    if (!payload.password || payload.password.trim() === "") {
      delete payload.password;
    }
    const user = await usersApi.updateProfile(id, payload, guard.session.userId);
    revalidatePath("/users");
    return { success: true, message: "Data pengguna berhasil diperbarui", data: user };
  } catch (err: any) {
    return { success: false, message: err?.message || "Gagal memperbarui pengguna" };
  }
}

export async function deleteUser(id: string) {
  const guard = await requireRole(["admin"]);
  if (!guard.success) {
    return { success: false, message: guard.message };
  }

  if (guard.session.userId === id) {
    return { success: false, message: "Tidak dapat menghapus akun admin yang sedang aktif" };
  }

  try {
    await usersApi.deleteUser(id, guard.session.userId);
    revalidatePath("/users");
    return { success: true, message: "Pengguna berhasil dihapus" };
  } catch (err: any) {
    return { success: false, message: err?.message || "Gagal menghapus pengguna" };
  }
}
