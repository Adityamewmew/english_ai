"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ModuleListTable } from "./ModuleListTable";
import { ModuleDetailModal } from "./ModuleDetailModal";
import { AdminModuleListItem } from "@/services/admin-curriculum.service";
import { Filter, Plus, Search, CheckCircle2, AlertCircle } from "lucide-react";

interface AdminModulesClientProps {
  initialModules: AdminModuleListItem[];
}

const cefrTabs = ["all", "A1", "A2", "B1", "B2", "C1", "C2"];

export function AdminModulesClient({ initialModules }: AdminModulesClientProps) {
  const [modules, setModules] = useState<AdminModuleListItem[]>(initialModules);
  const [selectedCefr, setSelectedCefr] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [selectedModuleData, setSelectedModuleData] = useState<{
    module: any;
    sections: any[];
  } | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filter by CEFR & Search
  const filtered = modules.filter((m) => {
    const matchesCefr = selectedCefr === "all" || m.cefr === selectedCefr;
    const matchesSearch =
      !searchQuery.trim() ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.objective.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCefr && matchesSearch;
  });

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

  const handleDeleteModule = async (moduleId: string, title: string) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus modul "${title}" (${moduleId})?\n\nModul akan disembunyikan (soft-delete) dari katalog kurikulum siswa.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/curriculum/admin/modules/${moduleId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Gagal menghapus modul");
      }

      setModules((prev) => prev.filter((m) => m.id !== moduleId));
      setNotice({
        type: "success",
        message: `Modul "${title}" (${moduleId}) berhasil dihapus.`,
      });
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      setNotice({
        type: "error",
        message: err.message || "Terjadi kesalahan saat menghapus modul",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      {notice && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
            notice.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {/* Control Bar: Search, Filters & Create Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari ID modul, judul, atau materi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* CEFR Level Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <div className="flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Level:</span>
          </div>
          {cefrTabs.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCefr(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCefr === c
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {c === "all" ? "Semua" : c}
            </button>
          ))}
        </div>

        {/* Create Module Button */}
        <div>
          <Link
            href="/admin/modules/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Modul Baru</span>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-slate-500">
          Menampilkan {filtered.length} dari total {modules.length} modul kurikulum
        </span>
      </div>

      {/* Modules Table */}
      <ModuleListTable
        modules={filtered}
        onSelectModule={handleOpenDetail}
        onDeleteModule={handleDeleteModule}
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
