import type { Measurement } from "@/types";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { cx, formatNum, scoreTone } from "@/lib/utils";

const NUM_TONE: Record<string, string> = {
  high: "text-signal-high",
  med: "text-signal-med",
  low: "text-signal-low",
};

export function MeasurementRow({ m }: { m: Measurement }) {
  const unavailable = m.confidence === "unavailable" || m.score == null;
  const tone = scoreTone(m.score);

  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-b border-line py-3 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-fg">{m.label}</span>
        {m.reference && (
          <span className="hidden font-mono text-[10px] text-fg-faint sm:inline">
            ref {m.reference.low}–{m.reference.high}
          </span>
        )}
      </div>

      <div className="flex items-center justify-end gap-4">
        <span className="num text-xs text-fg-faint">
          {unavailable ? "" : `${formatNum(m.value)} ${m.unit}`}
        </span>
        {unavailable ? (
          <span className="font-mono text-[10px] uppercase tracking-label text-fg-faint">
            Not reliably measurable
          </span>
        ) : (
          <span className={cx("num w-9 shrink-0 text-right text-sm font-semibold", NUM_TONE[tone])}>
            {Math.round(m.score as number)}
          </span>
        )}
      </div>

      <div className="col-span-2 flex items-center justify-between">
        <p className="max-w-[80%] text-xs leading-relaxed text-fg-muted">
          {m.explanation}
        </p>
        <ConfidenceBadge confidence={m.confidence} compact />
      </div>
    </div>
  );
}
