import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";
import { DeleteAnalysis } from "@/components/DeleteAnalysis";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Your face is sensitive personal data. BP CLUB minimizes retention, processes in your browser, and lets you delete your analysis at any time.",
};

const PROMISES = [
  { t: "On-device processing", d: "In this build, images are analyzed in your browser. Your photo is not uploaded to a BP CLUB server." },
  { t: "Minimal retention", d: "We do not persist your uploaded photo. It lives only in memory for the current analysis and is released when you leave or reset." },
  { t: "You can delete anytime", d: "The Delete My Analysis control clears any locally held analysis data immediately." },
  { t: "Clear third-party disclosure", d: "If a real cloud analysis provider is ever enabled, it will be disclosed here before any image is sent." },
  { t: "No training without consent", d: "Uploaded images are never used to train models without your explicit, opt-in consent." },
  { t: "Never sold", d: "BP CLUB does not sell facial data. Ever." },
];

export default function PrivacyPage() {
  return (
    <div className="container-bp py-14">
      <div className="max-w-3xl">
        <Eyebrow>Privacy</Eyebrow>
        <h1 className="mt-5 text-4xl font-semibold tracking-tightest text-fg sm:text-5xl">
          Your face is your data.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-fg-muted">
          Facial photographs are sensitive personal information. BP CLUB is built
          to keep it that way — minimal retention, transparent processing, and
          deletion on demand.
        </p>
      </div>

      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        {PROMISES.map((p) => (
          <div key={p.t} className="card p-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-strong bg-ink-700 text-accent-soft">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium tracking-tight text-fg">{p.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{p.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <DeleteAnalysis />
      </div>
    </div>
  );
}
