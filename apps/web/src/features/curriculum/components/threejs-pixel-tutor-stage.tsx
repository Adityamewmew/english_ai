"use client";

import React from "react";
import Image from "next/image";

export type TutorPose = "idle" | "waving" | "talking" | "thumbsup";

interface ThreejsPixelTutorStageProps {
  pose?: TutorPose;
  isSpeaking?: boolean;
  className?: string;
}

const POSE_TEXTURES: Record<TutorPose, string> = {
  idle: "/illustrations/tutor/khoirul-idle.png",
  waving: "/illustrations/tutor/khoirul-waving.png",
  talking: "/illustrations/tutor/khoirul-talking.png",
  thumbsup: "/illustrations/tutor/khoirul-thumbsup.png",
};

export function ThreejsPixelTutorStage({
  pose = "idle",
  isSpeaking = false,
  className = "w-full h-72 sm:h-80 md:h-[340px]",
}: ThreejsPixelTutorStageProps) {
  const imgSrc = POSE_TEXTURES[pose] || POSE_TEXTURES.idle;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {/* Organic Brand Glow Background */}
      <div className="absolute w-48 h-48 rounded-full bg-[#F4B41A]/20 blur-3xl pointer-events-none" />

      {/* Native Animated Sprite */}
      <div
        className={`relative z-10 w-48 sm:w-56 md:w-64 h-48 sm:h-56 md:h-64 transition-transform duration-300 ${
          isSpeaking ? "animate-pulse scale-105" : "hover:scale-102"
        }`}
      >
        <Image
          src={imgSrc}
          alt={`Mr. Khoirul (${pose})`}
          fill
          sizes="(max-width: 768px) 224px, 256px"
          className="object-contain drop-shadow-md select-none pointer-events-none"
          priority
        />
      </div>
    </div>
  );
}
