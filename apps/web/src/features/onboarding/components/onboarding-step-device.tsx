"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  Info,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { speakTutorText, stopTutorSpeech } from "@/lib/tutor-voice";

interface OnboardingStepDeviceProps {
  speakerChecked: boolean;
  micChecked: boolean;
  onSpeakerCheckedChange: (checked: boolean) => void;
  onMicCheckedChange: (checked: boolean) => void;
}

export function OnboardingStepDevice({
  speakerChecked,
  micChecked,
  onSpeakerCheckedChange,
  onMicCheckedChange,
}: OnboardingStepDeviceProps) {
  // Speaker Test State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Mic Test State
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [micSecondsLeft, setMicSecondsLeft] = useState(3);
  const [micVolumeLevel, setMicVolumeLevel] = useState(0); // 0 to 100
  const [micError, setMicError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<any>(null);

  // Stop everything on unmount
  useEffect(() => {
    return () => {
      stopTutorSpeech();
      cleanupMic();
    };
  }, []);

  const handleTestSpeaker = () => {
    if (isPlayingAudio) {
      stopTutorSpeech();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    speakTutorText(
      "Hello there! Welcome to EDDY'S English AI. I am Mr. Khoirul, your AI speaking companion. Let's make learning English fun and effective!",
      {
        onStart: () => setIsPlayingAudio(true),
        onEnd: () => {
          setIsPlayingAudio(false);
          onSpeakerCheckedChange(true);
        },
        onError: () => {
          setIsPlayingAudio(false);
        },
      }
    );
  };

  const cleanupMic = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const handleTestMic = async () => {
    cleanupMic();
    setMicError(null);
    setIsRecordingMic(true);
    setMicSecondsLeft(3);
    setMicVolumeLevel(10);

    try {
      if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Browser Anda belum mendukung rekaman audio.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let maxVolumeSeen = 0;

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setMicVolumeLevel(normalized);
        if (normalized > maxVolumeSeen) maxVolumeSeen = normalized;

        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      animationFrameRef.current = requestAnimationFrame(updateVolume);

      // Countdown 3 seconds
      let remaining = 3;
      countdownIntervalRef.current = setInterval(() => {
        remaining -= 1;
        setMicSecondsLeft(remaining);
        if (remaining <= 0) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          cleanupMic();
          setIsRecordingMic(false);
          setMicVolumeLevel(0);
          onMicCheckedChange(true);
        }
      }, 1000);
    } catch (err: any) {
      cleanupMic();
      setIsRecordingMic(false);
      setMicVolumeLevel(0);
      const isPermissionDenied =
        err?.name === "NotAllowedError" ||
        err?.name === "PermissionDeniedError" ||
        err?.message?.toLowerCase().includes("denied");
      setMicError(
        isPermissionDenied
          ? "Izin akses mikrofon ditolak oleh browser. Mohon klik ikon gembok pada address bar untuk mengizinkan mikrofon."
          : err?.message || "Gagal menghubungkan mikrofon."
      );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Info */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Pemeriksaan Kesiapan Perangkat
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
          EDDY&apos;S AI memiliki modul interaktif audio dan latihan berbicara langsung (*Speaking*). Pastikan speaker dan mikrofon Anda berfungsi prima.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Speaker Test */}
        <div
          className={`p-5 sm:p-6 rounded-2xl border transition-all ${
            speakerChecked
              ? "border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  speakerChecked
                    ? "bg-emerald-500 text-white"
                    : isPlayingAudio
                    ? "bg-[#0D3B66] text-white animate-pulse"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  1. Uji Speaker / Headphone
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Mendengarkan suara Mr. Khoirul
                </p>
              </div>
            </div>
            {speakerChecked && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Siap
              </span>
            )}
          </div>

          <div className="mt-5 space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#0D3B66] dark:text-[#F4B41A] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Tekan tombol di bawah untuk mendengarkan sambutan suara dari AI Tutor.
              </p>
            </div>

            <button
              type="button"
              onClick={handleTestSpeaker}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px] ${
                isPlayingAudio
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                  : "bg-[#0D3B66] hover:bg-[#092b4b] text-white shadow-xs"
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Square className="w-4 h-4 fill-white" />
                  <span>Hentikan Audio</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Uji Suara Mr. Khoirul</span>
                </>
              )}
            </button>

            <label className="flex items-center gap-2.5 pt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={speakerChecked}
                onChange={(e) => onSpeakerCheckedChange(e.target.checked)}
                className="w-4 h-4 text-[#0D3B66] rounded-md border-slate-300 dark:border-slate-700 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Saya mendengar suara dengan jelas
              </span>
            </label>
          </div>
        </div>

        {/* Card 2: Microphone Test */}
        <div
          className={`p-5 sm:p-6 rounded-2xl border transition-all ${
            micChecked
              ? "border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  micChecked
                    ? "bg-emerald-500 text-white"
                    : isRecordingMic
                    ? "bg-rose-500 text-white animate-pulse"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  2. Uji Mikrofon
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Untuk latihan speaking interaktif
                </p>
              </div>
            </div>
            {micChecked && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Siap
              </span>
            )}
          </div>

          <div className="mt-5 space-y-3">
            {isRecordingMic ? (
              <div className="space-y-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60">
                <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    Bicaralah sekarang (&quot;Hello&quot;)...
                  </span>
                  <span>{micSecondsLeft}s</span>
                </div>
                {/* Visual Volume Meter */}
                <div className="h-3 bg-rose-200/70 dark:bg-rose-900/60 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-75"
                    style={{ width: `${Math.max(8, micVolumeLevel)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Tekan uji mikrofon dan katakan sepatah kata (misal: <em>&quot;Hello Mr. Khoirul&quot;</em>).
                </p>
              </div>
            )}

            {micError && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-snug">{micError}</p>
              </div>
            )}

            <button
              type="button"
              disabled={isRecordingMic}
              onClick={handleTestMic}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px] ${
                micChecked
                  ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                  : "btn-skeuo-yellow"
              }`}
            >
              {isRecordingMic ? (
                <>
                  <Mic className="w-4 h-4 animate-bounce" />
                  <span>Mendengarkan ({micSecondsLeft}s)...</span>
                </>
              ) : micChecked ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Uji Ulang Mikrofon</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Uji Mikrofon (3 Detik)</span>
                </>
              )}
            </button>

            <label className="flex items-center gap-2.5 pt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={micChecked}
                onChange={(e) => onMicCheckedChange(e.target.checked)}
                className="w-4 h-4 text-[#0D3B66] rounded-md border-slate-300 dark:border-slate-700 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mikrofon saya terpasang dan siap digunakan
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

