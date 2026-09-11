import type { AnalysisProvider } from "@/types";
import { DEMO_MODE } from "@/lib/utils";
import { demoProvider } from "@/services/demoProvider";

/**
 * Single entry point for the analysis pipeline. Swapping providers is a
 * one-line change here (or via NEXT_PUBLIC_DEMO_MODE). The real MediaPipe
 * provider is imported lazily so demo mode never pulls in the CV bundle.
 */
export async function getProvider(): Promise<AnalysisProvider> {
  if (DEMO_MODE) return demoProvider;
  const { mediapipeProvider } = await import("@/services/mediapipeProvider");
  return mediapipeProvider;
}

export { DEMO_MODE };
