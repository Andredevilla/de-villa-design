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
