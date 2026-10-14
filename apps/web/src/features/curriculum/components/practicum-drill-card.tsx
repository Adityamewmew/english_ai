"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Volume2,
  Mic,
  Square,
  Headphones,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { playPopSound, playSnapSound, playMatchSuccessSound } from "@/lib/sound-fx";
import type { PracticumQuestion } from "./speaking-practicum-stage";

interface PracticumDrillCardProps {
  question: PracticumQuestion;
  isCompleted: boolean;
  savedAudioUrl?: string;
  savedScore?: number;
  onSaveResult: (audioUrl: string, transcript: string, score: number) => void;
  onAdvance: () => void;
  isLastQuestion: boolean;
  tutor: any;
}

export function PracticumDrillCard({
  question,
  isCompleted,
  savedAudioUrl,
  savedScore,
  onSaveResult,
  onAdvance,
  isLastQuestion,
  tutor,
}: PracticumDrillCardProps) {
  const [isPlayingModel, setIsPlayingModel] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(savedAudioUrl || null);
  const [isPlayingSelf, setIsPlayingSelf] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [accuracyScore, setAccuracyScore] = useState<number | null>(savedScore ?? null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const selfAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sync state if question changes
  useEffect(() => {
    setRecordedAudioUrl(savedAudioUrl || null);
    setAccuracyScore(savedScore ?? null);
    setLiveTranscript("");
    setIsRecording(false);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (selfAudioRef.current) selfAudioRef.current.pause();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [question.id, savedAudioUrl, savedScore]);

  // 1. Play Audio Model
  const handlePlayModel = () => {
    playPopSound();
    setIsPlayingModel(true);
    const audioText = question.targetSentence || question.audioPrompt || question.instruction;
    tutor?.playTutorAudio?.(audioText);
    setTimeout(() => {
      setIsPlayingModel(false);
    }, 3200);
  };

  // 2. Start Recording Student Drill
  const handleStartRecord = async () => {
    playPopSound();
    setLiveTranscript("");
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
        setRecordedAudioUrl(audioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.lang = "en-US";
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (e: any) => {
          let text = "";
          for (let i = 0; i < e.results.length; i++) {
            text += e.results[i][0].transcript;
          }
          setLiveTranscript(text);
        };
        try {
          rec.start();
          recognitionRef.current = rec;
        } catch {}
      }
    } catch {
      alert("Izin mikrofon diperlukan untuk merekam pelafalanmu.");
    }
  };

  // 3. Stop Recording & Compute Accuracy
  const handleStopRecord = () => {
    playSnapSound();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);

    // Calculate score based on keyword match
    const targetWords = (question.targetSentence || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const spokenWords = liveTranscript
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/);

    let matchCount = 0;
    targetWords.forEach((word) => {
      if (spokenWords.some((sw) => sw.includes(word) || word.includes(sw))) {
        matchCount++;
      }
    });

    const ratio = targetWords.length > 0 ? matchCount / targetWords.length : 1;
    let score = Math.round(ratio * 100);
    if (score >= 60) score = Math.max(score, 80);
    else if (score > 0) score = Math.max(score, 70);
    else score = 75; // Graceful baseline for beginner participation

    setAccuracyScore(score);
  };

  // 4. Play Student Audio
  const handlePlaySelfAudio = () => {
    if (!recordedAudioUrl) return;
    if (selfAudioRef.current) selfAudioRef.current.pause();

    const audio = new Audio(recordedAudioUrl);
    selfAudioRef.current = audio;
    setIsPlayingSelf(true);
    audio.onended = () => setIsPlayingSelf(false);
    audio.onerror = () => setIsPlayingSelf(false);
    audio.play().catch(() => setIsPlayingSelf(false));
  };

  // 5. Submit & Advance
  const handleConfirm = () => {
    playMatchSuccessSound();
    const finalScore = accuracyScore ?? 80;
    onSaveResult(recordedAudioUrl || "", liveTranscript, finalScore);
    onAdvance();
  };

  return (
    <div className="space-y-4">
      {/* Target Sentence Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#0D3B66]/10 text-[#0D3B66] dark:bg-[#F4B41A]/10 dark:text-[#F4B41A]">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Target Kalimat Lisan (Listen & Repeat)
            </span>
          </div>

          <button
            type="button"
            onClick={handlePlayModel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isPlayingModel ? "animate-pulse text-[#F4B41A]" : "text-[#0D3B66] dark:text-[#F4B41A]"}`} />
            <span>{isPlayingModel ? "Memutar Audio..." : "Dengarkan Contoh"}</span>
          </button>
        </div>

        <div className="space-y-1">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug tracking-tight">
            &ldquo;{question.targetSentence}&rdquo;
          </h4>
          {question.phonetic && (
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block font-medium">
              {question.phonetic}
            </span>
          )}
        </div>

        {question.explanation && (
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
            {question.explanation}
          </p>
        )}
      </div>

      {/* Live Transcript / Feedback */}
      {(liveTranscript || recordedAudioUrl) && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-500">
              Hasil Rekaman Suaramu:
            </span>
            {accuracyScore !== null && (
              <span
                className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-full ${
                  accuracyScore >= 75
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                Kejelasan: {accuracyScore}%
              </span>
            )}
          </div>
          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium italic">
            &ldquo;{liveTranscript || "Audio berhasil direkam."}&rdquo;
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="pt-2 flex flex-wrap items-center gap-2.5">
        {isRecording ? (
          <button
            type="button"
            onClick={handleStopRecord}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer animate-pulse"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Selesai Bicara (00:0{recordSeconds})</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStartRecord}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-skeuo-yellow text-[#0F172A] text-xs font-black shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Mic className="w-4 h-4 text-[#0D3B66]" />
            <span>{recordedAudioUrl ? "Ulangi Rekaman Lisan" : "Tekan & Ucapkan Kalimat"}</span>
          </button>
        )}

        {recordedAudioUrl && !isRecording && (
          <button
            type="button"
            onClick={handlePlaySelfAudio}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-xs transition-all hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer active:scale-95"
          >
            <Headphones className="w-4 h-4 text-[#0D3B66] dark:text-[#F4B41A]" />
            <span>{isPlayingSelf ? "Memutar..." : "Dengar Suaramu"}</span>
          </button>
        )}

        {recordedAudioUrl && !isRecording && (
          <button
            type="button"
            onClick={handleConfirm}
            className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl btn-skeuo-navy text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>{isLastQuestion ? "Selesaikan Praktikum" : "Konfirmasi & Lanjut Soal"}</span>
            <ArrowRight className="w-4 h-4 text-[#F4B41A]" />
          </button>
        )}
      </div>
    </div>
  );
}
