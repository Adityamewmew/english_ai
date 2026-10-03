"use client";

import { useState, useCallback } from "react";
import { useGameSound } from "./use-game-sound";

export interface FloatingXpNotice {
  id: number;
  amount: number;
  text?: string;
}

export function useGamification() {
  const [xp, setXp] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [floatingList, setFloatingList] = useState<FloatingXpNotice[]>([]);

  const { isMuted, toggleMute, playCorrect, playWrong, playSnap, playCelebrate } = useGameSound();

  const awardXp = useCallback(
    (amount: number = 15, reason?: string) => {
      setXp((prev) => prev + amount);
      setStreak((prev) => prev + 1);

      playCorrect();

      // Trigger floating animation
      const noticeId = Date.now();
      setFloatingList((prev) => [...prev, { id: noticeId, amount, text: reason }]);

      // Remove floating badge after 1.5s
      setTimeout(() => {
        setFloatingList((prev) => prev.filter((n) => n.id !== noticeId));
      }, 1500);
    },
    [playCorrect]
  );

  const penalizeWrong = useCallback(() => {
    setStreak(0);
    playWrong();
  }, [playWrong]);

  const awardMilestoneCelebrate = useCallback(() => {
    setXp((prev) => prev + 50);
    playCelebrate();
  }, [playCelebrate]);

  return {
    xp,
    streak,
    floatingList,
    isMuted,
    toggleMute,
    awardXp,
    penalizeWrong,
    playSnap,
    awardMilestoneCelebrate,
  };
}
