"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { cx } from "@/lib/utils";

const LINKS = [
  { href: "/analyze", label: "Analyze" },
  { href: "/methodology", label: "Methodology" },
  { href: "/privacy", label: "Privacy" },
  { href: "/faq", label: "FAQ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cx(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled
          ? "border-line bg-ink-950/80 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      )}
    >
      <nav className="container-bp flex h-20 items-center justify-between">
        <Logo size="lg" />

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-fg-muted transition-colors hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/analyze" className="btn-primary ml-2 !py-2 text-sm">
            ANALYZE YOUR FACE
          </Link>
        </div>

        <button
          className="btn-ghost !px-3 !py-2 md:hidden"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <>
                <path d="M3 6h18M3 12h18M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-ink-900/95 px-5 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm text-fg-muted hover:bg-ink-700 hover:text-fg"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/analyze"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 w-full"
            >
              ANALYZE YOUR FACE
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
