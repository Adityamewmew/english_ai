"use client";

import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  ChevronRight,
  Info,
} from "lucide-react";

export interface DrillItem {
  id: string;
  targetText: string;
  focus: string;
  hint?: string;
}

interface SpeakingLabDrillProps {
  drills: DrillItem[];
  onPlayAudio?: (text: string) => void;
  startListening: (onResult: (text: string) => void, onEnd: () => void) => void;
  stopListening: () => void;
}

export function SpeakingLabDrill({
  drills,
  onPlayAudio,
  startListening,
  stopListening,
}: SpeakingLabDrillProps) {
  const [activeDrillIdx, setActiveDrillIdx] = useState(0);
  const [drillTranscripts, setDrillTranscripts] = useState<Record<number, string>>({});
  const [isDrillRecording, setIsDrillRecording] = useState(false);

  const currentDrill = drills[activeDrillIdx];
  const drillResultText = drillTranscripts[activeDrillIdx] || "";

  const handleToggleDrillMic = () => {
    if (isDrillRecording) {
      stopListening();
      setIsDrillRecording(false);
    } else {
      setIsDrillRecording(true);
      startListening(
        (text) => {
          setDrillTranscripts((prev) => ({ ...prev, [activeDrillIdx]: text }));
          setIsDrillRecording(false);
        },
        () => setIsDrillRecording(false)
      );
    }
  };

  if (!currentDrill) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">
          Kalimat {activeDrillIdx + 1} dari {drills.length}
        </span>
        <div className="flex gap-1.5">
          {drills.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveDrillIdx(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                activeDrillIdx === i
                  ? "bg-blue-600 w-6"
                  : drillTranscripts[i]
                  ? "bg-emerald-500"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Target Kalimat
          </span>
          <h4 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
            &ldquo;{currentDrill.targetText}&rdquo;
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {currentDrill.focus}
          </p>
        </div>

        {currentDrill.hint && (
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-900 dark:text-amber-200">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="font-bold">Tips Pengucapan: </strong>
              {currentDrill.hint}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {onPlayAudio && (
            <button
              type="button"
              onClick={() => onPlayAudio(currentDrill.targetText)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm"
            >
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span>Dengarkan Pelafalan</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleDrillMic}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all shadow-sm ${
              isDrillRecording
                ? "bg-rose-600 animate-pulse hover:bg-rose-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isDrillRecording ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Mendengarkan... (Klik untuk Berhenti)</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>{drillResultText ? "Ulangi Rekaman" : "Tirukan (Bicara)"}</span>
              </>
            )}
          </button>
        </div>

        {drillResultText && (
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ucapan Terdeteksi:</span>
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 italic">
              &ldquo;{drillResultText}&rdquo;
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              Luar biasa! Otot mulutmu sudah terbiasa dengan ritme kalimat ini.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          disabled={activeDrillIdx === drills.length - 1}
          onClick={() => setActiveDrillIdx((prev) => Math.min(drills.length - 1, prev + 1))}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold transition-all shadow-sm"
        >
          <span>Kalimat Berikutnya</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
