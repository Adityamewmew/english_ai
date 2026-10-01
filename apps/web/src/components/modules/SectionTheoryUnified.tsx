"use client";

import React from "react";
import {
  BookOpen,
  Volume2,
  ShieldAlert,
  Check,
  X,
} from "lucide-react";
import { VocabItem } from "./SectionVocab";
import { DialogueTurn } from "./SectionDialogue";
import { TheoryMiniTrial } from "./TheoryMiniTrial";

interface TheoryContent {
  summary: string;
  rules?: Array<Record<string, string>>;
  commonTrap?: {
    trapTitle: string;
    explanation: string;
    wrong: string;
    correct: string;
  };
}

interface SectionTheoryUnifiedProps {
  title: string;
  theoryContent?: TheoryContent;
  vocabItems?: VocabItem[];
  dialogueContext?: string;
  dialogueLines?: DialogueTurn[];
  onPlayAudio?: (text: string) => void;
  onAdvanceToPractice: () => void;
  isPracticeUnlocked?: boolean;
}

export function SectionTheoryUnified({
  title,
  theoryContent,
  vocabItems = [],
  dialogueContext,
  dialogueLines = [],
  onPlayAudio,
  onAdvanceToPractice,
  isPracticeUnlocked = false,
}: SectionTheoryUnifiedProps) {
  const rawRules = theoryContent?.rules || (theoryContent as any)?.scale || [];
  const rules = Array.isArray(rawRules) ? rawRules : [];

  const rawMistakes = (theoryContent as any)?.commonMistakes;
  const commonTrap =
    theoryContent?.commonTrap ||
    (Array.isArray(rawMistakes) && rawMistakes.length > 0
      ? {
          trapTitle: "Peringatan Kesalahan Umum",
          explanation:
            rawMistakes[0].note ||
            rawMistakes[0].wrong ||
            "Perhatikan perbedaan pola berikut agar tidak tertukar dalam percakapan.",
          wrong: rawMistakes[0].wrong,
          correct: rawMistakes[0].right,
        }
      : undefined);

  const summaryText =
    theoryContent?.summary ||
    (theoryContent as any)?.concept ||
    "Pelajari konsep dasar, aturan penggunaan, dan contoh kalimat berikut dengan saksama.";

  // Ambil contoh kalimat terbaik secara aman untuk Mini-Trial
  let bestExample = "";
  let exampleMeaning = "";

  for (const r of rules) {
    if (typeof r === "string" && r.trim().length > 5) {
      bestExample = r.trim();
      break;
    }
    if (r && typeof r === "object" && r.example && typeof r.example === "string" && r.example.trim().length > 4) {
      bestExample = r.example.trim();
      exampleMeaning = r.meaning || r.detail || "";
      break;
    }
  }

  if (!bestExample && commonTrap?.correct) {
    bestExample = commonTrap.correct.trim();
    exampleMeaning = commonTrap.explanation || "";
  }
  if (!bestExample && dialogueLines.length > 0 && dialogueLines[0].text) {
    bestExample = dialogueLines[0].text.trim();
    exampleMeaning = dialogueLines[0].translation || "";
  }
  if (!bestExample && vocabItems.length > 0) {
    bestExample =
      vocabItems[0].collocation ||
      `I study the word '${vocabItems[0].word}'.`;
    exampleMeaning = vocabItems[0].meaning || "";
  }
  if (!bestExample) {
    bestExample = "I study English every day.";
    exampleMeaning = "Saya belajar bahasa Inggris setiap hari.";
  }

  return (
    <div className="space-y-8">
      {/* 1. READING & CONCEPT SECTION */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>1. Membaca & Konsep Inti (Reading & Grammar)</span>
        </div>

        {/* Summary Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            {summaryText}
          </p>
        </div>

        {/* Rules Table */}
        {rules.length > 0 && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Pola & Aturan Penggunaan Kalimat
              </h4>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {rules.map((rule: any, idx: number) => {
                if (typeof rule === "string") {
                  return (
                    <div
                      key={idx}
                      className="p-4 flex items-start gap-3 text-xs md:text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                        {rule}
                      </span>
                    </div>
                  );
                }

                const keys = Object.keys(rule);
                return (
                  <div
                    key={idx}
                    className="p-4 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs md:text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {keys.map((k) => (
                      <div key={k} className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {k}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {rule[k]}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Common Trap Callout */}
        {commonTrap && (
          <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20 p-5">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <h5 className="text-sm font-bold text-red-900 dark:text-red-200">
                {commonTrap.trapTitle}
              </h5>
            </div>
            <p className="text-xs md:text-sm text-red-800/90 dark:text-red-300/90 leading-relaxed mb-4">
              {commonTrap.explanation}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-100/60 dark:bg-red-900/30 border border-red-200 dark:border-red-800/40 text-xs">
                <X className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-red-900 dark:text-red-200 block mb-0.5">
                    Salah Kaprah:
                  </span>
                  <span className="text-red-800 dark:text-red-300 line-through">
                    {commonTrap.wrong}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/40 text-xs">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-emerald-900 dark:text-emerald-200 block mb-0.5">
                    Baku & Tepat:
                  </span>
                  <span className="text-emerald-800 dark:text-emerald-300 font-medium">
                    {commonTrap.correct}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. LISTENING & VOCABULARY SECTION */}
      {vocabItems.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Volume2 className="w-4 h-4" />
            <span>2. Mendengarkan & Kosakata Kunci (Listening & Vocab)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vocabItems.map((v, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {v.word}
                      </span>
                      {v.ipa && (
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {v.ipa}
                        </span>
                      )}
                    </div>

                    {onPlayAudio && (
                      <button
                        type="button"
                        onClick={() => onPlayAudio(v.word)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Dengarkan Pengucapan"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-2">
                    {v.meaning}
                  </p>
                </div>

                {v.collocation && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Contoh:{" "}
                    </span>
                    <span className="italic">{v.collocation}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DIALOGUE SECTION */}
      {dialogueLines.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Volume2 className="w-4 h-4" />
            <span>3. Percakapan Contoh Kontekstual (Contextual Dialogue)</span>
          </div>

          {dialogueContext && (
            <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/40 rounded-xl text-xs text-blue-900 dark:text-blue-200">
              <span className="font-bold">Konteks: </span>
              <span>{dialogueContext}</span>
            </div>
          )}

          <div className="space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            {dialogueLines.map((turn, idx) => {
              const isFirst = idx % 2 === 0;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${
                    isFirst ? "justify-start" : "justify-end"
                  }`}
                >
                  {isFirst && (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                      {turn.speaker.charAt(0)}
                    </div>
                  )}

                  <div
                    className={`max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm ${
                      isFirst
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-200 dark:border-slate-700/60"
                        : "bg-blue-600 text-white rounded-tr-none"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="font-bold text-[10px] uppercase tracking-wider opacity-80">
                        {turn.speaker}
                      </span>
                      {onPlayAudio && (
                        <button
                          type="button"
                          onClick={() => onPlayAudio(turn.text)}
                          className="p-0.5 rounded opacity-75 hover:opacity-100 transition-opacity"
                          title="Dengarkan baris percakapan"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="leading-relaxed">{turn.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. PERCOBAAN INTERAKTIF PEMULA (WRITING & SPEAKING MINI-TRIAL) */}
      <TheoryMiniTrial
        exampleSentence={bestExample}
        exampleMeaning={exampleMeaning}
        onPlayAudio={onPlayAudio}
        onAdvanceToPractice={onAdvanceToPractice}
        isPracticeUnlocked={isPracticeUnlocked}
      />
    </div>
  );
}
