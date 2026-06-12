// Scroll-driven water droplet background.
// Drops fall as the user scrolls (and rise back on scroll-up), wiggle with a
// squash-stretch proportional to scroll velocity, and pop into micro-beads
// when they cross the bottom of the viewport. Popped drops stay gone.
(() => {
  const field = document.getElementById('droplet-field');
  if (!field || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Animated WebP loops: real liquid wobble baked into each sprite.
  // *2 variants are time-reversed copies so same-type drops don't visibly sync.
  const SPRITE = {
    sphere: 'assets/droplets/sphere.webp',
    sphere2: 'assets/droplets/sphere2.webp',
    teardrop: 'assets/droplets/teardrop.webp',
    wobble: 'assets/droplets/wobble.webp',
    bead: 'assets/droplets/bead.webp',
    bead2: 'assets/droplets/bead2.webp',
    splash: 'assets/droplets/splash.webp',
  };
  // alternate same-type sprites between normal and reversed playback
  const variantCounter = {};
  function spriteFor(type) {
    variantCounter[type] = (variantCounter[type] || 0) + 1;
    const alt = `${type}2`;
    return variantCounter[type] % 2 === 0 && SPRITE[alt] ? SPRITE[alt] : SPRITE[type];
  }

  let mobile = matchMedia('(max-width: 720px)').matches;

  // Initial frame: reference layout density plus extras (10 drops), all hugging
  // the left/right edges — the centre column is a no-droplet zone so copy stays clear.
  // x: fraction of viewport width · y: fraction of viewport height at scroll 0
  // v: parallax factor (px fallen per px scrolled)
  // Matches the approved reference frame: droplets in the outer thirds only,
  // middle third is the no-droplet zone, only the top-left bead may clip an edge.
  const INITIAL = [
    { s: 'bead',     size: 56,  x: 0.02, y: 0.03, v: 0.55 },
    { s: 'sphere',   size: 215, x: 0.09, y: 0.16, v: 0.85 },
    { s: 'teardrop', size: 110, x: 0.05, y: 0.50, v: 0.95 },
    { s: 'wobble',   size: 120, x: 0.12, y: 0.68, v: 1.25 },
    { s: 'sphere',   size: 200, x: 0.78, y: 0.14, v: 1.10 },
    { s: 'bead',     size: 62,  x: 0.92, y: 0.36, v: 0.70 },
    { s: 'teardrop', size: 115, x: 0.85, y: 0.44, v: 1.00 },
    { s: 'wobble',   size: 95,  x: 0.76, y: 0.60, v: 0.90 },
    { s: 'bead',     size: 52,  x: 0.94, y: 0.66, v: 0.80 },
    { s: 'bead',     size: 72,  x: 0.82, y: 0.80, v: 1.20 },
  ];
  // Matches the approved wave-2 frame: enter from the top as the page scrolls,
  // smaller on average but the bottom-most are solid small-mediums, not specks.
  const STAGED = [
    { s: 'teardrop', size: 130, x: 0.07, at: 0.10, v: 1.05 },
    { s: 'sphere',   size: 120, x: 0.80, at: 0.18, v: 0.95 },
    { s: 'wobble',   size: 88,  x: 0.03, at: 0.28, v: 0.85 },
    { s: 'teardrop', size: 92,  x: 0.86, at: 0.38, v: 1.10 },
    { s: 'bead',     size: 84,  x: 0.10, at: 0.50, v: 1.15 },
    { s: 'bead',     size: 64,  x: 0.90, at: 0.62, v: 0.80 },
    { s: 'bead',     size: 80,  x: 0.82, at: 0.76, v: 1.00 },
    { s: 'bead',     size: 70,  x: 0.94, at: 0.88, v: 0.90 },
  ];

  let vw = innerWidth;
  let vh = innerHeight;
  let scrollable = 1;
  let raf;
  let resizeTimer;
  const drops = [];

  function build() {
    field.textContent = '';
    drops.length = 0;
    vw = innerWidth;
    vh = innerHeight;
    scrollable = Math.max(1, document.documentElement.scrollHeight - vh);
    const defs = INITIAL.concat(STAGED).filter((d, i) => !mobile || i % 2 === 0);

    defs.forEach((d, i) => {
      const img = document.createElement('img');
      img.src = spriteFor(d.s);
      img.alt = '';
      img.width = d.size;
      img.height = d.size;
      img.decoding = 'async';
      img.loading = 'eager';
      img.style.opacity = '0.92';
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

  function pop(drop) {
    drop.popped = true;
    drop.el.remove();
    const cx = drop.x + drop.size / 2;

    // splash crown rises from the bottom edge where the drop landed
    const w = Math.max(90, drop.size * 2);
    const splash = document.createElement('img');
    splash.src = SPRITE.splash;
    splash.alt = '';
    splash.width = w;
    splash.height = w;
    splash.className = 'splash';
    splash.style.left = `${Math.max(0, Math.min(cx - w / 2, vw - w))}px`;
    splash.style.top = `${vh - w * 0.92}px`;
    splash.addEventListener('animationend', () => splash.remove());
    field.appendChild(splash);

    // plus loose micro-beads scattering up and out
    for (let i = 0; i < 6; i++) {
      const bead = document.createElement('img');
      bead.src = SPRITE.bead;
      bead.alt = '';
      const s = 10 + Math.random() * 16;
      bead.width = s;
      bead.height = s;
      bead.className = 'pop-bead';
      bead.style.left = `${Math.max(0, Math.min(cx + (Math.random() - 0.5) * drop.size, vw - s))}px`;
      bead.style.top = `${vh - s - 4}px`;
      bead.style.setProperty('--dx', `${(Math.random() - 0.5) * 180}px`);
      bead.style.setProperty('--dy', `${-50 - Math.random() * 130}px`);
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
    // idle liquid motion is baked into the animated sprites — the JS wiggle now
    // only adds fall-stretch proportional to scroll speed
    const amp = Math.min(0.08, Math.abs(velocity) / 14000);

    for (const drop of drops) {
      if (drop.popped) continue;
      const screenY = drop.y0 + sc * drop.v;
      // pop the moment the drop's BOTTOM edge touches the bottom of the screen,
      // so the explosion happens in view before the liquid disappears
      if (screenY + drop.size >= vh) {
        // drops already past the bottom on page load (anchor link, reload
        // mid-page) vanish silently instead of bursting all at once
        if (firstFrame) {
          drop.popped = true;
          drop.el.remove();
        } else {
          pop(drop);
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
    // every drop has popped: the show is over — stop the loop for good
    if (drops.every((d) => d.popped)) return;
    raf = requestAnimationFrame(frame);
  }

  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      vw = innerWidth;
      vh = innerHeight;
      scrollable = Math.max(1, document.documentElement.scrollHeight - vh);
      const nowMobile = matchMedia('(max-width: 720px)').matches;
      if (nowMobile !== mobile) {
        // crossing the breakpoint (e.g. tablet rotation): rebuild the field
        mobile = nowMobile;
        cancelAnimationFrame(raf);
        firstFrame = true;
        build();
        raf = requestAnimationFrame(frame);
      } else {
        for (const drop of drops) drop.x = drop.xf * vw;
      }
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
