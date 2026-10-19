"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
} from "lucide-react";
import { ThreejsPixelTutorStage, type TutorPose } from "./threejs-pixel-tutor-stage";
import { animeButtonPop } from "@/lib/anime-effects";
import { playPopSound, playMatchSuccessSound } from "@/lib/sound-fx";
import { speakTutorText, stopTutorSpeech } from "@/lib/tutor-voice";

interface SubmoduleTutorWelcomeStageProps {
  moduleData: any;
  subModule: any;
  studentName?: string;
  onStartMission: () => void;
  onBackToMissions: () => void;
  onPlayAudio?: (text: string) => void;
}

const SKILL_ICONS: Record<string, React.ReactNode> = {
  reading: <BookOpen className="w-4 h-4" />,
  listening: <Headphones className="w-4 h-4" />,
  writing: <PenTool className="w-4 h-4" />,
  speaking: <Mic className="w-4 h-4" />,
};

export function SubmoduleTutorWelcomeStage({
  moduleData,
  subModule,
  studentName = "Student",
  onStartMission,
  onBackToMissions,
  onPlayAudio,
}: SubmoduleTutorWelcomeStageProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [tutorPose, setTutorPose] = useState<TutorPose>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [greetingPhase, setGreetingPhase] = useState<
    "entering" | "waving" | "speaking" | "done"
  >("entering");

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechTimerRef = useRef<NodeJS.Timeout | null>(null);

  const welcomeSpeech = useMemo(() => {
    const theorySec = subModule?.sections?.find((s: any) => s.sectionType === "theory");
    const target = theorySec?.content?.linguisticTarget;
    const grammarTopic = subModule?.grammarFocus || target?.grammarTopic || "Core Sentence Patterns";
    const vocabTopic = subModule?.vocabularyFocus || target?.vocabularyTopic || "Key Vocabulary";
    const functionText = target?.languageFunction || "communicate with confidence";

    return (
      subModule?.onboardingSpeech ||
      `Hello ${studentName}! Welcome to ${moduleData?.title || "our English module"}. ` +
      `I'm Mr. Khoirul, your personal AI tutor! In this ${subModule?.title || "mission"}, ` +
      `we are focusing on ${grammarTopic} and ${vocabTopic}. ` +
      `Our main goal is to help you ${functionText}. ` +
      `Take your time through each step, listen carefully, and remember: making mistakes is the fastest way to learn! ` +
      `Are you ready? Let's start the mission!`
    );
  }, [moduleData, subModule, studentName]);

  // Clean finish speaking handler
  const finishSpeaking = useCallback(() => {
    setIsSpeaking(false);
    setTutorPose("thumbsup");
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
    }
    setTimeout(() => {
      setTutorPose((prev: TutorPose) => (prev === "thumbsup" ? "idle" : prev));
    }, 2500);
  }, []);

  // Immediate stop speech handler
  const stopSpeaking = useCallback(() => {
    stopTutorSpeech();
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
    }
    utteranceRef.current = null;
    setIsSpeaking(false);
    setTutorPose("idle");
  }, []);

  const speakGreeting = useCallback((text: string) => {
    if (isMuted) return;
    setIsSpeaking(true);
    setTutorPose("talking");

    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
    }

    speakTutorText(text, {
      onEnd: () => {
        finishSpeaking();
      },
      onError: () => {
        finishSpeaking();
      },
    });
  }, [isMuted, finishSpeaking]);

  // Choreographed greeting sequence
  useEffect(() => {
    setGreetingPhase("entering");
    setTutorPose("idle");

    // Phase 1: Enter (500ms) → Wave
    const t1 = setTimeout(() => {
      setGreetingPhase("waving");
      setTutorPose("waving");
    }, 500);

    // Phase 2: Wave for 2s → Start speaking
    const t2 = setTimeout(() => {
      setGreetingPhase("speaking");
      setTutorPose("talking");
      speakGreeting(welcomeSpeech);
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      stopSpeaking();
    };
  }, [welcomeSpeech, speakGreeting, stopSpeaking]);

  // Typewriter effect starts when speaking phase begins
  useEffect(() => {
    if (greetingPhase !== "speaking") return;

    setDisplayedText("");
    setIsTyping(true);
    let currentIdx = 0;

    const interval = setInterval(() => {
      if (currentIdx < welcomeSpeech.length) {
        setDisplayedText(welcomeSpeech.slice(0, currentIdx + 1));
        currentIdx++;
      } else {
        setIsTyping(false);
        setGreetingPhase("done");
        clearInterval(interval);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [greetingPhase, welcomeSpeech]);

  const handleReplay = (e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    playPopSound();
    stopSpeaking();

    setTutorPose("waving");
    setTimeout(() => {
      speakGreeting(welcomeSpeech);
    }, 1200);

    setDisplayedText("");
    setIsTyping(true);

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < welcomeSpeech.length) {
        setDisplayedText(welcomeSpeech.slice(0, currentIdx + 1));
        currentIdx++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 28);
  };

  const handleStart = (e: React.MouseEvent) => {
    animeButtonPop(e.currentTarget as HTMLElement);
    playMatchSuccessSound();
    stopSpeaking();
    setTutorPose("thumbsup");
    setTimeout(() => onStartMission(), 500);
  };

  const handleBack = () => {
    stopSpeaking();
    onBackToMissions();
  };

  const theorySec = subModule?.sections?.find((s: any) => s.sectionType === "theory");
  const target = theorySec?.content?.linguisticTarget;

  const poseLabel: Record<TutorPose, string> = {
    idle: "Waiting",
    waving: "Greeting",
    talking: "Explaining",
    thumbsup: "Awesome!",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Missions</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
            Module {moduleData?.id || "A1.1-M01"}
          </span>
          <span>·</span>
          <span className="text-[#0D3B66] dark:text-[#F4B41A] font-bold">
            Tutor Onboarding
          </span>
        </div>
      </div>

      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Left: 3D Character Stage */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-100/80 to-slate-200/50 dark:from-slate-800/60 dark:to-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800 p-6 flex flex-col items-center justify-between relative">
          <div className="w-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs text-xs font-bold text-slate-800 dark:text-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Mr. Khoirul</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0D3B66] text-white font-mono">
                AI Coach
              </span>
            </div>

            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg bg-white/60 dark:bg-slate-800/60">
              {poseLabel[tutorPose]}
            </span>
          </div>

          <div className="w-full my-auto py-2">
            <ThreejsPixelTutorStage
              pose={tutorPose}
              isSpeaking={isSpeaking}
              className="w-full h-52 sm:h-72 lg:h-96"
            />
          </div>

          <div className="w-full flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer min-h-[44px] touch-manipulation"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Replay Audio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                if (nextMuted) {
                  stopSpeaking();
                } else {
                  speakGreeting(welcomeSpeech);
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer min-h-[44px] min-w-[44px] touch-manipulation"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* Right: Speech + Mission Info */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0D3B66] dark:text-[#F4B41A]">
              <span className="p-1 rounded bg-[#0D3B66]/10 text-[#0D3B66] dark:text-[#F4B41A]">
                {SKILL_ICONS[subModule?.skillType] || <BookOpen className="w-4 h-4" />}
              </span>
              <span className="uppercase tracking-wider font-semibold">
                {subModule?.skillType} MISSION
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {subModule?.title}
            </h2>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 space-y-2 relative">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Mr. Khoirul:
                </span>
                {isSpeaking && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <span className="flex gap-0.5">
                      <span className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="w-1 h-4 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: "0.15s" }} />
                      <span className="w-1 h-2.5 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
                    </span>
                    Speaking
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed min-h-[90px]">
                {greetingPhase === "entering" || greetingPhase === "waving" ? (
                  <span className="text-slate-400 italic">Mr. Khoirul is greeting you...</span>
                ) : (
                  <>
                    {displayedText}
                    {isTyping && <span className="inline-block w-1.5 h-4 bg-[#0D3B66] dark:bg-[#F4B41A] ml-1 animate-pulse" />}
                  </>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Grammar Target
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {subModule?.grammarFocus || target?.grammarTopic || "Verb 'To Be'"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Vocabulary Focus
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {subModule?.vocabularyFocus || target?.vocabularyTopic || "Countries & Origin"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Learning Outcome
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {target?.languageFunction || "Active Conversational Skills"}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleStart}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium underline cursor-pointer order-2 sm:order-1 min-h-[44px] flex items-center justify-center px-4 touch-manipulation"
            >
              Skip intro
            </button>

            <button
              type="button"
              onClick={handleStart}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0D3B66] hover:bg-[#1B4965] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer order-1 sm:order-2 min-h-[48px] touch-manipulation"
            >
              <span>Start Mission</span>
              <ArrowRight className="w-4 h-4 text-[#F4B41A]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
