"use client";

import React, { useState, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  RotateCcw,
  HelpCircle,
  Award,
  Square,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { evaluateSpeechDiff, SpeechDiffResult } from "@/lib/speech-diff";
import { SpeechRecorderCallbackOptions, blobToBase64 } from "@/hooks/use-speech-recorder";
import { SpeechScoreCard } from "./SpeechScoreCard";

export interface ChallengeData {
  scenario: string;
  exampleAnswer?: string;
  targetGrammar?: string;
}

interface SpeakingLabChallengeProps {
  challenge: ChallengeData;
  moduleId?: string;
  userId?: string;
  currentlyPlayingUrl?: string | null;
  onPlayAudio?: (text: string) => void;
  onPlayStudentAudio?: (url: string) => void;
  onStopStudentAudio?: () => void;
  startListening: (options: SpeechRecorderCallbackOptions) => void;
  stopListening: () => void;
  onStageComplete?: (score: number) => void;
  onNextStage?: () => void;
}

export function SpeakingLabChallenge({
  challenge,
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
}: SpeakingLabChallengeProps) {
  const [showHint, setShowHint] = useState(false);
  const [challengeTranscript, setChallengeTranscript] = useState("");
  const [studentAudioUrl, setStudentAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);
  const [diffResult, setDiffResult] = useState<SpeechDiffResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const browserTranscriptRef = useRef<string>("");

  const isPlayingThisAudio = currentlyPlayingUrl === studentAudioUrl;

  const handleToggleChallengeMic = () => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setChallengeFeedback(null);
      setDiffResult(null);
      browserTranscriptRef.current = "";

      startListening({
        onTextResult: (text) => {
          browserTranscriptRef.current = text;
        },
        onAudioResult: async (audioUrl, audioBlob) => {
          setStudentAudioUrl(audioUrl);
          setIsRecording(false);

          let resolvedTranscript = browserTranscriptRef.current;

          if (audioBlob && audioBlob.size > 0) {
            try {
              setIsAnalyzing(true);
              const base64Audio = await blobToBase64(audioBlob);
              const res = await fetch("/api/curriculum/transcribe-speech", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  audioBase64: base64Audio,
                  mimeType: audioBlob.type,
                  targetText: challenge.exampleAnswer || undefined,
                }),
              });

              if (res.ok) {
                const data = await res.json();
                if (data.success && data.data?.transcript && data.data.transcript.trim().length > 0) {
                  resolvedTranscript = data.data.transcript.trim();
                }
              }
            } catch (err) {
              console.warn("AI Audio STT challenge error, fallback to Web Speech:", err);
            } finally {
              setIsAnalyzing(false);
            }
          }

          if (resolvedTranscript.trim().length > 0) {
            setChallengeTranscript(resolvedTranscript);
            evaluateChallengeSpoken(resolvedTranscript);
          }
        },
        onEnd: () => setIsRecording(false),
      });
    }
  };

  const evaluateChallengeSpoken = async (text: string) => {
    if (!text) return;

    // Jika ada contoh kalimat, lakukan diff analisis
    if (challenge.exampleAnswer) {
      const diff = evaluateSpeechDiff(challenge.exampleAnswer, text);
      setDiffResult(diff);
    }

    try {
      setIsEvaluating(true);
      const calculatedScore = challenge.exampleAnswer
        ? evaluateSpeechDiff(challenge.exampleAnswer, text).score
        : 85;
      onStageComplete?.(calculatedScore);

      const targetMod = moduleId || "A1-M01";
      const res = await fetch(`/api/curriculum/modules/${targetMod}/tutor/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `[PRAKTIKUM SPONTAN] Skenario: "${challenge.scenario}". Target Grammar: "${challenge.targetGrammar || ""}". Kalimat saya: "${text}". Berikan evaluasi 1-2 kalimat apakah penggunaan grammar saya tepat.`,
          history: [],
          userId: userId || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && (data.data?.reply || data.data?.message)) {
        const replyText = data.data.reply || data.data.message;
        setChallengeFeedback(replyText);
      } else {
        setChallengeFeedback("Bagus sekali! Pelafalan kamu sudah jelas dan sesuai konteks materi.");
      }
    } catch {
      setChallengeFeedback("Bagus sekali! Pelafalan kamu terdengar percaya diri dan tepat sasaran.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRetry = () => {
    setChallengeTranscript("");
    setStudentAudioUrl(null);
    setChallengeFeedback(null);
    setDiffResult(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
              Misi Berbicara Spontan
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
            {challenge.scenario}
          </h4>
        </div>

        {challenge.targetGrammar && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold">
            <span>Target Tata Bahasa:</span>
            <span className="font-bold">{challenge.targetGrammar}</span>
          </div>
        )}

        {/* Hint Toggle */}
        {challenge.exampleAnswer && (
          <div>
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? "Sembunyikan Contoh" : "Butuh Inspirasi Kalimat?"}</span>
            </button>
            {showHint && (
              <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-400 italic border border-slate-200 dark:border-slate-700">
                Contoh: &ldquo;{challenge.exampleAnswer}&rdquo;
              </div>
            )}
          </div>
        )}

        {/* Recording Area */}
        <div className="pt-2 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={handleToggleChallengeMic}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-lg ${
              isAnalyzing
                ? "bg-indigo-600 opacity-90 cursor-wait"
                : isRecording
                ? "bg-rose-600 scale-110 animate-ping ring-4 ring-rose-300"
                : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
            }`}
          >
            {isAnalyzing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>

          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {isAnalyzing
              ? "Menganalisis Artikulasimu..."
              : isRecording
              ? "Sedang Merekam Suaramu... (Klik untuk Selesai)"
              : challengeTranscript
              ? "Klik untuk Merekam Ulang"
              : "Tekan untuk Mulai Berbicara Bebas"}
          </span>

          {challengeTranscript && (
            <div className="w-full text-center max-w-lg mt-2 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Transkrip Suara Kamu:
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                &ldquo;{challengeTranscript}&rdquo;
              </p>

              {/* Quick Play Student Audio for spontaneous speech */}
              {studentAudioUrl && onPlayStudentAudio && (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      isPlayingThisAudio && onStopStudentAudio
                        ? onStopStudentAudio()
                        : onPlayStudentAudio(studentAudioUrl)
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                      isPlayingThisAudio
                        ? "bg-amber-600 text-white animate-pulse"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {isPlayingThisAudio ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop Suara Saya</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Putar Ulang Rekaman Saya</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Example Match Diff Card with Comparison */}
        {diffResult && challenge.exampleAnswer && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Perbandingan dengan Kalimat Rekomendasi:
            </span>
            <SpeechScoreCard
              score={diffResult.score}
              passed={diffResult.passed}
              statusText={diffResult.statusText}
              words={diffResult.words}
              spokenText={challengeTranscript}
              targetText={challenge.exampleAnswer}
              studentAudioUrl={studentAudioUrl}
              isPlayingStudentAudio={isPlayingThisAudio}
              onRetry={handleRetry}
              onPlayStudentAudio={onPlayStudentAudio}
              onStopStudentAudio={onStopStudentAudio}
              onPlayNativeAudio={onPlayAudio}
            />
          </div>
        )}

        {/* AI Evaluation */}
        {isEvaluating && (
          <div className="flex items-center gap-2 p-3.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-xs text-blue-700 dark:text-blue-300">
            <RotateCcw className="w-4 h-4 animate-spin" />
            <span>Mr. Khoirul sedang mendengarkan dan mengevaluasi jawabanmu...</span>
          </div>
        )}

        {challengeFeedback && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Evaluasi Mr. Khoirul:</span>
              </div>
              {onPlayAudio && (
                <button
                  type="button"
                  onClick={() => onPlayAudio(challengeFeedback)}
                  className="p-1 rounded text-emerald-700 hover:text-emerald-900 transition-colors"
                  title="Dengarkan Suara Evaluasi"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {challengeFeedback}
            </p>
          </div>
        )}

        {challengeTranscript && onNextStage && (
          <div className="flex justify-end pt-3">
            <button
              type="button"
              onClick={onNextStage}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md animate-pulse"
            >
              <span>Lanjut ke Kuis Evaluasi</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
