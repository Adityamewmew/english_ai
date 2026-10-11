"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, PhoneCall, ArrowRight, Sparkles } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

interface UpcomingModuleItem {
  id: string;
  title: string;
  cefr: string;
  description?: string;
  status?: string;
}

interface StudentUpcomingMilestonesProps {
  modules?: UpcomingModuleItem[];
}

export function StudentUpcomingMilestones({ modules = [] }: StudentUpcomingMilestonesProps) {
  // Take up to 2 real modules, fallback to known A1 curriculum modules if empty
  const displayModules =
    modules.length > 0
      ? modules.slice(0, 2)
      : [
          {
            id: "A1.1-M02",
            title: "Unit 2: I Feel Happy: Feelings, Adjectives & Questions",
            cefr: "A1.1",
            description: "Learn feelings, physical adjectives, and questions with to be.",
          },
          {
            id: "A1.1-M03",
            title: "Unit 3: Me and My Family: Family Members & Possessives",
            cefr: "A1.1",
            description: "Describe family members, possessive adjectives, and relationships.",
          },
        ];

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
          Upcoming milestones
        </h3>
      </div>

      <div className="space-y-3.5">
        {/* Real Curriculum Modules */}
        {displayModules.map((m) => (
          <div
            key={m.id}
            className="p-5 rounded-[26px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow space-y-3.5"
          >
            {/* Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-mono">
                CEFR {m.cefr}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700">
                Next Module
              </span>
            </div>

            {/* Title & Desc */}
            <div className="space-y-1">
              <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                {m.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                {m.description || "Core CEFR module with interactive grammar, reading, and scored exercises."}
              </p>
            </div>

            {/* Footer with Module Code & Action */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black font-mono text-slate-500">
                {m.id}
              </span>

              <Link
                href={`/modules/${m.id}`}
                onClick={(e) => animeButtonPop(e.currentTarget)}
                className="px-4 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>Open module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}

        {/* Live Speaking AI Call Card */}
        <div className="p-5 rounded-[26px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow space-y-3.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
              Voice AI Call
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700">
              Speaking Lab
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
              Spoken Reflexes with Mr. Khoirul
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Practice answering questions about your background and age in real-time with zero anxiety.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Free AI Session</span>
            </div>

            <Link
              href="/call"
              onClick={(e) => animeButtonPop(e.currentTarget)}
              className="px-4 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>Call now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
