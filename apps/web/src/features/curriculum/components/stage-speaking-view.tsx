"use client";

import React, { useState } from "react";
import {
  Mic,
  Volume2,
  Sparkles,
  PhoneCall,
  PhoneOff,
  CheckCircle2,
  Play,
  RotateCcw,
} from "lucide-react";
import { TutorAudioStage } from "./tutor-audio-stage";
import { KeyConceptsGrid, type KeyConceptItem } from "./key-concepts-grid";
import { SyllableBeatDrill } from "./syllable-beat-drill";

interface StageSpeakingViewProps {
  activeStepId: number;
  theorySec: any;
  practiceSec: any;
  tutor: any;
  onRewardXp: (amount: number) => void;
  cefr?: string;
}

export function StageSpeakingView({
  activeStepId,
  theorySec,
  practiceSec,
  tutor,
  onRewardXp,
  cefr = "A1.1",
}: StageSpeakingViewProps) {
  const rules = theorySec?.content?.rules || [];
  const phoneticItems = theorySec?.content?.items || [];
  const drills = practiceSec?.content?.drills || [
    { text: "Where are you from?", phonetic: "/weər ɑːr juː frɒm/", hint: "Wh-question dengan nada turun ↘ di akhir" },
    { text: "I am from Melbourne, Australia.", phonetic: "/aɪ æm frɒm ˈmel.bən ɔːˈstreɪ.li.ə/", hint: "Pernyataan asal negara dengan intonasi mantap" },
    { text: "Are you Japanese?", phonetic: "/ɑːr juː ˌdʒæp.əˈniːz/", hint: "Pertanyaan Yes/No dengan nada naik ↗" },
    { text: "Yes, I am from Tokyo.", phonetic: "/jes aɪ æm frɒm ˈtəʊ.ki.əʊ/", hint: "Jawaban afirmatif yang tegas" },
  ];

  const [drillCompleted, setDrillCompleted] = useState<Record<number, boolean>>({});
  const [activeDrillPlaying, setActiveDrillPlaying] = useState<number | null>(null);

  const handlePlayDrill = (idx: number, text: string) => {
    setActiveDrillPlaying(idx);
    tutor.playTutorAudio(text);
    setTimeout(() => {
      setActiveDrillPlaying(null);
      setDrillCompleted((prev) => ({ ...prev, [idx]: true }));
      onRewardXp(15);
    }, 3000);
  };

  const speakingKeyConcepts: KeyConceptItem[] = [
    {
      id: "pitch-rising",
      title: "Rising Pitch (Nada Naik ↗)",
      description: "Angkat nada vokal pada akhir pertanyaan Yes/No konfirmasi: 'Are you Japanese? ↗'",
      example: "Are you from Spain? ↗",
    },
    {
      id: "pitch-falling",
      title: "Falling Pitch (Nada Turun ↘)",
      description: "Gunakan nada turun mantap untuk Wh-questions dan pernyataan: 'Where are you from? ↘'",
      example: "Where are you from? ↘ / I am from Australia.",
    },
    {
      id: "syllable-stress",
      title: "Pergeseran Tekanan Kata",
      description: "Pahami perpindahan suku kata bertekanan antara negara dan kebangsaan: 'Canada' vs 'Canadian'.",
      example: "CAN-a-da vs Ca-NA-di-an",
    },
    {
      id: "voice-clarity",
      title: "Artikulasi Vokal Alami",
      description: "Ucapkan setiap silabel dengan postur mulut terbuka santai tanpa menahan nafas di tenggorokan.",
      example: "Relaxed open-vowel phonation",
    },
  ];

  return (
    <div className="space-y-6">
      {/* STEP 1: Minimalist Demia-style Audio Hero & Key Concepts */}
      {activeStepId === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <TutorAudioStage
            instructionText="Hello voice champion! Pronunciation is not just about words, it is about music and rhythm. Wh-questions and statements glide downward, while confirmation questions lift upward. Review the vocal keys below."
            encouragementText="Speak aloud with confidence and clear posture!"
            skillLabel="SPEAKING MISSION"
          />


          {/* Lesson Recap */}
          <div className="space-y-2">
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Lesson Recap
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              In this session, we train pitch trajectories and cadence in spoken English. We explore how Yes/No questions naturally lift upward with rising pitch, while Wh-questions and statements drop downward with falling pitch for confident delivery.
            </p>
          </div>

          <KeyConceptsGrid
            concepts={speakingKeyConcepts}
            onCheckItem={() => onRewardXp(10)}
          />
        </div>
      )}

      {/* STEP 2: Syllable Stress Drills */}
      {activeStepId === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block font-mono">
              Step 2 · Syllable Stress Drills (Country vs Nationality)
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Pergeseran Tekanan Suku Kata (*Syllable Shift*)
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Ketuk tombol ritme untuk mendengar ketukan suku kata, atau ketuk per pad suku kata untuk melatih intonasi bertekanan:
            </p>
          </div>

          <SyllableBeatDrill onRewardXp={onRewardXp} />
        </div>
      )}

      {/* STEP 3: Oral Sentence Reflex Drills */}
      {activeStepId === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block font-mono">
              Step 3 · Oral Reflex Drills (Listen & Repeat)
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Latihan Ucapkan Mandiri (5 Kalimat Kunci)
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Ketuk tombol audio, dengarkan intonasi penutur asli, dan tirukan dengan suara lantang:
            </p>
          </div>

          <div className="space-y-3.5">
            {drills.map((drill: any, idx: number) => {
              const isPlaying = activeDrillPlaying === idx;
              const isDone = drillCompleted[idx];

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-slate-400">Drill #{idx + 1}</span>
                    <p className="text-base font-black text-slate-900 dark:text-white">{drill.text}</p>
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 block">{drill.phonetic}</span>
                    <span className="text-xs text-slate-500 block">{drill.hint}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isDone && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Practiced</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handlePlayDrill(idx, drill.text)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{isPlaying ? "Playing..." : "Listen & Repeat"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: Live AI Roleplay Call with Mr. Khoirul */}
      {activeStepId === 4 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block font-mono">
              Step 4 · Live AI Roleplay Lab (Spoken Simulation)
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Praktik Berbicara Langsung dengan Mr. Khoirul
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Lakukan panggilan suara langsung dengan AI Tutor Mr. Khoirul untuk mempraktikkan perkenalan diri dan menanyakan asal negara teman barumu.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-2 border-emerald-500/40 text-white space-y-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-600 text-white flex items-center justify-center shadow-xl ring-8 ring-emerald-500/20">
              <Mic className="w-10 h-10" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h4 className="text-xl font-black text-white">Live Spoken English Call</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mr. Khoirul akan menyapamu: *"Hello! Where are you from?"*. Jawablah dengan mikrofonmu: *"Hello! I am from Indonesia."*
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  tutor.handleToggleCall();
                  onRewardXp(35);
                }}
                className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-black tracking-wide shadow-lg transition-all active:scale-95 cursor-pointer ${
                  tutor.isCalling
                    ? "bg-red-600 hover:bg-red-500 text-white ring-4 ring-red-500/30"
                    : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-4 ring-emerald-400/30"
                }`}
              >
                {tutor.isCalling ? (
                  <>
                    <PhoneOff className="w-5 h-5" />
                    <span>End Voice Call</span>
                  </>
                ) : (
                  <>
                    <PhoneCall className="w-5 h-5" />
                    <span>Start Voice Call with Mr. Khoirul</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Speaking Mastery Evaluation */}
      {activeStepId === 5 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block font-mono">
              Step 5 · Speaking Mastery Evaluation
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Evaluasi Kelancaran & Kesiapan Berbicara
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Periksa ringkasan capaian kemampuan berbicara lisanmu pada modul Unit 1:
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 font-mono">Fluency</span>
                <p className="text-lg font-black text-slate-900 dark:text-white">Ready</p>
                <span className="text-[11px] text-slate-500">Respon lisan natural</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 font-mono">Intonation</span>
                <p className="text-lg font-black text-slate-900 dark:text-white">A1.1 Standard</p>
                <span className="text-[11px] text-slate-500">Lintasan nada Yes/No vs Wh-</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 font-mono">Syllable Stress</span>
                <p className="text-lg font-black text-slate-900 dark:text-white">100% Accuracy</p>
                <span className="text-[11px] text-slate-500">Country vs Nationality</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Semua drill lisan telah terlaksana. Kamu siap menyelesaikan modul Unit 1!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
