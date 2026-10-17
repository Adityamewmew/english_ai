"use client";

import React, { useRef, useEffect } from "react";
import { Send, Square, Sparkles } from "lucide-react";

interface ChatInputDockProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isStreaming: boolean;
  onStop: () => void;
  disabled?: boolean;
}

export const ChatInputDock: React.FC<ChatInputDockProps> = ({
  input,
  setInput,
  onSend,
  isStreaming,
  onStop,
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && input.trim() && !disabled) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 sm:pb-6">
      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl border border-slate-300 shadow-[0_4px_20px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] p-2.5 sm:p-3 transition-all focus-within:border-[#0D3B66] focus-within:ring-2 focus-within:ring-[#0D3B66]/15">
        <div className="flex items-end gap-2">
          {/* Textarea Input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pertanyaan grammar, minta koreksi tulisan, atau ajak Mr. Khoirul berdiskusi..."
            rows={1}
            disabled={disabled}
            className="flex-1 max-h-44 resize-none bg-transparent px-3 py-2 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-hidden leading-relaxed custom-scrollbar"
          />

          {/* Action Button: Stop or Send */}
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              title="Hentikan respon"
              className="btn-skeuo-red px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm font-semibold shrink-0 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" />
              <span className="hidden sm:inline">Hentikan</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onSend}
              disabled={!input.trim() || disabled}
              title="Kirim pesan"
              className={`px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold shrink-0 cursor-pointer transition-all ${
                input.trim() && !disabled
                  ? "btn-skeuo-yellow text-slate-900 shadow-md"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          )}
        </div>

        {/* Security & RAG microcopy */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F4B41A]" />
            <span className="truncate">
              Mr. Khoirul AI didukung RAG Kurikulum &amp; LLM Guardrails (Anti-Injection &amp; PII Safe).
            </span>
          </div>
          <span className="hidden sm:inline shrink-0 font-medium">Shift + Enter untuk baris baru</span>
        </div>
      </div>
    </div>
  );
};
