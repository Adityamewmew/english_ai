"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Volume2,
  Mic,
  Square,
  Play,
  CheckCircle2,
  Headphones,
} from "lucide-react";
import { playPopSound, playSnapSound, playMatchSuccessSound } from "@/lib/sound-fx";

interface DrillItem {
  id: string;
  targetText: string;
  phonetic?: string;
  focus?: string;
  hint?: string;
}

interface SpeakingReflexDrillsProps {
  practiceSec: any;
  tutor: any;
  onRewardXp: (amount: number) => void;
}

export function SpeakingReflexDrills({
  practiceSec,
  tutor,
  onRewardXp,
}: SpeakingReflexDrillsProps) {
  const drills: DrillItem[] = practiceSec?.content?.drills || [];

  if (drills.length === 0) {
    return (
      <div className="p-8 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Belum ada latihan kalimat lisan yang tersedia untuk sesi ini.
        </p>
      </div>
    );
  }

  const [activeDrillPlaying, setActiveDrillPlaying] = useState<number | null>(null);
  const [recordingDrillIdx, setRecordingDrillIdx] = useState<number | null>(null);
  const [recordings, setRecordings] = useState<Record<number, string>>({});
  const [playingRecordingIdx, setPlayingRecordingIdx] = useState<number | null>(null);
  const [drillCompleted, setDrillCompleted] = useState<Record<number, boolean>>({});
  const [recordSeconds, setRecordSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const studentAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Clean up timers & audio blobs
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (studentAudioPlayerRef.current) {
        studentAudioPlayerRef.current.pause();
      }
    };
  }, []);

  // 1. Play Model Audio
  const handlePlayModel = (idx: number, text: string) => {
    playPopSound();
    setActiveDrillPlaying(idx);
    tutor.playTutorAudio(text);
    setTimeout(() => {
      setActiveDrillPlaying(null);
    }, 2800);
  };

  // 2. Start Recording Student Voice (MediaRecorder)
  const handleStartRecord = async (idx: number) => {
    playPopSound();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordings((prev) => ({ ...prev, [idx]: audioUrl }));
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setRecordingDrillIdx(idx);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn("Mikrofon tidak dapat diakses:", err);
      alert("Izin mikrofon diperlukan untuk merekam suara latihan.");
    }
  };

  // 3. Stop Recording
  const handleStopRecord = (idx: number) => {
    playSnapSound();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecordingDrillIdx(null);
  };

  // 4. Play Student Recording
  const handlePlayStudentAudio = (idx: number) => {
    const audioUrl = recordings[idx];
    if (!audioUrl) return;

    if (studentAudioPlayerRef.current) {
      studentAudioPlayerRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    studentAudioPlayerRef.current = audio;
    setPlayingRecordingIdx(idx);

    audio.onended = () => {
      setPlayingRecordingIdx(null);
    };
    audio.onerror = () => {
      setPlayingRecordingIdx(null);
    };

    audio.play().catch(() => setPlayingRecordingIdx(null));
  };

  // 5. Complete Drill & Reward XP
  const handleConfirmDone = (idx: number) => {
    if (drillCompleted[idx]) return;
    setDrillCompleted((prev) => ({ ...prev, [idx]: true }));
    playMatchSuccessSound();
    onRewardXp(15);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-[#1B4965] dark:text-[#F4B41A] uppercase tracking-wider block font-mono">
          Step 3 · Oral Reflex Drills (Listen &amp; Repeat)
        </span>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          Latihan Ucapkan Mandiri (Listen, Repeat &amp; Compare)
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Dengarkan intonasi model Mr. Khoirul, lalu rekam suaramu sendiri untuk membandingkan ritme dan artikulasi perkenalan:
        </p>
      </div>

      <div className="space-y-3.5">
        {drills.map((drill, idx) => {
          const isModelPlaying = activeDrillPlaying === idx;
          const isRecording = recordingDrillIdx === idx;
          const studentRecording = recordings[idx];
          const isPlayingSelf = playingRecordingIdx === idx;
          const isDone = drillCompleted[idx];

          return (
            <div
              key={drill.id || idx}
              className={`p-5 rounded-[24px] bg-white dark:bg-slate-900 border transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4 ${
                isDone
                  ? "border-emerald-300 dark:border-emerald-700/60"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              {/* Header & Target Text */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Drill #{idx + 1}
                    </span>
                    {drill.focus && (
                      <span className="text-[11px] font-bold text-[#0D3B66] dark:text-[#F4B41A] bg-[#0D3B66]/10 dark:bg-[#F4B41A]/10 px-2 py-0.5 rounded-full">
                        {drill.focus}
                      </span>
                    )}
                  </div>

                  <p className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                    {drill.targetText}
                  </p>

                  {drill.phonetic && (
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block">
                      {drill.phonetic}
                    </span>
                  )}

                  {drill.hint && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-normal pt-0.5">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Tips:</span> {drill.hint}
                    </span>
                  )}
                </div>

                {isDone && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold shrink-0 self-start">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Tuntas</span>
                  </span>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2.5">
                {/* 1. Listen Model Audio */}
                <button
                  type="button"
                  onClick={() => handlePlayModel(idx, drill.targetText)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Volume2 className={`w-4 h-4 ${isModelPlaying ? "text-[#F4B41A] animate-pulse" : "text-[#0D3B66] dark:text-[#F4B41A]"}`} />
                  <span>{isModelPlaying ? "Memutar Model..." : "Dengar Model"}</span>
                </button>

                {/* 2. Record Student Voice */}
                {isRecording ? (
                  <button
                    type="button"
                    onClick={() => handleStopRecord(idx)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Selesai Rekam (00:0{recordSeconds})</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartRecord(idx)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl btn-skeuo-yellow text-[#0F172A] text-xs font-black shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Mic className="w-4 h-4 text-[#0D3B66]" />
                    <span>{studentRecording ? "Rekam Ulang Suara" : "Rekam Suaramu"}</span>
                  </button>
                )}

                {/* 3. Playback Student Audio if recorded */}
                {studentRecording && !isRecording && (
                  <button
                    type="button"
                    onClick={() => handlePlayStudentAudio(idx)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-xs transition-all hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer active:scale-95"
                  >
                    <Headphones className="w-4 h-4 text-[#0D3B66] dark:text-[#F4B41A]" />
                    <span>{isPlayingSelf ? "Memutar..." : "Dengar Suaramu"}</span>
                  </button>
                )}

                {/* 4. Complete button */}
                {studentRecording && !isDone && !isRecording && (
                  <button
                    type="button"
                    onClick={() => handleConfirmDone(idx)}
                    className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl btn-skeuo-navy text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#F4B41A]" />
                    <span>Selesai Latih (+15 XP)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
