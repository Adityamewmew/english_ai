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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { animeButtonPop, animeCardHover } from "@/lib/anime-effects";

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
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  animeButtonPop(e.currentTarget);
                  onBack();
                }}
                className="gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 will-change-transform"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{backLabel}</span>
                <span className="sm:hidden">Kembali</span>
              </Button>
            )}
          </div>

          {/* Bagian Tengah: Voice Orb Mr. Khoirul & Call Controls */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-1 max-w-[280px]">
            {/* Tombol Mute / Unmute Mic */}
            {isCalling && (
              <Button
                variant={isListening ? "secondary" : "outline"}
                size="icon"
                onClick={(e) => {
                  animeButtonPop(e.currentTarget);
                  onToggleMic();
                }}
                className={`h-9 w-9 rounded-full shadow-sm will-change-transform ${
                  isListening
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-400/50"
                    : "text-slate-400"
                }`}
                title={isListening ? "Matikan Mic" : "Nyalakan Mic"}
              >
                {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </Button>
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

            {/* Tombol Akhiri Panggilan */}
            {isCalling && (
              <Button
                variant="destructive"
                size="icon"
                onClick={(e) => {
                  animeButtonPop(e.currentTarget);
                  onToggleCall();
                }}
                className="h-9 w-9 rounded-full shadow-md will-change-transform"
                title="Akhiri Panggilan"
              >
                <PhoneOff className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Sisi Kanan: Chat Teks & Tombol Navigasi Lanjut */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 min-w-[100px] sm:min-w-[150px]">
            <Button
              variant={isChatOpen ? "primary" : "secondary"}
              size="sm"
              onClick={(e) => {
                animeButtonPop(e.currentTarget);
                onToggleChat();
              }}
              className="gap-1.5 text-xs font-semibold will-change-transform"
              title="Buka Chatbot Teks"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Chat Teks</span>
            </Button>

            {onForward && (
              <Button
                size="sm"
                onClick={(e) => {
                  animeButtonPop(e.currentTarget);
                  onForward();
                }}
                className="gap-1 text-xs font-semibold whitespace-nowrap will-change-transform"
              >
                <span>{forwardLabel}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </footer>

      {/* Manual Chatbot Drawer / Modal */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-4 sm:right-8 z-50 w-[340px] sm:w-[380px] h-[460px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white">Chat Tutor • Mr. Khoirul</h4>
                <Badge variant="primary" className="text-[10px] px-1.5 py-0.2">
                  Modul
                </Badge>
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-[240px] mt-0.5">
                {moduleTitle}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                animeButtonPop(e.currentTarget);
                onToggleChat();
              }}
              className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-800"
              title="Tutup Chat"
            >
              <X className="w-4 h-4" />
            </Button>
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
                        className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 ml-1 p-0.5 cursor-pointer"
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
            <Input
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
              className="flex-1 text-xs"
            />

            <Button
              size="icon"
              disabled={!inputText.trim() || isThinking}
              onClick={(e) => {
                animeButtonPop(e.currentTarget);
                onSendMessage();
              }}
              className="h-9 w-9 shrink-0 will-change-transform"
              title="Kirim pesan"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
