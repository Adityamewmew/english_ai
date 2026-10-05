import React from "react";
import { adminApi } from "@/features/admin";
import { AdminModulesClient } from "@/components/admin/AdminModulesClient";

export const metadata = {
  title: "Katalog Seluruh Modul Kurikulum | Admin EDDY'S AI",
};

export default async function AdminModulesPage() {
  let modules: any[] = [];
  try {
    modules = await adminApi.getAllModules();
  } catch (e) {
    console.error("Gagal mengambil modul kurikulum admin via API:", e);
  }

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
