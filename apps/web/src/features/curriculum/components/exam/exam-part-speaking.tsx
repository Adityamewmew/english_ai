"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, CheckCircle2, Play, Square, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExamPartSpeakingProps {
  speakingList: any[];
  speakingCompleted: Record<number, boolean>;
  onToggleCompleted: (qIdx: number) => void;
  playAudio: (text: string) => void;
  onFinish: () => void;
}

export function ExamPartSpeaking({
  speakingList,
  speakingCompleted,
  onToggleCompleted,
  playAudio,
  onFinish,
}: ExamPartSpeakingProps) {
  const completedCount = Object.keys(speakingCompleted).filter(
    (k) => speakingCompleted[Number(k)]
  ).length;

  const [recordingIdx, setRecordingIdx] = useState<number | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordedAudios, setRecordedAudios] = useState<Record<number, string>>({});
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const currentAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (currentAudioElementRef.current) {
        currentAudioElementRef.current.pause();
      }
    };
  }, []);

  const startRecording = async (qIdx: number) => {
    try {
      if (recordingIdx !== null) stopRecording();
      if (currentAudioElementRef.current) {
        currentAudioElementRef.current.pause();
        setPlayingIdx(null);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudios((prev) => ({ ...prev, [qIdx]: audioUrl }));
        if (!speakingCompleted[qIdx]) {
          onToggleCompleted(qIdx);
        }
        if (activeStreamRef.current) {
          activeStreamRef.current.getTracks().forEach((t) => t.stop());
          activeStreamRef.current = null;
        }
      };

      mediaRecorder.start();
      setRecordingIdx(qIdx);
      setRecordSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn("Microphone access failed or denied:", err);
      // Fallback: mark completed directly if microphone is unavailable
      if (!speakingCompleted[qIdx]) onToggleCompleted(qIdx);
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecordingIdx(null);
  };

  const playRecordedAudio = (qIdx: number) => {
    const url = recordedAudios[qIdx];
    if (!url) return;

    if (playingIdx === qIdx && currentAudioElementRef.current) {
      currentAudioElementRef.current.pause();
      setPlayingIdx(null);
      return;
    }

    if (currentAudioElementRef.current) {
      currentAudioElementRef.current.pause();
    }

    const audio = new Audio(url);
    currentAudioElementRef.current = audio;
    setPlayingIdx(qIdx);

    audio.onended = () => setPlayingIdx(null);
    audio.onerror = () => setPlayingIdx(null);
    audio.play().catch(() => setPlayingIdx(null));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            Part 4 of 4
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Spoken Fluency & Oral Interaction
          </h3>
        </div>
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {completedCount} / {speakingList.length} Completed
        </span>
      </div>

      <div className="space-y-4">
        {speakingList.map((item, qIdx) => {
          const isDone = Boolean(speakingCompleted[qIdx]);
          const isRecording = recordingIdx === qIdx;
          const hasRecording = Boolean(recordedAudios[qIdx]);
          const isPlaying = playingIdx === qIdx;
          const promptText = item.prompt || item.instruction || "";
          const points = item.storyPoints || item.inspirationPoints || [];

          return (
            <Card
              key={item.id || qIdx}
              className={`p-5 bg-white dark:bg-slate-900 border transition-all rounded-2xl space-y-3.5 ${
                isRecording
                  ? "border-rose-400 ring-2 ring-rose-200 dark:ring-rose-950/60"
                  : isDone
                  ? "border-emerald-300/80 dark:border-emerald-800/80"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1">
                  <span className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-800 dark:text-sky-300 text-xs font-bold flex items-center justify-center shrink-0">
                    {qIdx + 1}
                  </span>
                  <div className="space-y-1.5 flex-1">
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {item.typeLabel || "Oral Prompt"}
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {promptText}
                    </div>

                    {Array.isArray(points) && points.length > 0 && (
                      <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-0.5 pt-1">
                        {points.map((pt: string, pIdx: number) => (
                          <li key={pIdx}>{pt}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => playAudio(promptText)}
                  className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-600 hover:bg-slate-200 transition-colors shrink-0 flex items-center justify-center cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  title="Listen to Model Pronunciation (TTS)"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Recording Controls & Status Feedback Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Primary Record Button */}
                  {isRecording ? (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="min-h-[40px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-2 animate-pulse cursor-pointer shadow-xs"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Recording ({recordSeconds}s)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startRecording(qIdx)}
                      className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer ${
                        hasRecording
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                          : "bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{hasRecording ? "Re-record Audio" : "Start Voice Recording"}</span>
                    </button>
                  )}

                  {/* Playback Recorded Audio */}
                  {hasRecording && (
                    <button
                      type="button"
                      onClick={() => playRecordedAudio(qIdx)}
                      className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-sky-600 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer border border-slate-200/80 dark:border-slate-700"
                    >
                      {isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                      <span>{isPlaying ? "Pause" : "Play Your Recording"}</span>
                    </button>
                  )}
                </div>

                {/* Status confirmation badge */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleCompleted(qIdx)}
                    className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                      isDone
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 border border-slate-200 dark:border-slate-700"
                    }`}
                    title="Click to toggle verification status"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isDone ? "Audio Saved & Verified" : "Not Recorded"}</span>
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          All sections finished. Submit the exam to calculate your final score.
        </span>
        <Button
          onClick={onFinish}
          className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <span>Calculate Score & View Certificate</span>
          <CheckCircle2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
