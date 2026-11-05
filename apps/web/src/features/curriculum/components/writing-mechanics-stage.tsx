"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Volume2,
  RotateCcw,
  Send,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import { playPopSound, playSnapSound, playMatchSuccessSound } from "@/lib/sound-fx";
import { evaluateWritingAnswer } from "./writing-practicum-utils";

export interface MechanicsChallenge {
  id: string;
  faultySentence: string;
  targetSentence: string;
  translation: string;
  keyRule: string;
  requiredCapitals: string[];
}

interface WritingMechanicsStageProps {
  practiceSec?: any;
  onRewardXp: (amount: number) => void;
  tutor: any;
  onGoToNext?: () => void;
}

export function WritingMechanicsStage({
  practiceSec,
  onRewardXp,
  tutor,
  onGoToNext,
}: WritingMechanicsStageProps) {
  const challenges: MechanicsChallenge[] =
    practiceSec?.content?.mechanicsChallenges || [];

  const [activeIdx, setActiveIdx] = useState(0);
  const [typedAnswers, setTypedAnswers] = useState<Record<string, string>>({});
  const [validationStates, setValidationStates] = useState<
    Record<string, { isCorrect: boolean; feedback: string }>
  >({});
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({});
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  if (challenges.length === 0) {
    return (
      <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm font-sans">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          No sentence mechanics challenges available for this module yet.
        </p>
        {onGoToNext && (
          <button
            type="button"
            onClick={onGoToNext}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0D3B66] text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer min-h-[46px]"
          >
            <span>Continue to Next Step</span>
            <ArrowRight className="w-4 h-4 text-[#F4B41A]" />
          </button>
        )}
      </div>
    );
  }

  const currentChallenge = challenges[activeIdx] || challenges[0];
  const userText = (currentChallenge ? typedAnswers[currentChallenge.id] : "") || "";
  const validation = currentChallenge ? validationStates[currentChallenge.id] : null;
  const attempts = currentChallenge ? attemptCounts[currentChallenge.id] || 0 : 0;

  // Live mechanics checks
  const hasCapitalStart = /^[A-Z]/.test(userText.trim());
  const hasTerminalPeriod = /[.!?]$/.test(userText.trim());
  const allRequiredCapsPresent = (currentChallenge?.requiredCapitals || []).every((cap) =>
    userText.includes(cap)
  );

  const handleValidate = () => {
    const evalRes = evaluateWritingAnswer(userText, [currentChallenge.targetSentence]);

    if (evalRes.isCorrect) {
      playMatchSuccessSound();
      setValidationStates((prev) => ({
        ...prev,
        [currentChallenge.id]: {
          isCorrect: true,
          feedback: evalRes.feedback,
        },
      }));
      if (!completedMap[currentChallenge.id]) {
        setCompletedMap((prev) => ({ ...prev, [currentChallenge.id]: true }));
        onRewardXp(evalRes.isNearMatch ? 12 : 15);
      }
    } else {
      playPopSound();
      const nextAttempts = attempts + 1;
      setAttemptCounts((prev) => ({ ...prev, [currentChallenge.id]: nextAttempts }));
      setValidationStates((prev) => ({
        ...prev,
        [currentChallenge.id]: {
          isCorrect: false,
          feedback: evalRes.feedback,
        },
      }));
    }
  };

  const handleNextChallenge = (awardedXp?: number) => {
    playSnapSound();
    if (awardedXp && !completedMap[currentChallenge.id]) {
      setCompletedMap((prev) => ({ ...prev, [currentChallenge.id]: true }));
      onRewardXp(awardedXp);
    }

    if (activeIdx + 1 < challenges.length) {
      setActiveIdx((prev) => prev + 1);
    } else if (onGoToNext) {
      onGoToNext();
    }
  };

  const handleListenTarget = (e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    const textToSpeak = (
      validation?.isCorrect
        ? currentChallenge?.targetSentence
        : currentChallenge?.faultySentence || ""
    )
      .replace(/[\/]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (textToSpeak) {
      tutor?.playTutorAudio?.(textToSpeak);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      {/* Title Header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-[#0D3B66] dark:text-[#F4B41A] uppercase tracking-wider block font-mono">
            Step 2 · Mechanics &amp; Error Correction ({activeIdx + 1}/{challenges.length})
          </span>
          <span className="text-xs font-semibold text-slate-500 font-mono">
            Sentence Mechanics
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
          Detect &amp; Fix Sentence Mechanics
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Find missing capital letters and missing terminal punctuation, then retype the full corrected sentence below.
        </p>
      </div>

      {/* Challenge Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 w-fit">
        {challenges.map((c, idx) => {
          const isDone = completedMap[c.id];
          const isActive = idx === activeIdx;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                playPopSound();
                setActiveIdx(idx);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                isActive
                  ? "bg-[#0D3B66] text-white border-b-2 border-[#082542] shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <span>Sentence {idx + 1}</span>
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#F4B41A]" />}
            </button>
          );
        })}
      </div>

      {/* Active Writing Workspace */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        {/* Sentence With Errors to Fix */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono block">
            Sentence with Faulty Mechanics:
          </span>
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-3">
            <span className="text-sm sm:text-base font-mono font-bold text-rose-900 dark:text-rose-200">
              &ldquo;{currentChallenge.faultySentence}&rdquo;
            </span>
            <button
              type="button"
              onClick={handleListenTarget}
              className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800 text-[#0D3B66] dark:text-[#F4B41A] hover:bg-white transition-colors cursor-pointer shrink-0 shadow-2xs min-h-[44px] min-w-[44px] flex items-center justify-center border border-rose-200 dark:border-rose-800"
              title="Listen to sentence audio"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 italic">
            Target Meaning: &ldquo;{currentChallenge.translation}&rdquo;
          </div>
        </div>

        {/* Input Text Area for Student Writing */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block font-heading">
            Type the Corrected Sentence:
          </label>
          <input
            type="text"
            value={userText}
            onChange={(e) => {
              const val = e.target.value;
              setTypedAnswers((prev) => ({ ...prev, [currentChallenge.id]: val }));
              if (validation) {
                setValidationStates((prev) => ({
                  ...prev,
                  [currentChallenge.id]: { isCorrect: false, feedback: "" },
                }));
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && userText.trim()) {
                handleValidate();
              }
            }}
            placeholder="Type sentence with proper capitalization and terminal period..."
            className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D3B66] dark:focus:ring-[#F4B41A] min-h-[48px]"
          />
        </div>

        {/* Live Mechanics Guidance Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div
            className={`p-3 rounded-2xl border flex items-center gap-2 transition-colors ${
              hasCapitalStart
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold"
                : "bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Capitalized Initial Letter</span>
          </div>

          <div
            className={`p-3 rounded-2xl border flex items-center gap-2 transition-colors ${
              allRequiredCapsPresent
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold"
                : "bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Proper Noun / Country Caps</span>
          </div>

          <div
            className={`p-3 rounded-2xl border flex items-center gap-2 transition-colors ${
              hasTerminalPeriod
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold"
                : "bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Terminal Period (.)</span>
          </div>
        </div>

        {/* Model Answer Fallback on Attempt >= 2 */}
        {attempts >= 2 && !validation?.isCorrect && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-100 space-y-1.5 animate-in fade-in duration-200">
            <span className="font-bold uppercase tracking-wider font-mono text-[11px] block text-amber-800 dark:text-amber-300">
              Accepted Model Sentence:
            </span>
            <p className="font-mono text-xs sm:text-sm font-semibold bg-white/80 dark:bg-slate-900/70 p-2.5 rounded-xl border border-amber-300/60 dark:border-amber-800">
              {currentChallenge.targetSentence}
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-300">
              Rule: {currentChallenge.keyRule}
            </p>
          </div>
        )}

        {/* Validation Result Box */}
        {validation?.feedback && (
          <div
            className={`p-5 rounded-2xl text-xs space-y-1.5 animate-in fade-in duration-200 ${
              validation.isCorrect
                ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                : "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 text-xs sm:text-sm">
              {validation.isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Great! Correct Answer (+15 XP)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Needs Improvement</span>
                </>
              )}
            </div>
            <p className="leading-relaxed text-xs sm:text-sm">{validation.feedback}</p>
            {validation.isCorrect && (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                Rule: {currentChallenge.keyRule}
              </p>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              playPopSound();
              setTypedAnswers((prev) => ({ ...prev, [currentChallenge.id]: "" }));
              setValidationStates((prev) => ({
                ...prev,
                [currentChallenge.id]: { isCorrect: false, feedback: "" },
              }));
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer min-h-[44px] w-full sm:w-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Input</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {validation?.isCorrect ? (
              <button
                type="button"
                onClick={() => handleNextChallenge()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl btn-skeuo-yellow text-slate-950 font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-xs min-h-[46px] w-full sm:w-auto"
              >
                <span>
                  {activeIdx + 1 < challenges.length
                    ? "Next Challenge"
                    : "Complete Stage & Continue"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : attempts >= 2 ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleValidate}
                  disabled={!userText.trim()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-[#0D3B66] text-[#0D3B66] dark:text-[#F4B41A] font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-2xs min-h-[46px] w-full sm:w-auto"
                >
                  <span>Check Again</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNextChallenge(5)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-xs min-h-[46px] w-full sm:w-auto border-b-3 border-b-[#082542]"
                >
                  <span>
                    {activeIdx + 1 < challenges.length
                      ? "Continue to Next"
                      : "Complete Stage"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleValidate}
                disabled={!userText.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer disabled:opacity-40 shadow-xs min-h-[46px] w-full sm:w-auto border-b-3 border-b-[#082542]"
              >
                <Send className="w-4 h-4" />
                <span>Check Sentence</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
