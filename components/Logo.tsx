import Link from "next/link";
import { cx } from "@/lib/utils";

/**
 * BP CLUB brand lockup — the actual logo asset (white artwork on transparent).
 * Works in nav, footer, loading screen, dashboard, mobile header.
 */
export function Logo({
  size = "md",
  href = "/",
  className,
}: {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
}) {
  const h = { sm: "h-9", md: "h-12", lg: "h-16" }[size];

  const inner = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo.png"
      alt="BP CLUB"
      className={cx(h, "w-auto select-none", className)}
      draggable={false}
    />
  );

  if (href === null) return inner;
  return (
    <Link href={href} aria-label="BP CLUB home" className="inline-flex">
      {inner}
    </Link>
  );
}
