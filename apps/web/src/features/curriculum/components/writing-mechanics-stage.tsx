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
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  if (challenges.length === 0) {
    return (
      <div className="p-8 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          No sentence mechanics challenges available for this module yet.
        </p>
        {onGoToNext && (
          <button
            type="button"
            onClick={onGoToNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0D3B66] text-white text-xs font-bold shadow-xs cursor-pointer"
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
  const isDone = currentChallenge ? completedMap[currentChallenge.id] : false;

  // Live mechanics checks
  const hasCapitalStart = /^[A-Z]/.test(userText.trim());
  const hasTerminalPeriod = /[.!?]$/.test(userText.trim());
  const allRequiredCapsPresent = (currentChallenge?.requiredCapitals || []).every((cap) =>
    userText.includes(cap)
  );

  const normalizeSentence = (str: string) => {
    return str
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\s*([,.;?!])\s*/g, "$1 ")
      .trim();
  };

  const handleValidate = () => {
    const normalizedUser = normalizeSentence(userText);
    const normalizedTarget = normalizeSentence(currentChallenge.targetSentence);

    if (normalizedUser === normalizedTarget) {
      playMatchSuccessSound();
      setValidationStates((prev) => ({
        ...prev,
        [currentChallenge.id]: {
          isCorrect: true,
          feedback: "Perfect! All capitalization and punctuation mechanics are written accurately.",
        },
      }));
      if (!completedMap[currentChallenge.id]) {
        setCompletedMap((prev) => ({ ...prev, [currentChallenge.id]: true }));
        onRewardXp(15);
      }
    } else {
      playPopSound();
      let hint = "Check spelling, spacing, capitalization, and punctuation again.";
      if (!hasCapitalStart) {
        hint = "The first letter of the sentence must be capitalized.";
      } else if (!hasTerminalPeriod) {
        hint = "Don't forget to include a period (.) at the end of the sentence without a space before it.";
      } else if (!allRequiredCapsPresent) {
        const missing = currentChallenge.requiredCapitals.filter(
          (c) => !userText.includes(c)
        );
        hint = `Make sure these words are capitalized: ${missing.join(", ")}.`;
      }
      setValidationStates((prev) => ({
        ...prev,
        [currentChallenge.id]: {
          isCorrect: false,
          feedback: hint,
        },
      }));
    }
  };

  const handleNextChallenge = () => {
    playSnapSound();
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

  const completedCount = Object.keys(completedMap).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0D3B66] dark:text-[#F4B41A] uppercase tracking-wider block font-mono">
            Step 2 · Real Writing &amp; Mechanics Correction
          </span>
          <span className="text-xs font-bold text-slate-500 font-mono">
            {completedCount}/{challenges.length} Completed
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
          Sentence Rewrite &amp; Mechanics Drill
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Rewrite the sentence below accurately by applying capitalization and punctuation rules.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 w-fit">
        {challenges.map((ch: MechanicsChallenge, idx: number) => {
          const isChallengeDone = completedMap[ch.id];
          const isActive = idx === activeIdx;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => {
                playPopSound();
                setActiveIdx(idx);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#0D3B66] text-white border-b-2 border-[#082542] shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <span>Challenge {idx + 1}</span>
              {isChallengeDone && (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#F4B41A]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Writing Workspace */}
      <div className="p-6 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-b-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
        {/* Sentence With Errors to Fix */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono block">
            Uncorrected Sentence:
          </span>
          <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-3">
            <span className="text-sm sm:text-base font-mono font-bold text-rose-900 dark:text-rose-200">
              &ldquo;{currentChallenge.faultySentence}&rdquo;
            </span>
            <button
              type="button"
              onClick={handleListenTarget}
              className="p-2 rounded-lg bg-white/80 dark:bg-slate-800 text-[#0D3B66] dark:text-[#F4B41A] hover:bg-white transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Listen to sentence audio"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 italic">
            Translation: &ldquo;{currentChallenge.translation}&rdquo;
          </div>
        </div>

        {/* Input Text Area for Student Writing */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
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
            placeholder="Type the sentence with proper capitalization and period..."
            onPaste={(e) => e.preventDefault()}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D3B66] dark:focus:ring-[#F4B41A]"
          />
        </div>

        {/* Live Mechanics Guidance Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div
            className={`p-2.5 rounded-xl border flex items-center gap-1.5 transition-colors ${
              hasCapitalStart
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : "bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Capitalized Initial Letter</span>
          </div>

          <div
            className={`p-2.5 rounded-xl border flex items-center gap-1.5 transition-colors ${
              allRequiredCapsPresent
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : "bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Proper Noun / Country Caps</span>
          </div>

          <div
            className={`p-2.5 rounded-xl border flex items-center gap-1.5 transition-colors ${
              hasTerminalPeriod
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : "bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Terminal Period (.)</span>
          </div>
        </div>

        {/* Validation Result Box */}
        {validation?.feedback && (
          <div
            className={`p-4 rounded-xl text-xs space-y-1.5 ${
              validation.isCorrect
                ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                : "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
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
            <p className="leading-relaxed">{validation.feedback}</p>
            {validation.isCorrect && (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                Rule: {currentChallenge.keyRule}
              </p>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Input</span>
          </button>

          <div className="flex items-center gap-3">
            {validation?.isCorrect && activeIdx + 1 < challenges.length ? (
              <button
                type="button"
                onClick={handleNextChallenge}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <span>Next Challenge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleValidate}
                disabled={!userText.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-40 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Check Sentence</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
