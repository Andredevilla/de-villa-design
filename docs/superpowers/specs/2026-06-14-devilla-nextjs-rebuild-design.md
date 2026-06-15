# Design Spec — De Villa Design homepage, Next.js rebuild

**Date:** 2026-06-14
**Status:** Approved (brainstorming) → ready for implementation planning
**Source design:** `C:\Users\andre\Downloads\Andre\design_handoff_devilla_website` (handoff bundle: `README.md`, `De Villa Design.dc.html`, `De Villa Design.html`, `assets/hero-glass.png`)

## 1. Overview & goal

Rebuild the De Villa Design single-page marketing homepage as a **fresh Next.js + Tailwind** application that faithfully reproduces the handoff's **light "liquid glass"** design. De Villa builds calm, conversion-focused websites for **health & wellness businesses in Australia**. Primary conversion goal: **book a free 20-minute intro chat** (via the existing Calendly link).

This is a faithful reproduction of an existing high-fidelity design — not a net-new visual design. Ambiguity is low; the work is correct translation of the handoff into a modern static codebase.

## 2. Decisions locked (from brainstorming)

| Decision | Choice |
|---|---|
| **Action** | Fresh rebuild in a new codebase (not editing the existing vanilla site) |
| **Stack** | Next.js (App Router) + TypeScript + Tailwind CSS, `output: 'export'` (static) |
| **Hero** | **Static** glass render (`hero-glass`) + CSS mask + subtle ambient drift blobs — per the handoff README. The existing animated blob/water-droplet work is **not** carried over (stays in the current repo; may be layered in later as an enhancement). |
| **Styling strategy** | **Approach A:** design tokens as CSS custom properties + Tailwind utilities for layout/type + a few `@layer components` classes for glass surfaces |
| **Location** | New app in **`/web`** subfolder of the existing repo |
| **Theme** | `light` only (the approved theme) |
| **CTAs** | Wired to the real Calendly URL (`https://calendly.com/andre-devilladesign/free-20-minute-chat`) + `mailto:andre@devilladesign.com` |
| **Selected Work** | Uses the **8 real demo screenshots** in `demos/shots/` and links to the existing `/demos/<slug>/` sites |
| **Deployment** | **None now.** App is local-only; prod keeps serving the repo root until Andre explicitly switches the publish dir. (Honors the "deploy only when instructed" rule.) |

## 3. Non-goals / out of scope

- No deployment / Netlify config changes in this work.
- No rebuild of the 8 demo sites — they remain the existing vanilla sites; the homepage only links to them.
- No animated hero (blob field / water droplets) in this build.
- No theme toggle (only `light`); the other three themes are ignored.
- No backend, CMS, or data fetching — content is static typed config.
- No scheduler embed/modal — CTAs open the existing Calendly link in a new tab.

## 4. Project structure

```
web/
  package.json
  next.config.ts          # output:'export', images.unoptimized:true, trailingSlash:true
  tsconfig.json
  tailwind.config.ts      # theme palette mapped to the CSS-var tokens
  postcss.config.mjs
  eslint config
  public/
    hero-glass.webp       # exported from assets/hero-glass.png (+ .png fallback)
    work/
      coastal-dental.webp  truenorth-chiro.webp  lumiere-skin.webp  form-pilates.webp
      stillpoint-massage.webp  serenity-physio.webp  bloom-yoga.webp  solace-springs.webp
    og-image.jpg          # ported from existing assets/og-image.jpg
  src/
    app/
      layout.tsx          # <html lang="en-AU">, next/font/local, Metadata API, JSON-LD, globals.css
      page.tsx            # composes sections in order
      globals.css         # :root tokens · base · @layer components (glass surfaces)
    components/
      Nav.tsx             # client island (mobile toggle)
      Hero.tsx
      TrustMarquee.tsx    # OPTIONAL carry-over (see §9)
      Services.tsx
      SelectedWork.tsx
      WhyItMatters.tsx
      Process.tsx
      Contact.tsx
      Footer.tsx
      ui/
        GlassButton.tsx   # variant: 'blue' | 'clear' | 'solid'
        GlassCard.tsx
        Eyebrow.tsx
        SectionHead.tsx
        IridescentOrb.tsx
        Reveal.tsx        # client island (IntersectionObserver fade-up)
    content/
      site.ts             # brand, nav links, contact, hero copy, metadata
      services.ts
      work.ts             # the 8 demo cards
      whys.ts
      process.ts
```

