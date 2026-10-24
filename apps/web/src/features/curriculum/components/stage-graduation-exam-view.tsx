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
  onSubmitExam?: (finalScore: number) => Promise<void>;
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
  onSubmitExam,
}: StageGraduationExamViewProps) {
  const rawParts = quizSec?.content?.parts;
  const rawQuestions: any[] = useMemo(() => {
    return (
      (Array.isArray(quizSec?.content?.questions) && quizSec.content.questions) ||
      (Array.isArray(quizSec?.content) && quizSec.content) ||
      []
    );
  }, [quizSec]);

  const readingList: any[] = useMemo(() => {
    if (rawParts?.reading && rawParts.reading.length > 0) return rawParts.reading;
    const filtered = rawQuestions.filter(
      (q) => q.skill === "reading" || /\[reading/i.test(q.question || "")
    );
    if (filtered.length > 0) return filtered;
    return rawQuestions.length >= 4 ? rawQuestions.slice(0, Math.ceil(rawQuestions.length / 4)) : rawQuestions;
  }, [rawParts, rawQuestions]);

  const listeningList: any[] = useMemo(() => {
    if (rawParts?.listening && rawParts.listening.length > 0) return rawParts.listening;
    const filtered = rawQuestions.filter(
      (q) => q.skill === "listening" || /\[listening/i.test(q.question || "") || q.audioText || q.targetSentence
    );
    if (filtered.length > 0) return filtered;
    return rawQuestions.length >= 4
      ? rawQuestions.slice(Math.ceil(rawQuestions.length / 4), Math.ceil(rawQuestions.length / 2))
      : [];
  }, [rawParts, rawQuestions]);

  const writingList: any[] = useMemo(() => {
    if (rawParts?.writing && rawParts.writing.length > 0) return rawParts.writing;
    const filtered = rawQuestions.filter(
      (q) => q.skill === "writing" || /\[writing/i.test(q.question || "") || q.promptText || q.sentence
    );
    if (filtered.length > 0) return filtered;
    return rawQuestions.length >= 4
      ? rawQuestions.slice(Math.ceil(rawQuestions.length / 2), Math.ceil((rawQuestions.length * 3) / 4))
      : [];
  }, [rawParts, rawQuestions]);

  const speakingList: any[] = useMemo(() => {
    if (rawParts?.speaking && rawParts.speaking.length > 0) return rawParts.speaking;
    const filtered = rawQuestions.filter(
      (q) => q.skill === "speaking" || /\[speaking/i.test(q.question || "") || q.scenario || q.prompt
    );
    if (filtered.length > 0) return filtered;
    return rawQuestions.length >= 4
      ? rawQuestions.slice(Math.ceil((rawQuestions.length * 3) / 4))
      : [];
  }, [rawParts, rawQuestions]);

  const passingScore = moduleData?.passingScore || 75;

  // Student answer state per part
  const [readingAnswers, setReadingAnswers] = useState<Record<number, string>>({});
  const [listeningAnswers, setListeningAnswers] = useState<Record<number, string>>({});
  const [writingAnswers, setWritingAnswers] = useState<Record<number, string>>({});
  const [speakingCompleted, setSpeakingCompleted] = useState<Record<number, boolean>>({});

  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const hasSubmittedRef = React.useRef(false);

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
    const totalExamQuestions =
      readingList.length + listeningList.length + writingList.length + speakingList.length;

    if (totalExamQuestions === 0) {
      return {
        rCorrect: 0,
        rTotal: 0,
        lCorrect: 0,
        lTotal: 0,
        wAnswered: 0,
        wTotal: 0,
        sCompletedCount: 0,
        sTotal: 0,
        totalScore: 0,
        isPassed: false,
      };
    }

    // 1. Reading
    let rCorrect = 0;
    readingList.forEach((q, idx) => {
      const user = (readingAnswers[idx] || "").trim().toLowerCase();
      let expected = (q.answer || q.correctAnswer || "").trim().toLowerCase();
      if (!expected && typeof q.correctIndex === "number" && Array.isArray(q.options)) {
        const opt = q.options[q.correctIndex];
        expected = (typeof opt === "string" ? opt : opt?.text || "").trim().toLowerCase();
      }
      if (user && (user === expected || (expected.length === 1 && user.startsWith(expected)))) {
        rCorrect++;
      }
    });

    // 2. Listening
    let lCorrect = 0;
    listeningList.forEach((q, idx) => {
      const userAns = (listeningAnswers[idx] || "").trim().toLowerCase();
      const target = (q.targetSentence || q.audioText || q.answer || "").trim().toLowerCase();
      if (userAns && (userAns === target || target.includes(userAns))) {
        lCorrect++;
      }
    });

    // 3. Writing
    let wAnswered = 0;
    writingList.forEach((_, idx) => {
      if ((writingAnswers[idx] || "").trim().length > 6) {
        wAnswered++;
      }
    });

    // 4. Speaking
    let sCompletedCount = 0;
    speakingList.forEach((_, idx) => {
      if (speakingCompleted[idx]) {
        sCompletedCount++;
      }
    });

    const rScore = readingList.length > 0 ? (rCorrect / readingList.length) * 25 : 0;
    const lScore = listeningList.length > 0 ? (lCorrect / listeningList.length) * 25 : 0;
    const wScore = writingList.length > 0 ? (wAnswered / writingList.length) * 25 : 0;
    const sScore = speakingList.length > 0 ? (sCompletedCount / speakingList.length) * 25 : 0;

    const total = Math.round(rScore + lScore + wScore + sScore);

    return {
      rCorrect,
      rTotal: readingList.length,
      lCorrect,
      lTotal: listeningList.length,
      wAnswered,
      wTotal: writingList.length,
      sCompletedCount,
      sTotal: speakingList.length,
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
                ? "Difficulty Tier: Advanced (C1-C2)"
                : theorySec?.content?.difficultyTier === "medium"
                ? "Difficulty Tier: Intermediate (B1-B2)"
                : "Difficulty Tier: Elementary (A1-A2)"}
            </span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            {theorySec?.content?.summary ||
              "Official integrated 4-skill comprehensive graduation exam. Complete all 55 evaluations to achieve passing marks and generate your verified certificate."}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-center space-y-1">
            <BookOpen className="w-5 h-5 mx-auto text-[#0D3B66] dark:text-blue-400" />
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Part 1: Reading</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{readingList.length} Questions</div>
          </Card>
          <Card className="p-4 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-center space-y-1">
            <Headphones className="w-5 h-5 mx-auto text-amber-600 dark:text-amber-400" />
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Part 2: Listening</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{listeningList.length} Questions</div>
          </Card>
          <Card className="p-4 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-center space-y-1">
            <PenTool className="w-5 h-5 mx-auto text-rose-600 dark:text-rose-400" />
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Part 3: Writing</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{writingList.length} Questions</div>
          </Card>
          <Card className="p-4 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-center space-y-1">
            <Mic className="w-5 h-5 mx-auto text-sky-600 dark:text-sky-400" />
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Part 4: Speaking</div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{speakingList.length} Questions</div>
          </Card>
        </div>

        <Card className="p-5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-700 dark:text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Graduation Certificate Passing Requirement
              </div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Minimum score of <span className="font-bold text-amber-800 dark:text-amber-300">{passingScore}%</span> required to graduate and earn your verified certificate.
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
            <span>Begin Graduation Assessment Now</span>
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
  // Auto-submit score to backend to unlock next module and save progress
  return (
    <ExamCertificateViewWithAutoSubmit
      scores={scores}
      moduleData={moduleData}
      studentName={studentName}
      passingScore={passingScore}
      onSubmitExam={onSubmitExam}
      isSubmittingExam={isSubmittingExam}
      isExamSubmitted={isExamSubmitted}
      setIsSubmittingExam={setIsSubmittingExam}
      setIsExamSubmitted={setIsExamSubmitted}
      hasSubmittedRef={hasSubmittedRef}
    />
  );
}

function ExamCertificateViewWithAutoSubmit({
  scores,
  moduleData,
  studentName,
  passingScore,
  onSubmitExam,
  isSubmittingExam,
  isExamSubmitted,
  setIsSubmittingExam,
  setIsExamSubmitted,
  hasSubmittedRef,
}: {
  scores: any;
  moduleData: any;
  studentName: string;
  passingScore: number;
  onSubmitExam?: (score: number) => Promise<void>;
  isSubmittingExam: boolean;
  isExamSubmitted: boolean;
  setIsSubmittingExam: (val: boolean) => void;
  setIsExamSubmitted: (val: boolean) => void;
  hasSubmittedRef: React.MutableRefObject<boolean>;
}) {
  React.useEffect(() => {
    if (!hasSubmittedRef.current && onSubmitExam) {
      hasSubmittedRef.current = true;
      setIsSubmittingExam(true);
      onSubmitExam(scores.totalScore)
        .then(() => setIsExamSubmitted(true))
        .catch((err) => console.error("Auto submit exam failed:", err))
        .finally(() => setIsSubmittingExam(false));
    }
  }, [onSubmitExam, scores.totalScore, hasSubmittedRef, setIsSubmittingExam, setIsExamSubmitted]);

  return (
    <ExamCertificateView
      scores={scores}
      moduleData={moduleData}
      studentName={studentName}
      passingScore={passingScore}
      isSubmitting={isSubmittingExam}
      isSubmitted={isExamSubmitted}
    />
  );
}
