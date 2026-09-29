"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/components/modules/ModuleAIAssistant";

interface UseModuleTutorProps {
  moduleId: string;
  studentName?: string;
}

export function useModuleTutor({ moduleId, studentName = "" }: UseModuleTutorProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto load tailored greeting for this module
  useEffect(() => {
    async function loadGreeting() {
      if (!moduleId) return;
      try {
        const greetRes = await fetch(
          `/api/curriculum/modules/${moduleId}/tutor/greeting?studentName=${encodeURIComponent(
            studentName
          )}`
        ).catch(() => null);

        if (greetRes && greetRes.ok) {
          const greetJson = await greetRes.json();
          if (greetJson.success && greetJson.data?.greeting) {
            setTutorMessages([
              {
                id: "initial-greeting",
                role: "assistant",
                text: greetJson.data.greeting,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Gagal memuat salam AI Tutor:", err);
      }
    }

    loadGreeting();
  }, [moduleId, studentName]);

  // Audio Playback
  const playTutorAudio = (text: string) => {
    if (typeof window === "undefined") return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsSpeaking(true);

    const clean = text.replace(/[*_#]/g, "").trim();
    const encoded = encodeURIComponent(clean.slice(0, 800));
    const audio = new Audio(`/api/voice/tts?text=${encoded}`);
    audioRef.current = audio;

    audio.onended = () => {
      setIsSpeaking(false);
      if (isCalling) {
        startSpeechRecognition();
      }
    };

    audio.onerror = (e) => {
      console.warn("TTS audio element error, checking speech synthesis fallback:", e);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(clean);
        // Autodetect Indonesian vs English content so Indonesian words are not anglicized
        const hasIndonesian = /\b(halo|saya|ini|kita|kamu|anda|dan|di|ke|yang|adalah|bisa|belajar|dengan|untuk|sudah|latihan|tutor|modul)\b/i.test(clean);
        utt.lang = hasIndonesian ? "id-ID" : "en-US";
        utt.rate = 0.95;
        utt.onend = () => {
          setIsSpeaking(false);
          if (isCalling) startSpeechRecognition();
        };
        utt.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utt);
      } else {
        setIsSpeaking(false);
      }
    };

    audio.play().catch(() => {
      setIsSpeaking(false);
    });
  };

  // Speech Recognition (Mic Input)
  const startSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const rec = new SpeechRec();
      rec.lang = "id-ID";
      rec.continuous = false;
      rec.interimResults = false;

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          handleSendTutorMessage(transcript);
        }
      };

      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);

      rec.start();
      recognitionRef.current = rec;
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Send message to AI Tutor
  const handleSendTutorMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isThinking) return;

    stopSpeechRecognition();
    setInputText("");

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const nextHistory = [...tutorMessages, userMsg];
    setTutorMessages(nextHistory);
    setIsThinking(true);

    try {
      const historyPayload = nextHistory.map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const res = await fetch(`/api/curriculum/modules/${moduleId}/tutor/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          studentName,
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.reply) {
        const replyText = json.data.reply;
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setTutorMessages((prev) => [...prev, assistantMsg]);

        if (isCalling) {
          playTutorAudio(replyText);
        }
      }
    } catch (err) {
      console.error("Gagal chat dengan tutor modul:", err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleToggleCall = () => {
    if (isCalling) {
      setIsCalling(false);
      stopSpeechRecognition();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsSpeaking(false);
    } else {
      setIsCalling(true);
      const lastAssistantMsg = [...tutorMessages].reverse().find((m) => m.role === "assistant");
      if (lastAssistantMsg) {
        playTutorAudio(lastAssistantMsg.text);
      } else {
        startSpeechRecognition();
      }
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  const handleToggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  return {
    isChatOpen,
    setIsChatOpen,
    isCalling,
    isSpeaking,
    isListening,
    isThinking,
    tutorMessages,
    inputText,
    setInputText,
    handleSendTutorMessage,
    handleToggleCall,
    handleToggleMic,
    handleToggleChat,
    playTutorAudio,
  };
}
