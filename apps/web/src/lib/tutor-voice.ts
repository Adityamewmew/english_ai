"use client";

// Web Speech API wrapper for Mr. Khoirul AI Tutor
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
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options?.onEnd?.();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Clean text from markdown or special chars
  const clean = text.replace(/[*_#`[\]()]/g, "").trim();
  if (!clean) {
    options?.onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = "en-US";
  utterance.rate = options?.rate ?? 0.95; // slightly measured for clarity
  utterance.pitch = options?.pitch ?? 1.0;

  // Prefer natural English voices if available
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(
    (v) =>
      (v.lang === "en-US" || v.lang === "en-GB") &&
      (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Daniel") || v.name.includes("Samantha"))
  ) || voices.find((v) => v.lang.startsWith("en"));

  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  if (options?.onStart) utterance.onstart = options.onStart;
  if (options?.onEnd) utterance.onend = options.onEnd;
  if (options?.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
}

export function stopTutorSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
