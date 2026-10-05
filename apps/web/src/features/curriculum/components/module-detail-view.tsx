"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Award, PhoneCall, Menu } from "lucide-react";
import {
  SectionTheoryUnified,
  SectionSpeakingLab,
  SectionQuiz,
  QuestionResult,
  ModuleLessonSidebar,
  ModuleStepFooter,
  MODULE_STEPS,
  ModuleVoiceDock,
} from "@/components/modules";
import { Badge } from "@/components/ui/badge";
import { useModuleTutor } from "@/hooks/use-module-tutor";
import {
  getModuleDetailAction,
  submitModuleQuizAction,
  saveModuleStepProgressAction,
} from "@/app/(student)/modules/modules.actions";

interface ModuleDetailViewProps {
  moduleId: string;
}

export function ModuleDetailView({ moduleId }: ModuleDetailViewProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [moduleData, setModuleData] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [studentName, setStudentName] = useState("");
  const [userId, setUserId] = useState("");

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [unlockedStep, setUnlockedStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const [isPracticeUnlocked, setIsPracticeUnlocked] = useState(false);
  const [isSpeakingComplete, setIsSpeakingComplete] = useState(false);
  const [speakingScore, setSpeakingScore] = useState<number>(85);

  const isLoadedRef = useRef(false);

  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    submitted: boolean;
    score: number | null;
    quizScore?: number;
    speakingScore?: number | null;
    passed: boolean;
    results: QuestionResult[];
  }>({
    submitted: false,
    score: null,
    passed: false,
    results: [],
  });

  const tutor = useModuleTutor({
    moduleId,
    studentName,
    userId,
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getModuleDetailAction(moduleId);

        if (res.success && res.data) {
          setModuleData(res.data.module);
          setSections(res.data.sections || []);
          if (res.user) {
            setUserId(res.user.id);
            setStudentName(res.user.name);
          }

          if (res.data.userProgress?.status === "completed") {
            setIsPracticeUnlocked(true);
            setIsSpeakingComplete(true);
            setUnlockedStep(8);
            setCompletedSteps([1, 2, 3, 4, 5, 6, 7, 8]);
            setQuizResult({
              submitted: true,
              score: res.data.userProgress.score,
              passed: true,
              results: [],
            });
          } else {
            const dbProgress = res.data.userProgress?.stepProgress;
            let localProgress = null;
            try {
              const saved = localStorage.getItem(`module_step_${moduleId}`);
              if (saved) localProgress = JSON.parse(saved);
            } catch {}

            const activeProgress = dbProgress || localProgress;
            if (activeProgress) {
              if (activeProgress.unlockedStep) {
                setUnlockedStep(Math.min(8, Math.max(1, activeProgress.unlockedStep)));
              }
              if (activeProgress.currentStep) {
                setCurrentStep(Math.min(8, Math.max(1, activeProgress.currentStep)));
              }
              if (Array.isArray(activeProgress.completedSteps)) {
                setCompletedSteps(activeProgress.completedSteps);
              }
              if (activeProgress.isPracticeUnlocked) {
                setIsPracticeUnlocked(true);
              }
              if (activeProgress.isSpeakingComplete) {
                setIsSpeakingComplete(true);
              }
            }
          }
        }
      } catch (err) {
        console.error("Gagal memuat detail modul:", err);
      } finally {
        setLoading(false);
        setTimeout(() => {
          isLoadedRef.current = true;
        }, 500);
      }
    }

    if (moduleId) {
      loadData();
    }
  }, [moduleId]);

  useEffect(() => {
    if (!isLoadedRef.current || loading || !moduleId || quizResult.passed) return;

    const payload = {
      currentStep,
      unlockedStep,
      completedSteps,
      isPracticeUnlocked,
      isSpeakingComplete,
    };

    try {
      localStorage.setItem(`module_step_${moduleId}`, JSON.stringify(payload));
    } catch {}

    const timer = setTimeout(() => {
      saveModuleStepProgressAction(moduleId, payload).catch((err) => {
        console.warn("Auto-save progress error:", err);
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    currentStep,
    unlockedStep,
    completedSteps,
    isPracticeUnlocked,
    isSpeakingComplete,
    loading,
    moduleId,
    quizResult.passed,
  ]);

  const handleSelectAnswer = (qId: string | number, optionIndex: number) => {
    const key = qId !== undefined && qId !== null ? qId.toString() : optionIndex.toString();
    setUserAnswers((prev) => ({
      ...prev,
      [key]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      setIsSubmitting(true);
      const res = await submitModuleQuizAction(moduleId, userAnswers, speakingScore);

      if (res.success && res.data) {
        setQuizResult({
          submitted: true,
          score: res.data.score,
          quizScore: res.data.quizScore,
          speakingScore: res.data.speakingScore,
          passed: res.data.passed,
          results: res.data.results || [],
        });
        if (res.data.passed) {
          setCompletedSteps((prev) => Array.from(new Set([...prev, 8])));
          try {
            localStorage.removeItem(`module_step_${moduleId}`);
          } catch {}
        }
      } else {
        alert(res.error || "Gagal mengirim kuis");
      }
    } catch (err) {
      console.error("Gagal mengirim kuis:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryQuiz = () => {
    setUserAnswers({});
    setQuizResult({
      submitted: false,
      score: null,
      passed: false,
      results: [],
    });
  };

  const handleSelectStep = (stepNumber: number) => {
    if (stepNumber <= unlockedStep) {
      setCurrentStep(stepNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextStep = () => {
    setCompletedSteps((prev) => Array.from(new Set([...prev, currentStep])));

    if (currentStep < 8) {
      const next = currentStep + 1;
      setUnlockedStep((prev) => Math.max(prev, next));
      if (currentStep === 6) {
        setIsPracticeUnlocked(true);
      }
      setCurrentStep(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Menyiapkan workspace modul...</p>
        </div>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <BookOpen className="w-10 h-10 text-slate-400 mb-2" />
        <h2 className="text-base font-bold text-slate-800 dark:text-white mb-2">
          Modul Tidak Ditemukan
        </h2>
        <Link
          href="/modules"
          className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
        >
          Kembali ke Daftar Modul
        </Link>
      </div>
    );
  }

  const theorySection = sections.find((s) => s.sectionType === "theory");
  const vocabSection = sections.find((s) => s.sectionType === "vocab");
  const dialogueSection = sections.find((s) => s.sectionType === "dialogue");
  const practiceSection = sections.find((s) => s.sectionType === "practice");
  const quizSection = sections.find((s) => s.sectionType === "quiz");

  const currentStepDef = MODULE_STEPS.find((s) => s.stepNumber === currentStep);

  let canAdvance = true;
  let advanceTooltip: string | undefined;

  if (currentStep === 6 && !isPracticeUnlocked) {
    canAdvance = false;
    advanceTooltip = "Selesaikan percobaan mini-trial untuk membuka Speaking Lab";
  } else if (currentStep === 7 && !isSpeakingComplete) {
    canAdvance = false;
    advanceTooltip = "Selesaikan praktikum berbicara untuk membuka Kuis Evaluasi";
  } else if (currentStep === 8) {
    canAdvance = false;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
      <ModuleLessonSidebar
        moduleTitle={moduleData.title}
        orderIndex={moduleData.orderIndex}
        cefr={moduleData.cefr}
        levelId={moduleData.levelId}
        isExam={moduleData.isExam}
        currentStep={currentStep}
        unlockedStep={unlockedStep}
        completedSteps={completedSteps}
        onSelectStep={handleSelectStep}
        isCalling={tutor.isCalling}
        onToggleCall={tutor.handleToggleCall}
        isOpenMobile={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Buka Daftar Langkah"
              aria-label="Buka Daftar Langkah"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block truncate uppercase tracking-wider">
                Langkah {currentStep}/8: {currentStepDef?.title}
              </span>
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                {moduleData.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
              {moduleData.cefr}
            </Badge>
            <button
              type="button"
              onClick={tutor.handleToggleCall}
              className={`p-2 rounded-xl transition-colors ${
                tutor.isCalling
                  ? "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                  : "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
              }`}
              title="Panggil AI Tutor"
              aria-label="Panggil AI Tutor"
            >
              <PhoneCall className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="hidden lg:flex items-center justify-between px-8 sm:px-12 py-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-20">
          <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              Modul {moduleData.orderIndex} ({moduleData.cefr})
            </span>
            <span>/</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Langkah {currentStep}: {currentStepDef?.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {moduleData.isExam && (
              <Badge variant="accent" className="text-xs font-bold gap-1">
                <Award className="w-3.5 h-3.5" />
                Ujian Kelulusan
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs font-semibold">
              {currentStepDef?.phase === "theory" ? "Fase 1: Teori & Konsep" : "Fase 2: Praktikum & Evaluasi"}
            </Badge>
          </div>
        </div>

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 md:px-10 py-8 sm:py-12 flex flex-col justify-between">
          <div className="min-w-0">
            {currentStep <= 6 && (
              <SectionTheoryUnified
                title={moduleData.title}
                theoryContent={theorySection?.content}
                vocabItems={vocabSection?.content?.items || []}
                dialogueContext={dialogueSection?.content?.context}
                dialogueLines={dialogueSection?.content?.lines || dialogueSection?.content?.dialogue || []}
                onPlayAudio={tutor.playTutorAudio}
                onAdvanceToPractice={() => {
                  setIsPracticeUnlocked(true);
                  setCompletedSteps((prev) => Array.from(new Set([...prev, 6])));
                  setUnlockedStep((prev) => Math.max(prev, 7));
                  setCurrentStep(7);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                isPracticeUnlocked={isPracticeUnlocked}
                objective={moduleData.objective}
                cefr={moduleData.cefr}
                orderIndex={moduleData.orderIndex}
                activeStep={currentStep}
                onStepComplete={(s) => {
                  setCompletedSteps((prev) => Array.from(new Set([...prev, s])));
                  setUnlockedStep((prev) => Math.max(prev, s + 1));
                }}
                onNextStep={handleNextStep}
              />
            )}

            {currentStep === 7 && practiceSection && (
              <div className="animate-in fade-in duration-300">
                <SectionSpeakingLab
                  title={practiceSection.title}
                  drills={practiceSection.content?.drills || []}
                  roleplay={practiceSection.content?.roleplay || { context: "", roles: [], turns: [] }}
                  challenge={practiceSection.content?.challenge || { scenario: "" }}
                  vocabItems={vocabSection?.content?.items || []}
                  moduleId={moduleId}
                  userId={userId}
                  onPlayAudio={tutor.playTutorAudio}
                  onSpeakingComplete={(score, isComplete) => {
                    setSpeakingScore(score);
                    setIsSpeakingComplete(isComplete);
                    setCompletedSteps((prev) => Array.from(new Set([...prev, 7])));
                    setUnlockedStep((prev) => Math.max(prev, 8));
                  }}
                  onAdvanceToQuiz={() => {
                    setCompletedSteps((prev) => Array.from(new Set([...prev, 7])));
                    setUnlockedStep((prev) => Math.max(prev, 8));
                    setCurrentStep(8);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}

            {currentStep === 8 && quizSection && (
              <div className="animate-in fade-in duration-300">
                <SectionQuiz
                  title={quizSection.title}
                  questions={quizSection.content?.questions || []}
                  passingScore={moduleData.passingScore || 70}
                  userAnswers={userAnswers}
                  isSubmitted={quizResult.submitted}
                  isSubmitting={isSubmitting}
                  score={quizResult.score}
                  quizScore={quizResult.quizScore}
                  speakingScore={quizResult.speakingScore ?? (isSpeakingComplete ? speakingScore : null)}
                  passed={quizResult.passed}
                  results={quizResult.results}
                  isExam={moduleData.isExam}
                  onSelectAnswer={handleSelectAnswer}
                  onSubmit={handleSubmitQuiz}
                  onRetry={handleRetryQuiz}
                  onContinue={() => router.push(moduleData.levelId ? `/modules?level=${moduleData.levelId}` : "/modules")}
                />
              </div>
            )}
          </div>

          <ModuleStepFooter
            currentStep={currentStep}
            totalSteps={8}
            canAdvance={canAdvance}
            advanceTooltip={advanceTooltip}
            onPrev={handlePrevStep}
            onNext={handleNextStep}
          />
        </main>
      </div>

      {(tutor.isCalling || tutor.isChatOpen) && (
        <ModuleVoiceDock
          moduleTitle={moduleData.title}
          isCalling={tutor.isCalling}
          isSpeaking={tutor.isSpeaking}
          isListening={tutor.isListening}
          isThinking={tutor.isThinking}
          isChatOpen={tutor.isChatOpen}
          messages={tutor.tutorMessages}
          inputText={tutor.inputText}
          onInputChange={tutor.setInputText}
          onSendMessage={() => tutor.handleSendTutorMessage()}
          onToggleCall={tutor.handleToggleCall}
          onToggleMic={tutor.handleToggleMic}
          onToggleChat={tutor.handleToggleChat}
          onPlayAudio={tutor.playTutorAudio}
          onBack={handlePrevStep}
          onForward={handleNextStep}
        />
      )}
    </div>
  );
}
