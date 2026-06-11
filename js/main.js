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

// Wattle corruption: run the SVG turbulence animation only while hovering
const wattleBand = document.querySelector('.wattle-band');
const corruptAnims = document.querySelectorAll('#corrupt animate');

if (wattleBand && corruptAnims.length) {
  wattleBand.addEventListener('mouseenter', () => corruptAnims.forEach((a) => a.beginElement()));
  wattleBand.addEventListener('mouseleave', () => corruptAnims.forEach((a) => a.endElement()));
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
