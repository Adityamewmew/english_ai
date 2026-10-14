"use client";

import React from "react";
import type { CompanionPersona, CompanionState, CompanionExpression } from "./roaming-types";

interface CompanionSpriteViewProps {
  persona: CompanionPersona;
  state: CompanionState;
  expression: CompanionExpression;
  direction: 1 | -1;
  isWalking: boolean;
  onClick: () => void;
  compact?: boolean;
}

export function CompanionSpriteView({
  persona,
  state,
  expression,
  direction,
  isWalking,
  onClick,
  compact = false,
}: CompanionSpriteViewProps) {
  const isKhoirul = persona === "khoirul";
  const spriteSrc = isKhoirul
    ? "/illustrations/pixel-khoirul.png"
    : "/illustrations/pixel-maya.png";
  const tutorName = isKhoirul ? "Mr. Khoirul" : "Ms. Maya";

  const isSpeaking = state === "speaking";
  const isListening = state === "listening";
  const isThinking = state === "thinking";

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center select-none cursor-pointer group pointer-events-auto"
    >
      {/* Floating Emotion Bubble Badge */}
      <div className="absolute -top-3 z-10 transition-all duration-300">
        {isListening && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-mono font-bold shadow-md animate-pulse">
            <span>🎧</span>
            <span>Listening</span>
          </div>
        )}
        {isThinking && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-mono font-bold shadow-md animate-pulse">
            <span>💭</span>
            <span>Thinking</span>
          </div>
        )}
        {isSpeaking && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500 text-white text-[9px] font-mono font-bold shadow-md animate-bounce">
            <span>💬</span>
            <span>Speaking</span>
          </div>
        )}
        {expression === "happy" && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400 text-slate-900 text-[9px] font-mono font-bold shadow-md animate-bounce">
            <span>⭐</span>
            <span>Awesome!</span>
          </div>
        )}
      </div>

      {/* 1. Outer Container: Direction Flip ONLY */}
      <div
        className="relative transition-transform duration-200"
        style={{
          transform: `scaleX(${direction})`,
        }}
      >
        {/* Glow halo when speaking */}
        {isSpeaking && (
          <div
            className={`absolute -inset-2.5 rounded-full blur-md opacity-50 animate-ping pointer-events-none ${
              isKhoirul ? "bg-[#0D3B66]" : "bg-[#9E1B1B]"
            }`}
          />
        )}

        {/* 2. Inner Container: Walk Stride & Bobbing Animation ONLY */}
        <div
          className={`relative ${
            isWalking
              ? "animate-arcade-walk"
              : isSpeaking
              ? "animate-pulse [animation-duration:0.35s]"
              : isThinking
              ? "hover:-translate-y-0.5"
              : "animate-pixel-idle hover:-translate-y-1"
          }`}
          style={{ transformOrigin: "bottom center" }}
        >
          {/* 16-Bit Pixel Art Sprite */}
          <div
            className={`relative flex items-center justify-center ${
              compact ? "w-14 h-20" : "w-20 h-32 sm:w-24 sm:h-36"
            }`}
          >
            <img
              src={spriteSrc}
              alt={tutorName}
              className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)] [image-rendering:pixelated] [image-rendering:-moz-crisp-edges] [image-rendering:crisp-edges] transition-all"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* Retro Shadow & Pedestal */}
      <div className="relative -mt-2 flex flex-col items-center pointer-events-none">
        <div
          className={`h-2 rounded-[100%] bg-slate-900/35 dark:bg-black/60 blur-[1px] transition-all duration-150 ${
            isWalking ? "animate-arcade-shadow-walk" : ""
          } ${
            compact ? "w-11" : "w-14"
          }`}
        />
        <div
          className={`h-0.5 rounded-full mt-0.5 transition-all ${
            compact ? "w-9" : "w-12"
          } ${
            isKhoirul
              ? "bg-[#0D3B66]/60 shadow-[0_0_8px_rgba(13,59,102,0.6)]"
              : "bg-[#9E1B1B]/60 shadow-[0_0_8px_rgba(158,27,27,0.6)]"
          }`}
        />
      </div>
    </div>
  );
}
