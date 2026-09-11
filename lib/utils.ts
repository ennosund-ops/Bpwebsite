import type { Confidence } from "@/types";

export const DEMO_MODE =
  (process.env.NEXT_PUBLIC_DEMO_MODE ?? "true").toLowerCase() !== "false";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

/** Score-band color token used across cards + bars. */
export function scoreTone(score: number | null): "high" | "med" | "low" {
  if (score == null) return "low";
  if (score >= 85) return "high";
  if (score >= 72) return "med";
  return "low";
}

export function confidenceLabel(c: Confidence): string {
  switch (c) {
    case "high":
      return "High Confidence";
    case "medium":
      return "Medium Confidence";
    case "low":
      return "Low Confidence";
    default:
      return "Not Measurable";
  }
}

/** Deterministic 0–1 pseudo-random from a string seed (no Math.random). */
export function seeded(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    const t = (h ^= h >>> 16) >>> 0;
    return t / 4294967296;
  };
}

export function euclid(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Score how close a measured ratio sits to a reference range.
 * Inside the range scores near 100; falling away decays smoothly.
 * This is a statistical closeness tool, NOT a definition of beauty.
 */
export function closenessScore(
  value: number,
  low: number,
  high: number,
  tolerance = 1
): number {
  // Inside the reference band: 76 at the edges up to 96 dead-centre. Merely
  // being "in range" is good, not elite — only near-ideal ratios score into the 90s.
  if (value >= low && value <= high) {
    const mid = (low + high) / 2;
    const halfWidth = (high - low) / 2 || 1;
    const centered = 1 - Math.abs(value - mid) / halfWidth; // 0..1
    return clamp(76 + centered * 20);
  }
  // Outside the band, fall off steeply toward a low floor. Being well outside a
  // reference band should read as a genuinely poor score, not a soft one.
  const dist = value < low ? low - value : value - high;
  const span = (high - low) || 1;
  const bandWidthsOut = dist / (span * tolerance);
  return clamp(76 - bandWidthsOut * 34, 10, 100);
}

export function formatNum(n: number | null, digits = 2): string {
  if (n == null) return "—";
  return n.toFixed(digits);
}
