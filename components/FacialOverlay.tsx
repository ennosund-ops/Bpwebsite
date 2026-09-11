"use client";

import { useEffect, useRef, useState } from "react";
import type { OverlayGeometry } from "@/types";
import { cx } from "@/lib/utils";

type Layer = "landmarks" | "symmetry" | "proportions" | "eyes" | "jaw";

const LAYERS: { key: Layer; label: string }[] = [
  { key: "landmarks", label: "Landmarks" },
  { key: "symmetry", label: "Symmetry" },
  { key: "proportions", label: "Proportions" },
  { key: "eyes", label: "Eyes" },
  { key: "jaw", label: "Jaw" },
];

const ACCENT = "#7c5cff";
const ACCENT_SOFT = "#9d86ff";

export function FacialOverlay({
  imageUrl,
  overlay,
  isDemo = false,
}: {
  imageUrl: string | null;
  overlay: OverlayGeometry | null;
  /** In demo mode the landmark cloud is synthetic and won't align to a real
   *  photo, so we draw the mesh over the technical placeholder instead. */
  isDemo?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const effectiveUrl = isDemo ? null : imageUrl;
  const [enabled, setEnabled] = useState<Record<Layer, boolean>>({
    landmarks: true,
    symmetry: true,
    proportions: true,
    eyes: true,
    jaw: false,
  });
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  // Load the uploaded image (if any). Skipped in demo mode.
  useEffect(() => {
    if (!effectiveUrl) {
      setImg(null);
      return;
    }
    const image = new Image();
    image.onload = () => setImg(image);
    image.src = effectiveUrl;
  }, [effectiveUrl]);

  // Redraw whenever image / overlay / toggles change.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fit the drawing inside a bounded box so tall portrait selfies don't
    // render metres high. Landscape fills the width; portrait is capped by height.
    const maxW = 680;
    const maxH = 560;
    const ar = img ? img.naturalWidth / img.naturalHeight : 1 / 1.15; // w/h
    let W = maxW;
    let H = Math.round(W / ar);
    if (H > maxH) {
      H = maxH;
      W = Math.round(H * ar);
    }
    canvas.width = W;
    canvas.height = H;

    // Background: photo, or a technical placeholder.
    if (img) {
      ctx.drawImage(img, 0, 0, W, H);
      // Slight darken so overlays read.
      ctx.fillStyle = "rgba(5,5,6,0.28)";
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = "#0a0a0c";
      ctx.fillRect(0, 0, W, H);
      // faint grid
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 36) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 36) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      // face silhouette ellipse
      ctx.strokeStyle = "rgba(157,134,255,0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(W * 0.5, H * 0.52, W * 0.19, H * 0.30, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (!overlay) return;
    const px = (x: number) => x * W;
    const py = (y: number) => y * H;

    // Proportions: facial thirds
    if (enabled.proportions) {
      ctx.strokeStyle = "rgba(157,134,255,0.55)";
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);
      for (const yv of overlay.thirdsY) {
        ctx.beginPath(); ctx.moveTo(0, py(yv)); ctx.lineTo(W, py(yv)); ctx.stroke();
      }
      ctx.setLineDash([]);
      // nose width line
      const [n1, n2] = overlay.noseWidth;
      ctx.strokeStyle = ACCENT_SOFT;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px(n1.x), py(n1.y)); ctx.lineTo(px(n2.x), py(n2.y)); ctx.stroke();
    }

    // Symmetry axis
    if (enabled.symmetry) {
      const gx = px(overlay.symmetryAxisX);
      const grad = ctx.createLinearGradient(gx, 0, gx, H);
      grad.addColorStop(0, "rgba(124,92,255,0)");
      grad.addColorStop(0.5, "rgba(124,92,255,0.9)");
      grad.addColorStop(1, "rgba(124,92,255,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }

    // Eyes: centers + connecting line
    if (enabled.eyes) {
      const [e1, e2] = overlay.eyeCenters;
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px(e1.x), py(e1.y)); ctx.lineTo(px(e2.x), py(e2.y)); ctx.stroke();
      for (const e of [e1, e2]) {
        ctx.fillStyle = ACCENT;
        ctx.beginPath(); ctx.arc(px(e.x), py(e.y), 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(124,92,255,0.4)";
        ctx.beginPath(); ctx.arc(px(e.x), py(e.y), 9, 0, Math.PI * 2); ctx.stroke();
      }
    }

    // Jaw outline
    if (enabled.jaw && overlay.jawline.length > 1) {
      ctx.strokeStyle = ACCENT_SOFT;
      ctx.lineWidth = 2;
      ctx.beginPath();
      overlay.jawline.forEach((p, i) => {
        i === 0 ? ctx.moveTo(px(p.x), py(p.y)) : ctx.lineTo(px(p.x), py(p.y));
      });
      ctx.stroke();
    }

    // Landmark dots
    if (enabled.landmarks) {
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      for (const p of overlay.landmarks) {
        ctx.beginPath(); ctx.arc(px(p.x), py(p.y), 1.4, 0, Math.PI * 2); ctx.fill();
      }
    }
  }, [img, overlay, enabled]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_200px]">
      <div className="relative flex justify-center overflow-hidden rounded-2xl border border-line bg-ink-900 p-2">
        <canvas
          ref={canvasRef}
          className="block h-auto max-h-[38vh] w-auto max-w-full rounded-xl sm:max-h-[52vh] lg:max-h-[560px]"
        />
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full border border-line bg-ink-950/70 px-3 py-1 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-label text-fg-muted">
            {isDemo
              ? "Demo landmark layout"
              : `Facial Map · ${overlay?.landmarks.length ?? 0} points`}
          </span>
        </div>
      </div>

      <div className="hidden flex-col gap-2 lg:flex">
        <span className="label mb-1">Layers</span>
        {LAYERS.map((l) => (
          <label
            key={l.key}
            className={cx(
              "flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-colors",
              enabled[l.key]
                ? "border-accent/50 bg-accent/10 text-fg"
                : "border-line bg-ink-800 text-fg-muted hover:border-line-strong"
            )}
          >
            <span>{l.label}</span>
            <input
              type="checkbox"
              className="sr-only"
              checked={enabled[l.key]}
              onChange={() =>
                setEnabled((e) => ({ ...e, [l.key]: !e[l.key] }))
              }
            />
            <span
              className={cx(
                "grid h-4 w-4 place-items-center rounded border",
                enabled[l.key] ? "border-accent bg-accent" : "border-line-strong"
              )}
            >
              {enabled[l.key] && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
