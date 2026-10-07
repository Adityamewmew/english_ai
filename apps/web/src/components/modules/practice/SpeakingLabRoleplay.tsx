"use client";

import React, { useState, useRef } from "react";
import {
  Mic,
  Volume2,
  Users,
  Info,
  Loader2,
  ChevronRight,
  Play,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Radio,
  Square,
} from "lucide-react";
import { evaluateSpeechDiff } from "@/lib/speech-diff";
import { SpeechRecorderCallbackOptions, blobToBase64 } from "@/hooks/use-speech-recorder";
import { getApiUrl } from "@/lib/api-client";
import { RoleplayBriefing } from "./RoleplayBriefing";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { animeCardHover, animeButtonPop, animeShake, animeCardPulse } from "@/lib/anime-effects";

export interface RoleplayTurn {
  speaker: string;
  text: string;
  translation?: string;
}

export interface RoleplayData {
  context: string;
  roles: string[];
  defaultUserRole?: string;
  turns: RoleplayTurn[];
}

interface SpeakingLabRoleplayProps {
  roleplay: RoleplayData;
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

export function SpeakingLabRoleplay({
  roleplay,
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
}: SpeakingLabRoleplayProps) {
  const turns = roleplay.turns || [];

  // Kumpulkan seluruh nama speaker dari daftar giliran percakapan
  const turnSpeakers = Array.from(
    new Set(turns.map((t) => t.speaker || (t as any).role || "").filter(Boolean))
  );

  const knownAiKeywords = [
    "khoirul",
    "tutor",
    "instruktur",
    "mitra",
    "ai",
    "resepsionis",
    "barista",
    "petugas",
    "waiter",
  ];
  const knownUserKeywords = [
    "you",
    "student",
    "siswa",
    "peserta",
    "pelanggan",
    "guest",
  ];

  // Tentukan speaker user secara akurat
  let autoUserRole = roleplay.defaultUserRole || "";
  if (
    !autoUserRole ||
    !turnSpeakers.some((s) => s.toLowerCase() === autoUserRole.toLowerCase())
  ) {
    const matchedUser = turnSpeakers.find((s) =>
      knownUserKeywords.some((k) => s.toLowerCase().includes(k))
    );
    if (matchedUser) {
      autoUserRole = matchedUser;
    } else {
      const nonAi = turnSpeakers.find(
        (s) => !knownAiKeywords.some((k) => s.toLowerCase().includes(k))
      );
      autoUserRole = nonAi || turnSpeakers[1] || turnSpeakers[0] || "Kamu";
    }
  }

  const aiRole =
    turnSpeakers.find((s) => s.toLowerCase() !== autoUserRole.toLowerCase()) ||
    (roleplay.roles || []).find((r) => r.toLowerCase() !== autoUserRole.toLowerCase()) ||
    "Mr. Khoirul";

  const isUserTurn = (turn: RoleplayTurn) => {
    const s = (turn.speaker || "").toLowerCase();
    const r = ((turn as any).role || "").toLowerCase();
    const u = autoUserRole.toLowerCase();

    if (s.includes("you") || r === "student" || r === "siswa") return true;
    if (s.includes("khoirul") || r === "tutor") return false;
    return s === u || r === u;
  };

  const [isStarted, setIsStarted] = useState(false);
  const [visibleTurnCount, setVisibleTurnCount] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [activeTurnIdx, setActiveTurnIdx] = useState<number | null>(null);

  const [completedTurns, setCompletedTurns] = useState<number[]>([]);
  const [turnTranscripts, setTurnTranscripts] = useState<Record<number, string>>({});
  const [studentTurnAudioUrls, setStudentTurnAudioUrls] = useState<Record<number, string>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [liveSpokenText, setLiveSpokenText] = useState("");
  const [analyzingTurnIdx, setAnalyzingTurnIdx] = useState<number | null>(null);

  const browserTranscriptRef = useRef<string>("");

  const handleStartRoleplay = () => {
    setIsStarted(true);
    setVisibleTurnCount(1);

    const firstTurn = turns[0];
    if (firstTurn) {
      const isFirstAi = !isUserTurn(firstTurn);
      if (isFirstAi) {
        setIsAiSpeaking(true);
        if (onPlayAudio && firstTurn.text) {
          onPlayAudio(firstTurn.text);
        }
        const delay = Math.max(2500, (firstTurn.text || "").split(" ").length * 420);
        setTimeout(() => {
          setIsAiSpeaking(false);
          if (turns.length > 1) {
            setVisibleTurnCount(2);
            setActiveTurnIdx(1);
          }
        }, delay);
      } else {
        setActiveTurnIdx(0);
      }
    }
  };

  const handleSpeechResult = (turnIdx: number, spokenText: string) => {
    const turn = turns[turnIdx];
    if (!turn) return;

    setTurnTranscripts((prev) => ({ ...prev, [turnIdx]: spokenText }));

    const updatedCompletedTurns = completedTurns.includes(turnIdx)
      ? completedTurns
      : [...completedTurns, turnIdx];
    setCompletedTurns(updatedCompletedTurns);

    const userTurnIndices = turns
      .map((t, i) => (isUserTurn(t) ? i : -1))
      .filter((i) => i !== -1);

    const isAllUserTurnsCompleted =
      userTurnIndices.length > 0 &&
      userTurnIndices.every((idx) => updatedCompletedTurns.includes(idx));

    if (isAllUserTurnsCompleted) {
      // Evaluasi skor kelulusan praktikum tanpa menampilkan kartu penilaian penalti
      const diff = evaluateSpeechDiff(turn.text || "", spokenText);
      const earnedScore = Math.max(80, diff.score);
      onStageComplete?.(earnedScore);
    }

    // Auto-advance ke giliran AI berikutnya setelah 1.2 detik
    setTimeout(() => {
      const nextTurnIdx = turnIdx + 1;
      if (nextTurnIdx < turns.length) {
        setVisibleTurnCount(nextTurnIdx + 1);
        const nextTurn = turns[nextTurnIdx];
        const isNextAi = !isUserTurn(nextTurn);

        if (isNextAi) {
          setIsAiSpeaking(true);
          if (onPlayAudio && nextTurn.text) {
            onPlayAudio(nextTurn.text);
          }
          const delay = Math.max(2500, (nextTurn.text || "").split(" ").length * 420);
          setTimeout(() => {
            setIsAiSpeaking(false);
            const followingTurnIdx = nextTurnIdx + 1;
            if (followingTurnIdx < turns.length) {
              setVisibleTurnCount(followingTurnIdx + 1);
              setActiveTurnIdx(followingTurnIdx);
            }
          }, delay);
        } else {
          setActiveTurnIdx(nextTurnIdx);
        }
      }
    }, 1200);
  };

  const handleToggleMic = (turnIdx: number) => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
      setLiveSpokenText("");
    } else {
      const turn = turns[turnIdx];
      setIsRecording(true);
      setActiveTurnIdx(turnIdx);
      setLiveSpokenText("");
      browserTranscriptRef.current = "";

      startListening({
        onTextResult: (spokenText) => {
          browserTranscriptRef.current = spokenText;
          setLiveSpokenText(spokenText);
        },
        onAudioResult: async (audioUrl, audioBlob) => {
          setStudentTurnAudioUrls((prev) => ({ ...prev, [turnIdx]: audioUrl }));
          setIsRecording(false);
          setLiveSpokenText("");

          let resolvedTranscript = browserTranscriptRef.current;

          if (audioBlob && audioBlob.size > 0 && turn) {
            try {
              setAnalyzingTurnIdx(turnIdx);
              const base64Audio = await blobToBase64(audioBlob);
              const res = await fetch(getApiUrl("/api/curriculum/transcribe-speech"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  audioBase64: base64Audio,
                  mimeType: audioBlob.type,
                  targetText: turn.text,
                }),
              });

              if (res.ok) {
                const data = await res.json();
                if (data.success && data.data?.transcript && data.data.transcript.trim().length > 0) {
                  resolvedTranscript = data.data.transcript.trim();
                }
              }
            } catch (err) {
              console.warn("AI Audio STT roleplay fallback to Web Speech:", err);
            } finally {
              setAnalyzingTurnIdx(null);
            }
          }

          if (resolvedTranscript.trim().length > 0) {
            handleSpeechResult(turnIdx, resolvedTranscript);
          }
        },
        onEnd: () => {
          setIsRecording(false);
          setLiveSpokenText("");
        },
      });
    }
  };

  const userTurnIndices = turns
    .map((t, i) => (isUserTurn(t) ? i : -1))
    .filter((i) => i !== -1);
  const isAllUserTurnsCompleted =
    userTurnIndices.length > 0 &&
    userTurnIndices.every((idx) => completedTurns.includes(idx));

  if (!isStarted) {
    return (
      <RoleplayBriefing
        context={roleplay.context}
        autoUserRole={autoUserRole}
        aiRole={aiRole}
        onStartRoleplay={handleStartRoleplay}
      />
    );
  }

  const currentVisibleTurns = turns.slice(0, visibleTurnCount);

  return (
    <div className="space-y-4">
      {/* Top Session Status Bar */}
      <Card
        onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
        onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 sm:p-5 rounded-2xl shadow-xs border-slate-200 dark:border-slate-800 will-change-transform"
      >
        <div className="flex items-center gap-2.5 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <Users className="w-4 h-4 text-blue-600" />
            <span>{autoUserRole} (Kamu) &amp; {aiRole} (AI)</span>
          </div>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 dark:text-slate-400">
            {completedTurns.length} dari {userTurnIndices.length} giliran selesai
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isAiSpeaking ? (
            <Badge variant="warning" className="gap-1.5 text-xs animate-pulse">
              <Radio className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              <span>{aiRole} sedang berbicara...</span>
            </Badge>
          ) : isAllUserTurnsCompleted ? (
            <Badge variant="success" className="gap-1 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Percakapan Selesai</span>
            </Badge>
          ) : (
            <Badge variant="primary" className="gap-1.5 text-xs font-semibold">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Simulasi Berlangsung</span>
            </Badge>
          )}
        </div>
      </Card>

      {/* Sequential Chat Feed */}
      <div className="space-y-6 pt-2">
        {currentVisibleTurns.map((turn, idx) => {
          const isUserRole = isUserTurn(turn);
          const isTurnCompleted = completedTurns.includes(idx);
          const studentAudio = studentTurnAudioUrls[idx] || null;
          const isCurrentActiveUserTurn = isUserRole && !isTurnCompleted;
          const isThisTurnRecording = isRecording && activeTurnIdx === idx;

          return (
            <div
              key={idx}
              className={`flex flex-col gap-2 ${
                isUserRole ? "items-end" : "items-start"
              } animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`flex gap-3.5 max-w-2xl w-full ${
                  isUserRole ? "justify-end" : "justify-start"
                }`}
              >
                {!isUserRole && (
                  <div className="w-9 h-9 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                    {turn.speaker.charAt(0)}
                  </div>
                )}

                <div
                  className={`max-w-xl w-full rounded-2xl p-5 sm:p-6 text-sm md:text-base space-y-3 shadow-xs transition-all ${
                    isUserRole
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-none"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isUserRole ? "text-blue-100" : "text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {turn.speaker} {isUserRole ? "(Kamu)" : "(Mitra AI)"}
                    </span>

                    {!isUserRole && onPlayAudio && (
                      <button
                        type="button"
                        onClick={() => onPlayAudio(turn.text)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Dengarkan Ulang Suara Mitra"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="font-semibold leading-relaxed text-sm">
                    {turn.text}
                  </p>

                  {turn.translation && (
                    <p
                      className={`text-[11px] italic ${
                        isUserRole ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {turn.translation}
                    </p>
                  )}

                  {/* Teks ucapan langsung saat merekam */}
                  {isThisTurnRecording && (
                    <div className="p-2.5 rounded-xl bg-blue-700/60 border border-blue-400/40 text-xs text-white space-y-1 animate-in fade-in">
                      <div className="flex items-center gap-1.5 text-[10px] text-blue-200">
                        <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                        <span>Mendengarkan... (bicara santai, tidak akan terpotong)</span>
                      </div>
                      <p className="italic text-blue-100 text-xs min-h-[1.2rem]">
                        {liveSpokenText ? `"${liveSpokenText}"` : "Katakan kalimat panduan di atas..."}
                      </p>
                    </div>
                  )}

                  {/* Transkrip yang terdeteksi setelah selesai */}
                  {isUserRole && isTurnCompleted && turnTranscripts[idx] && (
                    <div className="pt-2 border-t border-blue-400/30 flex items-center justify-between gap-2 text-[11px] text-blue-100">
                      <div className="flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                        <span className="truncate italic">
                          &ldquo;{turnTranscripts[idx]}&rdquo;
                        </span>
                      </div>
                      {studentAudio && onPlayStudentAudio && (
                        <button
                          type="button"
                          onClick={() => {
                            if (currentlyPlayingUrl === studentAudio) {
                              onStopStudentAudio?.();
                            } else {
                              onPlayStudentAudio(studentAudio);
                            }
                          }}
                          className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-[10px] font-medium transition-colors shrink-0"
                        >
                          {currentlyPlayingUrl === studentAudio ? "Berhenti" : "Dengar Suara"}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Action Bar Khusus User Turn */}
                  {isUserRole && (
                    <div className="pt-2.5 border-t border-blue-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-[10px] text-blue-100">
                        {isThisTurnRecording
                          ? "Bicara perlahan... Klik 'Selesai Bicara' jika sudah:"
                          : isTurnCompleted
                          ? "Giliran selesai diucapkan"
                          : "Bacakan kalimat panduan ini:"}
                      </span>

                      <button
                        type="button"
                        disabled={analyzingTurnIdx === idx || isAiSpeaking}
                        onClick={() => handleToggleMic(idx)}
                        className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                          analyzingTurnIdx === idx
                            ? "bg-indigo-600 text-white cursor-wait opacity-90"
                            : isThisTurnRecording
                            ? "bg-rose-500 hover:bg-rose-600 text-white ring-2 ring-rose-300 animate-pulse"
                            : isCurrentActiveUserTurn
                            ? "bg-white text-blue-700 hover:bg-blue-50 ring-2 ring-white/60 font-bold"
                            : isTurnCompleted
                            ? "bg-white/20 text-white hover:bg-white/30"
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        {analyzingTurnIdx === idx ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Menganalisis...</span>
                          </>
                        ) : isThisTurnRecording ? (
                          <>
                            <Square className="w-3.5 h-3.5 fill-current" />
                            <span>Selesai Bicara</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5" />
                            <span>
                              {isTurnCompleted
                                ? "Bicara Ulang"
                                : "Bicara Sekarang"}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUserRole && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                    {turn.speaker.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Banner & Next Stage Button */}
      {isAllUserTurnsCompleted && onNextStage && (
        <Card className="p-5 sm:p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">Semua putaran simulasi peran berhasil kamu selesaikan dengan baik!</span>
          </div>

          <Button
            size="md"
            onClick={(e) => {
              animeButtonPop(e.currentTarget);
              onNextStage();
            }}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm flex-shrink-0 active:translate-y-0.5 will-change-transform"
          >
            <span>Lanjut ke Tantangan Spontan</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Card>
      )}
    </div>
  );
}
