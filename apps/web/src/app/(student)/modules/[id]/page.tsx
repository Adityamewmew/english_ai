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
} from "lucide-react";
import {
  SectionTheory,
  SectionVocab,
  SectionDialogue,
  SectionQuiz,
  QuestionResult,
  ModuleVoiceDock,
} from "@/components/modules";
import { useModuleTutor } from "@/hooks/use-module-tutor";

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [moduleData, setModuleData] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [studentName, setStudentName] = useState("");

  // Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    submitted: boolean;
    score: number | null;
    passed: boolean;
    results: QuestionResult[];
  }>({
    submitted: false,
    score: null,
    passed: false,
    results: [],
  });

  // AI Tutor Hook
  const tutor = useModuleTutor({
    moduleId,
    studentName,
  });

  // Load Module Data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const sessRes = await fetch("/api/user/profile").catch(() => null);
        let userId = "";
        if (sessRes && sessRes.ok) {
          const sessData = await sessRes.json();
          userId = sessData?.data?.id || "";
          setStudentName(sessData?.data?.name || "");
        }

        const res = await fetch(`/api/curriculum/modules/${moduleId}?userId=${userId}`);
        const json = await res.json();

        if (json.success && json.data) {
          setModuleData(json.data.module);
          setSections(json.data.sections || []);

          if (json.data.userProgress?.status === "completed") {
            setQuizResult({
              submitted: true,
              score: json.data.userProgress.score,
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
    setUserAnswers((prev) => ({
      ...prev,
      [qId.toString()]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      setIsSubmitting(true);
      const sessRes = await fetch("/api/user/profile").catch(() => null);
      let userId = "";
      if (sessRes && sessRes.ok) {
        const sessData = await sessRes.json();
        userId = sessData?.data?.id || "";
      }

      const res = await fetch(`/api/curriculum/modules/${moduleId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          answers: userAnswers,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setQuizResult({
          submitted: true,
          score: json.data.score,
          passed: json.data.passed,
          results: json.data.results || [],
        });
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

  const currentSection = sections[activeSectionIdx];
  const isLastSection = activeSectionIdx === sections.length - 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between relative">
      <div>
        {/* Top Navbar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/modules"
                className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                  <Award className="w-3.5 h-3.5" />
                  Ujian Kelulusan
                </span>
              )}

              <button
                type="button"
                onClick={tutor.handleToggleCall}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold transition-colors"
                title="Panggilan AI Tutor"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Tutor Call</span>
              </button>
            </div>
          </div>
        </header>

        {/* Stepper Navigation */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none">
              {sections.map((sec, idx) => {
                const isActive = activeSectionIdx === idx;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSectionIdx(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span>{sec.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section Main View */}
        <main className="max-w-4xl mx-auto px-4 py-8 pb-36">
          {currentSection && (
            <div>
              {currentSection.sectionType === "theory" && (
                <SectionTheory
                  title={currentSection.title}
                  content={currentSection.content}
                />
              )}

              {currentSection.sectionType === "vocab" && (
                <SectionVocab
                  title={currentSection.title}
                  items={currentSection.content?.items || []}
                  onSpeak={tutor.playTutorAudio}
                />
              )}

              {currentSection.sectionType === "dialogue" && (
                <SectionDialogue
                  title={currentSection.title}
                  context={currentSection.content?.context}
                  dialogue={currentSection.content?.lines || currentSection.content?.dialogue || []}
                  onSpeak={tutor.playTutorAudio}
                />
              )}

              {currentSection.sectionType === "quiz" && (
                <SectionQuiz
                  title={currentSection.title}
                  questions={currentSection.content?.questions || []}
                  passingScore={moduleData.passingScore || 70}
                  userAnswers={userAnswers}
                  isSubmitted={quizResult.submitted}
                  isSubmitting={isSubmitting}
                  score={quizResult.score}
                  passed={quizResult.passed}
                  results={quizResult.results}
                  isExam={moduleData.isExam}
                  onSelectAnswer={handleSelectAnswer}
                  onSubmit={handleSubmitQuiz}
                  onRetry={handleRetryQuiz}
                  onContinue={() => router.push("/modules")}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Centered Bottom Voice Orb Dock with Manual Chatbot Toggle */}
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
      />

      {/* Bottom Floating Step Nav */}
      <footer className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 py-3 pb-24 sticky bottom-0 z-30">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <button
            type="button"
            disabled={activeSectionIdx === 0}
            onClick={() => setActiveSectionIdx((prev) => Math.max(0, prev - 1))}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSectionIdx === 0
                ? "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Langkah {activeSectionIdx + 1} dari {sections.length}
          </span>

          <button
            type="button"
            disabled={isLastSection}
            onClick={() => setActiveSectionIdx((prev) => Math.min(sections.length - 1, prev + 1))}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isLastSection
                ? "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            }`}
          >
            <span>Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
