import Link from "next/link";
import { HeroVisual } from "@/components/HeroVisual";
import { Eyebrow, SectionTitle } from "@/components/ui";

const MEASURES = [
  { t: "Symmetry", d: "Measures bilateral differences between facial landmarks." },
  { t: "Eyes", d: "Analyzes visible eye spacing, relative size, position and surrounding geometry." },
  { t: "Proportions", d: "Analyzes relationships between facial dimensions and facial thirds." },
  { t: "Nose", d: "Analyzes visible width, length, alignment and proportional relationships." },
  { t: "Jaw", d: "Analyzes visible lower-face width, chin geometry and symmetry." },
  { t: "Midface", d: "Analyzes visible midface proportions and relationships." },
  { t: "Skin", d: "Analyzes visible skin texture, tone variation and apparent blemishes from the image." },
  { t: "Face Framing", d: "Analyzes hairstyle, brows and other visible framing characteristics where detectable." },
];

const STEPS = [
  { n: "01", t: "Upload", d: "Upload a clear front-facing photograph." },
  { n: "02", t: "Analyze", d: "BP CLUB detects facial landmarks and calculates measurable characteristics." },
  { n: "03", t: "Understand", d: "Receive a detailed facial profile and practical appearance recommendations." },
];

export default function Home() {
  return (
    <div className="container-bp">
      {/* ---- HERO ---- */}
      <section className="grid gap-12 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-20">
        <div className="animate-fade-up">
          <Eyebrow>BP CLUB / Facial Analysis</Eyebrow>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tightest text-fg sm:text-6xl">
            Know your face.
            <br />
            <span className="text-fg-muted">Understand your features.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-fg-muted">
            BP Club analyzes measurable facial characteristics from a photograph
            and turns them into a detailed visual profile.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/analyze" className="btn-primary">
              ANALYZE YOUR FACE
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <a href="#how" className="btn-ghost">HOW IT WORKS</a>
          </div>

          <p className="mt-6 font-mono text-[11px] uppercase tracking-label text-fg-faint">
            Landmark-based analysis · Transparent methodology · Privacy focused
          </p>
        </div>

        <div className="animate-fade-up [animation-delay:120ms]">
          <HeroVisual />
        </div>
      </section>

      {/* ---- WHAT WE MEASURE ---- */}
      <section className="py-16">
        <SectionTitle
          eyebrow="What BP CLUB Measures"
          title="Your face, in hard numbers."
          subtitle="BP Club focuses on measurable facial characteristics rather than vague AI judgments."
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MEASURES.map((m) => (
            <div key={m.t} className="card card-hover group p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-line-strong bg-ink-700 font-mono text-xs text-accent-soft transition-colors group-hover:border-accent/60">
                {m.t[0]}
              </div>
              <h3 className="mt-4 text-base font-medium tracking-tight text-fg">{m.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{m.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- HOW IT WORKS ---- */}
      <section id="how" className="scroll-mt-20 py-16">
        <SectionTitle eyebrow="How It Works" title="Three steps to your profile" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative card p-7">
              <span className="num text-5xl font-semibold text-ink-500">{s.n}</span>
              <h3 className="mt-4 text-xl font-medium tracking-tight text-fg">
                {s.t}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{s.d}</p>
              {i < STEPS.length - 1 && (
                <span className="absolute right-6 top-8 hidden text-accent/40 md:block">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="py-16">
        <div className="grid-bg relative overflow-hidden rounded-2xl border border-line bg-ink-900 p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-accent/5" />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tightest text-fg sm:text-4xl">
              Enter the analysis system.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-fg-muted">
              Upload a clear, front-facing photo and receive your BP CLUB facial
              profile in seconds.
            </p>
            <Link href="/analyze" className="btn-primary mx-auto mt-8 w-fit">
              ANALYZE YOUR FACE
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
