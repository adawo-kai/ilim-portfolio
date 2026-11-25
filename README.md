# Ilim Alisherov — Portfolio

Personal website of Ilim Alisherov, an 18-year-old developer and computer engineering student from Bishkek.

**Concept: «илим» — Kyrgyz for knowledge.** A dark, editorial, Swiss-inspired site. The hero is a live
topographic map of the Ala-Too range: contour lines are drawn by a WebGL shader and the cursor raises a
peak. Oversized variable-font typography reacts to the pointer.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- GSAP (ScrollTrigger, SplitText) for motion, Lenis for smooth scrolling
- Raw WebGL2 for the hero (no Three.js — one full-screen shader is all it needs)
- Fonts via `next/font`: Archivo (variable, `wght` + `wdth`), Instrument Serif, JetBrains Mono; Roboto Flex + Cormorant for Cyrillic on /ru

## Signature interactions

1. **Loader → hero** — counter, the word "ilim" ("илим" on /ru), a 5-column curtain; plays in full once per session, then the name rises letter by letter.
2. **Topographic field** — WebGL contour lines; the cursor pushes up a cerulean peak.
3. **Variable type** — letters of the name gain weight near the cursor (on touch — under the finger).
4. **About** — scroll-scrubbed statement, then a "lookbook" stage: full-length portrait rendered as live coloured ASCII (decodes in, shimmers, the cursor is a lens that shows the real photo) over a giant outlined 18, with leader-line callouts.
5. **What I do** — rows fill on hover and a cursor-following panel runs a tiny ASCII program per discipline; below it, the toolkit (stack from the GitHub profile README).
6. **Selected work** — typographic spec sheet of real projects (LikeTime, AALAM Academy, Argus, motion reels, Roblox games, Telegram bots).
7. **Path** — pinned horizontal timeline on desktop, a clean vertical list on mobile.
8. **Beyond the screen** — draggable stickers and a "Side B" tracklist of life off-screen.

All motion respects `prefers-reduced-motion`; the custom cursor only appears with a mouse.

## Languages

- `/` — English (default). `src/content/en.ts` is kept 100% Latin script, no Cyrillic.
- `/ru` — Russian. `src/content/ru.ts`.

Two root layouts (`src/app/(en)` and `src/app/(ru)`) set `<html lang>` and load Cyrillic fonts (Roboto Flex, Cormorant) only for `/ru`.

## Edit content

- Texts: `src/content/en.ts` and `src/content/ru.ts` (same structure, typed by `src/content/types.ts`).
- Shared facts and the stack: `src/content/site.ts`. Placeholders are marked `TODO(Ilim)`:
  - `linkedin` → your LinkedIn URL (the row shows "Soon" while it is empty)
  - `url` → your final domain (used for SEO, sitemap and Open Graph)
- Portrait: `public/portrait/ilim-color.webp` (background removed) — `AsciiPortrait.tsx` turns it into ASCII at runtime.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. On vercel.com → **Add New… → Project** → import the repository.
3. Framework preset: **Next.js** (auto-detected). No environment variables are needed.
4. Click **Deploy**. Then set `site.url` in `src/content/site.ts` to the real domain and push again.
