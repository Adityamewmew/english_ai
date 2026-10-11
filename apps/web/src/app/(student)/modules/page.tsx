import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ModulesCatalogView } from "@/features/curriculum";

export default async function ModulesCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { level } = await searchParams;
  return <ModulesCatalogView session={session} initialLevel={level || "all"} />;
}
