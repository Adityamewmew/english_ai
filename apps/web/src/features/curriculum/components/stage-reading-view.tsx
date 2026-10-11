"use client";

import { BookOpen, Target, CheckCircle2 } from "lucide-react";
import { GamifiedMatchPairs } from "./gamified-match-pairs";
import { InteractiveContractionMorpher } from "./interactive-contraction-morpher";
import { InteractiveVocabCard } from "./interactive-vocab-card";
import { InteractiveReadingPassage } from "./interactive-reading-passage";
import { InteractiveGrammarCard } from "./interactive-grammar-card";
import { ConceptChecksCard } from "./concept-checks-card";
import { TutorAudioStage } from "./tutor-audio-stage";

interface StageReadingViewProps {
  activeStepId: number;
  theorySec: any;
  vocabSec: any;
  quizSec: any;
  tutor: any;
  onRewardXp: (amount: number) => void;
  onIncrementCombo: () => void;
  onResetCombo: () => void;
  cefr?: string;
}

export function StageReadingView({
  activeStepId,
  theorySec,
  vocabSec,
  quizSec,
  tutor,
  onRewardXp,
  onIncrementCombo,
  onResetCombo,
  cefr = "A1.1",
}: StageReadingViewProps) {
  const vocabItems = theorySec?.content?.items || vocabSec?.content?.items || [];
  const readingPassage = theorySec?.content?.readingPassage;
  const rules = theorySec?.content?.rules || [];
  const postTestQuestions =
    quizSec?.content?.questions ||
    theorySec?.content?.postTestQuestions ||
    theorySec?.content?.conceptChecks ||
    [];

  return (
    <div className="space-y-6">
      {/* Step 1: Onboarding & Detailed Mission Briefing (Mr. Khoirul Greeting) */}
      {activeStepId === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 1. Mr. Khoirul Welcoming Speech Card */}
          <TutorAudioStage
            instructionText="Halo! Selamat datang di modul A1.1. Di misi Reading kali ini, kita akan membaca kisah dua mahasiswa internasional (Mateo dari Spanyol & Mei dari Tiongkok) yang saling berkenalan di kampus. Kita akan membedah bagaimana mereka menyebutkan asal negara serta menggunakan pola verb 'to be' secara fasih."
            skillLabel="READING MISSION"
            encouragementText="Pelajari kosakata kunci terlebih dahulu di langkah berikutnya sebelum membaca teks utama!"
          />

          {/* 2. Detailed Mission Context & Storyline */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
                Latar Belakang & Konteks Cerita
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Pertemuan Mahasiswa Internasional di Kampus
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {theorySec?.content?.summary ||
                  "Di sesi ini, kamu akan mengikuti dialog antara dua mahasiswa baru: Mateo yang datang dari Madrid, Spanyol, dan Mei yang berasal dari Beijing, Tiongkok. Melalui kisah mereka, kamu akan belajar cara memperkenalkan diri, membedakan nama negara dari kewarganegaraan, serta menguasai rumus verb 'to be' (am, is, are) dalam situasi nyata."}
              </p>
            </div>

            {/* Context Warm-Up / Pertanyaan Refleksi */}
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/50 space-y-1.5">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                💡 Pertanyaan Pemantik Sebelum Membaca:
              </span>
              <p className="text-xs text-amber-950/80 dark:text-amber-300/90 leading-relaxed">
                {theorySec?.content?.contextWarmUp ||
                  "Perhatikan bendera Spanyol dan Tiongkok. Tahukah kamu perbedaan antara menyebut negara ('Spain') dan kewarganegaraan orangnya ('Spanish')? Kapan kita menggunakan 'am', 'is', atau 'are' saat menyatakan asal?"}
              </p>
            </div>

            {/* 3 Concrete Learning Outcomes */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider block">
                Target Kemampuan Hari Ini (Learning Outcomes):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs">
                    <Target className="w-3.5 h-3.5" />
                    <span>1. Kuasai Kosakata</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Pelajari 6 kata kunci asal, kewarganegaraan, dan status kampus lengkap dengan audio asli.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>2. Baca Kisah Mateo & Mei</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Pahami alur percakapan perkenalan antar mahasiswa internasional dengan panduan karaoke audio.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>3. Praktik Verb 'To Be'</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Kuasai pola kalimat afirmatif, negatif, tanya, dan peleburan singkatan secara interaktif.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Interactive 3D Flashcards (Pelajari Kata & Audio Dulu!) */}
      {activeStepId === 2 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-1">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-mono">
              Step 2 · Audio Vocabulary Flashcards ({vocabItems.length} Kata)
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Pelajari Kosakata Kunci Sebelum Membaca Teks
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Ketuk setiap kartu untuk membalik arti dan mendengarkan pelafalan asli dari penutur bahasa Inggris:
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vocabItems.map((item: any, idx: number) => (
              <InteractiveVocabCard key={idx} item={item} onPlayAudio={tutor.playTutorAudio} />
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Guided Karaoke Reading (Membaca Teks Cerita Utama) */}
      {activeStepId === 3 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
              Step 3 · Guided Reading Passage
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Kisah Mateo & Mei di Orientasi Kampus
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Ikuti teks bacaan sambil mendengarkan audio per kata dengan panduan sorotan suara:
            </p>
          </div>
          {readingPassage && (
            <InteractiveReadingPassage passage={readingPassage} onPlayAudio={tutor.playTutorAudio} embedded={true} />
          )}
        </div>
      )}

      {/* Step 4: Match Madness Tile Pairing Game (Uji Ingatan Setelah Tahu Arti & Cerita) */}
      {activeStepId === 4 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider font-mono">
              Step 4 · Uji Ingatan Kosakata (Match Madness)
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Cocokkan Kata dengan Artinya
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Kamu sudah mempelajari kosakatanya di bacaan! Sekarang hubungkan kata di sebelah kiri dengan arti di sebelah kanan:
            </p>
          </div>
          <GamifiedMatchPairs
            items={vocabItems}
            onRewardXp={onRewardXp}
            onIncrementCombo={onIncrementCombo}
            onResetCombo={onResetCombo}
            embedded={true}
          />
        </div>
      )}

      {/* Step 5: Contraction Morpher Machine */}
      {activeStepId === 5 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
              Step 5 · Contraction Morpher
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Peleburan Singkatan Alami
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Ketuk untuk melihat bagaimana kata subjek dan to be melebur menjadi satu hembusan nafas:
            </p>
          </div>
          <InteractiveContractionMorpher onRewardXp={onRewardXp} embedded={true} />
        </div>
      )}

      {/* Step 6: Grammar Rules & Formulas */}
      {activeStepId === 6 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
              Step 6 · Interactive Grammar Mechanics
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Rumus Kalimat Verb 'To Be'
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Gunakan tab mode (+, -, ?) dan pilih subjek untuk bereksperimen dengan rumus kalimat:
            </p>
          </div>
          <InteractiveGrammarCard rules={rules} onPlayAudio={tutor.playTutorAudio} embedded={true} />
        </div>
      )}

      {/* Step 7: Reading Comprehension Checkpoint Quiz */}
      {activeStepId === 7 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-1">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider font-mono">
              Step 7 · Final Comprehension Quiz
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Uji Pemahaman Cerita Mateo & Mei
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Jawab pertanyaan pemahaman berikut untuk menyelesaikan misi membaca:
            </p>
          </div>
          <ConceptChecksCard conceptChecks={postTestQuestions} accentColor="purple" embedded={true} />
        </div>
      )}
    </div>
  );
}
