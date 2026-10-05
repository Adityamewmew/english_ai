import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { StudentDashboardView } from "@/features/dashboard";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return <StudentDashboardView session={session} />;
}
