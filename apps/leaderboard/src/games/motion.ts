// ============================================================================
//  Motion primitives.
//
//  Two rules the whole games UI obeys:
//   1. Every animation is driven by a value the server already returned — motion
//      replays a decision, it never produces one.
//   2. `prefers-reduced-motion` is honoured everywhere. With it on, animated
//      helpers jump straight to their final value: the game stays fully
//      playable, it simply stops moving.
// ============================================================================
import { useEffect, useRef, useState } from "preact/hooks";

/** Design-token easings, mirrored from the CSS custom properties in app.css. */
export const EASE = {
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  /** Overshoots slightly — for a win badge landing, never for layout. */
  back: (t: number) => {
    const c = 1.70158;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  },
} as const;

export type Easing = (t: number) => number;

export function prefersReducedMotion(): boolean {
  if (typeof globalThis.matchMedia !== "function") return false;
  return globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Reactive version — a viewer flipping the OS setting takes effect live. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    if (typeof globalThis.matchMedia !== "function") return;
    const mq = globalThis.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Critically-damped-ish spring sampled at a point in time. Used by canvas games
 * that need a physical feel without pulling in a physics engine for UI motion.
 */
export function spring(from: number, to: number, t: number, stiffness = 170, damping = 26): number {
  if (t <= 0) return from;
  const omega = Math.sqrt(stiffness);
  const zeta = damping / (2 * Math.sqrt(stiffness));
  const delta = to - from;
  if (zeta < 1) {
    const wd = omega * Math.sqrt(1 - zeta * zeta);
    const envelope = Math.exp(-zeta * omega * t);
    return to - delta * envelope * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));
  }
  const envelope = Math.exp(-omega * t);
  return to - delta * envelope * (1 + omega * t);
}

/** requestAnimationFrame tween. Returns a cancel function. */
export function tween(
  durationMs: number,
  onFrame: (value: number) => void,
  { easing = EASE.out, reduced = false }: { easing?: Easing; reduced?: boolean } = {}
): () => void {
  if (reduced || durationMs <= 0 || typeof requestAnimationFrame !== "function") {
    onFrame(1);
    return () => {};
  }
  let raf = 0;
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    onFrame(easing(t));
    if (t < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

/**
 * Count-up for balances and payouts. The target is always a server number; the
 * hook only controls how quickly the display catches up to it.
 */
export function useCountUp(target: number, durationMs = 650): number {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    const cancel = tween(
      durationMs,
      (p) => setDisplay(Math.round(from + (target - from) * p)),
      { reduced }
    );
    fromRef.current = target;
    return cancel;
  }, [target, durationMs, reduced]);

  return display;
}
