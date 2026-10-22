"use client";

import React from "react";
import Link from "next/link";
import { Zap, AlertTriangle, Sparkles, Clock, MessageSquare } from "lucide-react";
import { useAiQuota } from "../hooks/use-classes";

interface AiQuotaBadgeProps {
  userId?: string;
  variant?: "chat" | "voice" | "compact";
  showUpgradeLink?: boolean;
}

export function AiQuotaBadge({
  userId,
  variant = "chat",
  showUpgradeLink = true,
}: AiQuotaBadgeProps) {
  const { data: quota, isLoading } = useAiQuota(userId);

  if (isLoading || !quota) return null;

  const isChatNearLimit =
    quota.chat.limit !== -1 && quota.chat.used >= quota.chat.limit * 0.8;
  const isVoiceNearLimit =
    quota.voice.limitMinutes !== -1 &&
    quota.voice.usedMinutes >= quota.voice.limitMinutes * 0.8;

  const isExceeded =
    variant === "voice" ? quota.voice.isExceeded : quota.chat.isExceeded;
  const isNearLimit = variant === "voice" ? isVoiceNearLimit : isChatNearLimit;

  const tierBadgeColors: Record<string, string> = {
    ultra: "bg-amber-100 text-amber-900 border-amber-300",
    pro: "bg-indigo-100 text-indigo-900 border-indigo-200",
    basic: "bg-slate-100 text-slate-800 border-slate-200",
    trial: "bg-orange-100 text-orange-800 border-orange-200",
    admin: "bg-emerald-100 text-emerald-900 border-emerald-300",
  };

  const badgeColor = tierBadgeColors[quota.tier] || tierBadgeColors.basic;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
          isExceeded
            ? "bg-rose-50 text-rose-800 border-rose-300 shadow-2xs"
            : isNearLimit
            ? "bg-amber-50 text-amber-900 border-amber-300 shadow-2xs"
            : `${badgeColor} shadow-2xs`
        }`}
        title={`Status Kuota AI Harian (${quota.usageDate}): ${quota.tierName}`}
      >
        {isExceeded ? (
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        ) : quota.tier === "ultra" || quota.tier === "admin" ? (
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        ) : (
          <Zap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        )}

        <span className="uppercase text-[10px] font-black tracking-wider">
          {quota.tier}
        </span>

        <span className="text-slate-300">•</span>

        {variant === "chat" ? (
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3 opacity-60 inline" />
            {quota.chat.limit === -1
              ? "Chat Unlimited"
              : `${quota.chat.used}/${quota.chat.limit} chat`}
          </span>
        ) : variant === "voice" ? (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 opacity-60 inline" />
            {quota.voice.limitMinutes === -1
              ? "Voice Unlimited"
              : `${quota.voice.usedMinutes}/${quota.voice.limitMinutes} mnt`}
          </span>
        ) : (
          <span>
            {quota.chat.limit === -1
              ? "∞"
              : `${quota.chat.used}/${quota.chat.limit}c`}{" "}
            |{" "}
            {quota.voice.limitMinutes === -1
              ? "∞"
              : `${quota.voice.usedMinutes}/${quota.voice.limitMinutes}m`}
          </span>
        )}
      </div>

      {showUpgradeLink && quota.tier !== "ultra" && quota.tier !== "admin" && (
        <Link
          href="/curriculum"
          className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 shrink-0 hidden sm:inline"
        >
          {isExceeded ? "Upgrade Paket" : "Upgrade"}
        </Link>
      )}
    </div>
  );
}
