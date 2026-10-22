import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { StudentShell } from "@/features/dashboard";
import { CertificateStatusGrid } from "@/features/certificates";

export const metadata = {
  title: "Sertifikat Kelulusan Level CEFR | EDDY'S English AI",
  description: "Lihat status kelulusan level CEFR dan klaim sertifikat resmi bahasa Inggris Anda.",
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
        />
      </div>
    </StudentShell>
  );
}
