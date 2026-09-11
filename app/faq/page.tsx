import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about BP CLUB facial analysis.",
};

const FAQS = [
  {
    q: "Is the BP CLUB score an attractiveness rating?",
    a: "No. It is a profile score that summarizes how consistent your measured facial characteristics are with BP CLUB's reference methodology. It is not a measure of attractiveness, worth or health.",
  },
  {
    q: "Where is my photo processed?",
    a: "In this build, analysis runs in your browser. Your photo is not uploaded to a BP CLUB server and is not persisted. See the Privacy page for details.",
  },
  {
    q: "Why does a measurement say 'Not reliably measurable'?",
    a: "Some characteristics — like exact 3D jaw projection — cannot be measured reliably from a single 2D photo, and others become unreliable when the face is rotated or the image is blurry. BP CLUB tells you instead of inventing a number.",
  },
  {
    q: "What is Demo Mode?",
    a: "Demo Mode lets the entire product work without a computer-vision backend, using deterministic sample data. Demo results are clearly labelled and are never presented as derived from your photograph.",
  },
  {
    q: "Can my score change between two photos of the same face?",
    a: "Yes — significantly. Lens choice, distance, head angle, lighting and expression all change measurements. That's a limitation of photographs, not evidence that your face changed.",
  },
  {
    q: "Does BP CLUB give medical or cosmetic advice?",
    a: "No. BP CLUB analyzes visible image characteristics only and does not diagnose conditions. For medical, dermatological or cosmetic questions, consult a qualified professional.",
  },
  {
    q: "What do the recommendations focus on?",
    a: "Only controllable appearance factors — grooming, skincare, hairstyle, framing, photography and general healthy habits. BP CLUB never recommends altering your anatomy, extreme dieting, drugs or DIY procedures.",
  },
];

export default function FaqPage() {
  return (
    <div className="container-bp py-14">
      <div className="max-w-3xl">
        <Eyebrow>FAQ</Eyebrow>
        <h1 className="mt-5 text-4xl font-semibold tracking-tightest text-fg sm:text-5xl">
          Questions, answered.
        </h1>
      </div>

      <div className="mt-10 max-w-3xl space-y-3">
        {FAQS.map((f) => (
          <details
            key={f.q}
            className="card group p-0 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-base font-medium text-fg">
              {f.q}
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line-strong text-fg-muted transition-transform group-open:rotate-45">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </summary>
            <p className="px-5 pb-5 text-sm leading-relaxed text-fg-muted">{f.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-12 max-w-3xl">
        <Link href="/analyze" className="btn-primary">ANALYZE YOUR FACE</Link>
      </div>
    </div>
  );
}
