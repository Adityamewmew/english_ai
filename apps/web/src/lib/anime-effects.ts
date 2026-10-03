import { animate, stagger } from "animejs";

/**
 * Anime.js v4 Animation Helpers for EDDY'S AI
 * Powered by Julian Garnier's Anime.js Engine (https://github.com/juliangarnier/anime)
 */

/**
 * 1. Card Reveal Animation
 * Bouncy spring pop-up effect when unlocking new steps or opening modules
 */
export function animeCardReveal(target: HTMLElement | string | null, onComplete?: () => void) {
  if (!target) return;
  const params: Record<string, any> = {
    opacity: [0, 1],
    translateY: [32, 0],
    scale: [0.96, 1],
    duration: 500,
    ease: "outBack",
  };
  if (onComplete) {
    params.onComplete = () => onComplete();
  }
  return animate(target, params);
}

/**
 * 2. Tactile Button Snap / Pop
 * Micro-interaction feedback when clicking interactive pills or options
 */
export function animeButtonPop(target: HTMLElement | null) {
  if (!target) return;
  return animate(target, {
    scale: [1, 0.92, 1.05, 1],
    duration: 350,
    ease: "outBack",
  });
}

/**
 * 3. Wrong Answer Shake
 * Shakes element horizontally with elastic dampening
 */
export function animeShake(target: HTMLElement | null) {
  if (!target) return;
  return animate(target, {
    translateX: [0, -10, 10, -8, 8, -4, 4, 0],
    duration: 450,
    ease: "outQuad",
  });
}

/**
 * 4. Staggered Word Blocks / Chips Reveal
 * Animates a list of word chips / sentence fragments sequentially
 */
export function animeStaggerChips(targets: HTMLElement[] | NodeListOf<Element> | string) {
  return animate(targets, {
    opacity: [0, 1],
    translateY: [16, 0],
    scale: [0.85, 1],
    delay: stagger(50, { start: 60 }),
    duration: 380,
    ease: "outBack",
  });
}

/**
 * 5. Floating Celebration / XP Badge
 * Floating upwards with scale pulse and fade out
 */
export function animeFloatingXp(target: HTMLElement | null, onComplete?: () => void) {
  if (!target) return;
  const params: Record<string, any> = {
    opacity: [0, 1, 1, 0],
    translateY: [10, -35],
    scale: [0.7, 1.2, 1, 0.9],
    duration: 1100,
    ease: "outQuad",
  };
  if (onComplete) {
    params.onComplete = () => onComplete();
  }
  return animate(target, params);
}

/**
 * 6. Character Persona Motion (Idle Breathing / Speaking / Happy Jump / Puzzled)
 */
export function animeCharacterState(
  target: HTMLElement | null,
  state: "idle" | "speaking" | "happy" | "walking" | "puzzled"
) {
  if (!target) return;

  switch (state) {
    case "happy":
      return animate(target, {
        translateY: [0, -18, 0, -10, 0],
        scale: [1, 1.08, 0.98, 1.04, 1],
        duration: 650,
        ease: "outBack",
      });
    case "speaking":
      return animate(target, {
        scale: [1, 1.03, 0.99, 1.02, 1],
        rotate: [0, -1.5, 1.5, -0.5, 0],
        duration: 500,
        ease: "inOutQuad",
      });
    case "walking":
      return animate(target, {
        translateX: [-8, 8, -4, 4, 0],
        rotate: [-3, 3, -2, 2, 0],
        duration: 450,
        ease: "outQuad",
      });
    case "puzzled":
      return animate(target, {
        rotate: [0, -6, 4, -2, 0],
        translateY: [0, 4, 0],
        duration: 500,
        ease: "outQuad",
      });
    case "idle":
    default:
      return animate(target, {
        translateY: [0, -3, 0],
        duration: 1800,
        ease: "inOutSine",
      });
  }
}

/**
 * 7. Card Staggered Entrance
 * Animates a collection of cards into view sequentially with spring scale
 */
export function animeCardStagger(targets: HTMLElement[] | NodeListOf<Element> | string, delayMs = 50) {
  return animate(targets, {
    opacity: [0, 1],
    translateY: [24, 0],
    scale: [0.93, 1],
    delay: stagger(delayMs, { start: 40 }),
    duration: 480,
    ease: "outBack",
  });
}

/**
 * 8. Card Hover Lift & Settle
 * Tactile 3D physics on mouse enter / mouse leave
 */
export function animeCardHover(target: HTMLElement | null, isEntering: boolean) {
  if (!target) return;
  return animate(target, {
    translateY: isEntering ? -4 : 0,
    scale: isEntering ? 1.015 : 1,
    duration: 250,
    ease: "outQuad",
  });
}

/**
 * 9. Card Pulse Glow
 * Highlights an active or completed card with a gentle bounce & glow
 */
export function animeCardPulse(target: HTMLElement | null) {
  if (!target) return;
  return animate(target, {
    scale: [1, 1.03, 0.99, 1],
    duration: 400,
    ease: "outBack",
  });
}

/**
 * 10. Number / XP Counter Ticker
 * Smoothly interpolates an HTML element's numeric innerText from start to end
 */
export function animeCountUp(
  target: HTMLElement | null,
  startVal: number,
  endVal: number,
  prefix = "",
  suffix = ""
) {
  if (!target) return;
  const obj = { val: startVal };
  return animate(obj, {
    val: endVal,
    duration: 700,
    ease: "outQuad",
    onUpdate: () => {
      if (target) {
        target.innerText = `${prefix}${Math.round(obj.val)}${suffix}`;
      }
    },
  });
}
