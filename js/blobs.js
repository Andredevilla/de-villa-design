// js/blobs.js — animated jelly-blob background (entry module).
// Pure maths live in ./blob-physics.mjs (unit-tested); this file owns the canvas,
// blob state, rendering, input, and degradation.
import { wobbleRadius, integrate, repulsionForce, clamp } from './blob-physics.mjs';

(() => {
  const canvas = document.getElementById('blob-field');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // ---- tunables (spec §"Tunable constants") ----
  const PALETTE = ['#6A74E8']; // single brand blue for every blob
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(hover: none)').matches;
  const COUNT = coarse ? 8 : 15;
  const DPR = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
  const R_MIN = coarse ? 40 : 64, R_MAX = coarse ? 78 : 120;
  const VISUAL = 1.2;          // visible radius factor — the soft gradient + wobble extend past r
  const BASE_WOBBLE = 0.06;
  const BASE_ALPHA = 0.8;
  const MIN_GAP = 36;          // ~0.375 inch minimum gap between visible edges
  const MAX_SPEED = 162;       // px/s (doubled escape speed)
  const SPRING = 1.2;
  const DAMPING = 0.92;
  const MERGE_OVERLAP = 0.25;  // merge two blobs once their overlap reaches 1/4 of the smaller blob's area
  const MAX_MERGE_R = 300;     // don't merge past this radius (keeps one blob from filling the screen)
  const SPLIT_HOLD = 2;        // seconds the cursor must rest on a blob before it splits
  const SPLIT_RATIOS = [0.6, 0.3, 0.45]; // area split, cycling: 60/40, then 30/70, then 45/55
  const MIN_SPLIT_R = 56;      // a blob smaller than this is too small to split further
  const DRIFT_AMP = 16;        // px wander around the base anchor
  const DRIFT_SPEED = 0.00018; // radians/ms
  const CURSOR_RADIUS = 100;
  const CURSOR_STRENGTH = 2430; // how hard blobs are shoved out of the cursor radius (doubled)
  const CURSOR_WOBBLE = 0.16;  // wobble amplitude right at the cursor
  const RETURN = 5;            // how hard an off-screen blob steers back to full visibility

  let w = 0, h = 0;
  let blobs = [];
  let splitIndex = 0;
  const cursor = { x: -9999, y: -9999, active: false };

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

  function makeBlob(x, y, r, vx = 0, vy = 0) {
    return {
      baseX: x, baseY: y, anchorX: x, anchorY: y,
      x, y, vx, vy, r,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      phase: Math.random() * Math.PI * 2,
      driftX: Math.random() * Math.PI * 2,
      driftY: Math.random() * Math.PI * 2,
      boost: 0, hover: 0,
    };
  }

  function makeBlobs() {
    blobs = [];
    const cols = Math.max(1, Math.round(Math.sqrt(COUNT * (w / h || 1))));
    const rows = Math.ceil(COUNT / cols);
    let i = 0;
    for (let r = 0; r < rows && i < COUNT; r++) {
      for (let c = 0; c < cols && i < COUNT; c++, i++) {
        const baseR = R_MIN + Math.random() * (R_MAX - R_MIN);
        const blobR = (i % 2 === 0) ? baseR * 1.35 : baseR; // half the blobs are 35% bigger
        const jx = (Math.random() - 0.5) * (w / cols) * 0.35;
        const jy = (Math.random() - 0.5) * (h / rows) * 0.35;
        const ax = ((c + 0.5) / cols) * w + jx;
        const ay = ((r + 0.5) / rows) * h + jy;
        blobs.push(makeBlob(ax, ay, blobR));
      }
    }
  }

  // Required centre-to-centre distance so the two blobs' visible edges stay MIN_GAP apart.
  function minGapBetween(a, b) {
    return (a.r + b.r) * VISUAL + MIN_GAP;
  }

  // Hard constraint: physically push apart any pair closer than the required gap.
  // When resolveVelocity is true, transfer the closing momentum (inelastic, along the
  // contact normal) so an incoming blob shoves the other one along and KEEPS moving
  // instead of stopping dead. Run a couple of passes for stability.
  function hardSeparate(resolveVelocity) {
    for (let i = 0; i < blobs.length; i++) {
      for (let j = i + 1; j < blobs.length; j++) {
        const a = blobs[i], b = blobs[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        const min = minGapBetween(a, b);
        if (dist < min) {
          const push = (min - dist) / 2;
          const nx = dx / dist, ny = dy / dist;
          a.x -= nx * push; a.y -= ny * push;
          b.x += nx * push; b.y += ny * push;
          if (resolveVelocity) {
            const va = a.vx * nx + a.vy * ny;   // A's speed along the normal (toward B if > 0)
            const vb = b.vx * nx + b.vy * ny;   // B's speed along the normal
            if (va - vb > 0) {                  // closing — transfer momentum instead of killing it
              const avg = (va + vb) / 2;        // A slows to avg but keeps moving; B speeds up to avg (shoved along)
              a.vx += (avg - va) * nx; a.vy += (avg - va) * ny;
              b.vx += (avg - vb) * nx; b.vy += (avg - vb) * ny;
            }
          }
        }
      }
    }
  }

  // Spread the initial layout so anchors already respect the gap (keeps the spring from
  // pulling blobs into each other), then lock the relaxed positions in as the anchors.
  function relaxAnchors() {
    for (let k = 0; k < 16; k++) {
      hardSeparate(false);
      for (const b of blobs) {
        const m = Math.min(b.r * VISUAL, Math.min(w, h) * 0.45); // start fully on-screen where it fits
        b.x = Math.max(m, Math.min(w - m, b.x));
        b.y = Math.max(m, Math.min(h - m, b.y));
      }
    }
    for (const b of blobs) { b.baseX = b.x; b.baseY = b.y; b.anchorX = b.x; b.anchorY = b.y; }
  }

  // Area of the lens where two circles overlap (0 if disjoint; full small circle if nested).
  function circleOverlapArea(r1, r2, d) {
    if (d >= r1 + r2) return 0;
    if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
    const r1s = r1 * r1, r2s = r2 * r2;
    const a1 = r1s * Math.acos((d * d + r1s - r2s) / (2 * d * r1));
    const a2 = r2s * Math.acos((d * d + r2s - r1s) / (2 * d * r2));
    const a3 = 0.5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));
    return a1 + a2 - a3;
  }

  // Merge the first pair overlapping by >= 1/4 of the smaller blob's area. Area is conserved
  // (new r = sqrt(r1^2 + r2^2)); position & velocity are area-weighted. One merge per frame
  // keeps array mutation simple and cascades naturally over subsequent frames.
  function handleMerges() {
    for (let i = 0; i < blobs.length; i++) {
      for (let j = i + 1; j < blobs.length; j++) {
        const a = blobs[i], b = blobs[j];
        const aa = a.r * a.r, ab = b.r * b.r, tot = aa + ab;
        if (Math.sqrt(tot) > MAX_MERGE_R) continue;             // would be too big — let them just overlap
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (circleOverlapArea(a.r, b.r, d) >= MERGE_OVERLAP * Math.PI * Math.min(a.r, b.r) ** 2) {
          const merged = makeBlob(
            (a.x * aa + b.x * ab) / tot,
            (a.y * aa + b.y * ab) / tot,
            Math.sqrt(tot),
            (a.vx * aa + b.vx * ab) / tot,
            (a.vy * aa + b.vy * ab) / tot,
          );
          blobs.splice(j, 1);
          blobs.splice(i, 1);
          blobs.push(merged);
          return;
        }
      }
    }
  }

  // Split a blob into two of different sizes (areas split by the cycling ratio), conserving
  // total area; place the two just touching and pop them apart so they don't instantly re-merge.
  function splitBlob(idx) {
    const b = blobs[idx];
    const ratio = SPLIT_RATIOS[splitIndex % SPLIT_RATIOS.length];
    splitIndex++;
    const area = b.r * b.r;                 // (the pi factor cancels everywhere here)
    const ra = Math.sqrt(area * ratio);
    const rb = Math.sqrt(area * (1 - ratio));
    const ang = Math.random() * Math.PI * 2;
    const ux = Math.cos(ang), uy = Math.sin(ang);
    const sep = ra + rb + 4;                // centres just apart -> ~0 overlap
    const A = makeBlob(b.x - ux * sep * (rb * rb / area), b.y - uy * sep * (rb * rb / area), ra, b.vx - ux * 40, b.vy - uy * 40);
    const B = makeBlob(b.x + ux * sep * (ra * ra / area), b.y + uy * sep * (ra * ra / area), rb, b.vx + ux * 40, b.vy + uy * 40);
    blobs.splice(idx, 1, A, B);
  }

  function handleSplits() {
    for (let i = blobs.length - 1; i >= 0; i--) {
      const b = blobs[i];
      if (b.hover >= SPLIT_HOLD) {
        if (b.r >= MIN_SPLIT_R) splitBlob(i);
        else b.hover = 0;                   // too small to split meaningfully
      }
    }
  }

  function drawBlob(b, t) {
    const amp = BASE_WOBBLE + (CURSOR_WOBBLE - BASE_WOBBLE) * (b.boost || 0);
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

  function step(dt, t) {
    // 1) drift: wander each blob's home anchor a little so the field stays alive
    for (const b of blobs) {
      b.anchorX = b.baseX + Math.sin(t * DRIFT_SPEED + b.driftX) * DRIFT_AMP;
      b.anchorY = b.baseY + Math.cos(t * DRIFT_SPEED + b.driftY) * DRIFT_AMP;
    }
    // 2) cursor: nearby blobs flee it; the blob directly under the cursor is HELD (it stops
    //    fleeing, pinned to the cursor, and accumulates hover time toward a split).
    for (const b of blobs) {
      if (cursor.active && !coarse) {
        const d = Math.hypot(b.x - cursor.x, b.y - cursor.y);
        if (d < b.r) {                      // cursor is on this blob — hold it under the cursor
          b.anchorX = cursor.x; b.anchorY = cursor.y;
          b.hover += dt;
          b.boost = 1;
        } else {                            // flee the cursor
          b.hover = 0;
          const f = repulsionForce(b.x, b.y, cursor.x, cursor.y, CURSOR_RADIUS + b.r, CURSOR_STRENGTH);
          b.vx += f.fx * dt; b.vy += f.fy * dt;
          b.boost = clamp(1 - d / (CURSOR_RADIUS + b.r), 0, 1);
        }
      } else {
        b.hover = 0;
        b.boost *= 0.9;
      }
    }
    // 3) containment: off-screen blobs steer back the SHORTEST way to full visibility
    for (const b of blobs) {
      const rv = Math.min(b.r * VISUAL, Math.min(w, h) * 0.45);
      const tx = b.x < rv ? rv : (b.x > w - rv ? w - rv : b.x);
      const ty = b.y < rv ? rv : (b.y > h - rv ? h - rv : b.y);
      if (tx !== b.x) b.vx += (tx - b.x) * RETURN * dt;
      if (ty !== b.y) b.vy += (ty - b.y) * RETURN * dt;
    }
    // 4) integrate
    for (const b of blobs) integrate(b, dt, { spring: SPRING, damping: DAMPING, maxSpeed: MAX_SPEED });
    // 5) merge overlapping blobs, then split any held under the cursor long enough
    handleMerges();
    handleSplits();
  }

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
    relaxAnchors();
    canvas.dataset.ready = '1';  // success signal for headless verification
    if (!coarse) {
      window.addEventListener('mousemove', (e) => {
        cursor.x = e.clientX; cursor.y = e.clientY; cursor.active = true;
      }, { passive: true });
      window.addEventListener('mouseout', () => { cursor.active = false; });
    }
    if (reduced) { renderFrame(0); return; }   // static frame, no loop
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  start();

  // Debounced so a burst of resize events (drag, mobile URL-bar show/hide,
  // orientation jiggle) doesn't rebuild the field repeatedly or jump the blobs mid-scroll.
  let resizeId = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeId);
    resizeId = setTimeout(() => {
      resize();
      makeBlobs();
      relaxAnchors();
      if (reduced) renderFrame(0);
    }, 150);
  });

  document.addEventListener('visibilitychange', () => {
    if (reduced) return;
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      cancelAnimationFrame(raf);   // guard against a double-started rAF loop
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });
})();
