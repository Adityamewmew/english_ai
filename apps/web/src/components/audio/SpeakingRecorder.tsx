"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  RotateCcw,
  Volume2,
  Sparkles,
  CheckCircle,
  Loader2,
  Info,
} from "lucide-react";
import { transcribeSpeakingAudio } from "@/app/(student)/placement/placement.actions";

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
    setSeconds(0);
    setIsRecording(true);
    setHasRecorded(true);
    setIsTranscribing(false);

    // Mulai perekaman audio murni (MediaRecorder)
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

              // Kirim audio ke AI Gemini untuk menyelaraskan kalimat dan memunculkan teks
              setIsTranscribing(true);
              setTranscriptionError(null);
              try {
                const fd = new FormData();
                fd.append("audio", audioBlob, "intro.webm");
                const res = await transcribeSpeakingAudio(fd);
                if (res.success && res.transcript && res.transcript.trim().length > 0) {
                  setTranscript(res.transcript.trim());
                  setIsAligned(true);
                  setTranscriptionError(null);
                } else {
                  setIsAligned(false);
                  setTranscriptionError(
                    "AI belum berhasil mentranskrip otomatis. Suaramu tetap tersimpan di atas! Kamu bisa klik 'Rekam Ulang Suara' atau ketikkan perkenalanmu langsung di bawah."
                  );
                }
              } catch (err) {
                console.warn("AI transcription error:", err);
                setIsAligned(false);
                setTranscriptionError(
                  "Koneksi ke AI terganggu saat mentranskrip. Rekaman suaramu tetap tersimpan di atas dan kamu bisa mengetikkan kalimatmu langsung."
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

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

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
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
      {/* Petunjuk Soal */}
      <div className="space-y-1.5 border-b pb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold">
            <Mic className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-primary">Tes Berbicara: Perkenalan Diri (Self-Introduction)</h3>
            <p className="text-xs text-slate-500">
              Bicaralah dalam Bahasa Inggris selama 30 - 60 detik.
            </p>
          </div>
        </div>

        <div className="mt-2 p-3 bg-surface rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
          <p className="font-semibold text-primary">Poin yang bisa kamu sampaikan:</p>
          <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
            <li>Nama lengkap dan kota tempat tinggalmu (Name &amp; Location)</li>
            <li>Pekerjaan, sekolah, atau kegiatan harianmu (Occupation or Studies)</li>
            <li>Hobi favorit yang kamu sukai (Hobbies &amp; Interests)</li>
            <li>Alasan kamu ingin belajar Bahasa Inggris (Goal &amp; Motivation)</li>
          </ul>
        </div>
      </div>

      {/* Area Rekam */}
      <div className="flex flex-col items-center justify-center py-4 space-y-3 bg-surface rounded-xl border border-slate-100">
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${
              isRecording ? "bg-red-500 animate-ping" : "bg-slate-300"
            }`}
          />
          <span className="text-sm font-mono font-bold text-primary">
            {formatTime(seconds)} / 01:00
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Mic className="w-4 h-4" />
              {hasRecorded ? "Rekam Ulang Suara" : "Mulai Rekam Suara (Mic)"}
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md animate-pulse transition-all"
            >
              <Square className="w-4 h-4 fill-current" />
              Selesai Bicara
            </button>
          )}

          {hasRecorded && !isRecording && (
            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all text-xs"
              title="Reset Rekaman"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {isRecording && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1 h-5">
              <span className="w-1 bg-secondary rounded-full animate-bounce h-3" style={{ animationDelay: "0ms" }} />
              <span className="w-1 bg-secondary rounded-full animate-bounce h-5" style={{ animationDelay: "150ms" }} />
              <span className="w-1 bg-secondary rounded-full animate-bounce h-4" style={{ animationDelay: "300ms" }} />
              <span className="w-1 bg-secondary rounded-full animate-bounce h-6" style={{ animationDelay: "75ms" }} />
              <span className="w-1 bg-secondary rounded-full animate-bounce h-3" style={{ animationDelay: "225ms" }} />
            </div>
            <p className="text-[11px] text-secondary font-semibold">
              Mikrofon mendengarkan... Bicaralah dalam Bahasa Inggris dengan santai.
            </p>
          </div>
        )}
      </div>

      {/* Hasil Transkrip Suara (Bisa Diperiksa & Diperbaiki) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            Teks yang Terekam dari Suaramu:
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              (Bisa diedit atau diketik langsung)
            </span>
            {transcript && (
              <button
                type="button"
                onClick={() => setTranscript("")}
                className="text-[11px] text-red-500 hover:text-red-700 font-medium transition-all"
              >
                Hapus Teks
              </button>
            )}
          </div>
        </div>

        {isTranscribing && (
          <div className="flex items-center gap-2 p-2.5 bg-secondary/10 border border-secondary/20 rounded-xl text-xs text-secondary font-medium animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-secondary" />
            <span>AI Gemini sedang menganalisis audio (menyesuaikan nama, daerah &amp; pengucapan)...</span>
          </div>
        )}

        {audioUrl && (
          <div className="p-3 bg-surface rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-secondary" />
                Dengarkan Ulang Rekaman Suaramu:
              </span>
              <span className="text-[10px] text-slate-400">Tersimpan</span>
            </div>
            <audio controls src={audioUrl} className="w-full h-8 rounded-lg" />
          </div>
        )}

        <textarea
          rows={3}
          value={transcript}
          disabled={isRecording || isTranscribing}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={
            isRecording
              ? "🎙️ Sedang merekam suara... Bicaralah perkenalan dirimu dengan santai. Klik 'Selesai Bicara' jika sudah selesai."
              : isTranscribing
              ? "✨ AI Mr. Khoirul sedang mendengarkan rekaman dan menyelaraskan kalimatmu..."
              : "Klik tombol 'Mulai Rekam Suara' di atas dan ceritakan perkenalan dirimu. Kalimatmu akan otomatis diselaraskan oleh AI dan muncul di sini."
          }
          className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans transition-all ${
            isRecording || isTranscribing
              ? "bg-slate-50 text-slate-500 border-slate-200 cursor-wait"
              : "bg-white text-slate-800 border-slate-200"
          }`}
        />

        {isAligned && transcript ? (
          <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            Kalimat berhasil diselaraskan oleh AI ({transcript.split(/\s+/).filter(Boolean).length} kata). Kamu bisa mendengarkan audionya dan mengedit teks di atas jika ingin disesuaikan.
          </p>
        ) : transcriptionError ? (
          <div className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p>{transcriptionError}</p>
          </div>
        ) : transcript ? (
          <p className="text-[11px] text-slate-500 font-medium">
            {transcript.split(/\s+/).filter(Boolean).length} kata terisi.
          </p>
        ) : null}

        {/* Info Ramah Mengenai Nama & Daerah Lokal */}
        <div className="flex items-start gap-1.5 p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-800">
          <Info className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
          <p>
            <strong>Info:</strong> Ejaan nama orang atau nama kota di Indonesia (misal Padang, Banyuwangi, Surabaya) bisa kamu edit jika mikrofon salah dengar. Jangan khawatir, AI Mr. Khoirul tidak akan mengurangi skor tata bahasa (grammar) pada nama orang atau daerah.
          </p>
        </div>
      </div>
    </div>
  );
}
