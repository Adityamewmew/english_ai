"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PhoneOff,
  RefreshCw,
  Clock,
  ArrowRight,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCallDuration } from "@/lib/call-utils";
import { ChatMessage } from "./CallTranscriptDrawer";

export interface CallEvaluationModalProps {
  duration: number;
  conversationHistory?: ChatMessage[];
  onNewCall: () => void;
  evaluation?: any;
  isLoading?: boolean;
  isShortCall?: boolean;
  onPlayAudio?: (text: string) => void;
}

export function CallEvaluationModal({
  duration,
  conversationHistory = [],
  onNewCall,
}: CallEvaluationModalProps) {
  const [showTranscript, setShowTranscript] = useState(true);

  // Keyboard Escape listener to dismiss/reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onNewCall();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNewCall]);

  const studentTurnCount = conversationHistory.filter(
    (m) => m.role === "user"
  ).length;

  return (
    <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-7 space-y-5 text-white shadow-xl animate-fadeIn max-h-[88vh] overflow-y-auto custom-scrollbar">
      {/* Top Header */}
      <div className="text-center space-y-2 border-b border-zinc-800/80 pb-5">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400 shadow-inner">
          <PhoneOff className="w-5 h-5 text-zinc-300" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Panggilan Selesai
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Sesi Praktik Percakapan Bebas bersama Mr. Khoirul telah berakhir.
          </p>
        </div>

        {/* Stats: Durasi & Putaran */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              Durasi: <strong className="text-white">{formatCallDuration(duration)}</strong>
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300">
            <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              <strong className="text-white">{studentTurnCount}</strong> kali berbicara
            </span>
          </div>
        </div>

        {/* Short Call Notice (< 60s) */}
        {duration < 60 && (
          <div className="mt-3 p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-200/90 text-left flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Panggilan berlangsung di bawah 1 menit sehingga skor CEFR belum dapat dihitung secara akurat. Lakukan percakapan minimal 2 menit untuk mendapatkan rubrik evaluasi lengkap.
            </span>
          </div>
        )}
      </div>

      {/* Transkrip Percakapan */}
      {conversationHistory.length > 0 && (
        <div className="border border-zinc-800/80 rounded-2xl overflow-hidden bg-zinc-900/40">
          <button
            type="button"
            onClick={() => setShowTranscript((prev) => !prev)}
            className="w-full px-4 py-3 bg-zinc-900/70 hover:bg-zinc-900 flex items-center justify-between text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>Transkrip Percakapan ({conversationHistory.length} Putaran)</span>
            </div>
            {showTranscript ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {showTranscript && (
            <div className="p-4 space-y-3 bg-zinc-950 max-h-60 overflow-y-auto custom-scrollbar border-t border-zinc-800/80">
              {conversationHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`text-xs space-y-1 ${
                    item.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                    {item.role === "user" ? "Kamu" : "Mr. Khoirul"}
                  </span>
                  <div
                    className={`inline-block p-2.5 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                      item.role === "user"
                        ? "bg-blue-600 text-white text-left"
                        : "bg-zinc-800 text-zinc-200 text-left border border-zinc-700/50"
                    }`}
                  >
                    {item.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2.5 pt-1">
        <Button
          onClick={onNewCall}
          className="flex-1 bg-white hover:bg-zinc-200 text-black font-bold text-xs py-3 rounded-2xl shadow-lg transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Panggilan Baru
        </Button>
        <Link href="/dashboard" className="flex-1">
          <Button
            variant="outline"
            className="w-full text-xs py-3 text-zinc-300 border-zinc-800 hover:bg-zinc-900 rounded-2xl flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Ke Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
