"use client";

import { useState } from "react";

/**
 * Clears any locally-held BP CLUB analysis data. In this build nothing is
 * stored server-side, so this wipes local/session storage and confirms.
 */
export function DeleteAnalysis() {
  const [done, setDone] = useState(false);

  const handleDelete = () => {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("bpclub"))
        .forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();
    } catch {
      /* storage may be unavailable */
    }
    setDone(true);
  };

  return (
    <div className="card flex flex-col items-start gap-4 p-7 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-medium tracking-tight text-fg">
          Delete my analysis data
        </h3>
        <p className="mt-1 max-w-md text-sm text-fg-muted">
          Immediately removes any analysis data held locally in this browser.
        </p>
      </div>
      {done ? (
        <span className="flex items-center gap-2 font-mono text-sm text-signal-high">
          <span className="h-1.5 w-1.5 rounded-full bg-signal-high" />
          Deleted
        </span>
      ) : (
        <button
          onClick={handleDelete}
          className="btn border border-signal-low/40 text-signal-low hover:bg-signal-low/10"
        >
          DELETE MY ANALYSIS
        </button>
      )}
    </div>
  );
}
