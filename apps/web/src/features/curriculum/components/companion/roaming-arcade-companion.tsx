"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRoamingPhysics } from "./use-roaming-physics";
import { CompanionOverheadBar } from "./companion-overhead-bar";
import { CompanionMicroControls } from "./companion-micro-controls";
import { CompanionSpriteView } from "./companion-sprite-view";
import type {
  CompanionPersona,
  CompanionState,
  CompanionExpression,
} from "./roaming-types";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { speakTutorText, stopTutorSpeech } from "@/lib/tutor-voice";
import { getApiUrl } from "@/lib/api-client";
import { playPopSound } from "@/lib/sound-fx";
import { ChevronDown, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

export function RoamingArcadeCompanion() {
  const pathname = usePathname();
  const [persona, setPersona] = useState<CompanionPersona>("khoirul");
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [callState, setCallState] = useState<CompanionState>("roaming");
  const [expression, setExpression] = useState<CompanionExpression>("neutral");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [tutorReply, setTutorReply] = useState<string>("");
  const conversationHistoryRef = useRef<Array<{ role: string; content: string }>>([]);

  const { xPercent, direction, isWalking, lockAtCurrentPosition, resumeRoaming } =
    useRoamingPhysics({
      isLocked: isCallActive,
    });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Send student message and fetch reply
  const processTurn = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim()) return;

      setCallState("thinking");
      setExpression("curious");
      setLiveTranscript(userMessage);

      // Record in history
      conversationHistoryRef.current.push({ role: "user", content: userMessage });

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch(getApiUrl("/api/voice/turn-stream"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: "Everyday Conversational Practice",
            history: conversationHistoryRef.current.slice(-6),
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

        // Fallback reply if empty
        if (!fullReply) {
          fullReply =
            persona === "khoirul"
              ? "That sounds great! Keep going, how do you feel about practicing more English today?"
              : "Wonderful pronunciation! Tell me more about what you did earlier today!";
          setTutorReply(fullReply);
        }

        conversationHistoryRef.current.push({ role: "assistant", content: fullReply });

        // Speak response out loud
        setCallState("speaking");
        setExpression("talking");

        speakTutorText(fullReply, {
          onEnd: () => {
            // Once done speaking, immediately return to listening
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
        const fallback = "I hear you! What would you like to explore next?";
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

  // Speech Recognition hook
  const { start: startListening, stop: stopListening, abort: abortListening } =
    useSpeechRecognition({
      canListen: isCallActive && !isMuted && callState === "listening",
      lang: "en-US",
      onUtteranceReady: (text) => {
        processTurn(text);
      },
    });

  // Handle character click to engage voice call
  const handleCharacterClick = () => {
    if (isCallActive) return;

    playPopSound();
    lockAtCurrentPosition();
    setIsCallActive(true);

    // Directly enter listening mode as requested
    setCallState("listening");
    setExpression("listening");
    setLiveTranscript("");
    setTutorReply("");
    startListening();
  };

  // End voice call and resume wandering
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

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleSwitchPersona = () => {
    setPersona((prev) => (prev === "khoirul" ? "maya" : "khoirul"));
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTutorSpeech();
      abortListening();
      abortControllerRef.current?.abort();
    };
  }, [abortListening]);

  // On module study pages, companion is hosted directly inside sidebar
  if (pathname?.includes("/modules/")) {
    return null;
  }

  // If minimized, display dock button in bottom right
  if (isMinimized) {
    return (
      <aside aria-label="Arcade Tutor Dock" className="fixed bottom-4 right-4 z-50 pointer-events-auto">
        <button
          onClick={() => {
            playPopSound();
            setIsMinimized(false);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/95 text-white border-2 border-amber-400 shadow-xl hover:scale-105 transition-all font-mono text-xs"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>🕹️ Summon {persona === "khoirul" ? "Mr. Khoirul" : "Ms. Maya"}</span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Arcade Tutor Companion"
      className="fixed bottom-3 left-0 right-0 pointer-events-none z-50 select-none"
    >
      {/* Roaming Position Anchor */}
      <div
        className="absolute bottom-0 transition-[left] duration-150 ease-linear flex flex-col items-center"
        style={{
          left: `${xPercent}%`,
          transform: "translateX(-50%)",
        }}
      >
        {/* Overhead Dialogue & Thought Bar */}
        <div className="mb-2">
          <CompanionOverheadBar
            state={callState}
            persona={persona}
            liveTranscript={liveTranscript}
            tutorReply={tutorReply}
            onCharacterClick={handleCharacterClick}
          />
        </div>

        {/* Character Sprite & Stage */}
        <div className="relative">
          <CompanionSpriteView
            persona={persona}
            state={callState}
            expression={expression}
            direction={direction}
            isWalking={isWalking}
            onClick={handleCharacterClick}
          />

          {/* Minimize Button Pill */}
          {!isCallActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                playPopSound();
                setIsMinimized(true);
              }}
              title="Minimize companion"
              className="absolute -top-1 -right-2 pointer-events-auto p-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 text-[10px] opacity-60 hover:opacity-100 transition-opacity"
            >
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* Micro Controls Bar during Active Voice Call */}
        {isCallActive && (
          <div className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CompanionMicroControls
              persona={persona}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onEndCall={handleEndCall}
              onSwitchPersona={handleSwitchPersona}
              onSubmitText={(text) => processTurn(text)}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
