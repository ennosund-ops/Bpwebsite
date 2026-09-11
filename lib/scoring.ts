import type {
  CategoryKey,
  CategoryResult,
  Confidence,
  FeatureHighlight,
  Measurement,
} from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { clamp } from "@/lib/utils";

// ============================================================================
// BP CLUB reference ranges (documented on the Methodology page).
// Sources: published soft-tissue anthropometric summaries (Farkas et al.) and
// neoclassical proportion canons, expressed as ratio bands. These are
// STATISTICAL tools, not definitions of attractiveness, and populations vary.
// ============================================================================

export interface ReferenceRange {
  low: number;
  high: number;
  label: string;
}

// Bands widened to reflect the real spread of well-proportioned faces as
// measured from 2D MediaPipe landmarks (which are noisier than caliper
// anthropometry). They are lenient by design — a value outside a band is common.
export const REFERENCE: Record<string, ReferenceRange> = {
  // Interpupillary distance / face width
  eyeSpacingRatio: { low: 0.4, high: 0.5, label: "IPD / bizygomatic width" },
  // Eye fissure width / IPD (canthal spacing)
  canthalRatio: { low: 0.85, high: 1.15, label: "eye width / inter-eye gap" },
  // Facial width / facial height (bizygomatic / trichion–menton)
  faceWHR: { low: 0.62, high: 0.82, label: "face width / height" },
  // Each facial third relative to total (ideal ≈ 0.333)
  facialThird: { low: 0.29, high: 0.38, label: "third / face height" },
  // Nose width / face width
  noseWidthRatio: { low: 0.22, high: 0.34, label: "nose width / face width" },
  // Mouth width / face width
  mouthWidthRatio: { low: 0.4, high: 0.55, label: "mouth width / face width" },
  // Jaw (bigonial) width / face (bizygomatic) width
  jawRatio: { low: 0.66, high: 0.88, label: "jaw width / cheekbone width" },
  // Nose length / face height
  noseLengthRatio: { low: 0.26, high: 0.4, label: "nose length / face height" },
  // Midface height / face height
  midfaceRatio: { low: 0.3, high: 0.42, label: "midface / face height" },
};

/** Blend confidence: any low pulls the category down; unavailable removed upstream. */
export function aggregateConfidence(items: Confidence[]): Confidence {
  const present = items.filter((c) => c !== "unavailable");
  if (present.length === 0) return "unavailable";
  if (present.includes("low")) return present.includes("high") ? "medium" : "low";
  if (present.includes("medium")) return "medium";
  return "high";
}

/** Build a category from its measurements — score is the mean of available sub-scores. */
export function buildCategory(
  key: CategoryKey,
  measurements: Measurement[],
  summary: string
): CategoryResult {
  const scored = measurements.filter(
    (m) => m.score != null && m.confidence !== "unavailable"
  );
  const score =
    scored.length === 0
      ? null
      : Math.round(
          scored.reduce((s, m) => s + (m.score as number), 0) / scored.length
        );
  return {
    key,
    label: CATEGORY_LABELS[key],
    score,
    confidence: aggregateConfidence(measurements.map((m) => m.confidence)),
    summary,
    measurements,
  };
}

/**
 * Overall PROFILE score — a confidence-weighted mean of category scores.
 * This expresses how consistent the measured characteristics are with the
 * BP CLUB reference methodology. It is NOT a measure of attractiveness.
 */
function measVal(cat: CategoryResult | undefined, key: string): number | null {
  const found = cat?.measurements.find((m) => m.key === key);
  return found?.value ?? null;
}
function measScore(cat: CategoryResult | undefined, key: string): number | null {
  const found = cat?.measurements.find((m) => m.key === key);
  return found?.score ?? null;
}

/**
 * Overall PROFILE score. Calibrated against reference faces: landmark WHR/jaw
 * ratios don't track leanness for moderate cases, so the score is driven by the
 * signals that DO discriminate — facial symmetry and "hunter eyes" (a small
 * brow-to-eye gap) — with an obesity penalty for extreme facial width.
 */
export function overallScore(
  categories: Record<CategoryKey, CategoryResult>
): { score: number; confidence: Confidence } {
  const sym = categories.symmetry?.score ?? 50;
  const hunter = measScore(categories.eyes, "hunter") ?? 50;
  const whr = measVal(categories.proportions, "whr") ?? measVal(categories.jaw, "leanness") ?? 0.8;

  // Hunter eyes (a small brow-to-eye gap) is the strongest discriminator in the
  // reference set — it flags deformed / low-tier faces that still measure
  // symmetric. Symmetry is a supporting signal only.
  const base = 0.42 * sym + 0.58 * hunter;
  // Extreme facial width (obesity) is the one leanness signal that reads
  // reliably from 2D landmarks; penalize it hard past ~0.92.
  const obesityPenalty = clamp((whr - 0.92) * 300, 0, 55);

  const score = clamp(Math.round(base - obesityPenalty));
  const confs = Object.values(categories)
    .filter((c) => c.score != null)
    .map((c) => c.confidence);
  return { score, confidence: aggregateConfidence(confs) };
}

export function strongestFeatures(
  categories: Record<CategoryKey, CategoryResult>
): FeatureHighlight[] {
  const notes: Partial<Record<CategoryKey, string>> = {
    symmetry:
      "Your left/right landmark alignment is one of the strongest measured characteristics.",
    eyes: "Your measured eye spacing is highly consistent with the reference range.",
    faceFraming:
      "Your visible brow and hairstyle framing complement your facial geometry.",
    proportions:
      "Most of your measured facial ratios fall close to the reference ranges.",
    nose: "Your visible nose proportions align well with the reference ranges.",
    jaw: "Your measured lower-face geometry is balanced and consistent.",
    midface: "Your measured midface proportions are well balanced.",
    skin: "Your image shows even, consistent visible skin tone.",
  };
  return Object.values(categories)
    .filter((c) => c.score != null && c.confidence !== "low")
    .sort((a, b) => (b.score as number) - (a.score as number))
    .slice(0, 3)
    .map((c) => ({
      categoryKey: c.key,
      label: c.label,
      score: c.score as number,
      note: notes[c.key] ?? c.summary,
    }));
}
