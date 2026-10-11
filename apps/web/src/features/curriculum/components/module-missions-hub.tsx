"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  ChevronRight,
  Lock,
  CheckCircle2,
  Play,
  Sparkles,
  Trophy,
  ArrowRight,
  Flame,
  Star,
  Compass,
  ShieldAlert,
} from "lucide-react";
import { animeButtonPop, animeShake } from "@/lib/anime-effects";
import { ModuleTutorCallBar } from "./module-tutor-about-card";

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
}

const TAROT_CONFIG: Record<
  string,
  {
    romanNumeral: string;
    arcanaTitle: string;
    subTitle: string;
    element: string;
    icon: React.ElementType;
    flavorQuote: string;
    archetypeDesc: string;
    duration: string;
    xpReward: number;
    gradientArch: string;
    sigilGlow: string;
    goldText: string;
  }
> = {
  reading: {
    romanNumeral: "I",
    arcanaTitle: "THE SCHOLAR",
    subTitle: "Reading & Lexicon",
    element: "LEXICON",
    icon: BookOpen,
    flavorQuote: "“Words unlock worlds unseen.”",
    archetypeDesc: "Decode international student profiles, match national origins, and awaken vocabulary reflexes.",
    duration: "8 Steps • ~25 min",
    xpReward: 120,
    gradientArch: "from-indigo-950 via-slate-900 to-indigo-900",
    sigilGlow: "bg-indigo-500/20 text-indigo-300 border-indigo-400/40 shadow-indigo-500/30",
    goldText: "text-amber-400",
  },
  listening: {
    romanNumeral: "II",
    arcanaTitle: "THE ORACLE",
    subTitle: "Auditory & Dialect",
    element: "HARMONY",
    icon: Headphones,
    flavorQuote: "“Listen closely to spoken truth.”",
    archetypeDesc: "Tune into native spoken cadences, track contractions in real-time, and capture natural speech nuances.",
    duration: "8 Steps • ~20 min",
    xpReward: 120,
    gradientArch: "from-purple-950 via-slate-900 to-fuchsia-950",
    sigilGlow: "bg-purple-500/20 text-purple-300 border-purple-400/40 shadow-purple-500/30",
    goldText: "text-purple-300",
  },
  writing: {
    romanNumeral: "III",
    arcanaTitle: "THE SCRIBE",
    subTitle: "Syntax & Construction",
    element: "SYNTAX",
    icon: PenTool,
    flavorQuote: "“Ink binds thoughts into power.”",
    archetypeDesc: "Forge grammatically sound sentences with interactive chips and craft expressive personal introductions.",
    duration: "8 Steps • ~20 min",
    xpReward: 120,
    gradientArch: "from-amber-950 via-slate-900 to-orange-950",
    sigilGlow: "bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-amber-500/30",
    goldText: "text-amber-400",
  },
  speaking: {
    romanNumeral: "IV",
    arcanaTitle: "THE HERALD",
    subTitle: "Acoustic Speaking Lab",
    element: "RESONANCE",
    icon: Mic,
    flavorQuote: "“Your voice commands the realm.”",
    archetypeDesc: "Converse directly with AI Tutor Mr. Khoirul. Practice oral country inquiries with instant feedback.",
    duration: "Live Lab • ~15 min",
    xpReward: 150,
    gradientArch: "from-emerald-950 via-slate-900 to-teal-950",
    sigilGlow: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-emerald-500/30",
    goldText: "text-emerald-400",
  },
};

