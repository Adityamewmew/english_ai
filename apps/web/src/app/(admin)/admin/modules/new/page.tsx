import React from "react";
import { ModuleEditorForm } from "@/components/admin/ModuleEditorForm";

export const metadata = {
  title: "Buat Modul Baru | Admin EDDY'S AI",
};

export default function NewModulePage() {
  return (
    <div className="max-w-5xl mx-auto py-2">
      <ModuleEditorForm isEdit={false} />
    </div>
  );
}
