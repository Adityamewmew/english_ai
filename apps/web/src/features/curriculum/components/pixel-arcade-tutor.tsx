"use client";

import React, { useState } from "react";
import { playPopSound, playMatchSuccessSound } from "@/lib/sound-fx";
import { Sparkles } from "lucide-react";

export type PixelPersona = "khoirul" | "maya";

interface PixelArcadeTutorProps {
  persona: PixelPersona;
  isSpeaking?: boolean;
  isCelebrating?: boolean;
  onCharacterClick?: () => void;
  className?: string;
}

export function PixelArcadeTutor({
  persona = "khoirul",
  isSpeaking = false,
  isCelebrating = false,
  onCharacterClick,
  className = "w-28 sm:w-32",
}: PixelArcadeTutorProps) {
  const [isHopping, setIsHopping] = useState(false);

  const isKhoirul = persona === "khoirul";
  const spriteSrc = isKhoirul
    ? "/illustrations/pixel-khoirul.png"
    : "/illustrations/pixel-maya.png";
  const tutorName = isKhoirul ? "Mr. Khoirul" : "Ms. Maya";
  const playerTag = isKhoirul ? "P1" : "P2";

  const handleHop = () => {
    playPopSound();
    setIsHopping(true);
    setTimeout(() => setIsHopping(false), 500);
    onCharacterClick?.();
  };

  return (
    <div className={`relative flex flex-col items-center select-none group cursor-pointer ${className}`}>
      {/* Player Arcade Tag */}
      <div className="mb-1 flex items-center gap-1">
        <span
          className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-black uppercase tracking-wider border shadow-2xs ${
            isKhoirul
              ? "bg-[#0D3B66] text-white border-[#082542]"
              : "bg-[#9E1B1B] text-white border-[#841515]"
          }`}
        >
          {playerTag}
        </span>
        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono">
          {tutorName}
        </span>
      </div>

      {/* Character Sprite Stage */}
      <div
        onClick={handleHop}
        className={`relative flex items-center justify-center transition-transform duration-200 ${
          isCelebrating
            ? "animate-bounce"
            : isSpeaking
            ? "animate-pulse"
            : isHopping
            ? "-translate-y-2 scale-105"
            : "hover:-translate-y-1 hover:scale-102"
        }`}
      >
        {/* Floating Speaking Pulse Halo */}
        {isSpeaking && (
          <div
            className={`absolute -inset-2 rounded-full blur-md opacity-40 animate-ping pointer-events-none ${
              isKhoirul ? "bg-[#0D3B66]" : "bg-[#9E1B1B]"
            }`}
          />
        )}

        {/* 16-Bit Pixel Art Sprite Image */}
        <div className="relative w-24 h-36 sm:w-28 sm:h-40 flex items-center justify-center">
          <img
            src={spriteSrc}
            alt={tutorName}
            className="w-full h-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] [image-rendering:pixelated] [image-rendering:-moz-crisp-edges] [image-rendering:crisp-edges] transition-all"
            draggable={false}
          />

          {/* Micro Speech Wave Indicator when speaking */}
          {isSpeaking && (
            <div className="absolute -top-1 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-900/90 text-white text-[9px] font-mono border border-white/20 shadow-xs">
              <span className="w-1 h-2 bg-[#F4B41A] rounded-full animate-bounce" />
              <span className="w-1 h-3 bg-[#F4B41A] rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1 h-1.5 bg-[#F4B41A] rounded-full animate-bounce [animation-delay:0.3s]" />
            </div>
          )}
        </div>
      </div>

      {/* Retro Arcade Pedestal Shadow */}
      <div className="relative -mt-2 flex flex-col items-center">
        {/* Drop Shadow Ellipse */}
        <div className="w-16 sm:w-20 h-3 rounded-[100%] bg-slate-900/20 dark:bg-black/40 blur-[1px] transition-all" />

        {/* Arcade Neon Ring */}
        <div
          className={`w-14 sm:w-16 h-1 rounded-full mt-0.5 transition-all ${
            isKhoirul
              ? "bg-[#0D3B66]/80 shadow-[0_0_8px_rgba(13,59,102,0.6)]"
              : "bg-[#9E1B1B]/80 shadow-[0_0_8px_rgba(158,27,27,0.6)]"
          }`}
        />
      </div>
    </div>
  );
}
