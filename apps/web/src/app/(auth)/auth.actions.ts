"use server";

import { userService } from "@/services/user.service";
import { setSession, clearSession } from "@/lib/session";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { redirect } from "next/navigation";

export async function doLogin(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Validasi gagal" };
  }

  const result = await userService.authenticate(parsed.data);
  if (!result.success || !result.data) {
    return { success: false, message: result.message || "Email atau password salah." };
  }

  const user = result.data;
  await setSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    currentCefr: user.currentCefr,
  });

  if (user.role === "admin") {
    redirect("/users");
  } else {
    redirect("/dashboard");
  }
}

export async function doRegister(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Validasi gagal" };
  }

  const result = await userService.create(parsed.data);
  if (!result.success || !result.data) {
    return { success: false, message: result.message || "Gagal mendaftar." };
  }

  const user = result.data;
  await setSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: "student",
    currentCefr: "A1",
  });

  redirect("/dashboard");
}

export async function doLogout() {
  await clearSession();
  redirect("/login");
}
