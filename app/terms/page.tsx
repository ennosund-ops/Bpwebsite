import type { Metadata } from "next";
import { Eyebrow, Disclaimer } from "@/components/ui";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for BP CLUB.",
};

const SECTIONS = [
  { t: "Nature of the service", d: "BP CLUB provides image-based facial analysis and appearance-oriented recommendations. All outputs are estimates derived from visible image characteristics." },
  { t: "Not medical advice", d: "BP CLUB does not diagnose medical conditions and is not a substitute for professional medical, dermatological or psychological advice. Consult a qualified professional for any health concern." },
  { t: "No objective judgments", d: "Scores are not objective measures of attractiveness, worth, health, personality or genetic quality. They reflect BP CLUB's defined measurement methodology only." },
  { t: "Acceptable use", d: "Upload only photographs you have the right to use. Do not use BP CLUB to harass, evaluate, or make decisions about other people without their consent." },
  { t: "Limitations", d: "Measurements from 2D photographs are affected by lens, distance, angle, lighting and expression, and may be inaccurate. Use results as informational estimates only." },
];

export default function TermsPage() {
  return (
    <div className="container-bp py-14">
      <div className="max-w-3xl">
        <Eyebrow>Terms</Eyebrow>
        <h1 className="mt-5 text-4xl font-semibold tracking-tightest text-fg sm:text-5xl">
          Terms of use
        </h1>
        <p className="mt-5 text-fg-muted">
          By using BP CLUB you agree to the following. This is a concise summary
          for a demonstration product.
        </p>

        <div className="mt-10 space-y-3">
          {SECTIONS.map((s, i) => (
            <div key={s.t} className="card flex items-start gap-5 p-6">
              <span className="num text-xl font-semibold text-accent-soft">0{i + 1}</span>
              <div>
                <h2 className="text-lg font-medium tracking-tight text-fg">{s.t}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{s.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Disclaimer>
            BP Club provides image-based facial analysis and appearance-oriented
            recommendations. Results are estimates and should not be interpreted as
            medical advice or objective measures of attractiveness.
          </Disclaimer>
        </div>
      </div>
    </div>
  );
}
