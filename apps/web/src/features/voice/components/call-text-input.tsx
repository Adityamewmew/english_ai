"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";

interface CallTextInputProps {
  disabled?: boolean;
  onSend: (text: string) => void;
}

export function CallTextInput({ disabled = false, onSend }: CallTextInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean || disabled) return;
    setText("");
    onSend(clean);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xs sm:max-w-sm flex items-center gap-2 mt-2 sm:mt-3 animate-fadeIn"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a response if microphone is noisy..."
        className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#0D3B66] focus:bg-white rounded-full px-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-inner"
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="px-4 py-2 btn-skeuo-yellow disabled:opacity-40 text-slate-950 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shadow-sm"
      >
        <span>Send</span>
        <Send className="w-3 h-3 ml-0.5" />
      </button>
    </form>
  );
}

