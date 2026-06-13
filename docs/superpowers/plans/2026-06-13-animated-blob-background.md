# Animated Jelly-Blob Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static Light Frost aurora with a living field of soft, palette-coloured jelly blobs that drift and morph, flee the cursor with a domino chain on desktop, drift calmly on mobile, and sit under the existing frost pane.

**Architecture:** Pure, deterministic physics functions live in an ES module (`js/blob-physics.mjs`) and are unit-tested with Node's built-in test runner. A browser entry module (`js/blobs.js`, loaded as `<script type="module">`) owns the canvas, blob state, render loop, input, and degradation (mobile/reduced-motion). The blobs draw to one fixed full-viewport `<canvas>` at z-index −2; the existing `.bg-frost` pane stays at z-index −1; the static `.bg-aurora` is removed.

**Tech Stack:** Vanilla JS (ES modules), Canvas 2D, Node built-in `node:test` for unit tests, headless Chrome for DOM/static-frame verification.

**Spec:** `docs/superpowers/specs/2026-06-13-animated-blob-background-design.md`
**Branch:** `feat/animated-blob-background` · **Deploy:** manual Netlify CLI (`netlify deploy --prod --dir=<git-archive of main>`).

---

### Task 1: Physics module — `clamp` and `lerp`

**Files:**
- Create: `js/blob-physics.mjs`
- Test: `tests/blob-physics.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// tests/blob-physics.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clamp, lerp } from '../js/blob-physics.mjs';

test('clamp keeps value within bounds', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-3, 0, 10), 0);
  assert.equal(clamp(99, 0, 10), 10);
});

test('lerp interpolates linearly', () => {
  assert.equal(lerp(0, 10, 0), 0);
  assert.equal(lerp(0, 10, 1), 10);
  assert.equal(lerp(0, 10, 0.5), 5);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/blob-physics.test.mjs`
Expected: FAIL — cannot find module `../js/blob-physics.mjs` (or export missing).

- [ ] **Step 3: Write minimal implementation**

```js
// js/blob-physics.mjs
// Pure, deterministic helpers for the blob background. No DOM access — unit-testable.

export const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);

export const lerp = (a, b, t) => a + (b - a) * t;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/blob-physics.test.mjs`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add js/blob-physics.mjs tests/blob-physics.test.mjs
git commit -m "feat: blob-physics clamp + lerp with tests"
```

---

### Task 2: Physics — `wobbleRadius` (jelly morph)

**Files:**
- Modify: `js/blob-physics.mjs`
- Test: `tests/blob-physics.test.mjs`

- [ ] **Step 1: Write the failing test**

Append to `tests/blob-physics.test.mjs`:

```js
import { wobbleRadius } from '../js/blob-physics.mjs';

test('wobbleRadius returns base radius when amplitude is zero', () => {
  assert.equal(wobbleRadius(100, 1.2, 3.4, 0), 100);
});

