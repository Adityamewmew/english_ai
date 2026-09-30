"use client";

import React, { useState } from "react";
import { Sparkles, Lock, CheckCircle2 } from "lucide-react";
import { useSpeechRecorder } from "@/hooks/use-speech-recorder";
import { SpeakingLabDrill, DrillItem } from "./SpeakingLabDrill";
import { SpeakingLabRoleplay, RoleplayData } from "./SpeakingLabRoleplay";
import { SpeakingLabChallenge, ChallengeData } from "./SpeakingLabChallenge";

export type { DrillItem, RoleplayData, ChallengeData };

interface SectionSpeakingLabProps {
  title: string;
  drills?: DrillItem[];
  roleplay?: RoleplayData;
  challenge?: ChallengeData;
  moduleId?: string;
  userId?: string;
  onPlayAudio?: (text: string) => void;
  onSpeakingComplete?: (speakingScore: number, isComplete: boolean) => void;
  onAdvanceToQuiz?: () => void;
}

export function SectionSpeakingLab({
  title,
  drills = [],
  roleplay = { context: "", roles: [], turns: [] },
  challenge = { scenario: "" },
  moduleId,
  userId,
  onPlayAudio,
  onSpeakingComplete,
  onAdvanceToQuiz,
}: SectionSpeakingLabProps) {
  const [activeTab, setActiveTab] = useState<"drill" | "roleplay" | "challenge">("drill");
  const [isDrillDone, setIsDrillDone] = useState(false);
  const [isRoleplayDone, setIsRoleplayDone] = useState(false);
  const [isChallengeDone, setIsChallengeDone] = useState(false);

  const [drillScore, setDrillScore] = useState<number>(80);
  const [roleplayScore, setRoleplayScore] = useState<number>(80);
  const [challengeScore, setChallengeScore] = useState<number>(85);

  // Hook perekam terpadu (Audio Blob + Speech Recognition STT)
  const {
    startListening,
    stopListening,
    playStudentAudio,
    stopStudentAudio,
    currentlyPlayingUrl,
  } = useSpeechRecorder();

  const handleDrillComplete = (avgScore: number) => {
    setIsDrillDone(true);
    setDrillScore(avgScore);
  };

  const handleRoleplayComplete = (avgScore: number) => {
    setIsRoleplayDone(true);
    setRoleplayScore(avgScore);
  };

  const handleChallengeComplete = (score: number) => {
    setIsChallengeDone(true);
    setChallengeScore(score);

    // Hitung rata-rata praktikum berbicara (Speaking Lab)
    const overallSpeaking = Math.round(
      drillScore * 0.4 + roleplayScore * 0.35 + score * 0.25
    );
    onSpeakingComplete?.(overallSpeaking, true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Speaking Lab</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
        </div>

        {/* 3-Stage Progressive Tab Navigation with Locks */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("drill")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "drill"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            {isDrillDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            <span>1. Pemanasan (Drill)</span>
          </button>

          <button
            type="button"
            disabled={!isDrillDone}
            onClick={() => isDrillDone && setActiveTab("roleplay")}
            title={!isDrillDone ? "Selesaikan seluruh kalimat pemanasan terlebih dahulu" : ""}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "roleplay"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : !isDrillDone
                ? "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            {!isDrillDone ? (
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            ) : isRoleplayDone ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : null}
            <span>2. Simulasi Peran</span>
          </button>

          <button
            type="button"
            disabled={!isRoleplayDone}
            onClick={() => isRoleplayDone && setActiveTab("challenge")}
            title={!isRoleplayDone ? "Selesaikan simulasi peran terlebih dahulu" : ""}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "challenge"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : !isRoleplayDone
                ? "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            {!isRoleplayDone ? (
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            ) : isChallengeDone ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : null}
            <span>3. Tantangan Spontan</span>
          </button>
        </div>
      </div>

      {/* --- STAGE 1: SHADOWING DRILL --- */}
      {activeTab === "drill" && (
        <SpeakingLabDrill
          drills={drills}
          moduleId={moduleId}
          userId={userId}
          currentlyPlayingUrl={currentlyPlayingUrl}
          onPlayAudio={onPlayAudio}
          onPlayStudentAudio={playStudentAudio}
          onStopStudentAudio={stopStudentAudio}
          startListening={startListening}
          stopListening={stopListening}
          onStageComplete={handleDrillComplete}
          onNextStage={() => {
            setIsDrillDone(true);
            setActiveTab("roleplay");
          }}
        />
      )}

      {/* --- STAGE 2: INTERACTIVE ROLEPLAY --- */}
      {activeTab === "roleplay" && (
        <SpeakingLabRoleplay
          roleplay={roleplay}
          moduleId={moduleId}
          userId={userId}
          currentlyPlayingUrl={currentlyPlayingUrl}
          onPlayAudio={onPlayAudio}
          onPlayStudentAudio={playStudentAudio}
          onStopStudentAudio={stopStudentAudio}
          startListening={startListening}
          stopListening={stopListening}
          onStageComplete={handleRoleplayComplete}
          onNextStage={() => {
            setIsRoleplayDone(true);
            setActiveTab("challenge");
          }}
        />
      )}

      {/* --- STAGE 3: SPONTANEOUS CHALLENGE --- */}
      {activeTab === "challenge" && (
        <SpeakingLabChallenge
          challenge={challenge}
          moduleId={moduleId}
          userId={userId}
          currentlyPlayingUrl={currentlyPlayingUrl}
          onPlayAudio={onPlayAudio}
          onPlayStudentAudio={playStudentAudio}
          onStopStudentAudio={stopStudentAudio}
          startListening={startListening}
          stopListening={stopListening}
          onStageComplete={handleChallengeComplete}
          onNextStage={() => {
            setIsChallengeDone(true);
            const overallSpeaking = Math.round(
              drillScore * 0.4 + roleplayScore * 0.35 + challengeScore * 0.25
            );
            onSpeakingComplete?.(overallSpeaking, true);
            onAdvanceToQuiz?.();
          }}
        />
      )}
    </div>
  );
}