**Tooling notes**
- `next.config.ts`: `output: 'export'` (static HTML to `web/out/`), `images: { unoptimized: true }` (static export has no image-optimization server), `trailingSlash: true` (clean static paths + matches `/demos/<slug>/` style).
- **Fonts:** `next/font/local` referencing the existing `fonts/hanken-grotesk-variable.woff2` (copied into `web/`), weights 300–800. Self-hosted, zero-CLS, no external request.
- **Icons:** `lucide-react` for the Why-It-Matters glyphs (replaces the placeholder `↑ ✓ ◎`): Booking built in → `CalendarCheck`; Designed to earn trust → `ShieldCheck`; Found on Google → `Search`.
- **Gitignore (root `.gitignore`):** add `web/node_modules`, `web/.next`, `web/out`.

## 5. Design tokens (LIGHT theme — verbatim from handoff)

Defined as CSS custom properties in `globals.css :root`; Tailwind theme references them.

```
--bg0:#f3f6f9;  --bg1:#e8eef4;
--ink:#1b2028;  --soft:rgba(27,32,40,.6);  --faint:rgba(27,32,40,.4);
--navbrd:rgba(20,30,45,.07);  --brd:rgba(20,30,45,.09);  --hi:rgba(255,255,255,.9);
--glass:rgba(255,255,255,.52);  --glass2:rgba(255,255,255,.72);
--aa:#6f95e0;  /* periwinkle (primary accent) */
--ab:#b48ff0;  /* violet */
--ac:#3bb6c2;  /* teal (eyebrows, dot) */
--ad:#f0a878;  /* amber */
--btn:#1b2028;  --btnk:#ffffff;
```

- **Page background:** `radial-gradient(120% 90% at 70% 0%, #e8eef4 0%, #f3f6f9 60%)`.
- **Iridescent conic** (orbs, step numbers): `conic-gradient(from 160deg,#3bb6c2,#b48ff0,#f0a878,#6f95e0,#3bb6c2)`.
- **Headline gradient** (`.gradient-text`): `linear-gradient(100deg,#6f95e0,#b48ff0,#3bb6c2)` clipped to text.

**Typography** (Hanken Grotesk, fallback `system-ui, sans-serif`):
- H1 hero: `clamp(40px,6.2vw,82px)`, w500, lh1.02, ls −0.025em.
- H2 section: `clamp(30px,4.4vw,52px)`, w500, lh1.06, ls −0.02em. H2 contact: `clamp(32px,5vw,62px)`.
- H3 card titles: 20–25px, w600.
- Hero lead: `clamp(16px,1.5vw,19.5px)`; body 15.5–17.5px; lh ~1.6; color `--soft`.
- Eyebrow: 11.5px, w600, ls .22em, color `--ac`; hero eyebrow prefixed with a glowing teal dot.
- Nav links: 14.5px, w500, opacity .72→1 on hover.

