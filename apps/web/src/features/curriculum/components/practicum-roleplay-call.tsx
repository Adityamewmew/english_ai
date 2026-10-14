"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  PhoneCall,
  PhoneOff,
  Mic,
  Square,
  Volume2,
  CheckCircle2,
  MapPin,
  RotateCcw,
  Send,
} from "lucide-react";
import { playPopSound, playSnapSound, playMatchSuccessSound } from "@/lib/sound-fx";
import type { PracticumQuestion } from "./speaking-practicum-stage";

interface PracticumRoleplayCallProps {
  question: PracticumQuestion;
  onComplete: (score: number) => void;
  isCompleted: boolean;
  savedScore?: number;
}

export function PracticumRoleplayCall({
  question,
  onComplete,
  isCompleted,
  savedScore,
}: PracticumRoleplayCallProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeakingTutor, setIsSpeakingTutor] = useState(false);
  const [isRecordingStudent, setIsRecordingStudent] = useState(false);
  const [isPendingSend, setIsPendingSend] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [turnsCount, setTurnsCount] = useState(0);
  const [history, setHistory] = useState<Array<{ role: "assistant" | "user"; text: string }>>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [history, isRecordingStudent, isPendingSend]);

  // Clean up timers & audio on unmount or question change
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [question.id]);

  // TTS audio player
  const playTutorAudio = (text: string, isClosingTurn = false) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsSpeakingTutor(true);
      const audioUrl = `/api/voice/tts?text=${encodeURIComponent(text)}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        setIsSpeakingTutor(false);
        if (isClosingTurn) {
          setTimeout(() => {
            handleEndCall();
          }, 800);
        }
      };
      audio.onerror = () => {
        setIsSpeakingTutor(false);
        if (isClosingTurn) handleEndCall();
      };
      audio.play().catch(() => {
        setIsSpeakingTutor(false);
        if (isClosingTurn) handleEndCall();
      });
    } catch {
      setIsSpeakingTutor(false);
      if (isClosingTurn) handleEndCall();
    }
  };

  // Start Call
  const handleStartCall = () => {
    playPopSound();
    setIsCallActive(true);
    setCallSeconds(0);
    setTurnsCount(0);
    const initialText =
      question.initialGreeting ||
      question.audioPrompt ||
      "Hello! Welcome to our English class. What is your name?";
    setHistory([{ role: "assistant", text: initialText }]);

    timerRef.current = setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);

    playTutorAudio(initialText);
  };

  // End Call & Complete Question
  const handleEndCall = () => {
    playSnapSound();
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    setIsCallActive(false);
    setIsSpeakingTutor(false);
    setIsRecordingStudent(false);
    setIsPendingSend(false);

    // Calculate score based on conversational turns
    const earnedScore = turnsCount >= 2 ? 100 : turnsCount === 1 ? 85 : 75;
    playMatchSuccessSound();
    onComplete(earnedScore);
  };

  // Student Push-to-Talk
  const handleStartTalking = () => {
    if (isSpeakingTutor) {
      if (audioRef.current) audioRef.current.pause();
      setIsSpeakingTutor(false);
    }
    playPopSound();
    setIsRecordingStudent(true);
    setIsPendingSend(false);
    setCurrentTranscript("");

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let text = "";
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setCurrentTranscript(text);
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch {}
    }
  };

  // 1. Student stops speaking and reviews transcript
  const handleStopRecording = () => {
    playSnapSound();
    setIsRecordingStudent(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsPendingSend(true);
  };

  // 2. Student confirms / sends the transcript to AI
  const handleSendStudentTurn = async () => {
    setIsPendingSend(false);
    const studentText = currentTranscript.trim() || "Yes, thank you Mr. Khoirul.";
    const updatedHistory = [...history, { role: "user" as const, text: studentText }];
    const nextTurnCount = turnsCount + 1;
    const isFinalTurn = nextTurnCount >= 2;
    setHistory(updatedHistory);
    setTurnsCount(nextTurnCount);
    setCurrentTranscript("");

    try {
      setIsSpeakingTutor(true);
      const res = await fetch("/api/voice/turn-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: `${question.scenarioContext || "Roleplay"} with ${
            question.characterRole || "Mr. Khoirul"
          }`,
          history: updatedHistory.map((h) => ({ role: h.role, content: h.text })),
          studentMessage: studentText,
        }),
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let replySentence = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data:")) {
              try {
                const parsed = JSON.parse(line.slice(5).trim());
                if (parsed.type === "sentence" && parsed.text) {
                  replySentence += (replySentence ? " " : "") + parsed.text;
                }
              } catch {}
            }
          }
        }

        const finalReply =
          replySentence.trim() ||
          (isFinalTurn
            ? "Great job! Nice meeting you, have a great day!"
            : "That is great! Where are you from?");
        setHistory((prev) => [...prev, { role: "assistant", text: finalReply }]);
        playTutorAudio(finalReply, isFinalTurn);
      } else {
        const fallback = isFinalTurn
          ? "Great job speaking today! Have a wonderful day!"
          : "Nice to meet you! Where are you from?";
        setHistory((prev) => [...prev, { role: "assistant", text: fallback }]);
        playTutorAudio(fallback, isFinalTurn);
      }
    } catch {
      const fallback = isFinalTurn
          ? "Great job speaking today! Have a wonderful day!"
          : "Nice to meet you! Where are you from?";
      setHistory((prev) => [...prev, { role: "assistant", text: fallback }]);
      playTutorAudio(fallback, isFinalTurn);
    }
  };

  // 3. Student cancels current speech and re-records
  const handleCancelAndRerecord = () => {
    setIsPendingSend(false);
    setCurrentTranscript("");
    handleStartTalking();
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Context Scenario Header */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#0D3B66]/10 text-[#0D3B66] dark:bg-[#F4B41A]/10 dark:text-[#F4B41A]">
              <MapPin className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {question.scenarioContext || "Situasi Percakapan Nyata"}
            </span>
          </div>
          {question.characterRole && (
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
              Peran Mr. Khoirul: {question.characterRole}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {question.instruction}
        </p>
      </div>

      {/* Main Call View */}
      {!isCallActive ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-2xs">
          <div className="relative w-28 h-28 mx-auto rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs flex items-center justify-center">
            <Image
              src="/illustrations/tutor/khoirul-waving.png"
              alt="Mr. Khoirul"
              fill
              className="object-contain p-1"
            />
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              Panggilan Suara Bersama Mr. Khoirul
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Percakapan interaktif 3 putaran ramah pemula. Dengarkan sapaan Mr. Khoirul lalu jawab dengan percaya diri.
            </p>
          </div>

          <button
            type="button"
            onClick={handleStartCall}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl btn-skeuo-navy text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 fill-current text-[#F4B41A]" />
            <span>Mulai Telepon Mr. Khoirul</span>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          {/* Active Call Header */}
          <div className="p-4 bg-slate-50/90 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div
                className={`relative w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border-2 overflow-hidden shrink-0 transition-all ${
                  isSpeakingTutor
                    ? "border-[#F4B41A] ring-2 ring-[#F4B41A]/30 scale-102"
                    : isRecordingStudent
                    ? "border-rose-500 ring-2 ring-rose-500/20"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <Image
                  src={
                    isSpeakingTutor
                      ? "/illustrations/tutor/khoirul-talking.png"
                      : "/illustrations/tutor/khoirul-idle.png"
                  }
                  alt="Mr. Khoirul"
                  fill
                  className="object-contain p-0.5"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Mr. Khoirul
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                    {question.characterRole || "Tutor"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 pt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{formatTimer(callSeconds)}</span>
                  <span>·</span>
                  <span>Putaran {Math.min(turnsCount + 1, 3)}/3</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-2 ${
                  isSpeakingTutor
                    ? "bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300"
                    : isRecordingStudent
                    ? "bg-rose-100 text-rose-900 dark:bg-rose-950/70 dark:text-rose-300 animate-pulse"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {isSpeakingTutor ? (
                  <div className="flex items-center gap-0.5 h-3 px-0.5">
                    <span className="w-0.5 bg-[#F4B41A] rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                    <span className="w-0.5 bg-[#F4B41A] rounded-full animate-bounce [animation-delay:-0.15s] h-2" />
                    <span className="w-0.5 bg-[#F4B41A] rounded-full animate-bounce h-3.5" />
                    <span className="w-0.5 bg-[#F4B41A] rounded-full animate-bounce [animation-delay:-0.2s] h-2" />
                  </div>
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {isSpeakingTutor
                    ? "Mr. Khoirul Berbicara"
                    : isRecordingStudent
                    ? "Mendengarkanmu..."
                    : "Giliranmu Menjawab"}
                </span>
              </span>

              <button
                type="button"
                onClick={handleEndCall}
                title="Akhiri Panggilan"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Unified Conversation Feed */}
          <div
            ref={chatScrollRef}
            className="p-5 space-y-3.5 min-h-[180px] max-h-64 overflow-y-auto bg-white dark:bg-slate-900"
          >
            {history.map((turn, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${turn.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {turn.role === "assistant" && (
                  <div className="relative w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700 mt-1">
                    <Image
                      src="/illustrations/tutor/khoirul-talking.png"
                      alt="Mr. Khoirul"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    turn.role === "user"
                      ? "bg-[#0D3B66] text-white rounded-br-xs font-medium shadow-2xs"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs font-medium border border-slate-200/80 dark:border-slate-700/80"
                  }`}
                >
                  <span className="text-[10px] font-mono block opacity-60 mb-0.5">
                    {turn.role === "user" ? "Kamu" : "Mr. Khoirul"}
                  </span>
                  &ldquo;{turn.text}&rdquo;
                </div>
              </div>
            ))}

            {/* Live Student Recording Bubble */}
            {isRecordingStudent && (
              <div className="flex justify-end">
                <div className="max-w-[80%] p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 rounded-br-xs animate-pulse space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase block text-amber-700 dark:text-amber-400">
                    Sedang Merekam Suara...
                  </span>
                  <p className="font-medium italic">
                    {currentTranscript ? `"${currentTranscript}"` : "Bicaralah sekarang..."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Call Controls & Review Bar */}
          <div className="p-4 bg-slate-50/90 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800">
            {isRecordingStudent ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-mono text-rose-600 dark:text-rose-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span>Merekam ucapanmu...</span>
                </div>
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md active:scale-95 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Selesai Bicara</span>
                </button>
              </div>
            ) : isPendingSend ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span>Tinjau ucapanmu sebelum dikirim (bisa kamu edit jika ada kata yang salah):</span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={currentTranscript}
                    onChange={(e) => setCurrentTranscript(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendStudentTurn()}
                    placeholder="Ketik kalimat responmu jika mikrofon salah dengar..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#0D3B66]"
                  />
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={handleSendStudentTurn}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl btn-skeuo-navy text-white text-xs font-black shadow-xs active:scale-95 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Respon</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelAndRerecord}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-bold active:scale-95 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Ulangi</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleStartTalking}
                  disabled={isSpeakingTutor}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-skeuo-yellow text-[#0F172A] text-xs font-black shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Mic className="w-4 h-4 text-[#0D3B66]" />
                  <span>Tekan untuk Balas Bicara</span>
                </button>

                <button
                  type="button"
                  onClick={handleEndCall}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                >
                  Akhiri Panggilan
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completion Banner with Thumbs up Khoirul */}
      {isCompleted && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 shrink-0 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 overflow-hidden flex items-center justify-center">
              <Image
                src="/illustrations/tutor/khoirul-thumbsup.png"
                alt="Mr. Khoirul Thumbs Up"
                fill
                className="object-contain p-0.5"
              />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                Sesi Roleplay Selesai Tuntas!
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                Mr. Khoirul mengapresiasi partisipasi aktifmu dalam percakapan ini.
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-black px-3 py-1 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
            {savedScore ?? 100}%
          </span>
        </div>
      )}
    </div>
  );
}
