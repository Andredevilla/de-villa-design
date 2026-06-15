# De Villa Design Homepage (Next.js) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the De Villa Design marketing homepage as a static-exported Next.js + TypeScript + Tailwind app in `/web`, faithfully reproducing the handoff's light "liquid glass" design.

**Architecture:** App Router, `output: 'export'` (static HTML). Design tokens live as CSS custom properties in `globals.css`; Tailwind handles layout/spacing utilities; the complex glass surfaces (nav pill, cards, the three buttons, hero mask) are centralized as named classes in `@layer components`. All page content is typed config in `src/content/`. Components are pure/presentational (testable in jsdom); only `Nav` and `Reveal` are client islands.

**Tech Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS (v4 CSS-first; v3 header note included) · `next/font/local` (Hanken Grotesk) · `lucide-react` icons · Vitest + React Testing Library + jsdom (unit) · Playwright (e2e).

**Branch:** `feat/web-nextjs-rebuild` (already checked out). All commits are local — **no push, no deploy** (prod keeps serving the repo root until Andre says otherwise).

**Commit convention:** conventional-commit subjects (as written per task). End every commit message with a trailing line:
`Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

**Source of truth:** `docs/superpowers/specs/2026-06-14-devilla-nextjs-rebuild-design.md` (the approved spec). For any exact pixel value not restated here, the spec and the handoff standalone file `C:\Users\andre\Downloads\Andre\design_handoff_devilla_website\De Villa Design.html` are authoritative.

**Repo paths referenced:**
- Repo root: `C:\Users\andre\OneDrive\Desktop\De Villa Design`
- Handoff bundle: `C:\Users\andre\Downloads\Andre\design_handoff_devilla_website`
- Demo screenshots already in repo: `demos/shots/<slug>.webp`
- Self-hosted font already in repo: `fonts/hanken-grotesk-variable.woff2`

> **Run commands from `web/` unless a step says otherwise.** On Windows use Git Bash for the `cp`/heredoc steps.

---

## Phase 0 — Scaffold & tooling

### Task 1: Scaffold the Next.js app in `/web`

**Files:**
- Create: `web/` (entire scaffold), `web/next.config.ts`
- Modify: root `.gitignore`

- [ ] **Step 1: Scaffold with create-next-app (run from repo root)**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
npx --yes create-next-app@latest web \
  --ts --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-npm --no-turbopack --yes
```

If `--no-turbopack` is rejected by your version, drop that flag and re-run. The command must finish with `web/` containing `package.json`, `src/app/`, `tailwind`/PostCSS config, and a `web/.gitignore`.

- [ ] **Step 2: Detach any nested git repo + record versions**

create-next-app may init a nested repo. Keep `web/` part of the parent repo:

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
rm -rf web/.git
cd web
node -e "const p=require('./package.json');console.log('next',p.dependencies.next,'| react',p.dependencies.react,'| tailwind',(p.devDependencies['tailwindcss']||p.dependencies['tailwindcss']))"
ls src/app
```

Record the printed Tailwind major version — **v4** uses `@import "tailwindcss";` in `globals.css` (no `tailwind.config.*`); **v3** uses `@tailwind base/components/utilities;` + `tailwind.config.ts`. Later CSS tasks default to v4 and note the v3 header.

- [ ] **Step 3: Configure static export**

Replace `web/next.config.ts` with:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
}

export default nextConfig
```

- [ ] **Step 4: Ensure build artifacts are git-ignored**

`web/.gitignore` (created by the scaffold) already ignores `/node_modules`, `/.next/`, `/out/`. Confirm, and also append a guard to the **root** `.gitignore`:

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
printf '\n# Next.js app (web/)\nweb/node_modules/\nweb/.next/\nweb/out/\n' >> .gitignore
git check-ignore web/node_modules web/.next web/out
```

Expected: all three paths echoed back (meaning they are ignored).

- [ ] **Step 5: Verify dev server boots**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design/web"
npm run build
```

Expected: `next build` completes and writes static output to `web/out/` with no errors (the default scaffold page).

- [ ] **Step 6: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web .gitignore
git commit -m "chore(web): scaffold Next.js app with static export"
```

---

### Task 2: Add test tooling (Vitest + RTL + Playwright)

**Files:**
- Create: `web/vitest.config.ts`, `web/vitest.setup.ts`, `web/playwright.config.ts`, `web/src/test/smoke.test.tsx`
- Modify: `web/package.json` (scripts)

- [ ] **Step 1: Install dev dependencies**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design/web"
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Vitest config**

Create `web/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
})
```

Create `web/vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 3: Playwright config**

Create `web/playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
```

- [ ] **Step 4: Add npm scripts**

In `web/package.json`, set the `scripts` block to:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  }
}
```

- [ ] **Step 5: Write a failing harness test**

Create `web/src/test/smoke.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

function Hello() {
  return <p>harness ok</p>
}

