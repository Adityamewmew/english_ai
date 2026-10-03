"use client";

import React, { useState, useRef } from "react";
import { MousePointerClick, Volume2, Info, Sparkles } from "lucide-react";
import { animeButtonPop, animeCardHover, animeCardPulse } from "@/lib/anime-effects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface AnatomySegment {
  text: string;
  role: string;
  roleCode: "SUBJECT" | "VERB" | "COMPLEMENT";
  description: string;
}

interface TheorySentenceAnatomyProps {
  sentence?: string;
  onPlayAudio?: (text: string) => void;
}

export function TheorySentenceAnatomy({
  sentence = "She is from Japan",
  onPlayAudio,
}: TheorySentenceAnatomyProps) {
  // Parse sentence into 3 functional segments safely
  const clean = sentence.replace(/[.!?]/g, "").trim();
  const words = clean.split(/\s+/);

  const segments: AnatomySegment[] = [
    {
      text: words[0] || "She",
      role: "Subjek Kalimat (Subject)",
      roleCode: "SUBJECT",
      description: "Pelaku, orang, atau topik utama yang sedang dibicarakan dalam kalimat.",
    },
    {
      text: words[1] || "is",
      role: "Kata Kerja Penghubung (To Be / Verb)",
      roleCode: "VERB",
      description: "Kata kerja bantu yang menyesuaikan dengan subjek untuk menghubungkan identitas atau keadaan.",
    },
    {
      text: words.slice(2).join(" ") || "from Japan",
      role: "Keterangan / Pelengkap (Complement)",
      roleCode: "COMPLEMENT",
      description: "Informasi penjelas tentang asal negara, profesi, sifat, atau lokasi subjek.",
    },
  ];

  const [activeSegmentIdx, setActiveSegmentIdx] = useState<number>(0);
  const detailCardRef = useRef<HTMLDivElement>(null);

  const handleSegmentClick = (e: React.MouseEvent<HTMLButtonElement>, idx: number, text: string) => {
    animeButtonPop(e.currentTarget);
    setActiveSegmentIdx(idx);
    onPlayAudio?.(text);

    if (detailCardRef.current) {
      animeCardPulse(detailCardRef.current);
    }
  };

  const activeSegment = segments[activeSegmentIdx];

  return (
    <Card
      onMouseEnter={(e) => animeCardHover(e.currentTarget, true)}
      onMouseLeave={(e) => animeCardHover(e.currentTarget, false)}
      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 sm:p-8 md:p-10 shadow-xs space-y-6 rounded-2xl will-change-transform"
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400 font-bold text-xs uppercase tracking-wider">
          <MousePointerClick className="w-4 h-4" />
          <span>Anatomi Kalimat Interaktif (Klik Setiap Balok)</span>
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          Klik balok untuk mendengar pelafalan &amp; fungsinya
        </span>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
        Perhatikan bagaimana setiap bagian kata memainkan peran penting dalam membentuk kalimat utuh:
      </p>

      {/* Clickable Blocks Flow */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-4">
        {segments.map((seg, idx) => {
          const isActive = activeSegmentIdx === idx;

          return (
            <React.Fragment key={idx}>
              <button
                type="button"
                onClick={(e) => handleSegmentClick(e, idx, seg.text)}
                className={`group px-6 py-4 rounded-2xl border transition-all flex flex-col items-center gap-2 cursor-pointer select-none active:scale-95 will-change-transform min-h-[76px] ${
                  isActive
                    ? seg.roleCode === "SUBJECT"
                      ? "bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-300 dark:ring-blue-700 scale-105"
                      : seg.roleCode === "VERB"
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-300 dark:ring-indigo-700 scale-105"
                      : "bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-300 dark:ring-emerald-700 scale-105"
                    : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-violet-400 hover:bg-violet-50/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold font-mono tracking-tight">
                    {seg.text}
                  </span>
                  <Volume2 className={`w-4 h-4 ${isActive ? "text-white/80" : "text-slate-400 group-hover:text-violet-600"}`} />
                </div>
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  size="sm"
                  className={`text-[10px] font-bold px-2 py-0.5 ${isActive ? "bg-white/20 text-white border-transparent" : ""}`}
                >
                  {seg.roleCode}
                </Badge>
              </button>

              {idx < segments.length - 1 && (
                <span className="text-2xl font-black text-slate-300 dark:text-slate-700 select-none px-1">
                  +
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Detail Explanation Callout for Active Block */}
      {activeSegment && (
        <div
          ref={detailCardRef}
          className="p-5 sm:p-6 rounded-2xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/80 dark:border-violet-900/40 flex items-start gap-4 shadow-xs will-change-transform"
        >
          <Info className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-violet-900 dark:text-violet-200 text-sm sm:text-base">
                &ldquo;{activeSegment.text}&rdquo;
              </span>
              <Badge variant="primary" size="sm">
                {activeSegment.role}
              </Badge>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {activeSegment.description}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

// Backward-compatible alias
export const Phase1SentenceAnatomy = TheorySentenceAnatomy;
