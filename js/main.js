// Mobile nav
const header = document.querySelector('.site-header');
const toggle = document.querySelector('.nav-toggle');

if (header && toggle) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  document.querySelectorAll('.site-nav a').forEach((link) => {
    link.addEventListener('click', () => {
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    });
  });
}

// Scroll reveal (progressive enhancement: .js-ready arms the hidden state,
// so content stays visible if this script never runs)
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => {
  el.classList.add('js-ready');
  observer.observe(el);
});

// Wattle corruption grid (14 cols x 3 rows): hovering a cell reveals the
// band slice one cell to the RIGHT (an offset frozen clone), mixing it over
// the original; it auto-resets shortly after.
const hero = document.querySelector('.hero');
const band = document.querySelector('.wattle-band');

if (hero && band) {
  const COLS = 14;
  const ROWS = 3;
  const grid = document.createElement('div');
  grid.className = 'glitch-grid';
  grid.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < COLS * ROWS; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const cell = document.createElement('div');
    cell.className = 'glitch-cell';

    // Peek layer: a full-width clone of the band, shifted left by one cell
    // so this cell's window shows its right-hand neighbour's content.
    const peek = document.createElement('div');
    peek.className = 'cell-peek';
    peek.style.width = COLS * 100 + '%';
    peek.style.height = ROWS * 100 + '%';
    peek.style.left = -((col + 1) * 100) + '%';
    peek.style.top = -(row * 100) + '%';
    peek.appendChild(band.cloneNode(true));
    cell.appendChild(peek);

    let reset;
    cell.addEventListener('mouseenter', () => {
      clearTimeout(reset);
      cell.classList.add('on');
      reset = setTimeout(() => cell.classList.remove('on'), 700);
    });
    cell.addEventListener('mouseleave', () => {
      clearTimeout(reset);
      reset = setTimeout(() => cell.classList.remove('on'), 250);
    });
    grid.appendChild(cell);
  }
  hero.appendChild(grid);
}

// Contact form: Formspree-style POST with mailto fallback until configured
const form = document.querySelector('.contact-form');
const statusEl = document.querySelector('.form-status');

if (form && statusEl) {
  const endpoint = form.getAttribute('action');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);

    if (endpoint.includes('YOUR_FORM_ID')) {
      const subject = encodeURIComponent('Website enquiry — ' + data.get('name'));
      const body = encodeURIComponent(
        data.get('message') + '\n\nFrom: ' + data.get('name') + ' <' + data.get('email') + '>'
      );
      window.location.href = 'mailto:hello@devilladesign.com?subject=' + subject + '&body=' + body;
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Request failed');
      form.reset();
      statusEl.textContent = "Thanks — your message is on its way. I'll reply within one business day.";
      statusEl.className = 'form-status success';
    } catch {
      statusEl.textContent = 'Something went wrong. Please email hello@devilladesign.com instead.';
      statusEl.className = 'form-status error';
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
