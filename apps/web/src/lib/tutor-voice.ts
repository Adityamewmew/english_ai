"use client";

import { getApiUrl } from "./api-client";

let activeAudio: HTMLAudioElement | null = null;

/**
 * Text-to-Speech player for Mr. Khoirul (Roger ElevenLabs voice)
 * Prioritizes backend OmniRoute TTS; falls back to browser SpeechSynthesis only if offline/network error.
 */
export function speakTutorText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
) {
  if (typeof window === "undefined") {
    options?.onEnd?.();
    return;
  }

  stopTutorSpeech();

  const clean = text.replace(/[*_#`[\]()]/g, "").trim();
  if (!clean) {
    options?.onEnd?.();
    return;
  }

  // 1. Primary: OmniRoute ElevenLabs Roger Voice via backend TTS
  try {
    const audioUrl = getApiUrl(`/api/voice/tts?text=${encodeURIComponent(clean.slice(0, 1000))}`);
    const audio = new Audio(audioUrl);
    activeAudio = audio;

    let hasStarted = false;
    audio.onplay = () => {
      if (!hasStarted) {
        hasStarted = true;
        options?.onStart?.();
      }
    };

    audio.onended = () => {
      activeAudio = null;
      options?.onEnd?.();
    };

    audio.onerror = () => {
      activeAudio = null;
      fallbackBrowserSpeech(clean, options);
    };

    audio.play().catch(() => {
      activeAudio = null;
      fallbackBrowserSpeech(clean, options);
    });
  } catch {
    fallbackBrowserSpeech(clean, options);
  }
}

function fallbackBrowserSpeech(
  clean: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
) {
  if (!("speechSynthesis" in window)) {
    options?.onError?.();
    options?.onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "en-US";
    utterance.rate = options?.rate ?? 0.95;
    utterance.pitch = options?.pitch ?? 1.0;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice =
      voices.find(
        (v) =>
          (v.lang === "en-US" || v.lang === "en-GB") &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Daniel") ||
            v.name.includes("Roger"))
      ) || voices.find((v) => v.lang.startsWith("en"));

    if (naturalVoice) utterance.voice = naturalVoice;

    if (options?.onStart) utterance.onstart = options.onStart;
    if (options?.onEnd) utterance.onend = options.onEnd;
    if (options?.onError) utterance.onerror = options.onError;

    window.speechSynthesis.speak(utterance);
  } catch {
    options?.onError?.();
    options?.onEnd?.();
  }
}

export function stopTutorSpeech() {
  if (typeof window === "undefined") return;

  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.src = "";
    } catch {}
    activeAudio = null;
  }

  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}
