"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { QuestionListTable } from "./QuestionListTable";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

interface AdminQuestionsClientProps {
  initialData: {
    list: any[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
  currentCefr: string;
  currentSkill: string;
  currentKeywords: string;
}

const cefrOptions = ["all", "A1", "A2", "B1", "B2", "C1", "C2"];
const skillOptions = ["all", "grammar", "listening", "reading", "writing", "speaking"];

export function AdminQuestionsClient({
  initialData,
  currentCefr,
  currentSkill,
  currentKeywords,
}: AdminQuestionsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [keywords, setKeywords] = useState(currentKeywords);

  const applyFilters = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    Object.entries(newParams).forEach(([k, v]) => {
      if (!v || v === "all") {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    });
    // Reset to page 1 on filter change
    if (!newParams.page) {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ keywords });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Cari ID soal, pertanyaan, atau kunci jawaban..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
          >
            Cari
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* CEFR filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="font-bold text-slate-500 text-[11px] whitespace-nowrap">
              Level:
            </span>
            {cefrOptions.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => applyFilters({ cefr: lvl })}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  currentCefr === lvl
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {lvl === "all" ? "Semua" : lvl}
              </button>
            ))}
          </div>

          {/* Skill filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="font-bold text-slate-500 text-[11px] whitespace-nowrap">
              Skill:
            </span>
            {skillOptions.map((sk) => (
              <button
                key={sk}
                type="button"
                onClick={() => applyFilters({ skill: sk })}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] capitalize transition-all ${
                  currentSkill === sk
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {sk === "all" ? "Semua Skill" : sk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Count & Pagination Controls */}
      <div className="flex items-center justify-between px-1 text-xs">
        <span className="font-semibold text-slate-500">
          Menemukan <strong>{initialData.total}</strong> soal resmi (Halaman {initialData.page} dari {initialData.totalPages || 1})
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={initialData.page <= 1}
            onClick={() => applyFilters({ page: String(initialData.page - 1) })}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={initialData.page >= initialData.totalPages}
            onClick={() => applyFilters({ page: String(initialData.page + 1) })}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Halaman Selanjutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <QuestionListTable questions={initialData.list} />
    </div>
  );
}
