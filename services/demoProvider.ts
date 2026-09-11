import type { AnalysisProvider, ImageQuality } from "@/types";
import { buildDemoResult } from "@/lib/demoData";
import { structuralChecks } from "@/services/imageQuality";

const STAGES = [
  "Uploading image",
  "Detecting face",
  "Mapping landmarks",
  "Calculating symmetry",
  "Analyzing proportions",
  "Building your profile",
];

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Deterministic demo provider. It performs REAL structural quality checks on
 * the uploaded image (resolution, lighting, sharpness) but cannot detect faces
 * without a CV backend, so the returned SCORES are clearly-labelled demo data
 * and never presented as derived from the user's photograph.
 */
export const demoProvider: AnalysisProvider = {
  name: "BP CLUB Demo",
  isDemo: true,

  async checkQuality(image): Promise<ImageQuality> {
    const checks = structuralChecks(image);
    // Face-presence cannot be verified in demo mode; we assume one face and say so.
    checks.unshift({
      id: "face",
      label: "Face detection",
      passed: true,
      detail: "Face detection is disabled in demo mode (assumed present).",
    });
    const failed = checks.filter((c) => !c.passed);
    const status = failed.length === 0 ? "good" : failed.length <= 1 ? "limited" : "limited";
    return {
      status,
      faceCount: 1,
      checks,
      message:
        failed.length === 0
          ? "Image looks good. Demo scores are illustrative, not from your photo."
          : `${failed.map((f) => f.label).join(", ")} could be better. Demo scores are illustrative.`,
    };
  },

  async analyze(_image, opts) {
    for (let i = 0; i < STAGES.length; i++) {
      opts?.onStage?.(STAGES[i], Math.round(((i + 1) / (STAGES.length + 1)) * 100));
      await wait(360);
    }
    opts?.onStage?.("Analysis complete", 100);
    await wait(200);
    return buildDemoResult();
  },
};
