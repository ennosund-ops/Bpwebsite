// BP CLUB overall-score → tier label (PSL / looksmax community vernacular).
// Bands are ordered high → low; tierForScore returns the first the score meets.

export interface Tier {
  name: string;
  min: number; // inclusive lower bound on the 0–100 profile score
  desc: string;
  tone: "low" | "mid" | "high";
}

export const TIERS: Tier[] = [
  { name: "True Adam", min: 94, desc: "Genetic final boss. Bone structure so clean it belongs behind museum glass with a little velvet rope.", tone: "high" },
  { name: "Gigachad", min: 88, desc: "Certified jaw of mass destruction. Rooms go silent and the WiFi gets faster when you walk in.", tone: "high" },
  { name: "Chad", min: 82, desc: "Holy Fuck... handsome! Bouncers wave you in out of pure professional respect.", tone: "high" },
  { name: "Chadlite", min: 75, desc: "Above average with a factory-installed god-tier jaw. You're barely even trying, it's rude.", tone: "high" },
  { name: "HTN", min: 68, desc: "High-tier normie. You win every single room that Chad forgot to show up to.", tone: "mid" },
  { name: "MTN", min: 60, desc: "Mid-tier normie. Average as fuck. The plain oat milk of faces — technically fine, aggressively forgettable.", tone: "mid" },
  { name: "LTN", min: 52, desc: "Low-tier normie. Like school lunch unseasoned-chicken energy: fully edible, absolutely zero seasoning. Start hardmaxing.", tone: "mid" },
  { name: "Chopped", min: 42, desc: "Well below average. Your bone structure is currently under new management and it's not going well.", tone: "low" },
  { name: "Subhuman", min: 32, desc: "Rock-bottom tier. Consider ropemaxing. Every mogging technique known to science, deployed simultaneously, effective yesterday.", tone: "low" },
  { name: "Gorlock", min: 0, desc: "The abyss gazed back and immediately filed a complaint. Start ropemaxing right now. Otherwise full structural reconstruction advised — bring blueprints. Do not leave the house until you've SERIOUSLY ascended.", tone: "low" },
];

export function tierForScore(score: number): Tier {
  return TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1];
}

