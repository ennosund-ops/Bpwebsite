import type {
  AnalysisProvider,
  CategoryResult,
  ImageQuality,
  Landmark,
  Measurement,
} from "@/types";
import { analyzeLandmarks, IDX } from "@/lib/geometry";
import { buildCategory } from "@/lib/scoring";
import { overallScore, strongestFeatures } from "@/lib/scoring";
import { buildRecommendations } from "@/lib/recommendations";
import { structuralChecks, sampleImage } from "@/services/imageQuality";
import { clamp } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Real provider: MediaPipe Face Mesh (via @mediapipe/tasks-vision).
// The model + wasm are loaded from a CDN at runtime, keeping the bundle light.
// Everything is computed in the browser; no image leaves the device.
// ---------------------------------------------------------------------------

const WASM_ROOT =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

let landmarkerPromise: Promise<any> | null = null;

async function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await import("@mediapipe/tasks-vision");
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(WASM_ROOT);
      return vision.FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        runningMode: "IMAGE",
        numFaces: 2,
      });
    })();
  }
  return landmarkerPromise;
}

/** Image-based skin appearance from cheek/forehead pixel sampling. */
function analyzeSkin(image: HTMLImageElement, lm: Landmark[]): CategoryResult {
  const sample = sampleImage(image, 400);
  const measurements: Measurement[] = [];
  if (!sample) {
    return buildCategory(
      "skin",
      [
        {
          key: "clarity",
          label: "Apparent Clarity",
          value: null,
          unit: "index",
          score: null,
          confidence: "unavailable",
          explanation: "Could not read image pixels for skin analysis.",
        },
      ],
      "Skin appearance could not be measured from this image."
    );
  }
  const { data, w, h } = sample;
  // Sample two cheeks + forehead regions using landmark anchors.
  const regions = [
    { cx: (lm[IDX.faceLeft].x + lm[IDX.noseTip].x) / 2, cy: lm[IDX.noseTip].y },
    { cx: (lm[IDX.faceRight].x + lm[IDX.noseTip].x) / 2, cy: lm[IDX.noseTip].y },
    { cx: lm[IDX.trichion].x, cy: (lm[IDX.trichion].y + lm[IDX.glabella].y) / 2 },
  ];
  const lums: number[] = [];
  const chroma: number[] = [];
  const rad = Math.round(Math.min(w, h) * 0.06);
  for (const r of regions) {
    const px = Math.round(r.cx * w);
    const py = Math.round(r.cy * h);
    for (let dy = -rad; dy <= rad; dy++) {
      for (let dx = -rad; dx <= rad; dx++) {
        const x = px + dx;
        const y = py + dy;
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        const i = (y * w + x) * 4;
        const R = data[i], G = data[i + 1], B = data[i + 2];
        lums.push(0.299 * R + 0.587 * G + 0.114 * B);
        chroma.push(Math.max(R, G, B) - Math.min(R, G, B));
      }
    }
  }
  const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / (a.length || 1);
  const std = (a: number[]) => {
    const mu = mean(a);
    return Math.sqrt(mean(a.map((v) => (v - mu) ** 2)));
  };
  const lumStd = std(lums); // texture / uneven lighting
  const chromaMean = mean(chroma); // redness / tone variation proxy
  // Some texture and shadow is normal, but blotchy / red / uneven skin should
  // read clearly lower.
  const clarity = clamp(100 - Math.max(0, lumStd - 6) * 1.5, 30, 100);
  const tone = clamp(100 - Math.max(0, std(chroma) - 4) * 2.1, 30, 100);
  const redness = clamp(100 - Math.max(0, chromaMean - 18) * 2.2, 32, 100);

  return buildCategory(
    "skin",
    [
      {
        key: "clarity", label: "Apparent Clarity", value: clarity / 100, unit: "index",
        score: Math.round(clarity), confidence: "medium",
        explanation: "Based on visible texture variation in sampled skin regions.",
      },
      {
        key: "tone", label: "Tone Consistency", value: tone / 100, unit: "index",
        score: Math.round(tone), confidence: "medium",
        explanation: "Based on colour variation across sampled skin regions.",
      },
      {
        key: "redness", label: "Redness / Blemishes", value: redness / 100, unit: "index",
        score: Math.round(redness), confidence: "medium",
        explanation: "Based on visible colour intensity in sampled skin regions.",
      },
    ],
    "Image-based skin appearance from sampled skin regions (not a diagnosis)."
  );
}

