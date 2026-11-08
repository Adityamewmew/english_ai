"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { StudentShell } from "@/features/dashboard";
import { ModuleStagePlaylist, PlaylistStepItem } from "./module-stage-playlist";
import { SidebarArcadeCompanion } from "./companion/sidebar-arcade-companion";
import { ModuleStageViewport } from "./module-stage-viewport";
import { ModuleMissionsHub } from "./module-missions-hub";
import { SubmoduleTutorWelcomeStage } from "./submodule-tutor-welcome-stage";
import {
  BookOpen, Headphones, PenTool, Mic, ChevronRight, ArrowLeft, CheckCircle2, Lock, RotateCcw,
} from "lucide-react";
import { submitSubModuleAction } from "@/app/(student)/modules/modules.actions";
import { playFanfareSound } from "@/lib/sound-fx";
import { stopTutorSpeech } from "@/lib/tutor-voice";
import { useSession } from "@/features/auth/hooks/use-session";
import { isUserAdmin } from "@/lib/auth-utils";
import { getPlaylistSteps, countExamAnswers } from "../utils/module-study-utils";
import { ExamSubmitConfirmModal } from "./exam/exam-submit-confirm-modal";
import { SubmoduleResultModal } from "./submodule-result-modal";

interface ModuleStudyViewProps {
  moduleId: string;
  moduleData: any;
  subModules: any[];
  userId: string;
  studentName: string;
  currentUser?: any;
  isAdmin?: boolean;
  tutor: any;
  onRefresh?: () => void;
}

