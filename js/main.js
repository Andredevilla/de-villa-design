// Mobile nav
const header = document.querySelector('.site-header');
const toggle = document.querySelector('.nav-toggle');

toggle.addEventListener('click', () => {
  const open = header.classList.toggle('nav-open');
  toggle.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.site-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    header.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

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
const status = document.querySelector('.form-status');
const endpoint = form.getAttribute('action');

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

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error('Request failed');
    form.reset();
    status.textContent = "Thanks — your message is on its way. I'll reply within one business day.";
    status.className = 'form-status success';
  } catch {
    status.textContent = 'Something went wrong. Please email hello@devilladesign.com instead.';
    status.className = 'form-status error';
  }
});
