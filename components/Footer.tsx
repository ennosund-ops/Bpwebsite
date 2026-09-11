import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-ink-950">
      <div className="container-bp py-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo size="md" />
            <p className="mt-4 font-mono text-sm text-fg-muted">
              Numbers, not opinions.
            </p>
          </div>

          <div className="flex gap-14">
            <div className="flex flex-col gap-3">
              <span className="label">Product</span>
              <Link href="/analyze" className="text-sm text-fg-muted hover:text-fg">Analyze</Link>
              <Link href="/compare" className="text-sm text-fg-muted hover:text-fg">Before / After</Link>
              <Link href="/methodology" className="text-sm text-fg-muted hover:text-fg">Methodology</Link>
              <Link href="/faq" className="text-sm text-fg-muted hover:text-fg">FAQ</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="label">Legal</span>
              <Link href="/privacy" className="text-sm text-fg-muted hover:text-fg">Privacy</Link>
              <Link href="/terms" className="text-sm text-fg-muted hover:text-fg">Terms</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-6">
          <p className="max-w-3xl text-xs leading-relaxed text-fg-faint">
            BP Club provides image-based facial analysis and appearance-oriented
            recommendations. Results are estimates and should not be interpreted as
            medical advice or objective measures of attractiveness.
          </p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-label text-fg-faint">
            © {new Date().getFullYear()} BP CLUB
          </p>
        </div>
      </div>
    </footer>
  );
}
