# Brand assets

The BP CLUB logo and hero dashboard are recreated in code
(`components/BpMark.tsx`, `components/HeroVisual.tsx`) so the app needs no
external image files and the favicon renders from `app/icon.tsx`.

If you want to use the original uploaded PNGs instead, drop them here:

- `logo.png`         — the "BP CLUB" wordmark
- `hero-dashboard.png` — the analysis dashboard screenshot
- `hero-face.jpg`    — a portrait to sit behind the hero overlay

Then reference them with a normal `<img src="/brand/logo.png" />`. Nothing else
depends on their presence — the code fallbacks stay in place if they're absent.
