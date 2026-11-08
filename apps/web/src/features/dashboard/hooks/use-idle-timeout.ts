"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { authClient } from "@/lib/auth-client";

interface UseIdleTimeoutOptions {
  idleMinutes?: number;
  warningMinutes?: number;
}

export function useIdleTimeout({
  idleMinutes = 25,
  warningMinutes = 5,
}: UseIdleTimeoutOptions = {}) {
  // Support ?idle_test=1 URL query parameter for QA rapid verification (10s idle, 15s countdown)
  const isDebugIdle =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("idle_test") === "1";

  const effectiveIdleMs = isDebugIdle ? 10 * 1000 : idleMinutes * 60 * 1000;
  const effectiveWarningSec = isDebugIdle ? 15 : warningMinutes * 60;

  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(effectiveWarningSec);

  const lastActivityRef = useRef<number>(Date.now());
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIsWarningOpen(false);
    setRemainingSeconds(effectiveWarningSec);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    // Ping session endpoint silently to renew backend cookie
    try {
      authClient.getSession().catch(() => {});
    } catch {}
  }, [effectiveWarningSec]);

  const handleLogout = useCallback(async () => {
    try {
      await authClient.signOut();
    } catch {}
    if (typeof window !== "undefined") {
      window.location.href = "/login?reason=idle_timeout";
    }
  }, []);

  // Activity listeners to update lastActivity timestamp
  useEffect(() => {
    if (typeof window === "undefined") return;

    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttleDelay = isDebugIdle ? 500 : 3000;

    const handleUserActivity = () => {
      // If warning modal is already open, do not reset automatically (require explicit click to confirm student is still there)
      if (isWarningOpen) return;

      if (!throttleTimeout) {
        lastActivityRef.current = Date.now();
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, throttleDelay);
      }
    };

    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    // Periodic check to detect idle threshold (1s in debug mode, 10s in production)
    const checkIntervalMs = isDebugIdle ? 1000 : 10000;
    const checkInterval = setInterval(() => {
      if (isWarningOpen) return;
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= effectiveIdleMs) {
        setIsWarningOpen(true);
        setRemainingSeconds(effectiveWarningSec);
      }
    }, checkIntervalMs);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      clearInterval(checkInterval);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [effectiveIdleMs, effectiveWarningSec, isDebugIdle, isWarningOpen]);

  // Countdown when warning is active
  useEffect(() => {
    if (!isWarningOpen) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      return;
    }

    countdownIntervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [isWarningOpen, handleLogout]);

  return {
    isWarningOpen,
    remainingSeconds,
    resetTimer,
    logout: handleLogout,
  };
}

