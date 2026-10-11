"use client";

import React from "react";
import { Search, Filter } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

interface ModulesFilterBarProps {
  selectedLevel: string;
  onSelectLevel: (lvl: string) => void;
  statusFilter: string;
  onSelectStatus: (status: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  levelCounts: Record<string, number>;
}

export function ModulesFilterBar({
  selectedLevel,
  onSelectLevel,
  statusFilter,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  levelCounts,
}: ModulesFilterBarProps) {
  const levelPills = [
    { id: "all", label: "All" },
    { id: "A1", label: "A1 Starter" },
    { id: "A2", label: "A2 Elementary" },
    { id: "B1", label: "B1 Intermediate" },
    { id: "B2", label: "B2 Upper" },
    { id: "C1", label: "C1/C2 Advanced" },
  ];

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
      {/* CEFR Level Pill Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
        {levelPills.map((pill) => {
          const isActive = selectedLevel.toLowerCase() === pill.id.toLowerCase();
          const count = pill.id === "all" ? undefined : levelCounts[pill.id];

          return (
            <button
              key={pill.id}
              type="button"
              onClick={(e) => {
                animeButtonPop(e.currentTarget);
                onSelectLevel(pill.id);
              }}
              className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span>{pill.label}</span>
              {count !== undefined && (
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Controls: Search & Status Dropdown */}
      <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
        {/* Status Filter Dropdown */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onSelectStatus(e.target.value)}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="unlocked">Available / Unlocked</option>
            <option value="completed">Completed</option>
            <option value="locked">Locked</option>
          </select>
        </div>

        {/* Local Search Input */}
        <div className="relative flex-1 md:w-56">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search modules..."
            className="w-full pl-9 pr-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>
    </div>
  );
}
