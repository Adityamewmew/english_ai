"use client";

import React, { useMemo } from "react";
import { Search, ChevronDown } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import { CEFR_CATEGORIES } from "../constants/cefr-categories";

interface ModulesFilterBarProps {
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  selectedSubLevel: string;
  onSelectSubLevel: (subId: string) => void;
  currentCefr?: string;
  subLevelCounts: Record<string, number>;
  statusFilter: string;
  onSelectStatus: (status: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function ModulesFilterBar({
  selectedCategory,
  onSelectCategory,
  selectedSubLevel,
  onSelectSubLevel,
  currentCefr,
  subLevelCounts,
  statusFilter,
  onSelectStatus,
  searchQuery,
  onSearchChange,
}: ModulesFilterBarProps) {
  // Active Category Object
  const activeCategoryObj = useMemo(() => {
    return (
      CEFR_CATEGORIES.find(
        (c) => c.id.toUpperCase() === selectedCategory.toUpperCase()
      ) || CEFR_CATEGORIES[0]
    );
  }, [selectedCategory]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3 sm:p-3.5 rounded-2xl shadow-2xs space-y-2.5">
      {/* Baris 1: Category Tabs (Horizontal Rail on Mobile) + Search/Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* CEFR Horizontal Swipeable Rail on Mobile, Segmented on Desktop */}
        <div className="overflow-x-auto no-scrollbar -mx-1 px-1 sm:mx-0 sm:px-0">
          <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center gap-1 w-max sm:w-fit">
            {CEFR_CATEGORIES.map((cat) => {
              const isActive =
                cat.id.toUpperCase() === selectedCategory.toUpperCase();
              const isUserCat =
                currentCefr &&
                currentCefr.toUpperCase().startsWith(cat.id.toUpperCase());

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={(e) => {
                    animeButtonPop(e.currentTarget);
                    onSelectCategory(cat.id);
                  }}
                  className={`py-1.5 px-3 sm:px-3 sm:py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 min-h-[38px] sm:min-h-auto touch-manipulation select-none shrink-0 ${
                    isActive
                      ? "bg-white dark:bg-slate-900 text-[#0D3B66] dark:text-[#F4B41A] shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>{cat.label}</span>
                  {isUserCat && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F4B41A]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Dropdown + Scoped Search (Side-by-side on mobile) */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative shrink-0 flex-1 sm:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => onSelectStatus(e.target.value)}
              className="w-full appearance-none pl-3 pr-7 py-2 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0D3B66]/20 cursor-pointer shadow-2xs min-h-[38px] sm:min-h-auto touch-manipulation"
            >
              <option value="all">All Statuses</option>
              <option value="unlocked">Available / Unlocked</option>
              <option value="completed">Completed</option>
              <option value="locked">Locked</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={`Search ${selectedSubLevel} modules...`}
              className="w-full pl-8 pr-3 py-2 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D3B66]/20 shadow-2xs min-h-[38px] sm:min-h-auto"
            />
          </div>
        </div>
      </div>

      {/* Baris 2: Sub-Level Horizontal Swipeable Rail (Single Row, No Multi-line Wrapping!) */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="overflow-x-auto no-scrollbar -mx-1 px-1 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-1.5 w-max sm:w-auto">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono pr-1 shrink-0 hidden sm:inline">
              Sub-level {activeCategoryObj.label}:
            </span>
            {activeCategoryObj.subLevels.map((sub) => {
              const isSubActive =
                sub.id.toUpperCase() === selectedSubLevel.toUpperCase();
              const count = subLevelCounts[sub.id] || 0;
              const isCurrent =
                currentCefr &&
                currentCefr.toUpperCase().startsWith(sub.id.toUpperCase());

              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={(e) => {
                    animeButtonPop(e.currentTarget);
                    onSelectSubLevel(sub.id);
                  }}
                  className={`px-3 py-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[36px] sm:min-h-auto touch-manipulation active:scale-95 shrink-0 select-none ${
                    isSubActive
                      ? "bg-[#0D3B66] text-white dark:bg-[#F4B41A] dark:text-slate-950 font-black shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <span className="font-mono">{sub.id}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      isSubActive
                        ? "bg-white/20 text-white dark:bg-slate-900/30 dark:text-slate-950 font-bold"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-medium"
                    }`}
                  >
                    {count}
                  </span>
                  {isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F4B41A] dark:bg-[#0D3B66]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
