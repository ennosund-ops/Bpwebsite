"use client";

import { BpMark } from "@/components/BpMark";
import { cx } from "@/lib/utils";

const STAGES = [
  "Uploading image",
  "Detecting face",
  "Mapping landmarks",
  "Calculating symmetry",
  "Analyzing proportions",
  "Building your profile",
  "Analysis complete",
];

export function AnalysisProgress({
  stage,
  progress,
}: {
  stage: string;
  progress: number;
}) {
  const activeIndex = STAGES.findIndex((s) => s === stage);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-10 text-center">
      <div className="relative grid h-24 w-24 place-items-center">
        <span className="absolute inset-0 rounded-full border border-accent/40 animate-pulse-ring" />
        <span className="absolute inset-2 rounded-full border border-accent/30 animate-pulse-ring [animation-delay:0.6s]" />
        <span className="grid h-16 w-16 place-items-center rounded-2xl border border-line-strong bg-ink-800 text-fg">
          <BpMark withClub={false} className="w-7" />
        </span>
      </div>

      <div className="mt-8 w-full">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm uppercase tracking-label text-fg">
            {stage}
          </span>
          <span className="num text-sm text-accent-soft">{progress}%</span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink-600">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ul className="mt-8 w-full space-y-2 text-left">
        {STAGES.slice(0, -1).map((s, i) => {
          const done = activeIndex > i || progress === 100;
          const active = activeIndex === i && progress < 100;
          return (
            <li key={s} className="flex items-center gap-3">
              <span
                className={cx(
                  "grid h-5 w-5 place-items-center rounded-full border text-[10px]",
                  done
                    ? "border-accent bg-accent text-white"
                    : active
                    ? "border-accent text-accent"
                    : "border-line text-fg-faint"
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={cx(
                  "text-sm",
                  done ? "text-fg-muted" : active ? "text-fg" : "text-fg-faint"
                )}
              >
                {s}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
