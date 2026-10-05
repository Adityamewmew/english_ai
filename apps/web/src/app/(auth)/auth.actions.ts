"use server";

import { authApi } from "@/features/auth/api/auth.api";
import { setSession, clearSession } from "@/lib/session";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { redirect } from "next/navigation";

export async function doLogin(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Validasi gagal" };
  }

  try {
    const user = await authApi.login(parsed.data);
    if (!user) {
      return { success: false, message: "Email atau password salah." };
    }

    const accessType = user.accessType ?? (user.role === "admin" ? 1 : 2);
    await setSession({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessType,
      currentCefr: user.currentCefr,
    });

    if (accessType === 1 || user.role === "admin") {
      redirect("/users");
    } else {
      redirect("/dashboard");
    }
  } catch (err: any) {
    return { success: false, message: err.message || "Email atau password salah." };
  }
}

export async function doRegister(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Validasi gagal" };
  }

  try {
    const user = await authApi.register(parsed.data);
    if (!user) {
      return { success: false, message: "Gagal mendaftar." };
    }

    await setSession({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: "student",
      accessType: 2,
      currentCefr: "A1",
    });

    redirect("/dashboard");
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal mendaftar." };
  }
}

export async function doLogout() {
  await clearSession();
  redirect("/login");
}
