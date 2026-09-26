"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  reconcileUniversalName,
  isThoughtIncomplete,
  isValidStudentUtterance,
} from "@/lib/call-utils";

interface UseSpeechRecognitionProps {
  canListen: boolean;
  studentName?: string;
  lang?: string;
  onUtteranceReady: (text: string) => void;
}

export function useSpeechRecognition({
  canListen,
  studentName = "",
  lang = "id-ID",
  onUtteranceReady,
}: UseSpeechRecognitionProps) {
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const canListenRef = useRef(canListen);
  const studentNameRef = useRef(studentName);
  const onUtteranceReadyRef = useRef(onUtteranceReady);

  useEffect(() => {
    canListenRef.current = canListen;
  }, [canListen]);

  useEffect(() => {
    studentNameRef.current = studentName;
  }, [studentName]);

  useEffect(() => {
    onUtteranceReadyRef.current = onUtteranceReady;
  }, [onUtteranceReady]);

  const abort = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!canListenRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg("Fitur mikrofon suara tidak didukung di browser ini.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        if (!canListenRef.current) {
          return;
        }

        // Accumulate entire utterance across this active turn
        let fullFinal = "";
        let fullInterim = "";

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            fullFinal += res[0].transcript + " ";
          } else {
            fullInterim += res[0].transcript;
          }
        }

        let spoken = (fullFinal + fullInterim).trim();
        if (!spoken || spoken.length < 2) return;

        // Reconcile user profile name
        spoken = reconcileUniversalName(spoken, studentNameRef.current);
        setLiveTranscript(spoken);

        // Reject phantom noises or single filler transients
        if (!isValidStudentUtterance(spoken)) {
          return;
        }

        // Snappy conversational trigger: 750ms for completed phrases, 1600ms if formulating thought
        const incomplete = isThoughtIncomplete(spoken);
        const delay = incomplete ? 1600 : 750;

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (!canListenRef.current) return;
          const finalSpoken = spoken;
          silenceTimerRef.current = null;
          setLiveTranscript("");
          if (recognitionRef.current) {
            try {
              recognitionRef.current.onresult = null;
              recognitionRef.current.onend = null;
              recognitionRef.current.onerror = null;
              recognitionRef.current.abort();
            } catch {}
            recognitionRef.current = null;
          }
          onUtteranceReadyRef.current(finalSpoken);
        }, delay);
      };

      recognition.onerror = (event: any) => {
        if (event.error === "not-allowed" || event.error === "audio-capture") {
          setErrorMsg("Izin mikrofon diperlukan untuk melakukan panggilan suara.");
        }
      };

      recognition.onend = () => {
        if (canListenRef.current && recognitionRef.current === recognition) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("SpeechRecognition start error:", err);
    }
  }, [lang]);

  // Sync listening state with canListen
  useEffect(() => {
    if (canListen) {
      start();
    } else {
      abort();
    }
  }, [canListen, start, abort]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abort();
    };
  }, [abort]);

  return {
    liveTranscript,
    setLiveTranscript,
    errorMsg,
    setErrorMsg,
    start,
    stop,
    abort,
  };
}
