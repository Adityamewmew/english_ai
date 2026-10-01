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
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxRecordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isManualStopRef = useRef<boolean>(false);

  // Bersihkan semua URL objek dan media saat unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (maxRecordingTimerRef.current) clearTimeout(maxRecordingTimerRef.current);
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
    isManualStopRef.current = true;
    setIsRecording(false);

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxRecordingTimerRef.current) {
      clearTimeout(maxRecordingTimerRef.current);
      maxRecordingTimerRef.current = null;
    }

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
      isManualStopRef.current = false;
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

      // Timer pengaman maksimal 35 detik agar mic tidak aktif selamanya
      maxRecordingTimerRef.current = setTimeout(() => {
        stopListening();
      }, 35000);

      // 2. Aktifkan SpeechRecognition dengan mode continuous agar ramah pemula yang bicara lambat
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = "en-US";
          recognition.continuous = true;
          recognition.interimResults = true;

          const resetSilenceTimeout = (ms: number = 3500) => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              stopListening();
            }, ms);
          };

          recognition.onresult = (event: any) => {
            let finalTranscript = "";
            let interimTranscript = "";

            for (let i = 0; i < event.results.length; ++i) {
              const res = event.results[i];
              if (res.isFinal) {
                finalTranscript += res[0].transcript + " ";
              } else {
                interimTranscript += res[0].transcript;
              }
            }

            const fullText = (finalTranscript + interimTranscript).trim().replace(/\s+/g, " ");
            if (fullText.length > 0) {
              onTextResult(fullText);
              // Berikan jeda hening 3.5 detik agar pemula bisa mengambil napas / jeda antar kata tanpa terpotong
              resetSilenceTimeout(3500);
            }
          };

          recognition.onerror = (e: any) => {
            // Jangan hentikan rekaman jika hanya jeda sejenak di awal ("no-speech")
            if (e.error === "no-speech") {
              return;
            }
            stopListening();
            onEnd?.();
          };

          recognition.onend = () => {
            if (!isManualStopRef.current) {
              stopListening();
            }
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
