"use client";

import React, { useState } from "react";
import { Search, Bell, Flame, Menu, PanelLeftOpen } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

interface StudentTopbarProps {
  studentName: string;
  currentCefr?: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function StudentTopbar({
  studentName,
  currentCefr = "A1.1",
  isSidebarOpen,
  onToggleSidebar,
}: StudentTopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="flex items-center justify-between gap-4 py-3.5 px-4 sm:px-8 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      {/* Left: Sidebar Toggle + Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {/* Toggle Sidebar Button */}
        <button
          type="button"
          onClick={(e) => {
            animeButtonPop(e.currentTarget);
            onToggleSidebar();
          }}
          title={isSidebarOpen ? "Collapse Sidebar" : "Open Sidebar"}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
        >
          {isSidebarOpen ? <Menu className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5 text-indigo-600" />}
        </button>

        {/* Search Bar (Rounded Pill with Icon) */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modules, vocabulary, topics..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* XP / Streak Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-2xs">
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>5 Day Streak</span>
        </div>

        {/* Notifications */}
        <button
          onClick={(e) => animeButtonPop(e.currentTarget)}
          className="relative w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
        </button>

        {/* Profile Avatar Pill */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-sm">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                {studentName ? studentName.substring(0, 2).toUpperCase() : "AD"}
              </span>
            </div>
          </div>
          <div className="hidden md:block text-left">
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
              {studentName || "Administrator"}
            </span>
            <span className="inline-block text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-mono">
              CEFR {currentCefr}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
