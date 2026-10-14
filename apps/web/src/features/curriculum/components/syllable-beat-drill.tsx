"use client";

import React, { useState } from "react";
import { Volume2, Play, CheckCircle2, Sparkles, Music2, Activity } from "lucide-react";
import { playPopSound, playSnapSound, playMatchSuccessSound } from "@/lib/sound-fx";

interface SyllableToken {
  text: string;
  isStressed: boolean;
}

interface StressPair {
  id: string;
  country: string;
  countryAudio: string;
  countrySyllables: SyllableToken[];
  nationality: string;
  natAudio: string;
  natSyllables: SyllableToken[];
  shiftExplanation: string;
}

const STRESS_DRILL_PAIRS: StressPair[] = [
  {
    id: "pair-1",
    country: "JA-pan",
    countryAudio: "Japan",
    countrySyllables: [
      { text: "JA", isStressed: true },
      { text: "pan", isStressed: false },
    ],
    nationality: "ja-pa-NESE",
    natAudio: "Japanese",
    natSyllables: [
      { text: "ja", isStressed: false },
      { text: "pa", isStressed: false },
      { text: "NESE", isStressed: true },
    ],
    shiftExplanation: "Tekanan bergeser dari suku kata ke-1 (JA-) ke suku kata ke-3 (-NESE).",
  },
  {
    id: "pair-2",
    country: "AU-stra-lia",
    countryAudio: "Australia",
    countrySyllables: [
      { text: "AU", isStressed: true },
      { text: "stra", isStressed: false },
      { text: "lia", isStressed: false },
    ],
    nationality: "au-STRA-lian",
    natAudio: "Australian",
    natSyllables: [
      { text: "au", isStressed: false },
      { text: "STRA", isStressed: true },
      { text: "lian", isStressed: false },
    ],
    shiftExplanation: "Tekanan bergeser dari suku kata pertama (AU-) ke tengah (-STRA-).",
  },
  {
    id: "pair-3",
    country: "CA-na-da",
    countryAudio: "Canada",
    countrySyllables: [
      { text: "CA", isStressed: true },
      { text: "na", isStressed: false },
      { text: "da", isStressed: false },
    ],
    nationality: "ca-NA-di-an",
    natAudio: "Canadian",
    natSyllables: [
      { text: "ca", isStressed: false },
      { text: "NA", isStressed: true },
      { text: "di", isStressed: false },
      { text: "an", isStressed: false },
    ],
    shiftExplanation: "Vokal vokal berubah dan tekanan berpindah dari (CA-) ke (-NA-).",
  },
  {
    id: "pair-4",
    country: "I-ta-ly",
    countryAudio: "Italy",
    countrySyllables: [
      { text: "I", isStressed: true },
      { text: "ta", isStressed: false },
      { text: "ly", isStressed: false },
    ],
    nationality: "i-TA-lian",
    natAudio: "Italian",
    natSyllables: [
      { text: "i", isStressed: false },
      { text: "TA", isStressed: true },
      { text: "lian", isStressed: false },
    ],
    shiftExplanation: "Tekanan suku kata awal berpindah ke tengah (-TA-).",
  },
];

interface SyllableBeatDrillProps {
  onRewardXp: (amount: number) => void;
}

