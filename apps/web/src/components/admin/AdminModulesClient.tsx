"use client";

import React, { useState } from "react";
import { ModuleListTable } from "./ModuleListTable";
import { ModuleDetailModal } from "./ModuleDetailModal";
import { AdminModuleListItem } from "@/services/admin-curriculum.service";
import { Filter, Layers } from "lucide-react";

interface AdminModulesClientProps {
  initialModules: AdminModuleListItem[];
}

const cefrTabs = ["all", "A1", "A2", "B1", "B2", "C1", "C2"];

export function AdminModulesClient({ initialModules }: AdminModulesClientProps) {
  const [selectedCefr, setSelectedCefr] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [selectedModuleData, setSelectedModuleData] = useState<{
    module: any;
    sections: any[];
  } | null>(null);

  const filtered =
    selectedCefr === "all"
      ? initialModules
      : initialModules.filter((m) => m.cefr === selectedCefr);

  const handleOpenDetail = async (moduleId: string) => {
    try {
      setLoadingModal(true);
      const res = await fetch(`/api/curriculum/modules/${moduleId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedModuleData({
          module: json.data.module,
          sections: json.data.sections || [],
        });
        setModalOpen(true);
      }
    } catch (err) {
      console.error("Gagal memuat detail modul:", err);
    } finally {
      setLoadingModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters & Count Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Filter Tingkat Level CEFR:
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {cefrTabs.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCefr(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCefr === c
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {c === "all" ? "Semua Level" : `Level ${c}`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-slate-500">
          Menampilkan {filtered.length} modul kurikulum
        </span>
      </div>

      {/* Modules Table */}
      <ModuleListTable
        modules={filtered}
        onSelectModule={handleOpenDetail}
      />

      {/* Modal Detail */}
      <ModuleDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={selectedModuleData}
      />
    </div>
  );
}
