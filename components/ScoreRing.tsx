"use client";

import { useEffect, useState } from "react";
import type { Confidence } from "@/types";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";

/** Large radial gauge for the overall profile score. */
export function ScoreRing({
  score,
  confidence,
  size = 200,
}: {
  score: number;
  confidence: Confidence;
  /** Outer diameter in px. Everything else scales from this. */
  size?: number;
}) {
  const [val, setVal] = useState(0);
  const R = size * 0.42;
  const stroke = Math.max(6, size * 0.05);
  const center = size / 2;
  const gradId = `ringGrad-${size}`;
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
    <div className="flex flex-col items-center gap-3">
      <div className="relative grid place-items-center" style={{ height: size, width: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle cx={center} cy={center} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9d86ff" />
              <stop offset="100%" stopColor="#5a3ff0" />
            </linearGradient>
          </defs>
          <circle
            cx={center}
            cy={center}
            r={R}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C - (val / 100) * C}
            style={{ transition: "stroke-dashoffset 60ms linear" }}
          />
        </svg>
        {/* Centered stack, constrained so it never spills over the arc */}
        <div className="absolute flex flex-col items-center text-center" style={{ width: size * 0.75 }}>
          <span
            className="num font-semibold leading-none tracking-tightest text-fg"
            style={{ fontSize: size * 0.26 }}
          >
            {val}
          </span>
          <span
            className="mt-2 font-mono uppercase leading-tight tracking-[0.18em] text-fg-faint"
            style={{ fontSize: Math.max(8, size * 0.045) }}
          >
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

