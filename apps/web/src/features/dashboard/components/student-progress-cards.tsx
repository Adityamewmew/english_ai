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
}

export function StudentProgressCards({
  currentCefr = "A1.1",
  totalCompletedModules = 0,
  totalModules = 10,
  placementScore,
  placementCefr,
}: StudentProgressCardsProps) {
  const moduleProgressPercent =
    totalModules > 0
      ? Math.min(100, Math.round((totalCompletedModules / totalModules) * 100))
      : 0;

  const cards = [
    {
      id: "curriculum",
      bgColor: "#d5d8fb",
      borderColor: "#c1c7f8",
      textColor: "#0f172a",
      progressBg: "rgba(15, 23, 42, 0.15)",
      progressBar: "#0f172a",
      icon: BookOpen,
      title: `CEFR ${currentCefr} Progression`,
      subtitle: `${totalCompletedModules} of ${totalModules} Modules Completed`,
      progress: moduleProgressPercent,
      href: "/modules",
    },
    {
      id: "speaking",
      bgColor: "#f8b874",
      borderColor: "#f4a652",
      textColor: "#1c1917",
      progressBg: "rgba(28, 25, 23, 0.15)",
      progressBar: "#1c1917",
      icon: PhoneCall,
      title: "AI Speaking Reflexes",
      subtitle: "Live Voice Call with Mr. Khoirul",
      progress: Math.max(15, Math.min(100, (placementScore || 40) - 10)),
      href: "/call",
    },
    {
      id: "placement",
      bgColor: "#f98abf",
      borderColor: "#f76fae",
      textColor: "#1c1917",
      progressBg: "rgba(28, 25, 23, 0.15)",
      progressBar: "#1c1917",
      icon: Award,
      title: "Placement Assessment",
      subtitle: placementCefr ? `Assessed Level: ${placementCefr}` : "CEFR Diagnostic Test",
      progress: placementScore ?? 0,
      href: "/placement",
    },
  ];

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
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
              style={{
                backgroundColor: card.bgColor,
                borderColor: card.borderColor,
                color: card.textColor,
              }}
              className="p-5 rounded-[26px] border shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-5 group cursor-pointer"
            >
              {/* Top Row: Icon Badge + More */}
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-2xs flex items-center justify-center">
                  <Icon className="w-5 h-5 text-slate-900" />
                </div>
                <button
                  type="button"
                  aria-label="Options"
                  className="text-slate-900/60 hover:text-slate-900 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-0.5">
                <h4 className="font-black text-sm sm:text-base leading-snug group-hover:translate-x-0.5 transition-transform">
                  {card.title}
                </h4>
                <p className="text-[11px] font-bold opacity-80">{card.subtitle}</p>
              </div>

              {/* Progress Bar & Percentage */}
              <div className="space-y-1.5 pt-1">
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: card.progressBg }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${card.progress}%`,
                      backgroundColor: card.progressBar,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-black font-mono">
                  <span>Progress</span>
                  <span>{card.progress}%</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
