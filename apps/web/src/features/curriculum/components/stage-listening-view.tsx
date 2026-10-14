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

  const dictationDrills =
    dialogueLines.length > 0
      ? dialogueLines.slice(0, 4).map((line: any, idx: number) => {
          const lineText = line.text || line.en || "";
          const words = lineText.trim().split(" ");
          const targetWord = words[words.length - 1].replace(/[.,?!]/g, "");
          return {
            id: idx + 1,
            prompt: `${line.speaker}: "${lineText.replace(targetWord, "_____")}"`,
            audio: lineText,
            target: targetWord.toLowerCase(),
            hint: `Dengarkan kata terakhir yang diucapkan oleh ${line.speaker}`,
          };
        })
      : [
          {
            id: 1,
            prompt: "Jamie: 'Where are you _____, Marta?'",
            audio: "Where are you from, Marta?",
            target: "from",
            hint: "Kata depan penunjuk asal",
          },
          {
            id: 2,
            prompt: "Jamie: 'I am from _____, from Teruel.'",
            audio: "I am from Spain, from Teruel.",
            target: "spain",
            hint: "Nama negara asal Jamie",
          },
          {
            id: 3,
            prompt: "Marta: 'It is the new Barcelona _____.'",
            audio: "It is the new Barcelona shirt.",
            target: "shirt",
            hint: "Pakaian yang dipakai Marta",
          },
        ];

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

      {/* LANGKAH 2: Percakapan Multi-Speaker (Jamie Kiri, Marta Kanan) */}
      {activeStepId === 2 && (
        <ListeningDialogueChat dialogueLines={dialogueLines} tutor={tutor} />
      )}

      {/* LANGKAH 3: Spoken Contractions Ear Trainer */}
      {activeStepId === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-[#0D3B66] dark:text-[#F4B41A] uppercase tracking-wider block font-mono">
              Langkah 3 · Latihan Kepekaan Pendengaran (Ear Training)
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Peleburan Singkatan dalam Bahasa Inggris Lisan Cepat
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Dalam percakapan lisan sehari-hari, penutur asli selalu meleburkan kata (contractions) agar bicara lebih mengalir. Latih telingamu membedakan bentuk lambat formal vs bentuk cepat alami:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: 1,
                slow: "I am Jamie",
                fast: "I'm Jamie",
                slowIpa: "/aɪ æm/",
                fastIpa: "/aɪm/",
                note: "Vokal panjang 'æm' melebur menjadi bunyi pendek /aɪm/ dalam satu hembusan nafas.",
              },
              {
                id: 2,
                slow: "It is the new shirt",
                fast: "It's the new shirt",
                slowIpa: "/ɪt ɪz/",
                fastIpa: "/ɪts/",
                note: "Konsonan 't' dan 's' melebur menjadi satu desis tajam /ɪts/.",
              },
              {
                id: 3,
                slow: "What is your name?",
                fast: "What's your name?",
                slowIpa: "/wɒt ɪz/",
                fastIpa: "/wɒts/",
                note: "Kata tanya 'What is' langsung diringkas menjadi 'What's'.",
              },
              {
                id: 4,
                slow: "Where is Teruel?",
                fast: "Where's Teruel?",
                slowIpa: "/weər ɪz/",
                fastIpa: "/weəz/",
                note: "Akhiran bunyi menyatu dengan desis lembut /z/ di akhir kata 'Where'.",
              },
            ].map((item) => {
              const isContracted = contractionMode[item.id] ?? true;

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 font-mono">
                      Pola #{item.id}
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
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        isContracted
                          ? "bg-blue-50 text-[#0D3B66] border-blue-200 dark:bg-slate-800 dark:text-sky-300 dark:border-slate-700"
                          : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {isContracted ? "Bentuk Alami (Singkatan)" : "Bentuk Lambat (Formal)"}
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
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 cursor-pointer select-none space-y-1 transition-all hover:bg-slate-100/80"
                  >
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">
                      {isContracted
                        ? "Bentuk Lisan Cepat (Ketuk untuk ubah)"
                        : "Bentuk Lisan Lambat (Ketuk untuk ubah)"}
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
                      Transkripsi Bunyi: {isContracted ? item.fastIpa : item.slowIpa}
                    </span>
                  </div>

                  {/* Audio Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => tutor.playTutorAudio(item.slow)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Dengar Lambat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => tutor.playTutorAudio(item.fast)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0D3B66] dark:text-[#F4B41A] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Dengar Cepat Alami</span>
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
              Langkah 4 · Dikte Audio &amp; Tangkap Kata
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Dengarkan Klip Audio &amp; Ketik Kata yang Hilang
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Putar tombol audio, dengarkan kata kuncinya, lalu ketikkan jawabannya pada kotak input di bawah:
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
                      Klip Audio #{drill.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => tutor.playTutorAudio(drill.audio)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#F4B41A]" />
                      <span>Putar Klip</span>
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {drill.prompt}
                  </p>

                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Ketik kata yang kamu dengar..."
                      value={currentVal}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDictationAnswers((prev) => ({ ...prev, [drill.id]: val }));
                        setDictationChecked((prev) => ({ ...prev, [drill.id]: false }));
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D3B66]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDictationChecked((prev) => ({ ...prev, [drill.id]: true }));
                        if (isCorrect) onRewardXp(15);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white text-xs font-bold cursor-pointer"
                    >
                      Periksa
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
                          ? "Benar sekali! Pelafalan kata cocok."
                          : `Kurang tepat. Kunci jawaban: ${drill.target}`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LANGKAH 5: 10 Soal Praktikum Menyimak (Susun Kata, Dikte, Benar/Salah) */}
      {activeStepId === 5 && (
        <ListeningPracticumStage tutor={tutor} onRewardXp={onRewardXp} />
      )}
    </div>
  );
}
