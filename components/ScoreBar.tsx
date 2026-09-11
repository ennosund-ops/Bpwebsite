"use client";

import { useEffect, useRef, useState } from "react";
import { cx, scoreTone } from "@/lib/utils";

const TONE: Record<string, string> = {
  high: "bg-signal-high",
  med: "bg-signal-med",
  low: "bg-signal-low",
};

/** Animated horizontal score bar; grows once when scrolled into view. */
export function ScoreBar({
  score,
  className,
}: {
  score: number | null;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);

  useEffect(() => {
    if (score == null) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          const t = setTimeout(() => setW(score), 80);
          io.disconnect();
          return () => clearTimeout(t);
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [score]);

  return (
    <div
      ref={ref}
      className={cx("h-1.5 w-full overflow-hidden rounded-full bg-ink-600", className)}
    >
      <div
        className={cx(
          "h-full rounded-full transition-[width] duration-[900ms] ease-out",
          TONE[scoreTone(score)]
        )}
        style={{ width: `${w}%` }}
      />
    </div>
  );
}
