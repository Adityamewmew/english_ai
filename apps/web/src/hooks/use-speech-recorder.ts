"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export interface SpeechRecorderCallbackOptions {
  onTextResult: (text: string) => void;
  onAudioResult: (audioUrl: string, audioBlob?: Blob) => void;
  onEnd?: () => void;
}

/**
 * Konversi Blob audio menjadi base64 string untuk dikirim ke backend AI STT
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function useSpeechRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentlyPlayingUrl, setCurrentlyPlayingUrl] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const registeredUrlsRef = useRef<Set<string>>(new Set());

  // Bersihkan semua URL objek dan media saat unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (activeAudioElementRef.current) {
        activeAudioElementRef.current.pause();
      }
      registeredUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
    };
  }, []);

  const stopListening = useCallback(() => {
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startListening = useCallback(
    async ({ onTextResult, onAudioResult, onEnd }: SpeechRecorderCallbackOptions) => {
      if (typeof window === "undefined") return;

      // Hentikan proses aktif jika ada
      stopListening();
      audioChunksRef.current = [];

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      let micStream: MediaStream | null = null;

      try {
        // 1. Dapatkan akses mikrofon untuk MediaRecorder
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          streamRef.current = micStream;

          let mimeType = "audio/webm";
          if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
            mimeType = "audio/webm;codecs=opus";
          } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
            mimeType = "audio/mp4";
          }

          const recorder = new MediaRecorder(micStream, { mimeType });
          mediaRecorderRef.current = recorder;

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          recorder.onstop = () => {
            if (audioChunksRef.current.length > 0) {
              const blob = new Blob(audioChunksRef.current, { type: mimeType });
              const url = URL.createObjectURL(blob);
              registeredUrlsRef.current.add(url);
              onAudioResult(url, blob);
            }
          };

          recorder.start(100);
        }
      } catch (err) {
        console.warn("MediaRecorder mikrofon tidak tersedia, fallback ke STT saja:", err);
      }

      // 2. Aktifkan SpeechRecognition untuk deteksi teks
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = "en-US";
          recognition.continuous = false;
          recognition.interimResults = false;

          recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            onTextResult(text);
          };

          recognition.onerror = () => {
            stopListening();
            onEnd?.();
          };

          recognition.onend = () => {
            stopListening();
            onEnd?.();
          };

          recognitionRef.current = recognition;
          recognition.start();
          setIsRecording(true);
        } catch {
          stopListening();
          onEnd?.();
        }
      } else {
        // Jika SpeechRecognition tidak ada tapi MediaRecorder ada
        setIsRecording(true);
      }
    },
    [stopListening]
  );

  const playStudentAudio = useCallback((audioUrl: string) => {
    if (!audioUrl || typeof window === "undefined") return;

    if (activeAudioElementRef.current) {
      activeAudioElementRef.current.pause();
      activeAudioElementRef.current = null;
    }

    const audio = new Audio(audioUrl);
    activeAudioElementRef.current = audio;
    setCurrentlyPlayingUrl(audioUrl);

    audio.onended = () => {
      setCurrentlyPlayingUrl(null);
      activeAudioElementRef.current = null;
    };

    audio.onerror = () => {
      setCurrentlyPlayingUrl(null);
      activeAudioElementRef.current = null;
    };

    audio.play().catch(() => {
      setCurrentlyPlayingUrl(null);
    });
  }, []);

  const stopStudentAudio = useCallback(() => {
    if (activeAudioElementRef.current) {
      activeAudioElementRef.current.pause();
      activeAudioElementRef.current = null;
    }
    setCurrentlyPlayingUrl(null);
  }, []);

  return {
    isRecording,
    currentlyPlayingUrl,
    startListening,
    stopListening,
    playStudentAudio,
    stopStudentAudio,
  };
}
