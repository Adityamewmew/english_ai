"use client";

import React, { useRef, useEffect } from "react";
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Send,
  Volume2,
  MessageSquare,
  X,
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
      {/* Centered Bottom Floating Voice Dock */}
      <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center pointer-events-none px-4">
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-full shadow-2xl px-5 py-2.5 flex items-center gap-4 sm:gap-6 max-w-xl w-full justify-between">
          {/* Left Info */}
          <div className="flex flex-col text-left max-w-[140px] sm:max-w-[170px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white truncate">Mr. Khoirul</span>
            </div>
            <span className="text-[11px] text-slate-300 truncate mt-0.5">
              {isSpeaking
                ? "Sedang berbicara..."
                : isListening
                ? "Mendengarkan Anda..."
                : isThinking
                ? "Sedang berpikir..."
                : isCalling
                ? "Panggilan aktif"
                : "Tanya Tutor Modul"}
            </span>
          </div>

          {/* Center Voice Orb */}
          <div className="flex-shrink-0 -mt-6 sm:-mt-8">
            <ModuleVoiceOrb
              state={orbState}
              isCalling={isCalling}
              onClick={onToggleCall}
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {isCalling && (
              <button
                type="button"
                onClick={onToggleMic}
                className={`p-2 rounded-full text-xs transition-colors ${
                  isListening
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
                title={isListening ? "Matikan Mic" : "Nyalakan Mic"}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            )}

            {isCalling ? (
              <button
                type="button"
                onClick={onToggleCall}
                className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-md"
                title="Akhiri Panggilan"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            ) : null}

            {/* Manual Chatbot Toggle */}
            <button
              type="button"
              onClick={onToggleChat}
              className={`p-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isChatOpen
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
              title="Buka Chatbot Teks Manual"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Chat Teks</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Chatbot Drawer / Modal (Appears only when user toggles manually) */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-4 sm:right-8 z-50 w-[350px] sm:w-[390px] h-[480px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
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
