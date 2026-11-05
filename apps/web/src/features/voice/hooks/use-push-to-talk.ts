"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type TalkMode = "auto" | "ptt";

interface UsePushToTalkProps {
  callStatus: "idle" | "connecting" | "active" | "evaluating" | "ended";
  isMuted: boolean;
  onTalkStart: () => void;
  onTalkEnd: () => void;
}

export function usePushToTalk({
  callStatus,
  isMuted,
  onTalkStart,
  onTalkEnd,
}: UsePushToTalkProps) {
  const [talkMode, setTalkMode] = useState<TalkMode>("ptt");
  const [isPressing, setIsPressing] = useState(false);

  const isPressingRef = useRef(false);
  const onTalkStartRef = useRef(onTalkStart);
  const onTalkEndRef = useRef(onTalkEnd);

  useEffect(() => {
    onTalkStartRef.current = onTalkStart;
  }, [onTalkStart]);

  useEffect(() => {
    onTalkEndRef.current = onTalkEnd;
  }, [onTalkEnd]);

  const startTalk = useCallback(() => {
    if (callStatus !== "active" || isMuted || isPressingRef.current) return;
    isPressingRef.current = true;
    setIsPressing(true);
    onTalkStartRef.current();
  }, [callStatus, isMuted]);

  const endTalk = useCallback(() => {
    if (!isPressingRef.current) return;
    isPressingRef.current = false;
    onTalkEndRef.current();
    // Allow small grace window for browser speech recognition to capture trailing word before cutting mic
    setTimeout(() => {
      setIsPressing(false);
    }, 150);
  }, []);

  // Keyboard Spacebar listener for desktop PTT
  useEffect(() => {
    if (talkMode !== "ptt" || callStatus !== "active") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      e.preventDefault();
      startTalk();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      endTalk();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [talkMode, callStatus, startTalk, endTalk]);

  return {
    talkMode,
    setTalkMode,
    isPressing,
    startTalk,
    endTalk,
  };
}

