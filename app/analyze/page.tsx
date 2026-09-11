"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnalysisResult, ImageQuality } from "@/types";
import { getProvider, DEMO_MODE } from "@/services/analysis";
import { UploadZone } from "@/components/UploadZone";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { Eyebrow, SectionTitle, Disclaimer } from "@/components/ui";
import { cx } from "@/lib/utils";

type Step = "upload" | "quality" | "analyzing" | "results" | "error";

const GUIDELINES = [
  { t: "Front Facing", d: "Look directly toward the camera." },
  { t: "Good Lighting", d: "Use even, natural lighting." },
  { t: "Neutral Expression", d: "Relax your face." },
  { t: "Clear View", d: "Avoid sunglasses, masks and heavy obstruction." },
];

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("IMAGE_LOAD"));
    img.src = url;
  });
}

export default function AnalyzePage() {
  const [step, setStep] = useState<Step>("upload");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<ImageQuality | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [stage, setStage] = useState("Uploading image");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const imageElRef = useRef<HTMLImageElement | null>(null);

  // Revoke object URLs on unmount.
  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const reset = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    imageElRef.current = null;
    setQuality(null);
    setResult(null);
    setProgress(0);
    setStep("upload");
  }, [imageUrl]);

  const handleFile = useCallback(
    async (file: File) => {
      try {
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        const img = await loadImage(url);
        imageElRef.current = img;
        const provider = await getProvider();
        const q = await provider.checkQuality(img);
        setQuality(q);
        if (q.status === "unusable") {
          setErrorMsg(q.message);
          setStep("error");
        } else {
          setStep("quality");
        }
      } catch {
        setErrorMsg("We couldn't read that image. Try another photo.");
        setStep("error");
      }
    },
    []
  );

  const runAnalysis = useCallback(async () => {
    const img = imageElRef.current;
    if (!img) return;
    setStep("analyzing");
    setProgress(0);
    try {
      const provider = await getProvider();
      const res = await provider.analyze(img, {
        onStage: (s, p) => {
          setStage(s);
          setProgress(p);
        },
      });
      setResult(res);
      setStep("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      const msg =
        e instanceof Error && e.message === "NO_FACE"
          ? "We couldn't find a clear face in your photo."
          : "Something went wrong during analysis. Please try again.";
      setErrorMsg(msg);
      setStep("error");
    }
  }, []);

  return (
    <div className="container-bp py-12 sm:py-16">
      {/* Demo mode banner */}
      {DEMO_MODE && step !== "results" && (
        <div className="mx-auto mb-8 flex max-w-2xl items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
          <span className="rounded-md bg-accent/15 px-2 py-1 font-mono text-[10px] uppercase tracking-label text-accent-soft">
            Demo Mode
          </span>
          <p className="text-xs text-fg-muted">
            Scores shown are deterministic demo data, not derived from your photo.
            Your image never leaves your device.
          </p>
        </div>
      )}

      {step === "upload" && (
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <Eyebrow className="justify-center">Start Your Analysis</Eyebrow>
            <h1 className="mt-4 text-4xl font-semibold tracking-tightest text-fg">
              START YOUR ANALYSIS
            </h1>
            <p className="mt-3 text-fg-muted">
              Use a clear photograph for the most reliable measurements.
            </p>
          </div>

          <div className="mt-8">
            <UploadZone onFile={handleFile} />
          </div>

          <div className="mt-10">
            <span className="label">Photo Guidelines</span>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {GUIDELINES.map((g) => (
                <div key={g.t} className="card p-4">
                  <h3 className="text-sm font-medium text-fg">{g.t}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-fg-muted">{g.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === "quality" && quality && (
        <div className="mx-auto max-w-2xl">
          <SectionTitle
            eyebrow="Photo Quality"
            title={
              quality.status === "good" ? "Photo looks good" : "Photo quality: limited"
            }
          />
          <div className="mt-6 grid gap-6 sm:grid-cols-[220px_1fr]">
            {imageUrl && (
              <div className="overflow-hidden rounded-2xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Your upload" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="card p-5">
              {quality.checks.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start gap-3 border-b border-line py-2.5 last:border-0"
                >
                  <span
                    className={cx(
                      "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px]",
                      c.passed ? "bg-signal-high/20 text-signal-high" : "bg-signal-med/20 text-signal-med"
                    )}
                  >
                    {c.passed ? "✓" : "!"}
                  </span>
                  <div>
                    <div className="text-sm text-fg">{c.label}</div>
                    <div className="text-xs text-fg-muted">{c.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {quality.status !== "good" && (
            <p className="mt-4 text-sm text-fg-muted">{quality.message}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={runAnalysis} className="btn-primary">
              {quality.status === "good" ? "Analyze my face" : "Analyze anyway"}
            </button>
            <button onClick={reset} className="btn-ghost">Upload better photo</button>
          </div>
        </div>
      )}

      {step === "analyzing" && (
        <AnalysisProgress stage={stage} progress={progress} />
      )}

      {step === "results" && result && (
        <ResultsDashboard
          result={result}
          imageUrl={imageUrl}
          onDelete={reset}
          onRestart={reset}
        />
      )}

      {step === "error" && (
        <div className="mx-auto max-w-md py-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-signal-low/30 bg-signal-low/10 text-signal-low">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-fg">
            WE COULDN&apos;T FIND A CLEAR FACE
          </h1>
          <p className="mt-3 text-sm text-fg-muted">{errorMsg}</p>
          <p className="mt-1 text-sm text-fg-muted">
            Try a front-facing photograph with your entire face visible.
          </p>
          <button onClick={reset} className="btn-primary mx-auto mt-6 w-fit">
            Try another photo
          </button>
        </div>
      )}

      {step === "upload" && (
        <div className="mx-auto mt-10 max-w-2xl">
          <Disclaimer>
            BP CLUB analyzes visible image characteristics only. Results are
            estimates, not medical advice or objective measures of attractiveness.
            Photos can distort proportions due to lens, distance, angle and lighting.
          </Disclaimer>
        </div>
      )}
    </div>
  );
}
