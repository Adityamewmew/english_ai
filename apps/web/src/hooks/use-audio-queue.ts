"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { getApiUrl } from "@/lib/api-client";

export interface QueuedSentence {
  index: number;
  text: string;
  audio: HTMLAudioElement;
}

interface UseAudioQueueProps {
  onSentenceStart?: (text: string) => void;
  onAllEnded?: () => void;
}

function playBrowserSpeechSynthesis(text: string, onEnd: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const enVoice =
      voices.find((v) => v.lang.startsWith("en-US") && !v.localService) ||
      voices.find((v) => v.lang.startsWith("en-US")) ||
      voices.find((v) => v.lang.startsWith("en"));
    if (enVoice) utterance.voice = enVoice;

    let hasEnded = false;
    const fallbackTimer = setTimeout(() => {
      finish();
    }, 4500);

    const finish = () => {
      if (!hasEnded) {
        hasEnded = true;
        clearTimeout(fallbackTimer);
        onEnd();
      }
    };

    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
  } catch {
    onEnd();
  }
}

export function useAudioQueue({ onSentenceStart, onAllEnded }: UseAudioQueueProps = {}) {
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioQueueRef = useRef<QueuedSentence[]>([]);
  const isPlayingQueueRef = useRef<boolean>(false);
  const isStreamActiveRef = useRef<boolean>(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsWatchdogRef = useRef<any>(null);
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

    if (ttsWatchdogRef.current) {
      clearTimeout(ttsWatchdogRef.current);
      ttsWatchdogRef.current = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    for (const item of audioQueueRef.current) {
      try {
        item.audio.pause();
        item.audio.src = "";
      } catch {}
    }
    audioQueueRef.current = [];

    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current.src = "";
        currentAudioRef.current = null;
      } catch {}
    }
  }, []);

  const unlockAudio = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const silentAudio = new Audio();
      silentAudio.src =
        "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      silentAudio.volume = 0.01;
      silentAudio.play().catch(() => {});
    } catch {}
  }, []);

  const playNextInQueue = useCallback(() => {
    if (isHaltedRef.current) return;

    if (audioQueueRef.current.length === 0) {
      if (isStreamActiveRef.current) {
        // Stream is still generating future sentences
        isPlayingQueueRef.current = false;
        return;
      }

      // All sentences finished playing
      isPlayingQueueRef.current = false;
      setIsPlaying(false);
      currentAudioRef.current = null;
      if (ttsWatchdogRef.current) {
        clearTimeout(ttsWatchdogRef.current);
        ttsWatchdogRef.current = null;
      }
      onAllEndedRef.current?.();
      return;
    }

    const nextItem = audioQueueRef.current.shift()!;
    isPlayingQueueRef.current = true;
    setIsPlaying(true);
    currentAudioRef.current = nextItem.audio;

    // Zero-gap playback: aggressively preload next upcoming sentence
    if (audioQueueRef.current.length > 0) {
      const upcoming = audioQueueRef.current[0].audio;
      upcoming.preload = "auto";
      try {
        upcoming.load();
      } catch {}
    }

    setCurrentSubtitle(nextItem.text);
    onSentenceStartRef.current?.(nextItem.text);

    // Watchdog per sentence chunk (max 12s, min 4s)
    if (ttsWatchdogRef.current) clearTimeout(ttsWatchdogRef.current);
    const wordCount = nextItem.text.split(/\s+/).filter(Boolean).length;
    const maxWaitMs = Math.min(12000, Math.max(4000, Math.round((wordCount / 2) * 1000) + 3000));

    ttsWatchdogRef.current = setTimeout(() => {
      if (isHaltedRef.current) return;
      console.warn("TTS chunk playback watchdog timeout, skipping to next chunk");
      if (currentAudioRef.current) {
        try {
          currentAudioRef.current.pause();
          currentAudioRef.current.src = "";
          currentAudioRef.current = null;
        } catch {}
      }
      playNextInQueue();
    }, maxWaitMs);

    nextItem.audio.onended = () => {
      if (isHaltedRef.current) return;
      playNextInQueue();
    };

    nextItem.audio.onerror = (e) => {
      console.warn("Audio queue chunk error, falling back to browser SpeechSynthesis for this turn:", e);
      if (isHaltedRef.current) return;
      playBrowserSpeechSynthesis(nextItem.text, () => {
        if (!isHaltedRef.current) playNextInQueue();
      });
    };

    nextItem.audio.play().catch((err) => {
      if (err.name === "AbortError" || isHaltedRef.current) return;
      console.warn("Audio play() interrupted, falling back for this sentence:", err);
      playBrowserSpeechSynthesis(nextItem.text, () => {
        if (!isHaltedRef.current) playNextInQueue();
      });
    });
  }, []);

  const enqueueSentence = useCallback(
    (sentence: string, index: number) => {
      if (isHaltedRef.current) return;

      const audioUrl = getApiUrl(`/api/voice/tts?text=${encodeURIComponent(sentence)}`);
      const audio = new Audio();
      audio.preload = "auto";
      audio.src = audioUrl;

      audioQueueRef.current.push({
        index,
        text: sentence,
        audio,
      });

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

  // Fallback: chunk any static string into sentences and play
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
