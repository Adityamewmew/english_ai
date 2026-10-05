import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { CurriculumRoadmapView } from "@/features/curriculum";

export default async function ModulesRoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { level } = await searchParams;
  return <CurriculumRoadmapView session={session} requestedLevel={level} />;
}
