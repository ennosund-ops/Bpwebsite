import type {
  AnalysisResult,
  CategoryKey,
  CategoryResult,
  Confidence,
  ImageQuality,
  Landmark,
  Measurement,
  OverlayGeometry,
} from "@/types";
import { buildCategory, overallScore, strongestFeatures } from "@/lib/scoring";
import { buildRecommendations } from "@/lib/recommendations";
import { seeded } from "@/lib/utils";

// Fixed sample scores from the BP CLUB spec.
const DEMO_SCORES: Record<CategoryKey, number> = {
  symmetry: 91,
  proportions: 84,
  eyes: 87,
  nose: 79,
  jaw: 82,
  midface: 86,
  skin: 73,
  faceFraming: 89,
};

const DEMO_CONF: Record<CategoryKey, Confidence> = {
  symmetry: "high",
  proportions: "high",
  eyes: "high",
  nose: "medium",
  jaw: "medium",
  midface: "high",
  skin: "medium",
  faceFraming: "high",
};

function mm(
  key: string,
  label: string,
  value: number,
  unit: string,
  score: number,
  confidence: Confidence,
  explanation: string,
  reference?: Measurement["reference"]
): Measurement {
  return { key, label, value, unit, score, confidence, explanation, reference };
}

function demoMeasurements(key: CategoryKey): Measurement[] {
  const s = DEMO_SCORES[key];
  const c = DEMO_CONF[key];
  switch (key) {
    case "symmetry":
      return [
        mm("landmarkDev", "Landmark Deviation", 0.011, "ratio", 93, "high",
          "Low average left/right landmark deviation."),
        mm("noseAlign", "Nose Alignment", 0.008, "ratio", 90, "high",
          "Nose sits close to the facial midline."),
        mm("mouthAlign", "Mouth Alignment", 0.012, "ratio", 90, "high",
          "Mouth is well aligned to the midline."),
      ];
    case "proportions":
      return [
        mm("whr", "Face Width / Height", 0.73, "ratio", 88, "high",
          "Close to the reference band.", { low: 0.68, high: 0.78, label: "face width / height" }),
        mm("upperThird", "Upper Third", 0.34, "share", 86, "high",
          "Balanced upper third.", { low: 0.31, high: 0.36, label: "third / face height" }),
        mm("midThird", "Middle Third", 0.33, "share", 84, "high",
          "Balanced middle third.", { low: 0.31, high: 0.36, label: "third / face height" }),
        mm("lowerThird", "Lower Third", 0.32, "share", 78, "high",
          "Slightly shorter lower third.", { low: 0.31, high: 0.36, label: "third / face height" }),
      ];
    case "eyes":
      return [
        mm("eyeSpacing", "Eye Spacing", 0.45, "ratio", 90, "high",
          "Eye spacing is highly consistent with the reference range.",
          { low: 0.42, high: 0.48, label: "IPD / face width" }),
        mm("ear", "Eye Aspect Ratio", 0.31, "ratio", 85, "high",
          "Eye aperture openness is well within range."),
        mm("eyeBalance", "Left/Right Balance", 0.03, "ratio", 86, "high",
          "Left and right eye widths are closely matched."),
      ];
    case "nose":
      return [
        mm("noseWidth", "Nose Width", 0.28, "ratio", 82, "medium",
          "Nose width relative to face is within range.",
          { low: 0.24, high: 0.3, label: "nose width / face width" }),
        mm("noseLength", "Nose Length", 0.33, "ratio", 80, "medium",
          "Nose length is within the reference band.",
          { low: 0.28, high: 0.36, label: "nose length / face height" }),
        mm("noseAlign2", "Alignment", 0.02, "ratio", 76, "medium",
          "Slight head rotation affects nose alignment measurement."),
      ];
    case "jaw":
      return [
        mm("jawWidth", "Jaw Width", 0.78, "ratio", 82, "medium",
          "Head rotation slightly affects the measurement.",
          { low: 0.72, high: 0.82, label: "jaw / cheekbone width" }),
        mm("lowerThird2", "Lower-Third Proportion", 0.32, "share", 84, "medium",
          "Lower third is well proportioned.",
          { low: 0.31, high: 0.36, label: "third / face height" }),
        mm("chinSym", "Chin Symmetry", 0.02, "ratio", 84, "high",
          "Chin sits close to the midline."),
        mm("boneProjection", "3D Bone Projection", null as unknown as number, "—",
          null as unknown as number, "unavailable",
          "3D jaw metrics require additional data — not reliably measurable from a single 2D photo."),
      ];
    case "midface":
      return [
        mm("midfaceH", "Midface Height", 0.36, "share", 87, "high",
          "Midface height is well balanced.",
          { low: 0.32, high: 0.4, label: "midface / face height" }),
        mm("cheekWidth", "Cheekbone Width", 0.73, "ratio", 85, "high",
          "Cheekbone width relative to face height is balanced.",
          { low: 0.68, high: 0.78, label: "face width / height" }),
      ];
    case "skin":
      return [
        mm("clarity", "Apparent Clarity", 0.74, "index", 75, "medium",
          "Image-based clarity is good with some visible texture."),
        mm("toneConsistency", "Tone Consistency", 0.71, "index", 72, "medium",
          "Some visible tone variation across the image."),
        mm("blemishes", "Visible Blemishes", 0.28, "index", 72, "medium",
          "A few visible blemishes detected in the image."),
      ];
    case "faceFraming":
      return [
        mm("browBalance", "Brow Balance", 0.01, "ratio", 90, "high",
          "Brows are well balanced."),
        mm("hairFraming", "Hairstyle Framing", 0.8, "index", 88, "high",
          "Visible framing complements the facial geometry."),
      ];
  }
}

