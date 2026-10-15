"use client";

import React, { useState } from "react";
import { Play, CheckCircle2, Activity } from "lucide-react";
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

interface SpeakingSyllableStageProps {
  practiceSec: any;
  tutor: any;
  onRewardXp: (amount: number) => void;
}

export function SpeakingSyllableStage({
  practiceSec,
  tutor,
  onRewardXp,
}: SpeakingSyllableStageProps) {
  const pairs: StressPair[] = practiceSec?.content?.stressPairs || [];

  if (pairs.length === 0) {
    return (
      <div className="p-8 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          No syllable rhythm exercises available for this session yet.
        </p>
      </div>
    );
  }

  const [activeBeatId, setActiveBeatId] = useState<string | null>(null);
  const [completedPairs, setCompletedPairs] = useState<Record<string, boolean>>({});

  const playWordTts = (word: string) => {
    tutor.playTutorAudio(word);
  };

  const handleSyllableTap = (
    pairId: string,
    target: "country" | "nationality",
    index: number,
    syl: SyllableToken,
    wordText: string
  ) => {
    if (syl.isStressed) {
      playSnapSound();
    } else {
      playPopSound();
    }

    const beatKey = `${pairId}-${target}-${index}`;
    setActiveBeatId(beatKey);
    setTimeout(() => {
      setActiveBeatId(null);
    }, 600);

    // Speak the full natural word via Backend TTS so letters are not spelled out
    playWordTts(wordText);
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
      await new Promise((r) => setTimeout(r, 420));
    }
    setActiveBeatId(null);

    // Now speak the full word naturally via Backend TTS
    playWordTts(fullAudio);

    if (!completedPairs[pairId]) {
      setCompletedPairs((prev) => ({ ...prev, [pairId]: true }));
      playMatchSuccessSound();
      onRewardXp(10);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-[#1B4965] dark:text-[#F4B41A] uppercase tracking-wider block font-mono">
          Step 2 · Syllable Stress Drills
        </span>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          Syllable Stress Shift
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Tap the <strong>Play Rhythm</strong> button to hear the metronome syllable beat, or tap any syllable box to practice stressed pronunciation:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pairs.map((pair, pIdx) => {
          const isDone = completedPairs[pair.id];

          return (
            <div
              key={pair.id}
              className={`p-5 rounded-[24px] bg-white dark:bg-slate-900 border transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4 ${
                isDone
                  ? "border-emerald-300 dark:border-emerald-700/60"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Pair #{pIdx + 1}
                  </span>
                  {isDone && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-[#F4B41A]" />
                  <span>Rhythm Pads</span>
                </span>
              </div>

              {/* A. COUNTRY ROW */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                    Word 1 ({pair.countryAudio || pair.country})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      playMetronomeFlow(pair.id, "country", pair.countrySyllables, pair.countryAudio)
                    }
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-xs font-bold text-[#0D3B66] dark:text-[#F4B41A] transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Play Rhythm</span>
                  </button>
                </div>

                {/* Syllable Pads */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {pair.countrySyllables.map((syl, sIdx) => {
                    const beatKey = `${pair.id}-country-${sIdx}`;
                    const isActive = activeBeatId === beatKey;

                    return (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() =>
                          handleSyllableTap(pair.id, "country", sIdx, syl, pair.countryAudio)
                        }
                        className={`px-3 py-1.5 rounded-xl font-bold font-mono text-sm transition-all duration-200 cursor-pointer active:scale-90 flex items-center gap-1.5 shadow-xs ${
                          isActive
                            ? "bg-[#F4B41A] text-[#0D3B66] ring-4 ring-[#F4B41A]/30 scale-105"
                            : syl.isStressed
                            ? "bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-2 border-amber-300 dark:border-amber-700"
                            : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
                        }`}
                      >
                        {syl.isStressed && <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />}
                        <span>{syl.text}</span>
                        {syl.isStressed && (
                          <span className="text-[9px] uppercase tracking-tight text-amber-700 dark:text-amber-300 font-sans font-black">
                            STRESS
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* B. NATIONALITY ROW */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                    Word 2 ({pair.natAudio || pair.nationality})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      playMetronomeFlow(pair.id, "nationality", pair.natSyllables, pair.natAudio)
                    }
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-xs font-bold text-[#0D3B66] dark:text-[#F4B41A] transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Play Rhythm</span>
                  </button>
                </div>

                {/* Syllable Pads */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {pair.natSyllables.map((syl, sIdx) => {
                    const beatKey = `${pair.id}-nationality-${sIdx}`;
                    const isActive = activeBeatId === beatKey;

                    return (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() =>
                          handleSyllableTap(pair.id, "nationality", sIdx, syl, pair.natAudio)
                        }
                        className={`px-3 py-1.5 rounded-xl font-bold font-mono text-sm transition-all duration-200 cursor-pointer active:scale-90 flex items-center gap-1.5 shadow-xs ${
                          isActive
                            ? "bg-[#F4B41A] text-[#0D3B66] ring-4 ring-[#F4B41A]/30 scale-105"
                            : syl.isStressed
                            ? "bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-2 border-amber-300 dark:border-amber-700"
                            : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
                        }`}
                      >
                        {syl.isStressed && <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />}
                        <span>{syl.text}</span>
                        {syl.isStressed && (
                          <span className="text-[9px] uppercase tracking-tight text-amber-700 dark:text-amber-300 font-sans font-black">
                            STRESS
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explanation Note */}
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                {pair.shiftExplanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
