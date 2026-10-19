"use client";

import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  Award,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExamPartReading } from "./exam/exam-part-reading";
import { ExamPartListening } from "./exam/exam-part-listening";
import { ExamPartWriting } from "./exam/exam-part-writing";
import { ExamPartSpeaking } from "./exam/exam-part-speaking";
import { ExamCertificateView } from "./exam/exam-certificate-view";

interface StageGraduationExamViewProps {
  activeStepId: number;
  theorySec: any;
  quizSec: any;
  moduleData: any;
  onNextStep: () => void;
  onStepComplete?: () => void;
  onRewardXp: (amount: number) => void;
  studentName?: string;
}

export function StageGraduationExamView({
  activeStepId,
  theorySec,
  quizSec,
  moduleData,
  onNextStep,
  onStepComplete,
  onRewardXp,
  studentName = "Student",
}: StageGraduationExamViewProps) {
  const parts = quizSec?.content?.parts || {};
  const readingList: any[] = parts.reading || [];
  const listeningList: any[] = parts.listening || [];
  const writingList: any[] = parts.writing || [];
  const speakingList: any[] = parts.speaking || [];

  const passingScore = moduleData?.passingScore || 75;

  // Student answer state per part
  const [readingAnswers, setReadingAnswers] = useState<Record<number, string>>({});
  const [listeningAnswers, setListeningAnswers] = useState<Record<number, string>>({});
  const [writingAnswers, setWritingAnswers] = useState<Record<number, string>>({});
  const [speakingCompleted, setSpeakingCompleted] = useState<Record<number, boolean>>({});

  // Audio helper (Web Speech API)
  const playAudio = (text: string) => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

  // Scores computation
  const scores = useMemo(() => {
    // 1. Reading (15 questions)
    let rCorrect = 0;
    readingList.forEach((q, idx) => {
      if (readingAnswers[idx] && readingAnswers[idx] === q.answer) {
        rCorrect++;
      }
    });

    // 2. Listening (15 questions)
    let lCorrect = 0;
    listeningList.forEach((q, idx) => {
      const userAns = (listeningAnswers[idx] || "").trim().toLowerCase();
      const target = (q.targetSentence || q.audioText || q.answer || "").trim().toLowerCase();
      if (userAns && (userAns === target || target.includes(userAns))) {
        lCorrect++;
      }
    });

    // 3. Writing (10 questions)
    let wAnswered = 0;
    writingList.forEach((_, idx) => {
      if ((writingAnswers[idx] || "").trim().length > 10) {
        wAnswered++;
      }
    });

    // 4. Speaking (15 questions)
    let sCompletedCount = 0;
    speakingList.forEach((_, idx) => {
      if (speakingCompleted[idx]) {
        sCompletedCount++;
      }
    });

    const rScore = readingList.length > 0 ? (rCorrect / readingList.length) * 25 : 25;
    const lScore = listeningList.length > 0 ? (lCorrect / listeningList.length) * 25 : 25;
    const wScore = writingList.length > 0 ? (wAnswered / writingList.length) * 25 : 25;
    const sScore = speakingList.length > 0 ? (sCompletedCount / speakingList.length) * 25 : 25;

    const total = Math.round(rScore + lScore + wScore + sScore);

    return {
      rCorrect,
      rTotal: readingList.length || 15,
      lCorrect,
      lTotal: listeningList.length || 15,
      wAnswered,
      wTotal: writingList.length || 10,
      sCompletedCount,
      sTotal: speakingList.length || 15,
      totalScore: Math.min(100, Math.max(0, total)),
      isPassed: total >= passingScore,
    };
  }, [
    readingAnswers,
    listeningAnswers,
    writingAnswers,
    speakingCompleted,
    readingList,
    listeningList,
    writingList,
    speakingList,
    passingScore,
  ]);

  // Step 1: Briefing & Guidelines
  if (activeStepId === 1) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-2">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-amber-600 text-white inline-flex items-center justify-center shadow-md">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {moduleData?.title || "Comprehensive Sub-Level Graduation Exam"}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
              {theorySec?.content?.difficultyTier === "hard"
                ? "Tingkat Kesulitan: Hard (C1-C2)"
                : theorySec?.content?.difficultyTier === "medium"
                ? "Tingkat Kesulitan: Medium (B1-B2)"
                : "Tingkat Kesulitan: Easy (A1-A2)"}
            </span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            {theorySec?.content?.summary ||
              "Ujian resmi evaluasi komprehensif 4 keterampilan terpadu. Tuntaskan 55 evaluasi untuk meraih nilai kelulusan dan menerbitkan sertifikat resmi."}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-center space-y-1">
            <BookOpen className="w-5 h-5 mx-auto text-[#0D3B66] dark:text-blue-400" />
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Part 1: Reading</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">15 Soal</div>
          </Card>
          <Card className="p-4 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-center space-y-1">
            <Headphones className="w-5 h-5 mx-auto text-amber-600 dark:text-amber-400" />
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Part 2: Listening</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">15 Soal</div>
          </Card>
          <Card className="p-4 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-center space-y-1">
            <PenTool className="w-5 h-5 mx-auto text-rose-600 dark:text-rose-400" />
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Part 3: Writing</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">10 Soal</div>
          </Card>
          <Card className="p-4 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-center space-y-1">
            <Mic className="w-5 h-5 mx-auto text-sky-600 dark:text-sky-400" />
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Part 4: Speaking</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">15 Soal</div>
          </Card>
        </div>

        <Card className="p-5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-700 dark:text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Ambang Batas Kelulusan Sertifikat
              </div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Nilai minimal <span className="font-bold text-amber-800 dark:text-amber-300">{passingScore}%</span> untuk resmi lulus dan menerbitkan sertifikat.
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-2xl font-black font-mono text-amber-800 dark:text-amber-300">
              {passingScore}%
            </span>
          </div>
        </Card>

        <div className="pt-2 text-center">
          <Button
            onClick={() => {
              if (onStepComplete) onStepComplete();
              onNextStep();
            }}
            className="w-full sm:w-auto px-8 py-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-base shadow-sm inline-flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <span>Mulai Ujian Kelulusan Sekarang</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Step 2: Part 1 Reading (15 MCQ)
  if (activeStepId === 2) {
    return (
      <ExamPartReading
        readingList={readingList}
        readingAnswers={readingAnswers}
        onSelectAnswer={(qIdx, opt) =>
          setReadingAnswers((prev) => ({ ...prev, [qIdx]: opt }))
        }
        onNext={() => {
          onRewardXp(25);
          if (onStepComplete) onStepComplete();
          onNextStep();
        }}
      />
    );
  }

  // Step 3: Part 2 Listening (15 Audio Tasks)
  if (activeStepId === 3) {
    return (
      <ExamPartListening
        listeningList={listeningList}
        listeningAnswers={listeningAnswers}
        onChangeAnswer={(qIdx, val) =>
          setListeningAnswers((prev) => ({ ...prev, [qIdx]: val }))
        }
        playAudio={playAudio}
        onNext={() => {
          onRewardXp(25);
          if (onStepComplete) onStepComplete();
          onNextStep();
        }}
      />
    );
  }

  // Step 4: Part 3 Writing (10 Tasks)
  if (activeStepId === 4) {
    return (
      <ExamPartWriting
        writingList={writingList}
        writingAnswers={writingAnswers}
        onChangeAnswer={(qIdx, val) =>
          setWritingAnswers((prev) => ({ ...prev, [qIdx]: val }))
        }
        onNext={() => {
          onRewardXp(25);
          if (onStepComplete) onStepComplete();
          onNextStep();
        }}
      />
    );
  }

  // Step 5: Part 4 Speaking (15 Prompts)
  if (activeStepId === 5) {
    return (
      <ExamPartSpeaking
        speakingList={speakingList}
        speakingCompleted={speakingCompleted}
        onToggleCompleted={(qIdx) =>
          setSpeakingCompleted((prev) => ({ ...prev, [qIdx]: !prev[qIdx] }))
        }
        playAudio={playAudio}
        onFinish={() => {
          onRewardXp(25);
          if (onStepComplete) onStepComplete();
          onNextStep();
        }}
      />
    );
  }

  // Step 6: Final Scorecard & Official Sub-Level Certificate
  return (
    <ExamCertificateView
      scores={scores}
      moduleData={moduleData}
      studentName={studentName}
      passingScore={passingScore}
    />
  );
}
