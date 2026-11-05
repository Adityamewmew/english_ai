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
import { normalizeWritingInput } from "./writing-practicum-utils";

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
  const [validationHint, setValidationHint] = useState<string | null>(null);

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
  const normalizedText = normalizeWritingInput(writtenText);
  const words = normalizedText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentenceCount = writtenText.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;

  const hasCapitalLetter = /^[A-Z]/.test(writtenText.trim()) || /[A-Z]/.test(writtenText);
  const hasTerminalPunctuation = /[.!?]$/.test(writtenText.trim());
  
  // Allow passing if wordCount reaches requirement, OR if student wrote at least 3 sentences with 8+ words
  const isWordCountPassed =
    wordCount >= currentChallenge.minWords || (sentenceCount >= 3 && wordCount >= 8);

  // Verbatim copy check: disallow retyping model example verbatim
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
    if (!writtenText.trim()) {
      playPopSound();
      setValidationHint("Please write your paragraph before submitting.");
      return;
    }

    if (!hasCapitalLetter) {
      playPopSound();
      setValidationHint("Remember to start your paragraph with a capital letter (A-Z).");
      return;
    }

    if (!hasTerminalPunctuation) {
      playPopSound();
      setValidationHint("Please end your paragraph with a terminal punctuation mark (. or ?).");
      return;
    }

    if (!isWordCountPassed) {
      playPopSound();
      setValidationHint(
        `Write at least ${currentChallenge.minWords} words (currently ${wordCount} words) or at least 3 complete sentences.`
      );
      return;
    }

    if (isVerbatimCopy) {
      playPopSound();
      setValidationHint("Exact copy of model answer detected. Please compose your own original sentences!");
      return;
    }

    setValidationHint(null);
    playMatchSuccessSound();
    setSubmittedMap((prev) => ({ ...prev, [currentChallenge.id]: true }));
    onRewardXp(currentChallenge.xpReward);
  };

  const handleNextChallenge = () => {
    playSnapSound();
    setValidationHint(null);
    if (activeIdx + 1 < challenges.length) {
      setActiveIdx((prev) => prev + 1);
    } else if (onGoToNext) {
      onGoToNext();
    }
  };

  const completedCount = Object.keys(submittedMap).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      {/* Title Header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-[#0D3B66] dark:text-[#F4B41A] uppercase tracking-wider block font-mono">
            Step 4 · Guided Writing Studio ({completedCount}/{challenges.length} Completed)
          </span>
          <span className="text-xs font-semibold text-slate-500 font-mono">
            {challenges.length} Writing Challenges
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
          Paragraph Writing Studio
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Write an English paragraph based on the prompt, applying capitalization rules and sentence structures.
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
                  setValidationHint(null);
                }}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[38px] select-none shrink-0 ${
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
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        {/* Scenario Prompt */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#0D3B66] dark:text-[#F4B41A] uppercase tracking-wider font-mono">
              {currentChallenge.title}
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">
              Reward: +{currentChallenge.xpReward} XP
            </span>
          </div>
          <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed font-heading">
            {currentChallenge.instruction}
          </p>
          {/* Independent Writing Guidance */}
          <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
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
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block font-heading">
            Writing Workspace:
          </label>
          <textarea
            rows={4}
            value={writtenText}
            onChange={(e) => {
              const val = e.target.value;
              setDrafts((prev) => ({ ...prev, [currentChallenge.id]: val }));
              if (validationHint) setValidationHint(null);
            }}
            onPaste={(e) => {
              e.preventDefault();
              setPasteWarning(true);
              setTimeout(() => setPasteWarning(false), 3500);
            }}
            placeholder="Type your own English sentences here..."
            className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D3B66] dark:focus:ring-[#F4B41A] leading-relaxed shadow-inner"
          />
        </div>

        {/* Anti-Cheat / Validation Warning Banners */}
        {pasteWarning && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2 animate-in fade-in duration-200">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Pasting is disabled. Please type your sentences independently.</span>
          </div>
        )}
        {validationHint && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-semibold">{validationHint}</span>
          </div>
        )}

        {/* Automated Mechanics Checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div
            className={`p-3 rounded-2xl border flex items-center gap-2 transition-colors ${
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
            className={`p-3 rounded-2xl border flex items-center gap-2 transition-colors ${
              hasCapitalLetter
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold"
                : "bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>Capital Letter (A-Z)</span>
          </div>

          <div
            className={`p-3 rounded-2xl border flex items-center gap-2 transition-colors ${
              hasTerminalPunctuation
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold"
                : "bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>Punctuation (. / ?)</span>
          </div>

          <div
            className={`p-3 rounded-2xl border flex items-center gap-2 transition-colors ${
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
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
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
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              playPopSound();
              setDrafts((prev) => ({ ...prev, [currentChallenge.id]: "" }));
              setValidationHint(null);
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer min-h-[44px] w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear Text</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isSubmitted && activeIdx + 1 < challenges.length ? (
              <button
                type="button"
                onClick={handleNextChallenge}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-xs min-h-[46px] w-full sm:w-auto border-b-3 border-b-[#082542]"
              >
                <span>Next Challenge</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitChallenge}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-xs min-h-[46px] w-full sm:w-auto ${
                  allCriteriaPassed
                    ? "btn-skeuo-yellow text-slate-950 cursor-pointer active:scale-95"
                    : "bg-[#0D3B66] hover:bg-[#1B4965] text-white cursor-pointer active:scale-95 border-b-3 border-b-[#082542]"
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{allCriteriaPassed ? "Submit Paragraph" : "Check & Submit"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
