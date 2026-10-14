"use client";

import { BookOpen, Target, CheckCircle2 } from "lucide-react";
import { GamifiedMatchPairs } from "./gamified-match-pairs";
import { InteractiveContractionMorpher } from "./interactive-contraction-morpher";
import { InteractiveVocabCard } from "./interactive-vocab-card";
import { InteractiveReadingPassage } from "./interactive-reading-passage";
import { InteractiveGrammarCard } from "./interactive-grammar-card";
import { ConceptChecksCard } from "./concept-checks-card";
import { TutorAudioStage } from "./tutor-audio-stage";
import { StageReadingOnboarding } from "./stage-reading-onboarding";

interface StageReadingViewProps {
  activeStepId: number;
  theorySec: any;
  vocabSec: any;
  dialogueSec?: any;
  practiceSec?: any;
  quizSec: any;
  tutor: any;
  onRewardXp: (amount: number) => void;
  onIncrementCombo: () => void;
  onResetCombo: () => void;
  cefr?: string;
  onNextStep?: () => void;
}

export function StageReadingView({
  activeStepId,
  theorySec,
  vocabSec,
  dialogueSec,
  practiceSec,
  quizSec,
  tutor,
  onRewardXp,
  onIncrementCombo,
  onResetCombo,
  cefr = "A1.1",
  onNextStep,
}: StageReadingViewProps) {
  const vocabItems = vocabSec?.content?.items || theorySec?.content?.items || [];
  const readingPassage = dialogueSec?.content || theorySec?.content?.readingPassage || theorySec?.content;
  const rules = theorySec?.content?.rules || [];
  const contractions = theorySec?.content?.contractions || [];
  const grammarFormulas = theorySec?.content?.grammarFormulas || null;
  const postTestQuestions =
    quizSec?.content?.questions ||
    theorySec?.content?.postTestQuestions ||
    theorySec?.content?.conceptChecks ||
    [];

  const summaryText =
    theorySec?.content?.summary ||
    "Di sesi ini, kamu akan membaca teks perkenalan sederhana. Kamu akan belajar mengidentifikasi nama, asal negara, dan menggunakan verb 'to be' secara tepat dalam konteks teks.";
  const passageTitle =
    readingPassage?.passageTitle || readingPassage?.title || "Guided Reading Passage";

  return (
    <div className="space-y-6">
      {/* Step 1: Onboarding & Detailed Mission Briefing */}
      {activeStepId === 1 && (
        <StageReadingOnboarding
          passageTitle={passageTitle}
          summaryText={summaryText}
          vocabItems={vocabItems}
          linguisticTarget={theorySec?.content?.linguisticTarget}
          warmupData={theorySec?.content?.contextWarmup}
          onPlayAudio={tutor.playTutorAudio}
          onNextStep={onNextStep}
          onRewardXp={onRewardXp}
        />
      )}

      {/* Step 2: Interactive 3D Flashcards */}
      {activeStepId === 2 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Langkah 2 · Kosakata Kunci ({vocabItems.length} Kata)
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

      {/* Step 3: Guided Karaoke Reading */}
      {activeStepId === 3 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Langkah 3 · Teks Bacaan Terpandu
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {passageTitle}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Ikuti teks bacaan sambil mendengarkan audio per kata dengan panduan sorotan suara:
            </p>
          </div>
          {readingPassage && (
            <InteractiveReadingPassage
              passage={readingPassage}
              linguisticTarget={theorySec?.content?.linguisticTarget}
              onPlayAudio={tutor.playTutorAudio}
              embedded={true}
            />
          )}
        </div>
      )}

      {/* Step 4: Cable Connection Mini-Game (Sambung Tali Kosakata) */}
      {activeStepId === 4 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Langkah 4 · Uji Ingatan Kosakata
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Hubungkan Kata dengan Makna yang Tepat
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Tarik atau klik pin kata di sebelah kiri, lalu hubungkan talinya ke arti yang tepat di sebelah kanan:
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
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Langkah 5 · Peleburan Kata Singkatan
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Peleburan Singkatan Alami Verb 'To Be'
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Lihat bagaimana kata subjek dan verb &apos;to be&apos; melebur menjadi satu hembusan nafas:
            </p>
          </div>
          <InteractiveContractionMorpher contractions={contractions} embedded={true} />
        </div>
      )}

      {/* Step 6: Interactive Grammar Sentence Builder */}
      {activeStepId === 6 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Langkah 6 · Pola Kalimat
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Struktur Kalimat Verb 'To Be'
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Rakit dan tukar balok kalimat untuk bereksperimen dengan pola kalimat positif, negatif, dan tanya:
            </p>
          </div>
          <InteractiveGrammarCard rules={rules} formulas={grammarFormulas} onPlayAudio={tutor.playTutorAudio} embedded={true} />
        </div>
      )}

      {/* Step 7: Reading Comprehension Checkpoint Quiz */}
      {activeStepId === 7 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Langkah 7 · Evaluasi ({postTestQuestions.length} Soal)
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {quizSec?.title || "Uji Pemahaman Membaca"}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Jawab pertanyaan pemahaman berikut untuk menyelesaikan misi membaca:
            </p>
          </div>
          <ConceptChecksCard conceptChecks={postTestQuestions} accentColor="blue" embedded={true} />
        </div>
      )}
    </div>
  );
}
