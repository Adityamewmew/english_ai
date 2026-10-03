"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  ChevronRight,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";
import { evaluateSpeechDiff, SpeechDiffResult } from "@/lib/speech-diff";
import { SpeechRecorderCallbackOptions, blobToBase64 } from "@/hooks/use-speech-recorder";
import { SpeechScoreCard } from "./SpeechScoreCard";
import {
  animeButtonPop,
  animeCardReveal,
  animeCardHover,
  animeCardPulse,
} from "@/lib/anime-effects";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  onStageComplete?: (averageScore: number) => void;
  onNextStage?: () => void;
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
  onStageComplete,
  onNextStage,
}: SpeakingLabDrillProps) {
  const [activeDrillIdx, setActiveDrillIdx] = useState(0);
  const [drillTranscripts, setDrillTranscripts] = useState<Record<number, string>>({});
  const [studentAudioUrls, setStudentAudioUrls] = useState<Record<number, string>>({});
  const [drillResults, setDrillResults] = useState<Record<number, SpeechDiffResult>>({});
  const [drillTips, setDrillTips] = useState<Record<number, string>>({});
  const [loadingTips, setLoadingTips] = useState<Record<number, boolean>>({});
  const [isDrillRecording, setIsDrillRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const mainCardRef = useRef<HTMLDivElement>(null);
  const micButtonRef = useRef<HTMLButtonElement>(null);
  const browserTranscriptRef = useRef<string>("");

  const currentDrill = drills[activeDrillIdx];
  const drillResultText = drillTranscripts[activeDrillIdx] || "";
  const currentDiffResult = drillResults[activeDrillIdx];
  const currentStudentAudio = studentAudioUrls[activeDrillIdx] || null;
  const currentTip = drillTips[activeDrillIdx];
  const isLoadingCurrentTip = loadingTips[activeDrillIdx] || false;

  // Anime.js Reveal animation when active drill changes
  useEffect(() => {
    if (mainCardRef.current) {
      animeCardReveal(mainCardRef.current);
    }
  }, [activeDrillIdx]);

  const handleSpeechResult = async (spokenText: string) => {
    if (!currentDrill) return;

    setDrillTranscripts((prev) => ({ ...prev, [activeDrillIdx]: spokenText }));

    // 1. Evaluasi instan visual kata per kata (0ms latency)
    const diff = evaluateSpeechDiff(currentDrill.targetText, spokenText);
    const updatedResults = { ...drillResults, [activeDrillIdx]: diff };
    setDrillResults(updatedResults);

    const isAllRecorded = drills.length > 0 && drills.every((_, i) => Boolean(updatedResults[i]));
    if (isAllRecorded) {
      const totalScore = drills.reduce((sum, _, i) => sum + (updatedResults[i]?.score || 70), 0);
      const avg = Math.round(totalScore / drills.length);
      onStageComplete?.(avg);
    }

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
    if (micButtonRef.current) {
      animeButtonPop(micButtonRef.current);
    }

    if (isDrillRecording) {
      stopListening();
      setIsDrillRecording(false);
    } else {
      setIsDrillRecording(true);
      if (micButtonRef.current) {
        animeCardPulse(micButtonRef.current);
      }
      browserTranscriptRef.current = "";
      startListening({
        onTextResult: (text) => {
          browserTranscriptRef.current = text;
        },
        onAudioResult: async (audioUrl, audioBlob) => {
          setStudentAudioUrls((prev) => ({ ...prev, [activeDrillIdx]: audioUrl }));
          setIsDrillRecording(false);

          let resolvedTranscript = browserTranscriptRef.current;

          // Kirim audioBlob ke AI Audio STT (Gemini) untuk akurasi artikulasi maksimal
          if (audioBlob && audioBlob.size > 0 && currentDrill) {
            try {
              setIsAnalyzing(true);
              const base64Audio = await blobToBase64(audioBlob);
              const res = await fetch("/api/curriculum/transcribe-speech", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  audioBase64: base64Audio,
                  mimeType: audioBlob.type,
                  targetText: currentDrill.targetText,
                }),
              });

              if (res.ok) {
                const data = await res.json();
                if (data.success && data.data?.transcript && data.data.transcript.trim().length > 0) {
                  resolvedTranscript = data.data.transcript.trim();
                }
              }
            } catch (err) {
              console.warn("AI Audio STT gagal/timeout, fallback ke Web Speech:", err);
            } finally {
              setIsAnalyzing(false);
            }
          }

          if (resolvedTranscript.trim().length > 0) {
            handleSpeechResult(resolvedTranscript);
          }
        },
        onEnd: () => {
          setIsDrillRecording(false);
        },
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

  if (!currentDrill) {
    return (
      <Card className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Pemanasan Siap Dilompati
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tidak ada kalimat drill khusus untuk bagian ini. Kamu dapat langsung memulai sesi Simulasi Peran (Roleplay) bersama Mr. Khoirul.
          </p>
        </div>
        <div className="pt-2">
          <Button
            onClick={() => {
              onStageComplete?.(85);
              onNextStage?.();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-xs"
          >
            <span>Mulai Simulasi Peran</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header & Step Dots Card using shadcn Card */}
      <Card className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Latihan Berbicara: Kalimat {activeDrillIdx + 1} dari {drills.length}
          </span>
        </div>
        <div className="flex gap-2">
          {drills.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                animeButtonPop(e.currentTarget);
                setActiveDrillIdx(i);
              }}
              className={`h-3 rounded-full transition-all cursor-pointer ${
                activeDrillIdx === i
                  ? "bg-blue-600 w-7"
                  : drillResults[i]?.passed
                  ? "bg-emerald-500 w-3"
                  : drillResults[i]
                  ? "bg-amber-500 w-3"
                  : "bg-slate-300 dark:bg-slate-700 w-3"
              }`}
              title={`Buka Kalimat ${i + 1}`}
            />
          ))}
        </div>
      </Card>

      {/* Main Card with Anime.js Reveal using shadcn Card */}
      <Card
        ref={mainCardRef}
        onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
        onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 sm:p-8 md:p-10 rounded-2xl shadow-xs space-y-6 sm:space-y-7 will-change-transform"
      >
        <div className="space-y-2.5">
          <Badge variant="primary" size="sm" className="font-bold uppercase tracking-wider">
            Target Kalimat
          </Badge>
          <h4 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-relaxed font-mono">
            &ldquo;{currentDrill.targetText}&rdquo;
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            {currentDrill.focus}
          </p>
        </div>

        {currentDrill.hint && (
          <div className="flex items-start gap-3 p-4 sm:p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-xs sm:text-sm text-amber-900 dark:text-amber-200 font-medium">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="font-bold">Tips Pengucapan: </strong>
              {currentDrill.hint}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3.5 pt-3">
          {onPlayAudio && (
            <Button
              variant="outline"
              size="md"
              onClick={(e) => {
                animeButtonPop(e.currentTarget);
                onPlayAudio(currentDrill.targetText);
              }}
              className="gap-2 shadow-xs"
            >
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span>Dengarkan Pelafalan</span>
            </Button>
          )}

          <Button
            ref={micButtonRef}
            disabled={isAnalyzing}
            onClick={handleToggleDrillMic}
            className={`gap-2 shadow-sm ${
              isAnalyzing
                ? "bg-indigo-600 opacity-90 cursor-wait"
                : isDrillRecording
                ? "bg-rose-600 animate-pulse hover:bg-rose-700 ring-2 ring-rose-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menganalisis artikulasi...</span>
              </>
            ) : isDrillRecording ? (
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
          </Button>
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
      </Card>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
        <Button
          variant="outline"
          disabled={activeDrillIdx === drills.length - 1}
          onClick={(e) => {
            animeButtonPop(e.currentTarget);
            setActiveDrillIdx((prev) => Math.min(drills.length - 1, prev + 1));
          }}
          className="gap-1.5 shadow-xs"
        >
          <span>Kalimat Berikutnya</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>

        {drills.length > 0 && drills.every((_, i) => Boolean(drillResults[i])) && onNextStage && (
          <Button
            onClick={(e) => {
              animeButtonPop(e.currentTarget);
              onNextStage();
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-md active:translate-y-0.5 will-change-transform"
          >
            <span>Lanjut ke Simulasi Peran</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
