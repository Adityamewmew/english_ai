"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Volume2,
  Mic,
  Square,
  Headphones,
  ArrowRight,
  BookOpen,
  MapPin,
  TrendingUp,
  Check,
  Clock,
} from "lucide-react";
import { playPopSound, playSnapSound, playMatchSuccessSound } from "@/lib/sound-fx";
import { PracticumRoleplayCall } from "./practicum-roleplay-call";
import { PracticumDrillCard } from "./practicum-drill-card";
import { PracticumSummary } from "./practicum-summary";
import { useSession } from "@/features/auth/hooks/use-session";
import { isUserAdmin } from "@/lib/auth-utils";

export interface PracticumQuestion {
  id: number;
  category: "storytelling" | "roleplay" | "linguistic_drill" | string;
  typeLabel: string;
  instruction: string;
  audioPrompt?: string;
  themeTitle?: string;
  inspirationPoints?: string[];
  sampleStarter?: string;
  scenarioContext?: string;
  characterRole?: string;
  callTopic?: string;
  initialGreeting?: string;
  focus?: "vocab" | "grammar" | "pronunciation_stress" | "pronunciation_intonation" | string;
  targetSentence?: string;
  phonetic?: string;
  expectedKeywords?: string[];
  hint?: string;
  explanation?: string;
  minSeconds?: number;
}

interface SpeakingPracticumStageProps {
  quizSec: any;
  tutor: any;
  onRewardXp: (amount: number) => void;
  onNextStep?: () => void;
  isAdmin?: boolean;
}

