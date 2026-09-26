"use client";

import React from "react";
import { X, ChevronRight, PhoneOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface ChatMessage {
  role: "assistant" | "user";
  content: string;
}

interface CallTranscriptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  showSubtitles: boolean;
  onToggleSubtitles: () => void;
  conversationHistory: ChatMessage[];
  callStatus: "idle" | "connecting" | "active" | "evaluating" | "ended";
  onEndCall: () => void;
}

export function CallTranscriptDrawer({
  isOpen,
  onClose,
  showSubtitles,
  onToggleSubtitles,
  conversationHistory,
  callStatus,
  onEndCall,
}: CallTranscriptDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fadeIn">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Drawer Content */}
      <div className="relative w-80 max-w-[85vw] bg-zinc-950 border-r border-zinc-800 p-6 flex flex-col justify-between z-10 shadow-2xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg">
                K
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">Mr. Khoirul</h4>
                <p className="text-[11px] text-zinc-400">AI English Tutor</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-200 border border-zinc-800 transition-all"
            >
              <span>Dashboard Siswa</span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>

            <button
              type="button"
              onClick={() => {
                onToggleSubtitles();
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-200 border border-zinc-800 transition-all text-left"
            >
              <span>Teks Subtitle</span>
              <span className="text-[11px] text-zinc-400">
                {showSubtitles ? "Aktif" : "Nonaktif"}
              </span>
            </button>
          </div>

          {/* Conversation Transcript Log */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Riwayat Percakapan Sesi Ini:
            </p>
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1 text-xs">
              {conversationHistory.length === 0 ? (
                <p className="text-zinc-600 italic text-[11px]">Belum ada pesan terucap.</p>
              ) : (
                conversationHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl ${
                      msg.role === "assistant"
                        ? "bg-zinc-900/90 border border-zinc-800 text-zinc-300"
                        : "bg-blue-950/40 border border-blue-800/40 text-sky-200"
                    }`}
                  >
                    <p className="text-[10px] font-bold text-zinc-400 mb-0.5">
                      {msg.role === "assistant" ? "Mr. Khoirul" : "Anda"}
                    </p>
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800">
          {callStatus === "active" ? (
            <Button
              onClick={() => {
                onClose();
                onEndCall();
              }}
              className="w-full rounded-2xl py-3 text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              Akhiri Panggilan
            </Button>
          ) : (
            <p className="text-center text-[11px] text-zinc-500">
              English AI Tutor • EDDY&apos;S AI
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
