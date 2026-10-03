"use client";

import React, { useRef, useEffect } from "react";
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Send,
  Volume2,
  X,
  Radio,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { animeButtonPop, animeCardHover } from "@/lib/anime-effects";

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  timestamp?: string;
}

interface ModuleAIAssistantProps {
  isOpen: boolean;
  isCalling: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  moduleTitle: string;
  messages: ChatMessage[];
  inputText: string;
  onInputChange: (val: string) => void;
  onSendMessage: () => void;
  onToggleOpen: () => void;
  onToggleCall: () => void;
  onToggleMic: () => void;
  onPlayAudio: (text: string) => void;
}

export function ModuleAIAssistant({
  isOpen,
  isCalling,
  isSpeaking,
  isListening,
  isThinking,
  moduleTitle,
  messages,
  inputText,
  onInputChange,
  onSendMessage,
  onToggleOpen,
  onToggleCall,
  onToggleMic,
  onPlayAudio,
}: ModuleAIAssistantProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isThinking]);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Pill when closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={(e) => {
            animeButtonPop(e.currentTarget);
            onToggleOpen();
          }}
          className="group flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 will-change-transform"
        >
          <div className="relative">
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
              MK
            </span>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-blue-600 animate-pulse" />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold leading-none">
              <span>Mr. Khoirul</span>
              <Badge variant="primary" className="text-[10px] px-1.5 py-0.2 bg-white/20 font-normal">
                AI Tutor
              </Badge>
            </div>
            <span className="text-[11px] text-blue-100/90 font-medium">
              Tanya seputar materi modul
            </span>
          </div>

          <PhoneCall className="w-4 h-4 ml-1 text-blue-200 group-hover:text-white" />
        </button>
      )}

      {/* Expanded Assistant Card */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow">
                  MK
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-900" />
              </div>

              <div className="max-w-[200px]">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white leading-tight">Mr. Khoirul</h4>
                  <Badge variant="primary" className="text-[10px] text-blue-300 font-medium bg-blue-900/60 px-1">
                    Tutor Modul
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{moduleTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Call Mode Toggle */}
              <Button
                variant={isCalling ? "destructive" : "primary"}
                size="sm"
                onClick={(e) => {
                  animeButtonPop(e.currentTarget);
                  onToggleCall();
                }}
                className="gap-1.5 text-xs will-change-transform"
                title={isCalling ? "Akhiri Percakapan Suara" : "Mulai Percakapan Suara"}
              >
                {isCalling ? (
                  <>
                    <PhoneOff className="w-3.5 h-3.5" />
                    <span>Tutup</span>
                  </>
                ) : (
                  <>
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </>
                )}
              </Button>

              {/* Minimize */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  animeButtonPop(e.currentTarget);
                  onToggleOpen();
                }}
                className="min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                title="Sembunyikan"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active Call Mode Status Banner */}
          {isCalling && (
            <div className="p-2.5 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-blue-900/40 text-white flex items-center justify-between text-xs px-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-semibold text-[11px]">
                  {isSpeaking
                    ? "Mr. Khoirul sedang berbicara..."
                    : isListening
                    ? "Mendengarkan Anda..."
                    : isThinking
                    ? "Sedang berpikir..."
                    : "Panggilan Suara Aktif"}
                </span>
              </div>
              <Badge variant="success" className="text-[10px]">
                Live
              </Badge>
            </div>
          )}

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
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 text-xs w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                <span>Mr. Khoirul sedang merespons...</span>
              </div>
            )}
          </div>

          {/* Footer Input Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 flex-shrink-0">
            <Button
              variant={isListening ? "destructive" : "secondary"}
              size="icon"
              onClick={(e) => {
                animeButtonPop(e.currentTarget);
                onToggleMic();
              }}
              className="h-9 w-9 rounded-xl will-change-transform shrink-0"
              title={isListening ? "Berhenti mendengarkan" : "Bicara lewat mikrofon"}
            >
              {isListening ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
            </Button>

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
              placeholder="Ketik pertanyaan seputar materi..."
              className="flex-1 text-xs"
            />

            <Button
              size="icon"
              disabled={!inputText.trim() || isThinking}
              onClick={(e) => {
                animeButtonPop(e.currentTarget);
                onSendMessage();
              }}
              className="h-9 w-9 rounded-xl will-change-transform shrink-0"
              title="Kirim pesan"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
