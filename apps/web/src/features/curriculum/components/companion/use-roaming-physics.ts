"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseRoamingPhysicsOptions {
  isLocked?: boolean;
  minPercent?: number;
  maxPercent?: number;
  speed?: number; // percent per second
  elementRef?: React.RefObject<HTMLDivElement | null>;
}

export function useRoamingPhysics({
  isLocked = false,
  minPercent = 14,
  maxPercent = 82,
  speed = 13.5,
  elementRef,
}: UseRoamingPhysicsOptions = {}) {
  const [xPercent, setXPercent] = useState<number>(25);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = right, -1 = left
  const [isWalking, setIsWalking] = useState<boolean>(true);

  const stateRef = useRef({
    xPercent: 25,
    direction: 1 as 1 | -1,
    isWalking: true,
    isLocked,
    minPercent,
    maxPercent,
    speed,
    isPausingAtBoundary: false,
  });

  const boundaryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const randomPauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state ref
  useEffect(() => {
    stateRef.current.isLocked = isLocked;
    stateRef.current.minPercent = minPercent;
    stateRef.current.maxPercent = maxPercent;
    stateRef.current.speed = speed;

    if (isLocked) {
      if (boundaryTimeoutRef.current) clearTimeout(boundaryTimeoutRef.current);
      if (randomPauseTimeoutRef.current) clearTimeout(randomPauseTimeoutRef.current);
      setIsWalking(false);
      stateRef.current.isWalking = false;
    }
  }, [isLocked, minPercent, maxPercent, speed]);

  // Main 60fps physics loop
  useEffect(() => {
    let lastTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1); // clamp delta to prevent jumps
      lastTime = now;

      const current = stateRef.current;

      if (!current.isLocked && current.isWalking && !current.isPausingAtBoundary) {
        const activeSpeed = current.speed;
        let nextX = current.xPercent + current.direction * activeSpeed * delta;

        // Check right boundary
        if (nextX >= current.maxPercent && current.direction === 1) {
          nextX = current.maxPercent;
          current.isPausingAtBoundary = true;
          current.isWalking = false;
          setIsWalking(false);

          boundaryTimeoutRef.current = setTimeout(() => {
            if (stateRef.current.isLocked) return;
            stateRef.current.direction = -1;
            setDirection(-1);
            stateRef.current.isPausingAtBoundary = false;
            stateRef.current.isWalking = true;
            setIsWalking(true);
          }, 1200);
        }
        // Check left boundary
        else if (nextX <= current.minPercent && current.direction === -1) {
          nextX = current.minPercent;
          current.isPausingAtBoundary = true;
          current.isWalking = false;
          setIsWalking(false);

          boundaryTimeoutRef.current = setTimeout(() => {
            if (stateRef.current.isLocked) return;
            stateRef.current.direction = 1;
            setDirection(1);
            stateRef.current.isPausingAtBoundary = false;
            stateRef.current.isWalking = true;
            setIsWalking(true);
          }, 1200);
        }

        current.xPercent = nextX;

        // Direct DOM update for buttery 60fps without React render thrashing
        if (elementRef?.current) {
          elementRef.current.style.left = `${nextX}%`;
        } else {
          setXPercent(nextX);
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      if (boundaryTimeoutRef.current) clearTimeout(boundaryTimeoutRef.current);
    };
  }, [elementRef]);

  // Periodic natural pauses & turns during strolling
  useEffect(() => {
    if (isLocked) return;

    let timer: NodeJS.Timeout;

    const scheduleNextDecision = () => {
      const walkDuration = 4500 + Math.random() * 3500;

      timer = setTimeout(() => {
        if (stateRef.current.isLocked || stateRef.current.isPausingAtBoundary) return;

        // 40% chance to pause and rest/breathe
        if (Math.random() < 0.4) {
          stateRef.current.isWalking = false;
          setIsWalking(false);

          const pauseDuration = 1800 + Math.random() * 1800;
          randomPauseTimeoutRef.current = setTimeout(() => {
            if (stateRef.current.isLocked) return;
            // 30% chance to flip direction after pausing
            if (Math.random() < 0.3) {
              const newDir = stateRef.current.direction === 1 ? -1 : 1;
              stateRef.current.direction = newDir;
              setDirection(newDir);
            }
            stateRef.current.isWalking = true;
            setIsWalking(true);
            scheduleNextDecision();
          }, pauseDuration);
        } else {
          scheduleNextDecision();
        }
      }, walkDuration);
    };

    scheduleNextDecision();

    return () => {
      clearTimeout(timer);
      if (randomPauseTimeoutRef.current) clearTimeout(randomPauseTimeoutRef.current);
    };
  }, [isLocked]);

  const lockAtCurrentPosition = useCallback(() => {
    stateRef.current.isLocked = true;
    stateRef.current.isWalking = false;
    setIsWalking(false);
    if (boundaryTimeoutRef.current) clearTimeout(boundaryTimeoutRef.current);
    if (randomPauseTimeoutRef.current) clearTimeout(randomPauseTimeoutRef.current);
    setXPercent(stateRef.current.xPercent);
  }, []);

  const resumeRoaming = useCallback(() => {
    stateRef.current.isLocked = false;
    stateRef.current.isPausingAtBoundary = false;
    stateRef.current.isWalking = true;
    setIsWalking(true);
  }, []);

  return {
    xPercent,
    direction,
    isWalking,
    lockAtCurrentPosition,
    resumeRoaming,
  };
}
