"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  RotateCcw,
  Volume2,
  FileText,
  CheckCircle,
  Loader2,
  Info,
} from "lucide-react";
import { placementApi } from "@/features/placement/api/placement.api";

interface SpeakingRecorderProps {
  onTranscriptChange: (transcript: string) => void;
}

export function SpeakingRecorder({ onTranscriptChange }: SpeakingRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [hasRecorded, setHasRecorded] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAligned, setIsAligned] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  const timerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const liveTranscriptRef = useRef<string>("");
  const audioChunksRef = useRef<Blob[]>([]);
  const onTranscriptChangeRef = useRef(onTranscriptChange);

  useEffect(() => {
    onTranscriptChangeRef.current = onTranscriptChange;
  }, [onTranscriptChange]);

  // Sync transcript perubahan ke parent secara aman setelah render
  useEffect(() => {
    onTranscriptChangeRef.current(transcript);
  }, [transcript]);

  const startRecording = () => {
    setTranscript("");
    setAudioUrl(null);
    setTranscriptionError(null);
    setIsAligned(false);
    audioChunksRef.current = [];
    liveTranscriptRef.current = "";
    setSeconds(0);
    setIsRecording(true);
    setHasRecorded(true);
    setIsTranscribing(false);

    // Web Speech API real-time transcript
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const sr = new SpeechRecognition();
          sr.continuous = true;
          sr.interimResults = true;
          sr.lang = "en-US";
          sr.onresult = (event: any) => {
            let fullText = "";
            for (let i = 0; i < event.results.length; i++) {
              fullText += event.results[i][0].transcript + " ";
            }
            if (fullText.trim()) {
              liveTranscriptRef.current = fullText.trim();
              setTranscript(fullText.trim());
            }
          };
          sr.onerror = (e: any) => {
            console.warn("Client SpeechRecognition error:", e);
          };
          sr.start();
          speechRecognitionRef.current = sr;
        } catch (e) {
          console.warn("Client SpeechRecognition init error:", e);
        }
      }
    }

    // MediaRecorder capture for audio playback & server fallback
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const mr = new MediaRecorder(stream);
          mr.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };
          mr.onstop = async () => {
            stream.getTracks().forEach((t) => t.stop());
            if (audioChunksRef.current.length > 0) {
              const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
              const url = URL.createObjectURL(audioBlob);
              setAudioUrl(url);

              // Prioritas Tier 1: Jika browser berhasil mentranskrip lokal via Web Speech API (0 AI tokens)
              if (liveTranscriptRef.current.trim().length > 0) {
                setTranscript(liveTranscriptRef.current.trim());
                setIsAligned(true);
                setTranscriptionError(null);
                return;
              }

              // Prioritas Tier 2 (Fallback): Jika Web Speech API tidak aktif/kosong di browser ini
              setIsTranscribing(true);
              setTranscriptionError(null);
              try {
                const transcriptText = await placementApi.transcribeSpeaking(audioBlob, "audio/webm");
                if (transcriptText && transcriptText.trim().length > 0) {
                  setTranscript(transcriptText.trim());
                  setIsAligned(true);
                  setTranscriptionError(null);
                } else {
                  setIsAligned(false);
                  setTranscriptionError(
                    "Audio tersimpan. Silakan periksa atau ketik teks jawabanmu langsung di bawah."
                  );
                }
              } catch (err) {
                console.warn("AI transcription error:", err);
                setIsAligned(false);
                setTranscriptionError(
                  "Audio tersimpan. Silakan periksa atau ketik teks jawabanmu langsung di bawah."
                );
              } finally {
                setIsTranscribing(false);
              }
            }
          };
          mr.start();
          mediaRecorderRef.current = mr;
        })
        .catch((err) => {
          console.warn("Microphone stream error:", err);
          alert("Izin mikrofon diperlukan untuk merekam suara. Kamu juga bisa mengetikkan kalimatmu secara langsung.");
          setIsRecording(false);
        });
    }

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev >= 60) {
          stopRecording();
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn("MediaRecorder stop error:", err);
      }
    }
  };

  const handleReset = () => {
    setIsRecording(false);
    setIsTranscribing(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.abort();
      } catch {}
      speechRecognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    liveTranscriptRef.current = "";
    setAudioUrl(null);
    setTranscript("");
    setSeconds(0);
    setHasRecorded(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 border-b-4 border-b-slate-300 shadow-sm space-y-4">
      {/* Hardware Recorder Deck */}
      <div className="p-3 sm:p-4 rounded-xl bg-[#0B1523] border border-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] space-y-3">
        {/* LCD Status Screen */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-200 px-1">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRecording
                  ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-pulse"
                  : "bg-slate-600"
              }`}
            />
            <span className="text-[11px] font-bold tracking-wider text-amber-300">
              {isRecording
                ? "RECORDING"
                : isTranscribing
                ? "TRANSCRIBING"
                : hasRecorded
                ? "AUDIO READY"
                : "STANDBY"}
            </span>
          </div>

          <span className="text-[11px] tracking-wider text-slate-300 font-semibold">
            {formatTime(seconds)} / 01:00
          </span>
        </div>

        {/* Hardware Controls */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold border-b-3 border-b-rose-900 active:border-b-0 active:translate-y-0.5 shadow-sm transition-all flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              <span>{hasRecorded ? "Rekam Ulang" : "Mulai Rekam (Mic)"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-rose-400 text-xs font-extrabold border-2 border-rose-500 border-b-3 border-b-rose-700 active:border-b-0 active:translate-y-0.5 shadow-inner transition-all flex items-center gap-2 animate-pulse"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Selesai Rekam</span>
            </button>
          )}

          {hasRecorded && !isRecording && (
            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 border-b-2 border-b-slate-900 active:border-b-0 active:translate-y-0.5 transition-all"
              title="Reset Rekaman"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {isTranscribing && (
            <span className="text-[11px] text-amber-300 flex items-center gap-1.5 font-mono ml-auto">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Menyelaraskan transkrip...
            </span>
          )}
        </div>
      </div>

      {/* Audio Playback Deck */}
      {audioUrl && (
        <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200 border-b-2 border-b-slate-300 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-secondary" />
              Rekaman Suaramu:
            </span>
            <span className="text-[10px] text-slate-500">Tersimpan</span>
          </div>
          <audio controls src={audioUrl} className="w-full h-8 rounded-lg" />
        </div>
      )}

      {/* Recessed Transcript Pad */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-secondary" />
            Transkrip Jawaban:
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">
              (Dapat diedit atau diketik langsung)
            </span>
            {transcript && (
              <button
                type="button"
                onClick={() => setTranscript("")}
                className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold transition-all"
              >
                Hapus
              </button>
            )}
          </div>
        </div>

        <textarea
          rows={3}
          value={transcript}
          disabled={isRecording || isTranscribing}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Ucapanmu akan otomatis ditranskripsikan ke sini. Kamu juga dapat mengetik atau mengedit langsung..."
          className="w-full p-3.5 rounded-xl border border-slate-200 border-b-2 border-b-slate-300 bg-[#FBFBFE] focus:bg-white text-xs text-slate-800 focus:outline-none focus:border-secondary transition-all font-normal shadow-inner disabled:bg-slate-50 disabled:text-slate-500"
        />

        {isAligned && transcript ? (
          <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            Transkrip berhasil diselaraskan ({transcript.split(/\s+/).filter(Boolean).length} kata).
          </p>
        ) : transcriptionError ? (
          <div className="flex items-start gap-1.5 p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800">
            <Info className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
            <p>{transcriptionError}</p>
          </div>
        ) : transcript ? (
          <p className="text-[10px] text-slate-400 text-right">
            {transcript.split(/\s+/).filter(Boolean).length} kata terisi
          </p>
        ) : null}
      </div>
    </div>
  );
}
