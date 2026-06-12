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

// Contact form: Formspree-style POST with mailto fallback until configured
const form = document.querySelector('.contact-form');
const statusEl = document.querySelector('.form-status');

if (form && statusEl) {
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);

    if (submitBtn) submitBtn.disabled = true;
    try {
      // Netlify Forms: AJAX submissions post url-encoded data to the page itself
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString(),
      });
      if (!response.ok) throw new Error('Request failed');
      form.reset();
      statusEl.textContent = "Thanks — your message is on its way. I'll reply within one business day.";
      statusEl.className = 'form-status success';
    } catch {
      statusEl.textContent = 'Something went wrong. Please email andre@devilladesign.com instead.';
      statusEl.className = 'form-status error';
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
