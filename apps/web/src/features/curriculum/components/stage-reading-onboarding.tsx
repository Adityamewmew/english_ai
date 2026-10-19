"use client";

import React, { useState, useEffect } from "react";
import { Volume2, CheckCircle2 } from "lucide-react";
import { animeButtonPop, animeShake } from "@/lib/anime-effects";
import { playPopSound, playMatchSuccessSound, playErrorSound } from "@/lib/sound-fx";
import { speakTutorText, stopTutorSpeech } from "@/lib/tutor-voice";

interface VocabItem {
  word: string;
  meaning: string;
  ipa?: string;
  collocation?: string;
}

export interface LinguisticTarget {
  themeTitle?: string;
  grammarTopic?: string;
  grammarFormula?: string;
  vocabularyTopic?: string;
  languageFunction?: string;
  keyPatterns?: Array<{
    subject: string;
    be: string;
    example: string;
    desc?: string;
  }>;
  vocabTargets?: Array<{
    word: string;
    transformed: string;
    type: string;
  }>;
}

interface StageReadingOnboardingProps {
  passageTitle: string;
  summaryText: string;
  vocabItems: VocabItem[];
  linguisticTarget?: LinguisticTarget;
  warmupData?: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  onPlayAudio?: (text: string) => void;
  onNextStep?: () => void;
  onRewardXp?: (amount: number) => void;
}

export function StageReadingOnboarding({
  passageTitle,
  summaryText,
  linguisticTarget,
  warmupData,
  onPlayAudio,
  onNextStep,
  onRewardXp,
}: StageReadingOnboardingProps) {
  const [selectedWarmupIndex, setSelectedWarmupIndex] = useState<number | null>(null);
  const [warmupAnswered, setWarmupAnswered] = useState(false);

  const defaultWarmup = {
    prompt: "When reading an introductory text in English, what key information should you scan for first?",
    options: [
      "Names, ages, and country indicator words (from ...)",
      "A complete dictionary to translate every single word without exception",
      "Advanced complex grammar structures",
    ],
    correctIndex: 0,
    explanation:
      "Exactly right! Reading introductions focuses on scanning essential details like names, ages, and countries of origin, rather than translating every single word.",
  };

  const warmup = warmupData || defaultWarmup;

  const handleSelectWarmup = (idx: number, e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    setSelectedWarmupIndex(idx);
    setWarmupAnswered(true);

    if (idx === warmup.correctIndex) {
      playMatchSuccessSound();
      onRewardXp?.(10);
    } else {
      playErrorSound();
      animeShake(e.currentTarget as HTMLElement);
    }
  };

  useEffect(() => {
    return () => {
      stopTutorSpeech();
    };
  }, []);

  const handleSpeak = (text: string, e?: React.MouseEvent) => {
    if (e) animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    if (onPlayAudio) {
      onPlayAudio(text);
      return;
    }
    speakTutorText(text);
  };

  const target = linguisticTarget || {
    themeTitle: "International Profiles",
    grammarTopic: "Verb 'To Be' (am, is, are)",
    grammarFormula: "Subject + am / is / are + Origin / Age / Identity",
    vocabularyTopic: "Countries & Nationalities",
    languageFunction: "Introduce yourself, state age, and country of origin",
    keyPatterns: [
      { subject: "I", be: "am", example: "I'm sixteen years old", desc: "First person" },
      { subject: "He / She", be: "is", example: "He is from Spain", desc: "Singular" },
      { subject: "We / They", be: "are", example: "We are students in Madrid", desc: "Plural" },
    ],
    vocabTargets: [
      { word: "Spain", transformed: "Spanish", type: "Country to Nationality" },
      { word: "Brazil", transformed: "Brazilian", type: "Country to Nationality" },
    ],
  };

  return (
    <div className="space-y-6">
      {/* 1. Clean Editorial Mission Header */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#0D3B66] text-white space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/80">
          <span>Reading Mission</span>
          <span>·</span>
          <span>CEFR A1</span>
          <span>·</span>
          <span className="text-[#F4B41A]">Topic: {target.grammarTopic}</span>
          <span>·</span>
          <span>Theme: {target.themeTitle}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {passageTitle || "Meet Liam from Australia: A Global Friendship"}
        </h2>

        <p className="text-sm text-white/90 leading-relaxed max-w-3xl">
          {summaryText ||
            "In this session, you will read a self-introduction passage and learn how to use the verb 'to be' to state names, nationalities, and countries of origin."}
        </p>
      </div>

      {/* 2. Structured Learning Targets: Grammar & Reading Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Column 1: Grammar Pattern */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Grammar Target
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {target.grammarTopic}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
              {target.grammarFormula}
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Sentence pattern examples in the passage:
            </span>
            <div className="space-y-1.5">
              {target.keyPatterns?.map((pat, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#0D3B66] text-white font-bold font-mono text-[11px]">
                      {pat.subject} + {pat.be}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      "{pat.example}"
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleSpeak(pat.example, e)}
                    className="p-1 rounded text-slate-500 hover:text-[#0D3B66] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Listen to pronunciation"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Context & Vocabulary */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Reading Context & Vocabulary
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Characters & Origin
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Focus: {target.languageFunction}
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Country to nationality transformation:
            </span>
            <div className="space-y-1.5">
              {target.vocabTargets?.map((v, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <span className="text-slate-800 dark:text-white">{v.word}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-bold text-[#0D3B66] dark:text-[#F4B41A]">
                      {v.transformed}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {v.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            <strong>Characters in the passage:</strong> Liam (22 years old, from Melbourne, Australia) and Kenji (graphic designer from Tokyo, Japan).
          </div>
        </div>
      </div>

      {/* 3. Pre-Reading Warm-Up Check */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Reading Warm-Up
          </span>
          {warmupAnswered && selectedWarmupIndex === warmup.correctIndex && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Correct answer
            </span>
          )}
        </div>

        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {warmup.prompt}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {warmup.options.map((opt, idx) => {
            const isSelected = selectedWarmupIndex === idx;
            const isCorrect = idx === warmup.correctIndex;

            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleSelectWarmup(idx, e)}
                className={`p-3 rounded-xl text-left text-xs font-medium transition-all border cursor-pointer ${
                  warmupAnswered && isCorrect
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-500"
                    : isSelected && !isCorrect
                    ? "bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 border-red-400"
                    : "bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                }`}
              >
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {warmupAnswered && (
          <div
            className={`p-3 rounded-xl text-xs leading-relaxed border mt-2 ${
              selectedWarmupIndex === warmup.correctIndex
                ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 text-emerald-900 dark:text-emerald-200"
                : "bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 text-amber-900 dark:text-amber-200"
            }`}
          >
            <span className="font-semibold">Note: </span>
            {warmup.explanation}
          </div>
        )}
      </div>

    </div>
  );
}