**Spacing / radius / shadow**
- Content max-width **1200px**, side padding 24px.
- Section vertical padding `clamp(60px,8vw,100px)`; Services taller `clamp(80px,11vw,140px)`.
- Radii: cards 20–24px; pills/buttons 100px; contact card 32px; icon tile 14px.
- Glass surface base: `backdrop-filter: blur(18–26px) saturate(1.4–1.6)`, border `--brd`, inset top highlight `inset 0 1px 0 var(--hi)`. Card drop shadow tuned **down** for the silver bg (~`0 24px 60px rgba(0,0,0,.12)`, not the prototype's `.3`).

## 6. `@layer components` glass classes

Named classes encapsulate the multi-value effects so markup stays readable:
- `.nav-pill` — `--glass2` fill, blur(18px) saturate(1.5), 1px `--navbrd`, radius 100px.
- `.glass-card` — `--glass` fill, blur+saturate, border `--brd`, inset highlight, tuned shadow; hover `translateY(-6px)`.
- `.btn-glass-blue` (hero primary) — exact spec:
  `color:#23407a; background:linear-gradient(160deg,rgba(111,149,224,.42),rgba(111,149,224,.16)); border:1px solid rgba(255,255,255,.7); backdrop-filter:blur(8px) saturate(1.6); padding:16px 32px; border-radius:100px; box-shadow:inset 0 1.5px 0 rgba(255,255,255,.85), inset 0 -10px 22px rgba(111,149,224,.22), 0 14px 32px rgba(60,90,160,.28);`
  Hover: fill → `(.54)/(.26)`, `translateY(-2px)`.
- `.btn-glass-clear` (hero secondary) — exact spec:
  `color:#1b2028; background:linear-gradient(160deg,rgba(255,255,255,.13),rgba(255,255,255,.03)); border:1px solid rgba(255,255,255,.66); backdrop-filter:blur(4px) saturate(1.5); padding:16px 32px; border-radius:100px; box-shadow:inset 0 1.5px 0 rgba(255,255,255,.9), inset 0 -10px 22px rgba(255,255,255,.16), inset 0 1px 12px rgba(120,150,200,.08), 0 14px 34px rgba(31,49,74,.16);`
  Hover: fill → `(.22)/(.07)`, lift. (Low 4px blur is intentional so the hero glass disk shows through.)
- `.btn-solid` (contact "Book a call", nav "Book a free chat") — `--btn` fill, `--btnk` text, radius 100px, subtle gloss + shadow; hover lift. (Optional consistency tweak available: nav button may use `btn-glass-blue` instead.)
- `.icon-tile` — 46px glass tile (radius 14px) holding a teal lucide glyph.
- `.orb` — conic-gradient circle (brand 26px, footer, process step 40px).
- `.gradient-text` — headline gradient clipped to text.
- `.hero-mask` — `mask-image: linear-gradient(to right,transparent 4%,#000 44%,#000 100%), linear-gradient(to bottom,#000 76%,transparent 99%); mask-composite: intersect;` with `-webkit-` prefixes; `background-position:74% 40%; background-size:cover`.

## 7. Components (one clear purpose each)

Sections are presentational, reading copy from `content/`. **Server components** by default. **Client islands:** `Nav` (mobile menu toggle) and `Reveal` (IntersectionObserver). `TrustMarquee` is pure CSS animation (no JS).

- **Nav** — fixed centered `.nav-pill` (max-w 1200px). Left: `IridescentOrb` + "DE VILLA DESIGN" wordmark (→ `#top`). Center: Services · Work · Process · Contact (anchor links). Right: "Book a free chat" (`btn-solid` → Calendly). Mobile hamburger toggle.
- **Hero** (`#top`, the brand-link scroll target) — see §8.
- **TrustMarquee** — optional (§9).
- **Services** (`#services`) — `SectionHead` + 3 `GlassCard`s, each with a violet number (01/02/03), H3, description.
- **SelectedWork** (`#work`) — `SectionHead` + "Browse all eight demos →" (`GlassButton` clear, → `/demos/`) + grid of 8 cards (4:3 screenshot, name + "↗", category), `auto-fit minmax(250px,1fr)`, gap 18px.
- **WhyItMatters** (no id) — `SectionHead` + 3 columns, each `icon-tile` (lucide glyph) + H3 + description.
- **Process** (`#process`) — `SectionHead` + 4 `GlassCard`s, each with a 40px conic `IridescentOrb` number, H3, description.
- **Contact** (`#contact`) — one large centered glass panel (radius 32px, `--glass2`, blur 26px) with two faint drift blobs inside; `SectionHead` (gradient on "proud of?") + "Book a call" (`btn-solid` → Calendly) + email mailto + the "You'll be talking directly with Andre…" reassurance line.
- **Footer** — hairline top border, `IridescentOrb` + "DE VILLA DESIGN" + "Websites for health & wellness · Australia" + email link.

**`ui/` primitives:** `GlassButton` (variants `blue`/`clear`/`solid`, renders `<a>`), `GlassCard`, `Eyebrow` (teal label, optional leading dot), `SectionHead` (eyebrow + H2 + lead), `IridescentOrb` (size prop, optional number child), `Reveal` (wraps children, fades them up on scroll).

## 8. Hero spec

Layers back-to-front:
1. Page radial-gradient background.
2. **Ambient drift blobs** — 2–3 low-opacity blurred radial color blobs (periwinkle/violet/amber, ~520–560px, blur 70–80px), slow `drift` keyframes (22–30s). Disabled under reduced motion.
3. **`hero-glass` render** — `<div>` with `background-image: url(/hero-glass.webp)` + `.hero-mask` (see §6). WebP (PNG fallback), loaded eager/high priority (above the fold). **Under ~720px** reduce opacity / reposition so text stays legible.

Content column (max-w 600px, top padding ~150px):
- Eyebrow: teal dot + **"WEBSITES FOR HEALTH & WELLNESS · AUSTRALIA"**.
- H1: **"Calm, beautiful websites that fill your books."** — last three words (`fill your books.`) use `.gradient-text`.
- Lead: "For clinics, studios and practitioners who want to look as good online as the care they give."
- Two buttons (gap 14px): **"Book a free chat"** (`btn-glass-blue` → Calendly) · **"See recent work →"** (`btn-glass-clear` → `#work`).
- Hero footer row (pushed to bottom): faint **"01"** numeral + "Dental · Chiro · Med spa / Pilates · Massage · Physio"; right side italic-tone line: "De Villa builds calm, conversion-ready websites for the people who keep Australia well — your canvas, beautifully done."

## 9. Content model (typed config — actual copy)

**`services.ts`** — eyebrow "SERVICES", H2 "What I can do for you", lead "I specialise in websites for health & wellness businesses — so yours converts from day one."
1. **New websites** — "A complete website designed and built from scratch — structure, design and build, ready to win bookings from day one."
2. **Redesigns** — "Already have a site that isn't pulling its weight? I'll turn it into one that earns trust and converts visitors into clients."
3. **Care & updates** — "Hosting, content changes and small improvements handled for you, so your site stays fresh while you stay focused on clients."

**`work.ts`** — eyebrow "SELECTED WORK", H2 "See the standard for yourself", lead "Eight complete concept sites I designed and built — open one and explore exactly what I'd build for a business like yours." Cards `{ name, category, href, shot, alt }`, using **real demo identities**:

| # | name | category | href | shot |
|---|---|---|---|---|
| 1 | Coastal Dental | Dental practice | `/demos/coastal-dental/` | `/work/coastal-dental.webp` |
| 2 | True North Chiropractic | Chiropractic | `/demos/truenorth-chiro/` | `/work/truenorth-chiro.webp` |
| 3 | Lumière Skin & Laser | Med spa | `/demos/lumiere-skin/` | `/work/lumiere-skin.webp` |
| 4 | FORM Pilates Studio | Reformer Pilates | `/demos/form-pilates/` | `/work/form-pilates.webp` |
| 5 | Still Point Massage | Remedial massage | `/demos/stillpoint-massage/` | `/work/stillpoint-massage.webp` |
| 6 | Serenity Physio | Physiotherapy | `/demos/serenity-physio/` | `/work/serenity-physio.webp` |
| 7 | Bloom Yoga Studio | Yoga studio | `/demos/bloom-yoga/` | `/work/bloom-yoga.webp` |
| 8 | Solace Springs Retreat | Wellness retreat | `/demos/solace-springs/` | `/work/solace-springs.webp` |

(Screenshots sourced from `demos/shots/<slug>.webp`. `alt` e.g. "Coastal Dental — concept website".)

**`whys.ts`** — eyebrow "WHY IT MATTERS", H2 "More than pretty — built to grow your practice":
- **Booking built in** — "Online booking and clear calls-to-action wired into every page, so visitors can become clients on the spot."
- **Designed to earn trust** — "Look established and professional from the very first glance — the way good care deserves."
- **Found on Google** — "Local SEO foundations so nearby clients can actually find you."

**`process.ts`** — eyebrow "HOW IT WORKS", H2 "A simple, calm process", lead "No jargon, no surprises — you'll know exactly where things stand at every step.":
1. **Chat** — "A free 20-minute call about your goals."
2. **Design** — "I craft the look and structure for your approval."
3. **Build** — "Your site is built, tested and refined."
4. **Launch** — "Live, handed over, and cared for."

**Contact** — eyebrow "GET STARTED", H2 "Ready for a website you're proud of?" (gradient on "proud of?"), lead "A free 20-minute chat about your goals. No pressure, no jargon. Pick any time that suits — it shows in your timezone."

**TrustMarquee (OPTIONAL, carry-over):** Not in the handoff — the handoff folds categories into the hero footer row. The current site has a rotating industry marquee linking to the 8 demos. Including it (placed after the hero) is a nice interactive demo-linker; it can be dropped for strict fidelity. **Default: include it**, flagged as an additive enhancement, since it was in the approved component list.

## 10. Interactions & behavior

- **Anchors:** native `href="#id"` + CSS `scroll-behavior:smooth` + `scroll-margin-top:72px` on sections (fixed-nav offset). No scroll-JS library.
- **Hover:** buttons lift `translateY(-2px)` (deeper shadow); cards `translateY(-6px)`; nav links opacity `.72→1`.
- **Ambient drift:** CSS keyframes (22–30s) on hero + contact blobs.
- **Scroll reveals:** `Reveal` (IntersectionObserver) — fade + `translateY(28px)→0`, ~0.8s `cubic-bezier(.2,.75,.25,1)`. **Progressive enhancement:** content renders *visible*; it only animates if the observer attaches (no-JS = nothing hidden).
- **Reduced motion:** drift + reveals disabled globally under `prefers-reduced-motion`.
- **Nav:** mobile hamburger toggles the link list (client island).

## 11. Accessibility & SEO

- Semantic landmarks (`header/nav/main/section/footer`), single H1, ordered headings.
- **Metadata API** (layout.tsx) ports the existing `<head>`: title "De Villa Design — Websites for Health & Wellness Businesses in Australia", description, OG title/description/type/url/image/locale `en_AU`, canonical `https://devilladesign.com`, `themeColor`, the SVG favicon.
- **JSON-LD `ProfessionalService`** ported verbatim from the current site.
- Hero render decorative → `alt=""`. Work screenshots → meaningful alt. `focus-visible` on every interactive element. Body/`--soft` text held at WCAG **AA** on the silver bg.
- Calendly links `target="_blank" rel="noopener"`; email via `mailto:`.

## 12. Testing & verification (proportionate to a static page)

- **Build gates:** `next build` (static export), `eslint`, `tsc --noEmit` all clean.
- **Playwright smoke test:** page renders; exactly one H1; all main sections present (hero, services, work, why-it-matters, process, contact, footer); the four nav anchors (`#services`/`#work`/`#process`/`#contact`) each resolve to a section; 8 work cards render with images + correct demo links; hero CTAs resolve to the Calendly URL.
- **Visual parity:** compare against the handoff standalone `De Villa Design.html` (hero, the two glass buttons, cards, contact panel).
- **Local run + screenshot** to confirm before anything ships — **local only, no deploy**.
- Optional: axe a11y check + Lighthouse pass (perf/SEO/a11y).

## 13. Integration notes & open items

- **Demo links:** the homepage links to `/demos/<slug>/` (relative), which resolves on the integrated/deployed site but **not** when previewing `/web` alone on `localhost:3000`. Default: keep relative links; **optionally** copy the 8 demos into `web/public/demos/` if full local click-through is wanted.
- **Switch-over (future, on instruction only):** to make the new app prod, Netlify build must run `next build` and publish `web/out`, with the `/demos/` sites included in the published output. Not part of this work.
- **Hero asset:** export `assets/hero-glass.png` → optimized WebP for `web/public/hero-glass.webp` (keep PNG fallback).
