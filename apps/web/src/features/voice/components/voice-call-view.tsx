"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Info, Send } from "lucide-react";
import { KhoirulScreen } from "./khoirul-screen";
import { CallHeader } from "@/components/call/CallHeader";
import { CallFooter } from "@/components/call/CallFooter";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useAudioQueue } from "@/hooks/use-audio-queue";
import { getApiUrl } from "@/lib/api-client";
import { voiceApi } from "../api/voice.api";
import { AiQuotaBadge, classesApi } from "@/features/classes";

export interface ChatMessage {
  role: "assistant" | "user";
  content: string;
}

export interface VoiceCallViewProps {
  initialTopic?: string;
  userId?: string;
  studentName?: string;
  moduleId?: string;
}

export function VoiceCallView({
  initialTopic = "Daily Casual Chat & Introduction",
  userId,
  studentName: propStudentName = "",
  moduleId,
}: VoiceCallViewProps) {
  const router = useRouter();

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
  const [callLang, setCallLang] = useState<"en-US" | "id-ID">("en-US");
  const [studentName, setStudentName] = useState<string>(propStudentName);
  const [textInput, setTextInput] = useState<string>("" );
  const [sessionId, setSessionId] = useState<string | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const turnIndexRef = useRef<number>(0);
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

  // Safety watchdog: if speaking state hangs without audio, transition to listening so user can speak
  useEffect(() => {
    let timeout: any;
    if (callStatus === "active" && aiSpeechState === "speaking") {
      timeout = setTimeout(() => {
        if (!audioQueue.isPlaying) {
          isSendingRef.current = false;
          if (callStatusRef.current === "active" && !isMuted) {
            setAiSpeechState("listening");
          }
        }
      }, 7000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [callStatus, aiSpeechState, isMuted, audioQueue.isPlaying]);

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
      abortSpeechRef.current(); // Kill mic to prevent echo

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
          credentials: "include",
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            topic: defaultTopic,
            history: conversationHistoryRef.current.slice(-6),
            studentMessage: cleanText,
            turnIndex: turnIndexRef.current++,
            userId,
            moduleId,
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
          "I hear you! What would you like to explore next?";

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
        isSendingRef.current = false;

        if (!fullReplyAccumulatorRef.current) {
          const fallback =
            "I'm listening closely! Could you elaborate a bit more on that?";
          setConversationHistory([
            ...updatedHistory,
            { role: "assistant", content: fallback },
          ]);
          audioQueue.speakText(fallback);
        } else {
          setConversationHistory([
            ...updatedHistory,
            { role: "assistant", content: fullReplyAccumulatorRef.current },
          ]);
        }
      }
    },
    [audioQueue, defaultTopic, userId]
  );

  // Speech recognition hook
  const {
    liveTranscript,
    setLiveTranscript,
    errorMsg: micError,
    abort: abortSpeech,
  } = useSpeechRecognition({
    canListen,
    studentName,
    lang: callLang,
    onUtteranceReady: (spoken) => {
      setLiveTranscript("");
      handleSendStudentMessage(spoken);
    },
  });

  useEffect(() => {
    if (micError) {
      setErrorMsg(micError);
    }
  }, [micError]);

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
    audioQueue.unlockAudio();
    setErrorMsg(null);

    // Pre-flight voice quota check
    if (userId) {
      try {
        const quota = await classesApi.getQuota(userId);
        if (quota && !quota.canVoice) {
          setErrorMsg(
            `Your daily voice practice quota (${quota.voice.limitMinutes} mins) has been reached. Quota resets at 00:00 or upgrade your plan for unlimited voice practice!`
          );
          setCallStatus("idle");
          return;
        }
      } catch {}
    }

    setDuration(0);
    setLiveTranscript("");
    setCallStatus("connecting");
    turnIndexRef.current = 0;

    try {
      const startRes = await voiceApi.startSession({
        topic: defaultTopic,
        userId,
        moduleId,
        sttProvider: "web-speech",
      });
      if (startRes?.id) {
        setSessionId(startRes.id);
        sessionIdRef.current = startRes.id;
      }
    } catch (e: any) {
      console.warn("Session init fallback:", e);
      if (e?.status === 403 || e?.message?.includes("kuota")) {
        setErrorMsg("Your daily voice call quota has been reached. Please upgrade your plan for more practice time!");
        setCallStatus("idle");
        return;
      }
    }

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
          ? "Hey, welcome back! Good to hear from you again. What are you up to today?"
          : "Hey there! Great to meet you. What would you like to talk about today?");

      if (typeof window !== "undefined") {
        localStorage.setItem("mr_khoirul_call_count", (callCount + 1).toString());
      }

      setCallStatus("active");
      setAiSpeechState("speaking");
      setConversationHistory([{ role: "assistant", content: initialGreeting }]);
      audioQueue.speakText(initialGreeting);
    } catch {
      const fallbackGreeting =
        callCount > 0
          ? "Hey, welcome back! Good to hear from you again. What are you up to today?"
          : "Hey there! Great to meet you. What would you like to talk about today?";

      if (typeof window !== "undefined") {
        localStorage.setItem("mr_khoirul_call_count", (callCount + 1).toString());
      }

      setCallStatus("active");
      setAiSpeechState("speaking");
      setConversationHistory([{ role: "assistant", content: fallbackGreeting }]);
      audioQueue.speakText(fallbackGreeting);
    }
  };

  // End call handler: cleanly shutdown and redirect to /dashboard
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

    setCallStatus("ended");
    setDuration(0);
    setConversationHistory([]);
    setLiveTranscript("");
    setAiSpeechState("idle");

    // Save session in background without blocking navigation
    if (currentHistory.length > 1) {
      voiceApi
        .evaluateSession({
          sessionId: sessionIdRef.current || undefined,
          userId,
          topic: defaultTopic,
          durationSeconds: duration,
          transcript: fullTranscript,
          sttProvider: "web-speech",
        })
        .catch((e) => console.warn("Call save error:", e));
    }

    // Direct redirect back to student dashboard as confirmed
    router.push("/dashboard");
  };

  // Character click handler
  const handleCharacterClick = () => {
    if (callStatus === "idle") {
      audioQueue.unlockAudio();
      handleStartCall();
    } else if (callStatus === "active") {
      if (aiSpeechState === "speaking") {
        handleInterruptToSpeak();
      } else if (isMuted) {
        setIsMuted(false);
      } else if (liveTranscript && liveTranscript.trim().length > 1) {
        abortSpeechRef.current();
        const spoken = liveTranscript.trim();
        setLiveTranscript("");
        handleSendStudentMessage(spoken);
      } else if (aiSpeechState !== "listening") {
        audioQueue.halt();
        isSendingRef.current = false;
        setAiSpeechState("listening");
      }
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || callStatus !== "active") return;
    const msg = textInput.trim();
    setTextInput("");
    isSendingRef.current = false;
    handleSendStudentMessage(msg);
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-white text-slate-900 flex flex-col justify-between overflow-hidden relative select-none">
      {/* Clean Header Bar */}
      <CallHeader
        callStatus={callStatus}
        duration={duration}
        lang={callLang}
        onToggleLang={() => setCallLang((prev) => (prev === "en-US" ? "id-ID" : "en-US"))}
        onExit={handleEndCall}
      />

      {/* Main Screen Area with Pure Mr. Khoirul Character */}
      <main className="flex-1 flex flex-col items-center justify-center relative px-4 z-10 w-full max-w-xl mx-auto">
        {errorMsg && (
          <div className="absolute top-2 max-w-sm w-full p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2 justify-center animate-fadeIn z-30 shadow-sm">
            <Info className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="w-full flex flex-col items-center justify-center">
          {callStatus === "idle" && (
            <div className="mb-3 animate-fadeIn">
              <AiQuotaBadge userId={userId} variant="voice" />
            </div>
          )}

          {/* Mr. Khoirul Pure Character & Floating Info Text */}
          <KhoirulScreen
            callStatus={callStatus}
            aiSpeechState={aiSpeechState}
            isMuted={isMuted}
            onScreenClick={handleCharacterClick}
          />

          {/* Text input fallback for noisy environments (clean white style) */}
          {callStatus === "active" && (
            <form
              onSubmit={handleSendText}
              className="w-full max-w-xs sm:max-w-sm flex items-center gap-2 mt-4 animate-fadeIn"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type a response if microphone is noisy..."
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#0D3B66] focus:bg-white rounded-full px-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={!textInput.trim() || isSendingRef.current}
                className="px-4 py-2 btn-skeuo-yellow disabled:opacity-40 text-slate-950 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shadow-sm"
              >
                <span>Send</span>
                <Send className="w-3 h-3 ml-0.5" />
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Tactile Call Control Footer */}
      <CallFooter
        callStatus={callStatus}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onStartCall={handleStartCall}
        onEndCall={handleEndCall}
      />
    </div>
  );
}
