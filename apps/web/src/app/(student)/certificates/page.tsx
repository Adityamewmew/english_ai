import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { StudentShell } from "@/features/dashboard";
import { CertificateStatusGrid } from "@/features/certificates";
import { isUserAdmin } from "@/lib/auth-utils";

export const metadata = {
  title: "CEFR Graduation Certificates | EDDY'S English AI",
  description: "Track your CEFR level completion and claim your official English proficiency certificate.",
};

export default async function CertificatesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <StudentShell
      studentName={session.name}
      currentCefr={session.currentCefr}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <CertificateStatusGrid
          userId={session.userId}
          userName={session.name}
          currentCefr={session.currentCefr}
          isAdmin={isUserAdmin(session)}
        />
      </div>
    </StudentShell>
  );
}
