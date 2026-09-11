import type { QualityCheck } from "@/types";

/** Draw an image to an offscreen canvas at a bounded size and return pixels. */
export function sampleImage(
  image: HTMLImageElement,
  maxDim = 320
): { data: Uint8ClampedArray; w: number; h: number } | null {
  const scale = Math.min(1, maxDim / Math.max(image.naturalWidth, image.naturalHeight));
  const w = Math.max(1, Math.round(image.naturalWidth * scale));
  const h = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, w, h);
  try {
    return { data: ctx.getImageData(0, 0, w, h).data, w, h };
  } catch {
    return null;
  }
}

/** Mean luminance 0–255. */
export function meanLuminance(data: Uint8ClampedArray): number {
  let sum = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return sum / n;
}

/**
 * Blur estimate via variance of a Laplacian-ish neighbor difference on
 * grayscale. Higher = sharper.
 */
export function sharpness(data: Uint8ClampedArray, w: number, h: number): number {
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const p = i * 4;
    gray[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
  }
  let mean = 0;
  const vals: number[] = [];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const lap =
        4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - w] - gray[i + w];
      vals.push(lap);
      mean += lap;
    }
  }
  mean /= vals.length || 1;
  let variance = 0;
  for (const v of vals) variance += (v - mean) ** 2;
  return variance / (vals.length || 1);
}

/** Non-face structural checks shared by every provider. */
export function structuralChecks(image: HTMLImageElement): QualityCheck[] {
  const checks: QualityCheck[] = [];
  const sample = sampleImage(image);

  // Resolution
  const minSide = Math.min(image.naturalWidth, image.naturalHeight);
  checks.push({
    id: "resolution",
    label: "Resolution",
    passed: minSide >= 300,
    detail:
      minSide >= 300
        ? `${image.naturalWidth}×${image.naturalHeight}px is sufficient.`
        : "Image is quite small; details may be lost.",
  });

  if (sample) {
    const lum = meanLuminance(sample.data);
    checks.push({
      id: "light",
      label: "Lighting",
      passed: lum > 45 && lum < 225,
      detail:
        lum <= 45
          ? "Image looks underexposed."
          : lum >= 225
          ? "Image looks overexposed."
          : "Lighting looks reasonable.",
    });

    const sharp = sharpness(sample.data, sample.w, sample.h);
    checks.push({
      id: "sharp",
      label: "Sharpness",
      passed: sharp > 60,
      detail:
        sharp > 60
          ? "Image is sufficiently sharp."
          : "Image looks blurry; some measurements may be unreliable.",
    });
  }

  return checks;
}
