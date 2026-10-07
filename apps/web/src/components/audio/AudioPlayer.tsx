"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api-client";

interface AudioPlayerProps {
  audioUrl?: string;
  audioScript?: string;
  title?: string;
  targetLevel?: string;
}

export function AudioPlayer({ audioUrl, audioScript, title, targetLevel }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cleanScript = audioScript ? audioScript.replace(/[A-Za-z]+:\s*/g, "").trim() : "";
  const resolvedAudioUrl = audioUrl || (cleanScript ? getApiUrl(`/api/voice/tts?text=${encodeURIComponent(cleanScript)}`) : "");

  useEffect(() => {
    // Reset saat audio URL berubah
    setIsPlaying(false);
    setCurrentTime(0);
    setAudioError(false);
    setShowTranscript(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [resolvedAudioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Audio playback error:", err);
          setAudioError(true);
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleSpeed = () => {
    const nextRate = playbackRate === 1 ? 0.8 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-primary text-white shadow-md space-y-4">
      {/* Audio element asli / ElevenLabs TTS */}
      {resolvedAudioUrl && (
        <audio
          ref={audioRef}
          src={resolvedAudioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onError={() => {
            setAudioError(true);
            setIsPlaying(false);
          }}
        />
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center">
            <Volume2 className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-sm font-bold tracking-tight">{title || "Audio Listening"}</h4>
            <p className="text-[11px] text-slate-300">
              Dengarkan baik-baik sebelum menjawab pertanyaan di bawah.
            </p>
          </div>
        </div>

        {targetLevel && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-accent border border-white/10">
            Level {targetLevel}
          </span>
        )}
      </div>

      {/* Waveform Animation & Progress Slider */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
          <span>{formatTime(currentTime)}</span>
          {/* Animated sound wave bars saat playing */}
          <div className="flex items-center gap-0.5 h-3">
            {[40, 75, 100, 60, 90, 45, 80, 50, 95, 65, 30].map((height, i) => (
              <span
                key={i}
                style={{ height: isPlaying ? `${height}%` : "20%" }}
                className="w-1 bg-secondary rounded-full transition-all duration-300"
              />
            ))}
          </div>
          <span>{formatTime(duration || 30)}</span>
        </div>

        <input
          type="range"
          min={0}
          max={duration || 30}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-secondary"
        />
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="w-11 h-11 rounded-2xl bg-secondary hover:bg-secondary/90 text-white flex items-center justify-center shadow-lg transition-all active:scale-95"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            title="Putar Ulang dari Awal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleSpeed}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-200 transition-all"
            title="Ubah Kecepatan Suara"
          >
            {playbackRate}x
          </button>
        </div>

        {/* Spoiler Toggle: Lihat Transkrip */}
        {audioScript && (
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10"
          >
            {showTranscript ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showTranscript ? "Sembunyikan Naskah" : "Lihat Naskah"}</span>
          </button>
        )}
      </div>

      {/* Naskah Teks (HANYA MUNCUL JIKA USER KLIK LIHAT NASKAH) */}
      {showTranscript && audioScript && (
        <div className="mt-3 p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 font-mono whitespace-pre-line leading-relaxed animate-fadeIn">
          <span className="text-[10px] text-accent uppercase font-bold tracking-wider block mb-1">
            Naskah Percakapan (Transcript):
          </span>
          {audioScript}
        </div>
      )}
    </div>
  );
}
