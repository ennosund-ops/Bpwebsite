"use client";

import { useCallback, useRef, useState } from "react";
import { cx } from "@/lib/utils";

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export function UploadZone({
  onFile,
  compact = false,
}: {
  onFile: (file: File) => void;
  compact?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!ACCEPT.includes(file.type)) {
        setError("Unsupported file. Use JPG, PNG or WEBP.");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setError("Image is too large (max 15MB).");
        return;
      }
      setError(null);
      onFile(file);
    },
    [onFile]
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={cx(
          "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-all",
          compact ? "p-8" : "p-14",
          dragging
            ? "border-accent bg-accent/10"
            : "border-line-strong bg-ink-900/50 hover:border-accent/50 hover:bg-ink-800/60"
        )}
      >
        <div
          className={cx(
            "grid place-items-center rounded-2xl border border-line-strong bg-ink-700 text-accent-soft transition-transform group-hover:scale-105",
            compact ? "h-12 w-12" : "h-16 w-16"
          )}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 16V4m0 0L8 8m4-4l4 4" />
            <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
          </svg>
        </div>

        <p className={cx("mt-5 font-semibold tracking-tight text-fg", compact ? "text-base" : "text-lg")}>
          {dragging ? "Drop to analyze" : "DROP YOUR PHOTO HERE"}
        </p>
        <p className="mt-1 text-sm text-fg-muted">
          or <span className="text-accent-soft underline underline-offset-4">choose photo</span>
        </p>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-label text-fg-faint">
          JPG · PNG · WEBP · Max 15MB
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          className="hidden"
          onChange={(e) => handle(e.target.files?.[0])}
        />
      </div>

      {error && (
        <p className="mt-3 flex items-center gap-2 font-mono text-xs text-signal-low">
          <span className="h-1.5 w-1.5 rounded-full bg-signal-low" />
          {error}
        </p>
      )}
    </div>
  );
}
