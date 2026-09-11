"use client";

import { useState } from "react";
import type { AnalysisResult, CategoryKey } from "@/types";
import { CATEGORY_ORDER } from "@/types";
import { ScoreRing } from "@/components/ScoreRing";
import { ScoreCard } from "@/components/ScoreCard";
import { MeasurementRow } from "@/components/MeasurementRow";
import { FacialOverlay } from "@/components/FacialOverlay";
import { RecommendationCard } from "@/components/RecommendationCard";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { Eyebrow, SectionTitle, Disclaimer } from "@/components/ui";
import { cx, scoreTone } from "@/lib/utils";
import { tierForScore } from "@/lib/tiers";

const IMPACT_LABEL = { high: "High Impact", medium: "Medium Impact", low: "Low Impact" };

const TIER_TONE = {
  high: "text-signal-high",
  mid: "text-fg",
  low: "text-signal-low",
} as const;

export function ResultsDashboard({
  result,
  imageUrl,
  onDelete,
  onRestart,
}: {
  result: AnalysisResult;
  imageUrl: string | null;
  onDelete: () => void;
  onRestart: () => void;
}) {
  const [selected, setSelected] = useState<CategoryKey>("symmetry");
  const selectedCat = result.categories[selected];

  const tier = tierForScore(result.overallScore);

  return (
    <div className="animate-fade-in">
      {/* ---- Profile header (mobile) ----
           Rating, photo, title and description are packed together and kept
           compact so they all fit on one screen. Shown below lg only. */}
      <div className="card p-5 lg:hidden">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <ScoreRing
              score={result.overallScore}
              confidence={result.overallConfidence}
              size={128}
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Eyebrow>Your BP CLUB Profile</Eyebrow>
              {result.isDemo && (
                <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-label text-accent-soft">
                  Demo
                </span>
              )}
            </div>
            <h1 className={cx("mt-1 text-3xl font-semibold uppercase leading-none tracking-tightest", TIER_TONE[tier.tone])}>
              {tier.name}
            </h1>
          </div>
        </div>
        <div className="mt-4">
          <FacialOverlay imageUrl={imageUrl} overlay={result.overlay} isDemo={result.isDemo} />
        </div>
        {/* Rating description under the photo (the buttons now live lower down). */}
        <p className="mt-4 text-sm leading-relaxed text-fg">{tier.desc}</p>
      </div>

      {/* ---- Profile header (desktop) ---- */}
      <div className="card hidden gap-8 p-10 lg:grid lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="flex justify-center">
          <ScoreRing score={result.overallScore} confidence={result.overallConfidence} />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow>Your BP CLUB Profile</Eyebrow>
            {result.isDemo && (
              <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-label text-accent-soft">
                Demo Analysis
              </span>
            )}
          </div>
          <div className="mt-3 flex items-end gap-3">
            <h1 className={cx("text-5xl font-semibold uppercase leading-none tracking-tightest sm:text-6xl", TIER_TONE[tier.tone])}>
              {tier.name}
            </h1>
          </div>
          <p className="mt-3 text-base font-medium text-fg">{tier.desc}</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg-muted">
            Your classification on the BP CLUB scale, from your{" "}
            <strong className="text-fg">{result.overallScore}/100</strong> profile
            score. This reflects the BP CLUB measurement methodology.
            {result.isDemo && " These figures are illustrative demo data and were not derived from your photo."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={onRestart} className="btn-ghost">Analyze another photo</button>
            <button
              onClick={onDelete}
              className="btn border border-signal-low/30 text-signal-low hover:bg-signal-low/10"
            >
              Delete my analysis
            </button>
          </div>
        </div>
      </div>

      {/* ---- Facial map (desktop; on mobile it appears beside the score above) ---- */}
      <section className="mt-12 hidden lg:block">
        <SectionTitle eyebrow="Facial Map" title="Your landmark visualization" />
        <div className="mt-6">
          <FacialOverlay imageUrl={imageUrl} overlay={result.overlay} isDemo={result.isDemo} />
        </div>
      </section>

      {/* ---- Category grid + measurements ---- */}
      <section className="mt-12">
        <SectionTitle
          eyebrow="Categories"
          title="Every category, scored and explained"
          subtitle="Select a card to see the measurements behind its score."
        />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {CATEGORY_ORDER.map((k) => (
              <ScoreCard
                key={k}
                category={result.categories[k]}
                active={selected === k}
                onClick={() => setSelected(k)}
              />
            ))}
          </div>

          <div className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="label">{selectedCat.label}</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span
                    className={cx(
                      "num text-3xl font-semibold",
                      selectedCat.score != null &&
                        {
                          high: "text-signal-high",
                          med: "text-signal-med",
                          low: "text-signal-low",
                        }[scoreTone(selectedCat.score)]
                    )}
                  >
                    {selectedCat.score ?? "—"}
                  </span>
                  <span className="num text-sm text-fg-faint">/100</span>
                </div>
              </div>
              <ConfidenceBadge confidence={selectedCat.confidence} />
            </div>
            <p className="mt-2 text-sm text-fg-muted">{selectedCat.summary}</p>

            {selected === "skin" && (
              <div className="mt-4">
                <Disclaimer>
                  Image-based skin appearance. This is an analysis of visible image
                  characteristics and is <strong className="text-fg">not</strong> a
                  medical or dermatological diagnosis.
                </Disclaimer>
              </div>
            )}

            <div className="mt-4">
              {selectedCat.measurements.map((m) => (
                <MeasurementRow key={m.key} m={m} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- Strongest features ---- */}
      <section className="mt-14">
        <SectionTitle eyebrow="Strongest Features" title="Where you measure highest" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {result.strongestFeatures.map((f, i) => (
            <div key={f.categoryKey} className="card card-hover p-6">
              <div className="flex items-center justify-between">
                <span className="num text-2xl font-semibold text-accent-soft">
                  0{i + 1}
                </span>
                <span className="num text-lg font-semibold text-signal-high">{f.score}</span>
              </div>
              <h3 className="mt-3 text-lg font-medium tracking-tight text-fg">{f.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{f.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Highest impact / recommendations ---- */}
      <section className="mt-14">
        <SectionTitle
          eyebrow="Highest-Impact Opportunities"
          title="Controllable ways to present your features"
          subtitle="These focus on grooming, framing, skincare, photography and healthy habits — never altering your anatomy."
        />
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {result.recommendations.map((r) => (
            <RecommendationCard key={r.id} rec={r} />
          ))}
        </div>
      </section>

      {/* ---- Actions (mobile) — moved down the page, below the results ---- */}
      <div className="mt-12 flex flex-wrap gap-3 lg:hidden">
        <button onClick={onRestart} className="btn-ghost">Analyze another photo</button>
        <button
          onClick={onDelete}
          className="btn border border-signal-low/30 text-signal-low hover:bg-signal-low/10"
        >
          Delete my analysis
        </button>
      </div>

      <div className="mt-12">
        <Disclaimer>
          BP CLUB does not diagnose medical conditions or determine objective
          attractiveness, worth, health or genetic qu
