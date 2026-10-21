"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  Send,
  Trophy,
  Volume2,
} from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import {
  playPopSound,
  playSnapSound,
  playMatchSuccessSound,
  playFanfareSound,
} from "@/lib/sound-fx";

export interface WritingPracticumQuestion {
  id: number;
  typeLabel?: string;
  instruction?: string;
  promptText?: string;
  prompt?: string;
  promptSentence?: string;
  audioText?: string;
  targetWord?: string;
  targetSentence?: string;
  answer?: string;
  targetAnswers?: string[];
  explanation?: string;
  hint?: string;
}

interface WritingPracticumStageProps {
  quizSec?: any;
  onRewardXp: (amount: number) => void;
  tutor: any;
  onFinish?: () => void;
}

export function WritingPracticumStage({
  quizSec,
  onRewardXp,
  tutor,
  onFinish,
}: WritingPracticumStageProps) {
  const rawQuestions =
    (Array.isArray(quizSec?.content?.practicumQuestions) && quizSec.content.practicumQuestions) ||
    (Array.isArray(quizSec?.content?.questions) && quizSec.content.questions) ||
    (Array.isArray(quizSec?.content?.items) && quizSec.content.items) ||
    (Array.isArray(quizSec?.content) && quizSec.content) ||
    [];

  const questions: WritingPracticumQuestion[] = rawQuestions;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [typedInputs, setTypedInputs] = useState<Record<number, string>>({});
  const [evaluations, setEvaluations] = useState<
    Record<number, { isCorrect: boolean; feedback: string }>
  >({});
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompletedAll, setIsCompletedAll] = useState(false);

  const question = questions[currentIdx] || {
    id: 1,
    typeLabel: "Writing Practicum",
    instruction: "Type the complete sentence according to the prompt:",
    promptText: "",
    targetAnswers: [],
    explanation: "",
  };

  const rawPrompt =
    question.promptText ||
    question.prompt ||
    question.promptSentence ||
    (question as any).question ||
    "";

  const displayPrompt =
    rawPrompt || question.instruction || "Sentence prompt";

  const displayInstruction =
    rawPrompt && question.instruction
      ? question.instruction
      : question.typeLabel
      ? `Task: ${question.typeLabel}`
      : "Type the complete sentence according to the prompt:";

  const validTargets: string[] = (
    (question.targetAnswers && question.targetAnswers.length > 0)
      ? question.targetAnswers
      : [
          question.targetWord,
          question.targetSentence,
          question.answer,
          ...((question as any).answers || []),
        ]
  ).filter((ans): ans is string => typeof ans === "string" && ans.trim().length > 0);

  const userText = typedInputs[question.id] || "";
  const currentEval = evaluations[question.id];

  const normalize = (str: string) => {
    return str
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\s*([,.;?!])\s*/g, "$1 ")
      .trim();
  };

  const handleCheckAnswer = () => {
    const normalizedUser = normalize(userText);
    const isMatch = validTargets.some((ans) => {
      const nAns = normalize(ans);
      if (nAns === normalizedUser) return true;
      if (nAns.toLowerCase() === normalizedUser.toLowerCase()) return true;
      if (
        nAns.replace(/[.?!]$/, "").trim().toLowerCase() ===
        normalizedUser.replace(/[.?!]$/, "").trim().toLowerCase()
      ) {
        return true;
      }
      return false;
    });

    if (isMatch) {
      playMatchSuccessSound();
      if (!evaluations[question.id]?.isCorrect) {
        setCorrectCount((prev) => prev + 1);
        onRewardXp(15);
      }
      setEvaluations((prev) => ({
        ...prev,
        [question.id]: {
          isCorrect: true,
          feedback: "Spot on! Your sentence construction and mechanics are accurate.",
        },
      }));
    } else {
      playPopSound();
      setEvaluations((prev) => ({
        ...prev,
        [question.id]: {
          isCorrect: false,
          feedback:
            "Answer doesn't match yet. Check your spelling, capitalization, spacing, and punctuation mark.",
        },
      }));
    }
  };

  const handleNext = () => {
    playSnapSound();
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      playFanfareSound();
      setIsCompletedAll(true);
      onFinish?.();
    }
  };

  const handleListenPrompt = (e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    const textToSpeak = (
      question.audioText ||
      rawPrompt ||
      validTargets[0] ||
      question.instruction ||
      ""
    )
      .replace(/_{2,}/g, "blank")
      .replace(/[\/]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (textToSpeak) {
      tutor?.playTutorAudio?.(textToSpeak);
    }
  };

  if (isCompletedAll) {
    const totalScore = Math.round((correctCount / (questions.length || 1)) * 100);
    return (
      <div className="p-8 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-b-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-2xl bg-[#0D3B66]/10 dark:bg-[#0D3B66]/30 flex items-center justify-center mx-auto text-[#0D3B66] dark:text-[#F4B41A]">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[#0D3B66] dark:text-[#F4B41A] uppercase tracking-wider font-mono">
            Practicum Completed
          </span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            Writing Mastery Achieved!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            You have completed all {questions.length} active writing challenges with a final score of {totalScore}% ({correctCount}/{questions.length} Correct).
          </p>
        </div>

        <div className="inline-flex items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <span className="text-xs text-slate-400 block font-mono">Writing Accuracy</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{totalScore}%</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700" />
          <div className="text-center">
            <span className="text-xs text-slate-400 block font-mono">Total XP Earned</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">+{correctCount * 15} XP</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onFinish}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-md"
          >
            <CheckCircle2 className="w-4 h-4 text-[#F4B41A]" />
            <span>Finish &amp; Save Writing Mission</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0D3B66] dark:text-[#F4B41A] uppercase tracking-wider block font-mono">
            Step 5 · Writing Mastery Practicum ({currentIdx + 1}/{questions.length})
          </span>
          <span className="text-xs font-bold text-slate-500 font-mono">
            {question.typeLabel || "Writing"}
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
          Independent Sentence Writing Practicum
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Type complete sentences with accurate spelling, capitalization, and punctuation for each item.
        </p>
      </div>

      {/* Question Progress Dots */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {questions.map((q, idx) => {
          const isDone = evaluations[q.id]?.isCorrect;
          const isCurrent = idx === currentIdx;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => {
                playPopSound();
                setCurrentIdx(idx);
              }}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                isCurrent
                  ? "w-8 bg-[#0D3B66] dark:bg-[#F4B41A]"
                  : isDone
                  ? "w-4 bg-emerald-500"
                  : "w-2.5 bg-slate-200 dark:bg-slate-700"
              }`}
              title={`Question ${idx + 1}`}
            />
          );
        })}
      </div>

      {/* Main Workspace */}
      <div className="p-6 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-b-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
        {/* Instruction & Prompt */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono block">
            Question {currentIdx + 1}:
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {displayInstruction}
          </p>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3">
            <span className="text-sm sm:text-base font-mono font-bold text-[#0D3B66] dark:text-[#F4B41A]">
              {displayPrompt}
            </span>
            <button
              type="button"
              onClick={handleListenPrompt}
              className="p-2 rounded-lg bg-white dark:bg-slate-700 text-[#0D3B66] dark:text-[#F4B41A] hover:bg-slate-100 transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Listen to prompt text"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Typing Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
            Your Written Answer:
          </label>
          <input
            type="text"
            value={userText}
            onChange={(e) => {
              const val = e.target.value;
              setTypedInputs((prev) => ({ ...prev, [question.id]: val }));
              if (currentEval) {
                setEvaluations((prev) => ({
                  ...prev,
                  [question.id]: { isCorrect: false, feedback: "" },
                }));
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && userText.trim()) {
                handleCheckAnswer();
              }
            }}
            placeholder="Type complete sentence here..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D3B66] dark:focus:ring-[#F4B41A]"
          />
        </div>

        {/* Evaluation Output */}
        {currentEval?.feedback && (
          <div
            className={`p-4 rounded-xl text-xs space-y-1.5 ${
              currentEval.isCorrect
                ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                : "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              {currentEval.isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Correct Answer (+15 XP)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Review Again</span>
                </>
              )}
            </div>
            <p className="leading-relaxed">{currentEval.feedback}</p>
            {currentEval.isCorrect && (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                Explanation: {question.explanation || (validTargets[0] ? `Accepted: "${validTargets[0]}"` : "Completed accurately.")}
              </p>
            )}
          </div>
        )}

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              playPopSound();
              setTypedInputs((prev) => ({ ...prev, [question.id]: "" }));
              setEvaluations((prev) => ({
                ...prev,
                [question.id]: { isCorrect: false, feedback: "" },
              }));
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear &amp; Retype</span>
          </button>

          <div className="flex items-center gap-2">
            {currentEval?.isCorrect ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <span>
                  {currentIdx + 1 < questions.length
                    ? "Next Question"
                    : "View Summary Results"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCheckAnswer}
                disabled={!userText.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-40 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Check Answer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
