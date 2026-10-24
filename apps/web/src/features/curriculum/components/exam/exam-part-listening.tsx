"use client";

import React from "react";
import { Headphones, Volume2, RotateCcw, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExamPartListeningProps {
  listeningList: any[];
  listeningAnswers: Record<number, string>;
  onChangeAnswer: (qIdx: number, val: string) => void;
  playAudio: (text: string) => void;
  onNext: () => void;
}

export function ExamPartListening({
  listeningList,
  listeningAnswers,
  onChangeAnswer,
  playAudio,
  onNext,
}: ExamPartListeningProps) {
  const answeredCount = Object.keys(listeningAnswers).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Bagian 2 dari 4
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Listening Auditory Synthesis (Dikte & Susun Kata)
          </h3>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {answeredCount} / {listeningList.length} Selesai
        </span>
      </div>

      <div className="space-y-4">
        {listeningList.map((item, qIdx) => {
          const currentAns = listeningAnswers[qIdx] || "";
          const audioText = item.audioText || item.targetSentence || item.question || "";
          return (
            <Card
              key={item.id || qIdx}
              className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl space-y-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-center shrink-0">
                    {qIdx + 1}
                  </span>
                  <div className="space-y-1 flex-1">
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {item.type === "arrange" ? "Susun Kalimat" : "Dikte Audio"}
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      {item.instruction || "Dengarkan audio dan ketik kalimat yang kamu dengar:"}
                    </div>
                    {item.promptSentence ? (
                      <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm font-bold text-slate-900 dark:text-slate-100 font-mono mt-1.5 leading-relaxed">
                        {item.promptSentence}
                      </div>
                    ) : item.type === "arrange" ? (
                      <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/60 text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2 mt-1.5">
                        <Headphones className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Tekan tombol <strong>Dengarkan</strong> di kanan untuk mendengar rekaman audio, lalu susun kata-kata di bawah:</span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/60 text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2 mt-1.5">
                        <Headphones className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Dengarkan rekaman audio di samping dan ketik kalimat lengkap yang kamu dengar:</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => playAudio(audioText)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  title="Putar Audio"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Dengarkan</span>
                </button>
              </div>

              {item.type === "arrange" && Array.isArray(item.words) && (
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  {item.words.map((w: string, wIdx: number) => (
                    <button
                      key={wIdx}
                      type="button"
                      onClick={() => {
                        const updated = currentAns ? `${currentAns} ${w}` : w;
                        onChangeAnswer(qIdx, updated);
                      }}
                      className="min-h-[36px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-amber-500 cursor-pointer"
                    >
                      {w}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onChangeAnswer(qIdx, "")}
                    className="min-h-[36px] px-2.5 py-1 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 text-xs ml-auto font-medium cursor-pointer"
                    title="Reset Kata"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <input
                type="text"
                value={currentAns}
                onChange={(e) => onChangeAnswer(qIdx, e.target.value)}
                placeholder={
                  item.promptSentence
                    ? "Ketik kata yang hilang untuk melengkapi kalimat di atas..."
                    : "Ketik kalimat hasil pendengaran di sini..."
                }
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Part 2 selesai? Silakan lanjut ke penulisan.
        </span>
        <Button
          onClick={onNext}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Lanjut ke Part 3 (Writing)</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
