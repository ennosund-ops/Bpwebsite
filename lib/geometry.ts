import type {
  CategoryKey,
  CategoryResult,
  Confidence,
  Landmark,
  Measurement,
  OverlayGeometry,
} from "@/types";
import { buildCategory, REFERENCE } from "@/lib/scoring";
import { closenessScore, euclid, clamp } from "@/lib/utils";

// ============================================================================
// MediaPipe Face Mesh landmark indices (468-point topology).
// Only the anchors BP CLUB actually uses are named here.
// ============================================================================
export const IDX = {
  chin: 152,
  faceLeft: 234, // left cheekbone / bizygomatic
  faceRight: 454, // right cheekbone
  trichion: 10, // top of forehead (approx hairline)
  glabella: 168, // between brows / nose bridge top
  subnasale: 2, // base of nose
  noseTip: 1,
  alaLeft: 129,
  alaRight: 358,
  jawLeft: 172,
  jawRight: 397,
  gonialLeft: 58,
  gonialRight: 288,
  eyeLOuter: 33,
  eyeLInner: 133,
  eyeLTop: 159,
  eyeLBottom: 145,
  eyeROuter: 263,
  eyeRInner: 362,
  eyeRTop: 386,
  eyeRBottom: 374,
  browL: 105,
  browR: 334,
  mouthLeft: 61,
  mouthRight: 291,
  lipTop: 13,
  lipBottom: 14,
} as const;

// Face silhouette ring (subset, ordered) for drawing the jaw / face outline.
export const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
  400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
  54, 103, 67, 109,
];

const JAW_ARC = [
  172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397,
];

