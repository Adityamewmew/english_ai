"use client";

import React from "react";

interface VoiceOrbProps {
  state: "idle" | "connecting" | "speaking" | "listening" | "thinking";
  onClick?: () => void;
  isMuted?: boolean;
}

export function VoiceOrb({ state, onClick, isMuted }: VoiceOrbProps) {
  const isSpeaking = state === "speaking";
  const isThinking = state === "thinking";
  const isConnecting = state === "connecting";
  const isIdle = state === "idle";

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer select-none group"
      role="button"
      tabIndex={0}
      title={
        isIdle
          ? "Ketuk untuk memulai panggilan"
          : isSpeaking
          ? "Mr. Khoirul sedang berbicara (Ketuk untuk menyela)"
          : "Mr. Khoirul sedang mendengarkan"
      }
    >
      {/* Outer Soundwave Ripple Effect (when tutor speaks) */}
      {isSpeaking && (
        <>
          <div className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-blue-400/30 animate-ripple pointer-events-none" />
          <div
            className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-sky-300/20 animate-ripple pointer-events-none"
            style={{ animationDelay: "0.7s" }}
          />
        </>
      )}

      {/* Atmospheric Soft Aura Glow */}
      <div
        className={`absolute w-60 h-60 sm:w-72 sm:h-72 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
          isSpeaking
            ? "bg-blue-400/40 scale-125 animate-pulse"
            : isThinking
            ? "bg-indigo-500/30 scale-110 animate-pulse"
            : isConnecting
            ? "bg-sky-400/25 scale-105 animate-pulse"
            : isMuted
            ? "bg-red-500/15 scale-95"
            : "bg-blue-500/25 scale-100"
        }`}
      />

      {/* Core Glowing Orb Sphere */}
      <div
        className={`relative w-52 h-52 sm:w-60 sm:h-60 rounded-full overflow-hidden transition-all duration-500 shadow-xl ${
          isSpeaking
            ? "animate-orb-speak"
            : isThinking
            ? "animate-orb-breathe"
            : ""
        }`}
        style={{
          background:
            "radial-gradient(circle at 45% 32%, #ffffff 0%, #e0f2fe 20%, #bae6fd 45%, #60a5fa 75%, #2563eb 100%)",
          boxShadow:
            "inset -12px -12px 30px rgba(29, 78, 216, 0.75), inset 6px 6px 18px rgba(255, 255, 255, 0.85), 0 0 50px rgba(96, 165, 250, 0.5), 0 0 100px rgba(59, 130, 246, 0.25)",
        }}
      >
        {/* Internal Nebular Cloud Layer (gives organic fluid movement like ChatGPT Voice) */}
        <div
          className={`absolute inset-0 opacity-75 mix-blend-overlay filter blur-md pointer-events-none ${
            isSpeaking || isThinking ? "animate-nebula-spin" : ""
          }`}
          style={{
            background:
              "radial-gradient(ellipse at 70% 65%, rgba(255, 255, 255, 0.95) 0%, rgba(186, 230, 253, 0.7) 35%, rgba(59, 130, 246, 0.4) 65%, transparent 100%)",
          }}
        />

        {/* Specular curved light sheen on top-left quadrant */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 35% 22%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.35) 28%, transparent 55%)",
          }}
        />

        {/* Subtle Ambient Vignette along rim for 3D depth */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: "inset 0 0 25px rgba(30, 58, 138, 0.5)",
          }}
        />
      </div>
    </div>
  );
}
