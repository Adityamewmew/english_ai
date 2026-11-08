"use server";

import { authApi } from "@/features/auth/api/auth.api";
import { setSession, clearSession } from "@/lib/session";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { isUserAdmin } from "@english-ai/shared";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

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

    const isStudent = user.role !== "admin" && accessType === 2;
    if (isStudent) {
      const userMemory = (user as any)?.memory;
      const userCefr = user.currentCefr;
      if (!userMemory?.onboardingCompleted && (!userCefr || userCefr === "A1")) {
        redirectPath = "/onboarding";
      } else {
        redirectPath = "/dashboard";
      }
    } else {
      redirectPath = "/dashboard";
    }
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

    redirectPath = "/onboarding";
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
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.toString();

      const internalUrl =
        process.env.INTERNAL_API_URL ||
        process.env.API_URL ||
        `http://127.0.0.1:${process.env.PORT_API || "3003"}`;
      const apiUrl = (internalUrl.includes("eddys.drimland.my.id") || internalUrl.startsWith("https://"))
        ? `http://127.0.0.1:${process.env.PORT_API || "3003"}`
        : internalUrl.replace(/\/$/, "");

      const headers = {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      };

      // 1. Fetch user profile from API to inspect persistent memory and currentCefr
      let userMemory: any = null;
      let userCefr = currentCefr;

      const userRes = await fetch(`${apiUrl}/api/user/${userData.id}`, {
        headers,
        cache: "no-store",
      });

      if (userRes.ok) {
        const userJson = await userRes.json();
        userMemory = userJson?.data?.memory;
        if (userJson?.data?.currentCefr) {
          userCefr = userJson.data.currentCefr;
        }
      }

      // 2. Fetch latest placement result
      let hasPlacement = false;
      const placementRes = await fetch(`${apiUrl}/api/placement/latest/${userData.id}`, {
        headers,
        cache: "no-store",
      });

      if (placementRes.ok) {
        const placementJson = await placementRes.json();
        hasPlacement = !!placementJson?.data;
      }

      // Decision matrix:
      // A. If placement result exists OR CEFR is already advanced beyond default A1 -> /dashboard
      if (hasPlacement || (userCefr && userCefr !== "A1")) {
        targetPath = "/dashboard";
      } else if (userMemory?.onboardingCompleted) {
        // B. Onboarding complete, waiting for placement test -> /placement
        targetPath = "/placement";
      } else {
        // C. Truly fresh student who hasn't completed onboarding -> /onboarding
        targetPath = "/onboarding";
      }
    } catch {
      // Default to /dashboard rather than trapping an authenticated student
      targetPath = "/dashboard";
    }
  }

  return { success: true, targetPath, role };
}
