// js/blobs.js — animated jelly-blob background (entry module).
// Pure maths live in ./blob-physics.mjs (unit-tested); this file owns the canvas,
// blob state, rendering, input, and degradation.
import { wobbleRadius, separationForce, integrate, repulsionForce, clamp } from './blob-physics.mjs';

(() => {
  const canvas = document.getElementById('blob-field');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // ---- tunables (spec §"Tunable constants") ----
  const PALETTE = ['#6A74E8', '#8E84F2', '#F0C4E0', '#7FD8C8'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(hover: none)').matches;
  const COUNT = coarse ? 6 : 11;
  const DPR = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
  const R_MIN = coarse ? 40 : 64, R_MAX = coarse ? 78 : 120;
  const VISUAL = 1.2;          // visible radius factor — the soft gradient + wobble extend past r
  const BASE_WOBBLE = 0.06;
  const BASE_ALPHA = 0.55;
  const MIN_GAP = 72;          // 0.75 inch (96 CSS px/inch) minimum gap between visible edges
  const MAX_SPEED = 60;        // px/s
  const SPRING = 1.2;
  const DAMPING = 0.92;
  const SEP_STRENGTH = 240;
  const DRIFT_AMP = 16;        // px wander around the base anchor (small so drift can't break the gap)
  const DRIFT_SPEED = 0.00018; // radians/ms
  const CURSOR_RADIUS = 100;
  const CURSOR_STRENGTH = 900;
  const CURSOR_WOBBLE = 0.16;  // wobble amplitude right at the cursor

  let w = 0, h = 0;
  let blobs = [];
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

  function makeBlobs() {
    blobs = [];
    const cols = Math.max(1, Math.round(Math.sqrt(COUNT * (w / h || 1))));
    const rows = Math.ceil(COUNT / cols);
    let i = 0;
    for (let r = 0; r < rows && i < COUNT; r++) {
      for (let c = 0; c < cols && i < COUNT; c++, i++) {
        const jx = (Math.random() - 0.5) * (w / cols) * 0.35;
        const jy = (Math.random() - 0.5) * (h / rows) * 0.35;
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

  // Required centre-to-centre distance so the two blobs' visible edges stay MIN_GAP apart.
  function minGapBetween(a, b) {
    return (a.r + b.r) * VISUAL + MIN_GAP;
  }

  // Hard constraint: physically push apart any pair closer than the required gap.
  // When killVelocity is true, also cancel the velocity component bringing them together
  // so they ease apart instead of ramming (no jitter). Run a couple of passes for stability.
  function hardSeparate(killVelocity) {
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
          if (killVelocity) {
            const av = a.vx * nx + a.vy * ny;
            if (av > 0) { a.vx -= av * nx; a.vy -= av * ny; }
            const bv = b.vx * nx + b.vy * ny;
            if (bv < 0) { b.vx -= bv * nx; b.vy -= bv * ny; }
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
        const m = b.r * 0.35;
        b.x = Math.max(m, Math.min(w - m, b.x));
        b.y = Math.max(m, Math.min(h - m, b.y));
      }
    }
    for (const b of blobs) { b.baseX = b.x; b.baseY = b.y; b.anchorX = b.x; b.anchorY = b.y; }
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
    // 1) drift: move each blob's anchor slowly around its base position
    for (const b of blobs) {
      b.anchorX = b.baseX + Math.sin(t * DRIFT_SPEED + b.driftX) * DRIFT_AMP;
      b.anchorY = b.baseY + Math.cos(t * DRIFT_SPEED + b.driftY) * DRIFT_AMP;
    }
    // 2) pairwise separation (min-gap + domino)
    for (let i = 0; i < blobs.length; i++) {
      for (let j = i + 1; j < blobs.length; j++) {
        const a = blobs[i], b = blobs[j];
        const f = separationForce(a.x, a.y, a.r * VISUAL, b.x, b.y, b.r * VISUAL, MIN_GAP, SEP_STRENGTH);
        a.vx += f.fx * dt; a.vy += f.fy * dt;
        b.vx -= f.fx * dt; b.vy -= f.fy * dt;
      }
    }
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
    // 3) integrate
    for (const b of blobs) integrate(b, dt, { spring: SPRING, damping: DAMPING, maxSpeed: MAX_SPEED });
    // 4) hard min-gap guarantee: physically separate any pair still too close (e.g. cursor-shoved)
    hardSeparate(true);
    hardSeparate(true);
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
