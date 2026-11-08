import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { OnboardingWizardView } from "@/features/onboarding";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return <OnboardingWizardView session={session} />;
}

