"use client";

import React from "react";
import { CheckCircle2, Headphones, PenTool, Mic, Check, Loader2 } from "lucide-react";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { SpeakingRecorder } from "@/components/audio/SpeakingRecorder";

interface PlacementDesktopFormProps {
  mcqs: Array<{ id: string; question: string; options: string[] }>;
  listening: Array<{ id: string; question: string; options: string[]; audioUrl?: string; audioScript?: string }>;
  writing: Array<{ id: string; question: string }>;
  speaking: Array<{ id: string; question: string }>;
  mcqAnswers: Record<string, string>;
  listeningAnswers: Record<string, string>;
  writingAnswers: Record<string, string>;
  speakingAnswers: Record<string, string>;
  onSelectOption: (type: "mcq" | "listening", questionId: string, option: string) => void;
  onWritingChange: (questionId: string, text: string) => void;
  onSpeakingTranscript: (questionId: string, transcript: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  errorMsg: string | null;
}

export function PlacementDesktopForm({
  mcqs = [],
  listening = [],
  writing = [],
  speaking = [],
  mcqAnswers,
  listeningAnswers,
  writingAnswers,
  speakingAnswers,
  onSelectOption,
  onWritingChange,
  onSpeakingTranscript,
  onSubmit,
  isSubmitting,
  errorMsg,
}: PlacementDesktopFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Section 1: Grammar & Vocabulary (10 MCQ) */}
      {mcqs.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 border-b-4 border-b-slate-300 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h2 className="font-heading text-base font-bold text-primary">
              1. Grammar &amp; Vocabulary
            </h2>
          </div>

          <div className="space-y-6">
            {mcqs.map((q: any, idx: number) => (
              <div key={q.id} className="space-y-2.5 pt-1">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-slate-400 mt-0.5 min-w-[20px]">
                    {idx + 1}.
                  </span>
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">
                    {q.question}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                  {(q.options || []).map((opt: string) => {
                    const isSelected = mcqAnswers[q.id] === opt;
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => onSelectOption("mcq", q.id, opt)}
                        className={`text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all min-h-[44px] flex items-center justify-between cursor-pointer select-none ${
                          isSelected
                            ? "bg-primary text-white border-2 border-primary border-b-4 border-b-[#081f34] shadow-xs font-bold translate-y-0.5"
                            : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 border-b-3 border-b-slate-300 active:border-b active:translate-y-0.5"
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <Check className="w-4 h-4 ml-2 shrink-0 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Listening */}
      {listening.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 border-b-4 border-b-slate-300 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold">
              <Headphones className="w-4 h-4" />
            </div>
            <h2 className="font-heading text-base font-bold text-primary">
              2. Listening Comprehension
            </h2>
          </div>

          <div className="space-y-8">
            {listening.map((l: any, idx: number) => (
              <div key={l.id} className="space-y-3 pt-3 border-t first:border-t-0 first:pt-0">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-purple-700 mt-0.5 min-w-[20px]">
                    {idx + 1}.
                  </span>
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">
                    {l.question}
                  </p>
                </div>

                <div className="pl-7">
                  <AudioPlayer
                    audioUrl={l.audioUrl}
                    audioScript={l.audioScript}
                    title={`Audio #${idx + 1}`}
                    hideTranscript={true}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7 pt-1">
                  {(l.options || []).map((opt: string) => {
                    const isSelected = listeningAnswers[l.id] === opt;
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => onSelectOption("listening", l.id, opt)}
                        className={`text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all min-h-[44px] flex items-center justify-between cursor-pointer select-none ${
                          isSelected
                            ? "bg-primary text-white border-2 border-primary border-b-4 border-b-[#081f34] shadow-xs font-bold translate-y-0.5"
                            : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 border-b-3 border-b-slate-300 active:border-b active:translate-y-0.5"
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <Check className="w-4 h-4 ml-2 shrink-0 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Writing */}
      {writing.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 border-b-4 border-b-slate-300 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
              <PenTool className="w-4 h-4" />
            </div>
            <h2 className="font-heading text-base font-bold text-primary">
              3. Writing
            </h2>
          </div>

          <div className="space-y-6">
            {writing.map((w: any, idx: number) => {
              const words = (writingAnswers[w.id] || "").split(/\s+/).filter(Boolean).length;
              return (
                <div key={w.id} className="space-y-2 pt-1">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-emerald-700 mt-0.5 min-w-[20px]">
                      {idx + 1}.
                    </span>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {w.question}
                    </p>
                  </div>

                  <div className="pl-7 space-y-1">
                    <textarea
                      rows={3}
                      value={writingAnswers[w.id] || ""}
                      onChange={(e) => onWritingChange(w.id, e.target.value)}
                      placeholder="Write your response in English here..."
                      className="w-full p-3.5 rounded-xl border border-slate-200 border-b-2 border-b-slate-300 bg-[#FBFBFE] focus:bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-600 transition-all font-normal shadow-inner"
                    />
                    <div className="text-right text-[10px] text-slate-400">
                      {words} words
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 4: Speaking */}
      {speaking.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 border-b-4 border-b-slate-300 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-secondary flex items-center justify-center font-bold">
              <Mic className="w-4 h-4" />
            </div>
            <h2 className="font-heading text-base font-bold text-primary">
              4. Speaking
            </h2>
          </div>

          <div className="space-y-6">
            {speaking.map((s: any, idx: number) => (
              <div key={s.id} className="space-y-2.5 pt-1">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-secondary mt-0.5 min-w-[20px]">
                    {idx + 1}.
                  </span>
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">
                    {s.question}
                  </p>
                </div>

                <div className="pl-7">
                  <SpeakingRecorder
                    key={s.id}
                    onTranscriptChange={(transcript) => onSpeakingTranscript(s.id, transcript)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="text-center pt-2 pb-8 space-y-3">
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold max-w-md mx-auto">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto min-w-[280px] min-h-[52px] px-8 py-3.5 bg-secondary hover:bg-[#d4720e] text-white rounded-2xl text-sm font-extrabold border-b-4 border-b-[#a85507] active:border-b-0 active:translate-y-1 shadow-md transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              Evaluating...
            </span>
          ) : (
            "Submit Answers & Complete Assessment"
          )}
        </button>
      </div>
    </form>
  );
}
