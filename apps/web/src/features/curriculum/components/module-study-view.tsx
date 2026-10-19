"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { StudentShell } from "@/features/dashboard";
import { ModuleStagePlaylist, PlaylistStepItem } from "./module-stage-playlist";
import { SidebarArcadeCompanion } from "./companion/sidebar-arcade-companion";
import { ModuleStageViewport } from "./module-stage-viewport";
import { ModuleMissionsHub } from "./module-missions-hub";
import { SubmoduleTutorWelcomeStage } from "./submodule-tutor-welcome-stage";
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { submitSubModuleAction } from "@/app/(student)/modules/modules.actions";
import { playFanfareSound } from "@/lib/sound-fx";

interface ModuleStudyViewProps {
  moduleId: string;
  moduleData: any;
  subModules: any[];
  userId: string;
  studentName: string;
  tutor: any;
  onRefresh?: () => void;
}

const SKILL_ICONS: Record<string, React.ReactNode> = {
  reading: <BookOpen className="w-3.5 h-3.5" />,
  listening: <Headphones className="w-3.5 h-3.5" />,
  writing: <PenTool className="w-3.5 h-3.5" />,
  speaking: <Mic className="w-3.5 h-3.5" />,
};

const SKILL_LABELS: Record<string, string> = {
  reading: "Reading Mission",
  listening: "Listening Mission",
  writing: "Writing Mission",
  speaking: "Speaking Lab",
};

