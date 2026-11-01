"use server";

import { authApi } from "@/features/auth/api/auth.api";
import { setSession, clearSession } from "@/lib/session";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { isUserAdmin } from "@english-ai/shared";
import { redirect } from "next/navigation";

export async function doLogin(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Validasi gagal" };
  }

  let redirectPath: string | null = null;
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

    redirectPath = "/dashboard";
  } catch (err: any) {
    return { success: false, message: err.message || "Email atau password salah." };
  }

  if (redirectPath) {
    redirect(redirectPath);
  }
}

export async function doRegister(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Validasi gagal" };
  }

  let redirectPath: string | null = null;
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

    redirectPath = "/placement";
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal mendaftar." };
  }

  if (redirectPath) {
    redirect(redirectPath);
  }
}

export async function doLogout() {
  await clearSession();
  redirect("/login");
}

export async function syncGoogleSession(userData: {
  id: string;
  name: string;
  email: string;
  role?: string;
  accessType?: number;
  currentCefr?: string;
}) {
  const isAdmin = isUserAdmin(userData);

  const role = isAdmin ? "admin" : userData.role || "student";
  const accessType = isAdmin ? 1 : (userData.accessType ?? (role === "admin" ? 1 : 2));
  const currentCefr = userData.currentCefr || "A1";

  await setSession({
    userId: userData.id,
    name: userData.name || userData.email.split("@")[0],
    email: userData.email,
    role,
    accessType,
    currentCefr,
  });

  return { success: true, role, accessType };
}

export async function processGoogleCallbackAction(userData: {
  id: string;
  name: string;
  email: string;
  role?: string;
  accessType?: number;
  currentCefr?: string;
}) {
  const isAdmin = isUserAdmin(userData);
  const role = isAdmin ? "admin" : userData.role || "student";
  const accessType = isAdmin ? 1 : (userData.accessType ?? (role === "admin" ? 1 : 2));
  const currentCefr = userData.currentCefr || "A1";

  await setSession({
    userId: userData.id,
    name: userData.name || userData.email.split("@")[0],
    email: userData.email,
    role,
    accessType,
    currentCefr,
  });

  let targetPath = "/dashboard";
  if (!isAdmin) {
    try {
      const internalUrl =
        process.env.INTERNAL_API_URL ||
        process.env.API_URL ||
        `http://127.0.0.1:${process.env.PORT_API || "3003"}`;
      const apiUrl = (internalUrl.includes("eddys.drimland.my.id") || internalUrl.startsWith("https://"))
        ? `http://127.0.0.1:${process.env.PORT_API || "3003"}`
        : internalUrl.replace(/\/$/, "");

      const res = await fetch(`${apiUrl}/api/placement/latest/${userData.id}`, {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        if (!json.data) {
          targetPath = "/placement";
        }
      } else {
        targetPath = "/placement";
      }
    } catch {
      targetPath = "/placement";
    }
  }

  return { success: true, targetPath, role };
}