export function SyllableBeatDrill({ onRewardXp }: SyllableBeatDrillProps) {
  const [activeBeatId, setActiveBeatId] = useState<string | null>(null);
  const [completedPairs, setCompletedPairs] = useState<Record<string, boolean>>({});

  const speakAudio = (word: string, rate: number = 0.9) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    }
  };

  const playSyllableAudio = (syllableText: string, isStressed: boolean) => {
    if (isStressed) {
      playSnapSound();
    } else {
      playPopSound();
    }
    speakAudio(syllableText, isStressed ? 0.8 : 1.1);
  };

  const playMetronomeFlow = async (
    pairId: string,
    target: "country" | "nationality",
    syllables: SyllableToken[],
    fullAudio: string
  ) => {
    playPopSound();
    for (let i = 0; i < syllables.length; i++) {
      const beatKey = `${pairId}-${target}-${i}`;
      setActiveBeatId(beatKey);
      const syl = syllables[i];
      if (syl.isStressed) {
        playSnapSound();
      } else {
        playPopSound();
      }
      await new Promise((r) => setTimeout(r, 400));
    }
    setActiveBeatId(null);
    speakAudio(fullAudio, 0.9);

    if (!completedPairs[pairId]) {
      setCompletedPairs((prev) => ({ ...prev, [pairId]: true }));
      playMatchSuccessSound();
      onRewardXp(10);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STRESS_DRILL_PAIRS.map((pair, idx) => {
          const isDone = completedPairs[pair.id];

          return (
            <div
              key={pair.id}
              className="card-skeuo p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs transition-all hover:border-[#0D3B66]/30 dark:hover:border-slate-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500">Pair #{idx + 1}</span>
                  {isDone && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0D3B66] dark:text-[#F4B41A]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tuntas
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-[#1B4965] dark:text-sky-300 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  Rhythm Pads
                </span>
              </div>

              {/* Country Rhythm Pad Row */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 border-b-2 border-b-slate-300 dark:border-b-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                    Negara ({pair.countryAudio})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      playMetronomeFlow(pair.id, "country", pair.countrySyllables, pair.countryAudio)
                    }
                    className="flex items-center gap-1 text-[11px] font-bold text-[#0D3B66] dark:text-[#F4B41A] hover:underline cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Putar Ritme</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {pair.countrySyllables.map((syl, sIdx) => {
                    const isBeatActive = activeBeatId === `${pair.id}-country-${sIdx}`;
                    return (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => playSyllableAudio(syl.text, syl.isStressed)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none flex items-center gap-1.5 ${
                          syl.isStressed
                            ? isBeatActive
                              ? "bg-[#F4B41A] text-[#0D3B66] scale-105 border-b-2 border-[#DDA012] shadow-md ring-2 ring-[#F4B41A]/50"
                              : "bg-[#F4B41A]/15 text-[#855e05] dark:text-[#F4B41A] border-2 border-[#F4B41A] border-b-2 border-b-[#DDA012] shadow-2xs hover:scale-102"
                            : isBeatActive
                            ? "bg-[#0D3B66] text-white border-b-2 border-[#082542]"
                            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 border-b-2 border-b-slate-300 dark:border-b-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {syl.isStressed && <span className="w-1.5 h-1.5 rounded-full bg-[#F4B41A] animate-pulse" />}
                        <span>{syl.text}</span>
                        {syl.isStressed && (
                          <span className="text-[9px] font-mono text-[#855e05] dark:text-[#F4B41A] uppercase font-black">
                            STRESS
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nationality Rhythm Pad Row */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 border-b-2 border-b-slate-300 dark:border-b-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                    Kewarganegaraan ({pair.natAudio})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      playMetronomeFlow(pair.id, "nationality", pair.natSyllables, pair.natAudio)
                    }
                    className="flex items-center gap-1 text-[11px] font-bold text-[#0D3B66] dark:text-[#F4B41A] hover:underline cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Putar Ritme</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {pair.natSyllables.map((syl, sIdx) => {
                    const isBeatActive = activeBeatId === `${pair.id}-nationality-${sIdx}`;
                    return (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => playSyllableAudio(syl.text, syl.isStressed)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none flex items-center gap-1.5 ${
                          syl.isStressed
                            ? isBeatActive
                              ? "bg-[#F4B41A] text-[#0D3B66] scale-105 border-b-2 border-[#DDA012] shadow-md ring-2 ring-[#F4B41A]/50"
                              : "bg-[#F4B41A]/15 text-[#855e05] dark:text-[#F4B41A] border-2 border-[#F4B41A] border-b-2 border-b-[#DDA012] shadow-2xs hover:scale-102"
                            : isBeatActive
                            ? "bg-[#0D3B66] text-white border-b-2 border-[#082542]"
                            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 border-b-2 border-b-slate-300 dark:border-b-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {syl.isStressed && <span className="w-1.5 h-1.5 rounded-full bg-[#F4B41A] animate-pulse" />}
                        <span>{syl.text}</span>
                        {syl.isStressed && (
                          <span className="text-[9px] font-mono text-[#855e05] dark:text-[#F4B41A] uppercase font-black">
                            STRESS
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explanatory note */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans pt-1 border-t border-slate-100 dark:border-slate-800">
                {pair.shiftExplanation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
