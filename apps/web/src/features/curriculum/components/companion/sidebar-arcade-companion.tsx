"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRoamingPhysics } from "./use-roaming-physics";
import { CompanionSpriteView } from "./companion-sprite-view";
import { CompanionMicroControls } from "./companion-micro-controls";
import type {
  CompanionPersona,
  CompanionState,
  CompanionExpression,
} from "./roaming-types";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { speakTutorText, stopTutorSpeech } from "@/lib/tutor-voice";
import { getApiUrl } from "@/lib/api-client";
import { playPopSound } from "@/lib/sound-fx";
import { Mic, Loader2, Volume2, RefreshCw } from "lucide-react";

export function SidebarArcadeCompanion() {
  const [persona, setPersona] = useState<CompanionPersona>("khoirul");
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [callState, setCallState] = useState<CompanionState>("roaming");
  const [expression, setExpression] = useState<CompanionExpression>("neutral");
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [tutorReply, setTutorReply] = useState<string>("");
  const conversationHistoryRef = useRef<Array<{ role: string; content: string }>>([]);
  const walkerRef = useRef<HTMLDivElement>(null);

  const { xPercent, direction, isWalking, lockAtCurrentPosition, resumeRoaming } =
    useRoamingPhysics({
      isLocked: isCallActive,
      minPercent: 14,
      maxPercent: 82,
      speed: 13.5,
      elementRef: walkerRef,
    });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Conversational AI turn taking
  const processTurn = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim()) return;

      setCallState("thinking");
      setExpression("curious");
      setLiveTranscript(userMessage);

      conversationHistoryRef.current.push({ role: "user", content: userMessage });

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch(getApiUrl("/api/voice/turn-stream"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: "Study Section Coach",
            history: conversationHistoryRef.current.slice(-4),
            studentMessage: userMessage,
          }),
          signal: controller.signal,
        });

        let fullReply = "";

        if (res.ok && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith("data: ")) {
                try {
                  const data = JSON.parse(trimmed.slice(6));
                  if (data.type === "sentence" && data.text) {
                    fullReply = data.text;
                    setTutorReply(data.text);
                  } else if (data.type === "done" && data.fullReply) {
                    fullReply = data.fullReply;
                    setTutorReply(data.fullReply);
                  }
                } catch {}
              }
            }
          }
        }

        if (!fullReply) {
          fullReply =
            persona === "khoirul"
              ? "Good effort! Let's continue working through this lesson together."
              : "Keep practicing! You are making great progress today!";
          setTutorReply(fullReply);
        }

        conversationHistoryRef.current.push({ role: "assistant", content: fullReply });

        setCallState("speaking");
        setExpression("talking");

        speakTutorText(fullReply, {
          onEnd: () => {
            setCallState("listening");
            setExpression("listening");
            setLiveTranscript("");
          },
          onError: () => {
            setCallState("listening");
            setExpression("listening");
          },
        });
      } catch (err: any) {
        if (err.name === "AbortError") return;
        const fallback = "I'm listening! Tell me more about what you learned here.";
        setTutorReply(fallback);
        setCallState("speaking");
        setExpression("talking");
        speakTutorText(fallback, {
          onEnd: () => {
            setCallState("listening");
            setExpression("listening");
          },
        });
      }
    },
    [persona]
  );

  // Voice recognition
  const { start: startListening, stop: stopListening, abort: abortListening } =
    useSpeechRecognition({
      canListen: isCallActive && !isMuted && callState === "listening",
      lang: "en-US",
      onUtteranceReady: (text) => {
        processTurn(text);
      },
    });

  const handleCharacterClick = () => {
    if (isCallActive) return;

    playPopSound();
    lockAtCurrentPosition();
    setIsCallActive(true);

    setCallState("listening");
    setExpression("listening");
    setLiveTranscript("");
    setTutorReply("");
    startListening();
  };

  const handleEndCall = () => {
    abortControllerRef.current?.abort();
    stopTutorSpeech();
    stopListening();
    abortListening();

    setIsCallActive(false);
    setCallState("roaming");
    setExpression("neutral");
    setLiveTranscript("");
    setTutorReply("");
    resumeRoaming();
  };

  const handleSwitchPersona = () => {
    setPersona((prev) => (prev === "khoirul" ? "maya" : "khoirul"));
  };

  useEffect(() => {
    return () => {
      stopTutorSpeech();
      abortListening();
      abortControllerRef.current?.abort();
    };
  }, [abortListening]);

  const isKhoirul = persona === "khoirul";
  const tutorName = isKhoirul ? "Mr. Khoirul" : "Ms. Maya";

  return (
    <div className="relative w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2.5 shadow-2xs space-y-1.5 select-none overflow-hidden">
      {/* Top Header Row with Coach switch */}
      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
            {tutorName}
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            (Interactive Companion)
          </span>
        </div>

        <button
          type="button"
          onClick={handleSwitchPersona}
          title="Ganti tutor"
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {/* Walking Runway Stage */}
      <div
        onClick={handleCharacterClick}
        className="relative w-full h-24 bg-gradient-to-b from-slate-50/60 to-slate-100/90 dark:from-slate-800/20 dark:to-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/50 cursor-pointer overflow-hidden group"
      >
        {/* Overhead Status Bar during Voice Call or Idle */}
        <div className="absolute top-1.5 inset-x-2 z-20 flex justify-center pointer-events-none">
          {!isCallActive ? (
            <div className="px-2.5 py-1 rounded-full bg-slate-900/90 text-white text-[11px] font-medium shadow-xs border border-slate-700/60 flex items-center gap-1.5 group-hover:scale-105 transition-transform">
              <Mic className="w-3 h-3 text-slate-300" />
              <span>Klik untuk berbicara</span>
            </div>
          ) : callState === "listening" ? (
            <div className="w-full px-2.5 py-1 rounded-lg bg-slate-900/95 text-slate-100 text-xs border border-slate-700 shadow-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 truncate font-medium">
                <Mic className="w-3 h-3 text-blue-400" />
                {liveTranscript ? `"${liveTranscript}"` : "Mendengarkan..."}
              </span>
            </div>
          ) : callState === "thinking" ? (
            <div className="px-2.5 py-1 rounded-lg bg-slate-900/95 text-slate-100 text-xs border border-slate-700 shadow-xs flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
              <span>Memproses respons...</span>
            </div>
          ) : (
            <div className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900/95 text-slate-100 text-xs border border-slate-700 shadow-xs">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-400 mb-0.5">
                <Volume2 className="w-3 h-3" /> Berbicara
              </div>
              <p className="line-clamp-2 leading-tight text-slate-200">
                {tutorReply || "Good to talk with you!"}
              </p>
            </div>
          )}
        </div>

        {/* Character Walker along bottom floor */}
        <div
          ref={walkerRef}
          className="absolute bottom-1 flex flex-col items-center pointer-events-auto will-change-[left]"
          style={{
            left: `${xPercent}%`,
            transform: "translateX(-50%)",
          }}
        >
          <CompanionSpriteView
            persona={persona}
            state={callState}
            expression={expression}
            direction={direction}
            isWalking={isWalking}
            onClick={handleCharacterClick}
            compact={true}
          />
        </div>

        {/* Floor line indicator */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent opacity-50" />
      </div>

      {/* Micro Controls Bar when Voice Call is active */}
      {isCallActive && (
        <div className="pt-1 flex justify-center animate-in fade-in duration-150">
          <CompanionMicroControls
            persona={persona}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted((p) => !p)}
            onEndCall={handleEndCall}
            onSwitchPersona={handleSwitchPersona}
            onSubmitText={(text) => processTurn(text)}
          />
        </div>
      )}
    </div>
  );
}
