"use client";

import React, { useState, useRef, useEffect } from "react";
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
import {
  animeButtonPop,
  animeCardReveal,
  animeCardHover,
  animeCardPulse,
} from "@/lib/anime-effects";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  const mainCardRef = useRef<HTMLDivElement>(null);
  const feedbackCardRef = useRef<HTMLDivElement>(null);
  const micButtonRef = useRef<HTMLButtonElement>(null);
  const browserTranscriptRef = useRef<string>("");

  const isPlayingThisAudio = currentlyPlayingUrl === studentAudioUrl;

  useEffect(() => {
    if (challengeFeedback && feedbackCardRef.current) {
      animeCardReveal(feedbackCardRef.current);
    }
  }, [challengeFeedback]);

  const handleToggleChallengeMic = () => {
    if (micButtonRef.current) {
      animeButtonPop(micButtonRef.current);
    }

    if (isRecording) {
      stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      if (micButtonRef.current) {
        animeCardPulse(micButtonRef.current);
      }
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
              console.warn("AI Audio STT gagal, fallback:", err);
            } finally {
              setIsAnalyzing(false);
            }
          }

          if (resolvedTranscript.trim().length > 0) {
            setChallengeTranscript(resolvedTranscript);

            if (challenge.exampleAnswer) {
              const diff = evaluateSpeechDiff(challenge.exampleAnswer, resolvedTranscript);
              setDiffResult(diff);
            }

            if (moduleId) {
              try {
                setIsEvaluating(true);
                const evalRes = await fetch(`/api/curriculum/modules/${moduleId}/evaluate-challenge`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    scenario: challenge.scenario,
                    exampleAnswer: challenge.exampleAnswer,
                    spokenText: resolvedTranscript,
                    userId: userId || undefined,
                  }),
                });

                const evalJson = await evalRes.json();
                if (evalJson.success && evalJson.data) {
                  setChallengeFeedback(evalJson.data.feedback);
                  onStageComplete?.(evalJson.data.score || 85);
                }
              } catch (err) {
                console.warn("Gagal mengevaluasi respon tantangan:", err);
              } finally {
                setIsEvaluating(false);
              }
            } else {
              onStageComplete?.(85);
            }
          }
        },
        onEnd: () => {
          setIsRecording(false);
        },
      });
    }
  };

  const handleRetry = () => {
    setChallengeTranscript("");
    setStudentAudioUrl(null);
    setChallengeFeedback(null);
    setDiffResult(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Info Card using shadcn Card */}
      <Card className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Tantangan Bebas (Free Challenge)
          </span>
        </div>
        <Badge variant="secondary" className="font-bold text-xs">
          Uji Spontanitas
        </Badge>
      </Card>

      {/* Main Challenge Card using shadcn Card */}
      <Card
        ref={mainCardRef}
        onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
        onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 sm:p-8 md:p-10 rounded-2xl shadow-xs space-y-6 sm:space-y-7 will-change-transform"
      >
        <div className="space-y-2.5">
          <Badge variant="secondary" size="sm" className="font-bold uppercase tracking-wider">
            Skenario Bebas
          </Badge>
          <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
            {challenge.scenario}
          </h4>
        </div>

        {challenge.targetGrammar && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
            <span>Target Tata Bahasa:</span>
            <span className="font-bold">{challenge.targetGrammar}</span>
          </div>
        )}

        {/* Hint Toggle */}
        {challenge.exampleAnswer && (
          <div>
            <button
              type="button"
              onClick={(e) => {
                animeButtonPop(e.currentTarget);
                setShowHint(!showHint);
              }}
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{showHint ? "Sembunyikan Contoh" : "Butuh Inspirasi Kalimat?"}</span>
            </button>
            {showHint && (
              <div className="mt-3 p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs sm:text-sm text-slate-600 dark:text-slate-400 italic border border-slate-200 dark:border-slate-700 animate-in fade-in">
                Contoh: &ldquo;{challenge.exampleAnswer}&rdquo;
              </div>
            )}
          </div>
        )}

        {/* Recording Area */}
        <div className="pt-2 flex flex-col items-center justify-center p-8 sm:p-10 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-4">
          <button
            ref={micButtonRef}
            type="button"
            disabled={isAnalyzing}
            onClick={handleToggleChallengeMic}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white transition-all shadow-lg cursor-pointer active:scale-95 will-change-transform ${
              isAnalyzing
                ? "bg-indigo-600 opacity-90 cursor-wait"
                : isRecording
                ? "bg-rose-600 animate-pulse ring-4 ring-rose-300"
                : "bg-purple-600 hover:bg-purple-700 hover:scale-105"
            }`}
          >
            {isAnalyzing ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-7 h-7" />
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </button>

          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {isAnalyzing
              ? "Menganalisis Artikulasimu..."
              : isRecording
              ? "Merekam Suara... (Klik untuk Selesai)"
              : challengeTranscript
              ? "Klik untuk Merekam Ulang"
              : "Tekan untuk Mulai Berbicara Bebas"}
          </span>

          {isRecording && (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold animate-pulse">
              <span className="w-1.5 h-3 bg-rose-500 rounded-full animate-pulse" />
              <span className="w-1.5 h-5 bg-rose-500 rounded-full animate-pulse [animation-delay:150ms]" />
              <span className="w-1.5 h-3 bg-rose-500 rounded-full animate-pulse [animation-delay:300ms]" />
              <span className="ml-1 text-[11px]">Mikrofon Aktif...</span>
            </div>
          )}

          {challengeTranscript && (
            <div className="w-full text-center max-w-lg mt-2 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Transkrip Suara Kamu:
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                &ldquo;{challengeTranscript}&rdquo;
              </p>

              {/* Quick Play Student Audio for spontaneous speech */}
              {studentAudioUrl && onPlayStudentAudio && (
                <div className="flex justify-center pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      animeButtonPop(e.currentTarget);
                      isPlayingThisAudio && onStopStudentAudio
                        ? onStopStudentAudio()
                        : onPlayStudentAudio(studentAudioUrl);
                    }}
                    className={`gap-1.5 shadow-xs ${
                      isPlayingThisAudio ? "bg-amber-600 text-white" : ""
                    }`}
                  >
                    {isPlayingThisAudio ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop Suara</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Dengar Suara Saya</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Example Match Diff Card with Comparison */}
        {diffResult && challenge.exampleAnswer && (
          <div className="space-y-3 pt-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
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
          <div className="flex items-center gap-3 p-4 sm:p-5 bg-blue-50 dark:bg-blue-950/30 rounded-2xl text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium">
            <RotateCcw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Mr. Khoirul sedang mendengarkan dan mengevaluasi jawabanmu...</span>
          </div>
        )}

        {challengeFeedback && (
          <Card
            ref={feedbackCardRef}
            className="p-5 sm:p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-3 shadow-xs will-change-transform"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Evaluasi AI Tutor:</span>
              </div>
              {onPlayAudio && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    animeButtonPop(e.currentTarget);
                    onPlayAudio(challengeFeedback);
                  }}
                  className="min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 text-emerald-700 hover:text-emerald-900"
                  title="Dengarkan Suara Evaluasi"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {challengeFeedback}
            </p>
          </Card>
        )}

        {challengeTranscript && onNextStage && (
          <div className="flex justify-end pt-4">
            <Button
              onClick={(e) => {
                animeButtonPop(e.currentTarget);
                onNextStage();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm active:translate-y-0.5 will-change-transform"
            >
              <span>Lanjut ke Kuis Evaluasi</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
