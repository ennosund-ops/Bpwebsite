"use client";

import { useEffect, useState } from "react";
import type { Confidence } from "@/types";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";

/** Large radial gauge for the overall profile score. */
export function ScoreRing({
  score,
  confidence,
}: {
  score: number;
  confidence: Confidence;
}) {
  const [val, setVal] = useState(0);
  const R = 84;
  const C = 2 * Math.PI * R;

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1200;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * score));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative grid h-[200px] w-[200px] place-items-center">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="-rotate-90"
        >
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9d86ff" />
              <stop offset="100%" stopColor="#5a3ff0" />
            </linearGradient>
          </defs>
          <circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C - (val / 100) * C}
            style={{ transition: "stroke-dashoffset 60ms linear" }}
          />
        </svg>
        {/* Centered stack, constrained so it never spills over the arc */}
        <div className="absolute flex w-[150px] flex-col items-center text-center">
          <span className="num text-[52px] font-semibold leading-none tracking-tightest text-fg">
            {val}
          </span>
          <span className="mt-2 font-mono text-[9px] uppercase leading-tight tracking-[0.18em] text-fg-faint">
            Facial Analysis
            <br />
            Score
          </span>
        </div>
      </div>
      <ConfidenceBadge confidence={confidence} />
    </div>
  );
}
