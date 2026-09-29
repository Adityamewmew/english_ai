"use client";

import React from "react";
import { Mic, PhoneCall, PhoneOff } from "lucide-react";

interface ModuleVoiceOrbProps {
  state: "idle" | "connecting" | "speaking" | "listening" | "thinking";
  isCalling: boolean;
  onClick: () => void;
}

export function ModuleVoiceOrb({ state, isCalling, onClick }: ModuleVoiceOrbProps) {
  const isSpeaking = state === "speaking";
  const isThinking = state === "thinking";
  const isListening = state === "listening";

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className="relative flex items-center justify-center cursor-pointer select-none group"
      title={
        isCalling
          ? isSpeaking
            ? "Mr. Khoirul sedang berbicara (Ketuk untuk jeda/tutup)"
            : "Mr. Khoirul sedang mendengarkan Anda"
          : "Ketuk bola untuk berbicara dengan Mr. Khoirul"
      }
    >
      {/* Soundwave ripples when speaking */}
      {isSpeaking && (
        <>
          <div className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-blue-400/40 animate-ping pointer-events-none" />
          <div
            className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full border border-sky-300/30 animate-pulse pointer-events-none"
            style={{ animationDuration: "1.5s" }}
          />
        </>
      )}

      {/* Atmospheric Soft Aura Glow */}
      <div
        className={`absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full blur-2xl transition-all duration-500 pointer-events-none ${
          isSpeaking
            ? "bg-blue-500/50 scale-125 animate-pulse"
            : isListening
            ? "bg-emerald-500/40 scale-115 animate-pulse"
            : isThinking
            ? "bg-purple-500/40 scale-110 animate-pulse"
            : isCalling
            ? "bg-sky-400/30 scale-105"
            : "bg-blue-600/30 scale-100 group-hover:scale-115 group-hover:bg-blue-500/40"
        }`}
      />

      {/* Core Glowing Orb Sphere */}
      <div
        className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden transition-all duration-300 shadow-xl border border-white/40 ${
          isSpeaking
            ? "scale-105"
            : isListening
            ? "scale-105"
            : isCalling
            ? "animate-pulse"
            : "group-hover:scale-105 group-active:scale-95"
        }`}
        style={{
          background:
            "radial-gradient(circle at 45% 32%, #ffffff 0%, #e0f2fe 20%, #bae6fd 45%, #60a5fa 75%, #2563eb 100%)",
          boxShadow:
            "inset -6px -6px 15px rgba(29, 78, 216, 0.75), inset 3px 3px 10px rgba(255, 255, 255, 0.85), 0 0 30px rgba(96, 165, 250, 0.6)",
        }}
      >
        {/* Internal Nebular Fluid Layer */}
        <div
          className="absolute inset-0 opacity-80 mix-blend-overlay filter blur-sm pointer-events-none animate-spin"
          style={{
            animationDuration: isSpeaking ? "4s" : "12s",
            background:
              "radial-gradient(ellipse at 70% 65%, rgba(255, 255, 255, 0.95) 0%, rgba(186, 230, 253, 0.7) 35%, rgba(59, 130, 246, 0.4) 65%, transparent 100%)",
          }}
        />

        {/* Center Indicator Icon */}
        <div className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
          {isCalling ? (
            isListening ? (
              <Mic className="w-7 h-7 text-white animate-pulse" />
            ) : isSpeaking ? (
              <div className="flex items-center gap-1">
                <span className="w-1 h-4 bg-white rounded-full animate-bounce" />
                <span className="w-1 h-6 bg-white rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            ) : (
              <PhoneCall className="w-6 h-6 text-white animate-pulse" />
            )
          ) : (
            <PhoneCall className="w-6 h-6 text-white/90 group-hover:scale-110 transition-transform" />
          )}
        </div>
      </div>
    </div>
  );
}
