"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRoamingPhysics } from "./use-roaming-physics";
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
import { Mic, Loader2 } from "lucide-react";

export function SidebarArcadeCompanion() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [rect, setRect] = useState<{ left: number; width: number } | null>(null);

  const [persona] = useState<CompanionPersona>("khoirul");
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [callState, setCallState] = useState<CompanionState>("roaming");
  const [expression, setExpression] = useState<CompanionExpression>("neutral");

  // 5 detik muncul, 5 detik hilang cycle
  const [isBubbleVisible, setIsBubbleVisible] = useState<boolean>(true);

  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [tutorReply, setTutorReply] = useState<string>("");
  const conversationHistoryRef = useRef<Array<{ role: string; content: string }>>([]);
  const walkerRef = useRef<HTMLDivElement>(null);

  // Measure parent sidebar column position in real-time
  const updateRect = useCallback(() => {
    if (anchorRef.current) {
      const parent = anchorRef.current.parentElement;
      if (parent) {
        const r = parent.getBoundingClientRect();
        setRect({ left: Math.round(r.left), width: Math.round(r.width) });
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    updateRect();

    const parent = anchorRef.current?.parentElement;
    let observer: ResizeObserver | null = null;
    if (parent && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updateRect);
      observer.observe(parent);
      if (document.body) observer.observe(document.body);
    }

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, { passive: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [updateRect]);

  // Smooth unconfined roaming physics across the open sidebar floor
  // Roaming bounds 20% to 80% so speech bubble always stays within sidebar
  const { xPercent, direction, isWalking, lockAtCurrentPosition, resumeRoaming } =
    useRoamingPhysics({
      isLocked: isCallActive,
      minPercent: 20,
      maxPercent: 80,
      speed: 13,
      elementRef: walkerRef,
    });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Cycle bubble: 5 detik muncul, 5 detik hilang saat roaming
  useEffect(() => {
    if (isCallActive) return;

    const interval = setInterval(() => {
      setIsBubbleVisible((prev) => !prev);
    }, 5000);

    return () => clearInterval(interval);
  }, [isCallActive]);

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
        const fallback = "I'm listening! Tell me what you're practicing right now.";
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
      canListen: isCallActive && callState === "listening",
      lang: "en-US",
      onUtteranceReady: (text) => {
        processTurn(text);
      },
    });

  const handleCharacterClick = () => {
    playPopSound();

    if (!isCallActive) {
      lockAtCurrentPosition();
      setIsCallActive(true);
      setCallState("listening");
      setExpression("listening");
      setLiveTranscript("");
      setTutorReply("");
      startListening();
    }
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

  useEffect(() => {
    return () => {
      stopTutorSpeech();
      abortListening();
      abortControllerRef.current?.abort();
    };
  }, [abortListening]);

  const tutorName = persona === "khoirul" ? "Mr. Khoirul" : "Ms. Maya";

  const companionFixedStyle: React.CSSProperties = {
    position: "fixed",
    bottom: 0,
    left: rect ? `${rect.left}px` : undefined,
    right: rect ? undefined : "1.5rem",
    width: rect ? `${rect.width}px` : "280px",
    height: "92px",
    zIndex: 40,
    pointerEvents: "none",
  };

  const companionContent = (
    <div
      style={companionFixedStyle}
      className="hidden lg:flex select-none overflow-visible flex-col justify-end"
    >
      {/* Character Walker: moves across bottom edge, with comic speech bubble directly attached above */}
      <div
        ref={walkerRef}
        className="absolute bottom-0 flex flex-col items-center will-change-[left]"
        style={{
          left: `${xPercent}%`,
          transform: "translateX(-50%)",
        }}
      >
        {/* Comic Speech Bubble (Style Gambar 2): Otomatis 100% mengikuti gerakan karakter */}
        <div
          className={`absolute bottom-[80px] flex flex-col items-center transition-all duration-300 ease-out z-50 ${
            isCallActive || isBubbleVisible
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-90 pointer-events-none"
          }`}
        >
          {!isCallActive ? (
            /* Comic Speech Box (Gambar 2): 5 detik muncul, 5 detik hilang */
            <div
              onClick={handleCharacterClick}
              className="relative px-3.5 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-900 dark:border-slate-100 rounded-2xl shadow-[2px_2.5px_0px_rgba(0,0,0,0.9)] dark:shadow-[2px_2.5px_0px_rgba(255,255,255,0.85)] cursor-pointer hover:scale-105 active:scale-95 transition-transform select-none"
              title="Tap to chat"
            >
              {/* Comic Sketch Accents (from Gambar 2) */}
              <span className="absolute -top-1 left-4 w-5 h-[1.5px] bg-slate-900 dark:bg-slate-100 rounded-full opacity-70 pointer-events-none" />
              <span className="absolute -right-1 top-2 w-[1.5px] h-3 bg-slate-900 dark:bg-slate-100 rounded-full opacity-70 pointer-events-none" />
              <span className="absolute -left-1 top-2 w-[1.5px] h-3 bg-slate-900 dark:bg-slate-100 rounded-full opacity-70 pointer-events-none" />

              {/* Bubble Text */}
              <span className="text-[11px] font-black tracking-tight leading-none whitespace-nowrap block">
                tap to chat
              </span>

              {/* Comic Speech Tail pointing directly down towards Mr. Khoirul */}
              <svg
                className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-4 h-3.5 overflow-visible pointer-events-none"
                viewBox="0 0 16 14"
                fill="none"
              >
                {/* White background interior to cleanly break into bottom border */}
                <path
                  d="M 1 0 C 2 4, 3 8, 0 12 C 5 8, 9 4, 13 0 Z"
                  className="fill-white dark:fill-slate-900"
                />
                {/* Comic border stroke */}
                <path
                  d="M 1 0 C 2 4, 3 8, 0 12 C 5 8, 9 4, 13 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-slate-900 dark:text-slate-100"
                />
              </svg>
            </div>
          ) : callState === "listening" ? (
            /* Active Listening Comic Bubble */
            <div className="relative px-3.5 py-1.5 bg-[#0D3B66] text-white border-2 border-slate-900 dark:border-white rounded-2xl shadow-[2px_2.5px_0px_rgba(0,0,0,0.9)] flex items-center gap-2 whitespace-nowrap">
              <Mic className="w-3.5 h-3.5 text-[#F4B41A] animate-pulse" />
              <span className="text-[11px] font-extrabold tracking-tight">
                {liveTranscript ? `"${liveTranscript}"` : "Listening..."}
              </span>

              <svg
                className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-4 h-3.5 overflow-visible pointer-events-none"
                viewBox="0 0 16 14"
                fill="none"
              >
                <path d="M 1 0 C 2 4, 3 8, 0 12 C 5 8, 9 4, 13 0 Z" fill="#0D3B66" />
                <path
                  d="M 1 0 C 2 4, 3 8, 0 12 C 5 8, 9 4, 13 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-slate-900 dark:text-white"
                />
              </svg>
            </div>
          ) : callState === "thinking" ? (
            /* Thinking Comic Bubble */
            <div className="relative px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-900 dark:border-white rounded-2xl shadow-[2px_2.5px_0px_rgba(0,0,0,0.9)] flex items-center gap-2 whitespace-nowrap">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-[11px] font-bold">Thinking...</span>

              <svg
                className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-4 h-3.5 overflow-visible pointer-events-none"
                viewBox="0 0 16 14"
                fill="none"
              >
                <path
                  d="M 1 0 C 2 4, 3 8, 0 12 C 5 8, 9 4, 13 0 Z"
                  className="fill-white dark:fill-slate-900"
                />
                <path
                  d="M 1 0 C 2 4, 3 8, 0 12 C 5 8, 9 4, 13 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-slate-900 dark:text-white"
                />
              </svg>
            </div>
          ) : (
            /* Speaking Comic Dialogue Box */
            <div className="relative p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-900 dark:border-white rounded-2xl shadow-[2px_3px_0px_rgba(0,0,0,0.9)] min-w-[170px] max-w-[230px] leading-tight">
              <div className="flex items-center justify-between gap-1 mb-1 border-b border-slate-200 dark:border-slate-700 pb-1">
                <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                  {tutorName}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEndCall();
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-1 rounded cursor-pointer font-black"
                  title="Close & resume walking"
                >
                  ✕
                </button>
              </div>
              <p className="line-clamp-2 text-xs font-semibold">{tutorReply}</p>

              <svg
                className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-4 h-3.5 overflow-visible pointer-events-none"
                viewBox="0 0 16 14"
                fill="none"
              >
                <path
                  d="M 1 0 C 2 4, 3 8, 0 12 C 5 8, 9 4, 13 0 Z"
                  className="fill-white dark:fill-slate-900"
                />
                <path
                  d="M 1 0 C 2 4, 3 8, 0 12 C 5 8, 9 4, 13 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-slate-900 dark:text-white"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Sprite View */}
        <div className="pointer-events-auto">
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
      </div>

      {/* Subtle floor runway line resting on the Windows taskbar boundary */}
      <div className="absolute bottom-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-[#0D3B66]/30 dark:via-blue-400/30 to-transparent pointer-events-none" />

      {/* Minimal exit button when voice call is active */}
      {isCallActive && (
        <div className="absolute top-0 right-2 z-50 pointer-events-auto animate-in fade-in duration-150">
          <button
            type="button"
            onClick={handleEndCall}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-white/95 dark:bg-slate-800/95 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
            title="Resume walking"
          >
            <span>✕ Resume Walking</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Anchor slot inside aside to measure real-time column position */}
      <div ref={anchorRef} className="w-full h-0 pointer-events-none" />

      {/* Fixed Companion rendered directly to body so it never sinks below window */}
      {mounted && createPortal(companionContent, document.body)}
    </>
  );
}
