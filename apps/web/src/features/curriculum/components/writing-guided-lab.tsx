"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Check,
  Send,
  RotateCcw,
  ArrowRight,
  Lightbulb,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { playPopSound, playSnapSound, playMatchSuccessSound } from "@/lib/sound-fx";

export interface LabChallenge {
  id: string;
  title: string;
  badge: string;
  icon: "user" | "users" | "star";
  instruction: string;
  example: string;
  placeholder: string;
  minWords: number;
  requiredKeywords?: string[];
  xpReward: number;
}

interface WritingGuidedLabProps {
  practiceSec?: any;
  onRewardXp: (amount: number) => void;
  onGoToNext?: () => void;
}

export function WritingGuidedLab({
  practiceSec,
  onRewardXp,
  onGoToNext,
}: WritingGuidedLabProps) {
  const challenges: LabChallenge[] =
    practiceSec?.content?.guidedLabChallenges || [];

  const [activeIdx, setActiveIdx] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [submittedMap, setSubmittedMap] = useState<Record<string, boolean>>({});
  const [pasteWarning, setPasteWarning] = useState(false);

  const currentChallenge = challenges[activeIdx] || {
    id: "empty",
    title: "Writing Challenge",
    badge: "Writing",
    icon: "user",
    instruction: "Write an English paragraph...",
    example: "",
    placeholder: "Start writing here...",
    minWords: 10,
    xpReward: 30,
  };
  const writtenText = drafts[currentChallenge.id] || "";
  const isSubmitted = submittedMap[currentChallenge.id];

  // Mechanics analysis
  const words = writtenText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const hasCapitalLetter = /^[A-Z]/.test(writtenText.trim()) || /[A-Z]/.test(writtenText);
  const hasTerminalPunctuation = /[.!?]$/.test(writtenText.trim()) || /[.!?]/.test(writtenText);
  const isWordCountPassed = wordCount >= currentChallenge.minWords;

  // Verbatim copy check: disallow retyping the example verbatim!
  const cleanNorm = (str: string) =>
    (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const isVerbatimCopy =
    Boolean(currentChallenge.example) &&
    cleanNorm(writtenText).length > 15 &&
    cleanNorm(writtenText) === cleanNorm(currentChallenge.example);

  const isOriginal = !isVerbatimCopy && wordCount > 0;

  const allCriteriaPassed =
    isWordCountPassed &&
    hasCapitalLetter &&
    hasTerminalPunctuation &&
    !isVerbatimCopy;

  const handleSubmitChallenge = () => {
    if (!allCriteriaPassed) return;
    playMatchSuccessSound();
    setSubmittedMap((prev) => ({ ...prev, [currentChallenge.id]: true }));
    onRewardXp(currentChallenge.xpReward);
  };

  const handleNextChallenge = () => {
    playSnapSound();
    if (activeIdx + 1 < challenges.length) {
      setActiveIdx((prev) => prev + 1);
    } else if (onGoToNext) {
      onGoToNext();
    }
  };

  const completedCount = Object.keys(submittedMap).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0D3B66] dark:text-[#F4B41A] uppercase tracking-wider block font-mono">
            Step 4 · Guided Writing Studio ({completedCount}/{challenges.length} Completed)
          </span>
          <span className="text-xs font-bold text-slate-500 font-mono">
            {challenges.length} Writing Challenges
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
          Paragraph Writing Studio
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Write an English paragraph based on the prompt, paying close attention to grammar rules and sentence structure.
        </p>
      </div>

      {/* Tabs (Horizontal Swipeable Rail on Mobile) */}
      <div className="overflow-x-auto no-scrollbar -mx-1 px-1 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 w-max sm:w-fit">
          {challenges.map((ch, idx) => {
            const isDone = submittedMap[ch.id];
            const isActive = idx === activeIdx;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  playPopSound();
                  setActiveIdx(idx);
                }}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[38px] touch-manipulation select-none shrink-0 ${
                  isActive
                    ? "bg-[#0D3B66] text-white border-b-2 border-[#082542] shadow-xs"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <span>{ch.badge}</span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#F4B41A]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Challenge Editor Box */}
      <div className="p-4 sm:p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-b-3 border-b-slate-300 dark:border-b-slate-700 shadow-sm space-y-4 sm:space-y-5">
        {/* Scenario Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0D3B66] dark:text-[#F4B41A] uppercase tracking-wider font-mono">
              {currentChallenge.title}
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">
              Reward: +{currentChallenge.xpReward} XP
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
            {currentChallenge.instruction}
          </p>
          {/* Independent Writing Guidance (No answer leaked) */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Independent Writing Guide:</span>
              <span className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Express your thoughts in your own words. Begin sentences with a capital letter, use complete sentence structures, and end with terminal punctuation (. or ?).
              </span>
            </div>
          </div>
        </div>

        {/* Textarea Input with Anti-Paste */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
            Writing Workspace:
          </label>
          <textarea
            rows={4}
            value={writtenText}
            onChange={(e) => {
              const val = e.target.value;
              setDrafts((prev) => ({ ...prev, [currentChallenge.id]: val }));
            }}
            onPaste={(e) => {
              e.preventDefault();
              setPasteWarning(true);
              setTimeout(() => setPasteWarning(false), 3500);
            }}
            placeholder="Type your own English sentence or paragraph here..."
            className="w-full p-3.5 sm:p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D3B66] dark:focus:ring-[#F4B41A] leading-relaxed shadow-inner"
          />
        </div>

        {/* Anti-Cheat Warning Banners */}
        {pasteWarning && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2 animate-in fade-in duration-200">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Pasting is disabled. Please type your sentences independently.</span>
          </div>
        )}
        {isVerbatimCopy && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Exact match to model answer detected. Please compose your own original sentence!</span>
          </div>
        )}

        {/* Automated Mechanics Checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div
            className={`p-2.5 rounded-xl border flex items-center gap-1.5 transition-colors ${
              isWordCountPassed
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold"
                : "bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>
              {wordCount} Words (Min {currentChallenge.minWords})
            </span>
          </div>

          <div
            className={`p-2.5 rounded-xl border flex items-center gap-1.5 transition-colors ${
              hasCapitalLetter
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold"
                : "bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>Capital Letter (A-Z)</span>
          </div>

          <div
            className={`p-2.5 rounded-xl border flex items-center gap-1.5 transition-colors ${
              hasTerminalPunctuation
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold"
                : "bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>Punctuation (. / ?)</span>
          </div>

          <div
            className={`p-2.5 rounded-xl border flex items-center gap-1.5 transition-colors ${
              isOriginal
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold"
                : "bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>Original Writing</span>
          </div>
        </div>

        {/* Feedback Message */}
        {isSubmitted && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Challenge Completed! (+{currentChallenge.xpReward} XP)</span>
            </span>
            <p>
              Your written paragraph satisfies all core CEFR grammatical requirements.
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              playPopSound();
              setDrafts((prev) => ({ ...prev, [currentChallenge.id]: "" }));
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer min-h-[44px] touch-manipulation w-full sm:w-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Text</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isSubmitted && activeIdx + 1 < challenges.length ? (
              <button
                type="button"
                onClick={handleNextChallenge}
                className="inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-2xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-xs min-h-[46px] touch-manipulation w-full sm:w-auto border-b-3 border-b-[#082542]"
              >
                <span>Next Challenge</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitChallenge}
                disabled={!allCriteriaPassed}
                className={`inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-xs min-h-[46px] touch-manipulation w-full sm:w-auto ${
                  allCriteriaPassed
                    ? "btn-skeuo-yellow text-slate-950 cursor-pointer active:scale-95"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Submit &amp; Evaluate Paragraph</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
