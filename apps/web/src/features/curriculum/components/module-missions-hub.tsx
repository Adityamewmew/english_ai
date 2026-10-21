"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  ChevronRight,
  GraduationCap,
  ArrowRight,
  MoreHorizontal,
  CheckCircle2,
  Lock,
  PhoneCall,
} from "lucide-react";
import { animeButtonPop, animeShake } from "@/lib/anime-effects";

interface SubModuleItem {
  id: string;
  moduleId: string;
  skillType: string;
  title: string;
  orderIndex: number;
  sections?: any[];
  userProgress?: {
    status: string; // "unlocked" | "locked" | "completed"
    score?: number | null;
    completedAt?: string | null;
  };
}

interface ModuleMissionsHubProps {
  moduleData: any;
  subModules: SubModuleItem[];
  tutor: any;
  onSelectMission: (subModuleId: string) => void;
  isAdmin?: boolean;
}

const SKILL_THEMES: Record<
  string,
  {
    icon: React.ElementType;
    label: string;
    accentColor: string;
    iconBg: string;
    progressBar: string;
    shortTitle: string;
  }
> = {
  reading: {
    icon: BookOpen,
    label: "Reading",
    accentColor: "#0D3B66",
    iconBg: "bg-[#0D3B66] text-white",
    progressBar: "#0D3B66",
    shortTitle: "Reading",
  },
  listening: {
    icon: Headphones,
    label: "Listening",
    accentColor: "#F4B41A",
    iconBg: "bg-[#F4B41A] text-[#0F172A]",
    progressBar: "#F4B41A",
    shortTitle: "Listening",
  },
  writing: {
    icon: PenTool,
    label: "Writing",
    accentColor: "#9E1B1B",
    iconBg: "bg-[#9E1B1B] text-white",
    progressBar: "#9E1B1B",
    shortTitle: "Writing",
  },
  speaking: {
    icon: Mic,
    label: "Speaking",
    accentColor: "#1B4965",
    iconBg: "bg-[#1B4965] text-white",
    progressBar: "#1B4965",
    shortTitle: "Speaking",
  },
  assessment: {
    icon: GraduationCap,
    label: "Graduation Exam",
    accentColor: "#D97706",
    iconBg: "bg-amber-600 text-white",
    progressBar: "#D97706",
    shortTitle: "Graduation Exam (55 Soal)",
  },
  exam: {
    icon: GraduationCap,
    label: "Graduation Exam",
    accentColor: "#D97706",
    iconBg: "bg-amber-600 text-white",
    progressBar: "#D97706",
    shortTitle: "Graduation Exam (55 Soal)",
  },
};

