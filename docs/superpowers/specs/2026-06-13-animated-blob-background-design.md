# Animated jelly-blob background — design spec (13 June 2026)

Approved by Andre. Replaces the static Light Frost **aurora** colour field with a
living, cursor-reactive field of soft jelly-like colour blobs, kept **under** the
existing frosted-glass pane. Source idea: `Animation Idea Background filled wi.txt`.

## Goal
A full-screen background of soft, palette-coloured blobs that gently float and
morph (jellyfish-like), flee the cursor within a small radius, wobble harder as the
cursor nears, and shove their neighbours in a domino chain — all seen *through* the
existing frost veil so it reads as a moving aurora behind glass and keeps text legible.

## Decisions (locked)
- **Layering: A** — blobs are the moving colour field UNDER the frost pane. If the
  frost ends up fighting the look, removing the frost is a later option (not now).
- **Mobile: calm drift** — no cursor interaction on touch devices; blobs still float
  and wobble gently. Full cursor interaction on desktop only.
- **Renderer: Canvas 2D** with soft radial-gradient blobs. No new dependencies.

## Architecture & layering
New self-contained `js/blobs.js` (IIFE, same pattern as the retired droplets.js),
loaded with `defer` after `main.js`. Draws to one `<canvas id="blob-field">`.

Layer stack, bottom → top:
1. pearl page colour — `--cream` on `html` (already there).
2. `#blob-field` canvas — `position:fixed; inset:0; pointer-events:none; z-index:-2`.
3. `.bg-frost` pane — existing frosted-glass veil, `z-index:-1` (kept).
4. page content (`body { isolation:isolate }` already establishes the stacking context).

The static `.bg-aurora` element and its CSS are **removed** — the canvas now provides
the colour field. `.bg-frost` and its SVG `#lf-glass-distortion` filter stay.
Cursor tracked via a `window` `mousemove` listener (works despite `pointer-events:none`
on the canvas).

## Physics model (per requestAnimationFrame, delta-timed)
Each blob: `{ anchorX, anchorY, x, y, vx, vy, r, color, wobble phases }`.

1. **Drift** — slow wander offset around a spread-out anchor; a soft spring pulls the
   blob back toward its anchor so the field never clumps or leaves the screen.
2. **Jelly morph** — drawn shape is a wobbling closed path: radius varies by angle via
   two slow sine terms, e.g. `r(θ,t) = R · (1 + a·sin(3θ + t) + b·sin(2θ − 0.7t))`.
   Wobble amplitude has a calm baseline and ramps up with cursor proximity.
3. **Cursor repulsion** — within `cursorRadius` (~100px), a force pushes the blob away
   from the cursor, stronger the closer it is, applied to velocity and **speed-capped**
   so it eases away rather than snapping.
4. **Domino via separation** — a gentle min-gap force keeps blobs ~30px apart (surface
   distance). A cursor-shoved blob therefore pushes its neighbour, which pushes the
   next — the domino emerges from the spacing rule; no separate system needed.
   O(N²) pairwise at N≈14 is trivial.
5. **Damping + speed caps** — friction each frame plus a max speed keep motion smooth
   and settling; blobs re-spread via the anchor spring once the cursor leaves.

## Look & frost integration
- Blobs are radial gradients (palette colour at centre → transparent at edge) at gentle
  opacity, drawn over the pearl base. Palette: periwinkle `#6A74E8`, pink `#F0C4E0`,
  mint `#7FD8C8`, plus a lavender variant.
- Soft edges come from the gradient itself (no expensive canvas blur).
- `.bg-frost` starts with a small `backdrop-filter: blur(~4px)` so blobs read as truly
  frosted; if that costs too much over a moving canvas, drop the backdrop blur and rely
  on gradient softness + the existing 0.3 white veil.
- Canvas scaled for `devicePixelRatio` (capped at 2 desktop / 1.5 mobile) for crispness
  without overdraw.

## Mobile & accessibility
- **Mobile / coarse pointer** (`matchMedia('(hover: none)')`): no cursor listener,
  ~8 blobs (vs ~14 desktop), DPR capped 1.5, calm drift + gentle wobble + separation only.
- **prefers-reduced-motion: reduce**: render ONE static arrangement of blobs (no rAF
  loop) — colourful but motionless.
- Animation loop pauses on `document.hidden` (visibilitychange) and resumes on return.

## Performance budget
~14 blobs desktop / ~8 mobile, single canvas, transform-free full redraw per frame,
delta-timed rAF, DPR-capped, paused when tab hidden, no dependencies. Target steady
60fps desktop, smooth on mid-range phones.

## Tunable constants (top of blobs.js)
`BLOB_COUNT` (desktop/mobile), radius range, `PALETTE`, `CURSOR_RADIUS` (~100),
`MIN_GAP` (~30), `MAX_SPEED`, drift speed, wobble amplitude (base + cursor-boost),
`SPRING` strength, `DAMPING`, base opacity. Tuned by eye after first live view.

## Files
- **New:** `js/blobs.js`.
- **`index.html`:** add `<canvas id="blob-field" aria-hidden="true">` as the first body
  layer; add `<script src="js/blobs.js" defer>`; remove the `.bg-aurora` div (keep
  `.bg-frost` + the SVG filter defs).
- **`css/style.css`:** add `#blob-field` styles; remove the `.bg-aurora` rule; set the
  `.bg-frost` backdrop-blur value.

## Rollout
Built on branch `feat/animated-blob-background`. Verified live on localhost (motion is
eyeballed, not screenshotted — screenshots only confirm a static frame and layering).
Andre reviews it live before keeping. Deployed via the manual Netlify CLI path (the
GitHub→Netlify auto-deploy is still blocked by the unrecognized-contributor restriction).

## Out of scope
- Touch-drag interaction on mobile (decided against — conflicts with scroll).
- Metaball merging / WebGL renderer.
- Changing the palette (kept as-is for now; revisit only if it looks off).
- Removing the frost (only if it visibly fights the effect after review).