describe('test harness', () => {
  it('renders a component in jsdom', () => {
    render(<Hello />)
    expect(screen.getByText('harness ok')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run unit + typecheck**

```bash
npm run test && npm run typecheck
```

Expected: 1 test passes; `tsc` reports no errors.

- [ ] **Step 7: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web
git commit -m "chore(web): add vitest + RTL + playwright test tooling"
```

---

## Phase 1 — Foundation

### Task 3: Bring in assets (hero render, screenshots, og-image, font)

**Files:**
- Create: `web/public/hero-glass.png`, `web/public/og-image.jpg`, `web/public/work/*.webp` (8), `web/src/fonts/hanken-grotesk-variable.woff2`

- [ ] **Step 1: Copy assets from repo + handoff bundle (run from repo root, Git Bash)**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
mkdir -p web/public/work web/src/fonts
cp "/c/Users/andre/Downloads/Andre/design_handoff_devilla_website/assets/hero-glass.png" web/public/hero-glass.png
cp assets/og-image.jpg web/public/og-image.jpg
cp fonts/hanken-grotesk-variable.woff2 web/src/fonts/hanken-grotesk-variable.woff2
for s in coastal-dental truenorth-chiro lumiere-skin form-pilates stillpoint-massage serenity-physio bloom-yoga solace-springs; do
  cp "demos/shots/$s.webp" "web/public/work/$s.webp"
done
```

- [ ] **Step 2: Verify all 11 files exist**

```bash
ls -1 web/public/hero-glass.png web/public/og-image.jpg web/src/fonts/hanken-grotesk-variable.woff2 web/public/work/*.webp | wc -l
```

Expected: `11`.

- [ ] **Step 3 (optional): Optimize the hero PNG to WebP**

Only if `sharp` is convenient; otherwise skip — the PNG works everywhere. If you convert, also update the `.hero-glass` URL in Task 4 to `/hero-glass.webp`.

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design/web"
node -e "const s=require('sharp');s('public/hero-glass.png').webp({quality:82}).toFile('public/hero-glass.webp').then(()=>console.log('ok'))" || echo "skip: keep PNG"
```

- [ ] **Step 4: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/public web/src/fonts
git commit -m "chore(web): add hero render, 8 work screenshots, og-image, font"
```

---

### Task 4: Global tokens & glass component classes

**Files:**
- Modify/replace: `web/src/app/globals.css`

- [ ] **Step 1: Replace `globals.css` with the token system + glass classes**

> **Tailwind v4** (default): keep the `@import "tailwindcss";` first line below.
> **Tailwind v3**: replace that one line with `@tailwind base; @tailwind components; @tailwind utilities;`. Everything else is plain CSS and is identical for both.

Write `web/src/app/globals.css`:

```css
@import "tailwindcss";

/* ---------- Design tokens (LIGHT theme — from spec §5) ---------- */
:root {
  --bg0: #f3f6f9;
  --bg1: #e8eef4;
  --ink: #1b2028;
  --soft: rgba(27, 32, 40, 0.6);
  --faint: rgba(27, 32, 40, 0.4);
  --navbrd: rgba(20, 30, 45, 0.07);
  --brd: rgba(20, 30, 45, 0.09);
  --hi: rgba(255, 255, 255, 0.9);
  --glass: rgba(255, 255, 255, 0.52);
  --glass2: rgba(255, 255, 255, 0.72);
  --aa: #6f95e0; /* periwinkle accent */
  --ab: #b48ff0; /* violet */
  --ac: #3bb6c2; /* teal */
  --ad: #f0a878; /* amber */
  --btn: #1b2028;
  --btnk: #ffffff;
  --font-sans: var(--font-hanken), system-ui, -apple-system, "Segoe UI", sans-serif;
  --conic: conic-gradient(from 160deg, #3bb6c2, #b48ff0, #f0a878, #6f95e0, #3bb6c2);
  --headline: linear-gradient(100deg, #6f95e0, #b48ff0, #3bb6c2);
}

/* ---------- Base ---------- */
* { box-sizing: border-box; }
html { scroll-behavior: smooth; background: var(--bg0); }
body {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 1.0625rem;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  background:
    radial-gradient(120% 90% at 70% 0%, var(--bg1) 0%, var(--bg0) 60%) fixed;
  min-height: 100vh;
}
h1, h2, h3 { margin: 0 0 0.5em; color: var(--ink); font-weight: 500; }
h1 { font-size: clamp(40px, 6.2vw, 82px); line-height: 1.02; letter-spacing: -0.025em; }
h2 { font-size: clamp(30px, 4.4vw, 52px); line-height: 1.06; letter-spacing: -0.02em; }
.h2-contact { font-size: clamp(32px, 5vw, 62px); }
h3 { font-size: 1.4rem; font-weight: 600; letter-spacing: -0.01em; }
p { margin: 0 0 1em; }
a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }
section { scroll-margin-top: 72px; }

/* ---------- Layout helpers ---------- */
.container-1200 { max-width: 1200px; margin-inline: auto; padding-inline: 24px; }
.section { padding-block: clamp(60px, 8vw, 100px); }
.section-services { padding-block: clamp(80px, 11vw, 140px); }
.section-head { max-width: 600px; margin: 0 auto 48px; text-align: center; }
.section-head > p:last-child { color: var(--soft); margin-bottom: 0; }
.grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
.grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; }
.lead { font-size: clamp(16px, 1.5vw, 19.5px); color: var(--soft); max-width: 560px; }

/* ---------- Tokens applied: eyebrow, gradient text, orb ---------- */
.eyebrow {
  font-size: 11.5px; font-weight: 600; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--ac); display: inline-flex;
  align-items: center; gap: 9px; margin: 0 0 14px;
}
.eyebrow-dot {
  width: 7px; height: 7px; border-radius: 50%; background: var(--ac);
  box-shadow: 0 0 10px 1px var(--ac); display: inline-block;
}
.gradient-text {
  background: var(--headline); -webkit-background-clip: text;
  background-clip: text; color: transparent;
}
.orb {
  display: inline-grid; place-items: center; border-radius: 50%;
  background: var(--conic); color: #fff; font-weight: 600; flex: none;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.6), 0 6px 16px rgba(60, 90, 160, 0.25);
}
.orb-num { font-size: 1.05rem; }

/* ---------- Glass surfaces (@layer components) ---------- */
@layer components {
  .nav-pill {
    display: flex; align-items: center; gap: 24px;
    background: var(--glass2); border: 1px solid var(--navbrd);
    border-radius: 100px; padding: 11px 14px 11px 22px;
    -webkit-backdrop-filter: blur(18px) saturate(1.5);
    backdrop-filter: blur(18px) saturate(1.5);
    box-shadow: inset 0 1px 0 var(--hi), 0 12px 30px rgba(31, 49, 74, 0.10);
  }
  .glass-card {
    background: var(--glass); border: 1px solid var(--brd);
    border-radius: 22px; padding: 28px;
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    backdrop-filter: blur(20px) saturate(1.5);
    box-shadow: inset 0 1px 0 var(--hi), 0 24px 60px rgba(0, 0, 0, 0.12);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .glass-card:hover { transform: translateY(-6px); box-shadow: inset 0 1px 0 var(--hi), 0 30px 70px rgba(0, 0, 0, 0.16); }
  .icon-tile {
    width: 46px; height: 46px; border-radius: 14px; display: inline-grid;
    place-items: center; color: var(--ac); background: var(--glass);
    border: 1px solid var(--brd);
    -webkit-backdrop-filter: blur(18px) saturate(1.5);
    backdrop-filter: blur(18px) saturate(1.5);
    box-shadow: inset 0 1px 0 var(--hi);
  }
  /* Buttons — exact specs from spec §6 */
  .btn-glass-blue, .btn-glass-clear, .btn-solid {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 16px 32px; border-radius: 100px; font-weight: 600; font-size: 0.98rem;
    cursor: pointer; transition: transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease;
  }
  .btn-glass-blue {
    color: #23407a;
    background: linear-gradient(160deg, rgba(111, 149, 224, 0.42), rgba(111, 149, 224, 0.16));
    border: 1px solid rgba(255, 255, 255, 0.7);
    -webkit-backdrop-filter: blur(8px) saturate(1.6); backdrop-filter: blur(8px) saturate(1.6);
    box-shadow: inset 0 1.5px 0 rgba(255, 255, 255, 0.85), inset 0 -10px 22px rgba(111, 149, 224, 0.22), 0 14px 32px rgba(60, 90, 160, 0.28);
  }
  .btn-glass-blue:hover {
    transform: translateY(-2px);
    background: linear-gradient(160deg, rgba(111, 149, 224, 0.54), rgba(111, 149, 224, 0.26));
  }
  .btn-glass-clear {
    color: var(--ink);
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.03));
    border: 1px solid rgba(255, 255, 255, 0.66);
    -webkit-backdrop-filter: blur(4px) saturate(1.5); backdrop-filter: blur(4px) saturate(1.5);
    box-shadow: inset 0 1.5px 0 rgba(255, 255, 255, 0.9), inset 0 -10px 22px rgba(255, 255, 255, 0.16), inset 0 1px 12px rgba(120, 150, 200, 0.08), 0 14px 34px rgba(31, 49, 74, 0.16);
  }
  .btn-glass-clear:hover {
    transform: translateY(-2px);
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.07));
  }
  .btn-solid {
    color: var(--btnk);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0) 46%), var(--btn);
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 10px 26px rgba(24, 28, 44, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.14);
  }
  .btn-solid:hover { transform: translateY(-2px); }
}

