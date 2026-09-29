"use client";

import React, { useState } from "react";
import {
  Mic,
  Volume2,
  Users,
  Info,
} from "lucide-react";

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
  onPlayAudio?: (text: string) => void;
  startListening: (onResult: (text: string) => void, onEnd: () => void) => void;
  stopListening: () => void;
}

export function SpeakingLabRoleplay({
  roleplay,
  onPlayAudio,
  startListening,
  stopListening,
}: SpeakingLabRoleplayProps) {
  const defaultRole = roleplay.defaultUserRole || roleplay.roles[0] || "Reza";
  const [selectedRole, setSelectedRole] = useState<string>(defaultRole);
  const [activeTurnIdx, setActiveTurnIdx] = useState(0);
  const [completedTurns, setCompletedTurns] = useState<number[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const handleToggleMic = (turnIdx: number) => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      startListening(
        () => {
          setCompletedTurns((prev) => (prev.includes(turnIdx) ? prev : [...prev, turnIdx]));
          setIsRecording(false);
          if (turnIdx + 1 < roleplay.turns.length) {
            setActiveTurnIdx(turnIdx + 1);
          }
        },
        () => setIsRecording(false)
      );
    }
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
              Saya {r}
            </button>
          ))}
        </div>
      </div>

      {/* Context Banner */}
      {roleplay.context && (
        <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Skenario: </span>
            <span>{roleplay.context}</span>
          </div>
        </div>
      )}

      {/* Turns */}
      <div className="space-y-3 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6">
        {roleplay.turns.map((turn, idx) => {
          const isUserRole = turn.speaker === selectedRole;
          const isTurnCompleted = completedTurns.includes(idx);

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                isUserRole ? "justify-end" : "justify-start"
              }`}
            >
              {!isUserRole && (
                <div className="w-8 h-8 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {turn.speaker.charAt(0)}
                </div>
              )}

              <div
                className={`max-w-md rounded-2xl p-4 text-xs md:text-sm space-y-2.5 ${
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
          );
        })}
      </div>
    </div>
  );
}
