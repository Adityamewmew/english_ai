"use client";

import React, { useState } from "react";
import { PhoneOff, Mic, MicOff, RefreshCw, Send, Keyboard } from "lucide-react";
import type { CompanionPersona } from "./roaming-types";
import { playPopSound } from "@/lib/sound-fx";

interface CompanionMicroControlsProps {
  persona: CompanionPersona;
  isMuted: boolean;
  onToggleMute: () => void;
  onEndCall: () => void;
  onSwitchPersona: () => void;
  onSubmitText: (text: string) => void;
}

export function CompanionMicroControls({
  persona,
  isMuted,
  onToggleMute,
  onEndCall,
  onSwitchPersona,
  onSubmitText,
}: CompanionMicroControlsProps) {
  const [showTextInput, setShowTextInput] = useState(false);
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    playPopSound();
    onSubmitText(inputText.trim());
    setInputText("");
    setShowTextInput(false);
  };

  return (
    <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
      {/* Quick Text Input Drawer for accessibility / noisy room */}
      {showTextInput && (
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-1 p-1 bg-slate-900/95 border border-white/20 rounded-xl shadow-lg backdrop-blur-md mb-1 animate-in fade-in zoom-in-95 duration-150"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type in English..."
            autoFocus
            className="px-2 py-1 bg-slate-800 text-xs text-white rounded-lg border border-slate-700 focus:outline-none focus:border-blue-400 w-36 sm:w-44"
          />
          <button
            type="submit"
            className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            <Send className="w-3 h-3" />
          </button>
        </form>
      )}

      {/* Floating Action Button Pill */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/90 border border-white/20 backdrop-blur-md shadow-xl text-white">
        {/* End Call Button */}
        <button
          onClick={() => {
            playPopSound();
            onEndCall();
          }}
          title="End voice call and resume roaming"
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-[11px] font-bold font-mono text-white transition-all transform active:scale-95 shadow-md shadow-rose-900/40"
        >
          <PhoneOff className="w-3 h-3" />
          <span>END</span>
        </button>

        {/* Mic Toggle */}
        <button
          onClick={() => {
            playPopSound();
            onToggleMute();
          }}
          title={isMuted ? "Unmute microphone" : "Mute microphone"}
          className={`p-1.5 rounded-full transition-colors ${
            isMuted
              ? "bg-amber-500/30 text-amber-300 hover:bg-amber-500/50"
              : "bg-slate-800 hover:bg-slate-700 text-emerald-400"
          }`}
        >
          {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </button>

        {/* Switch Persona */}
        <button
          onClick={() => {
            playPopSound();
            onSwitchPersona();
          }}
          title={`Switch tutor (currently ${persona === "khoirul" ? "Mr. Khoirul" : "Ms. Maya"})`}
          className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[#F4B41A] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Toggle Keyboard Input */}
        <button
          onClick={() => setShowTextInput((prev) => !prev)}
          title="Type your message instead"
          className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <Keyboard className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
