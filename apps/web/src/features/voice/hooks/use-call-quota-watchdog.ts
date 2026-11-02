"use client";

import { useEffect, useRef } from "react";

interface UseCallQuotaWatchdogProps {
  callStatus: "idle" | "connecting" | "active" | "evaluating" | "ended";
  duration: number;
  maxAllowedSeconds: number | null; // null or -1 means unlimited
  onQuotaExceeded: () => void;
}

export function useCallQuotaWatchdog({
  callStatus,
  duration,
  maxAllowedSeconds,
  onQuotaExceeded,
}: UseCallQuotaWatchdogProps) {
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (callStatus === "connecting" || callStatus === "idle") {
      hasTriggeredRef.current = false;
    }
  }, [callStatus]);

  useEffect(() => {
    if (
      callStatus === "active" &&
      !hasTriggeredRef.current &&
      maxAllowedSeconds !== null &&
      maxAllowedSeconds !== -1 &&
      duration >= maxAllowedSeconds
    ) {
      hasTriggeredRef.current = true;
      onQuotaExceeded();
    }
  }, [callStatus, duration, maxAllowedSeconds, onQuotaExceeded]);
}

