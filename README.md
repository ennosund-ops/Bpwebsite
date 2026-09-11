# BP CLUB

A premium, data-driven facial-analysis platform. BP CLUB turns measurable
facial characteristics from a photograph into a detailed visual profile —
landmark-based, transparent about its methodology, and privacy focused.

> BP CLUB reports a **profile score**, never an objective attractiveness rating,
> and never diagnoses medical conditions.

## Stack

- **Next.js 14** (App Router) · **TypeScript** · **Tailwind CSS**
- Client-side computer vision via **MediaPipe Face Mesh** (`@mediapipe/tasks-vision`)
- Clean service layer so the CV provider can be swapped in one place

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Demo mode

The app ships with `NEXT_PUBLIC_DEMO_MODE=true` (see `.env.local`). In demo mode
the **entire product works with no CV backend**, using deterministic sample data
that is clearly labelled *Demo Analysis* and never presented as derived from the
user's photo.

To run the real landmark pipeline instead:

```bash
NEXT_PUBLIC_DEMO_MODE=false npm run dev
```

The MediaPipe model + wasm load from a CDN at runtime; analysis happens entirely
in the browser (no image is uploaded).

## Architecture

```
app/           routes: landing, analyze, compare, methodology, privacy, faq, terms
components/    ScoreCard, UploadZone, FacialOverlay, MeasurementRow,
               ConfidenceBadge, RecommendationCard, AnalysisProgress, Navbar, Footer …
lib/           scoring, geometry, recommendations, demo data, utils
services/      analysis (provider selector), demoProvider, mediapipeProvider, imageQuality
types/         the AnalysisResult data model
```

### Swapping the analysis provider

`services/analysis.ts` is the single entry point:

```ts
export async function getProvider(): Promise<AnalysisProvider> {
  if (DEMO_MODE) return demoProvider;
  const { mediapipeProvider } = await import("@/services/mediapipeProvider");
  return mediapipeProvider;
}
```

Any object implementing the `AnalysisProvider` interface (`checkQuality` +
`analyze`) can be dropped in here — e.g. a hosted API — without touching the UI.

## Design principles

- Scores are **derived from measurements**, never random.
- Every measurement is **explainable** and carries a **confidence** level.
- Where a value can't be measured reliably (e.g. 3D jaw projection from a 2D
  photo), BP CLUB says so instead of inventing a number.
- Recommendations cover only **controllable** appearance factors — grooming,
  skincare, framing, photography, healthy habits.