export function ModuleStudyView({
  moduleId,
  moduleData,
  subModules = [],
  userId,
  studentName,
  currentUser,
  isAdmin: propIsAdmin,
  tutor,
  onRefresh,
}: ModuleStudyViewProps) {
  const { data: sessionUser } = useSession();
  const isAdmin = Boolean(propIsAdmin || isUserAdmin(currentUser) || isUserAdmin(sessionUser));

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  // Validate that missionId from URL actually belongs to this module (Security IDOR / Tampering Guard)
  const [activeMissionId, setActiveMissionId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const paramId = params.get("mission") || params.get("subModule") || null;
      if (paramId && Array.isArray(subModules) && subModules.length > 0) {
        return subModules.some((s) => s.id === paramId) ? paramId : null;
      }
      return paramId;
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
  const [stageAnswers, setStageAnswers] = useState<Record<string, any>>({});
  const [stageSpeakingScore, setStageSpeakingScore] = useState<number | undefined>(undefined);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isExamConfirmOpen, setIsExamConfirmOpen] = useState(false);
  const [resultModalState, setResultModalState] = useState<{
    isOpen: boolean;
    score: number;
    passed: boolean;
    passingScore: number;
    questionResults?: any[];
  } | null>(null);

  // Two-way URL synchronization: keep browser URL in sync with active sub-module without page reload
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const u = new URL(window.location.href);
      if (activeMissionId) u.searchParams.set("subModule", activeMissionId);
      else u.searchParams.delete("subModule");
      u.searchParams.delete("mission");
      window.history.replaceState(null, "", activeMissionId ? u.toString() : u.pathname);
    } catch {}
  }, [activeMissionId]);

  // Warn user if leaving/refreshing while answering questions
  React.useEffect(() => {
    if (typeof window === "undefined" || !activeMissionId) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(stageAnswers).length > 0 && !isFinishing) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeMissionId, stageAnswers, isFinishing]);

  // Stop tutor speech immediately on unmount or when navigating back to missions hub
  React.useEffect(() => () => stopTutorSpeech(), [activeMissionId]);

  // Restore draft or reset when activeMissionId changes
  React.useEffect(() => {
    if (!activeMissionId || typeof window === "undefined") {
      setStageAnswers({});
      setStageSpeakingScore(undefined);
      return;
    }

    try {
      const saved = localStorage.getItem(`eddys_draft_${activeMissionId}`);
      if (saved) {
        const p = JSON.parse(saved);
        if (p && typeof p === "object") {
          if (typeof p.activeStepId === "number") setActiveStepId(p.activeStepId);
          if (Array.isArray(p.completedSteps)) setCompletedSteps(p.completedSteps);
          if (p.stageAnswers) setStageAnswers(p.stageAnswers);
          if (typeof p.stageSpeakingScore === "number") setStageSpeakingScore(p.stageSpeakingScore);
          setIsCurrentStepComplete(true);
          const t = new Date(p.timestamp || Date.now());
          setLastSavedTime(t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          return;
        }
      }
    } catch {}

    setStageAnswers({});
    setStageSpeakingScore(undefined);
  }, [activeMissionId]);

  // Debounced auto-save draft to localStorage whenever in-mission progress updates
  React.useEffect(() => {
    if (!activeMissionId || typeof window === "undefined") return;
    const timer = setTimeout(() => {
      try {
        const draft = { activeStepId, completedSteps, stageAnswers, stageSpeakingScore, timestamp: Date.now() };
        localStorage.setItem(`eddys_draft_${activeMissionId}`, JSON.stringify(draft));
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch {}
    }, 400);

    return () => clearTimeout(timer);
  }, [activeMissionId, activeStepId, completedSteps, stageAnswers, stageSpeakingScore]);

  const currentSub = useMemo(() => {
    return subModules.find((s) => s.id === activeMissionId) || subModules[0];
  }, [subModules, activeMissionId]);
  const skillType = currentSub?.skillType || "reading";

  const sec = currentSub?.sections || [];
  const theorySec = sec.find((s: any) => s.sectionType === "theory");
  const vocabSec = sec.find((s: any) => s.sectionType === "vocab");
  const dialogueSec = sec.find((s: any) => s.sectionType === "dialogue");
  const practiceSec = sec.find((s: any) => s.sectionType === "practice");
  const quizSec = sec.find((s: any) => s.sectionType === "quiz");

  const isExam = skillType === "assessment" || skillType === "exam";

  // Dynamic playlist steps uniquely customized for each skill type
  const playlistSteps: PlaylistStepItem[] = useMemo(() => {
    return getPlaylistSteps(skillType, completedSteps);
  }, [skillType, completedSteps]);

  const isExamEnd = isExam && activeStepId === playlistSteps.length;
  const canProceed = isAdmin || isCurrentStepComplete || (isExam ? false : completedSteps.includes(activeStepId)) || activeStepId === 1 || isExamEnd;

  const handleStepComplete = () => {
    setIsCurrentStepComplete(true);
    setCompletedSteps((prev) => Array.from(new Set([...prev, activeStepId])));
  };

  const maxCompletedStep = completedSteps.length > 0 ? Math.max(...completedSteps) : 1;

  const handleRetakeMission = useCallback((resetToStep1 = false) => {
    if (typeof window !== "undefined" && currentSub?.id) {
      try {
        if (resetToStep1) {
          localStorage.removeItem(`eddys_draft_${currentSub.id}`);
          localStorage.removeItem(`eddys_exam_timer_${currentSub.id}`);
          if (moduleId) localStorage.removeItem(`eddys_exam_timer_${moduleId}`);
        } else {
          localStorage.setItem(`eddys_draft_${currentSub.id}`, JSON.stringify({ activeStepId, completedSteps, stageAnswers: {}, stageSpeakingScore: undefined, timestamp: Date.now() }));
        }
      } catch {}
    }
    if (resetToStep1) { setActiveStepId(1); setCompletedSteps([1]); }
    setIsCurrentStepComplete(false); setStageAnswers({}); setStageSpeakingScore(undefined); setLastSavedTime(null); setResultModalState(null);
    window.scrollTo({ top: 120, behavior: "smooth" });
  }, [currentSub?.id, activeStepId, completedSteps, moduleId]);

  const handleCloseResultModal = useCallback(() => {
    if (typeof window !== "undefined" && currentSub?.id) {
      try {
        localStorage.removeItem(`eddys_draft_${currentSub.id}`);
        localStorage.removeItem(`eddys_exam_timer_${currentSub.id}`);
        if (moduleId) localStorage.removeItem(`eddys_exam_timer_${moduleId}`);
      } catch {}
    }
    setResultModalState(null); onRefresh?.(); setActiveMissionId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentSub?.id, onRefresh, moduleId]);

  const handleConfirmExamSubmit = () => {
    setIsExamConfirmOpen(false);
    setCompletedSteps((prev) => Array.from(new Set([...prev, 5])));
    setActiveStepId(6);
    setIsCurrentStepComplete(true);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleSelectStep = (stepId: number) => {
    if (!isAdmin && stepId > maxCompletedStep + 1 && !completedSteps.includes(stepId)) return;
    if (isExam && stepId === 6) {
      setIsExamConfirmOpen(true);
      return;
    }
    setActiveStepId(stepId);
    setIsCurrentStepComplete(isAdmin || (isExam ? false : completedSteps.includes(stepId)) || stepId === 1 || (isExam && stepId === playlistSteps.length));
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleNextStep = async () => {
    if (!canProceed) return;

    // Intercept submit on Step 5 of exam before transitioning to Step 6
    if (isExam && activeStepId === 5) {
      setIsExamConfirmOpen(true);
      return;
    }

    setCompletedSteps((prev) => Array.from(new Set([...prev, activeStepId])));
    setXpPoints((prev) => prev + 15);

    if (activeStepId < playlistSteps.length) {
      const nextId = activeStepId + 1;
      setActiveStepId(nextId);
      setIsCurrentStepComplete(isAdmin || completedSteps.includes(nextId) || (isExam && nextId === playlistSteps.length));
      window.scrollTo({ top: 120, behavior: "smooth" });
    } else {
      if (isExam) {
        setActiveMissionId(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      // Step completed -> Finish mission, mark completed, & return to Floating Cards Hub!
      try {
        setIsFinishing(true);
        if (currentSub?.id) {
          const res = await submitSubModuleAction(currentSub.id, { answers: stageAnswers, speakingScore: stageSpeakingScore }, moduleId);
          if (!res?.success) {
            alert(res?.error || "Gagal menyimpan progres. Jawaban Anda tetap tersimpan di perangkat ini. Silakan periksa koneksi atau login kembali.");
            return;
          }
          if (res?.data?.passed) {
            playFanfareSound();
            if (typeof window !== "undefined" && currentSub?.id) {
              try { localStorage.removeItem(`eddys_draft_${currentSub.id}`); } catch {}
            }
          }
          setResultModalState({
            isOpen: true, score: res.data?.score ?? 0,
            passed: Boolean(res?.data?.passed), passingScore: res.data?.passingScore ?? 75,
            questionResults: res.data?.questionResults || [],
          });
          onRefresh?.();
        }
      } catch (err) {
        console.error("Failed to submit submodule:", err);
        alert("Terjadi kendala koneksi saat menyimpan progres. Jawaban tetap tersimpan di perangkat.");
      } finally {
        setIsFinishing(false);
      }
    }
  };

  const handleExamSubmit = async (finalScore: number, examAnswers?: Record<string, any>) => {
    if (!currentSub?.id) return;
    try {
      setIsFinishing(true);
      const res = await submitSubModuleAction(currentSub.id, { score: finalScore, answers: examAnswers || {} }, moduleId);
      if (res?.success) {
        if (res.data?.passed) {
          playFanfareSound();
          if (typeof window !== "undefined" && currentSub?.id) {
            try {
              localStorage.removeItem(`eddys_draft_${currentSub.id}`);
              localStorage.removeItem(`eddys_exam_timer_${currentSub.id}`);
              if (moduleId) localStorage.removeItem(`eddys_exam_timer_${moduleId}`);
            } catch {}
          }
        }
        onRefresh?.();
      }
    } catch (err) {
      console.error("Failed to submit exam:", err);
    } finally {
      setIsFinishing(false);
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
      hideBottomNav={Boolean(activeMissionId && !isOnboardingBriefing)}
    >
      <div className="px-3 py-2.5 sm:px-6 sm:py-3.5 w-full max-w-[1520px] mx-auto space-y-3.5 pb-8 sm:pb-0">
          {/* VIEW A: Floating Skill Cards Hub (Before Entering Sub-Module) */}
          {!activeMissionId ? (
            <ModuleMissionsHub
              moduleData={moduleData}
              subModules={subModules}
              tutor={tutor}
              isAdmin={isAdmin}
              onSelectMission={(missionId) => {
                setActiveMissionId(missionId);
                let hasDraft = false;
                if (typeof window !== "undefined" && missionId) {
                  try {
                    const saved = localStorage.getItem(`eddys_draft_${missionId}`);
                    hasDraft = Boolean(saved && typeof JSON.parse(saved)?.activeStepId === "number");
                  } catch {}
                }
                if (!hasDraft) {
                  setIsOnboardingBriefing(true);
                  setActiveStepId(1);
                  setCompletedSteps([1]);
                  setIsCurrentStepComplete(false);
                } else {
                  setIsOnboardingBriefing(false);
                }
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
              onResetMission={() => {
                handleRetakeMission(true);
                setIsOnboardingBriefing(false);
              }}
              onBackToMissions={() => {
                setActiveMissionId(null);
                setIsOnboardingBriefing(false);
              }}
            />
          ) : (
            /* VIEW C: Active Mission Stage Player (2-Column LMS Layout) */
            <div className="space-y-3.5 pb-28 lg:pb-6 animate-in fade-in duration-300">
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

                    {lastSavedTime && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Tersimpan ({lastSavedTime})</span>
                      </div>
                    )}

                    {!isExam && (
                      <button
                        type="button"
                        onClick={() => window.confirm("Ulangi latihan dari awal? Progres langkah ini akan direset.") && handleRetakeMission(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-rose-700 hover:text-rose-800 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 cursor-pointer"
                        title="Reset latihan ke Langkah 1"
                      >
                        <RotateCcw className="w-3 h-3 text-rose-500" />
                        <span>Ulangi</span>
                      </button>
                    )}

                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Link href="/modules" className="hover:text-slate-800 dark:hover:text-white transition-colors">Courses</Link>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      <button type="button" onClick={() => setActiveMissionId(null)} className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
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
                    <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                      {currentSub?.title}
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-normal flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">CEFR {moduleData?.cefr || "A1.1"}</span>
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
                  {/* Mobile-Only Horizontal Stepper (<lg) */}
                  <div className="lg:hidden p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        Langkah {activeStepId} dari {playlistSteps.length}
                      </span>
                      <span className="text-[#0D3B66] dark:text-[#F4B41A] font-heading font-black truncate max-w-[200px] text-right">
                        {playlistSteps.find((s) => s.id === activeStepId)?.title.replace(/^\d+\.\s*/, "")}
                      </span>
                    </div>
                    {/* Modern Continuous Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0D3B66] to-[#1B4965] dark:from-[#F4B41A] dark:to-[#E5A817] transition-all duration-300 rounded-full"
                        style={{ width: `${Math.round((activeStepId / Math.max(1, playlistSteps.length)) * 100)}%` }}
                      />
                    </div>
                    {/* Horizontal scrollable step pills: min-w-[44px] min-h-[44px] touch targets */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
                      {playlistSteps.map((s) => {
                        const isActive = s.id === activeStepId;
                        const isDone = completedSteps.includes(s.id);
                        const isAccessible = isAdmin || s.id <= maxCompletedStep + 1 || isDone;

                        return (
                          <button
                            key={s.id}
                            type="button"
                            disabled={!isAccessible}
                            onClick={() => handleSelectStep(s.id)}
                            className={`flex-1 min-w-[44px] min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 touch-manipulation active:scale-95 ${
                              isActive
                                ? "bg-[#0D3B66] text-white shadow-sm font-black ring-2 ring-[#0D3B66]/30 dark:ring-[#F4B41A]/50"
                                : isDone
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                                : isAccessible
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                                : "bg-slate-50 dark:bg-slate-800/40 text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-800 cursor-not-allowed opacity-40"
                            }`}
                          >
                            {isDone && !isActive ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : null}
                            <span className="font-mono text-xs font-black">{s.id}</span>
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
                    theorySec={theorySec} vocabSec={vocabSec} dialogueSec={dialogueSec}
                    practiceSec={practiceSec} quizSec={quizSec} tutor={tutor} cefr={moduleData?.cefr}
                    isFinishing={isFinishing} moduleData={moduleData} studentName={studentName} isAdmin={isAdmin}
                    onSubmitExam={handleExamSubmit} initialAnswers={stageAnswers}
                    onAnswersChange={(ans, spk) => { setStageAnswers(ans); if (spk !== undefined) setStageSpeakingScore(spk); }}
                    onSelectStep={handleSelectStep}
                  />
                </div>

                {/* Right Column: Clean Sticky Playlist Sidebar (Hidden on Mobile, Sticky on Desktop) */}
                <aside className="hidden lg:block w-[280px] xl:w-[300px] shrink-0 lg:sticky lg:top-3 lg:self-start space-y-2">
                  <ModuleStagePlaylist
                    steps={playlistSteps}
                    activeStepId={activeStepId}
                    onSelectStep={handleSelectStep}
                    maxAccessibleStepId={isAdmin ? 999 : maxCompletedStep + 1}
                    xpPoints={xpPoints}
                    completedCount={completedSteps.length}
                    totalCount={playlistSteps.length}
                    isAdmin={isAdmin}
                  />

                  {/* Free-roaming mini Mr. Khoirul (Bebas jalan di area sidebar, tidak dikurung dalam box) */}
                  <SidebarArcadeCompanion />
                </aside>
              </div>
            </div>
          )}
        </div>

        {/* Global Intercept Modal: Confirms exam submission from bottom dock or sidebar */}
        <ExamSubmitConfirmModal
          isOpen={isExamConfirmOpen}
          onClose={() => setIsExamConfirmOpen(false)}
          onConfirm={handleConfirmExamSubmit}
          totalAnswered={countExamAnswers(stageAnswers)}
          grandTotal={55}
          isAdmin={isAdmin}
        />

        {/* Sub-Module Score Evaluation & Retake Modal */}
        <SubmoduleResultModal
          isOpen={Boolean(resultModalState?.isOpen)}
          score={resultModalState?.score ?? 0}
          passingScore={resultModalState?.passingScore ?? 75}
          subModuleTitle={currentSub?.title}
          questionResults={resultModalState?.questionResults}
          onRetake={() => handleRetakeMission(false)}
          onCloseToHub={handleCloseResultModal}
        />
    </StudentShell>
  );
}
