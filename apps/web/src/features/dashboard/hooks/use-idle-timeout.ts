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
  const idleMs = idleMinutes * 60 * 1000;
  const warningDurationSec = warningMinutes * 60;

  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(warningDurationSec);

  const lastActivityRef = useRef<number>(Date.now());
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIsWarningOpen(false);
    setRemainingSeconds(warningDurationSec);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    // Ping session endpoint silently to renew backend cookie
    try {
      authClient.getSession().catch(() => {});
    } catch {}
  }, [warningDurationSec]);

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
    const handleUserActivity = () => {
      // If warning modal is already open, do not reset automatically (require explicit click to confirm student is still there)
      if (isWarningOpen) return;

      if (!throttleTimeout) {
        lastActivityRef.current = Date.now();
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, 3000); // Throttle activity updates to once every 3s
      }
    };

    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    // Periodic check every 10 seconds to detect idle threshold
    const checkInterval = setInterval(() => {
      if (isWarningOpen) return;
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= idleMs) {
        setIsWarningOpen(true);
        setRemainingSeconds(warningDurationSec);
      }
    }, 10000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      clearInterval(checkInterval);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [idleMs, isWarningOpen, warningDurationSec]);

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

