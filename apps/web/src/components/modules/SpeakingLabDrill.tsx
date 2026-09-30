"use client";

import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  ChevronRight,
  Info,
} from "lucide-react";
import { evaluateSpeechDiff, SpeechDiffResult } from "@/lib/speech-diff";
import { SpeechRecorderCallbackOptions } from "@/hooks/use-speech-recorder";
import { SpeechScoreCard } from "./SpeechScoreCard";

export interface DrillItem {
  id: string;
  targetText: string;
  focus: string;
  hint?: string;
}

interface SpeakingLabDrillProps {
  drills: DrillItem[];
  moduleId?: string;
  userId?: string;
  currentlyPlayingUrl?: string | null;
  onPlayAudio?: (text: string) => void;
  onPlayStudentAudio?: (url: string) => void;
  onStopStudentAudio?: () => void;
  startListening: (options: SpeechRecorderCallbackOptions) => void;
  stopListening: () => void;
}

export function SpeakingLabDrill({
  drills,
  moduleId,
  userId,
  currentlyPlayingUrl,
  onPlayAudio,
  onPlayStudentAudio,
  onStopStudentAudio,
  startListening,
  stopListening,
}: SpeakingLabDrillProps) {
  const [activeDrillIdx, setActiveDrillIdx] = useState(0);
  const [drillTranscripts, setDrillTranscripts] = useState<Record<number, string>>({});
  const [studentAudioUrls, setStudentAudioUrls] = useState<Record<number, string>>({});
  const [drillResults, setDrillResults] = useState<Record<number, SpeechDiffResult>>({});
  const [drillTips, setDrillTips] = useState<Record<number, string>>({});
  const [loadingTips, setLoadingTips] = useState<Record<number, boolean>>({});
  const [isDrillRecording, setIsDrillRecording] = useState(false);

  const currentDrill = drills[activeDrillIdx];
  const drillResultText = drillTranscripts[activeDrillIdx] || "";
  const currentDiffResult = drillResults[activeDrillIdx];
  const currentStudentAudio = studentAudioUrls[activeDrillIdx] || null;
  const currentTip = drillTips[activeDrillIdx];
  const isLoadingCurrentTip = loadingTips[activeDrillIdx] || false;

  const handleSpeechResult = async (spokenText: string) => {
    if (!currentDrill) return;

    setDrillTranscripts((prev) => ({ ...prev, [activeDrillIdx]: spokenText }));

    // 1. Evaluasi instan visual kata per kata (0ms latency)
    const diff = evaluateSpeechDiff(currentDrill.targetText, spokenText);
    setDrillResults((prev) => ({ ...prev, [activeDrillIdx]: diff }));

    // 2. Jika ada moduleId, panggil async backend untuk tips fonetik & simpan RAG memory
    if (moduleId && spokenText.trim().length > 0) {
      try {
        setLoadingTips((prev) => ({ ...prev, [activeDrillIdx]: true }));
        const res = await fetch(`/api/curriculum/modules/${moduleId}/evaluate-speech`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetText: currentDrill.targetText,
            spokenText,
            score: diff.score,
            missedWords: diff.missedWords,
            userId: userId || undefined,
          }),
        });

        const json = await res.json();
        if (json.success && json.data?.tip) {
          setDrillTips((prev) => ({ ...prev, [activeDrillIdx]: json.data.tip }));
        }
      } catch (err) {
        console.warn("Gagal mengambil tips Mr. Khoirul:", err);
      } finally {
        setLoadingTips((prev) => ({ ...prev, [activeDrillIdx]: false }));
      }
    }
  };

  const handleToggleDrillMic = () => {
    if (isDrillRecording) {
      stopListening();
      setIsDrillRecording(false);
    } else {
      setIsDrillRecording(true);
      startListening({
        onTextResult: (text) => {
          setIsDrillRecording(false);
          handleSpeechResult(text);
        },
        onAudioResult: (audioUrl) => {
          setStudentAudioUrls((prev) => ({ ...prev, [activeDrillIdx]: audioUrl }));
        },
        onEnd: () => setIsDrillRecording(false),
      });
    }
  };

  const handleRetry = () => {
    setDrillTranscripts((prev) => {
      const next = { ...prev };
      delete next[activeDrillIdx];
      return next;
    });
    setStudentAudioUrls((prev) => {
      const next = { ...prev };
      delete next[activeDrillIdx];
      return next;
    });
    setDrillResults((prev) => {
      const next = { ...prev };
      delete next[activeDrillIdx];
      return next;
    });
    setDrillTips((prev) => {
      const next = { ...prev };
      delete next[activeDrillIdx];
      return next;
    });
  };

  if (!currentDrill) return null;

  return (
    <div className="space-y-4">
      {/* Header & Step Dots */}
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
                  : drillResults[i]?.passed
                  ? "bg-emerald-500"
                  : drillResults[i]
                  ? "bg-amber-500"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Card */}
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

        {/* Real-Time Speech Score & Word Analysis Card with Side-by-Side Playback */}
        {currentDiffResult && (
          <SpeechScoreCard
            score={currentDiffResult.score}
            passed={currentDiffResult.passed}
            statusText={currentDiffResult.statusText}
            words={currentDiffResult.words}
            spokenText={drillResultText}
            targetText={currentDrill.targetText}
            studentAudioUrl={currentStudentAudio}
            isPlayingStudentAudio={currentlyPlayingUrl === currentStudentAudio}
            tip={currentTip}
            isLoadingTip={isLoadingCurrentTip}
            onRetry={handleRetry}
            onPlayStudentAudio={onPlayStudentAudio}
            onStopStudentAudio={onStopStudentAudio}
            onPlayNativeAudio={onPlayAudio}
            onPlayTipAudio={onPlayAudio}
          />
        )}
      </div>

      {/* Navigation Buttons */}
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