function center(a: Landmark, b: Landmark): Landmark {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Confidence from head-rotation proxy: nose deviation from face midline. */
function rotationConfidence(lm: Landmark[]): { conf: Confidence; yaw: number } {
  const faceMidX = (lm[IDX.faceLeft].x + lm[IDX.faceRight].x) / 2;
  const faceW = Math.abs(lm[IDX.faceRight].x - lm[IDX.faceLeft].x) || 1;
  const yaw = Math.abs(lm[IDX.noseTip].x - faceMidX) / faceW; // 0 = frontal
  if (yaw < 0.06) return { conf: "high", yaw };
  if (yaw < 0.13) return { conf: "medium", yaw };
  return { conf: "low", yaw };
}

function m(
  key: string,
  label: string,
  value: number | null,
  unit: string,
  score: number | null,
  confidence: Confidence,
  explanation: string,
  reference?: { low: number; high: number; label: string }
): Measurement {
  return { key, label, value, unit, score, confidence, explanation, reference };
}

/**
 * Turn a MediaPipe landmark array (normalized 0–1) into BP CLUB categories,
 * overlay geometry and an honest per-measurement confidence read.
 * `skin` is derived separately from pixel sampling and injected by the caller.
 */
export function analyzeLandmarks(
  normLm: Landmark[],
  skinCategory: CategoryResult,
  aspect = 1,
  browDarknessScore: number | null = null
): {
  categories: Record<CategoryKey, CategoryResult>;
  overlay: OverlayGeometry;
} {
  // MediaPipe normalizes x by image width and y by image height *separately*,
  // so raw distances are skewed by the photo's aspect ratio (a portrait selfie
  // makes faces read far too wide). Scale x by width/height into a common unit
  // so every distance and ratio below is geometrically correct. The overlay,
  // which draws over an aspect-preserving canvas, keeps the normalized coords.
  const lm: Landmark[] = normLm.map((p) => ({ x: p.x * aspect, y: p.y, z: p.z }));

  const { conf: baseConf, yaw } = rotationConfidence(lm);
  const rotNote =
    baseConf === "high"
      ? "Face is close to frontal; measurement is reliable."
      : baseConf === "medium"
      ? "Head rotation slightly affects this measurement."
      : "Significant head rotation reduces reliability.";

  const faceW = euclid(lm[IDX.faceLeft], lm[IDX.faceRight]);
  const faceH = euclid(lm[IDX.trichion], lm[IDX.chin]) || 1;
  const eyeLc = center(lm[IDX.eyeLOuter], lm[IDX.eyeLInner]);
  const eyeRc = center(lm[IDX.eyeROuter], lm[IDX.eyeRInner]);
  // Midline from stable central landmarks (glabella, subnasale, chin). Using
  // central points instead of the cheekbone midpoint largely cancels head yaw,
  // so the symmetry read reflects true asymmetry rather than camera angle.
  const midX =
    (lm[IDX.glabella].x + lm[IDX.subnasale].x + lm[IDX.chin].x) / 3;

  // ---- SYMMETRY --------------------------------------------------------
  // Mean horizontal deviation of paired landmarks from the face midline.
  const pairs: [number, number][] = [
    [IDX.eyeLOuter, IDX.eyeROuter],
    [IDX.eyeLInner, IDX.eyeRInner],
    [IDX.browL, IDX.browR],
    [IDX.alaLeft, IDX.alaRight],
    [IDX.mouthLeft, IDX.mouthRight],
    [IDX.gonialLeft, IDX.gonialRight],
    [IDX.jawLeft, IDX.jawRight],
  ];
  let devSum = 0;
  for (const [l, r] of pairs) {
    const dl = Math.abs(lm[l].x - midX);
    const dr = Math.abs(lm[r].x - midX);
    devSum += Math.abs(dl - dr) / faceW;
  }
  const meanDev = devSum / pairs.length; // ~0 perfect
  const symScore = clamp(100 - meanDev * 520, 18, 100);
  const noseAlign = Math.abs(lm[IDX.noseTip].x - midX) / faceW;
  const mouthAlign =
    Math.abs(center(lm[IDX.mouthLeft], lm[IDX.mouthRight]).x - midX) / faceW;

  const symmetry = buildCategory(
    "symmetry",
    [
      m("landmarkDev", "Landmark Deviation", meanDev, "ratio", symScore, baseConf,
        "Low average left/right landmark deviation." ),
      m("noseAlign", "Nose Alignment", noseAlign, "ratio",
        clamp(100 - noseAlign * 720, 25, 100), baseConf, rotNote),
      m("mouthAlign", "Mouth Alignment", mouthAlign, "ratio",
        clamp(100 - mouthAlign * 720, 25, 100), baseConf, rotNote),
    ],
    "Low average left/right landmark deviation."
  );

  // ---- PROPORTIONS -----------------------------------------------------
  const whr = faceW / faceH;
  const upperH = Math.abs(lm[IDX.glabella].y - lm[IDX.trichion].y) / faceH;
  const midH = Math.abs(lm[IDX.subnasale].y - lm[IDX.glabella].y) / faceH;
  const lowerH = Math.abs(lm[IDX.chin].y - lm[IDX.subnasale].y) / faceH;
  const whrScore = closenessScore(whr, REFERENCE.faceWHR.low, REFERENCE.faceWHR.high);
  const upScore = closenessScore(upperH, REFERENCE.facialThird.low, REFERENCE.facialThird.high);
  const midScore = closenessScore(midH, REFERENCE.facialThird.low, REFERENCE.facialThird.high);
  const lowScore = closenessScore(lowerH, REFERENCE.facialThird.low, REFERENCE.facialThird.high);
  const proportions0 = buildCategory(
    "proportions",
    [
      m("whr", "Face Width / Height", whr, "ratio", whrScore,
        baseConf, "Facial width relative to height — a strong shape signal.", REFERENCE.faceWHR),
      m("upperThird", "Upper Third", upperH, "share", upScore,
        baseConf, "Proportion of total face height.", REFERENCE.facialThird),
      m("midThird", "Middle Third", midH, "share", midScore,
        baseConf, "Proportion of total face height.", REFERENCE.facialThird),
      m("lowerThird", "Lower Third", lowerH, "share", lowScore,
        baseConf, "Proportion of total face height.", REFERENCE.facialThird),
    ],
    "Most measured facial ratios fall close to the reference ranges."
  );
  // Face width/height carries most of the signal for facial shape/adiposity;
  // the thirds are easy to satisfy for almost any face, so weight them lightly.
  const proportions = {
    ...proportions0,
    score: Math.round(0.6 * whrScore + 0.4 * ((upScore + midScore + lowScore) / 3)),
  };

  // ---- EYES — incl. HUNTER EYES + BROWS --------------------------------
  const ipd = euclid(eyeLc, eyeRc);
  const eyeSpacing = ipd / faceW;
  const eyeWidthL = euclid(lm[IDX.eyeLOuter], lm[IDX.eyeLInner]);
  const eyeWidthR = euclid(lm[IDX.eyeROuter], lm[IDX.eyeRInner]);
  const earL = euclid(lm[IDX.eyeLTop], lm[IDX.eyeLBottom]) / (eyeWidthL || 1);
  const earR = euclid(lm[IDX.eyeRTop], lm[IDX.eyeRBottom]) / (eyeWidthR || 1);
  const eyeSizeDiff = Math.abs(eyeWidthL - eyeWidthR) / ((eyeWidthL + eyeWidthR) / 2 || 1);

  // Hunter eyes: a small vertical gap between brow and eye (low-set, hooded
  // brow) reads as "hunter eyes" and scores higher; a tall gap scores low.
  const browGapL = lm[IDX.eyeLTop].y - lm[IDX.browL].y;
  const browGapR = lm[IDX.eyeRTop].y - lm[IDX.browR].y;
  const browGap = Math.max(0, (browGapL + browGapR) / 2) / faceH;
  // Calibrated against reference faces: good ~0.08, poor ~0.12–0.14.
  const hunterScore = clamp(((0.14 - browGap) / (0.14 - 0.075)) * 100);

  const spacingScore = closenessScore(
    eyeSpacing, REFERENCE.eyeSpacingRatio.low, REFERENCE.eyeSpacingRatio.high
  );
  const earScore = clamp(78 + (1 - Math.abs((earL + earR) / 2 - 0.33) / 0.33) * 22, 55, 100);
  const balanceScore = clamp(100 - eyeSizeDiff * 170, 28, 100);

  const eyeMeas: Measurement[] = [
    m("hunter", "Hunter Eyes (brow gap)", browGap, "ratio", hunterScore, baseConf,
      "Vertical gap between brow and eye — a smaller gap (low-set, hooded 'hunter eyes') scores higher.",
      { low: 0.03, high: 0.07, label: "brow–eye gap / face height" }),
    m("eyeSpacing", "Eye Spacing", eyeSpacing, "ratio", spacingScore, baseConf,
      "Eye spacing and relative eye geometry.", REFERENCE.eyeSpacingRatio),
    m("ear", "Eye Aspect Ratio", (earL + earR) / 2, "ratio", earScore, baseConf,
      "Openness of the eye aperture in the image."),
    m("eyeBalance", "Left/Right Balance", eyeSizeDiff, "ratio", balanceScore, baseConf,
      "Difference between measured left and right eye width."),
  ];
  if (browDarknessScore != null) {
    eyeMeas.splice(1, 0,
      m("browDark", "Brow Darkness", browDarknessScore / 100, "index",
        Math.round(browDarknessScore), "medium",
        "Darker, denser eyebrows score higher.", undefined));
  }
  const eyes0 = buildCategory("eyes", eyeMeas, "Hunter eyes, brow strength and eye geometry.");
  // Hunter eyes + brow strength dominate the eye score.
  const browComponent = browDarknessScore != null ? browDarknessScore : hunterScore;
  const eyes = {
    ...eyes0,
    score: Math.round(
      0.4 * hunterScore + 0.2 * browComponent +
      0.4 * ((spacingScore + earScore + balanceScore) / 3)
    ),
  };

  // ---- NOSE ------------------------------------------------------------
  const noseW = euclid(lm[IDX.alaLeft], lm[IDX.alaRight]);
  const noseWidthRatio = noseW / faceW;
  const noseLen = euclid(lm[IDX.glabella], lm[IDX.subnasale]) / faceH;
  const nose = buildCategory(
    "nose",
    [
      m("noseWidth", "Nose Width", noseWidthRatio, "ratio",
        closenessScore(noseWidthRatio, REFERENCE.noseWidthRatio.low, REFERENCE.noseWidthRatio.high),
        baseConf, "Visible nose width relative to face width.", REFERENCE.noseWidthRatio),
      m("noseLength", "Nose Length", noseLen, "ratio",
        closenessScore(noseLen, REFERENCE.noseLengthRatio.low, REFERENCE.noseLengthRatio.high),
        baseConf, "Visible nose length relative to face height.", REFERENCE.noseLengthRatio),
      m("noseAlign2", "Alignment", noseAlign, "ratio",
        clamp(100 - noseAlign * 560, 45, 100), baseConf, rotNote),
    ],
    "Visible nose proportions align with the reference ranges."
  );

  // ---- JAW / LEANNESS — the PRIMARY driver of the BP CLUB score --------
  const jawW = euclid(lm[IDX.gonialLeft], lm[IDX.gonialRight]);
  const jawRatio = jawW / (faceW || 1); // bigonial / bizygomatic
  const chinDev = Math.abs(lm[IDX.chin].x - midX) / faceW;

  // Leanness proxy: lower facial width-to-height reads as leaner and more
  // defined; round / soft (higher facial adiposity) faces read wide-and-short.
  // Landmark WHR only reliably flags heavier/rounder faces at the high end,
  // so keep most faces mid-high and drop the score as WHR climbs past ~0.75.
  const leanness = clamp(100 - Math.max(0, whr - 0.75) * 220);
  // Jaw definition: taper from cheekbones down to the jaw. A soft / round face
  // has jaw ≈ cheek width (little taper); a sharp jaw tapers clearly.
  const taper = 1 - jawRatio;
  const jawDefScore = clamp(taper * 300, 0, 100); // taper 0.30 -> 90
  const jawConf = baseConf === "high" ? "medium" : baseConf;

  const jaw0 = buildCategory(
    "jaw",
    [
      m("leanness", "Leanness", whr, "ratio", leanness, baseConf,
        "Facial width-to-height — leaner, longer faces score higher.", REFERENCE.faceWHR),
      m("jawDef", "Jaw Definition", jawRatio, "ratio", jawDefScore, jawConf,
        "Taper from cheekbones to jaw — a sharper, more defined jaw scores higher.", REFERENCE.jawRatio),
      m("chinSym", "Chin Symmetry", chinDev, "ratio",
        clamp(100 - chinDev * 820, 25, 100), baseConf, "Horizontal chin deviation from midline."),
      m("boneProjection", "3D Bone Projection", null, "—", null, "unavailable",
        "3D jaw metrics require additional data — not reliably measurable from a single 2D photo."),
    ],
    "Leanness and jaw definition — the primary drivers of the BP CLUB score."
  );
  // Jaw score is leanness-led: leanness 65% / jaw definition 35%.
  const jawScore = Math.round(0.65 * leanness + 0.35 * jawDefScore);
  const jaw = { ...jaw0, score: jawScore, confidence: jawConf };

  // ---- MIDFACE ---------------------------------------------------------
  const midface = buildCategory(
    "midface",
    [
      m("midfaceH", "Midface Height", midH, "share",
        closenessScore(midH, REFERENCE.midfaceRatio.low, REFERENCE.midfaceRatio.high),
        baseConf, "Midface height as a share of face height.", REFERENCE.midfaceRatio),
      m("cheekWidth", "Cheekbone Width", faceW / faceH, "ratio",
        closenessScore(faceW / faceH, REFERENCE.faceWHR.low, REFERENCE.faceWHR.high),
        baseConf, "Bizygomatic width relative to face height.", REFERENCE.faceWHR),
    ],
    "Measured midface proportions are well balanced."
  );

  // faceFraming is only partially detectable from landmarks; caller may enrich.
  const faceFraming = buildCategory(
    "faceFraming",
    [
      m("browBalance", "Brow Balance", Math.abs(lm[IDX.browL].y - lm[IDX.browR].y) / faceH,
        "ratio",
        clamp(100 - (Math.abs(lm[IDX.browL].y - lm[IDX.browR].y) / faceH) * 900, 28, 100),
        baseConf, "Vertical difference between brow anchor points."),
      m("hairFraming", "Hairstyle Framing", null, "—", null, "unavailable",
        "Hairstyle framing is not reliably measurable from landmarks alone."),
    ],
    "Visible brow and framing characteristics where detectable."
  );

  const categories: Record<CategoryKey, CategoryResult> = {
    symmetry,
    proportions,
    eyes,
    nose,
    jaw,
    midface,
    skin: skinCategory,
    faceFraming,
  };

  // Overlay is drawn over an aspect-preserving canvas, so it uses the ORIGINAL
  // normalized coordinates (not the x-scaled measurement space).
  const nMidX =
    (normLm[IDX.glabella].x + normLm[IDX.subnasale].x + normLm[IDX.chin].x) / 3;
  const overlay: OverlayGeometry = {
    landmarks: normLm,
    symmetryAxisX: nMidX,
    thirdsY: [normLm[IDX.glabella].y, normLm[IDX.subnasale].y],
    eyeCenters: [
      center(normLm[IDX.eyeLOuter], normLm[IDX.eyeLInner]),
      center(normLm[IDX.eyeROuter], normLm[IDX.eyeRInner]),
    ],
    jawline: JAW_ARC.map((i) => normLm[i]),
    noseWidth: [normLm[IDX.alaLeft], normLm[IDX.alaRight]],
  };

  return { categories, overlay };
}
