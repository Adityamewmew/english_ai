"use client";

import React, { useState } from "react";
import { Volume2, CheckCircle2, HelpCircle } from "lucide-react";
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
  cefr?: string;
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
          const lineText = line.text || line.en || "";
          const words = lineText.trim().split(" ");
          const targetWord = words[words.length - 1].replace(/[.,?!]/g, "");
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
        <ListeningOverviewStage
          dialogueSec={dialogueSec}
          theorySec={theorySec}
          tutor={tutor}
          onGoToDialogue={() => onNextStep?.()}
        />
      )}

      {/* LANGKAH 2: Percakapan Multi-Speaker (Speaker 1 Kiri, Speaker 2 Kanan) */}
      {activeStepId === 2 && (
        <ListeningDialogueChat dialogueLines={dialogueLines} tutor={tutor} />
      )}

      {/* LANGKAH 3: Spoken Contractions Ear Trainer */}
      {activeStepId === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-[#0D3B66] dark:text-[#F4B41A] uppercase tracking-wider block font-mono">
              Step 3 · Ear Training Drill
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Connected Speech &amp; Spoken Contractions
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              In everyday spoken conversation, native speakers contract words to speak smoothly. Train your ear to distinguish formal slow forms vs natural connected speech:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectedSpeechItems.map((item: any) => {
              const isContracted = contractionMode[item.id] ?? true;

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 font-mono">
                      Pattern #{item.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setContractionMode((prev) => ({
                          ...prev,
                          [item.id]: !isContracted,
                        }));
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer min-h-[40px] touch-manipulation ${
                        isContracted
                          ? "bg-blue-50 text-[#0D3B66] border-blue-200 dark:bg-slate-800 dark:text-sky-300 dark:border-slate-700 font-bold"
                          : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {isContracted ? "Natural Connected (Fast)" : "Full Form (Slow)"}
                    </button>
                  </div>

                  <div
                    onClick={() => {
                      playPopSound();
                      setContractionMode((prev) => ({
                        ...prev,
                        [item.id]: !isContracted,
                      }));
                    }}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 cursor-pointer select-none space-y-1 transition-all hover:bg-slate-100/80 touch-manipulation"
                  >
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">
                      {isContracted
                        ? "Fast Spoken Form (Tap to toggle)"
                        : "Slow Spoken Form (Tap to toggle)"}
                    </span>
                    <p
                      className={`text-base font-bold transition-all ${
                        isContracted
                          ? "text-[#0D3B66] dark:text-[#F4B41A]"
                          : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {isContracted ? item.fast : item.slow}
                    </p>
                    <span className="text-[11px] font-mono text-slate-500 block">
                      Sound Transcription: {isContracted ? item.fastIpa : item.slowIpa}
                    </span>
                  </div>

                  {/* Audio Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => tutor.playTutorAudio(item.slow)}
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] touch-manipulation"
                    >
                      <Volume2 className="w-4 h-4 text-slate-400" />
                      <span>Play Slow</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => tutor.playTutorAudio(item.fast)}
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#0D3B66] dark:text-[#F4B41A] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] touch-manipulation"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Play Fast</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.note}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LANGKAH 4: Audio Dictation Mini-Drill */}
      {activeStepId === 4 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-[#0D3B66] dark:text-[#F4B41A] uppercase tracking-wider block font-mono">
              Step 4 · Audio Dictation Mini-Drill
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Listen to the Audio Clip &amp; Type the Missing Word
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
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
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      Audio Clip #{drill.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => tutor.playTutorAudio(drill.audio)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white text-xs font-bold transition-colors cursor-pointer min-h-[44px] touch-manipulation"
                    >
                      <Volume2 className="w-4 h-4 text-[#F4B41A]" />
                      <span>Play Audio</span>
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {drill.prompt}
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <input
                      type="text"
                      placeholder="Type the word you hear..."
                      value={currentVal}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDictationAnswers((prev) => ({ ...prev, [drill.id]: val }));
                        setDictationChecked((prev) => ({ ...prev, [drill.id]: false }));
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D3B66] min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDictationChecked((prev) => ({ ...prev, [drill.id]: true }));
                        if (isCorrect) onRewardXp(15);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white text-xs font-bold cursor-pointer min-h-[44px] touch-manipulation flex items-center justify-center w-full sm:w-auto"
                    >
                      Check
                    </button>
                  </div>

                  {isChecked && (
                    <div
                      className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                        isCorrect
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200"
                          : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200"
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
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

      {/* LANGKAH 5: 10 Soal Praktikum Menyimak (Dikte Audio & Susun Kalimat - No MCQ) */}
      {activeStepId === 5 && (
        <ListeningPracticumStage
          quizSec={quizSec}
          practiceSec={practiceSec}
          tutor={tutor}
          onRewardXp={onRewardXp}
          onFinish={() => onNextStep?.()}
        />
      )}
    </div>
  );
}
