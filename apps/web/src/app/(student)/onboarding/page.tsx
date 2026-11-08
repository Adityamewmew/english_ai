import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { isUserAdmin } from "@english-ai/shared";
import { OnboardingWizardView } from "@/features/onboarding";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Admins never need student onboarding
  if (isUserAdmin(session) || session.role === "admin") {
    redirect("/dashboard");
  }

  // Server-side guard: ensure existing students are not trapped in onboarding
  let targetRedirect: string | null = null;
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

    // 1. Check if placement test is already taken
    const placementRes = await fetch(`${apiUrl}/api/placement/latest/${session.userId}`, {
      headers,
      cache: "no-store",
    });

    if (placementRes.ok) {
      const placementJson = await placementRes.json();
      if (placementJson?.data) {
        targetRedirect = "/dashboard";
      }
    }

    // 2. If no placement, check if onboarding profile is already completed
    if (!targetRedirect) {
      const userRes = await fetch(`${apiUrl}/api/user/${session.userId}`, {
        headers,
        cache: "no-store",
      });

      if (userRes.ok) {
        const userJson = await userRes.json();
        if (userJson?.data?.memory?.onboardingCompleted) {
          targetRedirect = "/placement";
        }
      }
    }
  } catch {
    // Graceful fallback: render wizard if internal check encounters an issue
  }

  if (targetRedirect) {
    redirect(targetRedirect);
  }

  return <OnboardingWizardView session={session} />;
}

