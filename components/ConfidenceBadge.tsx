import type { Confidence } from "@/types";
import { cx } from "@/lib/utils";

const MAP: Record<Confidence, { label: string; dot: string; text: string }> = {
  high: { label: "High Confidence", dot: "bg-signal-high", text: "text-signal-high" },
  medium: { label: "Medium Confidence", dot: "bg-signal-med", text: "text-signal-med" },
  low: { label: "Low Confidence", dot: "bg-signal-low", text: "text-signal-low" },
  unavailable: { label: "Not Measurable", dot: "bg-fg-faint", text: "text-fg-faint" },
};

export function ConfidenceBadge({
  confidence,
  compact = false,
}: {
  confidence: Confidence;
  compact?: boolean;
}) {
  const c = MAP[confidence];
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-mono uppercase",
        compact ? "text-[9px] tracking-[0.12em]" : "text-[10px] tracking-label",
        c.text
      )}
    >
      <span className={cx("h-1.5 w-1.5 shrink-0 rounded-full", c.dot)} />
      {compact ? confidence : c.label}
    </span>
  );
}