export function SpeakingPracticumStage({
  quizSec,
  tutor,
  onRewardXp,
  onNextStep,
  isAdmin: propIsAdmin,
}: SpeakingPracticumStageProps) {
  const { data: sessionUser } = useSession();
  const isAdmin = Boolean(propIsAdmin || isUserAdmin(sessionUser));
  const rawQuestions: PracticumQuestion[] = quizSec?.content?.practicumQuestions || [];

  if (rawQuestions.length === 0) {
    return (
      <div className="p-8 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          No practicum questions available for this session yet.
        </p>
      </div>
    );
  }

  const [currentIdx, setCurrentIdx] = useState(0);
  const [recordings, setRecordings] = useState<Record<number, string>>({});
  const [completedItems, setCompletedItems] = useState<Record<number, boolean>>({});
  const [itemScores, setItemScores] = useState<Record<number, number>>({});
  const [selectedInspirations, setSelectedInspirations] = useState<Record<number, number>>({});
  const [speechTranscripts, setSpeechTranscripts] = useState<Record<number, string>>({});
  const [liveTranscript, setLiveTranscript] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isPlayingModel, setIsPlayingModel] = useState(false);
  const [isPlayingSelf, setIsPlayingSelf] = useState(false);
  const [isCompletedAll, setIsCompletedAll] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const studentAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const currentQ = rawQuestions[currentIdx] || rawQuestions[0];
  const totalQuestions = rawQuestions.length;
  const answeredCount = Object.keys(completedItems).length;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (studentAudioPlayerRef.current) {
        studentAudioPlayerRef.current.pause();
      }
    };
  }, []);

  const handlePlayModel = () => {
    playPopSound();
    setIsPlayingModel(true);
    const audioText = currentQ.audioPrompt || currentQ.instruction;
    tutor.playTutorAudio(audioText);
    setTimeout(() => {
      setIsPlayingModel(false);
    }, 3200);
  };

  const handleStartRecord = async () => {
    playPopSound();
    setLiveTranscript("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordings((prev) => ({ ...prev, [currentIdx]: audioUrl }));
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.lang = "en-US";
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (e: any) => {
          let text = "";
          for (let i = 0; i < e.results.length; i++) {
            text += e.results[i][0].transcript;
          }
          setLiveTranscript(text);
          setSpeechTranscripts((prev) => ({ ...prev, [currentIdx]: text }));
        };
        try {
          rec.start();
          recognitionRef.current = rec;
        } catch {}
      }
    } catch {
      alert("Izin mikrofon diperlukan untuk merekam ceritamu.");
    }
  };

  const handleStopRecord = () => {
    playSnapSound();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);

    // Calculate score based on storytelling duration (min 15s recommended)
    const minSec = currentQ.minSeconds || 15;
    const score = recordSeconds >= minSec ? 100 : recordSeconds >= 10 ? 85 : 70;
    setItemScores((prev) => ({ ...prev, [currentIdx]: score }));
  };

  const handlePlayStudentAudio = () => {
    const audioUrl = recordings[currentIdx];
    if (!audioUrl) return;

    if (studentAudioPlayerRef.current) {
      studentAudioPlayerRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    studentAudioPlayerRef.current = audio;
    setIsPlayingSelf(true);

    audio.onended = () => setIsPlayingSelf(false);
    audio.onerror = () => setIsPlayingSelf(false);
    audio.play().catch(() => setIsPlayingSelf(false));
  };

  const handleConfirmAndNext = () => {
    playMatchSuccessSound();
    setCompletedItems((prev) => ({ ...prev, [currentIdx]: true }));
    onRewardXp(15);

    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsCompletedAll(true);
    }
  };

  const handleRoleplayComplete = (score: number) => {
    setItemScores((prev) => ({ ...prev, [currentIdx]: score }));
    setCompletedItems((prev) => ({ ...prev, [currentIdx]: true }));
    onRewardXp(20);
  };

  const handleDrillSave = (audioUrl: string, transcript: string, score: number) => {
    setRecordings((prev) => ({ ...prev, [currentIdx]: audioUrl }));
    setSpeechTranscripts((prev) => ({ ...prev, [currentIdx]: transcript }));
    setItemScores((prev) => ({ ...prev, [currentIdx]: score }));
    setCompletedItems((prev) => ({ ...prev, [currentIdx]: true }));
    onRewardXp(10);
  };

  const handleDrillAdvance = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsCompletedAll(true);
    }
  };

  const handleResetPracticum = () => {
    playPopSound();
    setCurrentIdx(0);
    setRecordings({});
    setCompletedItems({});
    setItemScores({});
    setSelectedInspirations({});
    setSpeechTranscripts({});
    setIsCompletedAll(false);
  };

  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case "storytelling":
        return <BookOpen className="w-3.5 h-3.5 text-[#0D3B66] dark:text-[#F4B41A]" />;
      case "roleplay":
        return <MapPin className="w-3.5 h-3.5 text-[#0D3B66] dark:text-[#F4B41A]" />;
      case "linguistic_drill":
        return <TrendingUp className="w-3.5 h-3.5 text-[#0D3B66] dark:text-[#F4B41A]" />;
      default:
        return <Mic className="w-3.5 h-3.5 text-[#0D3B66] dark:text-[#F4B41A]" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-[#1B4965] dark:text-[#F4B41A] uppercase tracking-wider block font-mono">
          Step 5 · Speaking Practicum (2 Storytelling, 4 Roleplay Call, 4 Drill Linguistik)
        </span>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          Praktikum Berbicara Mandiri (10 Soal Terstruktur)
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Uji kemampuan berbicaramu: 2 cerita bebas bertema, 4 panggilan suara langsung dengan Mr. Khoirul, dan 4 drill tata bahasa/pelafalan.
        </p>
      </div>

      {!isCompletedAll ? (
        <div className="p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-5">
          {/* Progress Bar & Counter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-[#0D3B66] dark:text-[#F4B41A]">
                Question {currentIdx + 1} of {totalQuestions}
              </span>
              <span className="text-slate-400">
                Completed: {answeredCount}/{totalQuestions}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-[#0D3B66] dark:bg-[#F4B41A] transition-all duration-300 rounded-full"
                style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* QUESTION HEADER CARD */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[#0D3B66] dark:text-[#F4B41A]">
                  {renderCategoryIcon(currentQ.category)}
                </span>
                <span className="text-[11px] font-bold font-mono px-2.5 py-1 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  {currentQ.typeLabel}
                </span>
                {currentQ.focus && (
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-200/50 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {currentQ.focus === "vocab"
                      ? "Focus: Vocabulary"
                      : currentQ.focus === "grammar"
                      ? "Focus: Grammar"
                      : currentQ.focus === "pronunciation_stress"
                      ? "Focus: Syllable Stress"
                      : "Focus: Intonation"}
                  </span>
                )}
              </div>

              {currentQ.category === "storytelling" && (
                <button
                  type="button"
                  onClick={handlePlayModel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 text-xs font-bold text-[#0D3B66] dark:text-[#F4B41A] cursor-pointer shadow-xs active:scale-95"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPlayingModel ? "animate-pulse text-[#F4B41A]" : ""}`} />
                  <span>{isPlayingModel ? "Playing..." : "Play Question Audio"}</span>
                </button>
              )}
            </div>

            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {currentQ.instruction}
            </p>

            {/* FORMAT 1: STORYTELLING (BEBAS DENGAN TEMA & POIN INSPIRASI) */}
            {currentQ.category === "storytelling" && (
              <div className="space-y-3 pt-1">
                {currentQ.themeTitle && (
                  <div className="text-xs font-bold text-[#0D3B66] dark:text-[#F4B41A] uppercase font-mono">
                    Theme: {currentQ.themeTitle}
                  </div>
                )}

                {currentQ.inspirationPoints && currentQ.inspirationPoints.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                      Story Inspiration Ideas (Click any idea to select):
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {currentQ.inspirationPoints.map((point, pIdx) => {
                        const isSelected = selectedInspirations[currentIdx] === pIdx;
                        return (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => {
                              playPopSound();
                              setSelectedInspirations((prev) => ({ ...prev, [currentIdx]: pIdx }));
                            }}
                            className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-[#0D3B66]/10 dark:bg-[#F4B41A]/10 border-[#0D3B66] dark:border-[#F4B41A] text-[#0D3B66] dark:text-[#F4B41A] font-semibold shadow-2xs"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                            }`}
                          >
                            <span>{point}</span>
                            {isSelected && <Check className="w-4 h-4 text-[#0D3B66] dark:text-[#F4B41A] shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Minimum Duration Indicator */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-[#0D3B66] dark:text-[#F4B41A]" />
                  <span>
                    Recommended speech duration: <strong>at least 15 seconds</strong> (speak freely in your own words).
                  </span>
                </div>

                {/* Transcribed Speech Display */}
                {(liveTranscript || speechTranscripts[currentIdx]) && (
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
                    <span className="font-bold block mb-0.5 text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase">
                      Detected Speech:
                    </span>
                    &ldquo;{liveTranscript || speechTranscripts[currentIdx]}&rdquo;
                  </div>
                )}
              </div>
            )}

            {/* FORMAT 2: ROLEPLAY (VOICE CALL DENGAN KARAKTER MR. KHOIRUL) */}
            {currentQ.category === "roleplay" && (
              <PracticumRoleplayCall
                question={currentQ}
                isCompleted={!!completedItems[currentIdx]}
                savedScore={itemScores[currentIdx]}
                onComplete={handleRoleplayComplete}
              />
            )}

            {/* FORMAT 3: LINGUISTIC DRILLS (VOCAB, GRAMMAR, PRONOUNCE) */}
            {currentQ.category === "linguistic_drill" && (
              <PracticumDrillCard
                question={currentQ}
                isCompleted={!!completedItems[currentIdx]}
                savedAudioUrl={recordings[currentIdx]}
                savedScore={itemScores[currentIdx]}
                onSaveResult={handleDrillSave}
                onAdvance={handleDrillAdvance}
                isLastQuestion={currentIdx === totalQuestions - 1}
                tutor={tutor}
              />
            )}
          </div>

          {/* Controls for Storytelling */}
          {currentQ.category === "storytelling" && (
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              {isRecording ? (
                <button
                  type="button"
                  onClick={handleStopRecord}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>
                    Stop Story (00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds})
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartRecord}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-skeuo-yellow text-[#0F172A] text-xs font-black shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Mic className="w-4 h-4 text-[#0D3B66]" />
                  <span>
                    {recordings[currentIdx] ? "Re-record Story" : "Tap & Start Speaking Freely"}
                  </span>
                </button>
              )}

              {recordings[currentIdx] && !isRecording && (
                <button
                  type="button"
                  onClick={handlePlayStudentAudio}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-xs transition-all hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer active:scale-95"
                >
                  <Headphones className="w-4 h-4 text-[#0D3B66] dark:text-[#F4B41A]" />
                  <span>{isPlayingSelf ? "Playing Your Recording..." : "Play Your Recording"}</span>
                </button>
              )}

              {recordings[currentIdx] && !isRecording && (
                <button
                  type="button"
                  onClick={handleConfirmAndNext}
                  className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl btn-skeuo-navy text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <span>Confirm & Continue to Next Question</span>
                  <ArrowRight className="w-4 h-4 text-[#F4B41A]" />
                </button>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    playMatchSuccessSound();
                    if (currentIdx < totalQuestions - 1) {
                      setCurrentIdx((prev) => prev + 1);
                    } else {
                      setIsCompletedAll(true);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl border border-dashed border-amber-400 text-amber-600 dark:text-amber-400 font-bold text-xs hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Lewati Soal (Admin)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Navigation for Roleplay if completed */}
          {currentQ.category === "roleplay" && completedItems[currentIdx] && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  playMatchSuccessSound();
                  if (currentIdx < totalQuestions - 1) {
                    setCurrentIdx((prev) => prev + 1);
                  } else {
                    setIsCompletedAll(true);
                  }
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl btn-skeuo-navy text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>
                  {currentIdx < totalQuestions - 1
                    ? "Continue to Next Question"
                    : "Complete Practicum"}
                </span>
                <ArrowRight className="w-4 h-4 text-[#F4B41A]" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Final Completion Summary Screen */
        <PracticumSummary
          questions={rawQuestions}
          scores={itemScores}
          onReset={handleResetPracticum}
          onNextStep={onNextStep}
        />
      )}
    </div>
  );
}
