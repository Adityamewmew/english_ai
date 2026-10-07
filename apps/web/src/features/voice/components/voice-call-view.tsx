"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Info } from "lucide-react";
import { VoiceOrb } from "@/components/call/VoiceOrb";
import { CallHeader } from "@/components/call/CallHeader";
import { CallFooter } from "@/components/call/CallFooter";
import { CallTranscriptDrawer, ChatMessage } from "@/components/call/CallTranscriptDrawer";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useAudioQueue } from "@/hooks/use-audio-queue";
import { getApiUrl } from "@/lib/api-client";
import { voiceApi } from "../api/voice.api";

export interface VoiceCallViewProps {
  initialTopic?: string;
  userId?: string;
  studentName?: string;
}

export function VoiceCallView({
  initialTopic = "Daily Casual Chat & Introduction",
  userId,
  studentName: propStudentName = "",
}: VoiceCallViewProps) {
  const [callStatus, setCallStatus] = useState<
    "idle" | "connecting" | "active" | "evaluating" | "ended"
  >("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [aiSpeechState, setAiSpeechState] = useState<
    "idle" | "speaking" | "listening" | "thinking"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [callLang, setCallLang] = useState<"en-US" | "id-ID">("en-US");
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>(propStudentName);

  const defaultTopic = initialTopic;

  const isSendingRef = useRef(false);
  const speechTurnIdRef = useRef(0);
  const streamAbortRef = useRef<AbortController | null>(null);
  const fullReplyAccumulatorRef = useRef<string>("");
  const callStatusRef = useRef(callStatus);
  const conversationHistoryRef = useRef(conversationHistory);

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    conversationHistoryRef.current = conversationHistory;
  }, [conversationHistory]);

  // Duration timer
  useEffect(() => {
    let interval: any;
    if (callStatus === "active") {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const abortSpeechRef = useRef<() => void>(() => {});

  // Audio queue for sequential streaming TTS with 0-gap preloading
  const audioQueue = useAudioQueue({
    onSentenceStart: () => {
      setAiSpeechState("speaking");
    },
    onAllEnded: () => {
      isSendingRef.current = false;
      if (callStatusRef.current === "active" && !isMuted) {
        setAiSpeechState("listening");
      }
    },
  });

  // Half-duplex auto-gating: mic is ONLY open when student's turn to speak
  const canListen =
    callStatus === "active" &&
    aiSpeechState === "listening" &&
    !isMuted &&
    !isSendingRef.current;

  // Send student turn to streaming AI backend
  const handleSendStudentMessage = useCallback(
    async (text: string) => {
      const cleanText = text.trim();
      if (
        !cleanText ||
        cleanText.length < 2 ||
        isSendingRef.current ||
        callStatusRef.current !== "active"
      ) {
        return;
      }

      isSendingRef.current = true;
      abortSpeechRef.current(); // Immediately kill microphone to prevent echo and duplicate triggers

      const currentTurnId = ++speechTurnIdRef.current;

      audioQueue.halt();
      audioQueue.resetForNewTurn();
      fullReplyAccumulatorRef.current = "";

      setAiSpeechState("thinking");

      const updatedHistory: ChatMessage[] = [
        ...conversationHistoryRef.current,
        { role: "user", content: cleanText },
      ];
      setConversationHistory(updatedHistory);

      const abortController = new AbortController();
      streamAbortRef.current = abortController;

      try {
        const res = await fetch(getApiUrl("/api/voice/turn-stream"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: defaultTopic,
            history: updatedHistory.slice(-4),
            studentMessage: cleanText,
            userId,
          }),
          signal: abortController.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`Turn stream HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let receivedAnySentence = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (currentTurnId !== speechTurnIdRef.current) {
            try {
              reader.cancel();
            } catch {}
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data:")) continue;
            const dataStr = trimmed.slice(5).trim();

            try {
              const event = JSON.parse(dataStr);
              if (event.type === "sentence" && event.text) {
                receivedAnySentence = true;
                fullReplyAccumulatorRef.current +=
                  (fullReplyAccumulatorRef.current ? " " : "") + event.text;

                audioQueue.enqueueSentence(event.text, event.index);
              } else if (event.type === "done") {
                audioQueue.markStreamDone();
                if (event.fullReply) {
                  fullReplyAccumulatorRef.current = event.fullReply;
                }
              }
            } catch {}
          }
        }

        audioQueue.markStreamDone();

        if (currentTurnId !== speechTurnIdRef.current) return;

        const finalReply =
          fullReplyAccumulatorRef.current ||
          "That sounds wonderful! What do you enjoy most about that?";

        if (!receivedAnySentence) {
          audioQueue.speakText(finalReply);
        }

        const nextHistory: ChatMessage[] = [
          ...updatedHistory,
          { role: "assistant", content: finalReply },
        ];
        setConversationHistory(nextHistory);
      } catch (err: any) {
        if (currentTurnId !== speechTurnIdRef.current) return;
        audioQueue.markStreamDone();

        if (!fullReplyAccumulatorRef.current) {
          const fallback = "That sounds wonderful! Could you tell me a little bit more about that?";
          setConversationHistory([...updatedHistory, { role: "assistant", content: fallback }]);
          audioQueue.speakText(fallback);
        } else {
          setConversationHistory([
            ...updatedHistory,
            { role: "assistant", content: fullReplyAccumulatorRef.current },
          ]);
        }
      }
    },
    [audioQueue, defaultTopic]
  );

  // Speech recognition hook
  const { liveTranscript, setLiveTranscript, abort: abortSpeech } = useSpeechRecognition({
    canListen,
    studentName,
    lang: callLang,
    onUtteranceReady: (spoken) => {
      setLiveTranscript("");
      handleSendStudentMessage(spoken);
    },
  });

  useEffect(() => {
    abortSpeechRef.current = abortSpeech;
  }, [abortSpeech]);

  // Cut off tutor speech (interruption)
  const handleInterruptToSpeak = useCallback(() => {
    audioQueue.halt();
    if (streamAbortRef.current) {
      try {
        streamAbortRef.current.abort();
      } catch {}
      streamAbortRef.current = null;
    }
    isSendingRef.current = false;
    setAiSpeechState("listening");
  }, [audioQueue]);

  // Start call handler
  const handleStartCall = async () => {
    setErrorMsg(null);
    setDuration(0);
    setLiveTranscript("");
    setCallStatus("connecting");

    const callCount =
      typeof window !== "undefined"
        ? parseInt(localStorage.getItem("mr_khoirul_call_count") || "0", 10)
        : 0;

    try {
      const res = await voiceApi.getInitialGreeting({
        topic: defaultTopic,
        userId,
        name: studentName,
      });

      const initialGreeting =
        res?.greeting ||
        (callCount > 0
          ? "Hey, welcome back! Good to hear from you again. How are things with you today?"
          : "Hey there! Good to hear your voice again. Ready to practice some English today?");

      if (typeof window !== "undefined") {
        localStorage.setItem("mr_khoirul_call_count", (callCount + 1).toString());
      }

      setCallStatus("active");
      setConversationHistory([{ role: "assistant", content: initialGreeting }]);
      audioQueue.speakText(initialGreeting);
    } catch {
      const fallbackGreeting =
        callCount > 0
          ? "Hey, welcome back! Good to hear from you again. How are things with you today?"
          : "Hey there! Good to hear your voice again. Ready to practice some English today?";

      if (typeof window !== "undefined") {
        localStorage.setItem("mr_khoirul_call_count", (callCount + 1).toString());
      }

      setCallStatus("active");
      setConversationHistory([{ role: "assistant", content: fallbackGreeting }]);
      audioQueue.speakText(fallbackGreeting);
    }
  };

  // End call handler
  const handleEndCall = async () => {
    abortSpeech();
    audioQueue.halt();
    if (streamAbortRef.current) {
      try {
        streamAbortRef.current.abort();
      } catch {}
      streamAbortRef.current = null;
    }

    const currentHistory = conversationHistoryRef.current;
    const fullTranscript = currentHistory
      .map((m) => `${m.role === "assistant" ? "Mr. Khoirul" : "Student"}: ${m.content}`)
      .join("\n");

    setCallStatus("idle");
    setDuration(0);
    setConversationHistory([]);
    setLiveTranscript("");
    setAiSpeechState("idle");

    try {
      await voiceApi.evaluateSession({
        userId,
        topic: defaultTopic,
        durationSeconds: duration,
        transcript: fullTranscript,
      });
    } catch (e) {
      console.warn("Call save error:", e);
    }
  };

  const handleOrbClick = () => {
    if (callStatus === "idle") {
      handleStartCall();
    } else if (callStatus === "active") {
      if (aiSpeechState === "speaking") {
        handleInterruptToSpeak();
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-black text-white flex flex-col justify-between overflow-hidden relative select-none">
      <CallHeader
        callStatus={callStatus}
        duration={duration}
        showSubtitles={showSubtitles}
        lang={callLang}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onToggleSubtitles={() => setShowSubtitles((prev) => !prev)}
        onToggleLang={() => setCallLang((prev) => (prev === "en-US" ? "id-ID" : "en-US"))}
      />

      <main className="flex-1 flex flex-col items-center justify-center relative px-6 z-10">
        {errorMsg && (
          <div className="absolute top-2 max-w-sm w-full p-3 bg-red-950/80 border border-red-500/40 rounded-2xl text-xs text-red-200 flex items-center gap-2 justify-center animate-fadeIn z-30">
            <Info className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex flex-col items-center justify-center space-y-6">
            <VoiceOrb
              state={
                callStatus === "idle"
                  ? "idle"
                  : callStatus === "connecting"
                  ? "connecting"
                  : aiSpeechState
              }
              onClick={handleOrbClick}
              isMuted={isMuted}
            />

            {callStatus === "idle" && (
              <p className="text-xs text-zinc-500 tracking-wide font-normal animate-pulse text-center">
                Ketuk bundaran untuk mulai berbicara
              </p>
            )}

            {callStatus === "connecting" && (
              <p className="text-xs text-zinc-400 tracking-wide font-normal animate-pulse text-center">
                Menghubungkan ke Mr. Khoirul...
              </p>
            )}

            {callStatus === "active" && showSubtitles && (
              <div className="min-h-[56px] max-w-sm px-4 flex flex-col items-center justify-center text-center">
                {aiSpeechState === "speaking" && audioQueue.currentSubtitle && (
                  <p className="text-sm text-zinc-200 font-normal leading-relaxed animate-fadeIn line-clamp-3">
                    &ldquo;{audioQueue.currentSubtitle}&rdquo;
                  </p>
                )}

                {aiSpeechState === "listening" && (
                  liveTranscript ? (
                    <p className="text-xs sm:text-sm text-sky-300 font-medium leading-relaxed animate-fadeIn">
                      {liveTranscript}
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-500 font-normal animate-pulse">
                      Mendengarkan suaramu...
                    </p>
                  )
                )}

                {aiSpeechState === "thinking" && (
                  <p className="text-xs text-indigo-300 font-normal animate-pulse">
                    Mr. Khoirul sedang merespons...
                  </p>
                )}
              </div>
            )}
          </div>
      </main>

      <CallFooter
        callStatus={callStatus}
        onStartCall={handleStartCall}
        onEndCall={handleEndCall}
      />

      <CallTranscriptDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        showSubtitles={showSubtitles}
        onToggleSubtitles={() => setShowSubtitles((prev) => !prev)}
        conversationHistory={conversationHistory}
        callStatus={callStatus}
        onEndCall={handleEndCall}
      />
    </div>
  );
}
