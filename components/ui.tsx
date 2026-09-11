import { cx } from "@/lib/utils";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx("flex items-center gap-2.5", className)}>
      <span className="h-px w-6 bg-accent/70" />
      <span className="font-mono text-[11px] uppercase tracking-label text-accent-soft">
        {children}
      </span>
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={cx("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && (
        <div className={cx(center && "flex justify-center")}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
      )}
      <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tightest text-fg sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-pretty text-base leading-relaxed text-fg-muted">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function Disclaimer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-line bg-ink-900/60 p-4">
      <svg className="mt-0.5 shrink-0 text-fg-faint" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8h.01M11 12h1v4h1" />
      </svg>
      <p className="text-xs leading-relaxed text-fg-muted">{children}</p>
    </div>
  );
}
