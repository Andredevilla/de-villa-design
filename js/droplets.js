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
    splash: 'assets/droplets/splash.png',
  };

  let mobile = matchMedia('(max-width: 720px)').matches;

  // Initial frame: reference layout density plus extras (10 drops), all hugging
  // the left/right edges — the centre column is a no-droplet zone so copy stays clear.
  // x: fraction of viewport width · y: fraction of viewport height at scroll 0
  // v: parallax factor (px fallen per px scrolled)
  const INITIAL = [
    { s: 'bead',     size: 52,  x: 0.05, y: 0.12, v: 0.55 },
    { s: 'bead',     size: 64,  x: 0.17, y: 0.05, v: 0.70 },
    { s: 'sphere',   size: 230, x: 0.09, y: 0.38, v: 0.85 },
    { s: 'teardrop', size: 112, x: 0.15, y: 0.64, v: 0.95 },
    { s: 'wobble',   size: 124, x: 0.03, y: 0.84, v: 1.25 },
    { s: 'wobble',   size: 96,  x: 0.91, y: 0.09, v: 0.70 },
    { s: 'teardrop', size: 132, x: 0.83, y: 0.30, v: 1.00 },
    { s: 'sphere',   size: 190, x: 0.87, y: 0.56, v: 1.15 },
    { s: 'bead',     size: 48,  x: 0.95, y: 0.74, v: 0.90 },
    { s: 'sphere',   size: 148, x: 0.82, y: 0.90, v: 1.35 },
  ];
  // Staged above the viewport; enter as the page scrolls. Later = smaller on average.
  const STAGED = [
    { s: 'teardrop', size: 120, x: 0.10, at: 0.10, v: 1.05 },
    { s: 'sphere',   size: 104, x: 0.88, at: 0.20, v: 0.85 },
    { s: 'wobble',   size: 88,  x: 0.04, at: 0.32, v: 1.20 },
    { s: 'bead',     size: 58,  x: 0.93, at: 0.44, v: 0.95 },
    { s: 'teardrop', size: 76,  x: 0.16, at: 0.56, v: 0.90 },
    { s: 'wobble',   size: 64,  x: 0.85, at: 0.68, v: 0.75 },
    { s: 'bead',     size: 46,  x: 0.07, at: 0.80, v: 1.05 },
    { s: 'bead',     size: 40,  x: 0.96, at: 0.90, v: 0.85 },
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
      img.src = SPRITE[d.s];
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
    const amp = Math.min(0.16, 0.025 + Math.abs(velocity) / 9000);

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
