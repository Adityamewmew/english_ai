"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { StudentShell } from "@/features/dashboard";
import { ModulesAnalyticsBento } from "./modules-analytics-bento";
import { ModulesFilterBar } from "./modules-filter-bar";
import { ModuleGridCard, CurriculumModuleItem } from "./module-grid-card";
import { useCurriculumLevels } from "../hooks/use-curriculum";
import { useUserProfile } from "@/features/users/hooks/use-user";
import type { SessionUser } from "@/lib/session";
import { BookOpen, ChevronRight, Sparkles } from "lucide-react";
import {
  CEFR_CATEGORIES,
  CefrCategory,
  SubLevelItem,
} from "../constants/cefr-categories";

interface ModulesCatalogViewProps {
  session: SessionUser;
  initialLevel?: string;
}

export function ModulesCatalogView({
  session,
  initialLevel = "all",
}: ModulesCatalogViewProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  const { data: levelsData, isLoading } = useCurriculumLevels(session.userId);
  const { data: userProfile } = useUserProfile(session.userId);

  const studentName = userProfile?.name || session.name;
  const currentCefr = userProfile?.currentCefr || session.currentCefr || "A1.1";

  // Determine initial category and sub-level
  const initialCategory = useMemo(() => {
    if (initialLevel && initialLevel !== "all") {
      const upper = initialLevel.toUpperCase();
      const matched = CEFR_CATEGORIES.find(
        (c) => c.id === upper || upper.startsWith(c.id)
      );
      if (matched) return matched.id;
    }
    const userCat = (currentCefr || "A1").toUpperCase().slice(0, 2);
    const matched = CEFR_CATEGORIES.find((c) => c.id === userCat);
    return matched ? matched.id : "A1";
  }, [initialLevel, currentCefr]);

  const initialSubLevel = useMemo(() => {
    if (initialLevel && initialLevel !== "all") {
      const upper = initialLevel.toUpperCase();
      for (const cat of CEFR_CATEGORIES) {
        const found = cat.subLevels.find((s) => s.id === upper);
        if (found) return found.id;
      }
    }
    return currentCefr || "A1.1";
  }, [initialLevel, currentCefr]);

  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategory);
  const [selectedSubLevel, setSelectedSubLevel] =
    useState<string>(initialSubLevel);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sync state if initial values or user profile resolve later
  useEffect(() => {
    if (initialCategory && !selectedCategory) {
      setSelectedCategory(initialCategory);
    }
    if (initialSubLevel && !selectedSubLevel) {
      setSelectedSubLevel(initialSubLevel);
    }
  }, [initialCategory, initialSubLevel]);

  const levels: any[] = Array.isArray(levelsData) ? levelsData : [];

  // Extract all modules and counts per sub-level
  const { allModules, subLevelCounts, completedCounts } = useMemo(() => {
    const list: CurriculumModuleItem[] = [];
    const counts: Record<string, number> = {};
    const completed: Record<string, number> = {};

    levels.forEach((lvlItem: any) => {
      const lvl = lvlItem.level || lvlItem;
      const subId = (lvl.id || lvl.cefr || "").toUpperCase();
      const mods = Array.isArray(lvlItem.modules)
        ? lvlItem.modules
        : Array.isArray(lvl.modules)
        ? lvl.modules
        : [];

      mods.forEach((m: any) => {
        const cefrVal = m.cefr || lvl.cefr || subId;
        const levelIdVal = m.levelId || subId;
        const item: CurriculumModuleItem = {
          id: m.id,
          title: m.title,
          cefr: cefrVal,
          description: m.description || m.objective,
          status: m.status || "unlocked",
          score: m.score,
          skillFocus: m.skillFocus,
          orderIndex: m.orderIndex,
        };
        list.push(item);

        counts[levelIdVal] = (counts[levelIdVal] || 0) + 1;
        if (item.status === "completed") {
          completed[levelIdVal] = (completed[levelIdVal] || 0) + 1;
        }
      });
    });

    return {
      allModules: list,
      subLevelCounts: counts,
      completedCounts: completed,
    };
  }, [levels]);

  // Active Category Object
  const activeCategory = useMemo(() => {
    return (
      CEFR_CATEGORIES.find(
        (c) => c.id.toUpperCase() === selectedCategory.toUpperCase()
      ) || CEFR_CATEGORIES[0]
    );
  }, [selectedCategory]);

  // Active Sub-Level Item
  const activeSubLevelItem = useMemo(() => {
    return (
      activeCategory.subLevels.find(
        (s) => s.id.toUpperCase() === selectedSubLevel.toUpperCase()
      ) ||
      activeCategory.subLevels[0] || {
        id: "A1.1",
        title: "Starter Foundations",
        order: 1,
        description:
          "Personal introductions, essential objects, nationalities, and present 'to be' syntax.",
      }
    );
  }, [activeCategory, selectedSubLevel]);

  // Switch category handler: auto-select first sub-level or user's active sub-level
  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    const catObj = CEFR_CATEGORIES.find((c) => c.id === catId);
    if (!catObj) return;

    if (
      currentCefr &&
      currentCefr.toUpperCase().startsWith(catId.toUpperCase())
    ) {
      const matchInCat = catObj.subLevels.find(
        (s) => s.id.toUpperCase() === currentCefr.toUpperCase()
      );
      if (matchInCat) {
        setSelectedSubLevel(matchInCat.id);
        return;
      }
    }
    // Default to the first sub-level in this category
    if (catObj.subLevels.length > 0) {
      setSelectedSubLevel(catObj.subLevels[0].id);
    }
  };

  // Modules strictly scoped to the active sub-level
  const subLevelModules = useMemo(() => {
    const activeSubUpper = activeSubLevelItem.id.toUpperCase();
    return allModules.filter((m) => {
      const mId = m.id.toUpperCase();
      const mCefr = m.cefr.toUpperCase();
      return (
        mId.startsWith(activeSubUpper + "-") ||
        mId.startsWith(activeSubUpper) ||
        mCefr === activeSubUpper
      );
    });
  }, [allModules, activeSubLevelItem.id]);

  // Active module in current sub-level: first unlocked or first module
  const activeModule = useMemo(() => {
    return (
      subLevelModules.find((m) => m.status === "unlocked") ||
      subLevelModules[0] || {
        id: `${activeSubLevelItem.id}-M01`,
        title: `Unit 1: ${activeSubLevelItem.title}`,
        cefr: activeSubLevelItem.id,
      }
    );
  }, [subLevelModules, activeSubLevelItem]);

  // Filter scoped to this sub-level by status & search
  const filteredModules = useMemo(() => {
    return subLevelModules.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = m.title.toLowerCase().includes(query);
        const matchesId = m.id.toLowerCase().includes(query);
        const matchesDesc = (m.description || "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesId && !matchesDesc) return false;
      }
      return true;
    });
  }, [subLevelModules, statusFilter, searchQuery]);

  const totalInSubLevel =
    subLevelCounts[activeSubLevelItem.id] || subLevelModules.length || 13;
  const completedInSubLevel = completedCounts[activeSubLevelItem.id] || 0;
  const subLevelProgressPercent =
    totalInSubLevel > 0
      ? Math.round((completedInSubLevel / totalInSubLevel) * 100)
      : 0;
  const isCurrentTrack =
    currentCefr &&
    currentCefr.toUpperCase().startsWith(activeSubLevelItem.id.toUpperCase());

  return (
    <StudentShell studentName={studentName} currentCefr={currentCefr}>
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
          {/* Breadcrumb & Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Link
                href="/dashboard"
                className="hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-[#0D3B66] dark:text-[#F4B41A]">
                Curriculum Modules
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0D3B66] dark:text-white tracking-tight uppercase">
              Curriculum Courses &amp; Modules
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Structured CEFR standard curriculum from A1 to C2 with interactive
              practice and AI voice tutor.
            </p>
          </div>

          {/* 3 Top Bento Analytics Cards */}
          <ModulesAnalyticsBento
            categoryLabel={activeCategory.label}
            categoryName={activeCategory.name}
            subLevelId={activeSubLevelItem.id}
            subLevelTitle={activeSubLevelItem.title}
            totalInSubLevel={totalInSubLevel}
            completedInSubLevel={completedInSubLevel}
            activeModule={activeModule}
          />

          {/* Filter Bar: Two-Tier Navigation + Status + Search */}
          <ModulesFilterBar
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            selectedSubLevel={selectedSubLevel}
            onSelectSubLevel={setSelectedSubLevel}
            currentCefr={currentCefr}
            subLevelCounts={subLevelCounts}
            statusFilter={statusFilter}
            onSelectStatus={setStatusFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Sub-Level Title & Stats Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-b border-slate-200/80 dark:border-slate-800 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-xs font-black font-mono tracking-tight text-white bg-[#0D3B66] dark:bg-[#1B4965]">
                  {activeSubLevelItem.id}
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {activeSubLevelItem.title}
                </h2>
                {isCurrentTrack && (
                  <span className="px-2 py-0.5 rounded-full bg-[#F4B41A]/20 text-[#B8860B] dark:text-[#F4B41A] text-[10px] font-black tracking-tight uppercase flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Current Track</span>
                  </span>
                )}
              </div>
              {activeSubLevelItem.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeSubLevelItem.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 shrink-0">
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {completedInSubLevel} of {totalInSubLevel} Completed
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="font-mono text-[11px] text-[#0D3B66] dark:text-[#F4B41A]">
                Showing {filteredModules.length} Modules
              </span>
            </div>
          </div>

          {/* Module Cards Grid */}
          <div className="space-y-4">

            {filteredModules.length === 0 ? (
              <div className="py-16 text-center rounded-[28px] border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">
                  No modules found in {activeSubLevelItem.id}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {totalInSubLevel === 0
                    ? `Modul untuk sub-level ${activeSubLevelItem.id} sedang dalam tahap pengembangan dan kurasi standar kurikulum terbaru.`
                    : searchQuery
                    ? `Tidak ada modul yang cocok dengan "${searchQuery}" di ${activeSubLevelItem.id}. Coba kata kunci lain.`
                    : "Tidak ada modul yang sesuai dengan filter status yang dipilih."}
                </p>
                {totalInSubLevel > 0 && (searchQuery || statusFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("all");
                      setSearchQuery("");
                    }}
                    className="px-4 py-2 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold text-xs cursor-pointer hover:bg-slate-800 transition-colors"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredModules.map((m, idx) => (
                  <ModuleGridCard key={m.id} module={m} index={idx} />
                ))}
              </div>
            )}
        </div>
      </div>
    </StudentShell>
  );
}
