"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { StudentSidebarRail } from "@/features/dashboard/components/student-sidebar-rail";
import { StudentTopbar } from "@/features/dashboard/components/student-topbar";
import { ModulesAnalyticsBento } from "./modules-analytics-bento";
import { ModulesFilterBar } from "./modules-filter-bar";
import { ModuleGridCard, CurriculumModuleItem } from "./module-grid-card";
import { useCurriculumLevels } from "../hooks/use-curriculum";
import { useUserProfile } from "@/features/users/hooks/use-user";
import type { SessionUser } from "@/lib/session";
import { BookOpen, Sparkles, ChevronRight } from "lucide-react";

interface ModulesCatalogViewProps {
  session: SessionUser;
  initialLevel?: string;
}

export function ModulesCatalogView({ session, initialLevel = "all" }: ModulesCatalogViewProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>(initialLevel);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: levelsData, isLoading } = useCurriculumLevels(session.userId);
  const { data: userProfile } = useUserProfile(session.userId);

  const levels: any[] = Array.isArray(levelsData) ? levelsData : [];

  // Extract all modules from all levels
  const { allModules, levelCounts, totalModulesCount, completedModulesCount } = useMemo(() => {
    const list: CurriculumModuleItem[] = [];
    const counts: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };
    let completed = 0;

    levels.forEach((lvl: any) => {
      const cefrKey = (lvl.cefr || "").toUpperCase().slice(0, 2);
      if (Array.isArray(lvl.modules)) {
        lvl.modules.forEach((m: any) => {
          list.push({
            id: m.id,
            title: m.title,
            cefr: m.cefr || lvl.cefr,
            description: m.description,
            status: m.status || "unlocked",
            score: m.score,
            skillFocus: m.skillFocus,
            orderIndex: m.orderIndex,
          });

          if (m.status === "completed") completed++;
          if (counts[cefrKey] !== undefined) counts[cefrKey]++;
        });
      }
    });

    return {
      allModules: list,
      levelCounts: counts,
      totalModulesCount: list.length || 180,
      completedModulesCount: completed,
    };
  }, [levels]);

  // Active module: first unlocked module
  const activeModule = useMemo(() => {
    return (
      allModules.find((m) => m.status === "unlocked") ||
      allModules[0] || {
        id: "A1.1-M01",
        title: "Unit 1: One World: Countries, Nationalities & To Be",
        cefr: "A1.1",
      }
    );
  }, [allModules]);

  // Filter modules based on user selections
  const filteredModules = useMemo(() => {
    return allModules.filter((m) => {
      // CEFR level filter
      if (selectedLevel !== "all") {
        const mCefr = m.cefr.toUpperCase();
        if (selectedLevel === "C1") {
          if (!mCefr.startsWith("C1") && !mCefr.startsWith("C2")) return false;
        } else if (!mCefr.startsWith(selectedLevel.toUpperCase())) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all" && m.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = m.title.toLowerCase().includes(query);
        const matchesId = m.id.toLowerCase().includes(query);
        const matchesDesc = (m.description || "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesId && !matchesDesc) return false;
      }

      return true;
    });
  }, [allModules, selectedLevel, statusFilter, searchQuery]);

  const studentName = userProfile?.name || session.name;
  const currentCefr = userProfile?.currentCefr || session.currentCefr || "A1.1";

  return (
    <div className="min-h-screen w-full bg-slate-50/50 dark:bg-slate-950 flex flex-row overflow-x-hidden">
      {/* 1. Collapsible Sidebar Rail (Shared with Dashboard) */}
      <StudentSidebarRail
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(false)}
      />

      {/* 2. Main Full-Bleed Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-white dark:bg-slate-900 transition-all duration-300">
        {/* Top Bar with Sidebar Toggle */}
        <StudentTopbar
          studentName={studentName}
          currentCefr={currentCefr}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Catalog Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-8">
          {/* Breadcrumb & Page Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Link href="/dashboard" className="hover:text-slate-700 dark:hover:text-white transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-indigo-600 dark:text-indigo-400">Curriculum Modules</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Curriculum Courses &amp; Modules
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Comprehensive CEFR A1 to C2 curriculum standard with interactive practice and AI voice tutor.
            </p>
          </div>

          {/* 3 Top Analytics Bento Cards */}
          <ModulesAnalyticsBento
            totalModules={totalModulesCount}
            completedModules={completedModulesCount}
            activeModule={activeModule}
          />

          {/* Filter Row: CEFR Pills + Status Dropdown + Search */}
          <ModulesFilterBar
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
            statusFilter={statusFilter}
            onSelectStatus={setStatusFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            levelCounts={levelCounts}
          />

          {/* 4-Column Module Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
              <span>
                Showing {filteredModules.length} of {allModules.length} Modules
              </span>
              <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                Active CEFR: {currentCefr}
              </span>
            </div>

            {filteredModules.length === 0 ? (
              <div className="py-16 text-center rounded-[28px] border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">
                  No modules found matching your filters
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing your search query or selecting a different CEFR level filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLevel("all");
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold text-xs"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredModules.map((m, idx) => (
                  <ModuleGridCard key={m.id} module={m} index={idx} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
