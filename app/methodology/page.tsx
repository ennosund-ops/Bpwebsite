import type { Metadata } from "next";
import { REFERENCE } from "@/lib/scoring";
import { Eyebrow, SectionTitle, Disclaimer } from "@/components/ui";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "The BP CLUB method: what we measure, what we don't claim, why 2D photos have limitations, and the reference ranges behind every score.",
};

const DONT = [
  "Objective human attractiveness",
  "A person's worth, value or status",
  "Health, personality or genetic quality",
  "Exact 3D bone structure from a 2D photo",
];

const LIMITS = [
  { t: "Lens distortion", d: "Wide-angle phone lenses enlarge whatever is closest — usually the nose." },
  { t: "Camera distance", d: "Distance changes apparent proportions of the whole face." },
  { t: "Head rotation", d: "Even small yaw/pitch shifts symmetry and width measurements." },
  { t: "Lighting", d: "Shadows change apparent contours, texture and tone." },
  { t: "Expression", d: "A smile or squint changes eye, mouth and cheek geometry." },
];

const PIPELINE = [
  { t: "Reference population", d: "Published soft-tissue anthropometric summaries and neoclassical proportion canons, expressed as ratio bands." },
  { t: "Measurement definition", d: "Each metric is a precise geometric relationship between named facial landmarks." },
  { t: "Normalization", d: "Distances are normalized to face width or height so image scale doesn't matter." },
  { t: "Scoring formula", d: "A closeness function scores how near a ratio sits to its reference band — not to a single 'perfect' value." },
  { t: "Confidence", d: "Every measurement carries High / Medium / Low confidence based on image quality and head angle." },
];

export default function MethodologyPage() {
  return (
    <div className="container-bp py-14">
      <div className="max-w-3xl">
        <Eyebrow>The BP CLUB Method</Eyebrow>
        <h1 className="mt-5 text-4xl font-semibold tracking-tightest text-fg sm:text-5xl">
          Honest measurement, not verdicts.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-fg-muted">
          BP CLUB measures geometric relationships between facial landmarks and
          compares them to statistical reference ranges. Facial diversity is
          substantial — reference ranges are tools, not definitions of beauty.
        </p>
      </div>

      {/* What we measure */}
      <section className="mt-16 grid gap-8 lg:grid-cols-2">
        <div className="card p-7">
          <span className="label">What We Measure</span>
          <h2 className="mt-3 text-2xl font-medium tracking-tight text-fg">
            Facial landmarks & geometric relationships
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-fg-muted">
            A facial-landmark model locates points across the eyes, brows, nose,
            mouth and jaw. From those points BP CLUB computes symmetry, facial
            thirds, and normalized ratios such as eye spacing, nose width and jaw
            width — each defined precisely and scored against a reference band.
          </p>
        </div>
        <div className="card p-7">
          <span className="label">What We Don&apos;t Claim</span>
          <h2 className="mt-3 text-2xl font-medium tracking-tight text-fg">
            We do not determine your worth
          </h2>
          <ul className="mt-4 space-y-2.5">
            {DONT.map((d) => (
              <li key={d} className="flex items-start gap-2.5 text-sm text-fg-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-signal-low" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why photos have limitations */}
      <section className="mt-14">
        <SectionTitle
          eyebrow="Why Photos Have Limitations"
          title="A 2D photo is not your face"
          subtitle="Several factors distort measurements. This is why BP CLUB reports confidence and never claims a photo reveals exact 3D structure."
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LIMITS.map((l) => (
            <div key={l.t} className="card p-5">
              <h3 className="text-base font-medium text-fg">{l.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{l.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section className="mt-14">
        <SectionTitle eyebrow="Scoring System" title="How a measurement becomes a score" />
        <div className="mt-8 space-y-3">
          {PIPELINE.map((p, i) => (
            <div key={p.t} className="card flex items-start gap-5 p-5">
              <span className="num text-2xl font-semibold text-accent-soft">0{i + 1}</span>
              <div>
                <h3 className="text-base font-medium text-fg">{p.t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-fg-muted">{p.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reference ranges table */}
      <section className="mt-14">
        <SectionTitle eyebrow="Reference Ranges" title="The bands we compare against" />
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-line bg-ink-800">
              <tr className="font-mono text-[11px] uppercase tracking-label text-fg-faint">
                <th className="px-5 py-3 font-normal">Measurement</th>
                <th className="px-5 py-3 font-normal">Definition</th>
                <th className="px-5 py-3 text-right font-normal">Reference band</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(REFERENCE).map(([key, r]) => (
                <tr key={key} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 text-fg">{key}</td>
                  <td className="px-5 py-3 text-fg-muted">{r.label}</td>
                  <td className="num px-5 py-3 text-right text-fg">
                    {r.low} – {r.high}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-fg-faint">
          Bands are approximate, population-dependent statistical tools. Falling
          outside a band is common and does not indicate a problem.
        </p>
      </section>

      <div className="mt-12">
        <Disclaimer>
          BP CLUB provides image-based facial analysis. It does not diagnose
          medical conditions and its scores are not objective measures of
          attractiveness. For medical or cosmetic questions, consult a qualified
          professional.
        </Disclaimer>
      </div>
    </div>
  );
}
