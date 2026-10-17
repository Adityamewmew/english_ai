"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { getApiUrl } from "@/lib/api-client";

interface AudioPlayerProps {
  audioUrl?: string;
  audioScript?: string;
  title?: string;
  targetLevel?: string;
  hideTranscript?: boolean;
}

export function AudioPlayer({
  audioUrl,
  audioScript,
  title,
  targetLevel,
  hideTranscript = false,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioError, setAudioError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cleanScript = audioScript ? audioScript.replace(/[A-Za-z]+:\s*/g, "").trim() : "";
  const resolvedAudioUrl = audioUrl || (cleanScript ? getApiUrl(`/api/voice/tts?text=${encodeURIComponent(cleanScript)}`) : "");

  useEffect(() => {
    // Reset saat audio URL berubah
    setIsPlaying(false);
    setCurrentTime(0);
    setAudioError(false);
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
    <div className="p-4 sm:p-5 rounded-2xl bg-[#0D2238] border border-[#1b3d60] border-b-4 border-b-[#071320] text-white shadow-md space-y-3.5">
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

      {/* Hardware Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-secondary/20 text-secondary border border-secondary/30 flex items-center justify-center shadow-xs">
            <Volume2 className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-bold tracking-tight text-slate-100">
            {title || "Audio Listening"}
          </span>
        </div>

        {targetLevel && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-amber-300 border border-white/15">
            Level {targetLevel}
          </span>
        )}
      </div>

      {/* Tactile LCD Screen Display */}
      <div className="p-2.5 rounded-xl bg-[#06111D] border border-slate-700/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isPlaying ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" : "bg-slate-600"
            }`}
          />
          <span className="text-[11px] text-[#F3C623] tracking-wider font-semibold">
            {isPlaying ? "PLAYING" : "PAUSED"}
          </span>
        </div>

        {/* Animated Audio Meter */}
        <div className="flex items-center gap-1 h-3 px-2">
          {[35, 70, 95, 50, 85, 40, 75, 45, 90, 60].map((h, i) => (
            <span
              key={i}
              style={{ height: isPlaying ? `${h}%` : "20%" }}
              className="w-1 bg-secondary rounded-full transition-all duration-200"
            />
          ))}
        </div>

        <span className="text-[11px] text-slate-300 tracking-wider">
          {formatTime(currentTime)} / {formatTime(duration || 30)}
        </span>
      </div>

      {/* Recessed Groove Slider */}
      <div className="px-1">
        <input
          type="range"
          min={0}
          max={duration || 30}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-secondary shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)] border border-slate-700/50"
        />
      </div>

      {/* Tactile Hardware Buttons */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className={`min-h-[40px] px-4 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm ${
              isPlaying
                ? "bg-[#c76e0f] text-white border-b-2 border-b-[#7a4105] translate-y-0.5 shadow-inner"
                : "bg-secondary hover:bg-[#d4720e] text-white border-b-3 border-b-[#9e5207] active:border-b-0 active:translate-y-1"
            }`}
            title={isPlaying ? "Jeda Audio" : "Putar Audio"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Jeda</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Putar</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="h-10 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 border-b-3 border-b-slate-900 active:border-b-0 active:translate-y-0.5 flex items-center gap-1.5 transition-all"
            title="Ulangi dari Awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ulangi</span>
          </button>

          <button
            type="button"
            onClick={toggleSpeed}
            className="h-10 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold border border-slate-700 border-b-3 border-b-slate-900 active:border-b-0 active:translate-y-0.5 transition-all"
            title="Ubah Kecepatan Putar"
          >
            {playbackRate}x
          </button>
        </div>

        {audioError && (
          <span className="text-[11px] text-rose-300">
            Audio tidak tersedia.
          </span>
        )}
      </div>
    </div>
  );
}
