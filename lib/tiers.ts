// BP CLUB overall-score → tier label (PSL / looksmax community vernacular).
// Bands are ordered high → low; tierForScore returns the first the score meets.

export interface Tier {
  name: string;
  min: number; // inclusive lower bound on the 0–100 profile score
  desc: string;
  tone: "low" | "mid" | "high";
}

export const TIERS: Tier[] = [
  { name: "True Adam", min: 94, desc: "Near the theoretical ideal.", tone: "high" },
  { name: "Gigachad", min: 88, desc: "Ultra-attractive — top of the scale.", tone: "high" },
  { name: "Chad", min: 82, desc: "Conventionally very attractive, masculine.", tone: "high" },
  { name: "Chadlite", min: 75, desc: "Noticeably above average.", tone: "high" },
  { name: "HTN", min: 68, desc: "High-tier normie.", tone: "mid" },
  { name: "MTN", min: 60, desc: "Mid-tier normie.", tone: "mid" },
  { name: "LTN", min: 52, desc: "Low-tier normie.", tone: "mid" },
  { name: "Chopped", min: 42, desc: "Well below average.", tone: "low" },
  { name: "Subhuman", min: 32, desc: "Bottom of the scale.", tone: "low" },
  { name: "Gorlock", min: 0, desc: "Rock bottom of the scale.", tone: "low" },
];

export function tierForScore(score: number): Tier {
  return TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1];
}
