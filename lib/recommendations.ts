import type {
  CategoryKey,
  CategoryResult,
  Recommendation,
} from "@/types";

// ============================================================================
// Recommendation engine.
// Maps measured characteristics to practical, controllable, SAFE suggestions:
// grooming, skincare, framing, photography, general healthy habits.
// It never proposes altering anatomy, extreme dieting, drugs, or DIY procedures.
// ============================================================================

function impactFromScore(score: number | null): "high" | "medium" | "low" {
  if (score == null) return "medium";
  if (score < 74) return "high";
  if (score < 84) return "medium";
  return "low";
}

const CATALOG: Record<
  CategoryKey,
  (c: CategoryResult) => Omit<Recommendation, "id" | "impact"> | null
> = {
  skin: (c) => ({
    category: "Skincare",
    title: "Build a consistent basic skincare routine",
    basedOn: `Image-based skin appearance score ${c.score ?? "—"}`,
    body:
      "Your image shows visible texture and tone variation. A simple, consistent routine tends to improve visible skin quality over weeks. This is appearance guidance, not a medical diagnosis.",
    steps: [
      "Gentle cleanser, morning and night",
      "A basic moisturizer suited to your skin",
      "Daily broad-spectrum sunscreen (SPF 30+)",
      "See a licensed dermatologist for persistent or painful skin concerns",
    ],
  }),
  faceFraming: (c) => ({
    category: "Hairstyle & Framing",
    title: "Refine hairstyle and framing to reveal facial structure",
    basedOn: `Face framing score ${c.score ?? "—"}`,
    body:
      "Your current framing may be hiding some of your facial structure. A shape that opens up the forehead and frames the jaw can noticeably change how your features read on camera.",
    steps: [
      "Ask a barber/stylist for a cut matched to your face shape",
      "Keep the hairline and edges clean between cuts",
      "Consider how framing balances your widest and narrowest facial thirds",
    ],
  }),
  eyes: (c) => ({
    category: "Brow Grooming",
    title: "Subtle brow grooming for a more balanced eye area",
    basedOn: `Eye-area score ${c.score ?? "—"}`,
    body:
      "Small asymmetries around the brows can make the eye area look less balanced. Light, professional grooming keeps things natural.",
    steps: [
      "Book a professional brow shaping rather than aggressive at-home tweezing",
      "Tidy only stray hairs; keep the natural shape",
      "Avoid over-thinning — subtlety reads best",
    ],
  }),
  symmetry: () => null,
  proportions: () => ({
    category: "Photography",
    title: "Use framing and lens choice that represents your proportions",
    basedOn: "Measured facial proportions",
    body:
      "2D photos distort proportions with lens choice, distance and angle. Better capture makes your real proportions read accurately.",
    steps: [
      "Shoot from ~1.5–2m with the camera at eye level",
      "Avoid wide-angle phone lenses up close (they enlarge the nose)",
      "Use even, front lighting and a neutral expression",
    ],
  }),
  nose: () => null,
  jaw: () => ({
    category: "Posture & Habits",
    title: "Posture, sleep and hydration for lower-face definition",
    basedOn: "Lower-face appearance",
    body:
      "General healthy habits can improve how the lower face and jaw area appear on camera. These are everyday, low-risk changes.",
    steps: [
      "Keep the head level and chin slightly forward for photos",
      "Prioritize consistent sleep and hydration",
      "For cosmetic procedures, consult a qualified medical professional — no DIY techniques",
    ],
  }),
  midface: () => null,
};

export function buildRecommendations(
  categories: Record<CategoryKey, CategoryResult>
): Recommendation[] {
  const out: Recommendation[] = [];
  // Prioritize the lowest-scoring, highest-leverage categories first.
  const ordered = Object.values(categories)
    .filter((c) => c.score != null)
    .sort((a, b) => (a.score as number) - (b.score as number));

  for (const cat of ordered) {
    const make = CATALOG[cat.key];
    const base = make?.(cat);
    if (!base) continue;
    out.push({
      id: `rec-${cat.key}`,
      impact: impactFromScore(cat.score),
      ...base,
    });
  }

  // Always include a grounding photography tip if not already present.
  if (!out.find((r) => r.category === "Photography")) {
    const p = CATALOG.proportions(categories.proportions);
    if (p) out.push({ id: "rec-photo", impact: "medium", ...p });
  }

  const rank = { high: 0, medium: 1, low: 2 };
  return out.sort((a, b) => rank[a.impact] - rank[b.impact]);
}
