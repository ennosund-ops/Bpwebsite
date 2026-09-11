// ============================================================================
// BP CLUB — core data model
// Every measurement is explainable, carries a confidence level, and is
// derived from landmark geometry (never random).
// ============================================================================

export type Confidence = "high" | "medium" | "low" | "unavailable";

export type CategoryKey =
  | "symmetry"
  | "proportions"
  | "eyes"
  | "nose"
  | "jaw"
  | "midface"
  | "skin"
  | "faceFraming";

/** A single measurable characteristic. */
export interface Measurement {
  key: string;
  label: string;
  /** Raw measured value in the unit below (null when not reliably measurable). */
  value: number | null;
  unit: string;
  /** 0–100 sub-score contributed by this measurement (null if unavailable). */
  score: number | null;
  confidence: Confidence;
  /** Plain-English reason for the score / why it may be unreliable. */
  explanation: string;
  /** Optional reference range used by the BP CLUB methodology. */
  reference?: { low: number; high: number; label: string };
}

/** A scored category, composed of its measurements. */
export interface CategoryResult {
  key: CategoryKey;
  label: string;
  score: number | null;
  confidence: Confidence;
  /** One-line justification for the category score. */
  summary: string;
  measurements: Measurement[];
}

export type ImpactLevel = "high" | "medium" | "low";

export interface Recommendation {
  id: string;
  category: string;
  title: string;
  impact: ImpactLevel;
  body: string;
  /** Short, safe, controllable action steps. */
  steps: string[];
  /** Which detected characteristic triggered this suggestion. */
  basedOn: string;
}

export interface FeatureHighlight {
  categoryKey: CategoryKey;
  label: string;
  score: number;
  note: string;
}

export type ImageQualityStatus = "good" | "limited" | "unusable";

export interface QualityCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface ImageQuality {
  status: ImageQualityStatus;
  faceCount: number;
  checks: QualityCheck[];
  message: string;
}

/** Normalized facial landmark (0–1 in image space). */
export interface Landmark {
  x: number;
  y: number;
  z?: number;
}

/** Named guide lines the FacialOverlay can draw. */
export interface OverlayGeometry {
  /** All detected landmark points (normalized). */
  landmarks: Landmark[];
  /** Vertical symmetry axis, normalized x plus top/bottom y. */
  symmetryAxisX: number;
  /** Facial thirds boundaries as normalized y values [brow, subnasale]. */
  thirdsY: [number, number];
  /** Eye centers (normalized). */
  eyeCenters: [Landmark, Landmark];
  /** Outer jaw outline as normalized points. */
  jawline: Landmark[];
  /** Nose width endpoints (normalized). */
  noseWidth: [Landmark, Landmark];
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  isDemo: boolean;
  /** 0–100 overall profile score — NOT an attractiveness rating. */
  overallScore: number;
  overallConfidence: Confidence;
  imageQuality: ImageQuality;
  categories: Record<CategoryKey, CategoryResult>;
  overlay: OverlayGeometry | null;
  strongestFeatures: FeatureHighlight[];
  recommendations: Recommendation[];
}

/** The pluggable analysis provider contract. */
export interface AnalysisProvider {
  readonly name: string;
  readonly isDemo: boolean;
  /** Inspect an image for face presence / usability before full analysis. */
  checkQuality(image: HTMLImageElement): Promise<ImageQuality>;
  /** Produce a full analysis from an already-quality-checked image. */
  analyze(
    image: HTMLImageElement,
    opts?: { onStage?: (stage: string, progress: number) => void }
  ): Promise<AnalysisResult>;
}

export const CATEGORY_ORDER: CategoryKey[] = [
  "symmetry",
  "proportions",
  "eyes",
  "nose",
  "jaw",
  "midface",
  "skin",
  "faceFraming",
];

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  symmetry: "Symmetry",
  proportions: "Proportions",
  eyes: "Eyes",
  nose: "Nose",
  jaw: "Jaw",
  midface: "Midface",
  skin: "Skin",
  faceFraming: "Face Framing",
};
