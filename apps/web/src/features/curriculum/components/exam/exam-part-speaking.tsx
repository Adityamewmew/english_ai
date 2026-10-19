"use client";

import React from "react";
import { Mic, Volume2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExamPartSpeakingProps {
  speakingList: any[];
  speakingCompleted: Record<number, boolean>;
  onToggleCompleted: (qIdx: number) => void;
  playAudio: (text: string) => void;
  onFinish: () => void;
}

export function ExamPartSpeaking({
  speakingList,
  speakingCompleted,
  onToggleCompleted,
  playAudio,
  onFinish,
}: ExamPartSpeakingProps) {
  const completedCount = Object.keys(speakingCompleted).filter(
    (k) => speakingCompleted[Number(k)]
  ).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            Bagian 4 dari 4
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Spoken Fluency & Oral Interaction
          </h3>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {completedCount} / {speakingList.length} Selesai
        </span>
      </div>

      <div className="space-y-4">
        {speakingList.map((item, qIdx) => {
          const isDone = Boolean(speakingCompleted[qIdx]);
          const promptText = item.prompt || item.instruction || "";
          return (
            <Card
              key={item.id || qIdx}
              className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-800 dark:text-sky-300 text-xs font-bold flex items-center justify-center shrink-0">
                    {qIdx + 1}
                  </span>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Prompt Lisan
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {promptText}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => playAudio(promptText)}
                  className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-600 hover:bg-slate-200 transition-colors shrink-0 flex items-center justify-center cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  title="Dengar Model Ucapan"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  {item.sampleAnswer ? `Target: "${item.sampleAnswer}"` : "Ucapkan dengan intonasi jelas"}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleCompleted(qIdx)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isDone
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold"
                      : "bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isDone ? "Sudah Diujikan (Selesai)" : "Tandai Telah Diucapkan"}</span>
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Semua bagian selesai. Selesaikan ujian untuk menghitung skor kelulusan.
        </span>
        <Button
          onClick={onFinish}
          className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Kalkulasi Skor & Lihat Sertifikat</span>
          <CheckCircle2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
