"use client";

import { getApiUrl } from "./api-client";

let activeAudio: HTMLAudioElement | null = null;
let activeController: AbortController | null = null;
let currentSpeechId = 0;

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

  // Cancel any existing playback or in-flight network request
  stopTutorSpeech();

  const clean = text.replace(/[*_#`[\]()]/g, "").trim();
  if (!clean) {
    options?.onEnd?.();
    return;
  }

  // Increment and capture generation ID for race-condition prevention
  currentSpeechId++;
  const speechId = currentSpeechId;

  const controller = new AbortController();
  activeController = controller;

  // 1. Primary: OmniRoute ElevenLabs Roger Voice via backend TTS (POST)
  fetch(getApiUrl("/api/voice/tts"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: clean.slice(0, 1000) }),
    signal: controller.signal,
  })
    .then((res) => {
      if (speechId !== currentSpeechId) return null;
      if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);
      return res.blob();
    })
    .then((blob) => {
      if (!blob || speechId !== currentSpeechId) return;

      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      activeAudio = audio;

      let hasStarted = false;
      audio.onplay = () => {
        if (speechId !== currentSpeechId) {
          audio.pause();
          audio.src = "";
          return;
        }
        if (!hasStarted) {
          hasStarted = true;
          options?.onStart?.();
        }
      };

      audio.onended = () => {
        if (activeAudio === audio) activeAudio = null;
        URL.revokeObjectURL(audioUrl);
        if (speechId === currentSpeechId) {
          options?.onEnd?.();
        }
      };

      audio.onerror = () => {
        if (activeAudio === audio) activeAudio = null;
        URL.revokeObjectURL(audioUrl);
        if (speechId === currentSpeechId) {
          fallbackBrowserSpeech(clean, speechId, options);
        }
      };

      if (speechId !== currentSpeechId) {
        URL.revokeObjectURL(audioUrl);
        return;
      }

      audio.play().catch(() => {
        if (activeAudio === audio) activeAudio = null;
        URL.revokeObjectURL(audioUrl);
        if (speechId === currentSpeechId) {
          fallbackBrowserSpeech(clean, speechId, options);
        }
      });
    })
    .catch((err) => {
      // Aborted or cancelled by user navigation - clean exit with silence
      if (err?.name === "AbortError" || speechId !== currentSpeechId) {
        return;
      }
      fallbackBrowserSpeech(clean, speechId, options);
    });
}

function fallbackBrowserSpeech(
  clean: string,
  speechId: number,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
) {
  if (typeof window === "undefined" || speechId !== currentSpeechId) {
    return;
  }

  if (!("speechSynthesis" in window)) {
    options?.onError?.();
    options?.onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    if (speechId !== currentSpeechId) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "en-US";
    utterance.rate = options?.rate ?? 0.95;
    utterance.pitch = options?.pitch ?? 1.0;

    const voices = window.speechSynthesis.getVoices();
    const maleVoice =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          /\b(male|david|daniel|guy|george|roger|mark|ryan|oliver|andrew)\b/i.test(v.name)
      ) ||
      voices.find(
        (v) =>
          (v.lang === "en-US" || v.lang === "en-GB") &&
          !/\b(female|zira|samantha|karen|victoria|hazel|susan|google\s+us\s+english)\b/i.test(v.name)
      ) ||
      voices.find((v) => v.lang.startsWith("en"));

    if (maleVoice) utterance.voice = maleVoice;

    utterance.onstart = () => {
      if (speechId !== currentSpeechId) {
        window.speechSynthesis.cancel();
        return;
      }
      options?.onStart?.();
    };

    utterance.onend = () => {
      if (speechId === currentSpeechId) {
        options?.onEnd?.();
      }
    };

    utterance.onerror = () => {
      if (speechId === currentSpeechId) {
        options?.onError?.();
      }
    };

    window.speechSynthesis.speak(utterance);
  } catch {
    options?.onError?.();
    options?.onEnd?.();
  }
}

export function stopTutorSpeech() {
  if (typeof window === "undefined") return;

  // Invalidate any active or in-flight speech generation
  currentSpeechId++;

  // Abort pending fetch request immediately
  if (activeController) {
    try {
      activeController.abort();
    } catch {}
    activeController = null;
  }

  // Instantly cut off audio playback
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.src = "";
    } catch {}
    activeAudio = null;
  }

  // Cancel native speech synthesis
  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

// Auto-cleanup speech on page navigation or tab unload
if (typeof window !== "undefined") {
  window.addEventListener("popstate", stopTutorSpeech);
  window.addEventListener("pagehide", stopTutorSpeech);
  window.addEventListener("beforeunload", stopTutorSpeech);
}
