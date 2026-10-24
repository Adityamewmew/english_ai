"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, PhoneCall, Award, MoreHorizontal } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

interface StudentProgressCardsProps {
  currentCefr?: string;
  totalCompletedModules: number;
  totalModules: number;
  placementScore?: number;
  placementCefr?: string;
  voiceCallsCount?: number;
  voiceTotalMinutes?: number;
}

export function StudentProgressCards({
  currentCefr = "A1.1",
  totalCompletedModules = 0,
  totalModules = 0,
  placementScore,
  placementCefr,
  voiceCallsCount = 0,
  voiceTotalMinutes = 0,
}: StudentProgressCardsProps) {
  const moduleProgressPercent =
    totalModules > 0
      ? Math.min(100, Math.round((totalCompletedModules / totalModules) * 100))
      : 0;

  const cards = [
    {
      id: "curriculum",
      accentColor: "#0D3B66",
      accentBg: "bg-[#0D3B66]/10",
      accentText: "text-[#0D3B66]",
      iconBg: "bg-[#0D3B66] text-white",
      progressBar: "#0D3B66",
      icon: BookOpen,
      title: `CEFR ${currentCefr} Progression`,
      subtitle: `${totalCompletedModules} of ${totalModules} Modules Completed`,
      progress: moduleProgressPercent,
      href: "/modules",
    },
    {
      id: "speaking",
      accentColor: "#F4B41A",
      accentBg: "bg-[#F4B41A]/15",
      accentText: "text-[#0F172A]",
      iconBg: "bg-[#F4B41A] text-[#0F172A]",
      progressBar: "#F4B41A",
      icon: PhoneCall,
      title: "AI Speaking Reflexes",
      subtitle:
        voiceCallsCount > 0
          ? `${voiceCallsCount} Sessions Completed • ${voiceTotalMinutes}m Practice`
          : "No Sessions Yet • Start Now",
      progress: voiceCallsCount > 0 ? Math.min(100, voiceCallsCount * 25) : 0,
      href: "/call",
    },
    {
      id: "placement",
      accentColor: "#9E1B1B",
      accentBg: "bg-[#9E1B1B]/10",
      accentText: "text-[#9E1B1B]",
      iconBg: "bg-[#9E1B1B] text-white",
      progressBar: "#9E1B1B",
      icon: Award,
      title: "Placement Assessment",
      subtitle: placementCefr ? `Assessed Level: CEFR ${placementCefr}` : "Diagnostic Test Not Taken",
      progress: placementScore ?? 0,
      href: "/placement",
    },
  ];

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg sm:text-xl font-black text-[#0D3B66] dark:text-white uppercase tracking-tight">
          Your progress
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.id}
              href={card.href}
              onClick={(e) => animeButtonPop(e.currentTarget)}
              className="p-5 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 border-b-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-5 group cursor-pointer"
            >
              {/* Top Row: Icon Badge + More */}
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-2xl ${card.iconBg} shadow-2xs flex items-center justify-center border-b-2 border-black/10`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  aria-hidden="true"
                  className="p-1 text-slate-400 group-hover:text-[#0D3B66] transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug group-hover:text-[#0D3B66] transition-colors">
                  {card.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium">{card.subtitle}</p>
              </div>

              {/* Progress Bar & Percentage */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${card.progress}%`,
                      backgroundColor: card.progressBar,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 font-mono">
                  <span>Progress</span>
                  <span className="text-slate-800 dark:text-slate-200">{card.progress}%</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
