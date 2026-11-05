"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  Send,
  Trophy,
  Volume2,
  Lightbulb,
} from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import {
  playPopSound,
  playSnapSound,
  playMatchSuccessSound,
  playFanfareSound,
} from "@/lib/sound-fx";
import { useSession } from "@/features/auth/hooks/use-session";
import { isUserAdmin } from "@/lib/auth-utils";
import {
  evaluateWritingAnswer,
  normalizeWritingInput,
} from "./writing-practicum-utils";

export interface WritingPracticumQuestion {
  id: number | string;
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
  sampleGoodAnswer?: string;
  criteria?: string;
  explanation?: string;
  hint?: string;
}

interface WritingPracticumStageProps {
  quizSec?: any;
  onRewardXp: (amount: number) => void;
  tutor: any;
  onFinish?: () => void;
  isAdmin?: boolean;
  initialAnswers?: Record<string | number, string>;
  onAnswersChange?: (answers: Record<string, any>) => void;
}

export function WritingPracticumStage({
  quizSec,
  onRewardXp,
  tutor,
  onFinish,
  isAdmin: propIsAdmin,
  initialAnswers,
  onAnswersChange,
}: WritingPracticumStageProps) {
  const { data: sessionUser } = useSession();
  const isAdmin = Boolean(propIsAdmin || isUserAdmin(sessionUser));
  const rawQuestions =
    (Array.isArray(quizSec?.content?.practicumQuestions) && quizSec.content.practicumQuestions) ||
    (Array.isArray(quizSec?.content?.questions) && quizSec.content.questions) ||
    (Array.isArray(quizSec?.content?.items) && quizSec.content.items) ||
    (Array.isArray(quizSec?.content) && quizSec.content) ||
    [];

  const questions: WritingPracticumQuestion[] = rawQuestions;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [typedInputs, setTypedInputs] = useState<Record<string | number, string>>(
    () => initialAnswers || {}
  );
  const [evaluations, setEvaluations] = useState<
    Record<string | number, { isCorrect: boolean; feedback: string }>
  >({});
  const [attemptCounts, setAttemptCounts] = useState<Record<string | number, number>>({});
  const [showHintMap, setShowHintMap] = useState<Record<string | number, boolean>>({});
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompletedAll, setIsCompletedAll] = useState(false);

  useEffect(() => {
    if (initialAnswers && Object.keys(initialAnswers).length > 0) {
      setTypedInputs((prev) => ({ ...initialAnswers, ...prev }));
    }
  }, [initialAnswers]);

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

  const sampleGood = (question as any).sampleGoodAnswer || (question as any).sampleAnswer;
  const validTargets: string[] = (
    (question.targetAnswers && question.targetAnswers.length > 0)
      ? question.targetAnswers
      : [
          question.targetWord,
          question.targetSentence,
          question.answer,
          sampleGood,
          ...((question as any).answers || []),
        ]
  ).filter((ans): ans is string => typeof ans === "string" && ans.trim().length > 0);

  const userText = typedInputs[question.id] || "";
  const currentEval = evaluations[question.id];
  const attempts = attemptCounts[question.id] || 0;

  const handleCheckAnswer = () => {
    const trimmed = normalizeWritingInput(userText);
    if (!trimmed) return;

    const words = trimmed.split(/\s+/).filter(Boolean);
    const hasCapital = /^[A-Z]/.test(trimmed);
    const hasPunctuation = /[.?!]$/.test(trimmed);
    const isOpenEndedPrompt = Boolean(
      (question as any).criteria ||
      sampleGood ||
      /answer this question|complete sentences|write|how do you feel|paragraph|conversation/i.test(
        rawPrompt || question.instruction || ""
      )
    );

    // 1. Full 3-tier evaluator (Exact -> Near-match/Typo >= 84% -> Diagnostic)
    const evalRes = evaluateWritingAnswer(trimmed, validTargets);
    let isPassed = evalRes.isCorrect;
    let feedback = evalRes.feedback;
    const isNearMatch = evalRes.isNearMatch;

    // 2. Open-ended Rubric Check fallback
    if (!isPassed && isOpenEndedPrompt) {
      if (words.length < 3) {
        feedback = "Write a complete response with more detail (at least a full sentence).";
      } else if (!hasCapital) {
        feedback = "Remember to capitalize the first letter of your sentence.";
      } else if (!hasPunctuation) {
        feedback = "Please end your sentence with appropriate punctuation (period, question mark, or exclamation).";
      } else {
        isPassed = true;
        feedback = "Great job! Your response satisfies the open-ended prompt criteria.";
      }
    }

    if (isPassed) {
      playMatchSuccessSound();
      if (!evaluations[question.id]?.isCorrect) {
        setCorrectCount((prev) => prev + 1);
        onRewardXp(isNearMatch ? 12 : 15);
      }
      setEvaluations((prev) => ({
        ...prev,
        [question.id]: {
          isCorrect: true,
          feedback,
        },
      }));
    } else {
      playPopSound();
      const nextAttempt = attempts + 1;
      setAttemptCounts((prev) => ({ ...prev, [question.id]: nextAttempt }));

      setEvaluations((prev) => ({
        ...prev,
        [question.id]: {
          isCorrect: false,
          feedback,
        },
      }));
    }
  };

  const handleNext = (awardedXp?: number) => {
    playSnapSound();
    if (awardedXp && !evaluations[question.id]?.isCorrect) {
      onRewardXp(awardedXp);
    }
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      playFanfareSound();
      setIsCompletedAll(true);
      onAnswersChange?.(typedInputs);
      onFinish?.();
    }
  };

  const handleListenPrompt = (e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    const textToSpeak = (
      question.audioText ||
      rawPrompt ||
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
      <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-6 animate-in zoom-in-95 duration-300 shadow-sm font-sans">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-xs">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black text-[#0D3B66] dark:text-[#F4B41A] uppercase tracking-wider font-mono">
            Practicum Completed
          </span>
          <h3 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
            Writing Mastery Achieved!
          </h3>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            You have completed all {questions.length} active writing challenges with a final score of {totalScore}% ({correctCount}/{questions.length} Correct).
          </p>
        </div>

        <div className="inline-flex items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <span className="text-xs text-slate-400 block font-mono">Writing Accuracy</span>
            <span className="text-xl font-black font-heading text-slate-900 dark:text-white">{totalScore}%</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700" />
          <div className="text-center">
            <span className="text-xs text-slate-400 block font-mono">Total XP Earned</span>
            <span className="text-xl font-black font-heading text-emerald-600 dark:text-emerald-400">+{correctCount * 15} XP</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onFinish}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-md min-h-[46px] border-b-3 border-b-[#082542]"
          >
            <CheckCircle2 className="w-4 h-4 text-[#F4B41A]" />
            <span>Finish &amp; Save Writing Mission</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-[#0D3B66] dark:text-[#F4B41A] uppercase tracking-wider block font-mono">
            Step 5 · Writing Mastery Practicum ({currentIdx + 1}/{questions.length})
          </span>
          <span className="text-xs font-semibold text-slate-500 font-mono">
            {question.typeLabel || "Writing"}
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
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
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        {/* Instruction & Prompt */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono block">
            Question {currentIdx + 1}:
          </span>
          <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white font-heading">
            {displayInstruction}
          </p>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3">
            <span className="text-sm sm:text-base font-mono font-bold text-[#0D3B66] dark:text-[#F4B41A]">
              {displayPrompt}
            </span>
            <button
              type="button"
              onClick={handleListenPrompt}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-700 text-[#0D3B66] dark:text-[#F4B41A] hover:bg-slate-100 transition-colors cursor-pointer shrink-0 shadow-2xs min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200 dark:border-slate-600"
              title="Listen to prompt text"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Database Hint Toggle */}
          {question.hint && (
            <div className="pt-1">
              {!showHintMap[question.id] ? (
                <button
                  type="button"
                  onClick={() => {
                    playSnapSound();
                    setShowHintMap((prev) => ({ ...prev, [question.id]: true }));
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 cursor-pointer transition-colors"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Need a hint? Tap here</span>
                </button>
              ) : (
                <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5 animate-in fade-in duration-200">
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Question Hint:</span>
                    <p className="font-normal leading-relaxed">{question.hint}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Typing Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block font-heading">
            Your Written Answer:
          </label>
          <input
            type="text"
            value={userText}
            onChange={(e) => {
              const val = e.target.value;
              const updated = { ...typedInputs, [question.id]: val };
              setTypedInputs(updated);
              onAnswersChange?.(updated);
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
            className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D3B66] dark:focus:ring-[#F4B41A] min-h-[48px]"
          />
        </div>

        {/* Evaluation Output */}
        {currentEval?.feedback && (
          <div
            className={`p-5 rounded-2xl text-xs space-y-2 animate-in fade-in duration-200 ${
              currentEval.isCorrect
                ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                : "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 text-xs sm:text-sm">
              {currentEval.isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Correct Answer (+15 XP)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Needs Review</span>
                </>
              )}
            </div>
            <p className="leading-relaxed text-xs sm:text-sm">{currentEval.feedback}</p>
            {currentEval.isCorrect ? (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                Explanation: {question.explanation || (validTargets[0] ? `Accepted: "${validTargets[0]}"` : "Completed accurately.")}
              </p>
            ) : (
              (attempts >= 2 && validTargets[0]) && (
                <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-100 space-y-1">
                  <span className="font-bold font-mono text-[11px] uppercase tracking-wide block">
                    Accepted Model Answer:
                  </span>
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 font-mono font-semibold text-xs border border-amber-300/60 dark:border-amber-800">
                    {validTargets[0]}
                  </div>
                  {question.explanation && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-normal">
                      {question.explanation}
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {/* Footer Controls */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
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
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer min-h-[44px] w-full sm:w-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear &amp; Retype</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {isAdmin && !currentEval?.isCorrect && (
              <button
                type="button"
                onClick={() => handleNext()}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-dashed border-amber-400 text-amber-600 dark:text-amber-400 font-bold text-xs hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all cursor-pointer min-h-[44px]"
              >
                <span>Skip Question (Admin)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentEval ? (
              currentEval.isCorrect ? (
                <button
                  type="button"
                  onClick={() => handleNext()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl btn-skeuo-yellow text-slate-950 font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-xs min-h-[46px] w-full sm:w-auto"
                >
                  <span>
                    {currentIdx + 1 < questions.length
                      ? "Next Question"
                      : "View Summary Results"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCheckAnswer}
                    disabled={!userText.trim()}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl border border-[#0D3B66] text-[#0D3B66] dark:text-[#F4B41A] font-bold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer shadow-2xs min-h-[46px] w-full sm:w-auto"
                  >
                    <Send className="w-4 h-4" />
                    <span>Check Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!evaluations[question.id]?.isCorrect) {
                        onRewardXp(5);
                      }
                      handleNext();
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-xs min-h-[46px] w-full sm:w-auto border-b-3 border-b-[#082542]"
                  >
                    <span>
                      {currentIdx + 1 < questions.length
                        ? "Continue to Next"
                        : "View Summary"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )
            ) : (
              <button
                type="button"
                onClick={handleCheckAnswer}
                disabled={!userText.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer disabled:opacity-40 shadow-xs min-h-[46px] w-full sm:w-auto border-b-3 border-b-[#082542]"
              >
                <Send className="w-4 h-4" />
                <span>Check Answer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
