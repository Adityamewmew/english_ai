"use client";

import React, { useState } from "react";
import { Search, Bell, Flame, Menu, PanelLeftOpen } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

interface StudentTopbarProps {
  studentName?: string;
  currentCefr?: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  showSearch?: boolean;
  showStreak?: boolean;
  showProfile?: boolean;
}

export function StudentTopbar({
  studentName = "",
  currentCefr = "A1.1",
  isSidebarOpen,
  onToggleSidebar,
  showSearch = false,
  showStreak = false,
  showProfile = false,
}: StudentTopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="flex items-center justify-between gap-4 py-2 px-4 sm:px-6 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      {/* Left: Sidebar Toggle + (Optional) Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {/* Toggle Sidebar Button */}
        <button
          type="button"
          onClick={(e) => {
            animeButtonPop(e.currentTarget);
            onToggleSidebar();
          }}
          title={isSidebarOpen ? "Collapse Sidebar" : "Open Sidebar"}
          className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 touch-manipulation"
        >
          {isSidebarOpen ? <Menu className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5 text-[#0D3B66]" />}
        </button>

        {/* Search Bar (Only shown if showSearch is true) */}
        {showSearch && (
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search modules, vocabulary, topics..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D3B66]/20 focus:border-[#0D3B66] transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
            />
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* XP / Streak Pill (Only shown if showStreak is true) */}
        {showStreak && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4B41A]/15 border border-[#F4B41A]/40 text-[#0D3B66] dark:text-[#F4B41A] text-xs font-bold shadow-2xs">
            <Flame className="w-3.5 h-3.5 fill-[#F4B41A] text-[#F4B41A]" />
            <span>5 Day Streak</span>
          </div>
        )}

        {/* Notifications */}
        <button
          onClick={(e) => animeButtonPop(e.currentTarget)}
          className="relative w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-center text-slate-500 hover:text-[#0D3B66] dark:hover:text-white transition-colors cursor-pointer shadow-2xs touch-manipulation"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#9E1B1B]" />
        </button>

        {/* Profile Avatar Pill (Only shown if showProfile is true) */}
        {showProfile && (
          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-10 h-10 rounded-full bg-[#0D3B66] border border-[#082542] shadow-xs flex items-center justify-center">
              <span className="text-xs font-black text-[#F4B41A]">
                {studentName ? studentName.substring(0, 2).toUpperCase() : "ED"}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {studentName || "Student"}
              </span>
              <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#0D3B66] text-white font-mono shadow-2xs">
                CEFR {currentCefr}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