export function ModuleStudyView({
  moduleId,
  moduleData,
  subModules = [],
  userId,
  studentName,
  tutor,
  onRefresh,
}: ModuleStudyViewProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);
  // Default to null so module opens the onboarding missions hub first
  const [activeMissionId, setActiveMissionId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("mission") || params.get("subModule") || null;
    }
    return null;
  });
  const [activeStepId, setActiveStepId] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);
  const [isCurrentStepComplete, setIsCurrentStepComplete] = useState(false);
  const [isOnboardingBriefing, setIsOnboardingBriefing] = useState(false);
  const [xpPoints, setXpPoints] = useState(35);
  const [combo, setCombo] = useState(1);
  const [isFinishing, setIsFinishing] = useState(false);

  const selectedSubIndex = useMemo(() => {
    const idx = subModules.findIndex((s) => s.id === activeMissionId);
    return idx >= 0 ? idx : 0;
  }, [subModules, activeMissionId]);

  const currentSub = subModules[selectedSubIndex] || subModules[0];
  const skillType = currentSub?.skillType || "reading";

  const theorySec = currentSub?.sections?.find((s: any) => s.sectionType === "theory");
  const vocabSec = currentSub?.sections?.find((s: any) => s.sectionType === "vocab");
  const dialogueSec = currentSub?.sections?.find((s: any) => s.sectionType === "dialogue");
  const practiceSec = currentSub?.sections?.find((s: any) => s.sectionType === "practice");
  const quizSec = currentSub?.sections?.find((s: any) => s.sectionType === "quiz");

  // Dynamic playlist steps uniquely customized for each skill type
  const playlistSteps: PlaylistStepItem[] = useMemo(() => {
    if (skillType === "assessment" || skillType === "exam") {
      return [
        { id: 1, title: "1. Panduan & Kriteria Kelulusan", type: "Overview", duration: "3 min", isCompleted: completedSteps.includes(1) },
        { id: 2, title: "2. Part 1: Reading Comprehension (15 Soal)", type: "Reading", duration: "12 min", isCompleted: completedSteps.includes(2) },
        { id: 3, title: "3. Part 2: Listening Auditory (15 Soal)", type: "Listening", duration: "12 min", isCompleted: completedSteps.includes(3) },
        { id: 4, title: "4. Part 3: Written Production (10 Soal)", type: "Writing", duration: "10 min", isCompleted: completedSteps.includes(4) },
        { id: 5, title: "5. Part 4: Spoken Fluency (15 Soal)", type: "Speaking", duration: "12 min", isCompleted: completedSteps.includes(5) },
        { id: 6, title: "6. Scorecard & Sertifikat Resmi", type: "Certificate", duration: "3 min", isCompleted: completedSteps.includes(6) },
      ];
    }

    if (skillType === "listening") {
      return [
        { id: 1, title: "1. Scenario & Briefing", type: "Context", duration: "3 min", isCompleted: completedSteps.includes(1) },
        { id: 2, title: "2. Multi-Speaker Audio Player", type: "Dialogue", duration: "6 min", isCompleted: completedSteps.includes(2) },
        { id: 3, title: "3. Spoken Contraction Trainer", type: "Ear Trainer", duration: "4 min", isCompleted: completedSteps.includes(3) },
        { id: 4, title: "4. Audio Dictation & Echo", type: "Practice", duration: "5 min", isCompleted: completedSteps.includes(4) },
        { id: 5, title: "5. Listening Practicum (10 Tasks)", type: "Practicum", duration: "6 min", isCompleted: completedSteps.includes(5) },
      ];
    }

    if (skillType === "writing") {
      return [
        { id: 1, title: "1. Sentence Anatomy Formula", type: "Mechanics", duration: "3 min", isCompleted: completedSteps.includes(1) },
        { id: 2, title: "2. Spot & Fix Writing Mechanics", type: "Interactive", duration: "4 min", isCompleted: completedSteps.includes(2) },
        { id: 3, title: "3. Word Chip Sentence Builder", type: "Mini-Game", duration: "5 min", isCompleted: completedSteps.includes(3) },
        { id: 4, title: "4. Profile Writing Lab", type: "Writing Lab", duration: "6 min", isCompleted: completedSteps.includes(4) },
        { id: 5, title: "5. Writing Syntax Evaluation", type: "Evaluation", duration: "5 min", isCompleted: completedSteps.includes(5) },
      ];
    }

    if (skillType === "speaking") {
      return [
        { id: 1, title: "1. Intonation & Pitch Guide", type: "Phonetics", duration: "3 min", isCompleted: completedSteps.includes(1) },
        { id: 2, title: "2. Syllable Stress Rhythm Drills", type: "Rhythm Pads", duration: "4 min", isCompleted: completedSteps.includes(2) },
        { id: 3, title: "3. Oral Reflex Sentence Drills", type: "Listen & Repeat", duration: "5 min", isCompleted: completedSteps.includes(3) },
        { id: 4, title: "4. Live AI Tutor Roleplay", type: "Voice Call", duration: "6 min", isCompleted: completedSteps.includes(4) },
        { id: 5, title: "5. Speaking Mastery Evaluation", type: "Assessment", duration: "4 min", isCompleted: completedSteps.includes(5) },
      ];
    }

    // Default: reading (Natural Pedagogical Flow: Vocab -> Story -> Puzzle -> Grammar -> Quiz)
    return [
      { id: 1, title: "1. Mission Briefing & Story Context", type: "Overview", duration: "3 min", isCompleted: completedSteps.includes(1) },
      { id: 2, title: "2. 3D Key Vocab Flashcards", type: "Interactive", duration: "4 min", isCompleted: completedSteps.includes(2) },
      { id: 3, title: "3. Guided Karaoke Reading", type: "Audio Read", duration: "6 min", isCompleted: completedSteps.includes(3) },
      { id: 4, title: "4. Match Madness Game", type: "Mini-Game", duration: "5 min", isCompleted: completedSteps.includes(4) },
      { id: 5, title: "5. Contraction Morpher Machine", type: "Grammar Lab", duration: "4 min", isCompleted: completedSteps.includes(5) },
      { id: 6, title: "6. Grammar Rules & Formulas", type: "Theory", duration: "5 min", isCompleted: completedSteps.includes(6) },
      { id: 7, title: "7. Reading Comprehension Quiz", type: "Evaluation", duration: "5 min", isCompleted: completedSteps.includes(7) },
    ];
  }, [skillType, completedSteps]);

  const canProceed = isCurrentStepComplete || completedSteps.includes(activeStepId) || activeStepId === 1;

  const handleStepComplete = () => {
    setIsCurrentStepComplete(true);
    setCompletedSteps((prev) => Array.from(new Set([...prev, activeStepId])));
  };

  const maxCompletedStep = completedSteps.length > 0 ? Math.max(...completedSteps) : 1;

  const handleSelectStep = (stepId: number) => {
    if (stepId > maxCompletedStep + 1 && !completedSteps.includes(stepId)) {
      return;
    }
    setActiveStepId(stepId);
    setIsCurrentStepComplete(completedSteps.includes(stepId) || stepId === 1);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleNextStep = async () => {
    if (!canProceed) return;

    setCompletedSteps((prev) => Array.from(new Set([...prev, activeStepId])));
    setXpPoints((prev) => prev + 15);

    if (activeStepId < playlistSteps.length) {
      const nextId = activeStepId + 1;
      setActiveStepId(nextId);
      setIsCurrentStepComplete(completedSteps.includes(nextId));
      window.scrollTo({ top: 120, behavior: "smooth" });
    } else {
      // Step completed -> Finish mission, mark completed, & return to Floating Cards Hub!
      try {
        setIsFinishing(true);
        if (currentSub?.id) {
          await submitSubModuleAction(currentSub.id, { score: 100 });
          playFanfareSound();
          onRefresh?.();
        }
      } catch (err) {
        console.error("Failed to submit submodule:", err);
      } finally {
        setIsFinishing(false);
        setActiveMissionId(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handlePrevStep = () => {
    if (activeStepId > 1) {
      const prevId = activeStepId - 1;
      setActiveStepId(prevId);
      setIsCurrentStepComplete(completedSteps.includes(prevId) || prevId === 1);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  return (
    <StudentShell
      studentName={studentName}
      currentCefr={moduleData?.cefr || "A1.1"}
    >
      <div className="px-3 py-2.5 sm:px-6 sm:py-3.5 w-full max-w-[1520px] mx-auto space-y-3.5 pb-8 sm:pb-0">
          {/* VIEW A: Floating Skill Cards Hub (Before Entering Sub-Module) */}
          {!activeMissionId ? (
            <ModuleMissionsHub
              moduleData={moduleData}
              subModules={subModules}
              tutor={tutor}
              onSelectMission={(missionId) => {
                setActiveMissionId(missionId);
                setIsOnboardingBriefing(true);
                setActiveStepId(1);
                setCompletedSteps([1]);
                setIsCurrentStepComplete(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          ) : isOnboardingBriefing ? (
            /* VIEW B: Sub-Module Onboarding Briefing with 3D Animated Mr. Khoirul */
            <SubmoduleTutorWelcomeStage
              moduleData={moduleData}
              subModule={currentSub}
              studentName={studentName}
              onStartMission={() => {
                setIsOnboardingBriefing(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onBackToMissions={() => {
                setActiveMissionId(null);
                setIsOnboardingBriefing(false);
              }}
            />
          ) : (
            /* VIEW C: Active Mission Stage Player (2-Column LMS Layout) */
            <div className="space-y-3.5 animate-in fade-in duration-300">
              {/* Demia Header (Breadcrumb, Title, Metadata & Mission Switcher) */}
              <div className="space-y-2 border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
                {/* 1. Breadcrumb & Actions Row with Left Back Button */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Left Back Button */}
                    <button
                      type="button"
                      onClick={() => setActiveMissionId(null)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs border border-slate-200/60 dark:border-slate-700/60"
                      title="Back to Sub-Modules"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                      <span>Back</span>
                    </button>

                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Link href="/modules" className="hover:text-slate-800 dark:hover:text-white transition-colors">
                        Courses
                      </Link>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setActiveMissionId(null)}
                        className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                        title="Back to Sub-Modules"
                      >
                        {moduleData?.title || `Module ${moduleData?.orderIndex || 1}`}
                      </button>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-blue-600 dark:text-blue-400 font-semibold capitalize">
                        {currentSub?.skillType || currentSub?.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Title & Metadata Row (Gambar 1 style) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {currentSub?.title}
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-normal flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        CEFR {moduleData?.cefr || "A1.1"}
                      </span>
                      <span>{playlistSteps.length} Learning Steps</span>
                      <span>Est. 25 Minutes</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsOnboardingBriefing(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer shadow-2xs"
                      title="Re-open topic briefing"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Topic Briefing</span>
                    </button>

                    {currentSub?.userProgress?.status === "completed" && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200/70 dark:border-emerald-800/60 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mission Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2-Column Side-by-Side Learning Layout */}
              <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
                {/* Left Column (Wide): Primary Interactive Learning Stage */}
                <div className="w-full lg:flex-1 space-y-4 sm:space-y-6 min-w-0">
                  {/* Mobile-Only Horizontal Step Stepper (<lg) */}
                  <div className="lg:hidden p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-500">
                      <span>Langkah {activeStepId} dari {playlistSteps.length}</span>
                      <span className="text-[#0D3B66] font-mono truncate max-w-[200px]">
                        {playlistSteps.find((s) => s.id === activeStepId)?.title.replace(/^\d+\.\s*/, "")}
                      </span>
                    </div>
                    <div
                      className="grid gap-1.5"
                      style={{ gridTemplateColumns: `repeat(${playlistSteps.length}, minmax(0, 1fr))` }}
                    >
                      {playlistSteps.map((s) => {
                        const isActive = s.id === activeStepId;
                        const isDone = completedSteps.includes(s.id);
                        const isAccessible = s.id <= maxCompletedStep + 1 || isDone;

                        return (
                          <button
                            key={s.id}
                            type="button"
                            disabled={!isAccessible}
                            onClick={() => handleSelectStep(s.id)}
                            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 min-h-[42px] touch-manipulation active:scale-95 ${
                              isActive
                                ? "bg-[#0D3B66] text-white shadow-xs font-black ring-2 ring-[#0D3B66]/30 dark:ring-[#F4B41A]/50"
                                : isDone
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-pointer"
                                : isAccessible
                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                                : "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed opacity-40"
                            }`}
                          >
                            {isDone && !isActive ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            ) : !isAccessible ? (
                              <Lock className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                            ) : null}
                            <span className="font-mono text-xs">{s.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary Learning Stage Window */}
                  <ModuleStageViewport
                    skillType={skillType}
                    activeStepId={activeStepId}
                    totalSteps={playlistSteps.length}
                    onPrevStep={handlePrevStep}
                    onNextStep={handleNextStep}
                    canProceed={canProceed}
                    onStepComplete={handleStepComplete}
                    onRewardXp={(amt) => setXpPoints((p) => p + amt)}
                    onIncrementCombo={() => setCombo((c) => c + 1)}
                    onResetCombo={() => setCombo(1)}
                    theorySec={theorySec}
                    vocabSec={vocabSec}
                    dialogueSec={dialogueSec}
                    practiceSec={practiceSec}
                    quizSec={quizSec}
                    tutor={tutor}
                    cefr={moduleData?.cefr}
                    isFinishing={isFinishing}
                    moduleData={moduleData}
                    studentName={studentName}
                  />
                </div>

                {/* Right Column: Clean Sticky Playlist Sidebar (Hidden on Mobile, Sticky on Desktop) */}
                <aside className="hidden lg:block w-[280px] xl:w-[300px] shrink-0 lg:sticky lg:top-3 lg:self-start space-y-2">
                  <ModuleStagePlaylist
                    steps={playlistSteps}
                    activeStepId={activeStepId}
                    onSelectStep={handleSelectStep}
                    maxAccessibleStepId={maxCompletedStep + 1}
                    xpPoints={xpPoints}
                    completedCount={completedSteps.length}
                    totalCount={playlistSteps.length}
                  />

                  {/* Free-roaming mini Mr. Khoirul (Bebas jalan di area sidebar, tidak dikurung dalam box) */}
                  <SidebarArcadeCompanion />
                </aside>
              </div>
            </div>
          )}
        </div>
    </StudentShell>
  );
}
