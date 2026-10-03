"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Award,
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  Lock,
} from "lucide-react";
import {
  SectionTheoryUnified,
  SectionSpeakingLab,
  SectionQuiz,
  QuestionResult,
  ModuleVoiceDock,
} from "@/components/modules";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { animeButtonPop, animeShake } from "@/lib/anime-effects";
import { useModuleTutor } from "@/hooks/use-module-tutor";
import {
  getModuleDetailAction,
  submitModuleQuizAction,
} from "../modules.actions";

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [moduleData, setModuleData] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [studentName, setStudentName] = useState("");
  const [userId, setUserId] = useState("");

  // 1-Page 2-Phase Progressive States
  const [activePhase, setActivePhase] = useState<"theory" | "practice">("theory");
  const [isPracticeUnlocked, setIsPracticeUnlocked] = useState(false);

  // Speaking completion & score state for 60/40 hybrid evaluation
  const [isSpeakingComplete, setIsSpeakingComplete] = useState(false);
  const [speakingScore, setSpeakingScore] = useState<number>(85);
  const [gatingNotice, setGatingNotice] = useState<string | null>(null);

  // Quiz state
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

  // AI Tutor Hook with memory support
  const tutor = useModuleTutor({
    moduleId,
    studentName,
    userId,
  });

  // Load Module Data
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
            setQuizResult({
              submitted: true,
              score: res.data.userProgress.score,
              passed: true,
              results: [],
            });
          }
        }
      } catch (err) {
        console.error("Gagal memuat detail modul:", err);
      } finally {
        setLoading(false);
      }
    }

    if (moduleId) {
      loadData();
    }
  }, [moduleId]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Memuat modul pembelajaran...</p>
        </div>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
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

  // Extract Section by Type
  const theorySection = sections.find((s) => s.sectionType === "theory");
  const vocabSection = sections.find((s) => s.sectionType === "vocab");
  const dialogueSection = sections.find((s) => s.sectionType === "dialogue");
  const practiceSection = sections.find((s) => s.sectionType === "practice");
  const quizSection = sections.find((s) => s.sectionType === "quiz");

  const handleUnlockPractice = () => {
    setIsPracticeUnlocked(true);
    setActivePhase("practice");
    setGatingNotice(null);
    setTimeout(() => {
      document.getElementById("phase-practice")?.scrollIntoView({ behavior: "smooth" });
    }, 120);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between relative">
      <div>
        {/* Top Navbar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={moduleData.levelId ? `/modules?level=${moduleData.levelId}` : "/modules"}
                onClick={(e) => animeButtonPop(e.currentTarget)}
                className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>Modul {moduleData.orderIndex}</span>
                  <span>•</span>
                  <span>{moduleData.cefr}</span>
                </div>
                <h1 className="text-sm md:text-base font-bold text-slate-900 dark:text-white truncate max-w-xs md:max-w-md">
                  {moduleData.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {moduleData.isExam && (
                <Badge variant="outline" className="gap-1 bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border-amber-300 dark:border-amber-800 font-semibold">
                  <Award className="w-3.5 h-3.5" />
                  Ujian Kelulusan
                </Badge>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  animeButtonPop(e.currentTarget);
                  tutor.handleToggleCall();
                }}
                className="gap-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-xs font-semibold h-8 px-3"
                title="Panggilan AI Tutor"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Tutor Call</span>
              </Button>
            </div>
          </div>
        </header>

        {/* 2-Phase Progressive Progress Indicator */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                variant={activePhase === "theory" ? "default" : "secondary"}
                size="sm"
                onClick={(e) => {
                  animeButtonPop(e.currentTarget);
                  setActivePhase("theory");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 text-xs font-bold transition-all h-8 px-3.5 ${
                  activePhase === "theory"
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Fase 1: Teori & Pemahaman</span>
              </Button>

              <Button
                variant={activePhase === "practice" ? "default" : "secondary"}
                size="sm"
                onClick={(e) => {
                  if (!isPracticeUnlocked) {
                    animeShake(e.currentTarget);
                    setGatingNotice(
                      "Selesaikan percobaan di bagian Teori terlebih dahulu untuk membuka Fase Praktikum & Evaluasi."
                    );
                    return;
                  }
                  animeButtonPop(e.currentTarget);
                  setActivePhase("practice");
                  setGatingNotice(null);
                  document.getElementById("phase-practice")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 text-xs font-bold transition-all h-8 px-3.5 ${
                  activePhase === "practice"
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    : !isPracticeUnlocked
                    ? "bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Fase 2: Praktikum & Evaluasi</span>
                {!isPracticeUnlocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
              </Button>
            </div>

            <Badge variant={isPracticeUnlocked ? "default" : "secondary"} className="hidden sm:inline-flex text-xs font-medium">
              {isPracticeUnlocked ? "Semua Fase Terbuka" : "Fase 1 Aktif"}
            </Badge>
          </div>
        </div>

        {/* 1-Page Main Content View */}
        <main className="max-w-4xl mx-auto px-4 py-8 pb-20 space-y-12">
          {gatingNotice && (
            <Card className="p-4 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="font-medium">{gatingNotice}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  animeButtonPop(e.currentTarget);
                  setGatingNotice(null);
                }}
                className="text-amber-700 dark:text-amber-300 font-bold hover:underline flex-shrink-0 h-auto p-1"
              >
                Tutup
              </Button>
            </Card>
          )}

          {/* FASE 1: TEORI & PEMAHAMAN (READING, LISTENING, WRITING & SPEAKING TRIAL) */}
          <section id="phase-theory" className="space-y-6">
            <SectionTheoryUnified
              title={theorySection?.title || moduleData.title}
              theoryContent={theorySection?.content}
              vocabItems={vocabSection?.content?.items || []}
              dialogueContext={dialogueSection?.content?.context}
              dialogueLines={dialogueSection?.content?.lines || dialogueSection?.content?.dialogue || []}
              onPlayAudio={tutor.playTutorAudio}
              onAdvanceToPractice={handleUnlockPractice}
              isPracticeUnlocked={isPracticeUnlocked}
              objective={moduleData.objective}
              cefr={moduleData.cefr}
              orderIndex={moduleData.orderIndex}
            />
          </section>

          {/* FASE 2: PRAKTIKUM BERBICARA & KUIS EVALUASI */}
          {isPracticeUnlocked && (
            <section
              id="phase-practice"
              className="pt-8 border-t-2 border-slate-200 dark:border-slate-800 space-y-8 animate-in fade-in slide-in-from-bottom-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                  2
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Fase 2: Praktikum Berbicara & Evaluasi
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Praktikkan materi secara langsung di Speaking Lab, kemudian ikuti kuis evaluasi.
                  </p>
                </div>
              </div>

              {/* Speaking Lab */}
              {practiceSection && (
                <SectionSpeakingLab
                  title={practiceSection.title}
                  drills={practiceSection.content?.drills || []}
                  roleplay={practiceSection.content?.roleplay || { context: "", roles: [], turns: [] }}
                  challenge={practiceSection.content?.challenge || { scenario: "" }}
                  moduleId={moduleId}
                  userId={userId}
                  onPlayAudio={tutor.playTutorAudio}
                  onSpeakingComplete={(score, isComplete) => {
                    setSpeakingScore(score);
                    setIsSpeakingComplete(isComplete);
                    setGatingNotice(null);
                  }}
                  onAdvanceToQuiz={() => {
                    document.getElementById("section-quiz")?.scrollIntoView({ behavior: "smooth" });
                  }}
                />
              )}

              {/* Kuis Evaluasi */}
              {quizSection && isSpeakingComplete && (
                <div id="section-quiz" className="pt-6 border-t border-slate-200 dark:border-slate-800">
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
            </section>
          )}
        </main>
      </div>

      {/* Unified Bottom Footer Navigation with Centered Voice Orb */}
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
        onBack={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          setActivePhase("theory");
        }}
        backLabel="Kembali ke Atas (Teori)"
        onForward={
          isPracticeUnlocked
            ? () => {
                const el = document.getElementById(isSpeakingComplete ? "section-quiz" : "phase-practice");
                el?.scrollIntoView({ behavior: "smooth" });
                setActivePhase("practice");
              }
            : handleUnlockPractice
        }
        forwardLabel={
          isPracticeUnlocked
            ? isSpeakingComplete
              ? "Ke Kuis Evaluasi"
              : "Ke Praktikum Lab"
            : "Lanjut ke Praktikum"
        }
        phaseBadge={isPracticeUnlocked ? "Fase 2 Aktif" : "Fase 1: Teori"}
      />
    </div>
  );
}
