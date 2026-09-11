"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/types";
import { CATEGORY_ORDER, CATEGORY_LABELS } from "@/types";
import { getProvider, DEMO_MODE } from "@/services/analysis";
import { buildDemoResult } from "@/lib/demoData";
import { UploadZone } from "@/components/UploadZone";
import { Eyebrow, SectionTitle, Disclaimer } from "@/components/ui";
import { cx } from "@/lib/utils";

type Slot = { url: string; file: File } | null;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("load"));
    img.src = url;
  });
}

export default function ComparePage() {
  const [before, setBefore] = useState<Slot>(null);
  const [after, setAfter] = useState<Slot>(null);
  const [results, setResults] = useState<{ b: AnalysisResult; a: AnalysisResult } | null>(null);
  const [busy, setBusy] = useState(false);

  async function analyzeOne(slot: Slot, seed: string): Promise<AnalysisResult> {
    if (DEMO_MODE || !slot) return buildDemoResult({ seed });
    const img = await loadImage(slot.url);
    const provider = await getProvider();
    return provider.analyze(img);
  }

  async function run() {
    setBusy(true);
    try {
      const [b, a] = await Promise.all([
        analyzeOne(before, "before"),
        analyzeOne(after, "after"),
      ]);
      setResults({ b, a });
    } finally {
      setBusy(false);
    }
  }

  const Slot = ({
    label,
    slot,
    set,
  }: {
    label: string;
    slot: Slot;
    set: (s: Slot) => void;
  }) => (
    <div>
      <span className="label mb-2 block">{label}</span>
      {slot ? (
        <div className="relative overflow-hidden rounded-2xl border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slot.url} alt={label} className="aspect-square w-full object-cover" />
          <button
            onClick={() => {
              URL.revokeObjectURL(slot.url);
              set(null);
              setResults(null);
            }}
            className="absolute right-2 top-2 rounded-lg bg-ink-950/80 px-2 py-1 font-mono text-[10px] uppercase tracking-label text-fg-muted backdrop-blur hover:text-fg"
          >
            Replace
          </button>
        </div>
      ) : (
        <UploadZone
          compact
          onFile={(file) => set({ url: URL.createObjectURL(file), file })}
        />
      )}
    </div>
  );

  return (
    <div className="container-bp py-14">
      <div className="max-w-3xl">
        <Eyebrow>Before / After</Eyebrow>
        <h1 className="mt-5 text-4xl font-semibold tracking-tightest text-fg sm:text-5xl">
          Compare two photos.
        </h1>
        <p className="mt-4 text-fg-muted">
          Track visible changes in grooming, skin appearance, hairstyle and framing
          across two photographs.
        </p>
      </div>

      <div className="mt-8 max-w-3xl">
        <Disclaimer>
          Camera angle, focal length, lighting, expression and distance can
          dramatically change measurements. A difference between two photos does
          <strong className="text-fg"> not</strong> prove your bone structure changed.
        </Disclaimer>
      </div>

      <div className="mt-8 grid max-w-3xl gap-5 sm:grid-cols-2">
        <Slot label="Before" slot={before} set={setBefore} />
        <Slot label="After" slot={after} set={setAfter} />
      </div>

      <div className="mt-6">
        <button
          onClick={run}
          disabled={busy || (!DEMO_MODE && (!before || !after))}
          className="btn-primary"
        >
          {busy ? "Comparing…" : "Compare"}
        </button>
        {DEMO_MODE && (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-label text-fg-faint">
            Demo mode · illustrative comparison data
          </p>
        )}
      </div>

      {results && (
        <div className="mt-12 max-w-3xl animate-fade-in">
          <SectionTitle title="Comparison" />
          <div className="mt-6 grid grid-cols-3 items-center gap-4 rounded-2xl border border-line bg-ink-800 p-6">
            <div className="text-center">
              <div className="label">Before</div>
              <div className="num mt-1 text-4xl font-semibold text-fg">{results.b.overallScore}</div>
            </div>
            <div className="text-center">
              <div className="label">Delta</div>
              <Delta a={results.a.overallScore} b={results.b.overallScore} big />
            </div>
            <div className="text-center">
              <div className="label">After</div>
              <div className="num mt-1 text-4xl font-semibold text-fg">{results.a.overallScore}</div>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-line">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-ink-800 font-mono text-[11px] uppercase tracking-label text-fg-faint">
                <tr>
                  <th className="px-5 py-3 text-left font-normal">Category</th>
                  <th className="px-4 py-3 text-right font-normal">Before</th>
                  <th className="px-4 py-3 text-right font-normal">After</th>
                  <th className="px-4 py-3 text-right font-normal">Δ</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORY_ORDER.map((k) => (
                  <tr key={k} className="border-b border-line last:border-0">
                    <td className="px-5 py-3 text-fg">{CATEGORY_LABELS[k]}</td>
                    <td className="num px-4 py-3 text-right text-fg-muted">
                      {results.b.categories[k].score ?? "—"}
                    </td>
                    <td className="num px-4 py-3 text-right text-fg-muted">
                      {results.a.categories[k].score ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Delta
                        a={results.a.categories[k].score}
                        b={results.b.categories[k].score}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Delta({ a, b, big }: { a: number | null; b: number | null; big?: boolean }) {
  if (a == null || b == null) return <span className="text-fg-faint">—</span>;
  const d = a - b;
  const tone = d > 0 ? "text-signal-high" : d < 0 ? "text-signal-low" : "text-fg-faint";
  return (
    <span className={cx("num font-semibold", big ? "mt-1 block text-3xl" : "text-sm", tone)}>
      {d > 0 ? "+" : ""}
      {d}
    </span>
  );
}
