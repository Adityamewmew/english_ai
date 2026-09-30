"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
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
}

export function SectionSpeakingLab({
  title,
  drills = [],
  roleplay = { context: "", roles: [], turns: [] },
  challenge = { scenario: "" },
  moduleId,
  userId,
  onPlayAudio,
}: SectionSpeakingLabProps) {
  const [activeTab, setActiveTab] = useState<"drill" | "roleplay" | "challenge">("drill");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const startListening = (onResult: (text: string) => void, onEnd: () => void) => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Browser Anda belum mendukung speech recognition mikrofon.");
      onEnd();
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        onResult(text);
      };

      recognition.onerror = () => onEnd();
      recognition.onend = () => onEnd();

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      onEnd();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
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

        {/* 3-Stage Tab Navigation */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("drill")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "drill"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            1. Pemanasan (Drill)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("roleplay")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "roleplay"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            2. Simulasi Peran
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("challenge")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "challenge"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            3. Tantangan Spontan
          </button>
        </div>
      </div>

      {/* --- STAGE 1: SHADOWING DRILL --- */}
      {activeTab === "drill" && (
        <SpeakingLabDrill
          drills={drills}
          moduleId={moduleId}
          userId={userId}
          onPlayAudio={onPlayAudio}
          startListening={startListening}
          stopListening={stopListening}
        />
      )}

      {/* --- STAGE 2: INTERACTIVE ROLEPLAY --- */}
      {activeTab === "roleplay" && (
        <SpeakingLabRoleplay
          roleplay={roleplay}
          moduleId={moduleId}
          userId={userId}
          onPlayAudio={onPlayAudio}
          startListening={startListening}
          stopListening={stopListening}
        />
      )}

      {/* --- STAGE 3: SPONTANEOUS CHALLENGE --- */}
      {activeTab === "challenge" && (
        <SpeakingLabChallenge
          challenge={challenge}
          moduleId={moduleId}
          userId={userId}
          onPlayAudio={onPlayAudio}
          startListening={startListening}
          stopListening={stopListening}
        />
      )}
    </div>
  );
}
