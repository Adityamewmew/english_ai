"use client";

import React, { useState } from "react";
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  Play,
  RotateCcw,
  HelpCircle,
} from "lucide-react";
import { animeButtonPop } from "@/lib/anime-effects";
import { playPopSound } from "@/lib/sound-fx";
import { TutorAudioStage } from "./tutor-audio-stage";
import { KeyConceptsGrid, type KeyConceptItem } from "./key-concepts-grid";

interface StageListeningViewProps {
  activeStepId: number;
  dialogueSec: any;
  quizSec: any;
  tutor: any;
  onRewardXp: (amount: number) => void;
  cefr?: string;
}

export function StageListeningView({
  activeStepId,
  dialogueSec,
  quizSec,
  tutor,
  onRewardXp,
  cefr = "A1.1",
}: StageListeningViewProps) {
  const dialogueLines = dialogueSec?.content?.lines || [];
  const dialogueContext = dialogueSec?.content?.context || "Hotel Check-In Conversation";
  const questions = quizSec?.content?.questions || [];

  // Local state for Step 5 Quiz
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Local state for Step 4 Dictation
  const [dictationAnswers, setDictationAnswers] = useState<Record<number, string>>({});
  const [dictationChecked, setDictationChecked] = useState<Record<number, boolean>>({});

  const handlePlayLine = (id: string, text: string) => {
    setPlayingAudioId(id);
    tutor.playTutorAudio(text);
    setTimeout(() => setPlayingAudioId(null), 3500);
  };

  const handleSelectQuizAnswer = (qId: string, option: string, isCorrect: boolean) => {
    if (!selectedAnswers[qId]) {
      if (isCorrect) onRewardXp(20);
    }
    setSelectedAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const dictationDrills = [
    { id: 1, prompt: "Sarah: 'Where are you from, Mr. Rossi?'", audio: "Where are you from?", target: "from", hint: "Kata depan (preposition) penunjuk asal" },
    { id: 2, prompt: "Marco: 'I am from Rome, _____.'", audio: "I am from Rome, Italy.", target: "italy", hint: "Nama negara asal Marco" },
    { id: 3, prompt: "Sarah: 'Your room is room number _____.'", audio: "Room number 402.", target: "402", hint: "Nomor kamar Marco di lantai 4" },
    { id: 4, prompt: "Marco: 'My family is at _____ Airport.'", audio: "Heathrow Airport.", target: "heathrow", hint: "Nama bandara internasional di London" },
  ];

  const listeningKeyConcepts: KeyConceptItem[] = [
    {
      id: "scen-hotel",
      title: "Hotel Check-In Scenario",
      description: "Authentic dialogue between Sarah (hotel receptionist) and Marco Rossi (guest from Rome, Italy).",
      example: "Welcome to Grand International Hotel.",
    },
    {
      id: "aud-phrases",
      title: "Auditory Target Phrases",
      description: "Train ear to catch 'Where are you from?' and responses with country names and room numbers.",
      example: "Where are you from, Mr. Rossi?",
    },
    {
      id: "nat-contractions",
      title: "Contracted Speech in Action",
      description: "Native speakers blend 'I am' into 'I'm' and 'It is' into 'It's' smoothly without harsh pauses.",
      example: "I'm from Rome / Room 402.",
    },
    {
      id: "key-extract",
      title: "Detail Extraction Reflex",
      description: "Filter background noise to quickly note critical information: room 402, Heathrow, and passports.",
      example: "My family is at Heathrow Airport.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* STEP 1: Minimalist Demia-style Audio Hero & Key Concepts */}
      {activeStepId === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <TutorAudioStage
            instructionText="Welcome to the listening briefing! In this session, you will listen to an authentic dialogue at the Grand International Hotel. Pay close attention to how nationalities and contractions sound in real conversation."
            encouragementText="Train your ear for natural spoken English pace!"
            skillLabel="LISTENING MISSION"
          />


          {/* Lesson Recap */}
          <div className="space-y-2">
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Lesson Recap
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              In this session, you will listen to an authentic hotel reception dialogue between Sarah and Marco. Focus on identifying countries of origin, spelling of proper names, room number confirmations, and contracted speech in natural conversational tempo.
            </p>
          </div>

          <KeyConceptsGrid
            concepts={listeningKeyConcepts}
            onCheckItem={() => onRewardXp(10)}
          />
        </div>
      )}

      {/* STEP 2: Interactive Audio Dialogue Player */}
      {activeStepId === 2 && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block font-mono">
                Step 2 · Multi-Speaker Audio Player ({dialogueLines.length} Lines)
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                Listen & Follow Spoken Dialogue
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                const fullText = dialogueLines.map((l: any) => `${l.speaker}: ${l.en}`).join(". ");
                tutor.playTutorAudio(fullText);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Full Audio Dialogue</span>
            </button>
          </div>

          <div className="space-y-3">
            {dialogueLines.map((line: any, idx: number) => {
              const isSarah = line.speaker?.toLowerCase().includes("sarah");
              const isPlaying = playingAudioId === (line.id || `line-${idx}`);

              return (
                <div
                  key={idx}
                  onClick={() => handlePlayLine(line.id || `line-${idx}`, line.en)}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 cursor-pointer ${
                    isPlaying
                      ? "bg-purple-100/70 dark:bg-purple-950/60 border-purple-400 dark:border-purple-600 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700"
                  }`}
                >
                  <button
                    type="button"
                    className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                      isPlaying
                        ? "bg-purple-600 text-white animate-pulse"
                        : "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300"
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-xs font-black uppercase tracking-wider ${
                          isSarah ? "text-purple-700 dark:text-purple-300" : "text-indigo-600 dark:text-indigo-400"
                        }`}
                      >
                        {line.speaker}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                      {line.en}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Spoken Contractions Ear Trainer */}
      {activeStepId === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block font-mono">
              Step 3 · Spoken Contraction Ear Trainer
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Catching Fast Spoken Forms: Contractions in Natural Speech
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Dalam percakapan lisan cepat, penutur asli selalu menyatukan subjek dan to be. Latih telingamu mengenali bentuk singkatan ini:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 1, slow: "I am Marco", fast: "I'm Marco", slowIpa: "/aɪ æm/", fastIpa: "/aɪm/", note: "Vokal panjang 'æm' memendek menjadi satu hembusan nafas." },
              { id: 2, slow: "It is my first time", fast: "It's my first time", slowIpa: "/ɪt ɪz/", fastIpa: "/ɪts/", note: "Huruf 't' dan 's' melebur jadi bunyi desis tunggal." },
              { id: 3, slow: "They are at the airport", fast: "They're at the airport", slowIpa: "/ðeɪ ɑːr/", fastIpa: "/ðeər/", note: "Terdengar persis seperti kata 'there' (/ðeər/)." },
              { id: 4, slow: "Where is your family?", fast: "Where's your family?", slowIpa: "/weər ɪz/", fastIpa: "/weəz/", note: "Wh-word langsung digabung dengan akhiran /z/." },
            ].map((item) => {
              const isContracted = dictationChecked[100 + item.id] ?? true;

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3.5 shadow-xs transition-all hover:border-slate-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 font-mono">
                      Pair #{item.id}
                    </span>
                    {/* Interactive Squeeze Switch */}
                    <button
                      type="button"
                      onClick={() => {
                        playPopSound();
                        setDictationChecked((prev) => ({ ...prev, [100 + item.id]: !isContracted }));
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        isContracted
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {isContracted ? "Bentuk Alami (Singkatan) ⚡" : "Bentuk Lambat (Penuh)"}
                    </button>
                  </div>

                  {/* Morphing Word Display */}
                  <div
                    onClick={() => {
                      playPopSound();
                      setDictationChecked((prev) => ({ ...prev, [100 + item.id]: !isContracted }));
                    }}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 cursor-pointer select-none space-y-1 transition-all hover:bg-slate-100/80"
                  >
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">
                      {isContracted ? "Natural Spoken Form (Ketuk untuk ubah)" : "Formal Slow Form (Ketuk untuk leburkan)"}
                    </span>
                    <p className={`text-base font-bold transition-all ${isContracted ? "text-blue-600 dark:text-blue-400" : "text-slate-800 dark:text-slate-200"}`}>
                      {isContracted ? item.fast : item.slow}
                    </p>
                    <span className="text-[11px] font-mono text-slate-500 block">
                      Fonetik: {isContracted ? item.fastIpa : item.slowIpa}
                    </span>
                  </div>

                  {/* Separate A/B Audio Triggers */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => tutor.playTutorAudio(item.slow)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Dengar Lambat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => tutor.playTutorAudio(item.fast)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                      <span>Dengar Spoken ⚡</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    💡 {item.note}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: Audio Dictation & Echo Drill */}
      {activeStepId === 4 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block font-mono">
              Step 4 · Audio Dictation & Word Catching
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Listen to the Audio Clip & Type the Missing Keyword
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Putar tombol audio, dengarkan kata kuncinya, lalu ketikkan jawabannya pada kotak input di bawah:
            </p>
          </div>

          <div className="space-y-4">
            {dictationDrills.map((drill) => {
              const currentVal = dictationAnswers[drill.id] || "";
              const isChecked = dictationChecked[drill.id];
              const isCorrect = currentVal.trim().toLowerCase() === drill.target;

              return (
                <div
                  key={drill.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-500 font-mono">Audio Clip #{drill.id}</span>
                    <button
                      type="button"
                      onClick={() => tutor.playTutorAudio(drill.audio)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Play Clip</span>
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{drill.prompt}</p>

                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Type the heard word..."
                      value={currentVal}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDictationAnswers((prev) => ({ ...prev, [drill.id]: val }));
                        setDictationChecked((prev) => ({ ...prev, [drill.id]: false }));
                      }}
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDictationChecked((prev) => ({ ...prev, [drill.id]: true }));
                        if (isCorrect) onRewardXp(15);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      Check
                    </button>
                  </div>

                  {isChecked && (
                    <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      isCorrect ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                    }`}>
                      {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
                      <span>{isCorrect ? "Benar sekali! Pelafalan kata cocok." : `Kurang tepat. Kunci jawaban: ${drill.target}`}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 5: Listening Comprehension Audio Quiz */}
      {activeStepId === 5 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-2">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block font-mono">
              Step 5 · Audio Comprehension Evaluation ({questions.length} Questions)
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Praktikum Menyimak & Evaluasi Pemahaman
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Dengarkan potongan audio untuk setiap soal, lalu pilih opsi yang paling akurat:
            </p>
          </div>

          <div className="space-y-5">
            {questions.map((q: any, qIdx: number) => {
              const selectedOpt = selectedAnswers[q.id || `q-${qIdx}`];
              const isAnswered = Boolean(selectedOpt);

              return (
                <div
                  key={q.id || qIdx}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-xs font-black text-purple-600 uppercase font-mono">
                      Question {qIdx + 1} of {questions.length}
                    </span>
                    {q.audioScript && (
                      <button
                        type="button"
                        onClick={() => tutor.playTutorAudio(q.audioScript)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-200 transition-colors w-fit"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen to Question Audio</span>
                      </button>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {q.question}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {(q.options || []).map((opt: string, optIdx: number) => {
                      const isChosen = selectedOpt === opt;
                      const isCorrect = opt === q.answer;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectQuizAnswer(q.id || `q-${qIdx}`, opt, isCorrect)}
                          className={`p-4 rounded-2xl text-left text-sm font-semibold border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                            isChosen
                              ? isCorrect
                                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm"
                                : "bg-red-50 dark:bg-red-950/60 border-red-500 text-red-900 dark:text-red-200"
                              : isAnswered && isCorrect
                              ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-400 text-emerald-800 dark:text-emerald-300"
                              : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-purple-300"
                          }`}
                        >
                          <span>{opt}</span>
                          {isChosen && (
                            isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <span className="text-xs font-bold text-red-600">✕</span>
                            )
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && q.explanation && (
                    <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/40 text-xs text-purple-950 dark:text-purple-200 leading-relaxed">
                      💡 <span className="font-bold">Penjelasan:</span> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
