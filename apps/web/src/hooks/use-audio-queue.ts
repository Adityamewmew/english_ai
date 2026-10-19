"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { getApiUrl } from "@/lib/api-client";

export interface QueuedSentence {
  index: number;
  text: string;
  audioPromise: Promise<HTMLAudioElement | null>;
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
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isHaltedRef = useRef<boolean>(false);

  const onSentenceStartRef = useRef(onSentenceStart);
  const onAllEndedRef = useRef(onAllEnded);

  useEffect(() => {
    onSentenceStartRef.current = onSentenceStart;
  }, [onSentenceStart]);

  useEffect(() => {
    onAllEndedRef.current = onAllEnded;
  }, [onAllEnded]);

  const halt = useCallback(() => {
    isHaltedRef.current = true;
    isStreamActiveRef.current = false;
    isPlayingQueueRef.current = false;
    setIsPlaying(false);

    audioQueueRef.current = [];

    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current.src = "";
      } catch {}
      currentAudioRef.current = null;
    }
  }, []);

  const unlockAudio = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }
      }
      const silentAudio = new Audio();
      silentAudio.src =
        "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      silentAudio.volume = 0.01;
      silentAudio.play().catch(() => {});
    } catch {}
  }, []);

  const playNextInQueue = useCallback(async () => {
    if (isHaltedRef.current) return;

    if (audioQueueRef.current.length === 0) {
      if (isStreamActiveRef.current) {
        // Still generating future sentences in SSE stream
        isPlayingQueueRef.current = false;
        return;
      }

      // All sentences finished
      isPlayingQueueRef.current = false;
      setIsPlaying(false);
      currentAudioRef.current = null;
      onAllEndedRef.current?.();
      return;
    }

    isPlayingQueueRef.current = true;
    setIsPlaying(true);

    const nextItem = audioQueueRef.current.shift()!;
    setCurrentSubtitle(nextItem.text);
    onSentenceStartRef.current?.(nextItem.text);

    // Wait until audio blob is ready from OmniRoute TTS
    const audio = await nextItem.audioPromise;

    if (isHaltedRef.current) return;

    if (!audio) {
      // If network fetch failed, proceed to next chunk without breaking queue
      playNextInQueue();
      return;
    }

    currentAudioRef.current = audio;

    audio.onended = () => {
      if (isHaltedRef.current) return;
      playNextInQueue();
    };

    audio.onerror = () => {
      if (isHaltedRef.current) return;
      playNextInQueue();
    };

    try {
      await audio.play();
    } catch (err: any) {
      if (err.name === "AbortError" || isHaltedRef.current) return;
      console.warn("Audio play error, skipping chunk:", err);
      if (!isHaltedRef.current) playNextInQueue();
    }
  }, []);

  const enqueueSentence = useCallback(
    (sentence: string, index: number) => {
      if (isHaltedRef.current) return;

      const audioPromise = fetch(getApiUrl("/api/voice/tts"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sentence }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("TTS POST error");
          return res.blob();
        })
        .then((blob) => {
          if (isHaltedRef.current) return null;
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.preload = "auto";
          return audio;
        })
        .catch((err) => {
          console.warn("TTS fetch error for sentence:", sentence, err);
          return null;
        });

      audioQueueRef.current.push({
        index,
        text: sentence,
        audioPromise,
      });
      audioQueueRef.current.sort((a, b) => a.index - b.index);

      if (!isPlayingQueueRef.current) {
        playNextInQueue();
      }
    },
    [playNextInQueue]
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

  // Chunk static text into sentences and enqueue sequentially
  const speakText = useCallback(
    (text: string) => {
      halt();
      isHaltedRef.current = false;

      const sentenceMatches = text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g);
      const sentences = sentenceMatches
        ? sentenceMatches.map((s) => s.trim()).filter(Boolean)
        : [text];

      if (sentences.length === 0 || !text.trim()) {
        onAllEndedRef.current?.();
        return;
      }

      isStreamActiveRef.current = false;
      for (let i = 0; i < sentences.length; i++) {
        enqueueSentence(sentences[i], i);
      }
    },
    [halt, enqueueSentence]
  );

  useEffect(() => {
    return () => {
      halt();
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