export function ModuleMissionsHub({
  moduleData,
  subModules = [],
  tutor,
  onSelectMission,
  isAdmin = false,
}: ModuleMissionsHubProps) {
  const completedCount = subModules.filter(
    (s) => s.userProgress?.status === "completed"
  ).length;
  const firstActiveSub =
    subModules.find((s) => s.userProgress?.status !== "completed") ||
    subModules[0];

  const handleCardClick = (sub: SubModuleItem, isLocked: boolean, e: React.MouseEvent) => {
    if (isLocked && !isAdmin) {
      animeShake(e.currentTarget as HTMLElement);
      return;
    }
    animeButtonPop(e.currentTarget as HTMLElement);
    onSelectMission(sub.id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Mobile-Specific Hub (<sm) */}
      <div className="sm:hidden space-y-3.5">
        {/* Mobile Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
          <Link href="/dashboard" className="hover:text-[#0D3B66]">
            Beranda
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link href="/modules" className="hover:text-[#0D3B66]">
            Modul
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-[#0D3B66] font-mono font-bold">
            {moduleData?.id || "A1.1-M01"}
          </span>
        </div>

        {/* Mobile Header Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0D3B66] text-white">
              CEFR {moduleData?.cefr || "A1.1"}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {completedCount} dari {subModules.length || 4} Selesai
            </span>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-slate-900 leading-snug">
              {moduleData?.title || "Unit Pembelajaran"}
            </h2>
          </div>

          {firstActiveSub && (
            <button
              type="button"
              onClick={() => onSelectMission(firstActiveSub.id)}
              className="w-full py-2.5 px-4 rounded-xl btn-skeuo-navy text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2 min-h-[44px] touch-manipulation active:scale-95 transition-all"
            >
              <span>{completedCount > 0 ? "Lanjut Belajar" : "Mulai Belajar"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile Submodules Card Grid (2x2) */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 px-1">
            Daftar Materi
          </h3>
          <div className={subModules.length === 1 ? "grid grid-cols-1" : "grid grid-cols-2 gap-2.5"}>
            {subModules.map((sub, index) => {
              const skill = sub.skillType.toLowerCase();
              const theme = SKILL_THEMES[skill] || SKILL_THEMES.reading;
              const Icon = theme.icon;
              const isCompleted = sub.userProgress?.status === "completed";
              const isLocked = !isAdmin && sub.userProgress?.status === "locked" && index > completedCount;

              const isAssessment = skill === "assessment" || skill === "exam";

              return (
                <div
                  key={sub.id}
                  onClick={(e) => handleCardClick(sub, isLocked, e)}
                  className={`p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-3 min-h-[120px] cursor-pointer touch-manipulation active:scale-95 transition-all ${
                    isAssessment && subModules.length > 1 ? "col-span-2 border-amber-300 bg-amber-50/20" : ""
                  } ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl ${theme.iconBg} flex items-center justify-center shadow-2xs`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Selesai</span>
                      </span>
                    ) : isLocked ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">
                        <Lock className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#0D3B66]">
                        Aktif
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                      {theme.shortTitle}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                      {sub.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Desktop-Specific Hub (sm+) */}
      <div className="hidden sm:block space-y-6">
        {/* Desktop Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/dashboard" className="hover:text-[#0D3B66] dark:hover:text-white transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/modules" className="hover:text-[#0D3B66] dark:hover:text-white transition-colors">
            Courses
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#0D3B66] dark:text-[#F4B41A] font-bold">
            {moduleData?.id || "A1.1-M01"}
          </span>
        </div>

        {/* Desktop Hero Banner */}
        <div
          style={{ backgroundColor: "#0D3B66" }}
          className="relative overflow-hidden rounded-[28px] p-5 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 shadow-md border border-[#082542]"
        >
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#F4B41A]/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-52 h-52 rounded-full bg-[#9E1B1B]/30 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl space-y-3.5 text-center md:text-left w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#F4B41A] text-xs font-black uppercase tracking-wider shadow-2xs backdrop-blur-xs border border-white/10">
              <GraduationCap className="w-3.5 h-3.5 text-[#F4B41A]" />
              <span>CEFR {moduleData?.cefr || "A1.1"} · Active Course</span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
              {moduleData?.title || "Unit 1: One World: Countries, Nationalities & To Be"}
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              Think English, Think EDDY&apos;s. Master 4 distinct skills: Reading comprehension, Audio listening drills, Sentence writing, and Voice speaking practice.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-2.5 sm:gap-3">
              {firstActiveSub && (
                <button
                  type="button"
                  onClick={() => onSelectMission(firstActiveSub.id)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full btn-skeuo-yellow text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer min-h-[44px] touch-manipulation w-full sm:w-auto font-bold"
                >
                  <span>{completedCount > 0 ? "Continue Course" : "Start Course"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={tutor.handleToggleCall}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 shadow-xs transition-all active:scale-95 cursor-pointer min-h-[44px] touch-manipulation w-full sm:w-auto"
              >
                <PhoneCall className="w-4 h-4 text-[#F4B41A]" />
                <span>Voice Practice Call</span>
              </button>
            </div>
          </div>

          <div className="relative z-10 shrink-0 w-36 sm:w-48 md:w-64 h-32 sm:h-40 md:h-52 flex items-center justify-center">
            <img
              src="/illustrations/hero-learning.svg"
              alt="Learning Illustration"
              className="w-full h-full object-contain drop-shadow-xs"
            />
          </div>
        </div>

      {/* 3. Sub Modules Section (2 Cards per Row) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#0D3B66] dark:text-white uppercase tracking-tight">
              Sub modules
            </h3>
          </div>
          <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[#0D3B66] dark:text-slate-300 border border-slate-200/80">
            {completedCount} / {subModules.length || 4} Completed
          </span>
        </div>

        {/* Grid layout (centered if single assessment card, 2-column otherwise) */}
        <div className={subModules.length === 1 ? "grid grid-cols-1 max-w-2xl" : "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"}>
          {subModules.map((sub, index) => {
            const skill = sub.skillType.toLowerCase();
            const theme = SKILL_THEMES[skill] || SKILL_THEMES.reading;
            const Icon = theme.icon;

            const isCompleted = sub.userProgress?.status === "completed";
            const isLocked = !isAdmin && sub.userProgress?.status === "locked" && index > completedCount;
            const progressPercent = isCompleted ? 100 : sub.userProgress?.status === "unlocked" ? 40 : 0;

            const isAssessment = skill === "assessment" || skill === "exam";

            return (
              <div
                key={sub.id}
                onClick={(e) => handleCardClick(sub, isLocked, e)}
                className={`p-5 sm:p-6 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 border-b-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-5 sm:gap-6 group cursor-pointer touch-manipulation min-h-[160px] ${
                  isAssessment && subModules.length > 1 ? "md:col-span-2 border-amber-400/60 dark:border-amber-700/60 bg-linear-to-r from-amber-500/5 via-white to-amber-500/5 dark:from-amber-950/20 dark:via-slate-900 dark:to-amber-950/10" : ""
                } ${
                  isLocked ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5 active:scale-[0.99]"
                }`}
              >
                {/* Top Row: Icon Badge + Status Pill / Menu */}
                <div className="flex items-center justify-between">
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${theme.iconBg} shadow-2xs flex items-center justify-center border-b-2 border-black/15 shrink-0`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Done</span>
                      </span>
                    ) : isLocked ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        aria-label="Options"
                        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-slate-400 hover:text-[#0D3B66] transition-colors touch-manipulation"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-Module Short Title: Reading, Listening, Writing, Speaking */}
                <div className="py-1 sm:py-2 min-w-0">
                  <h4 className="font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight capitalize group-hover:text-[#0D3B66] transition-colors truncate">
                    {theme.shortTitle}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">
                    {sub.title}
                  </p>
                </div>

                {/* Progress Bar & Percentage Row */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">
                    <span>Progress</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: theme.progressBar,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);
}
