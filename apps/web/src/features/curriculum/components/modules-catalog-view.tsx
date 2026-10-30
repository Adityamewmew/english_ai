"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLatestPlacement } from "@/features/placement/hooks/use-placement";
import { StudentShell } from "@/features/dashboard";
import { ModulesAnalyticsBento } from "./modules-analytics-bento";
import { ModulesFilterBar } from "./modules-filter-bar";
import { ModuleGridCard, CurriculumModuleItem } from "./module-grid-card";
import { useCurriculumLevels } from "../hooks/use-curriculum";
import { useUserProfile } from "@/features/users/hooks/use-user";
import type { SessionUser } from "@/lib/session";
import { BookOpen, ChevronRight, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { useClasses, ClassUnlockModal, type CourseClassItem } from "@/features/classes";
import { isUserAdmin } from "@/lib/auth-utils";
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

  const router = useRouter();
  const { data: latestTest, isLoading: isPlacementLoading } = useLatestPlacement(session.userId);

  useEffect(() => {
    if (!isPlacementLoading && latestTest === null && session.role !== "admin") {
      router.replace("/placement");
    }
  }, [latestTest, isPlacementLoading, session.role, router]);

  const { data: levelsData, isLoading } = useCurriculumLevels(session.userId);
  const { data: userProfile } = useUserProfile(session.userId);
  const { data: classesData, refetch: refetchClasses } = useClasses(session.userId);

  const [selectedClassForUnlock, setSelectedClassForUnlock] = useState<CourseClassItem | null>(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

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
        const levelIdVal = (m.levelId || lvl.id || subId).toUpperCase();
        const item: CurriculumModuleItem = {
          id: m.id,
          title: m.title,
          cefr: cefrVal,
          levelId: levelIdVal,
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
      const mLevel = (m.levelId || "").toUpperCase();
      return (
        mLevel === activeSubUpper ||
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

  const activeCategoryClass = useMemo(() => {
    return (
      classesData?.find(
        (c) => c.cefr.toUpperCase() === selectedCategory.toUpperCase()
      ) || null
    );
  }, [classesData, selectedCategory]);

  const isAdmin = isUserAdmin(session);
  const hasCategoryAccess = isAdmin || (activeCategoryClass ? activeCategoryClass.hasAccess : true);

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);

  return (
    <StudentShell studentName={studentName} currentCefr={currentCefr}>
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
          {/* Mobile Header (<sm) */}
          <div className="sm:hidden space-y-1">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-extrabold text-[#0D3B66] dark:text-white tracking-tight">
                Curriculum Catalog
              </h1>
              <span className="text-xs font-bold text-slate-500 font-mono">
                {completedInSubLevel}/{totalInSubLevel} Completed
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Structured CEFR A1–C2 curriculum designed to build automatic English speech reflexes.
            </p>
          </div>

          {/* Desktop Breadcrumb & Header (sm+) */}
          <div className="hidden sm:block space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Link
                href="/dashboard"
                className="hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-[#0D3B66] dark:text-[#F4B41A]">
                Courses Catalog
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0D3B66] dark:text-white tracking-tight uppercase">
              Curriculum &amp; Learning Modules
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Standard CEFR curriculum from A1 to C2 with interactive exercises and AI voice tutor.
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
          <div className="flex items-center justify-between gap-3 pt-1 border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-xs font-black font-mono tracking-tight text-white bg-[#0D3B66] dark:bg-[#1B4965]">
                  {activeSubLevelItem.id}
                </span>
                <h2 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {activeSubLevelItem.title}
                </h2>
                {isCurrentTrack && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-[#F4B41A]/20 text-[#B8860B] dark:text-[#F4B41A] text-[10px] font-black tracking-tight uppercase items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>Active Track</span>
                  </span>
                )}
              </div>
              {activeSubLevelItem.description && (
                <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
                  {activeSubLevelItem.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 shrink-0">
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {completedInSubLevel}/{totalInSubLevel} Completed
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="font-mono text-[11px] text-[#0D3B66] dark:text-[#F4B41A]">
                {filteredModules.length} Modules
              </span>
            </div>
          </div>

          {/* Class Unlock Banner if level not owned */}
          {!hasCategoryAccess && activeCategoryClass && (
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#F4F6FF] via-[#EEF2FF] to-[#F8F9FE] dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-[#D5E0FA] dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 card-skeuo">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10375C] via-[#1B4965] to-[#10375C] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#10375C]/15 border border-white/20">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#10375C] text-white font-mono shadow-2xs">
                      {activeCategoryClass.isExpired ? "Access Expired (1 Month Ended)" : "Access Locked"}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Level {selectedCategory}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                    {activeCategoryClass.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                    {activeCategoryClass.description ||
                      (activeCategoryClass.isExpired
                        ? `Your 1-month access has ended. Complete your modules or renew your package to continue practicing.`
                        : `Enhance your professional fluency and active speaking in English with CEFR Level ${selectedCategory} curriculum, interactive AI voice coaching, and official certification.`)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200/60 dark:border-slate-800">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    {activeCategoryClass.isExpired ? "Renewal Price" : "Unlock Price"}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-2xl sm:text-3xl font-black text-[#10375C] dark:text-[#F4B41A]">
                      {formatRupiah(activeCategoryClass.price)}
                    </span>
                    {activeCategoryClass.originalPrice &&
                      activeCategoryClass.originalPrice >
                        activeCategoryClass.price && (
                        <span className="text-xs text-slate-400 line-through font-medium">
                          {formatRupiah(activeCategoryClass.originalPrice)}
                        </span>
                      )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedClassForUnlock(activeCategoryClass);
                    setIsUnlockModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#10375C] via-[#1B4965] to-[#10375C] hover:opacity-95 active:scale-[0.98] text-white font-extrabold text-xs shadow-md shadow-[#10375C]/20 flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <span>{activeCategoryClass.isExpired ? "Renew Class Access Now" : "Unlock Course Access Now"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Tier Upgrade Mini Callout if class owned but not yet Ultra */}
          {hasCategoryAccess &&
            activeCategoryClass?.userTier &&
            activeCategoryClass.userTier !== "ultra" &&
            activeCategoryClass.userTier !== "admin" && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 font-mono">
                    {activeCategoryClass.userTier.toUpperCase()} Plan
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Need higher daily chat limits &amp; AI voice call practice duration?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClassForUnlock(activeCategoryClass);
                    setIsUnlockModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-50 border border-slate-200 dark:border-slate-600 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  Upgrade AI Plan
                </button>
              </div>
            )}

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
                    ? `Modules for sublevel ${activeSubLevelItem.id} are being curated to latest CEFR standards.`
                    : searchQuery
                    ? `No modules match "${searchQuery}" in ${activeSubLevelItem.id}. Try different search terms.`
                    : "No modules match the selected filter criteria."}
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
                  <ModuleGridCard
                    key={m.id}
                    module={m}
                    index={idx}
                    isAdmin={isAdmin}
                    onUnlockClick={() => {
                      if (activeCategoryClass) {
                        setSelectedClassForUnlock(activeCategoryClass);
                        setIsUnlockModalOpen(true);
                      }
                    }}
                  />
                ))}
              </div>
            )}
        </div>
      </div>

      <ClassUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        classItem={selectedClassForUnlock}
        userId={session.userId}
        onSuccess={() => {
          refetchClasses();
        }}
      />
    </StudentShell>
  );
}
