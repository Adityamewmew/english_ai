"use client";

import React, { useState } from "react";
import { Volume2, Sparkles, Check, ArrowRight, HelpCircle } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import { playPopSound } from "@/lib/sound-fx";

interface InteractiveGrammarCardProps {
  rules?: any[];
  onPlayAudio?: (text: string) => void;
  embedded?: boolean;
}

type GrammarMode = "affirmative" | "negative" | "question";

interface FormulaPreset {
  subject: string;
  subjectType: string;
  affirmative: { verb: string; contraction: string; complement: string; full: string };
  negative: { verb: string; contraction: string; complement: string; full: string };
  question: { verb: string; complement: string; shortYes: string; shortNo: string; full: string };
}

const FORMULA_PRESETS: FormulaPreset[] = [
  {
    subject: "I",
    subjectType: "First person (Saya)",
    affirmative: { verb: "am", contraction: "I'm", complement: "from Indonesia", full: "I am from Indonesia." },
    negative: { verb: "am not", contraction: "I'm not", complement: "from Spain", full: "I am not from Spain." },
    question: { verb: "Am", complement: "I in room 402?", shortYes: "Yes, you are.", shortNo: "No, you aren't.", full: "Am I in room 402?" },
  },
  {
    subject: "She / He",
    subjectType: "Third person singular (Dia)",
    affirmative: { verb: "is", contraction: "She's", complement: "a student in London", full: "She is a student in London." },
    negative: { verb: "is not", contraction: "She isn't", complement: "Italian", full: "She is not Italian." },
    question: { verb: "Is", complement: "she from Japan?", shortYes: "Yes, she is.", shortNo: "No, she isn't.", full: "Is she from Japan?" },
  },
  {
    subject: "They / We / You",
    subjectType: "Plural & second person (Mereka/Kita/Kamu)",
    affirmative: { verb: "are", contraction: "They're", complement: "at Heathrow Airport", full: "They are at Heathrow Airport." },
    negative: { verb: "are not", contraction: "They aren't", complement: "tourists", full: "They are not tourists." },
    question: { verb: "Are", complement: "they from Australia?", shortYes: "Yes, they are.", shortNo: "No, they aren't.", full: "Are they from Australia?" },
  },
];

export function InteractiveGrammarCard({
  rules,
  onPlayAudio,
  embedded = false,
}: InteractiveGrammarCardProps) {
  const [activeMode, setActiveMode] = useState<GrammarMode>("affirmative");
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState(0);
  const [showContraction, setShowContraction] = useState(false);

  const preset = FORMULA_PRESETS[selectedSubjectIdx];

  const handleModeChange = (mode: GrammarMode) => {
    playPopSound();
    setActiveMode(mode);
  };

  const handlePlayCurrent = (text: string) => {
    playPopSound();
    onPlayAudio?.(text);
  };

  return (
    <div
      className={
        embedded
          ? "space-y-5"
          : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5"
      }
    >
      {/* 1. Header with Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase text-blue-600 tracking-wider">
            Interactive Grammar Formula
          </span>
          <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Verb 'To Be' Sentence Anatomy
          </h4>
        </div>

        {/* Mode Tabs: [ + Affirmative ] [ - Negative ] [ ? Question ] */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => handleModeChange("affirmative")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMode === "affirmative"
                ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            + Affirmative
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("negative")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMode === "negative"
                ? "bg-white dark:bg-slate-900 text-rose-600 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            − Negative
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("question")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMode === "question"
                ? "bg-white dark:bg-slate-900 text-purple-600 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            ? Question
          </button>
        </div>
      </div>

      {/* 2. Interactive Subject Selector Chips */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-slate-500">Pilih Subjek:</span>
        <div className="flex items-center gap-2 flex-wrap">
          {FORMULA_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                playPopSound();
                setSelectedSubjectIdx(idx);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                selectedSubjectIdx === idx
                  ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
              }`}
            >
              <span>{p.subject}</span>
              <span className="text-[10px] opacity-70 ml-1.5 font-normal">({p.subjectType.split(" ")[0]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Visual Formula Pills Blueprint */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
        {/* Formula Blueprint Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-semibold text-slate-500">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Struktur:</span>
          {activeMode === "affirmative" && (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                1. Subject
              </span>
              <span>+</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                2. To Be (am/is/are)
              </span>
              <span>+</span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                3. Complement
              </span>
            </div>
          )}
          {activeMode === "negative" && (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700">
                1. Subject
              </span>
              <span>+</span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700">
                2. To Be + Not
              </span>
              <span>+</span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700">
                3. Complement
              </span>
            </div>
          )}
          {activeMode === "question" && (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700">
                1. To Be (Didepan)
              </span>
              <span>+</span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700">
                2. Subject
              </span>
              <span>+</span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700">
                3. Complement ?
              </span>
            </div>
          )}
        </div>

        {/* Live Interactive Assembled Sentence */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Contoh Kalimat Utuh:
            </span>
            <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
              {activeMode === "affirmative" && (
                <>
                  <span className="text-blue-600">{showContraction ? preset.affirmative.contraction.split(" ")[0] : preset.subject}</span>
                  <span className="text-emerald-600">{showContraction ? "" : preset.affirmative.verb}</span>
                  <span className="text-slate-800 dark:text-slate-200">{preset.affirmative.complement}.</span>
                </>
              )}
              {activeMode === "negative" && (
                <>
                  <span className="text-blue-600">{showContraction ? preset.negative.contraction.split(" ")[0] : preset.subject}</span>
                  <span className="text-rose-600">{showContraction ? preset.negative.contraction.split(" ").slice(1).join(" ") : preset.negative.verb}</span>
                  <span className="text-slate-800 dark:text-slate-200">{preset.negative.complement}.</span>
                </>
              )}
              {activeMode === "question" && (
                <>
                  <span className="text-purple-600 font-bold">{preset.question.verb}</span>
                  <span className="text-blue-600">{preset.subject.toLowerCase()}</span>
                  <span className="text-slate-800 dark:text-slate-200">{preset.question.complement}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeMode !== "question" && (
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setShowContraction(!showContraction);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                  showContraction
                    ? "bg-amber-50 text-amber-700 border-amber-300"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {showContraction ? "Singkatan Aktif (I'm)" : "Gunakan Singkatan"}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const targetText =
                  activeMode === "affirmative"
                    ? preset.affirmative.full
                    : activeMode === "negative"
                    ? preset.negative.full
                    : preset.question.full;
                handlePlayCurrent(targetText);
              }}
              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
              title="Dengar pengucapan native"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question Short Answer Helper */}
        {activeMode === "question" && (
          <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 text-xs text-purple-950 dark:text-purple-200 flex items-center justify-between flex-wrap gap-2">
            <span className="font-semibold">💡 Pola Jawaban Singkat:</span>
            <div className="flex items-center gap-3 font-medium">
              <span><b>Yes:</b> {preset.question.shortYes}</span>
              <span>•</span>
              <span><b>No:</b> {preset.question.shortNo}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
