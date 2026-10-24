"use client";

import React from "react";
import Link from "next/link";
import { PhoneCall, MessageSquare, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";

export interface ActivityItem {
  id: string;
  type: "voice" | "chat" | "module";
  title: string;
  subtitle: string;
  badgeText: string;
  badgeColor: string;
  dateText: string;
  scoreText?: string;
  href: string;
  actionText: string;
}

interface StudentRecentActivityProps {
  voiceSessions?: any[];
  chatSessions?: any[];
  completedModules?: any[];
}

export function StudentRecentActivitySection({
  voiceSessions = [],
  chatSessions = [],
  completedModules = [],
}: StudentRecentActivityProps) {
  const activities: ActivityItem[] = [];

  // 1. Map recent voice calls
  voiceSessions.slice(0, 3).forEach((call) => {
    const mins = Math.max(1, Math.round((call.durationSeconds || 60) / 60));
    const fluency = call.evaluation?.fluency ? `${call.evaluation.fluency}% Fluency` : undefined;
    const dateFormatted = call.createdAt
      ? new Date(call.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" })
      : "Just now";

    activities.push({
      id: "voice-" + call.id,
      type: "voice",
      title: call.topic || "Daily Conversation Practice",
      subtitle: call.evaluation?.feedback_id || `${mins}-minute speaking session with Mr. Khoirul.`,
      badgeText: "Voice Call",
      badgeColor: "bg-[#F4B41A]/20 text-[#854D0E] border-[#F4B41A]/40",
      dateText: dateFormatted,
      scoreText: fluency,
      href: "/call",
      actionText: "Call Again",
    });
  });

  // 2. Map recent chat sessions
  chatSessions.slice(0, 3).forEach((chat) => {
    const dateFormatted = chat.updatedAt
      ? new Date(chat.updatedAt).toLocaleDateString("en-US", { day: "numeric", month: "short" })
      : "Just now";

    activities.push({
      id: "chat-" + chat.id,
      type: "chat",
      title: chat.title || "English Q&A",
      subtitle: "Grammar and vocabulary discussion with Mr. Khoirul.",
      badgeText: "Study Chat",
      badgeColor: "bg-[#0D3B66]/10 text-[#0D3B66] border-[#0D3B66]/20",
      dateText: dateFormatted,
      href: "/chat",
      actionText: "Open Chat",
    });
  });

  // 3. Map completed modules
  completedModules.slice(0, 3).forEach((mod) => {
    const dateFormatted = mod.completedAt
      ? new Date(mod.completedAt).toLocaleDateString("en-US", { day: "numeric", month: "short" })
      : "Completed";

    activities.push({
      id: "mod-" + mod.id,
      type: "module",
      title: mod.title,
      subtitle: `CEFR Level ${mod.cefr || "A1"} module completed.`,
      badgeText: "Module Completed",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      dateText: dateFormatted,
      scoreText: mod.score !== null && mod.score !== undefined ? `Score: ${mod.score}%` : "Passed",
      href: `/modules/${mod.id}`,
      actionText: "Review Module",
    });
  });

  const displayList = activities.slice(0, 4);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg sm:text-xl font-black text-[#0D3B66] dark:text-white uppercase tracking-tight">
          Recent Learning Activities
        </h3>
      </div>

      {displayList.length === 0 ? (
        /* Empty State with Mr. Khoirul Guidance */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[22px] p-6 sm:p-8 text-center space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-[#F4B41A]/50 flex items-center justify-center mx-auto text-[#0D3B66]">
            <Sparkles className="w-6 h-6 text-[#F4B41A]" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
              No recent activities yet
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              Complete your first module or start a conversation with Mr. Khoirul to track your learning progress here.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              href="/modules"
              onClick={(e) => animeButtonPop(e.currentTarget)}
              className="px-5 py-2.5 rounded-full btn-skeuo-navy text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Explore Modules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/call"
              onClick={(e) => animeButtonPop(e.currentTarget)}
              className="px-5 py-2.5 rounded-full btn-skeuo-yellow text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Try Voice Call</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Dynamic Activity Feed */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayList.map((item) => {
            const Icon =
              item.type === "voice"
                ? PhoneCall
                : item.type === "chat"
                ? MessageSquare
                : CheckCircle2;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => animeButtonPop(e.currentTarget)}
                className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 border-b-2 rounded-[22px] p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer"
              >
                {/* Header row: Badge, Score, Date */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}
                  >
                    {item.badgeText}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    {item.scoreText && (
                      <span className="text-emerald-800 dark:text-emerald-400 font-mono text-[11px] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/50">
                        {item.scoreText}
                      </span>
                    )}
                    <span className="text-slate-400 text-[11px] font-medium">{item.dateText}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5 text-[#0D3B66] dark:text-[#F4B41A]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#0D3B66] dark:group-hover:text-[#F4B41A] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer action link */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-[#0D3B66] dark:group-hover:text-[#F4B41A] transition-colors">
                  <span>{item.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
