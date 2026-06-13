// js/blobs.js — animated jelly-blob background (entry module).
// Pure maths live in ./blob-physics.mjs (unit-tested); this file owns the canvas,
// blob state, rendering, input, and degradation.
import { wobbleRadius, separationForce, integrate } from './blob-physics.mjs';

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
  const MIN_GAP = 30;
  const MAX_SPEED = 60;        // px/s
  const SPRING = 1.2;
  const DAMPING = 0.92;
  const SEP_STRENGTH = 220;
  const DRIFT_AMP = 26;        // px wander around the base anchor
  const DRIFT_SPEED = 0.00018; // radians/ms

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
})();