test('wobbleRadius stays within +/- amplitude of base radius', () => {
  const base = 100, amp = 0.2;
  for (let a = 0; a < Math.PI * 2; a += 0.3) {
    const r = wobbleRadius(base, a, 5, amp);
    assert.ok(r >= base * (1 - amp) - 1e-9 && r <= base * (1 + amp) + 1e-9,
      `radius ${r} out of range at angle ${a}`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/blob-physics.test.mjs`
Expected: FAIL — `wobbleRadius` is not exported.

- [ ] **Step 3: Write minimal implementation**

Append to `js/blob-physics.mjs`:

```js
// Radius at a given angle for the jellyfish morph. Two sine terms weighted 0.6/0.4
// sum to amplitude 1.0, so the result stays within base * (1 ± amp).
export function wobbleRadius(baseR, angle, t, amp) {
  const w = Math.sin(3 * angle + t) * 0.6 + Math.sin(2 * angle - 0.7 * t) * 0.4;
  return baseR * (1 + amp * w);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/blob-physics.test.mjs`
Expected: PASS (4 tests total).

- [ ] **Step 5: Commit**

```bash
git add js/blob-physics.mjs tests/blob-physics.test.mjs
git commit -m "feat: blob-physics wobbleRadius (jelly morph) with tests"
```

---

### Task 3: Physics — `repulsionForce` (cursor)

**Files:**
- Modify: `js/blob-physics.mjs`
- Test: `tests/blob-physics.test.mjs`

- [ ] **Step 1: Write the failing test**

Append to `tests/blob-physics.test.mjs`:

```js
import { repulsionForce } from '../js/blob-physics.mjs';

test('repulsionForce is zero outside the radius', () => {
  const f = repulsionForce(200, 0, 0, 0, 100, 50); // dist 200 > radius 100
  assert.deepEqual(f, { fx: 0, fy: 0 });
});

test('repulsionForce pushes away from cursor and is stronger when closer', () => {
  const near = repulsionForce(10, 0, 0, 0, 100, 50);  // blob right of cursor, close
  const far = repulsionForce(80, 0, 0, 0, 100, 50);   // blob right of cursor, far
  assert.ok(near.fx > 0, 'pushes in +x away from cursor');
  assert.equal(near.fy, 0);
  assert.ok(near.fx > far.fx, 'closer blob gets a stronger push');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/blob-physics.test.mjs`
Expected: FAIL — `repulsionForce` is not exported.

- [ ] **Step 3: Write minimal implementation**

Append to `js/blob-physics.mjs`:

```js
// Push a blob centre (bx,by) away from the cursor (cx,cy) if within `radius`.
// Falloff is linear: full strength at the cursor, zero at the radius edge.
export function repulsionForce(bx, by, cx, cy, radius, strength) {
  const dx = bx - cx, dy = by - cy;
  const dist = Math.hypot(dx, dy);
  if (dist >= radius || dist === 0) return { fx: 0, fy: 0 };
  const falloff = (radius - dist) / radius;
  const f = strength * falloff;
  return { fx: (dx / dist) * f, fy: (dy / dist) * f };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/blob-physics.test.mjs`
Expected: PASS (6 tests total).

- [ ] **Step 5: Commit**

```bash
git add js/blob-physics.mjs tests/blob-physics.test.mjs
git commit -m "feat: blob-physics repulsionForce with tests"
```

---

### Task 4: Physics — `separationForce` (min-gap + domino)

**Files:**
- Modify: `js/blob-physics.mjs`
- Test: `tests/blob-physics.test.mjs`

- [ ] **Step 1: Write the failing test**

Append to `tests/blob-physics.test.mjs`:

```js
import { separationForce } from '../js/blob-physics.mjs';

test('separationForce is zero when blobs are far apart', () => {
  // centres 500 apart, radii 50+50, gap 30 -> target 130 < 500
  const f = separationForce(0, 0, 50, 500, 0, 50, 30, 40);
  assert.deepEqual(f, { fx: 0, fy: 0 });
});

test('separationForce pushes overlapping blobs apart', () => {
  // centres 100 apart, radii 50+50, gap 30 -> target 130 > 100 -> push
  const f = separationForce(0, 0, 50, 100, 0, 50, 30, 40);
  assert.ok(f.fx < 0, 'blob A pushed in -x, away from B which is at +x');
  assert.equal(f.fy, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/blob-physics.test.mjs`
Expected: FAIL — `separationForce` is not exported.

- [ ] **Step 3: Write minimal implementation**

Append to `js/blob-physics.mjs`:

```js
// Keep two blobs at least `minGap` apart (surface-to-surface). When they get
// closer than that, push them apart proportional to the overlap. Run pairwise,
// this also produces the domino: a shoved blob pushes its neighbours.
export function separationForce(ax, ay, ar, bx, by, br, minGap, strength) {
  const dx = ax - bx, dy = ay - by;
  const dist = Math.hypot(dx, dy);
  const target = ar + br + minGap;
  if (dist >= target || dist === 0) return { fx: 0, fy: 0 };
  const overlap = (target - dist) / target;
  const f = strength * overlap;
  return { fx: (dx / dist) * f, fy: (dy / dist) * f };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/blob-physics.test.mjs`
Expected: PASS (8 tests total).

- [ ] **Step 5: Commit**

```bash
git add js/blob-physics.mjs tests/blob-physics.test.mjs
git commit -m "feat: blob-physics separationForce (domino) with tests"
```

---

### Task 5: Physics — `integrate` (spring, damping, speed cap)

**Files:**
- Modify: `js/blob-physics.mjs`
- Test: `tests/blob-physics.test.mjs`

- [ ] **Step 1: Write the failing test**

Append to `tests/blob-physics.test.mjs`:

```js
import { integrate } from '../js/blob-physics.mjs';

test('integrate accelerates a blob toward its anchor', () => {
  const b = { anchorX: 100, anchorY: 0, x: 0, y: 0, vx: 0, vy: 0 };
  integrate(b, 1 / 60, { spring: 4, damping: 0.9, maxSpeed: 1000 });
  assert.ok(b.vx > 0, 'velocity points toward anchor (+x)');
  assert.ok(b.x > 0, 'position advances toward anchor');
});

test('integrate caps speed at maxSpeed', () => {
  const b = { anchorX: 0, anchorY: 0, x: 0, y: 0, vx: 5000, vy: 0 };
  integrate(b, 1 / 60, { spring: 0, damping: 1, maxSpeed: 60 });
  assert.ok(Math.hypot(b.vx, b.vy) <= 60 + 1e-9, 'speed is capped');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/blob-physics.test.mjs`
Expected: FAIL — `integrate` is not exported.

- [ ] **Step 3: Write minimal implementation**

Append to `js/blob-physics.mjs`:

```js
// Advance one blob by dt seconds: spring toward anchor, apply frame-rate-independent
// damping, cap speed, then move. Mutates and returns the blob.
export function integrate(blob, dt, { spring, damping, maxSpeed }) {
  blob.vx += (blob.anchorX - blob.x) * spring * dt;
  blob.vy += (blob.anchorY - blob.y) * spring * dt;
  const d = Math.pow(damping, dt * 60);
  blob.vx *= d;
  blob.vy *= d;
  const sp = Math.hypot(blob.vx, blob.vy);
  if (sp > maxSpeed) {
    blob.vx = (blob.vx / sp) * maxSpeed;
    blob.vy = (blob.vy / sp) * maxSpeed;
  }
  blob.x += blob.vx * dt;
  blob.y += blob.vy * dt;
  return blob;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/blob-physics.test.mjs`
Expected: PASS (10 tests total).

- [ ] **Step 5: Commit**

```bash
git add js/blob-physics.mjs tests/blob-physics.test.mjs
git commit -m "feat: blob-physics integrate (spring/damping/speed-cap) with tests"
```

---

### Task 6: HTML + CSS scaffold (canvas in, aurora out)

**Files:**
- Modify: `index.html` (the body background layers + script tags)
- Modify: `css/style.css` (the `.bg-aurora` / `.bg-frost` block, add `#blob-field`)

- [ ] **Step 1: Add the canvas and remove the aurora div in `index.html`**

Find this block (just inside `<body>`):

```html
<body>
<!-- Light Frost liquid-glass background: aurora colour field distorted by the
     frost pane's SVG displacement filter (Essential Blocks "Light Frost" recipe) -->
<div class="bg-aurora" aria-hidden="true"></div>
<div class="bg-frost" aria-hidden="true"></div>
```

Replace it with (drop `.bg-aurora`, add the canvas before the frost):

```html
<body>
<!-- Animated jelly-blob colour field, drawn under the Light Frost pane -->
<canvas class="bg-blobs" id="blob-field" aria-hidden="true"></canvas>
<div class="bg-frost" aria-hidden="true"></div>
```

- [ ] **Step 2: Change the blobs script tag**

Find:

```html
  <script src="js/main.js" defer></script>
```

Replace with (add the module entry after main.js):

```html
  <script src="js/main.js" defer></script>
  <script type="module" src="js/blobs.js"></script>
```

- [ ] **Step 3: Update CSS — remove `.bg-aurora`, add `#blob-field`, set frost blur**

In `css/style.css`, find the `.bg-aurora` rule:

```css
/* colour field the frost refracts: brand lavender / pink / mint glows */
.bg-aurora {
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background:
    radial-gradient(52% 62% at 12% 18%, rgba(122, 130, 240, 0.62), transparent 72%),
    radial-gradient(48% 58% at 88% 12%, rgba(240, 184, 220, 0.72), transparent 72%),
    radial-gradient(55% 65% at 78% 82%, rgba(127, 216, 200, 0.58), transparent 72%),
    radial-gradient(50% 60% at 22% 88%, rgba(132, 120, 246, 0.5), transparent 72%),
    var(--cream);
}
```

Replace it with:

```css
/* moving colour field: the blob canvas (drawn by js/blobs.js) */
.bg-blobs {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
  pointer-events: none;
  display: block;
}
```

Then find the `.bg-frost` rule and change its backdrop blur from `0px` to `4px`:

```css
  -webkit-backdrop-filter: blur(0px);
  backdrop-filter: blur(0px);
```

becomes:

```css
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
```

- [ ] **Step 4: Verify the page still loads with the canvas present and aurora gone**

Run (PowerShell):
```
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --dump-dom "http://localhost:4173/" > "$env:TEMP\dom.html"
```
Then check:
```
Select-String -Path "$env:TEMP\dom.html" -Pattern 'id="blob-field"'   # expect 1 match
Select-String -Path "$env:TEMP\dom.html" -Pattern 'bg-aurora'         # expect 0 matches
```
(If the local server isn't running: `npx -y serve -l 4173 .` in the repo root first.)
Expected: canvas present, no aurora. Page renders pearl background (canvas empty until Task 7).

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: add blob canvas layer, retire static aurora, raise frost blur"
```

---

### Task 7: Blob entry — init + static render + reduced-motion

**Files:**
- Create: `js/blobs.js`

This task produces a *static* frame of blobs (no animation loop yet) and the
reduced-motion path. Motion is added in Task 8.

- [ ] **Step 1: Write `js/blobs.js`**

```js
// js/blobs.js — animated jelly-blob background (entry module).
// Pure maths live in ./blob-physics.mjs (unit-tested); this file owns the canvas,
// blob state, rendering, input, and degradation.
import { wobbleRadius } from './blob-physics.mjs';

(() => {
  const canvas = document.getElementById('blob-field');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // ---- tunables (spec §"Tunable constants") ----
  const PALETTE = ['#6A74E8', '#8E84F2', '#F0C4E0', '#7FD8C8'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(hover: none)').matches;
  const COUNT = coarse ? 8 : 14;
  const DPR = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
  const R_MIN = 90, R_MAX = 200;
  const BASE_WOBBLE = 0.06;
  const BASE_ALPHA = 0.55;

  let w = 0, h = 0;
  let blobs = [];

  // "#6A74E8" + alpha -> "rgba(r,g,b,a)"
  function rgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }

  function resize() {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * DPR);
    canvas.height = Math.round(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function makeBlobs() {
    blobs = [];
    const cols = Math.max(1, Math.round(Math.sqrt(COUNT * (w / h || 1))));
    const rows = Math.ceil(COUNT / cols);
    let i = 0;
    for (let r = 0; r < rows && i < COUNT; r++) {
      for (let c = 0; c < cols && i < COUNT; c++, i++) {
        const jx = (Math.random() - 0.5) * (w / cols) * 0.6;
        const jy = (Math.random() - 0.5) * (h / rows) * 0.6;
        const ax = ((c + 0.5) / cols) * w + jx;
        const ay = ((r + 0.5) / rows) * h + jy;
        blobs.push({
          baseX: ax, baseY: ay, anchorX: ax, anchorY: ay,
          x: ax, y: ay, vx: 0, vy: 0,
          r: R_MIN + Math.random() * (R_MAX - R_MIN),
          color: PALETTE[i % PALETTE.length],
          phase: Math.random() * Math.PI * 2,
          driftX: Math.random() * Math.PI * 2,
          driftY: Math.random() * Math.PI * 2,
          boost: 0,
        });
      }
    }
  }

  function drawBlob(b, t) {
    const amp = BASE_WOBBLE; // cursor boost wired in Task 9
    const STEPS = 28;
    ctx.beginPath();
    for (let i = 0; i <= STEPS; i++) {
      const ang = (i / STEPS) * Math.PI * 2;
      const rr = wobbleRadius(b.r, ang, t * 0.001 + b.phase, amp);
      const px = b.x + Math.cos(ang) * rr;
      const py = b.y + Math.sin(ang) * rr;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 1.15);
    g.addColorStop(0, rgba(b.color, BASE_ALPHA));
    g.addColorStop(1, rgba(b.color, 0));
    ctx.fillStyle = g;
    ctx.fill();
  }

  function renderFrame(t) {
    ctx.clearRect(0, 0, w, h);
    for (const b of blobs) drawBlob(b, t);
  }

  function start() {
    resize();
    makeBlobs();
    renderFrame(0);              // static frame; Task 8 replaces this with a loop
    canvas.dataset.ready = '1';  // success signal for headless verification
  }

  start();
  // reduced-motion: leave the single static frame, do not animate.
  window.addEventListener('resize', () => { resize(); makeBlobs(); renderFrame(0); });
})();
```

- [ ] **Step 2: Verify the static frame renders (headless screenshot + ready flag)**

Run (PowerShell, server on :4173):
```
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,900 --virtual-time-budget=4000 --screenshot="$env:TEMP\blobs-static.png" "http://localhost:4173/"
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --dump-dom "http://localhost:4173/" > "$env:TEMP\dom2.html"
Select-String -Path "$env:TEMP\dom2.html" -Pattern 'data-ready="1"'
```
Expected: `data-ready="1"` present (entry module ran without throwing). Open `blobs-static.png` and confirm soft coloured blobs are visible behind the frost. Read the PNG with the Read tool to eyeball it.

- [ ] **Step 3: Commit**

```bash
git add js/blobs.js
git commit -m "feat: blob entry module — static render + reduced-motion frame"
```

---

### Task 8: Animation loop — drift, jelly morph, domino separation

**Files:**
- Modify: `js/blobs.js`

Adds the rAF loop with drifting anchors, the live jelly wobble, pairwise separation
(the domino), and tab-visibility pausing. Cursor repulsion is Task 9.

- [ ] **Step 1: Add imports and loop tunables**

Change the import line at the top of `js/blobs.js` from:

```js
import { wobbleRadius } from './blob-physics.mjs';
```
to:
```js
import { wobbleRadius, separationForce, integrate } from './blob-physics.mjs';
```

Add to the tunables block (after `const BASE_ALPHA = 0.55;`):

```js
  const MIN_GAP = 30;
  const MAX_SPEED = 60;        // px/s
  const SPRING = 1.2;
  const DAMPING = 0.92;
  const SEP_STRENGTH = 220;
  const DRIFT_AMP = 26;        // px wander around the base anchor
  const DRIFT_SPEED = 0.00018; // radians/ms
```

- [ ] **Step 2: Add the physics step and the loop; replace the static `start()` tail**

Add this `step()` function above `function start()`:

```js
  function step(dt, t) {
    // 1) drift: move each blob's anchor slowly around its base position
    for (const b of blobs) {
      b.anchorX = b.baseX + Math.sin(t * DRIFT_SPEED + b.driftX) * DRIFT_AMP;
      b.anchorY = b.baseY + Math.cos(t * DRIFT_SPEED + b.driftY) * DRIFT_AMP;
    }
    // 2) pairwise separation (min-gap + domino)
    for (let i = 0; i < blobs.length; i++) {
      for (let j = i + 1; j < blobs.length; j++) {
        const a = blobs[i], b = blobs[j];
        const f = separationForce(a.x, a.y, a.r, b.x, b.y, b.r, MIN_GAP, SEP_STRENGTH);
        a.vx += f.fx * dt; a.vy += f.fy * dt;
        b.vx -= f.fx * dt; b.vy -= f.fy * dt;
      }
    }
    // 3) integrate
    for (const b of blobs) integrate(b, dt, { spring: SPRING, damping: DAMPING, maxSpeed: MAX_SPEED });
  }
```

Replace the `start()` function and the two lines after it:

```js
  function start() {
    resize();
    makeBlobs();
    renderFrame(0);              // static frame; Task 8 replaces this with a loop
    canvas.dataset.ready = '1';  // success signal for headless verification
  }

  start();
  // reduced-motion: leave the single static frame, do not animate.
  window.addEventListener('resize', () => { resize(); makeBlobs(); renderFrame(0); });
```

with:

```js
  let raf = 0, last = 0;

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000) || 0;
    last = now;
    step(dt, now);
    renderFrame(now);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    resize();
    makeBlobs();
    canvas.dataset.ready = '1';  // success signal for headless verification
    if (reduced) { renderFrame(0); return; }   // static frame, no loop
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  start();

  window.addEventListener('resize', () => {
    resize();
    makeBlobs();
    if (reduced) renderFrame(0);
  });

  document.addEventListener('visibilitychange', () => {
    if (reduced) return;
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });
```

- [ ] **Step 3: Verify the animation runs (live + headless ready flag)**

Run: `node --test tests/blob-physics.test.mjs` → still PASS (10 tests; no regressions).
Run the dump-dom check from Task 7 Step 2 → `data-ready="1"` still present (loop started without throwing).
Then open `http://localhost:4173/` in a real browser and confirm: blobs drift gently, morph like jellyfish, and keep their spacing (no overlap/clumping). This motion check is visual — eyeball it.

- [ ] **Step 4: Commit**

```bash
git add js/blobs.js
git commit -m "feat: blob animation loop — drift, jelly morph, domino separation, visibility pause"
```

---

### Task 9: Desktop cursor repulsion + proximity wobble boost

**Files:**
- Modify: `js/blobs.js`

- [ ] **Step 1: Import the repulsion + clamp helpers**

Change the import line to:

```js
import { wobbleRadius, separationForce, integrate, repulsionForce, clamp } from './blob-physics.mjs';
```

Add to the tunables block:

```js
  const CURSOR_RADIUS = 100;
  const CURSOR_STRENGTH = 900;
  const CURSOR_WOBBLE = 0.16;  // wobble amplitude right at the cursor
```

- [ ] **Step 2: Track the cursor (desktop only)**

Add after `let blobs = [];`:

```js
  const cursor = { x: -9999, y: -9999, active: false };
```

Add inside `start()`, immediately before the `if (reduced)` line:

```js
    if (!coarse) {
      window.addEventListener('mousemove', (e) => {
        cursor.x = e.clientX; cursor.y = e.clientY; cursor.active = true;
      }, { passive: true });
      window.addEventListener('mouseout', () => { cursor.active = false; });
    }
```

- [ ] **Step 3: Apply repulsion in `step()` and feed the wobble boost**

In `step()`, after the separation double-loop and before the integrate loop, add:

```js
    // 2b) cursor repulsion (desktop) + per-blob wobble boost from proximity
    for (const b of blobs) {
      if (cursor.active && !coarse) {
        const f = repulsionForce(b.x, b.y, cursor.x, cursor.y, CURSOR_RADIUS + b.r, CURSOR_STRENGTH);
        b.vx += f.fx * dt; b.vy += f.fy * dt;
        const d = Math.hypot(b.x - cursor.x, b.y - cursor.y);
        b.boost = clamp(1 - d / (CURSOR_RADIUS + b.r), 0, 1);
      } else {
        b.boost *= 0.9; // ease the wobble back down when the cursor leaves
      }
    }
```

- [ ] **Step 4: Use `b.boost` in `drawBlob`**

In `drawBlob`, change:

```js
    const amp = BASE_WOBBLE; // cursor boost wired in Task 9
```
to:
```js
    const amp = BASE_WOBBLE + (CURSOR_WOBBLE - BASE_WOBBLE) * (b.boost || 0);
```

- [ ] **Step 5: Verify cursor interaction (live)**

Run: `node --test tests/blob-physics.test.mjs` → PASS (10 tests, no regressions).
Open `http://localhost:4173/` in a real browser, move the cursor through the blobs and confirm: blobs ease away within ~100px, wobble harder as the cursor nears, and shove their neighbours (domino). Confirm clicks/links still work (canvas is `pointer-events:none`). On a narrow window / mobile emulation, confirm no cursor reaction and calm drift only.

- [ ] **Step 6: Commit**

```bash
git add js/blobs.js
git commit -m "feat: desktop cursor repulsion + proximity wobble boost"
```

---

### Task 10: Final review, manual sign-off, deploy

**Files:** none (verification + deploy only)

- [ ] **Step 1: Full test run**

Run: `node --test tests/blob-physics.test.mjs`
Expected: PASS (10 tests).

- [ ] **Step 2: Reduced-motion check**

Run:
```
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --force-prefers-reduced-motion --hide-scrollbars --window-size=1440,900 --virtual-time-budget=3000 --screenshot="$env:TEMP\blobs-rm.png" "http://localhost:4173/"
```
Read `blobs-rm.png`: expect a static, colourful blob frame (no reliance on motion), text readable.

- [ ] **Step 3: Andre reviews live**

Ask Andre to open `http://localhost:4173/` and confirm the look/feel on desktop (cursor interaction) before deploying. Tune constants (`COUNT`, `CURSOR_RADIUS`, `MIN_GAP`, `MAX_SPEED`, `BASE_ALPHA`, frost blur) per his feedback; re-commit if changed.

- [ ] **Step 4: Merge to main**

```bash
git checkout main
git merge --no-ff feat/animated-blob-background -m "feat: animated jelly-blob background (under Light Frost)"
```

- [ ] **Step 5: Manual production deploy (auto-deploy is blocked)**

```bash
TMP="/c/Users/andre/dvd-deploy"; rm -rf "$TMP"; mkdir -p "$TMP"
git archive main | tar -x -C "$TMP"
find "$TMP" \( -name '.env' -o -path '*outreach*' -o -name '*.psv' \)   # MUST print nothing
netlify deploy --prod --dir="$TMP" --site 29b8c50b-b995-4a0a-b0b3-dc1289c99056 --message "animated blob background"
rm -rf "$TMP"
```

- [ ] **Step 6: Verify live**

Run: `curl -s "https://devilladesign.com/js/blobs.js?cb=$(date +%s)" | head -3` → expect the blob module header.
Confirm `https://devilladesign.com/` shows the animated background.

---

## Notes for the implementer
- The site loads `js/blobs.js` as an ES module so it can import the unit-tested `js/blob-physics.mjs`. `js/main.js` stays a classic script.
- `tests/` is new and used only by Node (`node --test`); it is not served and not deployed (git archive includes it but it's harmless — or add `tests/` to `.gitignore` deploy concerns are nil since it's not linked).
- Never deploy from the working tree — always from a clean `git archive` of `main`, because `outreach/` (prospect data + Gmail `.env`) is gitignored and must never be published.
