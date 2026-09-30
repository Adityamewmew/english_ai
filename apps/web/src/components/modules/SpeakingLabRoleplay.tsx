"use client";

import React, { useState } from "react";
import {
  Mic,
  Volume2,
  Users,
  Info,
} from "lucide-react";
import { evaluateSpeechDiff, SpeechDiffResult } from "@/lib/speech-diff";
import { SpeechScoreCard } from "./SpeechScoreCard";

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
  onPlayAudio?: (text: string) => void;
  startListening: (onResult: (text: string) => void, onEnd: () => void) => void;
  stopListening: () => void;
}

export function SpeakingLabRoleplay({
  roleplay,
  moduleId,
  userId,
  onPlayAudio,
  startListening,
  stopListening,
}: SpeakingLabRoleplayProps) {
  const defaultRole = roleplay.defaultUserRole || roleplay.roles[0] || "Reza";
  const [selectedRole, setSelectedRole] = useState<string>(defaultRole);
  const [activeTurnIdx, setActiveTurnIdx] = useState(0);
  const [completedTurns, setCompletedTurns] = useState<number[]>([]);
  const [turnTranscripts, setTurnTranscripts] = useState<Record<number, string>>({});
  const [turnResults, setTurnResults] = useState<Record<number, SpeechDiffResult>>({});
  const [turnTips, setTurnTips] = useState<Record<number, string>>({});
  const [loadingTips, setLoadingTips] = useState<Record<number, boolean>>({});
  const [isRecording, setIsRecording] = useState(false);

  const handleSpeechResult = async (turnIdx: number, spokenText: string) => {
    const turn = roleplay.turns[turnIdx];
    if (!turn) return;

    setTurnTranscripts((prev) => ({ ...prev, [turnIdx]: spokenText }));

    // Evaluasi instan kata per kata
    const diff = evaluateSpeechDiff(turn.text, spokenText);
    setTurnResults((prev) => ({ ...prev, [turnIdx]: diff }));
    setCompletedTurns((prev) => (prev.includes(turnIdx) ? prev : [...prev, turnIdx]));

    // Async evaluasi ke backend untuk tips fonetik & RAG memory
    if (moduleId && spokenText.trim().length > 0) {
      try {
        setLoadingTips((prev) => ({ ...prev, [turnIdx]: true }));
        const res = await fetch(`/api/curriculum/modules/${moduleId}/evaluate-speech`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetText: turn.text,
            spokenText,
            score: diff.score,
            missedWords: diff.missedWords,
            userId: userId || undefined,
          }),
        });
        const json = await res.json();
        if (json.success && json.data?.tip) {
          setTurnTips((prev) => ({ ...prev, [turnIdx]: json.data.tip }));
        }
      } catch (err) {
        console.warn("Gagal mengambil tips Mr. Khoirul:", err);
      } finally {
        setLoadingTips((prev) => ({ ...prev, [turnIdx]: false }));
      }
    }
  };

  const handleToggleMic = (turnIdx: number) => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setActiveTurnIdx(turnIdx);
      startListening(
        (spokenText) => {
          setIsRecording(false);
          handleSpeechResult(turnIdx, spokenText);
        },
        () => setIsRecording(false)
      );
    }
  };

  const handleRetryTurn = (turnIdx: number) => {
    setTurnTranscripts((prev) => {
      const next = { ...prev };
      delete next[turnIdx];
      return next;
    });
    setTurnResults((prev) => {
      const next = { ...prev };
      delete next[turnIdx];
      return next;
    });
    setTurnTips((prev) => {
      const next = { ...prev };
      delete next[turnIdx];
      return next;
    });
    setCompletedTurns((prev) => prev.filter((i) => i !== turnIdx));
  };

  return (
    <div className="space-y-4">
      {/* Role Chooser */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Users className="w-4 h-4 text-blue-600" />
          <span>Pilih Peranmu:</span>
        </div>
        <div className="inline-flex gap-2">
          {roleplay.roles.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRole(r)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedRole === r
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {r} {r === defaultRole ? "(Default)" : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Context Scenario */}
      {roleplay.context && (
        <div className="flex items-start gap-2.5 p-3.5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs text-blue-900 dark:text-blue-200">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Skenario Roleplay: </strong>
            <span>{roleplay.context}</span>
          </div>
        </div>
      )}

      {/* Dialogue Chat Stream */}
      <div className="space-y-4 pt-2">
        {roleplay.turns.map((turn, idx) => {
          const isUserRole = turn.speaker.toLowerCase() === selectedRole.toLowerCase();
          const isTurnCompleted = completedTurns.includes(idx);
          const diffResult = turnResults[idx];
          const tip = turnTips[idx];
          const isLoadingTip = loadingTips[idx] || false;

          return (
            <div
              key={idx}
              className={`flex flex-col gap-2 ${
                isUserRole ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`flex gap-3 max-w-xl w-full ${
                  isUserRole ? "justify-end" : "justify-start"
                }`}
              >
                {!isUserRole && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {turn.speaker.charAt(0)}
                  </div>
                )}

                <div
                  className={`max-w-md w-full rounded-2xl p-4 text-xs md:text-sm space-y-2.5 ${
                    isUserRole
                      ? "bg-blue-600 text-white rounded-tr-none shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isUserRole ? "text-blue-100" : "text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {turn.speaker} {isUserRole ? "(Kamu)" : "(Mitra Bicara)"}
                    </span>

                    {!isUserRole && onPlayAudio && (
                      <button
                        type="button"
                        onClick={() => onPlayAudio(turn.text)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Dengarkan Suara Mitra"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="font-semibold leading-relaxed">{turn.text}</p>

                  {turn.translation && (
                    <p className={`text-[11px] italic ${isUserRole ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
                      {turn.translation}
                    </p>
                  )}

                  {isUserRole && (
                    <div className="pt-2 border-t border-blue-500/50 flex items-center justify-between">
                      <span className="text-[10px] text-blue-100">
                        {isTurnCompleted ? "Selesai diucapkan" : "Bacakan kalimat ini:"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleMic(idx)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                          isRecording && activeTurnIdx === idx
                            ? "bg-rose-500 text-white animate-pulse"
                            : isTurnCompleted
                            ? "bg-white text-blue-700 hover:bg-blue-50"
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        <Mic className="w-3 h-3" />
                        <span>
                          {isRecording && activeTurnIdx === idx
                            ? "Merekam..."
                            : isTurnCompleted
                            ? "Bicara Lagi"
                            : "Bicara Sekarang"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {isUserRole && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {turn.speaker.charAt(0)}
                  </div>
                )}
              </div>

              {/* Speech Evaluation Score Card for User Turn */}
              {isUserRole && diffResult && (
                <div className="max-w-md w-full mr-11">
                  <SpeechScoreCard
                    score={diffResult.score}
                    passed={diffResult.passed}
                    statusText={diffResult.statusText}
                    words={diffResult.words}
                    spokenText={turnTranscripts[idx] || ""}
                    tip={tip}
                    isLoadingTip={isLoadingTip}
                    onRetry={() => handleRetryTurn(idx)}
                    onPlayTipAudio={onPlayAudio}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
