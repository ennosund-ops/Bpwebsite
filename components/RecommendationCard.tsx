import type { ImpactLevel, Recommendation } from "@/types";
import { cx } from "@/lib/utils";

const IMPACT: Record<ImpactLevel, { label: string; cls: string }> = {
  high: { label: "High Impact", cls: "text-signal-high border-signal-high/30 bg-signal-high/10" },
  medium: { label: "Medium Impact", cls: "text-signal-med border-signal-med/30 bg-signal-med/10" },
  low: { label: "Low Impact", cls: "text-fg-muted border-line-strong bg-ink-600" },
};

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const impact = IMPACT[rec.impact];
  return (
    <div className="card card-hover flex flex-col p-6">
      <div className="flex items-center justify-between">
        <span className="label">{rec.category}</span>
        <span
          className={cx(
            "rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-label",
            impact.cls
          )}
        >
          {impact.label}
        </span>
      </div>

      <h3 className="mt-3 text-lg font-medium tracking-tight text-fg">{rec.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{rec.body}</p>

      <ul className="mt-4 flex flex-col gap-2">
        {rec.steps.map((s, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-fg-muted">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
            <span>{s}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-line pt-3 font-mono text-[10px] uppercase tracking-label text-fg-faint">
        Based on: {rec.basedOn}
      </p>
    </div>
  );
}
