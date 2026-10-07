import React from "react";
import { notFound } from "next/navigation";
import { ModuleEditorForm } from "@/components/admin/ModuleEditorForm";

interface EditModulePageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Modul | Admin EDDY'S AI",
};

export default async function EditModulePage({ params }: EditModulePageProps) {
  const { id } = await params;
  const apiUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || `http://localhost:${process.env.PORT_API || "3003"}`).replace(/\/+$/, "");

  try {
    const res = await fetch(`${apiUrl}/api/curriculum/modules/${id}`, {
      cache: "no-store",
    });
    const json = await res.json();

    if (!json.success || !json.data?.module) {
      notFound();
    }

    return (
      <div className="max-w-5xl mx-auto py-2">
        <ModuleEditorForm initialData={json.data} isEdit={true} />
      </div>
    );
  } catch (err) {
    console.error("Gagal memuat modul untuk diedit:", err);
    notFound();
  }
}
