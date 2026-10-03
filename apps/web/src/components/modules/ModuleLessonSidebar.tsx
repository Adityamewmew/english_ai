"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  PhoneCall,
  Sparkles,
  BookOpen,
  Volume2,
  MessageSquare,
  Award,
  Layers,
  HelpCircle,
  X,
  Compass,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { animeButtonPop } from "@/lib/anime-effects";

export interface StepDefinition {
  stepNumber: number;
  title: string;
  subtitle: string;
  phase: "theory" | "practice";
  icon: React.ElementType;
}

export const MODULE_STEPS: StepDefinition[] = [
  {
    stepNumber: 1,
    title: "Sasaran & Target Modul",
    subtitle: "Briefing cerita & misi belajar",
    phase: "theory",
    icon: Compass,
  },
  {
    stepNumber: 2,
    title: "Action Sandbox Kalimat",
    subtitle: "Susun pola & jebakan umum",
    phase: "theory",
    icon: Zap,
  },
  {
    stepNumber: 3,
    title: "Rumus & Tangga Contoh",
    subtitle: "Pola 3 tingkat & variasi",
    phase: "theory",
    icon: Layers,
  },
  {
    stepNumber: 4,
    title: "Kosakata Kunci (Vocab)",
    subtitle: "Pelafalan kata & kolokasi",
    phase: "theory",
    icon: BookOpen,
  },
  {
    stepNumber: 5,
    title: "Percakapan Nyata",
    subtitle: "Dialog kontekstual penutur asli",
    phase: "theory",
    icon: MessageSquare,
  },
  {
    stepNumber: 6,
    title: "Uji Kesiapan & Mini Trial",
    subtitle: "Cek pemahaman sebelum praktikum",
    phase: "theory",
    icon: HelpCircle,
  },
  {
    stepNumber: 7,
    title: "Interactive Speaking Lab",
    subtitle: "Drill, roleplay & tantangan spontan",
    phase: "practice",
    icon: Volume2,
  },
  {
    stepNumber: 8,
    title: "Kuis Evaluasi Akhir",
    subtitle: "Uji kelulusan & skor akhir",
    phase: "practice",
    icon: Award,
  },
];

interface ModuleLessonSidebarProps {
  moduleTitle: string;
  orderIndex: number;
  cefr: string;
  levelId?: string;
  isExam?: boolean;
  currentStep: number;
  unlockedStep: number;
  completedSteps: number[];
  onSelectStep: (stepNumber: number) => void;
  isCalling: boolean;
  onToggleCall: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function ModuleLessonSidebar({
  moduleTitle,
  orderIndex,
  cefr,
  levelId,
  isExam,
  currentStep,
  unlockedStep,
  completedSteps,
  onSelectStep,
  isCalling,
  onToggleCall,
  isOpenMobile,
  onCloseMobile,
}: ModuleLessonSidebarProps) {
  const totalSteps = MODULE_STEPS.length;
  const progressPercent = Math.round((completedSteps.length / totalSteps) * 100);

  const theorySteps = MODULE_STEPS.filter((s) => s.phase === "theory");
  const practiceSteps = MODULE_STEPS.filter((s) => s.phase === "practice");

  const renderStepItem = (step: StepDefinition) => {
    const isCompleted = completedSteps.includes(step.stepNumber);
    const isActive = currentStep === step.stepNumber;
    const isLocked = step.stepNumber > unlockedStep;
    const Icon = step.icon;

    return (
      <button
        key={step.stepNumber}
        type="button"
        disabled={isLocked}
        onClick={(e) => {
          if (!isLocked) {
            animeButtonPop(e.currentTarget);
            onSelectStep(step.stepNumber);
            onCloseMobile();
          }
        }}
        className={`w-full text-left p-3 sm:p-3.5 rounded-2xl transition-all flex items-start gap-3 select-none will-change-transform ${
          isActive
            ? "bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-100 shadow-xs ring-1 ring-blue-500/30"
            : isLocked
            ? "opacity-50 cursor-not-allowed text-slate-400 dark:text-slate-600 hover:bg-transparent"
            : "hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 cursor-pointer"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors ${
            isActive
              ? "bg-blue-600 text-white shadow-xs"
              : isCompleted
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              : isLocked
              ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : isLocked ? (
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <Icon className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span
              className={`text-xs font-extrabold truncate ${
                isActive
                  ? "text-blue-700 dark:text-blue-300"
                  : isLocked
                  ? "text-slate-400 dark:text-slate-500"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              {step.stepNumber}. {step.title}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
            {step.subtitle}
          </p>
        </div>
      </button>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Module Title Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <Link
            href={levelId ? `/modules?level=${levelId}` : "/modules"}
            onClick={(e) => animeButtonPop(e.currentTarget)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Daftar Modul</span>
          </Link>

          {/* Close button for Mobile Drawer */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <span>Modul {orderIndex}</span>
            <span>•</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {cefr}
            </Badge>
            {isExam && (
              <Badge variant="accent" className="text-[10px] px-1.5 py-0">
                Ujian
              </Badge>
            )}
          </div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2">
            {moduleTitle}
          </h2>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span>Progress Belajar</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
            {completedSteps.length} dari {totalSteps} langkah selesai
          </span>
        </div>
      </div>

      {/* Steps List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Phase 1: Theory */}
        <div className="space-y-2">
          <div className="px-2 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Fase 1: Teori &amp; Pemahaman
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Langkah 1 - 6
            </Badge>
          </div>
          <div className="space-y-1.5">{theorySteps.map(renderStepItem)}</div>
        </div>

        {/* Phase 2: Practice & Quiz */}
        <div className="space-y-2">
          <div className="px-2 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Fase 2: Praktikum &amp; Evaluasi
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Langkah 7 - 8
            </Badge>
          </div>
          <div className="space-y-1.5">{practiceSteps.map(renderStepItem)}</div>
        </div>
      </div>

      {/* AI Tutor Assistant Call Footer Card */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                Tutor AI Mr. Khoirul
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {isCalling ? "Sedang Berlangsung..." : "Tanya materi & pelafalan"}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={(e) => {
              animeButtonPop(e.currentTarget);
              onToggleCall();
            }}
            className={`w-full gap-2 text-xs font-bold shadow-xs ${
              isCalling
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{isCalling ? "Tutup Panggilan" : "Panggil AI Tutor"}</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar (lg and above) */}
      <aside className="hidden lg:block w-80 shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Below lg) */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          />

          {/* Slide-over panel */}
          <div className="relative w-80 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
