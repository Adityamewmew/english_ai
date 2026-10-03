"use client";

import React, { useState } from "react";
import { Sparkles, Lock, CheckCircle2 } from "lucide-react";
import { useSpeechRecorder } from "@/hooks/use-speech-recorder";
import { SpeakingLabDrill, DrillItem } from "./SpeakingLabDrill";
import { SpeakingLabRoleplay, RoleplayData } from "./SpeakingLabRoleplay";
import { SpeakingLabChallenge, ChallengeData } from "./SpeakingLabChallenge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { animeButtonPop, animeShake } from "@/lib/anime-effects";

export type { DrillItem, RoleplayData, ChallengeData };

export interface VocabItemForDrill {
  word: string;
  ipa?: string;
  meaning?: string;
  collocation?: string;
}

interface SectionSpeakingLabProps {
  title: string;
  drills?: DrillItem[];
  roleplay?: RoleplayData;
  challenge?: ChallengeData;
  vocabItems?: VocabItemForDrill[];
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
  vocabItems = [],
  moduleId,
  userId,
  onPlayAudio,
  onSpeakingComplete,
  onAdvanceToQuiz,
}: SectionSpeakingLabProps) {
  // 1. Resolve Drills: synthesize from vocab collocations or roleplay turns if empty
  const resolvedDrills = React.useMemo(() => {
    if (drills && drills.length > 0) return drills;

    // Source A: Vocab items with collocations or words
    if (vocabItems && vocabItems.length > 0) {
      const candidates = vocabItems.filter((v) => v.collocation || v.word);
      if (candidates.length > 0) {
        return candidates.slice(0, 3).map((v, idx) => {
          const rawCollocation = v.collocation || `I am ${v.word}.`;
          const cleanText = rawCollocation.includes(" / ")
            ? rawCollocation.split(" / ")[0].trim()
            : rawCollocation.trim();
          return {
            id: `drill-vocab-${idx + 1}`,
            targetText: cleanText,
            focus: `Pelafalan: "${v.word}" (${v.meaning || ""})`,
            hint: v.ipa ? `Panduan fonetik: ${v.ipa}` : `Fokus pada intonasi natural`,
          };
        });
      }
    }

    // Source B: Roleplay conversation turns
    const turns = roleplay?.turns || [];
    if (turns.length > 0) {
      const userTurns = turns.filter((t) => {
        const sp = (t.speaker || "").toLowerCase();
        return sp.includes("you") || sp.includes("student") || sp.includes("kamu");
      });
      const selectedTurns = userTurns.length > 0 ? userTurns : turns;

      return selectedTurns.slice(0, 3).map((t, idx) => {
        const cleanText = t.text.includes(" / ")
          ? t.text.split(" / ")[0].trim()
          : t.text.trim();
        return {
          id: `drill-turn-${idx + 1}`,
          targetText: cleanText,
          focus: `Kelancaran berbicara & intonasi`,
          hint: `Ucapkan kalimat ini dengan percaya diri dan artikulasi jelas`,
        };
      });
    }

    return [];
  }, [drills, vocabItems, roleplay]);

  // 2. Resolve Challenge: synthesize scenario & example answer if incomplete
  const resolvedChallenge = React.useMemo(() => {
    const scenario =
      challenge?.scenario ||
      roleplay?.context ||
      "Praktikkan materi unit ini dengan berbicara secara spontan bersama Mr. Khoirul.";

    let exampleAnswer = challenge?.exampleAnswer;
    if (!exampleAnswer) {
      const turns = roleplay?.turns || [];
      const userTurns = turns.filter((t) => {
        const sp = (t.speaker || "").toLowerCase();
        return sp.includes("you") || sp.includes("student");
      });
      const targetTurn = userTurns[userTurns.length - 1] || userTurns[0] || turns[1];
      if (targetTurn?.text) {
        exampleAnswer = targetTurn.text.includes(" / ")
          ? targetTurn.text.split(" / ")[0].trim()
          : targetTurn.text.trim();
      } else if (resolvedDrills[0]?.targetText) {
        exampleAnswer = resolvedDrills[0].targetText;
      } else {
        exampleAnswer = "Yes, I understand and I can speak English with confidence.";
      }
    }

    const targetGrammar =
      challenge?.targetGrammar ||
      `Gunakan struktur kalimat dan kosakata dari ${title}`;

    return {
      scenario,
      exampleAnswer,
      targetGrammar,
    };
  }, [challenge, roleplay, resolvedDrills, title]);

  const hasDrills = resolvedDrills.length > 0;
  const [activeTab, setActiveTab] = useState<"drill" | "roleplay" | "challenge">(
    hasDrills ? "drill" : "roleplay"
  );
  const [isDrillDone, setIsDrillDone] = useState(!hasDrills);
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
    <div className="space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 sm:pb-8">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <Badge variant="primary" className="text-xs">Interactive Speaking Lab</Badge>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
        </div>

        {/* 3-Stage Progressive Tab Navigation with Locks */}
        <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs sm:text-sm font-semibold gap-1.5 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={(e) => {
              animeButtonPop(e.currentTarget);
              setActiveTab("drill");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl min-h-[42px] transition-all cursor-pointer will-change-transform shrink-0 ${
              activeTab === "drill"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {isDrillDone && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            <span>1. Pemanasan (Drill)</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              if (isDrillDone) {
                animeButtonPop(e.currentTarget);
                setActiveTab("roleplay");
              } else {
                animeShake(e.currentTarget);
              }
            }}
            title={!isDrillDone ? "Selesaikan seluruh kalimat pemanasan terlebih dahulu" : ""}
            className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl min-h-[42px] transition-all will-change-transform shrink-0 ${
              activeTab === "roleplay"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold cursor-pointer"
                : !isDrillDone
                ? "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
            }`}
          >
            {!isDrillDone ? (
              <Lock className="w-4 h-4 text-slate-400" />
            ) : isRoleplayDone ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : null}
            <span>2. Simulasi Peran</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              if (isRoleplayDone) {
                animeButtonPop(e.currentTarget);
                setActiveTab("challenge");
              } else {
                animeShake(e.currentTarget);
              }
            }}
            title={!isRoleplayDone ? "Selesaikan simulasi peran terlebih dahulu" : ""}
            className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl min-h-[42px] transition-all will-change-transform shrink-0 ${
              activeTab === "challenge"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold cursor-pointer"
                : !isRoleplayDone
                ? "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
            }`}
          >
            {!isRoleplayDone ? (
              <Lock className="w-4 h-4 text-slate-400" />
            ) : isChallengeDone ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : null}
            <span>3. Tantangan Spontan</span>
          </button>
        </div>
      </div>

      {/* --- STAGE 1: SHADOWING DRILL --- */}
      {activeTab === "drill" && (
        <SpeakingLabDrill
          drills={resolvedDrills}
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
          challenge={resolvedChallenge}
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