const SUMMARIES: Record<CategoryKey, string> = {
  symmetry: "Low average left/right landmark deviation.",
  proportions: "Most measured facial ratios fall close to the reference ranges.",
  eyes: "Eye spacing and relative eye geometry are highly consistent.",
  nose: "Visible nose proportions are within the reference ranges.",
  jaw: "Balanced lower-face geometry; some metrics limited by 2D imaging.",
  midface: "Measured midface proportions are well balanced.",
  skin: "Image shows good clarity with some visible texture and tone variation.",
  faceFraming: "Visible brow and hairstyle framing complement the facial geometry.",
};

/** Generate a plausible, centered face-mesh point cloud for the overlay. */
export function demoOverlay(): OverlayGeometry {
  const rand = seeded("bp-club-demo-face");
  const cx = 0.5;
  const landmarks: Landmark[] = [];

  // Face oval ring
  for (let i = 0; i < 40; i++) {
    const t = (i / 40) * Math.PI * 2;
    const rx = 0.19 + Math.sin(t) * 0.005;
    const ry = 0.27;
    landmarks.push({ x: cx + Math.sin(t) * rx, y: 0.5 - Math.cos(t) * ry });
  }
  // Scatter interior feature points deterministically
  const feats: Landmark[] = [
    { x: 0.42, y: 0.44 }, { x: 0.44, y: 0.435 }, { x: 0.46, y: 0.44 }, // L eye
    { x: 0.54, y: 0.44 }, { x: 0.56, y: 0.435 }, { x: 0.58, y: 0.44 }, // R eye
    { x: 0.5, y: 0.5 }, { x: 0.47, y: 0.55 }, { x: 0.53, y: 0.55 }, // nose
    { x: 0.44, y: 0.63 }, { x: 0.5, y: 0.64 }, { x: 0.56, y: 0.63 }, // mouth
    { x: 0.4, y: 0.4 }, { x: 0.6, y: 0.4 }, // brows
    { x: 0.5, y: 0.77 }, // chin
  ];
  landmarks.push(...feats);
  for (let i = 0; i < 60; i++) {
    landmarks.push({
      x: cx + (rand() - 0.5) * 0.32,
      y: 0.35 + rand() * 0.42,
    });
  }

  const jawline: Landmark[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = -1 + (i / 12) * 2; // -1..1
    jawline.push({ x: cx + t * 0.18, y: 0.62 + (1 - t * t) * 0.16 });
  }

  return {
    landmarks,
    symmetryAxisX: cx,
    thirdsY: [0.4, 0.56],
    eyeCenters: [
      { x: 0.44, y: 0.44 },
      { x: 0.56, y: 0.44 },
    ],
    jawline,
    noseWidth: [
      { x: 0.465, y: 0.56 },
      { x: 0.535, y: 0.56 },
    ],
  };
}

export function buildDemoResult(opts?: { seed?: string }): AnalysisResult {
  const keys: CategoryKey[] = [
    "symmetry", "proportions", "eyes", "nose", "jaw", "midface", "skin", "faceFraming",
  ];
  const jitter = (k: CategoryKey) => {
    if (!opts?.seed) return 0;
    // Deterministic ±7 nudge per category so before/after comparisons differ.
    return Math.round((seeded(opts.seed + k)() - 0.5) * 14);
  };
  const categories = {} as Record<CategoryKey, CategoryResult>;
  for (const k of keys) {
    // Force the category score to the fixed demo value for a stable showcase.
    const cat = buildCategory(k, demoMeasurements(k), SUMMARIES[k]);
    const score = Math.max(0, Math.min(100, DEMO_SCORES[k] + jitter(k)));
    categories[k] = { ...cat, score, confidence: DEMO_CONF[k] };
  }

  const { score: overall, confidence } = overallScore(categories);

  const imageQuality: ImageQuality = {
    status: "good",
    faceCount: 1,
    message: "Sample image — one clear, front-facing face.",
    checks: [
      { id: "face", label: "Face detected", passed: true, detail: "One primary face found." },
      { id: "single", label: "Single face", passed: true, detail: "No competing faces." },
      { id: "sharp", label: "Sharpness", passed: true, detail: "Image is sufficiently sharp." },
      { id: "light", label: "Lighting", passed: true, detail: "Even lighting detected." },
      { id: "angle", label: "Frontal angle", passed: true, detail: "Face is near-frontal." },
    ],
  };

  return {
    id: "demo-" + Date.now().toString(36),
    createdAt: new Date().toISOString(),
    isDemo: true,
    overallScore: opts?.seed ? overall : 87,
    overallConfidence: confidence,
    imageQuality,
    categories,
    overlay: demoOverlay(),
    strongestFeatures: strongestFeatures(categories),
    recommendations: buildRecommendations(categories),
  };
}