/** Eyebrow darkness / density from the contrast between brow and forehead skin. */
function analyzeBrowDarkness(image: HTMLImageElement, lm: Landmark[]): number | null {
  const sample = sampleImage(image, 400);
  if (!sample) return null;
  const { data, w, h } = sample;
  const rad = Math.max(2, Math.round(Math.min(w, h) * 0.02));
  const lumAt = (nx: number, ny: number) => {
    const px = Math.round(nx * w);
    const py = Math.round(ny * h);
    let s = 0;
    let n = 0;
    for (let dy = -rad; dy <= rad; dy++) {
      for (let dx = -rad; dx <= rad; dx++) {
        const x = px + dx;
        const y = py + dy;
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        const i = (y * w + x) * 4;
        s += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        n++;
      }
    }
    return n ? s / n : 0;
  };
  const browLum =
    (lumAt(lm[IDX.browL].x, lm[IDX.browL].y) + lumAt(lm[IDX.browR].x, lm[IDX.browR].y)) / 2;
  // Forehead skin just above the brows / between them.
  const skinLum =
    (lumAt(lm[IDX.glabella].x, lm[IDX.glabella].y - 0.04) +
      lumAt(lm[IDX.trichion].x, (lm[IDX.trichion].y + lm[IDX.glabella].y) / 2)) / 2;
  // Darker, denser brows produce stronger brow-vs-skin contrast.
  const contrast = (skinLum - browLum) / Math.max(1, skinLum);
  return clamp(contrast * 260, 15, 100);
}

export const mediapipeProvider: AnalysisProvider = {
  name: "MediaPipe Face Mesh",
  isDemo: false,

  async checkQuality(image): Promise<ImageQuality> {
    const structural = structuralChecks(image);
    let faceCount = 0;
    let faceCheck = {
      id: "face",
      label: "Face detection",
      passed: false,
      detail: "No face detected.",
    };
    let single = { id: "single", label: "Single face", passed: false, detail: "" };
    try {
      const landmarker = await getLandmarker();
      const res = landmarker.detect(image);
      faceCount = res.faceLandmarks?.length ?? 0;
      faceCheck = {
        id: "face",
        label: "Face detection",
        passed: faceCount >= 1,
        detail: faceCount >= 1 ? "One or more faces found." : "No clear face found.",
      };
      single = {
        id: "single",
        label: "Single face",
        passed: faceCount === 1,
        detail:
          faceCount === 1
            ? "One primary face."
            : faceCount > 1
            ? `${faceCount} faces detected — use a photo with just you.`
            : "No face to evaluate.",
      };
    } catch (e) {
      faceCheck.detail = "Face detector failed to load.";
    }

    const checks = [faceCheck, single, ...structural];
    const failed = checks.filter((c) => !c.passed);
    let status: ImageQuality["status"] = "good";
    if (faceCount === 0) status = "unusable";
    else if (failed.length > 0) status = "limited";

    return {
      status,
      faceCount,
      checks,
      message:
        status === "unusable"
          ? "We couldn't find a clear face. Try a front-facing photo with your whole face visible."
          : status === "limited"
          ? `Some measurements may be unreliable: ${failed.map((f) => f.label).join(", ")}.`
          : "Image looks good for analysis.",
    };
  },

  async analyze(image, opts) {
    opts?.onStage?.("Uploading image", 12);
    const landmarker = await getLandmarker();
    opts?.onStage?.("Detecting face", 30);
    const res = landmarker.detect(image);
    const faces = res.faceLandmarks ?? [];
    if (faces.length === 0) {
      throw new Error("NO_FACE");
    }
    opts?.onStage?.("Mapping landmarks", 48);
    const lm: Landmark[] = faces[0].map((p: any) => ({ x: p.x, y: p.y, z: p.z }));

    opts?.onStage?.("Calculating symmetry", 64);
    const skin = analyzeSkin(image, lm);
    opts?.onStage?.("Analyzing proportions", 80);
    const aspect = image.naturalWidth / image.naturalHeight;
    const browDark = analyzeBrowDarkness(image, lm);
    const { categories, overlay } = analyzeLandmarks(lm, skin, aspect, browDark);

    opts?.onStage?.("Building your profile", 94);
    const { score, confidence } = overallScore(categories);
    opts?.onStage?.("Analysis complete", 100);

    return {
      id: "mp-" + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      isDemo: false,
      overallScore: score,
      overallConfidence: confidence,
      imageQuality: {
        status: "good",
        faceCount: faces.length,
        checks: [],
        message: "Analyzed from detected facial landmarks.",
      },
      categories,
      overlay,
      strongestFeatures: strongestFeatures(categories),
      recommendations: buildRecommendations(categories),
    };
  },
};
