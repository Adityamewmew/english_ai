"use client";

import React, { useState } from "react";
import { Volume2, CheckCircle2, HelpCircle, Zap, Play } from "lucide-react";
import { playPopSound } from "@/lib/sound-fx";
import { ListeningOverviewStage } from "./listening-overview-stage";
import { ListeningDialogueChat } from "./listening-dialogue-chat";
import { ListeningPracticumStage } from "./listening-practicum-stage";

interface StageListeningViewProps {
  activeStepId: number;
  theorySec?: any;
  dialogueSec: any;
  practiceSec?: any;
  quizSec?: any;
  tutor: any;
  onRewardXp: (amount: number) => void;
  onNextStep?: () => void;
  onStepComplete?: () => void;
  cefr?: string;
  initialAnswers?: Record<string, any>;
  onAnswersChange?: (answers: Record<string, any>) => void;
}

export function StageListeningView({
  activeStepId,
  theorySec,
  dialogueSec,
  practiceSec,
  quizSec,
  tutor,
  onRewardXp,
  onNextStep,
  onStepComplete,
  initialAnswers,
  onAnswersChange,
}: StageListeningViewProps) {
  const dialogueLines = dialogueSec?.content?.lines || [];

  // Local state for Step 4 Dictation
  const [dictationAnswers, setDictationAnswers] = useState<Record<number, string>>({});
  const [dictationChecked, setDictationChecked] = useState<Record<number, boolean>>({});

  // Local state for Step 3 Contractions Toggle
  const [contractionMode, setContractionMode] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
  });

  const connectedSpeechItems =
    theorySec?.content?.connectedSpeech && theorySec.content.connectedSpeech.length > 0
      ? theorySec.content.connectedSpeech
      : (theorySec?.content?.keyPhrases || []).slice(0, 4).map((kp: any, idx: number) => ({
          id: idx + 1,
          slow: kp.slow || kp.phrase || "Standard form",
          fast: kp.fast || kp.phrase || "Connected form",
          slowIpa: kp.slowIpa || "",
          fastIpa: kp.fastIpa || "",
          note: kp.note || kp.meaning || "",
        }));

  const dictationDrills =
    practiceSec?.content?.drills && practiceSec.content.drills.length > 0
      ? practiceSec.content.drills
      : dialogueLines.slice(0, 4).map((line: any, idx: number) => {
          const lineText = (line.text || line.en || "").trim();
          const words = lineText.split(/\s+/).filter(Boolean);
          const targetWord = words.length > 0 ? words[words.length - 1].replace(/[.,?!]/g, "") : "word";
          return {
            id: idx + 1,
            prompt: `${line.speaker || "Speaker"}: "${lineText.replace(targetWord, "_____")}"`,
            audio: lineText,
            target: targetWord.toLowerCase(),
            hint: "Listen to the sentence and type the target word.",
          };
        });

  return (
    <div className="space-y-6">
      {/* LANGKAH 1: Overview & Persiapan Menyimak */}
      {activeStepId === 1 && (
        <div onClick={() => onStepComplete?.()}>
          <ListeningOverviewStage
            dialogueSec={dialogueSec}
            theorySec={theorySec}
            tutor={tutor}
            onGoToDialogue={() => {
              onStepComplete?.();
              onNextStep?.();
            }}
          />
        </div>
      )}

      {/* LANGKAH 2: Percakapan Multi-Speaker (Speaker 1 Kiri, Speaker 2 Kanan) */}
      {activeStepId === 2 && (
        <div onClick={() => onStepComplete?.()}>
          <ListeningDialogueChat dialogueLines={dialogueLines} tutor={tutor} />
        </div>
      )}

      {/* Step 3: Spoken Contractions & Connected Speech Ear Trainer */}
      {activeStepId === 3 && (
        <div
          onClick={() => onStepComplete?.()}
          className="space-y-6 animate-in fade-in duration-300"
        >
          <div className="space-y-1.5 pb-2">
            <span className="text-xs font-heading font-bold text-[#10375C] dark:text-[#F4B41A] uppercase tracking-wider block">
              Step 3 · Ear Training Drill
            </span>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
              Connected Speech &amp; Spoken Contractions
            </h3>
            <p className="text-sm font-sans text-slate-600 dark:text-slate-300 leading-relaxed">
              In everyday spoken conversation, native speakers contract words to speak smoothly. Train your ear to distinguish formal slow forms vs natural connected speech:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {connectedSpeechItems.map((item: any) => {
              return (
                <div
                  key={item.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <span className="text-xs font-heading font-bold text-[#10375C] dark:text-[#F4B41A] uppercase tracking-wider">
                      Pattern #{item.id}
                    </span>
                    <span className="text-[11px] font-sans text-slate-500">
                      Dual-Speed Comparison
                    </span>
                  </div>

                  {/* Dual Speed Comparison Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Panel 1: Slow & Careful */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                          Slow &amp; Formal (0.85x)
                        </span>
                        <p className="font-heading text-base font-bold text-slate-900 dark:text-slate-100">
                          &ldquo;{item.slow}&rdquo;
                        </p>
                        {item.slowIpa && (
                          <span className="text-xs font-mono text-slate-500 block">
                            /{item.slowIpa}/
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onStepComplete?.();
                          const text = (item.slow || "").trim();
                          if (text) tutor.playTutorAudio(text);
                        }}
                        className="w-full mt-2 py-2 px-3 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer min-h-[40px] shadow-2xs"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Play Slow</span>
                      </button>
                    </div>

                    {/* Panel 2: Natural Connected */}
                    <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 block flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
                          <span>Natural (1.0x)</span>
                        </span>
                        <p className="font-heading text-base font-bold text-[#10375C] dark:text-[#F3C623]">
                          &ldquo;{item.fast}&rdquo;
                        </p>
                        {item.fastIpa && (
                          <span className="text-xs font-mono text-amber-700 dark:text-amber-300 block">
                            /{item.fastIpa}/
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onStepComplete?.();
                          const text = (item.fast || "").trim();
                          if (text) tutor.playTutorAudio(text);
                        }}
                        className="w-full mt-2 py-2 px-3 rounded-xl btn-skeuo-navy text-white text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer min-h-[40px] shadow-2xs"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#F3C623]" />
                        <span>Play Natural</span>
                      </button>
                    </div>
                  </div>

                  {item.note && (
                    <p className="text-xs font-sans text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                      💡 {item.note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 4: Audio Dictation Mini-Drill */}
      {activeStepId === 4 && (
        <div
          onClick={() => onStepComplete?.()}
          className="space-y-6 animate-in fade-in duration-300"
        >
          <div className="space-y-1.5 pb-2">
            <span className="text-xs font-heading font-bold text-[#10375C] dark:text-[#F4B41A] uppercase tracking-wider block">
              Step 4 · Audio Dictation Mini-Drill
            </span>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
              Listen to the Audio Clip &amp; Type the Missing Word
            </h3>
            <p className="text-sm font-sans text-slate-600 dark:text-slate-300 leading-relaxed">
              Play the audio clip, catch the target word, and type your answer in the box below:
            </p>
          </div>

          <div className="space-y-4">
            {dictationDrills.map((drill: any) => {
              const currentVal = dictationAnswers[drill.id] || "";
              const isChecked = dictationChecked[drill.id];
              const isCorrect = currentVal.trim().toLowerCase() === drill.target;

              return (
                <div
                  key={drill.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-xs font-heading font-bold text-slate-500 uppercase tracking-wider">
                      Audio Clip #{drill.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const text = (drill.audio || drill.prompt || "").replace(/_{2,}/g, "blank").trim();
                        if (text) tutor.playTutorAudio(text);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full btn-skeuo-navy text-white text-xs font-heading font-bold transition-all active:scale-95 cursor-pointer min-h-[40px] touch-manipulation"
                    >
                      <Volume2 className="w-4 h-4 text-[#F3C623]" />
                      <span>Play Audio</span>
                    </button>
                  </div>

                  <p className="font-sans text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                    {drill.prompt}
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="text"
                      placeholder="Type the word you hear..."
                      value={currentVal}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDictationAnswers((prev) => ({ ...prev, [drill.id]: val }));
                        setDictationChecked((prev) => ({ ...prev, [drill.id]: false }));
                      }}
                      className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-sans font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10375C] min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDictationChecked((prev) => ({ ...prev, [drill.id]: true }));
                        if (isCorrect) onRewardXp(15);
                        onStepComplete?.();
                      }}
                      className="px-6 py-3 rounded-2xl btn-skeuo-yellow text-[#0F172A] text-xs font-heading font-bold cursor-pointer min-h-[44px] touch-manipulation flex items-center justify-center w-full sm:w-auto shadow-xs active:scale-95"
                    >
                      Check Answer
                    </button>
                  </div>

                  {isChecked && (
                    <div
                      className={`p-3.5 rounded-2xl text-xs font-sans font-medium flex items-center gap-2.5 ${
                        isCorrect
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border border-emerald-300"
                          : "bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border border-amber-300"
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      )}
                      <span>
                        {isCorrect
                          ? "Spot on! Correct word captured."
                          : `Not quite. Correct answer: ${drill.target}`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 5: Listening Practicum Stage */}
      {activeStepId === 5 && (
        <ListeningPracticumStage
          quizSec={quizSec}
          practiceSec={practiceSec}
          tutor={tutor}
          onRewardXp={onRewardXp}
          initialAnswers={initialAnswers}
          onAnswersChange={onAnswersChange}
          onFinish={() => {
            onStepComplete?.();
            onNextStep?.();
          }}
        />
      )}
    </div>
  );
}
