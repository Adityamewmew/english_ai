"use client";

import React, { useRef, useEffect } from "react";
import {
  PhoneOff,
  Mic,
  MicOff,
  Send,
  Volume2,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ModuleVoiceOrb } from "./ModuleVoiceOrb";
import { ChatMessage } from "./ModuleAIAssistant";

interface ModuleVoiceDockProps {
  moduleTitle: string;
  isCalling: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  isChatOpen: boolean;
  messages: ChatMessage[];
  inputText: string;
  onInputChange: (val: string) => void;
  onSendMessage: () => void;
  onToggleCall: () => void;
  onToggleMic: () => void;
  onToggleChat: () => void;
  onPlayAudio: (text: string) => void;
  onBack?: () => void;
  backLabel?: string;
  onForward?: () => void;
  forwardLabel?: string;
  phaseBadge?: string;
}

export function ModuleVoiceDock({
  moduleTitle,
  isCalling,
  isSpeaking,
  isListening,
  isThinking,
  isChatOpen,
  messages,
  inputText,
  onInputChange,
  onSendMessage,
  onToggleCall,
  onToggleMic,
  onToggleChat,
  onPlayAudio,
  onBack,
  backLabel = "Kembali ke Atas (Teori)",
  onForward,
  forwardLabel = "Lanjut ke Praktikum",
}: ModuleVoiceDockProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && isChatOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isChatOpen, isThinking]);

  const orbState: "idle" | "connecting" | "speaking" | "listening" | "thinking" = isCalling
    ? isSpeaking
      ? "speaking"
      : isListening
      ? "listening"
      : isThinking
      ? "thinking"
      : "connecting"
    : "idle";

  return (
    <>
      {/* Unified Bottom Footer Navigation Bar with Centered Voice Orb */}
      <footer className="sticky bottom-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg py-2">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between gap-2 sm:gap-4">
          {/* Sisi Kiri: Tombol Navigasi Kembali */}
          <div className="flex items-center min-w-[100px] sm:min-w-[150px]">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{backLabel}</span>
                <span className="sm:hidden">Kembali</span>
              </button>
            )}
          </div>

          {/* Bagian Tengah: Voice Orb Mr. Khoirul & Call Controls */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-1 max-w-[280px]">
            {/* Tombol Mute / Unmute Mic (Muncul Mengapit saat Panggilan Aktif) */}
            {isCalling && (
              <button
                type="button"
                onClick={onToggleMic}
                className={`p-2 rounded-full transition-all shadow-sm ${
                  isListening
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-400/50"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700"
                }`}
                title={isListening ? "Matikan Mic" : "Nyalakan Mic"}
              >
                {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Glowing Voice Orb */}
            <div className="relative -my-3 sm:-my-4 flex flex-col items-center">
              <ModuleVoiceOrb
                state={orbState}
                isCalling={isCalling}
                size="sm"
                onClick={onToggleCall}
              />
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isCalling ? "bg-emerald-500 animate-ping" : "bg-blue-500"
                  }`}
                />
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {isSpeaking
                    ? "Mr. Khoirul bicara..."
                    : isListening
                    ? "Mendengarkan..."
                    : isThinking
                    ? "Berpikir..."
                    : isCalling
                    ? "Panggilan aktif"
                    : "Tanya Tutor"}
                </span>
              </div>
            </div>

            {/* Tombol Akhiri Panggilan (Muncul Mengapit saat Panggilan Aktif) */}
            {isCalling && (
              <button
                type="button"
                onClick={onToggleCall}
                className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-all shadow-md active:scale-95"
                title="Akhiri Panggilan"
              >
                <PhoneOff className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sisi Kanan: Chat Teks & Tombol Navigasi Lanjut */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 min-w-[100px] sm:min-w-[150px]">
            <button
              type="button"
              onClick={onToggleChat}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isChatOpen
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
              title="Buka Chatbot Teks"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Chat Teks</span>
            </button>

            {onForward && (
              <button
                type="button"
                onClick={onForward}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors whitespace-nowrap"
              >
                <span>{forwardLabel}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Manual Chatbot Drawer / Modal (Muncul saat tombol Chat Teks diklik) */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-4 sm:right-8 z-50 w-[340px] sm:w-[380px] h-[460px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white">Chat Tutor • Mr. Khoirul</h4>
                <span className="text-[10px] text-blue-300 font-medium bg-blue-900/60 px-1.5 py-0.2 rounded">
                  Modul
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-[240px] mt-0.5">
                {moduleTitle}
              </p>
            </div>

            <button
              type="button"
              onClick={onToggleChat}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Tutup Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((msg) => {
              const isAssistant = msg.role === "assistant";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                      isAssistant
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/80 dark:border-slate-700/60"
                        : "bg-blue-600 text-white rounded-tr-none shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-slate-400">
                    <span>{isAssistant ? "Mr. Khoirul" : "Anda"}</span>
                    {msg.timestamp && <span>• {msg.timestamp}</span>}
                    {isAssistant && (
                      <button
                        type="button"
                        onClick={() => onPlayAudio(msg.text)}
                        className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 ml-1 p-0.5"
                        title="Dengarkan suara"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                <span>Mr. Khoirul sedang merespons...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 flex-shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              placeholder="Ketik pertanyaan untuk Mr. Khoirul..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <button
              type="button"
              disabled={!inputText.trim() || isThinking}
              onClick={onSendMessage}
              className={`p-2.5 rounded-xl font-bold transition-colors ${
                inputText.trim() && !isThinking
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              }`}
              title="Kirim pesan"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
