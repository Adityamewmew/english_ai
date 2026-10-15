"use client";

import React, { useState } from "react";
import { Volume2, Minimize2, Maximize2 } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import { playPopSound, playSnapSound } from "@/lib/sound-fx";

export interface ContractionPair {
  subject: string;
  verb: string;
  vowelDropped: string;
  remainder: string;
  contracted: string;
  exampleFull: string;
  exampleContracted: string;
}

const DEFAULT_GENERIC_CONTRACTIONS: ContractionPair[] = [
  {
    subject: "I",
    verb: "am",
    vowelDropped: "a",
    remainder: "m",
    contracted: "I'm",
    exampleFull: "I am ready.",
    exampleContracted: "I'm ready.",
  },
  {
    subject: "It",
    verb: "is",
    vowelDropped: "i",
    remainder: "s",
    contracted: "It's",
    exampleFull: "It is good.",
    exampleContracted: "It's good.",
  },
];

interface InteractiveContractionMorpherProps {
  contractions?: ContractionPair[];
  onRewardXp?: (amount: number) => void;
  embedded?: boolean;
}

export function InteractiveContractionMorpher({
  contractions = [],
  embedded = false,
}: InteractiveContractionMorpherProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isContracted, setIsContracted] = useState(false);

  const pairs = contractions.length > 0 ? contractions : DEFAULT_GENERIC_CONTRACTIONS;
  const current = pairs[currentIndex] || pairs[0];

  const speakText = (text: string, rate = 0.9) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectWord = (idx: number, e?: React.MouseEvent) => {
    if (e) animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    setCurrentIndex(idx);
    setIsContracted(false);
  };

  const handleToggleSquash = (e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    if (!isContracted) {
      playSnapSound();
      setIsContracted(true);
      speakText(current.contracted, 1.0);
    } else {
      playPopSound();
      setIsContracted(false);
      speakText(`${current.subject} ${current.verb}`, 0.9);
    }
  };

  return (
    <div
      className={
        embedded
          ? "space-y-5"
          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs"
      }
    >
      {/* 1. Word Pair Selector Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
          Select Pattern:
        </span>
        {pairs.map((item, idx) => {
          const isSelected = currentIndex === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={(e) => handleSelectWord(idx, e)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none ${
                isSelected
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs dark:bg-indigo-500 dark:border-indigo-500"
                  : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <span>
                {item.subject} + {item.verb}
              </span>
              <span
                className={`ml-1.5 font-mono text-[11px] ${
                  isSelected ? "text-amber-200" : "text-slate-400 dark:text-slate-500"
                }`}
              >
                → {item.contracted}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Visual Squash Stage */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-5">
        {/* Stage Status */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isContracted ? "Contracted Form (Informal / Spoken)" : "Full Form (Formal / Written)"}
          </span>
          <span className="text-xs font-medium text-slate-400">
            {isContracted ? "Status: Contracted" : "Status: Separate"}
          </span>
        </div>

        {/* Morphing Word Box */}
        <div className="relative py-10 px-6 flex flex-col items-center justify-center min-h-[150px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
          <div className="flex items-center text-4xl sm:text-5xl md:text-6xl font-black font-mono tracking-tight select-none">
            {/* Subject Pronoun */}
            <span
              className="text-indigo-600 dark:text-indigo-400 transition-transform duration-300 ease-out"
              style={{
                transform: isContracted ? "translateX(4px)" : "translateX(0px)",
              }}
            >
              {current.subject}
            </span>

            {/* Spacer or Apostrophe */}
            {isContracted ? (
              <span className="text-amber-500 dark:text-amber-400 transition-all duration-300 animate-in zoom-in mx-0.5">
                '
              </span>
            ) : (
              <span className="inline-block w-4 transition-all duration-300" />
            )}

            {/* Dropped Vowel */}
            {!isContracted && (
              <span className="text-rose-500 dark:text-rose-400 transition-all duration-300 inline-block">
                {current.vowelDropped}
              </span>
            )}

            {/* Remainder Verb Letters */}
            <span
              className="text-slate-800 dark:text-slate-100 transition-transform duration-300 ease-out"
              style={{
                transform: isContracted ? "translateX(-4px)" : "translateX(0px)",
              }}
            >
              {current.remainder}
            </span>
          </div>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center max-w-md">
            {isContracted
              ? `The vowel '${current.vowelDropped}' is dropped and replaced with an apostrophe (') for faster natural speech.`
              : `Click the squash button to merge '${current.subject} ${current.verb}' into its contracted form.`}
          </p>
        </div>

        {/* Single Squash Button */}
        <div className="flex items-center justify-center pt-1">
          <button
            type="button"
            onClick={handleToggleSquash}
            className={`px-7 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs active:scale-95 ${
              isContracted
                ? "bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600"
            }`}
          >
            {isContracted ? (
              <>
                <Maximize2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <span>Restore to Full Form</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-4 h-4 text-amber-300" />
                <span>Squash Words</span>
              </>
            )}
          </button>
        </div>

        {/* 3. Audio Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Full Form */}
          <button
            type="button"
            onClick={() => speakText(`${current.subject} ${current.verb}`, 0.85)}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-left hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer group"
          >
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Formal Form (Relaxed Tempo)
              </span>
              <span className="text-base font-bold text-slate-800 dark:text-white">
                "{current.subject} {current.verb}"
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
          </button>

          {/* Contracted Form */}
          <button
            type="button"
            onClick={() => speakText(current.contracted, 1.0)}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-left hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer group"
          >
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                Contracted Form (Natural Tempo)
              </span>
              <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                "{current.contracted}"
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-colors shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* 4. Sentence Context Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Example in Sentence:
            </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isContracted ? current.exampleContracted : current.exampleFull}
            </p>
          </div>
          <button
            type="button"
            onClick={() => speakText(isContracted ? current.exampleContracted : current.exampleFull)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            title="Listen to Example Sentence"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
