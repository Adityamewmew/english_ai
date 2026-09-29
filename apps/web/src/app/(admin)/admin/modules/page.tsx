import React from "react";
import { adminCurriculumService } from "@/services/admin-curriculum.service";
import { AdminModulesClient } from "@/components/admin/AdminModulesClient";

export const metadata = {
  title: "Katalog Seluruh Modul Kurikulum | Admin EDDY'S AI",
};

export default async function AdminModulesPage() {
  const result = await adminCurriculumService.getAllModules();
  const modules = result.success && result.data ? result.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Katalog Seluruh Modul Kurikulum
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Jelajahi dan inspeksi modul pembelajaran di semua tingkatan level (A1 sampai C2) beserta struktur materi lengkapnya.
        </p>
      </div>

      <AdminModulesClient initialModules={modules} />
    </div>
  );
}
