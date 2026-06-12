// Scroll-driven water droplet background.
// Drops fall as the user scrolls (and rise back on scroll-up), wiggle with a
// squash-stretch proportional to scroll velocity, and pop into micro-beads
// when they cross the bottom of the viewport. Popped drops stay gone.
(() => {
  const field = document.getElementById('droplet-field');
  if (!field || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const SPRITE = {
    sphere: 'assets/droplets/sphere.png',
    teardrop: 'assets/droplets/teardrop.png',
    wobble: 'assets/droplets/wobble.png',
    bead: 'assets/droplets/bead.png',
  };

  const mobile = matchMedia('(max-width: 720px)').matches;

  // Initial frame mirrors the reference layout: 1 small, 2 big, 3 medium.
  // x: fraction of viewport width · y: fraction of viewport height at scroll 0
  // v: parallax factor (px fallen per px scrolled) · blur for depth on two big ones
  const INITIAL = [
    { s: 'bead',     size: 52,  x: 0.07, y: 0.10, v: 0.55 },           // 1 small, top-left
    { s: 'sphere',   size: 230, x: 0.16, y: 0.34, v: 0.85, blur: 3 },  // big, soft-focus
    { s: 'sphere',   size: 190, x: 0.78, y: 0.62, v: 1.15 },           // big, sharp
    { s: 'teardrop', size: 110, x: 0.46, y: 0.16, v: 0.95 },           // mediums
    { s: 'wobble',   size: 96,  x: 0.66, y: 0.08, v: 0.70, blur: 2 },
    { s: 'wobble',   size: 120, x: 0.30, y: 0.74, v: 1.30 },
  ];
  // Staged above the viewport; enter as the page scrolls. Later = smaller on average.
  const STAGED = [
    { s: 'teardrop', size: 130, x: 0.58, at: 0.10, v: 1.05 },
    { s: 'sphere',   size: 105, x: 0.10, at: 0.22, v: 0.80, blur: 2 },
    { s: 'wobble',   size: 88,  x: 0.86, at: 0.34, v: 1.20 },
    { s: 'teardrop', size: 74,  x: 0.38, at: 0.48, v: 0.90 },
    { s: 'bead',     size: 56,  x: 0.70, at: 0.60, v: 1.10 },
    { s: 'wobble',   size: 62,  x: 0.22, at: 0.72, v: 0.75, blur: 1 },
    { s: 'bead',     size: 44,  x: 0.50, at: 0.84, v: 1.00 },
    { s: 'bead',     size: 38,  x: 0.90, at: 0.92, v: 0.85 },
  ];

  let vw = innerWidth;
  let vh = innerHeight;
  let scrollable = 1;
  const drops = [];

  function build() {
    vw = innerWidth;
    vh = innerHeight;
    scrollable = Math.max(1, document.documentElement.scrollHeight - vh);
    const defs = INITIAL.concat(STAGED).filter((d, i) => !mobile || i % 2 === 0);

    defs.forEach((d, i) => {
      const img = document.createElement('img');
      img.src = SPRITE[d.s];
      img.alt = '';
      img.width = d.size;
      img.height = d.size;
      img.decoding = 'async';
      img.loading = 'eager';
      if (d.blur) img.style.filter = `blur(${d.blur}px)`;
      img.style.opacity = d.blur ? '0.55' : '0.8';
      field.appendChild(img);
      drops.push({
        el: img,
        size: d.size,
        xf: d.x,
        x: d.x * vw,
        // staged drops are parked so they cross the top edge at `at` × scroll range
        y0: d.at === undefined ? d.y * vh : -(d.at * scrollable * d.v) - d.size,
        v: d.v,
        phase: Math.random() * Math.PI * 2,
        freq: 2.2 + Math.random() * 1.6,
        popped: false,
      });
    });
  }

  function pop(drop, screenY) {
    drop.popped = true;
    drop.el.remove();
    // burst: 5 micro-beads scatter upward-outward from the pop point and fade
    for (let i = 0; i < 5; i++) {
      const bead = document.createElement('img');
      bead.src = SPRITE.bead;
      bead.alt = '';
      const s = 10 + Math.random() * 14;
      bead.width = s;
      bead.height = s;
      bead.className = 'pop-bead';
      bead.style.left = `${drop.x + drop.size / 2}px`;
      bead.style.top = `${Math.min(screenY, vh - s)}px`;
      bead.style.setProperty('--dx', `${(Math.random() - 0.5) * 140}px`);
      bead.style.setProperty('--dy', `${-30 - Math.random() * 90}px`);
      bead.addEventListener('animationend', () => bead.remove());
      field.appendChild(bead);
    }
  }

  let lastScroll = scrollY;
  let velocity = 0;
  let lastT = performance.now();
  let firstFrame = true;

  function frame(t) {
    const dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;
    const sc = scrollY;
    // smoothed scroll velocity drives the wiggle amplitude
    velocity += ((sc - lastScroll) / Math.max(dt, 0.001) - velocity) * 0.12;
    lastScroll = sc;
    const amp = Math.min(0.16, 0.025 + Math.abs(velocity) / 9000);

    for (const drop of drops) {
      if (drop.popped) continue;
      const screenY = drop.y0 + sc * drop.v;
      if (screenY > vh) {
        // drops already past the bottom on page load (anchor link, reload
        // mid-page) vanish silently instead of bursting all at once
        if (firstFrame) {
          drop.popped = true;
          drop.el.remove();
        } else {
          pop(drop, screenY);
        }
        continue;
      }
      if (screenY < -drop.size * 2) {
        drop.el.style.transform = 'translate(-9999px, -9999px)';
        continue;
      }
      drop.phase += dt * drop.freq * (1 + Math.abs(velocity) / 1500);
      const w = Math.sin(drop.phase) * amp;
      drop.el.style.transform =
        `translate(${drop.x}px, ${screenY}px) scale(${1 + w}, ${1 - w})`;
    }
    firstFrame = false;
    raf = requestAnimationFrame(frame);
  }

  let raf;
  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      vw = innerWidth;
      vh = innerHeight;
      scrollable = Math.max(1, document.documentElement.scrollHeight - vh);
      for (const drop of drops) drop.x = drop.xf * vw;
    }, 150);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      lastT = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });

  build();
  raf = requestAnimationFrame(frame);
})();
