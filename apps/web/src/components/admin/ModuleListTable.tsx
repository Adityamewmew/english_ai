"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Award, Clock, Layers, ArrowUpRight, Eye, Edit2, Trash2 } from "lucide-react";
import { AdminModuleListItem } from "@/features/admin";

interface ModuleListTableProps {
  modules: AdminModuleListItem[];
  onSelectModule?: (moduleId: string) => void;
  onDeleteModule?: (moduleId: string, title: string) => void;
}

export function ModuleListTable({ modules, onSelectModule, onDeleteModule }: ModuleListTableProps) {
  if (modules.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-slate-800 dark:text-white">Tidak Ada Modul Ditemukan</h4>
        <p className="text-xs text-slate-500 mt-1">Sesuaikan filter level CEFR di atas.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">ID & Level</th>
              <th className="py-3 px-4">Judul Modul</th>
              <th className="py-3 px-4">Kategori & Tujuan</th>
              <th className="py-3 px-4">Struktur</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {modules.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {m.id}
                    </span>
                    <Badge variant="outline" size="sm" className="font-bold">
                      {m.cefr}
                    </Badge>
                  </div>
                  {m.isExam && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-1">
                      <Award className="w-3 h-3" />
                      Ujian Kelulusan
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white max-w-xs">
                  <div>{m.title}</div>
                  <div className="text-[11px] font-normal text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {m.estimatedMinutes} menit
                    </span>
                    <span>•</span>
                    <span className="capitalize">{m.complexity}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 max-w-sm">
                  <span className="inline-block px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold text-[10px] mb-1">
                    {m.group}
                  </span>
                  <p className="text-slate-500 line-clamp-2 text-[11px]">
                    {m.objective}
                  </p>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>{m.sectionsCount} Bagian Materi</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap text-right">
                  <div className="inline-flex items-center gap-2">
                    {onSelectModule && (
                      <button
                        type="button"
                        onClick={() => onSelectModule(m.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
                        title="Lihat Pratinjau Materi"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>
                    )}

                    <Link
                      href={`/admin/modules/${m.id}/edit`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold transition-all"
                      title="Edit Modul Ini"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>

                    {onDeleteModule && (
                      <button
                        type="button"
                        onClick={() => onDeleteModule(m.id, m.title)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-all"
                        title="Hapus Modul (Soft Delete)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}

                    <Link
                      href={`/modules/${m.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-all"
                      title="Buka Sebagai Siswa"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
