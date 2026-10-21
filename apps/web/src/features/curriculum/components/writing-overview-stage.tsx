"use client";

import React from "react";
import { BookOpen, Volume2 } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import { playPopSound } from "@/lib/sound-fx";

interface WritingOverviewStageProps {
  theorySec?: any;
  tutor: any;
  onGoToNext?: () => void;
}

export function WritingOverviewStage({
  theorySec,
  tutor,
}: WritingOverviewStageProps) {
  const content = theorySec?.content || {};

  // Normalize blueprint items with robust fallbacks
  const blueprintItems = (content.blueprintItems || []).map((item: any, idx: number) => {
    const part = item.part || item.title || `Step ${item.step || idx + 1}`;
    const role = item.role || item.formula || "";
    const examples: string[] = Array.isArray(item.examples)
      ? item.examples
      : item.example
      ? [item.example]
      : [];
    const color =
      item.color ||
      "border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200";
    const tagColor =
      item.tagColor || "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300";

    return { part, role, examples, color, tagColor };
  });

  // Normalize mechanics rules
  const mechanicsRules = (content.mechanicsRules || []).map((r: any, idx: number) => ({
    title: r.title || `Rule #${idx + 1}`,
    rule: r.rule || "",
    example: r.goodExample || r.example || "",
    badExample: r.badExample || "",
    why: r.why || "",
  }));

  // Normalize sample sentences
  const sampleSentences = (content.sampleSentences || []).map((s: any) => ({
    text: s.text || s.en || "",
    audio: s.audio || s.text || s.en || "",
    translation: s.id || s.translation || "",
    focus: s.focus || "",
  }));

  const summary =
    content.summary ||
    "In this module, you will learn how to construct complete, accurate English sentences.";

  const handlePlayAudio = (text: string, e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    const cleanText = (text || "").replace(/[\/]/g, " ").replace(/\s+/g, " ").trim();
    if (cleanText) {
      tutor?.playTutorAudio?.(cleanText);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Mission Briefing Banner */}
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
          <BookOpen className="w-4 h-4" />
          <span className="uppercase tracking-wider font-mono">
            Writing Mission Objective
          </span>
        </div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
          {summary}
        </p>
      </div>

      {/* 2. Visual Blueprint Formula */}
      {blueprintItems.length > 0 && (
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Sentence Construction Blueprint
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Key building blocks for constructing clear and accurate sentences:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {blueprintItems.map((item: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border ${item.color} space-y-2.5 transition-all`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono uppercase tracking-wider">
                    {item.part}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 dark:bg-slate-900/60">
                    Step {idx + 1}
                  </span>
                </div>
                {item.role && <p className="text-xs font-semibold">{item.role}</p>}
                {item.examples.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.examples.map((ex: string, exIdx: number) => (
                      <span
                        key={exIdx}
                        className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md ${item.tagColor}`}
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Mechanics Core Rules */}
      {mechanicsRules.length > 0 && (
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Core Writing Mechanics &amp; Punctuation Rules
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Keep these mechanics in mind as they are directly evaluated in the upcoming typing exercises:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {mechanicsRules.map((r: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs"
              >
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">
                  {r.title}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {r.rule}
                </p>
                {r.example && (
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Example: <span className="font-semibold text-slate-800 dark:text-slate-200">{r.example}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Audio Sentence Examples */}
      {sampleSentences.length > 0 && (
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Sample Sentence Models
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Listen to the pronunciation of these model sentences before starting your writing drills:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sampleSentences.map((s: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug block">
                    &ldquo;{s.text}&rdquo;
                  </span>
                  {s.translation && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate block mt-0.5">
                      {s.translation}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => handlePlayAudio(s.audio, e)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer shrink-0"
                  title="Listen to pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