export function ModuleMissionsHub({
  moduleData,
  subModules = [],
  tutor,
  onSelectMission,
}: ModuleMissionsHubProps) {
  const completedMissions = subModules.filter(
    (s) => s.userProgress?.status === "completed"
  ).length;
  const totalMissions = subModules.length || 4;
  const progressPercent = Math.round((completedMissions / Math.max(1, totalMissions)) * 100);

  const handleCardClick = (sub: SubModuleItem, isLocked: boolean, e: React.MouseEvent) => {
    if (isLocked) {
      animeShake(e.currentTarget as HTMLElement);
      return;
    }
    animeButtonPop(e.currentTarget as HTMLElement);
    onSelectMission(sub.id);
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* 1. Breadcrumb & Module Heading */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Link href="/dashboard" className="hover:text-slate-700 dark:hover:text-white transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link href="/modules" className="hover:text-slate-700 dark:hover:text-white transition-colors">
            Curriculum Modules
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-amber-500 dark:text-amber-400 font-mono font-bold">
            {moduleData?.id || "A1.1-M01"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Major Arcana Deck · CEFR {moduleData?.cefr || "A1.1"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {moduleData?.title || "Unit 1: One World: Countries, Nationalities & To Be"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Complete each Tarot Mission sequentially to master spoken and written English reflexes.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Top Voice Practice Call Banner (Mr. Khoirul AI Tutor) */}
      <ModuleTutorCallBar
        onStartCall={tutor.handleToggleCall}
        isCalling={tutor.isCalling}
      />

      {/* 3. Tarot Deck Progression Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle celestial backdrop */}
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1.5 max-w-xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-400 font-mono flex items-center gap-1.5">
              <span>✦</span> Arcana Awakening Sequence
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30">
              {completedMissions} of {totalMissions} Cards Awakened
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
            Master the Four Arcana to Unlock Speaking Fluency
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Begin with <span className="font-semibold text-amber-300">The Scholar (Reading)</span>. Each mastered card unlocks the next arcana, completing the four pillars of foundational mastery!
          </p>
        </div>

        {/* Progress Bar & Stat */}
        <div className="w-full md:w-64 space-y-2 shrink-0 relative z-10">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-slate-400">Deck Completion</span>
            <span className="text-amber-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. The 4 Gamified Tarot Cards (Major Arcana Spread) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch">
        {subModules.map((sub, idx) => {
          const cfg = TAROT_CONFIG[sub.skillType] || TAROT_CONFIG.reading;
          const Icon = cfg.icon;
          const status = sub.userProgress?.status || (idx === 0 ? "unlocked" : "locked");
          const isCompleted = status === "completed";
          const isLocked = status === "locked";
          const isUnlocked = status === "unlocked";

          return (
            <div
              key={sub.id}
              onClick={(e) => handleCardClick(sub, isLocked, e)}
              className={`group relative rounded-3xl p-5 sm:p-6 transition-all duration-500 flex flex-col justify-between select-none overflow-hidden min-h-[580px] ${
                isLocked
                  ? "bg-slate-900/80 border-2 border-slate-800/80 opacity-75 cursor-not-allowed text-slate-400"
                  : isCompleted
                  ? "bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-400/60 shadow-[0_4px_25px_rgba(16,185,129,0.15)] hover:shadow-[0_8px_35px_rgba(16,185,129,0.3)] hover:-translate-y-2 cursor-pointer text-white"
                  : "bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-400/60 shadow-[0_4px_30px_rgba(245,158,11,0.2)] hover:shadow-[0_12px_45px_rgba(245,158,11,0.35)] hover:-translate-y-2.5 cursor-pointer ring-1 ring-amber-400/30 text-white"
              }`}
            >
              {/* Holographic foil sweep effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-200/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

              {/* Inset Double Hairline Border (Classic Tarot Framed Style) */}
              <div
                className={`absolute inset-2.5 rounded-2xl border pointer-events-none transition-colors duration-300 ${
                  isLocked
                    ? "border-slate-800"
                    : isCompleted
                    ? "border-emerald-500/30"
                    : "border-amber-400/30 group-hover:border-amber-400/60"
                }`}
              />

              {/* 4 Corner Fleurons (✦) */}
              <span className="absolute top-3 left-3 text-[11px] font-serif text-amber-400/60 select-none pointer-events-none">✦</span>
              <span className="absolute top-3 right-3 text-[11px] font-serif text-amber-400/60 select-none pointer-events-none">✦</span>
              <span className="absolute bottom-3 left-3 text-[11px] font-serif text-amber-400/60 select-none pointer-events-none">✦</span>
              <span className="absolute bottom-3 right-3 text-[11px] font-serif text-amber-400/60 select-none pointer-events-none">✦</span>

              {/* SECTION A: Top Header - Roman Numeral & Arcana Title */}
              <div className="relative z-10 flex flex-col items-center text-center pt-2">
                {/* Roman Numeral Plate */}
                <div className="flex items-center justify-center gap-1.5 px-3 py-0.5 rounded-full border border-amber-400/40 bg-amber-400/10 mb-2">
                  <span className="text-[11px] font-serif font-black tracking-widest text-amber-300">
                    {cfg.romanNumeral}
                  </span>
                </div>

                <h3 className="font-serif font-black text-sm tracking-[0.2em] uppercase text-amber-300">
                  {cfg.arcanaTitle}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
                  {cfg.subTitle}
                </span>
              </div>

              {/* SECTION B: Central Archway (Tarot Portal/Medallion) */}
              <div className="relative z-10 my-4 mx-auto w-full max-w-[210px] aspect-[4/5] rounded-t-full rounded-b-2xl border border-amber-400/40 overflow-hidden flex flex-col items-center justify-center bg-slate-950 p-4 shadow-inner">
                {/* Celestial Aura Backdrop inside Arch */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${cfg.gradientArch} opacity-80`}
                />

                {/* Sacred Geometry Concentric Rings */}
                <div className="absolute inset-4 rounded-full border border-dashed border-amber-400/20 animate-spin-slow pointer-events-none" />
                <div className="absolute inset-8 rounded-full border border-amber-400/15 pointer-events-none" />

                {/* Center Tarot Icon / Sigil */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-transform duration-500 group-hover:scale-110 shadow-lg ${
                      isLocked
                        ? "bg-slate-900 border-slate-700 text-slate-500"
                        : isCompleted
                        ? "bg-emerald-950 border-emerald-400 text-emerald-300 shadow-emerald-500/30"
                        : `${cfg.sigilGlow} bg-slate-900/90`
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="w-7 h-7 text-slate-500" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 stroke-[2.5]" />
                    ) : (
                      <Icon className="w-8 h-8 stroke-[2.2]" />
                    )}
                  </div>

                  {/* Arcana Status Medallion */}
                  <div className="mt-3">
                    {isCompleted ? (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                        <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                        <span>Mastered</span>
                      </span>
                    ) : isUnlocked ? (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse">
                        <Sparkles className="w-3 h-3" />
                        <span>Awakened</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                        <Lock className="w-3 h-3" />
                        <span>Sealed</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION C: Lore Quote & Archetype Description */}
              <div className="relative z-10 space-y-2 text-center px-1">
                <p className="text-[11px] font-serif italic text-amber-200/80 leading-tight">
                  {cfg.flavorQuote}
                </p>
                <p className="text-xs text-slate-300/90 line-clamp-3 leading-relaxed">
                  {cfg.archetypeDesc}
                </p>
              </div>

              {/* SECTION D: RPG Attributes & Footer CTA */}
              <div className="relative z-10 pt-4 mt-3 border-t border-amber-400/20 space-y-3">
                {/* Elemental Badge & XP Bounty */}
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
                  <span className="text-amber-400/90 tracking-wider">
                    {cfg.element}
                  </span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Trophy className="w-3 h-3 text-amber-400" />
                    +{cfg.xpReward} XP
                  </span>
                </div>

                {/* Tarot Action Button */}
                {isLocked ? (
                  <button
                    type="button"
                    disabled
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-500 bg-slate-800/80 border border-slate-700/60 cursor-not-allowed select-none"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Sealed Arcana</span>
                  </button>
                ) : isCompleted ? (
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Review Arcana</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black tracking-wider uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.35)] transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Awaken Mission</span>
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
