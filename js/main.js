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

// (Calendly inline scheduler removed — the contact CTA is now a plain glass
// "Book a call" link that opens the Calendly page directly, no widget script.)
