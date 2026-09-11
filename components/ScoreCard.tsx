import type { CategoryResult } from "@/types";
import { ScoreBar } from "@/components/ScoreBar";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { cx, scoreTone } from "@/lib/utils";

const NUM_TONE: Record<string, string> = {
  high: "text-signal-high",
  med: "text-signal-med",
  low: "text-signal-low",
};

export function ScoreCard({
  category,
  onClick,
  active,
}: {
  category: CategoryResult;
  onClick?: () => void;
  active?: boolean;
}) {
  const { label, score, confidence, summary } = category;
  const tone = scoreTone(score);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "card card-hover group flex flex-col items-start p-5 text-left",
        active && "border-accent/60 bg-ink-700/70"
      )}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <span className="label min-w-0 truncate">{label}</span>
        <ConfidenceBadge confidence={confidence} compact />
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span className={cx("num text-4xl font-semibold tracking-tight", NUM_TONE[tone])}>
          {score ?? "—"}
        </span>
        <span className="num text-sm text-fg-faint">/100</span>
      </div>

      <ScoreBar score={score} className="mt-3" />

      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-fg-muted">
        {summary}
      </p>
    </button>
  );
}
