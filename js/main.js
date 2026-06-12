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

// Calendly inline scheduler: lazy-load the widget script only when the
// contact section approaches the viewport, so it never blocks page load
const calendlyHost = document.getElementById('calendly-embed');

if (calendlyHost && 'IntersectionObserver' in window) {
  const loadCalendly = () => {
    const widget = document.createElement('div');
    widget.className = 'calendly-inline-widget';
    widget.setAttribute('data-url', calendlyHost.getAttribute('data-url'));
    calendlyHost.appendChild(widget);

    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const calObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      calObserver.disconnect();
      loadCalendly();
    }
  }, { rootMargin: '600px 0px' });
  calObserver.observe(calendlyHost);
} else if (calendlyHost) {
  // very old browsers: plain link fallback
  const link = document.createElement('a');
  link.className = 'btn';
  link.href = 'https://calendly.com/andre-devilladesign/free-20-minute-chat';
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = 'Book the free chat on Calendly';
  calendlyHost.appendChild(link);
}
