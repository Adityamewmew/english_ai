"use client";

import React from "react";
import { X, ChevronRight, PhoneOff, BookOpen } from "lucide-react";
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
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />

      {/* Drawer Content */}
      <div
        className="relative w-80 max-w-[85vw] border-r border-[#082542] p-6 flex flex-col justify-between z-10 shadow-2xl text-slate-100"
        style={{
          background: "linear-gradient(180deg, #082542 0%, #0D3B66 100%)",
        }}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4B41A] border border-[#DDA012] flex items-center justify-center font-black text-slate-950 shadow-md">
                K
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">Mr. Khoirul</h4>
                <p className="text-[11px] text-slate-300 font-medium">AI English Tutor</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center justify-between p-3 rounded-2xl bg-[#061e36]/80 hover:bg-[#061e36] text-xs font-semibold text-slate-200 border border-white/10 transition-all shadow-sm"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#F4B41A]" />
                <span>Dashboard Siswa</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <button
              type="button"
              onClick={() => {
                onToggleSubtitles();
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#061e36]/80 hover:bg-[#061e36] text-xs font-semibold text-slate-200 border border-white/10 transition-all shadow-sm text-left"
            >
              <span>Teks Subtitle</span>
              <span className="text-[11px] font-bold text-[#F4B41A]">
                {showSubtitles ? "Aktif" : "Nonaktif"}
              </span>
            </button>
          </div>

          {/* Conversation Transcript Log */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Riwayat Percakapan Sesi Ini:
            </p>
            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {conversationHistory.length === 0 ? (
                <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-center text-slate-400 italic text-[11px]">
                  Belum ada pesan terucap. Bicara dengan Mr. Khoirul untuk memulai!
                </div>
              ) : (
                conversationHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl ${
                      msg.role === "assistant"
                        ? "bg-[#061e36]/90 border border-white/10 text-slate-100"
                        : "bg-[#F4B41A]/15 border border-[#F4B41A]/30 text-amber-100"
                    }`}
                  >
                    <p className="text-[10px] font-black text-[#F4B41A] mb-1">
                      {msg.role === "assistant" ? "Mr. Khoirul" : "Anda"}
                    </p>
                    <p className="leading-relaxed font-medium">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10">
          {callStatus === "active" ? (
            <Button
              onClick={() => {
                onClose();
                onEndCall();
              }}
              className="w-full rounded-2xl py-3 text-xs font-black btn-skeuo-red text-white"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              Akhiri Panggilan & Keluar
            </Button>
          ) : (
            <p className="text-center text-[11px] text-slate-400 font-medium">
              English AI Tutor • EDDY&apos;S AI
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