/* ---------- Hero ---------- */
.hero { position: relative; overflow: hidden; min-height: 100vh; display: flex; }
.hero-inner { position: relative; z-index: 2; width: 100%; padding-top: 150px; padding-bottom: 56px; display: flex; flex-direction: column; }
.hero-inner > .eyebrow, .hero-inner > h1, .hero-inner > .lead, .hero-actions { max-width: 600px; }
.hero h1 { margin-top: 8px; }
.hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 14px; }
.hero-glass {
  position: absolute; inset: 0; z-index: 1;
  background-image: url("/hero-glass.png");
  background-position: 74% 40%; background-size: cover; background-repeat: no-repeat;
  -webkit-mask-image: linear-gradient(to right, transparent 4%, #000 44%, #000 100%), linear-gradient(to bottom, #000 76%, transparent 99%);
  -webkit-mask-composite: source-in;
  mask-image: linear-gradient(to right, transparent 4%, #000 44%, #000 100%), linear-gradient(to bottom, #000 76%, transparent 99%);
  mask-composite: intersect;
}
.hero-blobs { position: absolute; inset: 0; z-index: 0; }
.hero-blobs span { position: absolute; border-radius: 50%; filter: blur(72px); opacity: 0.5; }
.hero-blobs span:nth-child(1) { width: 540px; height: 540px; left: -6%; top: 8%; background: radial-gradient(circle, var(--aa), transparent 65%); animation: drift1 26s ease-in-out infinite; }
.hero-blobs span:nth-child(2) { width: 520px; height: 520px; right: 6%; top: 0; background: radial-gradient(circle, var(--ab), transparent 65%); animation: drift2 30s ease-in-out infinite; }
.hero-blobs span:nth-child(3) { width: 560px; height: 560px; right: 18%; bottom: -10%; background: radial-gradient(circle, var(--ad), transparent 65%); animation: drift1 24s ease-in-out infinite; }
.hero-foot { margin-top: auto; padding-top: 56px; display: grid; grid-template-columns: 1fr auto; gap: 18px 40px; align-items: end; }
.hero-foot-num { font-size: clamp(56px, 9vw, 120px); font-weight: 300; color: var(--faint); line-height: 0.8; grid-row: span 2; }
.hero-foot-cats { text-transform: uppercase; letter-spacing: 0.12em; font-size: 12px; color: var(--soft); }
.hero-foot-note { max-width: 360px; color: var(--soft); font-style: italic; margin: 0; justify-self: end; grid-column: 2; grid-row: 1 / span 2; }

/* ---------- Services / Process numbering ---------- */
.card-num { color: var(--ab); font-weight: 600; letter-spacing: 0.2em; margin-bottom: 12px; }

/* ---------- Selected Work ---------- */
.work-cta { text-align: center; margin-bottom: 36px; }
.work-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 18px; }
.work-card { display: block; border-radius: 20px; overflow: hidden; background: var(--glass); border: 1px solid var(--brd); box-shadow: inset 0 1px 0 var(--hi), 0 18px 44px rgba(0, 0, 0, 0.10); transition: transform 0.25s ease, box-shadow 0.25s ease; }
.work-card:hover { transform: translateY(-6px); }
.work-shot { aspect-ratio: 4 / 3; width: 100%; object-fit: cover; }
.work-meta { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; padding: 14px 16px 16px; }
.work-name { font-weight: 600; }
.work-cat { color: var(--soft); font-size: 0.9rem; }

/* ---------- Why ---------- */
.why { padding-inline: 4px; }
.why h3 { margin-top: 18px; }
.why p { color: var(--soft); }

/* ---------- Contact ---------- */
.section-contact { padding-block: clamp(60px, 8vw, 100px); }
.contact-panel {
  position: relative; overflow: hidden; max-width: 880px; margin-inline: auto;
  text-align: center; border-radius: 32px; padding: clamp(40px, 6vw, 72px);
  background: var(--glass2); border: 1px solid var(--brd);
  -webkit-backdrop-filter: blur(26px) saturate(1.5); backdrop-filter: blur(26px) saturate(1.5);
  box-shadow: inset 0 1px 0 var(--hi), 0 30px 80px rgba(0, 0, 0, 0.14);
}
.contact-panel .section-head { margin-bottom: 28px; }
.contact-blob { position: absolute; width: 360px; height: 360px; border-radius: 50%; filter: blur(70px); opacity: 0.5; z-index: 0; }
.contact-blob-a { background: radial-gradient(circle, var(--aa), transparent 65%); top: -120px; left: -80px; animation: drift1 24s ease-in-out infinite; }
.contact-blob-b { background: radial-gradient(circle, var(--ad), transparent 65%); bottom: -120px; right: -80px; animation: drift2 28s ease-in-out infinite; }
.contact-panel > * { position: relative; z-index: 1; }
.btn-book { margin-inline: auto; }
.contact-alt { color: var(--soft); margin: 14px 0 0; }
.contact-alt a { color: var(--aa); }

/* ---------- Footer ---------- */
.site-footer { border-top: 1px solid var(--brd); margin-top: 40px; }
.footer-inner { display: flex; flex-wrap: wrap; gap: 12px 24px; align-items: center; justify-content: space-between; padding-block: 28px; color: var(--soft); }
.footer-brand { display: inline-flex; align-items: center; gap: 10px; font-weight: 600; letter-spacing: 0.18em; color: var(--ink); }

/* ---------- Nav (header) ---------- */
.site-header { position: fixed; top: 16px; left: 0; right: 0; z-index: 50; }
.site-header .container-1200 { display: block; }
.brand { display: inline-flex; align-items: center; gap: 12px; font-weight: 600; letter-spacing: 0.2em; font-size: 13.5px; }
.site-nav { display: flex; align-items: center; gap: 22px; margin-left: auto; }
.site-nav a { font-size: 14.5px; font-weight: 500; opacity: 0.72; transition: opacity 0.2s ease; }
.site-nav a:hover { opacity: 1; }
.site-nav .btn-solid, .site-nav .btn-glass-blue { padding: 11px 20px; }
.nav-toggle { display: none; }

/* ---------- Trust marquee ---------- */
.marquee { overflow: hidden; padding-block: 18px; border-block: 1px solid var(--navbrd); -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
.marquee-track { display: flex; width: max-content; animation: marquee 34s linear infinite; }
.marquee-copy { display: flex; align-items: center; gap: 22px; padding-right: 22px; color: var(--soft); white-space: nowrap; }
.marquee-copy a { color: var(--ink); opacity: 0.8; }
.marquee-copy a:hover { color: var(--aa); opacity: 1; }
.marquee .dot { color: var(--faint); }

/* ---------- Reveal (progressive enhancement) ---------- */
.reveal { opacity: 1; }
html.js .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.8s cubic-bezier(0.2, 0.75, 0.25, 1), transform 0.8s cubic-bezier(0.2, 0.75, 0.25, 1); }
html.js .reveal.reveal-in { opacity: 1; transform: none; }

/* ---------- Keyframes ---------- */
@keyframes drift1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(28px, -22px); } }
@keyframes drift2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-26px, 20px); } }
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

/* ---------- Responsive ---------- */
@media (max-width: 860px) {
  .nav-toggle { display: inline-flex; flex-direction: column; gap: 4px; background: none; border: 0; margin-left: auto; cursor: pointer; }
  .nav-toggle span { width: 22px; height: 2px; background: var(--ink); display: block; }
  .site-nav { display: none; position: absolute; top: 64px; right: 16px; left: 16px; flex-direction: column; align-items: stretch; gap: 12px; padding: 16px; border-radius: 18px; }
  .site-nav.open { display: flex; }
  .hero-glass { opacity: 0.4; background-position: 60% 30%; }
  .hero-foot { grid-template-columns: 1fr; }
  .hero-foot-note { justify-self: start; grid-column: 1; grid-row: auto; }
  .hero-foot-num { grid-row: auto; }
}

