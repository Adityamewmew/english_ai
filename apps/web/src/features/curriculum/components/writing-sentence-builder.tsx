"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Volume2,
  RotateCcw,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import {
  playPopSound,
  playSnapSound,
  playMatchSuccessSound,
} from "@/lib/sound-fx";
import {
  evaluateWritingAnswer,
  cleanAlphanumeric,
} from "./writing-practicum-utils";

export interface SentenceBuilderTarget {
  id: string;
  category: string;
  meaning: string;
  tokens: string[];
  fullSentence: string;
}

interface WritingSentenceBuilderProps {
  practiceSec?: any;
  onRewardXp: (amount: number) => void;
  tutor: any;
  onGoToNext?: () => void;
}

export function WritingSentenceBuilder({
  practiceSec,
  onRewardXp,
  tutor,
  onGoToNext,
}: WritingSentenceBuilderProps) {
  const targets: SentenceBuilderTarget[] =
    practiceSec?.content?.sentenceBuilderTargets || [];

  const [currentTargetIdx, setCurrentTargetIdx] = useState(0);
  const currentTarget = targets[currentTargetIdx] || {
    id: "empty",
    category: "Writing",
    meaning: "Choose words to build the sentence.",
    tokens: [],
    fullSentence: "",
  };

  // Helper to shuffle
  const shuffleWords = (arr: string[] = []) => {
    return [...(arr || [])].sort(() => Math.random() - 0.5);
  };

  const [availableWords, setAvailableWords] = useState<string[]>(() =>
    shuffleWords(currentTarget?.tokens || [])
  );
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [builderStatus, setBuilderStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({});
  const [completedTargets, setCompletedTargets] = useState<Record<string, boolean>>({});

  const attempts = attemptCounts[currentTarget.id] || 0;

  const handleWordClick = (word: string, fromSelected: boolean, index: number) => {
    playSnapSound();
    if (fromSelected) {
      setSelectedWords((prev) => prev.filter((_, i) => i !== index));
      setAvailableWords((prev) => [...prev, word]);
    } else {
      setAvailableWords((prev) => prev.filter((_, i) => i !== index));
      setSelectedWords((prev) => [...prev, word]);
    }
    setBuilderStatus("idle");
  };

  const handleCheckSentence = () => {
    const built = selectedWords.join(" ");
    const targetsToCompare = [
      currentTarget.fullSentence,
      currentTarget.tokens?.join(" "),
    ].filter((t): t is string => typeof t === "string" && t.trim().length > 0);

    const evalRes = evaluateWritingAnswer(built, targetsToCompare);

    if (evalRes.isCorrect) {
      playMatchSuccessSound();
      setBuilderStatus("correct");
      setFeedbackMessage(evalRes.feedback);
      if (!completedTargets[currentTarget.id]) {
        setCompletedTargets((prev) => ({ ...prev, [currentTarget.id]: true }));
        onRewardXp(evalRes.isNearMatch ? 15 : 20);
      }
    } else {
      playPopSound();
      setBuilderStatus("wrong");
      setAttemptCounts((prev) => ({ ...prev, [currentTarget.id]: attempts + 1 }));
      setFeedbackMessage(evalRes.feedback);
    }
  };

  const handleNextTarget = (awardedXp?: number) => {
    playSnapSound();
    if (awardedXp && !completedTargets[currentTarget.id]) {
      setCompletedTargets((prev) => ({ ...prev, [currentTarget.id]: true }));
      onRewardXp(awardedXp);
    }

    if (currentTargetIdx + 1 < targets.length) {
      const nextIdx = currentTargetIdx + 1;
      setCurrentTargetIdx(nextIdx);
      const nextTarget = targets[nextIdx];
      setAvailableWords(shuffleWords(nextTarget?.tokens || []));
      setSelectedWords([]);
      setBuilderStatus("idle");
      setFeedbackMessage("");
    } else if (onGoToNext) {
      onGoToNext();
    }
  };

  const handleResetCurrent = () => {
    playPopSound();
    setAvailableWords(shuffleWords(currentTarget.tokens));
    setSelectedWords([]);
    setBuilderStatus("idle");
  };

  const handleListenTarget = (e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    const textToSpeak = (
      currentTarget?.fullSentence ||
      currentTarget?.tokens?.join(" ") ||
      ""
    )
      .replace(/[\/]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (textToSpeak) {
      tutor?.playTutorAudio?.(textToSpeak);
    }
  };

  // Diagnostic placement count
  const matchingWordCount = selectedWords.filter(
    (w, i) => cleanAlphanumeric(w) === cleanAlphanumeric(currentTarget.tokens[i] || "")
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      {/* Title Header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-[#0D3B66] dark:text-[#F4B41A] uppercase tracking-wider block font-mono">
            Step 3 · Word Chip Sentence Builder ({currentTargetIdx + 1}/{targets.length})
          </span>
          <span className="text-xs font-semibold text-slate-500 font-mono">
            Category: {currentTarget.category}
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
          Assemble Word Chips into Complete Sentences
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Tap the word chips below to place them onto the sentence canvas in the correct syntactic order.
        </p>
      </div>

      {/* Target Navigation Badges */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 w-fit">
        {targets.map((t: SentenceBuilderTarget, idx: number) => {
          const isDone = completedTargets[t.id];
          const isActive = idx === currentTargetIdx;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                playPopSound();
                setCurrentTargetIdx(idx);
                setAvailableWords(shuffleWords(t.tokens));
                setSelectedWords([]);
                setBuilderStatus("idle");
                setFeedbackMessage("");
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

      {/* Main Builder Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        {/* Meaning Prompt */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono block">
              Target Sentence Meaning:
            </span>
            <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
              &ldquo;{currentTarget.meaning}&rdquo;
            </p>
          </div>
          <button
            type="button"
            onClick={handleListenTarget}
            className="p-3 rounded-2xl bg-white dark:bg-slate-700 hover:bg-slate-100 text-[#0D3B66] dark:text-[#F4B41A] transition-colors cursor-pointer shrink-0 shadow-2xs min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200 dark:border-slate-600"
            title="Listen to target sentence pronunciation"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Words Canvas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 font-heading">
              Sentence Canvas:
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">
              Tap a chip to return it to the word bank
            </span>
          </div>
          <div className="min-h-[88px] p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-2 border-dashed border-[#0D3B66]/30 dark:border-[#F4B41A]/30 flex flex-wrap items-center gap-2.5">
            {selectedWords.length === 0 ? (
              <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                Tap words from the bank below to begin assembling the sentence...
              </span>
            ) : (
              selectedWords.map((word, idx) => (
                <button
                  key={`${word}-${idx}`}
                  type="button"
                  onClick={() => handleWordClick(word, true, idx)}
                  className="px-4 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer min-h-[44px] flex items-center gap-1.5 border-b-2 border-b-[#082542]"
                >
                  <span>{word}</span>
                  <span className="text-[10px] opacity-70">✕</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Available Word Bank */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono block">
            Word Bank:
          </span>
          <div className="flex flex-wrap gap-2.5">
            {availableWords.map((word, idx) => (
              <button
                key={`${word}-${idx}`}
                type="button"
                onClick={() => handleWordClick(word, false, idx)}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 border-b-3 border-b-slate-300 dark:border-b-slate-700 hover:border-[#0D3B66] dark:hover:border-[#F4B41A] transition-all cursor-pointer shadow-2xs active:border-b active:translate-y-0.5 min-h-[44px]"
              >
                {word}
              </button>
            ))}
            {availableWords.length === 0 && (
              <span className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                All words have been placed onto the canvas.
              </span>
            )}
          </div>
        </div>

        {/* Model Answer Fallback on Attempt >= 2 */}
        {attempts >= 2 && builderStatus === "wrong" && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-100 space-y-1.5 animate-in fade-in duration-200">
            <span className="font-bold uppercase tracking-wider font-mono text-[11px] block text-amber-800 dark:text-amber-300">
              Target Model Sentence:
            </span>
            <p className="font-mono text-xs sm:text-sm font-semibold bg-white/80 dark:bg-slate-900/70 p-2.5 rounded-xl border border-amber-300/60 dark:border-amber-800">
              {currentTarget.fullSentence || currentTarget.tokens.join(" ")}
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-300">
              You can rearrange your chips to match the model sentence, or continue to the next item.
            </p>
          </div>
        )}

        {/* Feedback & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleResetCurrent}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer min-h-[44px] w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Words</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
            {builderStatus === "correct" && (
              <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{feedbackMessage || "Correct Syntax & Order (+20 XP)!"}</span>
              </span>
            )}
            {builderStatus === "wrong" && (
              <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>
                  {matchingWordCount > 0
                    ? `${matchingWordCount} of ${selectedWords.length} words are correctly placed. Try reordering the remaining chips!`
                    : "Word order needs review. Tap the speaker icon above to hear the cadence."}
                </span>
              </div>
            )}

            {builderStatus === "correct" ? (
              <button
                type="button"
                onClick={() => handleNextTarget()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl btn-skeuo-yellow text-slate-950 font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-xs min-h-[46px] w-full sm:w-auto"
              >
                <span>
                  {currentTargetIdx + 1 < targets.length
                    ? "Next Sentence"
                    : "Complete Stage & Continue"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : attempts >= 2 ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCheckSentence}
                  disabled={selectedWords.length === 0}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-[#0D3B66] text-[#0D3B66] dark:text-[#F4B41A] font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-2xs min-h-[46px] w-full sm:w-auto"
                >
                  <span>Check Again</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNextTarget(5)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-xs min-h-[46px] w-full sm:w-auto border-b-3 border-b-[#082542]"
                >
                  <span>
                    {currentTargetIdx + 1 < targets.length
                      ? "Continue to Next"
                      : "Complete Stage"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCheckSentence}
                disabled={selectedWords.length === 0}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0D3B66] hover:bg-[#1B4965] text-white font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer disabled:opacity-40 shadow-xs min-h-[46px] w-full sm:w-auto border-b-3 border-b-[#082542]"
              >
                <span>Check Sentence</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
