# Glass rebrand — design spec (12 June 2026)

Approved by Andre: full visual rebrand of devilladesign.com from cream/sage
"Calm & Premium" to pastel glassmorphism, per the three references in
`Website inspiration/` (WaterDropletLayout.jpg, GlassButtons.jpg, ColorThemes.png)
and `Website improvment instructions..txt`. The demo sites get refitted to match
in a follow-up phase.

## 1. Colour retheme (ColorThemes.png)
New token set in `css/style.css` `:root`; everything inherits via existing custom
properties.

| Token | Old | New |
|---|---|---|
| `--cream` (page bg) | #F3EFE9 | pearl ice `#F2F5FA` |
| `--cream-2` (alt band) | #ECE6DB | `#E9EEF4` |
| `--sand` (deep accent bg) | #D8CFBF | `#D6DEF0` |
| `--ink` | #3B3A36 | deep slate `#323848` |
| `--ink-soft` | rgba(59,58,54,.78) | rgba(50,56,72,.78) |
| `--sage` (primary action) | #6B7A5E | periwinkle `#6A74E8` |
| `--sage-dark` (hover/text accent) | #59674E | `#4A53C8` (AA on pearl) |
| `--line` | #E3DDD2 | `#DEE4F0` |
| new `--mint` | — | `#7FD8C8` (secondary accent) |
| new `--pink` | — | `#F0C4E0` (gradient tints only) |

Hero blobs/arch-ring become soft lavender→pink→mint iridescent glows.
Calendly embed params updated to the new primary colour.

## 2. Glass buttons (GlassButtons.jpg)
`.btn` rebuilt as liquid glass: translucent periwinkle gradient fill,
`backdrop-filter: blur(14px) saturate(1.4)`, 1px inner white edge
(inset box-shadow), glossy top highlight (overlay gradient), pill radius,
soft colored drop shadow, white text. Secondary buttons mint variant.
`@supports not (backdrop-filter)` fallback: solid gradient, no blur.

## 3. Scroll-driven droplet animation (WaterDropletLayout.jpg + stock video)
- 4 photoreal droplet sprites (sphere, teardrop, wobble, bead) generated with
  Higgsfield nano-banana + remove_background → `assets/droplets/*.png`
  (transparent). Watermark-free: generated from scratch; the stock clip is
  motion reference only.
- Fixed full-viewport layer behind content (`pointer-events:none`,
  z-index between background and content).
- Initial frame mirrors the reference layout: 1 small, 2 big, 3 medium;
  more droplets staged above the viewport enter as the user scrolls;
  later drops trend smaller.
- Motion: droplet screen-Y is driven by scroll progress (drops fall as you
  scroll down, rise back if you scroll up), rendered with transform-only
  updates in requestAnimationFrame. Wiggle = sinusoidal squash-stretch
  (scaleX up while scaleY down and vice versa) with amplitude proportional
  to recent scroll velocity.
- Pop: when a drop's bottom edge passes the viewport bottom, a one-way burst
  animation — brief stretch, then 5 micro-beads (bead sprite) scatter
  ballistically and fade; the drop does not reappear on scroll-up after popping.
- Accessibility/perf: entire layer skipped under `prefers-reduced-motion`;
  max ~10 active drops desktop, ~5 mobile; sprites lazy-loaded after first paint.

## 4. Implementation shape
- `js/droplets.js` — self-contained engine (config array of drops, scroll
  mapping, wiggle, pop). No changes to `main.js` behaviour.
- `css/style.css` — token swap + `.btn` glass + droplet-layer styles.
- `index.html` — droplet layer div + script tag.

## 5. Process & rollout
- All work on branch `feat/glass-rebrand`; main auto-deploys to production,
  and cold-email prospects land Monday — merge only after the /loop
  3-perspective review (25-yr dev, designer, customer) reaches zero objections.
- Phase 2 (separate): refit the 8 demo sites to harmonise with the new brand.
