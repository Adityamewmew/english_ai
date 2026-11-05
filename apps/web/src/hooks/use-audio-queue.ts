"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { getApiUrl } from "@/lib/api-client";

export interface QueuedSentence {
  index: number;
  text: string;
  bufferPromise: Promise<AudioBuffer | null>;
}

interface UseAudioQueueProps {
  onSentenceStart?: (text: string) => void;
  onAllEnded?: () => void;
}

export function useAudioQueue({ onSentenceStart, onAllEnded }: UseAudioQueueProps = {}) {
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioQueueRef = useRef<QueuedSentence[]>([]);
  const isPlayingQueueRef = useRef<boolean>(false);
  const isStreamActiveRef = useRef<boolean>(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isHaltedRef = useRef<boolean>(false);

  const onSentenceStartRef = useRef(onSentenceStart);
  const onAllEndedRef = useRef(onAllEnded);

  useEffect(() => {
    onSentenceStartRef.current = onSentenceStart;
  }, [onSentenceStart]);

  useEffect(() => {
    onAllEndedRef.current = onAllEnded;
  }, [onAllEnded]);

  // Persistent AudioContext accessor (singleton per hook lifecycle)
  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    return audioCtxRef.current;
  }, []);

  const halt = useCallback(() => {
    isHaltedRef.current = true;
    isStreamActiveRef.current = false;
    isPlayingQueueRef.current = false;
    setIsPlaying(false);

    audioQueueRef.current = [];

    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop(0);
        currentSourceRef.current.disconnect();
      } catch {}
      currentSourceRef.current = null;
    }
  }, []);

  // Wakes up hardware audio pipeline and satisfies mobile Safari/Chrome autoplay policy
  const unlockAudio = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch {}
  }, [getAudioContext]);

  const playNextInQueue = useCallback(async () => {
    if (isHaltedRef.current) return;

    if (audioQueueRef.current.length === 0) {
      if (isStreamActiveRef.current) {
        // Still waiting for upcoming sentences from SSE stream
        isPlayingQueueRef.current = false;
        return;
      }

      // All sentences finished
      isPlayingQueueRef.current = false;
      setIsPlaying(false);
      currentSourceRef.current = null;
      onAllEndedRef.current?.();
      return;
    }

    isPlayingQueueRef.current = true;

    const nextItem = audioQueueRef.current.shift()!;
    setCurrentSubtitle(nextItem.text);

    // Wait until audio buffer is ready from TTS
    const audioBuffer = await nextItem.bufferPromise;

    if (isHaltedRef.current) return;

    if (!audioBuffer) {
      // If TTS buffer failed, brief reading pause so subtitle is visible, then advance
      setTimeout(() => {
        if (!isHaltedRef.current) playNextInQueue();
      }, 700);
      return;
    }

    const ctx = getAudioContext();
    if (!ctx || ctx.state === "closed") {
      if (!isHaltedRef.current) playNextInQueue();
      return;
    }

    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {}
    }

    try {
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      currentSourceRef.current = source;

      // Accurately switch to speaking state when sound actually emits
      setIsPlaying(true);
      onSentenceStartRef.current?.(nextItem.text);

      source.onended = () => {
        if (currentSourceRef.current === source) {
          currentSourceRef.current = null;
        }
        if (isHaltedRef.current) return;
        playNextInQueue();
      };

      source.start(0);
    } catch (err: any) {
      if (err.name === "AbortError" || isHaltedRef.current) return;
      console.warn("Audio buffer playback error, skipping sentence cleanly:", err);
      if (!isHaltedRef.current) playNextInQueue();
    }
  }, [getAudioContext]);

  const enqueueSentence = useCallback(
    (sentence: string, index: number) => {
      if (isHaltedRef.current) return;

      const fetchWithRetry = async (attempt = 1): Promise<AudioBuffer | null> => {
        try {
          const res = await fetch(getApiUrl("/api/voice/tts"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ text: sentence }),
          });

          if (!res.ok) {
            if (attempt < 2 && !isHaltedRef.current) {
              await new Promise((r) => setTimeout(r, 250));
              return fetchWithRetry(attempt + 1);
            }
            throw new Error(`TTS POST error ${res.status}`);
          }

          const arrayBuffer = await res.arrayBuffer();
          if (isHaltedRef.current) return null;

          const ctx = getAudioContext();
          if (!ctx) return null;

          // Safe slice prevents buffer detachment issues in strict WebKit engines
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
          return audioBuffer;
        } catch (err) {
          if (attempt < 2 && !isHaltedRef.current) {
            await new Promise((r) => setTimeout(r, 250));
            return fetchWithRetry(attempt + 1);
          }
          console.warn("TTS fetch/decode error for sentence:", sentence, err);
          return null;
        }
      };

      const bufferPromise = fetchWithRetry();

      audioQueueRef.current.push({
        index,
        text: sentence,
        bufferPromise,
      });
      audioQueueRef.current.sort((a, b) => a.index - b.index);

      if (!isPlayingQueueRef.current) {
        playNextInQueue();
      }
    },
    [getAudioContext, playNextInQueue]
  );

  const resetForNewTurn = useCallback(() => {
    isHaltedRef.current = false;
    isStreamActiveRef.current = true;
  }, []);

  const markStreamDone = useCallback(() => {
    isStreamActiveRef.current = false;
    if (!isPlayingQueueRef.current) {
      playNextInQueue();
    }
  }, [playNextInQueue]);

  // Enqueue speech text cleanly as a unified sentence to avoid queue congestion
  const speakText = useCallback(
    (text: string) => {
      halt();
      isHaltedRef.current = false;
      const clean = text.trim();
      if (!clean) {
        onAllEndedRef.current?.();
        return;
      }

      isStreamActiveRef.current = false;
      enqueueSentence(clean, 0);
    },
    [halt, enqueueSentence]
  );

  // Resource cleanup on unmount
  useEffect(() => {
    return () => {
      halt();
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try {
          audioCtxRef.current.close().catch(() => {});
        } catch {}
        audioCtxRef.current = null;
      }
    };
  }, [halt]);

  return {
    currentSubtitle,
    setCurrentSubtitle,
    isPlaying,
    enqueueSentence,
    speakText,
    halt,
    unlockAudio,
    resetForNewTurn,
    markStreamDone,
  };
}