/* ---------- Reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .hero-blobs span, .contact-blob, .marquee-track { animation: none; }
  html.js .reveal { opacity: 1; transform: none; transition: none; }
  .btn-glass-blue, .btn-glass-clear, .btn-solid, .glass-card, .work-card { transition: none; }
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design/web"
npm run build
```

Expected: build succeeds (the default page now has the new base styles; no CSS errors).

- [ ] **Step 3: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/src/app/globals.css
git commit -m "feat(web): design tokens + glass component classes"
```

---

### Task 5: Root layout — font, metadata, JSON-LD

**Files:**
- Replace: `web/src/app/layout.tsx`
- Delete: `web/src/app/page.tsx` default contents will be replaced in Task 20 (leave for now)

- [ ] **Step 1: Write `web/src/app/layout.tsx`**

```tsx
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const hanken = localFont({
  src: '../fonts/hanken-grotesk-variable.woff2',
  variable: '--font-hanken',
  weight: '300 800',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://devilladesign.com'),
  title: 'De Villa Design — Websites for Health & Wellness Businesses in Australia',
  description:
    'Calm, beautiful websites for Australian clinics, studios and wellness practitioners. Designed to earn trust and fill your books.',
  alternates: { canonical: 'https://devilladesign.com' },
  openGraph: {
    title: 'De Villa Design — Websites for Health & Wellness',
    description:
      'Calm, beautiful websites for Australian clinics, studios and wellness practitioners.',
    type: 'website',
    url: 'https://devilladesign.com',
    locale: 'en_AU',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M16 3C16 3 7 14.5 7 20.5a9 9 0 0 0 18 0C25 14.5 16 3 16 3Z' fill='%236f95e0'/%3E%3C/svg%3E",
  },
}

export const viewport: Viewport = { themeColor: '#f3f6f9' }

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'De Villa Design',
  description:
    'Web design studio creating websites for health and wellness businesses across Australia.',
  url: 'https://devilladesign.com',
  email: 'andre@devilladesign.com',
  areaServed: { '@type': 'Country', name: 'Australia' },
  knowsAbout: ['Web design', 'Health and wellness websites', 'Small business websites'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={hanken.variable}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Verify build (confirms `next/font` resolves the woff2 path)**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design/web"
npm run build
```

Expected: build succeeds; no "Can't resolve font" error.

- [ ] **Step 3: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/src/app/layout.tsx
git commit -m "feat(web): root layout with font, metadata, JSON-LD"
```

---

## Phase 2 — Content

### Task 6: Typed content config

**Files:**
- Create: `web/src/content/types.ts`, `site.ts`, `services.ts`, `work.ts`, `whys.ts`, `process.ts`
- Test: `web/src/content/content.test.ts`

- [ ] **Step 1: Write the failing test**

Create `web/src/content/content.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { site } from './site'
import { services } from './services'
import { work } from './work'
import { whys } from './whys'
import { process } from './process'

describe('content config', () => {
  it('has the four nav links', () => {
    expect(site.nav.map((n) => n.href)).toEqual(['#services', '#work', '#process', '#contact'])
  })
  it('uses the real Calendly URL', () => {
    expect(site.calendly).toMatch(/^https:\/\/calendly\.com\//)
  })
  it('has exactly 3 services numbered 01-03', () => {
    expect(services).toHaveLength(3)
    expect(services.map((s) => s.num)).toEqual(['01', '02', '03'])
  })
  it('has exactly 8 work items with valid demo links and shots', () => {
    expect(work).toHaveLength(8)
    for (const w of work) {
      expect(w.href).toMatch(/^\/demos\/[a-z-]+\/$/)
      expect(w.shot).toMatch(/^\/work\/[a-z-]+\.webp$/)
      expect(w.alt.length).toBeGreaterThan(0)
    }
  })
  it('has 3 whys and 4 process steps', () => {
    expect(whys).toHaveLength(3)
    expect(process.map((p) => p.num)).toEqual([1, 2, 3, 4])
  })
})
```

- [ ] **Step 2: Run it — expect failure**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design/web"
npm run test -- content
```

Expected: FAIL — cannot resolve `./site` etc.

- [ ] **Step 3: Create the types**

`web/src/content/types.ts`:

```ts
export type NavLink = { label: string; href: string }
export type MarqueeItem = { label: string; href: string }
export type ServiceItem = { num: string; title: string; body: string }
export type WorkItem = { name: string; category: string; href: string; shot: string; alt: string }
export type WhyItem = { icon: 'booking' | 'trust' | 'google'; title: string; body: string }
export type ProcessStep = { num: number; title: string; body: string }
```

- [ ] **Step 4: Create `site.ts`**

```ts
import type { NavLink, MarqueeItem } from './types'

export const site = {
  brand: 'DE VILLA DESIGN',
  calendly: 'https://calendly.com/andre-devilladesign/free-20-minute-chat',
  email: 'andre@devilladesign.com',
  nav: [
    { label: 'Services', href: '#services' },
    { label: 'Work', href: '#work' },
    { label: 'Process', href: '#process' },
    { label: 'Contact', href: '#contact' },
  ] as NavLink[],
  marquee: [
    { label: 'Physiotherapy', href: '/demos/serenity-physio/' },
    { label: 'Yoga studios', href: '/demos/bloom-yoga/' },
    { label: 'Dental practices', href: '/demos/coastal-dental/' },
    { label: 'Chiropractic', href: '/demos/truenorth-chiro/' },
    { label: 'Med spas', href: '/demos/lumiere-skin/' },
    { label: 'Pilates', href: '/demos/form-pilates/' },
    { label: 'Massage therapy', href: '/demos/stillpoint-massage/' },
    { label: 'Wellness retreats', href: '/demos/solace-springs/' },
  ] as MarqueeItem[],
  hero: {
    eyebrow: 'WEBSITES FOR HEALTH & WELLNESS · AUSTRALIA',
    titleLead: 'Calm, beautiful websites that ',
    titleAccent: 'fill your books.',
    lead: 'For clinics, studios and practitioners who want to look as good online as the care they give.',
    indexNum: '01',
    categories: 'Dental · Chiro · Med spa / Pilates · Massage · Physio',
    note: 'De Villa builds calm, conversion-ready websites for the people who keep Australia well — your canvas, beautifully done.',
  },
}
```

- [ ] **Step 5: Create `services.ts`**

```ts
import type { ServiceItem } from './types'

export const services: ServiceItem[] = [
  { num: '01', title: 'New websites', body: 'A complete website designed and built from scratch — structure, design and build, ready to win bookings from day one.' },
  { num: '02', title: 'Redesigns', body: "Already have a site that isn't pulling its weight? I'll turn it into one that earns trust and converts visitors into clients." },
  { num: '03', title: 'Care & updates', body: 'Hosting, content changes and small improvements handled for you, so your site stays fresh while you stay focused on clients.' },
]
```

- [ ] **Step 6: Create `work.ts`**

```ts
import type { WorkItem } from './types'

export const work: WorkItem[] = [
  { name: 'Coastal Dental', category: 'Dental practice', href: '/demos/coastal-dental/', shot: '/work/coastal-dental.webp', alt: 'Coastal Dental — concept website' },
  { name: 'True North Chiropractic', category: 'Chiropractic', href: '/demos/truenorth-chiro/', shot: '/work/truenorth-chiro.webp', alt: 'True North Chiropractic — concept website' },
  { name: 'Lumière Skin & Laser', category: 'Med spa', href: '/demos/lumiere-skin/', shot: '/work/lumiere-skin.webp', alt: 'Lumière Skin & Laser — concept website' },
  { name: 'FORM Pilates Studio', category: 'Reformer Pilates', href: '/demos/form-pilates/', shot: '/work/form-pilates.webp', alt: 'FORM Pilates Studio — concept website' },
  { name: 'Still Point Massage', category: 'Remedial massage', href: '/demos/stillpoint-massage/', shot: '/work/stillpoint-massage.webp', alt: 'Still Point Massage — concept website' },
  { name: 'Serenity Physio', category: 'Physiotherapy', href: '/demos/serenity-physio/', shot: '/work/serenity-physio.webp', alt: 'Serenity Physio — concept website' },
  { name: 'Bloom Yoga Studio', category: 'Yoga studio', href: '/demos/bloom-yoga/', shot: '/work/bloom-yoga.webp', alt: 'Bloom Yoga Studio — concept website' },
  { name: 'Solace Springs Retreat', category: 'Wellness retreat', href: '/demos/solace-springs/', shot: '/work/solace-springs.webp', alt: 'Solace Springs Retreat — concept website' },
]
```

- [ ] **Step 7: Create `whys.ts`**

```ts
import type { WhyItem } from './types'

export const whys: WhyItem[] = [
  { icon: 'booking', title: 'Booking built in', body: 'Online booking and clear calls-to-action wired into every page, so visitors can become clients on the spot.' },
  { icon: 'trust', title: 'Designed to earn trust', body: 'Look established and professional from the very first glance — the way good care deserves.' },
  { icon: 'google', title: 'Found on Google', body: 'Local SEO foundations so nearby clients can actually find you.' },
]
```

- [ ] **Step 8: Create `process.ts`**

```ts
import type { ProcessStep } from './types'

export const process: ProcessStep[] = [
  { num: 1, title: 'Chat', body: 'A free 20-minute call about your goals.' },
  { num: 2, title: 'Design', body: 'I craft the look and structure for your approval.' },
  { num: 3, title: 'Build', body: 'Your site is built, tested and refined.' },
  { num: 4, title: 'Launch', body: 'Live, handed over, and cared for.' },
]
```

- [ ] **Step 9: Run the test — expect pass**

```bash
npm run test -- content
```

Expected: PASS (5 tests).

- [ ] **Step 10: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/src/content
git commit -m "feat(web): typed content config (services, work, whys, process, site)"
```

---

## Phase 3 — UI primitives (TDD)

> All primitives live in `web/src/components/ui/`. They are plain components (no `next/font`, no server-only APIs) so RTL can render them.

### Task 7: `Eyebrow` + `SectionHead`

**Files:**
- Create: `web/src/components/ui/Eyebrow.tsx`, `SectionHead.tsx`
- Test: `web/src/components/ui/SectionHead.test.tsx`

- [ ] **Step 1: Write the failing test**

`web/src/components/ui/SectionHead.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SectionHead } from './SectionHead'

describe('SectionHead', () => {
  it('renders eyebrow, title and lead', () => {
    render(<SectionHead eyebrow="SERVICES" title="What I can do for you" lead="Lead copy." />)
    expect(screen.getByText('SERVICES')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'What I can do for you' })).toBeInTheDocument()
    expect(screen.getByText('Lead copy.')).toBeInTheDocument()
  })
  it('omits the lead when not provided', () => {
    const { container } = render(<SectionHead eyebrow="X" title="Y" />)
    expect(container.querySelectorAll('p')).toHaveLength(1) // only the eyebrow <p>
  })
})
```

- [ ] **Step 2: Run — expect failure**

```bash
npm run test -- SectionHead
```

Expected: FAIL — cannot resolve `./SectionHead`.

- [ ] **Step 3: Implement `Eyebrow.tsx`**

```tsx
import type { ReactNode } from 'react'

export function Eyebrow({ children, dot = false }: { children: ReactNode; dot?: boolean }) {
  return (
    <p className="eyebrow">
      {dot && <span className="eyebrow-dot" aria-hidden="true" />}
      {children}
    </p>
  )
}
```

- [ ] **Step 4: Implement `SectionHead.tsx`**

```tsx
import type { ReactNode } from 'react'
import { Eyebrow } from './Eyebrow'

export function SectionHead({
  eyebrow,
  title,
  lead,
  dot,
}: {
  eyebrow: string
  title: ReactNode
  lead?: string
  dot?: boolean
}) {
  return (
    <div className="section-head">
      <Eyebrow dot={dot}>{eyebrow}</Eyebrow>
      <h2>{title}</h2>
      {lead && <p>{lead}</p>}
    </div>
  )
}
```

- [ ] **Step 5: Run — expect pass**

```bash
npm run test -- SectionHead
```

Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/src/components/ui
git commit -m "feat(web): Eyebrow + SectionHead primitives"
```

---

### Task 8: `IridescentOrb` + `GlassCard`

**Files:**
- Create: `web/src/components/ui/IridescentOrb.tsx`, `GlassCard.tsx`
- Test: `web/src/components/ui/IridescentOrb.test.tsx`

- [ ] **Step 1: Write the failing test**

`web/src/components/ui/IridescentOrb.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { IridescentOrb } from './IridescentOrb'
import { GlassCard } from './GlassCard'

describe('IridescentOrb', () => {
  it('renders a number child', () => {
    render(<IridescentOrb size={40}>{3}</IridescentOrb>)
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})

describe('GlassCard', () => {
  it('renders children inside a .glass-card', () => {
    const { container } = render(<GlassCard><span>hi</span></GlassCard>)
    expect(container.querySelector('.glass-card')).not.toBeNull()
    expect(screen.getByText('hi')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — expect failure**

```bash
npm run test -- IridescentOrb
```

Expected: FAIL — cannot resolve modules.

- [ ] **Step 3: Implement `IridescentOrb.tsx`**

```tsx
import type { ReactNode } from 'react'

export function IridescentOrb({
  size = 26,
  children,
  className = '',
}: {
  size?: number
  children?: ReactNode
  className?: string
}) {
  return (
    <span
      className={`orb ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden={children ? undefined : true}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 4: Implement `GlassCard.tsx`**

```tsx
import type { ReactNode } from 'react'

export function GlassCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`glass-card ${className}`.trim()}>{children}</div>
}
```

- [ ] **Step 5: Run — expect pass**

```bash
npm run test -- IridescentOrb
```

Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/src/components/ui
git commit -m "feat(web): IridescentOrb + GlassCard primitives"
```

---

### Task 9: `GlassButton` (blue / clear / solid)

**Files:**
- Create: `web/src/components/ui/GlassButton.tsx`
- Test: `web/src/components/ui/GlassButton.test.tsx`

- [ ] **Step 1: Write the failing test**

`web/src/components/ui/GlassButton.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GlassButton } from './GlassButton'

describe('GlassButton', () => {
  it('renders an anchor with the variant class and href', () => {
    render(<GlassButton href="#work" variant="clear">See recent work</GlassButton>)
    const a = screen.getByRole('link', { name: 'See recent work' })
    expect(a).toHaveAttribute('href', '#work')
    expect(a).toHaveClass('btn-glass-clear')
  })
  it('adds target/rel when external', () => {
    render(<GlassButton href="https://x.test" variant="blue" external>Book</GlassButton>)
    const a = screen.getByRole('link', { name: 'Book' })
    expect(a).toHaveAttribute('target', '_blank')
    expect(a).toHaveAttribute('rel', 'noopener noreferrer')
    expect(a).toHaveClass('btn-glass-blue')
  })
})
```

- [ ] **Step 2: Run — expect failure**

```bash
npm run test -- GlassButton
```

Expected: FAIL — cannot resolve `./GlassButton`.

- [ ] **Step 3: Implement `GlassButton.tsx`**

```tsx
import type { ReactNode } from 'react'

type Variant = 'blue' | 'clear' | 'solid'

const variantClass: Record<Variant, string> = {
  blue: 'btn-glass-blue',
  clear: 'btn-glass-clear',
  solid: 'btn-solid',
}

export function GlassButton({
  href,
  variant,
  external = false,
  className = '',
  children,
}: {
  href: string
  variant: Variant
  external?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`${variantClass[variant]} ${className}`.trim()}
    >
      {children}
    </a>
  )
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm run test -- GlassButton
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/src/components/ui
git commit -m "feat(web): GlassButton with blue/clear/solid variants"
```

---

### Task 10: `Reveal` (client island, progressive enhancement)

**Files:**
- Create: `web/src/components/ui/Reveal.tsx`
- Test: `web/src/components/ui/Reveal.test.tsx`

- [ ] **Step 1: Write the failing test**

`web/src/components/ui/Reveal.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Reveal } from './Reveal'

describe('Reveal', () => {
  it('always renders its children (content is never lost)', () => {
    render(<Reveal><p>visible content</p></Reveal>)
    expect(screen.getByText('visible content')).toBeInTheDocument()
  })
  it('wraps children in a .reveal element', () => {
    const { container } = render(<Reveal><span>x</span></Reveal>)
    expect(container.querySelector('.reveal')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run — expect failure**

```bash
npm run test -- Reveal
```

Expected: FAIL — cannot resolve `./Reveal`.

- [ ] **Step 3: Implement `Reveal.tsx`**

```tsx
'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${shown ? 'reveal-in' : ''} ${className}`.trim()}>
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm run test -- Reveal
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/src/components/ui
git commit -m "feat(web): Reveal scroll-in wrapper (progressive enhancement)"
```

---

## Phase 4 — Sections (TDD)

> Section components live in `web/src/components/`. Each reads copy from `src/content/`.

### Task 11: `Nav` (client island)

**Files:**
- Create: `web/src/components/Nav.tsx`
- Test: `web/src/components/Nav.test.tsx`

- [ ] **Step 1: Write the failing test**

`web/src/components/Nav.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Nav } from './Nav'
import { site } from '@/content/site'

describe('Nav', () => {
  it('renders the 4 anchor links', () => {
    render(<Nav />)
    for (const link of site.nav) {
      expect(screen.getByRole('link', { name: link.label })).toHaveAttribute('href', link.href)
    }
  })
  it('renders the Calendly CTA, opening in a new tab', () => {
    render(<Nav />)
    const cta = screen.getByRole('link', { name: 'Book a free chat' })
    expect(cta).toHaveAttribute('href', site.calendly)
    expect(cta).toHaveAttribute('target', '_blank')
  })
  it('toggles the mobile menu via aria-expanded', async () => {
    render(<Nav />)
    const btn = screen.getByRole('button', { name: /toggle menu/i })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
  })
})
```

- [ ] **Step 2: Run — expect failure**

```bash
npm run test -- Nav
```

Expected: FAIL — cannot resolve `./Nav`.

- [ ] **Step 3: Implement `Nav.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { site } from '@/content/site'
import { IridescentOrb } from '@/components/ui/IridescentOrb'
import { GlassButton } from '@/components/ui/GlassButton'

export function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="container-1200 nav-pill">
        <a className="brand" href="#top" onClick={() => setOpen(false)}>
          <IridescentOrb size={26} />
          <span>{site.brand}</span>
        </a>
        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav id="site-nav" aria-label="Main" className={open ? 'site-nav open' : 'site-nav'}>
          {site.nav.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <GlassButton href={site.calendly} variant="solid" external>
            Book a free chat
          </GlassButton>
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm run test -- Nav
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/src/components/Nav.tsx web/src/components/Nav.test.tsx
git commit -m "feat(web): Nav with mobile toggle and Calendly CTA"
```

---

### Task 12: `Hero`

**Files:**
- Create: `web/src/components/Hero.tsx`
- Test: `web/src/components/Hero.test.tsx`

- [ ] **Step 1: Write the failing test**

`web/src/components/Hero.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Hero } from './Hero'
import { site } from '@/content/site'

describe('Hero', () => {
  it('renders the H1 with the gradient accent words', () => {
    render(<Hero />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('Calm, beautiful websites that fill your books.')
    expect(h1.querySelector('.gradient-text')).toHaveTextContent('fill your books.')
  })
  it('renders both hero CTAs with correct targets', () => {
    render(<Hero />)
    expect(screen.getByRole('link', { name: 'Book a free chat' })).toHaveAttribute('href', site.calendly)
    expect(screen.getByRole('link', { name: /See recent work/ })).toHaveAttribute('href', '#work')
  })
})
```

- [ ] **Step 2: Run — expect failure**

```bash
npm run test -- Hero
```

Expected: FAIL — cannot resolve `./Hero`.

- [ ] **Step 3: Implement `Hero.tsx`**

```tsx
import { site } from '@/content/site'
import { GlassButton } from '@/components/ui/GlassButton'

export function Hero() {
  const h = site.hero
  return (
    <section className="hero" id="top">
      <div className="hero-blobs" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="hero-glass" aria-hidden="true" />
      <div className="container-1200 hero-inner">
        <p className="eyebrow">
          <span className="eyebrow-dot" aria-hidden="true" />
          {h.eyebrow}
        </p>
        <h1>
          {h.titleLead}
          <span className="gradient-text">{h.titleAccent}</span>
        </h1>
        <p className="lead">{h.lead}</p>
        <div className="hero-actions">
          <GlassButton href={site.calendly} variant="blue" external>
            Book a free chat
          </GlassButton>
          <GlassButton href="#work" variant="clear">
            See recent work →
          </GlassButton>
        </div>
        <div className="hero-foot">
          <span className="hero-foot-num">{h.indexNum}</span>
          <span className="hero-foot-cats">{h.categories}</span>
          <p className="hero-foot-note">{h.note}</p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm run test -- Hero
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/src/components/Hero.tsx web/src/components/Hero.test.tsx
git commit -m "feat(web): Hero with static glass render, mask, drift blobs, CTAs"
```

---

### Task 13: `TrustMarquee`

**Files:**
- Create: `web/src/components/TrustMarquee.tsx`
- Test: `web/src/components/TrustMarquee.test.tsx`

- [ ] **Step 1: Write the failing test**

`web/src/components/TrustMarquee.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TrustMarquee } from './TrustMarquee'

describe('TrustMarquee', () => {
  it('links the first industry to its demo', () => {
    render(<TrustMarquee />)
    const link = screen.getAllByRole('link', { name: 'Physiotherapy' })[0]
    expect(link).toHaveAttribute('href', '/demos/serenity-physio/')
  })
})
```

- [ ] **Step 2: Run — expect failure**

```bash
npm run test -- TrustMarquee
```

Expected: FAIL — cannot resolve `./TrustMarquee`.

- [ ] **Step 3: Implement `TrustMarquee.tsx`**

```tsx
import { site } from '@/content/site'

function Copy({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="marquee-copy" aria-hidden={hidden || undefined}>
      {site.marquee.map((m) => (
        <span key={m.href} style={{ display: 'inline-flex', gap: 22, alignItems: 'center' }}>
          <a href={m.href} tabIndex={hidden ? -1 : undefined}>
            {m.label}
          </a>
          <span className="dot">·</span>
        </span>
      ))}
    </div>
  )
}

export function TrustMarquee() {
  return (
    <section className="trust" aria-label="Explore demo sites by industry">
      <div className="marquee">
        <div className="marquee-track">
          <Copy />
          <Copy hidden />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm run test -- TrustMarquee
```

Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/src/components/TrustMarquee.tsx web/src/components/TrustMarquee.test.tsx
git commit -m "feat(web): TrustMarquee industry strip linking to demos"
```

---

### Task 14: `Services`

**Files:**
- Create: `web/src/components/Services.tsx`
- Test: `web/src/components/Services.test.tsx`

- [ ] **Step 1: Write the failing test**

`web/src/components/Services.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Services } from './Services'

describe('Services', () => {
  it('renders the section heading and 3 service cards', () => {
    const { container } = render(<Services />)
    expect(screen.getByRole('heading', { level: 2, name: 'What I can do for you' })).toBeInTheDocument()
    expect(container.querySelectorAll('.glass-card')).toHaveLength(3)
    expect(screen.getByText('New websites')).toBeInTheDocument()
  })
  it('is anchored at #services', () => {
    const { container } = render(<Services />)
    expect(container.querySelector('section#services')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run — expect failure**

```bash
npm run test -- Services
```

Expected: FAIL — cannot resolve `./Services`.

- [ ] **Step 3: Implement `Services.tsx`**

```tsx
import { services } from '@/content/services'
import { SectionHead } from '@/components/ui/SectionHead'
import { GlassCard } from '@/components/ui/GlassCard'

export function Services() {
  return (
    <section className="section section-services" id="services">
      <div className="container-1200">
        <SectionHead
          eyebrow="SERVICES"
          title="What I can do for you"
          lead="I specialise in websites for health & wellness businesses — so yours converts from day one."
        />
        <div className="grid-3">
          {services.map((s) => (
            <GlassCard key={s.num}>
              <div className="card-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm run test -- Services
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/src/components/Services.tsx web/src/components/Services.test.tsx
git commit -m "feat(web): Services section"
```

---

### Task 15: `SelectedWork` (8 cards)

**Files:**
- Create: `web/src/components/SelectedWork.tsx`
- Test: `web/src/components/SelectedWork.test.tsx`

- [ ] **Step 1: Write the failing test**

`web/src/components/SelectedWork.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SelectedWork } from './SelectedWork'
import { work } from '@/content/work'

describe('SelectedWork', () => {
  it('renders 8 cards linking to the real demos with screenshots', () => {
    const { container } = render(<SelectedWork />)
    const cards = container.querySelectorAll('a.work-card')
    expect(cards).toHaveLength(8)
    work.forEach((w, i) => {
      const card = cards[i] as HTMLAnchorElement
      expect(card).toHaveAttribute('href', w.href)
      expect(card.querySelector('img')).toHaveAttribute('src', w.shot)
      expect(card.querySelector('img')).toHaveAttribute('alt', w.alt)
    })
  })
  it('has a Browse-all CTA to /demos/', () => {
    render(<SelectedWork />)
    expect(screen.getByRole('link', { name: /Browse all eight demos/ })).toHaveAttribute('href', '/demos/')
  })
})
```

- [ ] **Step 2: Run — expect failure**

```bash
npm run test -- SelectedWork
```

Expected: FAIL — cannot resolve `./SelectedWork`.

- [ ] **Step 3: Implement `SelectedWork.tsx`**

```tsx
import { work } from '@/content/work'
import { SectionHead } from '@/components/ui/SectionHead'
import { GlassButton } from '@/components/ui/GlassButton'

export function SelectedWork() {
  return (
    <section className="section" id="work">
      <div className="container-1200">
        <SectionHead
          eyebrow="SELECTED WORK"
          title="See the standard for yourself"
          lead="Eight complete concept sites I designed and built — open one and explore exactly what I'd build for a business like yours."
        />
        <p className="work-cta">
          <GlassButton href="/demos/" variant="clear">
            Browse all eight demos →
          </GlassButton>
        </p>
        <div className="work-grid">
          {work.map((w) => (
            <a key={w.href} className="work-card" href={w.href}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="work-shot" src={w.shot} alt={w.alt} width={800} height={600} loading="lazy" />
              <div className="work-meta">
                <span className="work-name">{w.name} ↗</span>
                <span className="work-cat">{w.category}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
```

> Note: plain `<img>` is intentional (these point at external static demo files, and `images.unoptimized` is on). The eslint-disable comment silences `next/next/no-img-element`.

- [ ] **Step 4: Run — expect pass**

```bash
npm run test -- SelectedWork
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/src/components/SelectedWork.tsx web/src/components/SelectedWork.test.tsx
git commit -m "feat(web): SelectedWork grid (8 real demo cards)"
```

---

### Task 16: `WhyItMatters`

**Files:**
- Create: `web/src/components/WhyItMatters.tsx`
- Test: `web/src/components/WhyItMatters.test.tsx`

- [ ] **Step 1: Write the failing test**

`web/src/components/WhyItMatters.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { WhyItMatters } from './WhyItMatters'

describe('WhyItMatters', () => {
  it('renders the heading and the three benefit titles', () => {
    render(<WhyItMatters />)
    expect(screen.getByRole('heading', { level: 2, name: /More than pretty/ })).toBeInTheDocument()
    expect(screen.getByText('Booking built in')).toBeInTheDocument()
    expect(screen.getByText('Designed to earn trust')).toBeInTheDocument()
    expect(screen.getByText('Found on Google')).toBeInTheDocument()
  })
  it('renders an icon tile per benefit', () => {
    const { container } = render(<WhyItMatters />)
    expect(container.querySelectorAll('.icon-tile')).toHaveLength(3)
  })
})
```

- [ ] **Step 2: Run — expect failure**

```bash
npm run test -- WhyItMatters
```

Expected: FAIL — cannot resolve `./WhyItMatters`.

- [ ] **Step 3: Implement `WhyItMatters.tsx`**

```tsx
import { whys } from '@/content/whys'
import { SectionHead } from '@/components/ui/SectionHead'
import { CalendarCheck, ShieldCheck, Search, type LucideIcon } from 'lucide-react'

const icons: Record<string, LucideIcon> = {
  booking: CalendarCheck,
  trust: ShieldCheck,
  google: Search,
}

export function WhyItMatters() {
  return (
    <section className="section">
      <div className="container-1200">
        <SectionHead eyebrow="WHY IT MATTERS" title="More than pretty — built to grow your practice" />
        <div className="grid-3">
          {whys.map((w) => {
            const Icon = icons[w.icon]
            return (
              <div key={w.title} className="why">
                <span className="icon-tile">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3>{w.title}</h3>
                <p>{w.body}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm run test -- WhyItMatters
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/src/components/WhyItMatters.tsx web/src/components/WhyItMatters.test.tsx
git commit -m "feat(web): WhyItMatters section with lucide icons"
```

---

### Task 17: `Process`

**Files:**
- Create: `web/src/components/Process.tsx`
- Test: `web/src/components/Process.test.tsx`

- [ ] **Step 1: Write the failing test**

`web/src/components/Process.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Process } from './Process'

describe('Process', () => {
  it('renders 4 steps with numbered orbs', () => {
    const { container } = render(<Process />)
    expect(container.querySelector('section#process')).not.toBeNull()
    expect(container.querySelectorAll('.glass-card')).toHaveLength(4)
    expect(screen.getByText('Chat')).toBeInTheDocument()
    expect(screen.getByText('Launch')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — expect failure**

```bash
npm run test -- Process
```

Expected: FAIL — cannot resolve `./Process`.

- [ ] **Step 3: Implement `Process.tsx`**

```tsx
import { process } from '@/content/process'
import { SectionHead } from '@/components/ui/SectionHead'
import { GlassCard } from '@/components/ui/GlassCard'
import { IridescentOrb } from '@/components/ui/IridescentOrb'

export function Process() {
  return (
    <section className="section" id="process">
      <div className="container-1200">
        <SectionHead
          eyebrow="HOW IT WORKS"
          title="A simple, calm process"
          lead="No jargon, no surprises — you'll know exactly where things stand at every step."
        />
        <div className="grid-4">
          {process.map((s) => (
            <GlassCard key={s.num}>
              <IridescentOrb size={40} className="orb-num">
                {s.num}
              </IridescentOrb>
              <h3 style={{ marginTop: 16 }}>{s.title}</h3>
              <p>{s.body}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm run test -- Process
```

Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/src/components/Process.tsx web/src/components/Process.test.tsx
git commit -m "feat(web): Process section with iridescent step orbs"
```

---

### Task 18: `Contact`

**Files:**
- Create: `web/src/components/Contact.tsx`
- Test: `web/src/components/Contact.test.tsx`

- [ ] **Step 1: Write the failing test**

`web/src/components/Contact.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Contact } from './Contact'
import { site } from '@/content/site'

describe('Contact', () => {
  it('renders the gradient heading and the Book-a-call CTA to Calendly', () => {
    render(<Contact />)
    const h2 = screen.getByRole('heading', { level: 2 })
    expect(h2).toHaveTextContent('Ready for a website you’re proud of?')
    expect(h2.querySelector('.gradient-text')).toHaveTextContent('proud of?')
    expect(screen.getByRole('link', { name: 'Book a call' })).toHaveAttribute('href', site.calendly)
  })
  it('shows the mailto link', () => {
    render(<Contact />)
    expect(screen.getByRole('link', { name: site.email })).toHaveAttribute('href', `mailto:${site.email}`)
  })
})
```

- [ ] **Step 2: Run — expect failure**

```bash
npm run test -- Contact
```

Expected: FAIL — cannot resolve `./Contact`.

- [ ] **Step 3: Implement `Contact.tsx`**

```tsx
import { site } from '@/content/site'
import { GlassButton } from '@/components/ui/GlassButton'

export function Contact() {
  return (
    <section className="section section-contact" id="contact">
      <div className="container-1200">
        <div className="contact-panel">
          <div className="contact-blob contact-blob-a" aria-hidden="true" />
          <div className="contact-blob contact-blob-b" aria-hidden="true" />
          <div className="section-head">
            <p className="eyebrow">GET STARTED</p>
            <h2 className="h2-contact">
              Ready for a website you&rsquo;re <span className="gradient-text">proud of?</span>
            </h2>
            <p>
              A free 20-minute chat about your goals. No pressure, no jargon. Pick any time that suits — it
              shows in your timezone.
            </p>
          </div>
          <GlassButton href={site.calendly} variant="solid" external className="btn-book">
            Book a call
          </GlassButton>
          <p className="contact-alt">
            Prefer email? <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
          <p className="contact-alt">
            You&rsquo;ll be talking directly with Andre — the designer behind De Villa. Replies within one
            business day.
          </p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm run test -- Contact
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/src/components/Contact.tsx web/src/components/Contact.test.tsx
git commit -m "feat(web): Contact glass panel with Calendly + mailto"
```

---

### Task 19: `Footer`

**Files:**
- Create: `web/src/components/Footer.tsx`
- Test: `web/src/components/Footer.test.tsx`

- [ ] **Step 1: Write the failing test**

`web/src/components/Footer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Footer } from './Footer'
import { site } from '@/content/site'

describe('Footer', () => {
  it('renders the brand, tagline and email', () => {
    render(<Footer />)
    expect(screen.getByText(site.brand)).toBeInTheDocument()
    expect(screen.getByText(/Websites for health & wellness/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: site.email })).toHaveAttribute('href', `mailto:${site.email}`)
  })
})
```

- [ ] **Step 2: Run — expect failure**

```bash
npm run test -- Footer
```

Expected: FAIL — cannot resolve `./Footer`.

- [ ] **Step 3: Implement `Footer.tsx`**

```tsx
import { site } from '@/content/site'
import { IridescentOrb } from '@/components/ui/IridescentOrb'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-1200 footer-inner">
        <span className="footer-brand">
          <IridescentOrb size={22} /> {site.brand}
        </span>
        <span>Websites for health &amp; wellness · Australia</span>
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm run test -- Footer
```

Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/src/components/Footer.tsx web/src/components/Footer.test.tsx
git commit -m "feat(web): Footer"
```

---

## Phase 5 — Assembly, E2E, verification

### Task 20: Compose the page

**Files:**
- Replace: `web/src/app/page.tsx`
- Test: `web/src/app/page.test.tsx`

- [ ] **Step 1: Write the failing test**

`web/src/app/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Home from './page'

describe('Home page', () => {
  it('renders exactly one H1', () => {
    render(<Home />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })
  it('renders all four anchored sections', () => {
    const { container } = render(<Home />)
    for (const id of ['services', 'work', 'process', 'contact']) {
      expect(container.querySelector(`section#${id}`)).not.toBeNull()
    }
  })
})
```

- [ ] **Step 2: Run — expect failure**

```bash
npm run test -- page
```

Expected: FAIL — current default `page.tsx` has no such sections.

- [ ] **Step 3: Implement `page.tsx`**

```tsx
import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { TrustMarquee } from '@/components/TrustMarquee'
import { Services } from '@/components/Services'
import { SelectedWork } from '@/components/SelectedWork'
import { WhyItMatters } from '@/components/WhyItMatters'
import { Process } from '@/components/Process'
import { Contact } from '@/components/Contact'
import { Footer } from '@/components/Footer'
import { Reveal } from '@/components/ui/Reveal'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TrustMarquee />
        <Reveal>
          <Services />
        </Reveal>
        <Reveal>
          <SelectedWork />
        </Reveal>
        <Reveal>
          <WhyItMatters />
        </Reveal>
        <Reveal>
          <Process />
        </Reveal>
        <Reveal>
          <Contact />
        </Reveal>
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 4: Run unit + build**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design/web"
npm run test && npm run build
```

Expected: all unit tests pass; `next build` writes `out/index.html`.

- [ ] **Step 5: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/src/app/page.tsx web/src/app/page.test.tsx
git commit -m "feat(web): compose homepage from sections with scroll reveals"
```

---

### Task 21: Playwright e2e smoke test

**Files:**
- Create: `web/e2e/home.spec.ts`

- [ ] **Step 1: Write the e2e test**

`web/e2e/home.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test.describe('homepage', () => {
  test('renders the hero, sections, work cards and CTAs', async ({ page }) => {
    await page.goto('/')

    // Exactly one H1, with the headline.
    await expect(page.getByRole('heading', { level: 1 })).toContainText('fill your books.')

    // The four anchored sections exist.
    for (const id of ['services', 'work', 'process', 'contact']) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1)
    }

    // 8 work cards, each linking to /demos/<slug>/.
    const cards = page.locator('a.work-card')
    await expect(cards).toHaveCount(8)
    await expect(cards.first()).toHaveAttribute('href', '/demos/coastal-dental/')

    // Hero primary CTA → Calendly.
    const book = page.getByRole('link', { name: 'Book a free chat' }).first()
    await expect(book).toHaveAttribute('href', /calendly\.com/)

    // Nav anchor scrolls to Contact.
    await page.getByRole('link', { name: 'Contact' }).click()
    await expect(page).toHaveURL(/#contact$/)
  })
})
```

- [ ] **Step 2: Run e2e (Playwright boots the dev server itself)**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design/web"
npm run e2e
```

Expected: 1 test passes. (Demo links 404 under `next dev`, which is fine — the test only checks the `href` attribute, not navigation.)

- [ ] **Step 3: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/e2e
git commit -m "test(web): Playwright homepage smoke test"
```

---

### Task 22: Full verification + /web README + (optional) local demo click-through

**Files:**
- Create: `web/README.md`
- Optional: `web/public/demos/` (local-only copy for click-through)

- [ ] **Step 1: Run the full gate**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design/web"
npm run lint && npm run typecheck && npm run test && npm run build && npm run e2e
```

Expected: lint clean, no TS errors, all unit tests pass, static export to `out/`, e2e passes. Fix anything that fails before continuing.

- [ ] **Step 2: Visual parity check (manual)**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design/web"
npm run dev
```

Open `http://localhost:3000` beside the handoff reference `C:\Users\andre\Downloads\Andre\design_handoff_devilla_website\De Villa Design.html`. Confirm: hero render position + left-edge fade, the blue vs. clear glass buttons, card glass + hover lift, contact panel, gradient headline words, eyebrow teal dot. Note any visual drift and adjust `globals.css` values (these are the tunable spots called out in spec §5/§6).

- [ ] **Step 3: Write `web/README.md`**

```markdown
# De Villa Design — homepage (Next.js)

Static-exported marketing homepage. Light "liquid glass" design (see
`../docs/superpowers/specs/2026-06-14-devilla-nextjs-rebuild-design.md`).

## Commands
- `npm run dev` — local dev at http://localhost:3000
- `npm run build` — static export to `out/`
- `npm run test` / `npm run e2e` — unit (Vitest) / e2e (Playwright)
- `npm run lint` / `npm run typecheck`

## Notes
- Content is typed config in `src/content/`.
- Design tokens + glass classes live in `src/app/globals.css`.
- Demo links point at `/demos/<slug>/` (served from the repo root site). For full
  local click-through, copy the demos into `public/demos/` (see below) — this copy
  is git-ignored and local-only.
- **Deployment is intentionally not wired up.** Prod still serves the repo root.
```

- [ ] **Step 4 (optional): Enable local demo click-through**

Only if you want the work cards to open locally. This copy is local-only:

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
mkdir -p web/public/demos
cp -r demos/*/ web/public/demos/ 2>/dev/null
printf '\nweb/public/demos/\n' >> .gitignore
```

- [ ] **Step 5: Commit**

```bash
cd "/c/Users/andre/OneDrive/Desktop/De Villa Design"
git add web/README.md .gitignore
git commit -m "docs(web): add README; finalize verification"
```

---

## Spec coverage map

| Spec section | Implemented by |
|---|---|
| §2 stack / static export / TS | Task 1 |
| §2 location `/web`, local-only | Task 1, Task 22 |
| §4 structure | Tasks 1, 3–22 |
| §4 fonts (`next/font/local`) | Task 5 |
| §4 icons (`lucide-react`) | Task 16 |
| §4 gitignore | Tasks 1, 22 |
| §5 tokens + type scale | Task 4 |
| §6 glass classes + exact button specs + hero mask | Task 4 |
| §7 components (server + Nav/Reveal islands) | Tasks 7–20 |
| §8 hero (render, mask, drift blobs, CTAs, footer row) | Tasks 4, 12 |
| §9 content (real demo identities, copy) | Task 6; Tasks 14–18 |
| §9 TrustMarquee (optional carry-over) | Task 13 |
| §10 anchors, hover, reveals, reduced motion | Task 4 (CSS), Task 10 (Reveal), Task 20 |
| §11 metadata, JSON-LD, lang, a11y | Task 5; section tasks (roles/alt/aria) |
| §12 build/lint/tsc/unit/e2e + visual parity | Tasks 2, 21, 22 |
| §13 demo-link wrinkle, deploy note | Tasks 6, 22 |

## Notes for the implementer
- **TDD rhythm:** every component/content task is test-first → run-fail → implement → run-pass → commit. Asset/CSS/scaffold tasks verify by `build` since CSS can't be meaningfully unit-tested; visual correctness is the manual parity pass in Task 22.
- **Do not push or change Netlify.** All commits stay local on `feat/web-nextjs-rebuild`.
- **Tailwind version:** Task 4's CSS is version-agnostic except the first `@import`/`@tailwind` line — pick the one matching what Task 1 installed.
- **Server vs client:** only `Nav` and `Reveal` carry `'use client'`. Keep `next/font` usage confined to `layout.tsx` (it is not unit-tested; the build + e2e cover it).
