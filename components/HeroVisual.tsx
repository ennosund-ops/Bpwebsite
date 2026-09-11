// Hero visual — the real BP CLUB analysis dashboard reference image.
export function HeroVisual() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-ink-950 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
      {/* subtle scan sweep over the still image */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 animate-scan bg-gradient-to-b from-accent/10 to-transparent" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/hero.png"
        alt="BP CLUB facial analysis dashboard — facial symmetry, thirds, eye spacing and measurement overlay"
        className="block h-auto w-full"
      />
      <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-2 rounded-full border border-line bg-ink-950/70 px-2.5 py-1 backdrop-blur">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        <span className="font-mono text-[9px] uppercase tracking-label text-fg-muted">
          Live Analysis
        </span>
      </div>
    </div>
  );
}
