# De Villa Design Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the De Villa Design one-page marketing site (Calm & Premium style, health & wellness niche, Australian market) as host-ready static files.

**Architecture:** Single static page (`index.html`) with anchor navigation, one stylesheet, one small vanilla-JS file. No build step, no framework. Portfolio "screenshots" are pure-CSS mini mock-ups so no binary assets are required. Contact form posts to a Formspree-style endpoint with a mailto fallback until the endpoint is configured.

**Tech Stack:** HTML5, CSS (custom properties, grid), vanilla JS (IntersectionObserver, fetch), Google Fonts (Fraunces + Inter).

**Spec:** `docs/superpowers/specs/2026-06-10-devilla-website-design.md`

**Verification model:** This is a static site with no test framework. Each task ends with a browser verification step against a local server instead of a unit test. Start the server once in Task 1 and leave it running.

---

### Task 1: Scaffold and document head

**Files:**
- Create: `index.html`
- Create: `css/style.css` (empty placeholder)
- Create: `js/main.js` (empty placeholder)

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en-AU">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>De Villa Design — Websites for Health &amp; Wellness Businesses in Australia</title>
  <meta name="description" content="Calm, beautiful websites for Australian clinics, studios and wellness practitioners. Designed to earn trust and fill your books.">
  <meta property="og:title" content="De Villa Design — Websites for Health &amp; Wellness">
  <meta property="og:description" content="Calm, beautiful websites for Australian clinics, studios and wellness practitioners.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://devilladesign.com">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "De Villa Design",
    "description": "Web design studio creating websites for health and wellness businesses across Australia.",
    "url": "https://devilladesign.com",
    "email": "hello@devilladesign.com",
    "areaServed": { "@type": "Country", "name": "Australia" },
    "knowsAbout": ["Web design", "Health and wellness websites", "Small business websites"]
  }
  </script>
</head>
<body>
  <!-- header inserted in Task 3 -->
  <main>
    <!-- sections inserted in Tasks 3–6 -->
  </main>
  <!-- footer inserted in Task 6 -->
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create empty `css/style.css` and `js/main.js`**

Both files start empty (a single comment line is fine):

```css
/* De Villa Design — styles */
```

```js
// De Villa Design — interactions
```

- [ ] **Step 3: Start the local server (leave running for all tasks)**

Run (background): `npx -y http-server "C:\Users\andre\OneDrive\Desktop\De Villa Design" -p 4173 -c-1`
Open: `http://localhost:4173`
Expected: blank cream-less page (unstyled), no console errors, title shows in tab.

- [ ] **Step 4: Commit**

```bash
git add index.html css/style.css js/main.js
git commit -m "feat: scaffold index.html with SEO head, fonts, JSON-LD"
```

---

### Task 2: CSS foundation (tokens, reset, typography, buttons)

**Files:**
- Modify: `css/style.css` (replace placeholder comment with the following)

- [ ] **Step 1: Write the foundation styles**

```css
/* ---------- Tokens ---------- */
:root {
  --cream: #F3EFE9;
  --cream-2: #ECE6DB;
  --sand: #D8CFBF;
  --ink: #3B3A36;
  --ink-soft: rgba(59, 58, 54, 0.65);
  --line: #E3DDD2;
  --sage: #6B7A5E;
  --sage-dark: #59674E;
  --on-sage: #F3EFE9;
  --footer-ink: #CFC9BD;
  --serif: "Fraunces", Georgia, serif;
  --sans: "Inter", -apple-system, "Segoe UI", sans-serif;
  --container: 1080px;
  --radius: 4px;
}

/* ---------- Reset & base ---------- */
*, *::before, *::after { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  background: var(--cream);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 1.0625rem;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: var(--serif);
  font-weight: 600;
  line-height: 1.15;
  margin: 0 0 0.5em;
}
h1 { font-size: clamp(2.4rem, 6vw, 3.75rem); }
h2 { font-size: clamp(1.8rem, 4vw, 2.5rem); }
h3 { font-size: 1.25rem; }

p { margin: 0 0 1em; }
img { max-width: 100%; display: block; }
a { color: inherit; }

.container {
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: 24px;
}

section { scroll-margin-top: 80px; }
.section { padding: 88px 0; }
.section-head { text-align: center; max-width: 560px; margin: 0 auto 48px; }
.section-head p { color: var(--ink-soft); }

.eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-soft);
  font-weight: 500;
}

/* ---------- Buttons & links ---------- */
.btn {
  display: inline-block;
  background: var(--sage);
  color: #fff;
  font-weight: 500;
  font-size: 0.95rem;
  text-decoration: none;
  padding: 14px 28px;
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  font-family: var(--sans);
  transition: background 0.2s ease;
}
.btn:hover { background: var(--sage-dark); }

.link-arrow { font-size: 0.95rem; color: var(--ink-soft); text-decoration: none; }
.link-arrow:hover { color: var(--ink); }

/* ---------- Scroll reveal ---------- */
.reveal { opacity: 0; transform: translateY(16px); transition: opacity 0.6s ease, transform 0.6s ease; }
.reveal.visible { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

- [ ] **Step 2: Verify in browser**

Refresh `http://localhost:4173`.
Expected: page background is warm cream (#F3EFE9); still no content. No console errors.

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: add design tokens, reset, typography and button styles"
```

---

### Task 3: Header, hero, trust strip

**Files:**
- Modify: `index.html` (replace `<!-- header inserted in Task 3 -->` and add the first two sections inside `<main>`)
- Modify: `css/style.css` (append)

- [ ] **Step 1: Add header HTML** (replaces the header comment, before `<main>`)

```html
<header class="site-header">
  <div class="container">
    <a class="brand" href="#top">DE VILLA DESIGN</a>
    <button class="nav-toggle" aria-label="Open menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <nav class="site-nav" aria-label="Main">
      <a href="#work">Work</a>
      <a href="#services">Services</a>
      <a href="#process">Process</a>
      <a href="#contact">Contact</a>
      <a class="btn" href="#contact">Book a free chat</a>
    </nav>
  </div>
</header>
```

- [ ] **Step 2: Add hero + trust strip inside `<main>`** (replace the sections comment; later tasks append after these)

```html
<section class="hero" id="top">
  <div class="container">
    <p class="eyebrow">Websites for health &amp; wellness · Australia</p>
    <h1>Calm, beautiful websites<br>that fill your books.</h1>
    <p class="lede">For clinics, studios and practitioners who want to look as good online as the care they give.</p>
    <div class="hero-actions">
      <a class="btn" href="#contact">Book a free chat</a>
      <a class="link-arrow" href="#work">See recent work →</a>
    </div>
  </div>
</section>

<div class="trust">
  <div class="container">
    <p>Websites for clinics, studios &amp; practitioners across Australia</p>
  </div>
</div>
```

- [ ] **Step 3: Append header/hero/trust CSS to `css/style.css`**

```css
/* ---------- Header ---------- */
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(243, 239, 233, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--line);
}
.site-header .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
}
.brand {
  font-family: var(--serif);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-decoration: none;
  font-size: 1rem;
}
.site-nav { display: flex; align-items: center; gap: 28px; }
.site-nav a { font-size: 0.9rem; text-decoration: none; color: var(--ink-soft); }
.site-nav a:hover { color: var(--ink); }
.site-nav .btn { color: #fff; padding: 10px 18px; }
.nav-toggle { display: none; background: none; border: none; cursor: pointer; padding: 8px; }
.nav-toggle span { display: block; width: 22px; height: 2px; background: var(--ink); margin: 5px 0; }

@media (max-width: 720px) {
  .nav-toggle { display: block; }
  .site-nav {
    position: absolute;
    top: 68px;
    left: 0;
    right: 0;
    flex-direction: column;
    gap: 0;
    padding: 8px 0 16px;
    background: var(--cream);
    border-bottom: 1px solid var(--line);
    display: none;
  }
  .site-header.nav-open .site-nav { display: flex; }
  .site-nav a { padding: 12px 24px; width: 100%; text-align: center; }
  .site-nav .btn { width: auto; margin-top: 8px; }
}

/* ---------- Hero ---------- */
.hero { padding: 96px 0 88px; text-align: center; }
.hero .lede {
  max-width: 480px;
  margin: 20px auto 0;
  color: var(--ink-soft);
  font-size: 1.1rem;
}
.hero-actions {
  margin-top: 36px;
  display: flex;
  gap: 22px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

/* ---------- Trust strip ---------- */
.trust { background: var(--cream-2); padding: 18px 0; text-align: center; }
.trust p {
  margin: 0;
  font-size: 0.75rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
```

- [ ] **Step 4: Verify in browser**

Refresh. Expected: sticky cream header with serif brand + nav; centred hero with serif headline, sage "Book a free chat" button; slim darker trust band below. Narrow the window below 720px: nav collapses to hamburger (menu won't open yet — JS comes in Task 7).

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: add header, hero and trust strip"
```

---

### Task 4: Services and Recent Work sections

**Files:**
- Modify: `index.html` (append inside `<main>`, after the trust strip)
- Modify: `css/style.css` (append)

- [ ] **Step 1: Add services + work HTML**

```html
<section class="section" id="services">
  <div class="container">
    <div class="section-head reveal">
      <h2>What I can do for you</h2>
      <p>I specialise in websites for health &amp; wellness businesses — so yours converts from day one.</p>
    </div>
    <div class="grid-3">
      <div class="card reveal">
        <div class="num">01</div>
        <h3>New websites</h3>
        <p>A complete website designed and built from scratch — structure, design and build, ready to win bookings from day one.</p>
      </div>
      <div class="card reveal">
        <div class="num">02</div>
        <h3>Redesigns</h3>
        <p>Already have a site that isn't pulling its weight? I'll turn it into one that earns trust and converts visitors into clients.</p>
      </div>
      <div class="card reveal">
        <div class="num">03</div>
        <h3>Care &amp; updates</h3>
        <p>Hosting, content changes and small improvements handled for you, so your site stays fresh while you stay focused on clients.</p>
      </div>
    </div>
  </div>
</section>

<section class="section work-section" id="work">
  <div class="container">
    <div class="section-head reveal">
      <h2>Recent work</h2>
      <p>Concept projects showing the calibre your site will get — real client work coming soon. Yours could be first.</p>
    </div>
    <div class="grid-3">
      <div class="work-card reveal">
        <div class="work-shot shot-a">
          <div class="mini" aria-hidden="true">
            <div class="mini-bar"></div>
            <div class="mini-line w-70"></div>
            <div class="mini-line w-50"></div>
            <div class="mini-btn"></div>
          </div>
        </div>
        <div class="work-meta">
          <h3>Serenity Physio</h3>
          <span class="tag">Concept</span>
        </div>
      </div>
      <div class="work-card reveal">
        <div class="work-shot shot-b">
          <div class="mini" aria-hidden="true">
            <div class="mini-bar"></div>
            <div class="mini-line w-70"></div>
            <div class="mini-line w-50"></div>
            <div class="mini-btn"></div>
          </div>
        </div>
        <div class="work-meta">
          <h3>Bloom Yoga Studio</h3>
          <span class="tag">Concept</span>
        </div>
      </div>
      <div class="work-card reveal">
        <div class="work-shot shot-c">
          <div class="mini" aria-hidden="true">
            <div class="mini-bar"></div>
            <div class="mini-line w-70"></div>
            <div class="mini-line w-50"></div>
            <div class="mini-btn"></div>
          </div>
        </div>
        <div class="work-meta">
          <h3>Coastal Dental</h3>
          <span class="tag">Concept</span>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append services + work CSS**

```css
/* ---------- Card grids ---------- */
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
@media (max-width: 860px) { .grid-3 { grid-template-columns: 1fr; } }

.card { background: #fff; border-radius: var(--radius); padding: 28px; }
.card h3 { margin-top: 14px; }
.card p { color: var(--ink-soft); font-size: 0.95rem; margin: 0; }
.card .num { font-family: var(--serif); font-size: 1.4rem; color: var(--sage); }

/* ---------- Work cards ---------- */
.work-card { border-radius: var(--radius); overflow: hidden; background: #fff; }
.work-shot {
  height: 220px;
  padding: 28px 28px 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.shot-a { background: var(--sand); }
.shot-b { background: #C9D3C0; }
.shot-c { background: #E0D2C8; }

.mini {
  width: 100%;
  max-width: 280px;
  background: #fff;
  border-radius: 6px 6px 0 0;
  box-shadow: 0 8px 28px rgba(59, 58, 54, 0.18);
  padding: 16px 18px 20px;
}
.mini-bar { height: 8px; width: 40%; background: var(--cream-2); border-radius: 4px; margin-bottom: 12px; }
.mini-line { height: 6px; background: #EEE9E0; border-radius: 3px; margin: 6px 0; }
.w-70 { width: 70%; }
.w-50 { width: 50%; }
.mini-btn { height: 10px; width: 34%; background: var(--sage); border-radius: 3px; margin-top: 12px; }

.work-meta {
  padding: 18px 24px 22px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.work-meta h3 { font-size: 1.05rem; margin: 0; }
.tag {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: var(--cream-2);
  padding: 4px 8px;
  border-radius: 999px;
  color: var(--ink-soft);
}
```

- [ ] **Step 3: Verify in browser**

Refresh. Expected: three white service cards with sage numerals; three work cards each showing a tinted panel with a white mini-mockup "screenshot" rising from the bottom, name + "CONCEPT" pill below. (Cards are invisible-by-default `.reveal` elements until Task 7 adds JS — temporarily verify by scrolling after Task 7, or check the DOM. This is expected.)

- [ ] **Step 4: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: add services and concept work sections"
```

---

### Task 5: Outcomes band and Process section

**Files:**
- Modify: `index.html` (append inside `<main>`, after the work section)
- Modify: `css/style.css` (append)

- [ ] **Step 1: Add outcomes + process HTML**

```html
<section class="section outcomes">
  <div class="container">
    <div class="section-head reveal">
      <h2>More than pretty — built to grow your practice</h2>
    </div>
    <div class="grid-3">
      <div class="outcome reveal">
        <div class="glyph" aria-hidden="true">↑</div>
        <h3>More bookings</h3>
        <p>Clear calls-to-action and online booking built in, so visitors become clients.</p>
      </div>
      <div class="outcome reveal">
        <div class="glyph" aria-hidden="true">✓</div>
        <h3>Instant credibility</h3>
        <p>Look established and professional from the very first glance.</p>
      </div>
      <div class="outcome reveal">
        <div class="glyph" aria-hidden="true">⌕</div>
        <h3>Found on Google</h3>
        <p>Local SEO foundations so nearby clients can actually find you.</p>
      </div>
    </div>
  </div>
</section>

<section class="section" id="process">
  <div class="container">
    <div class="section-head reveal">
      <h2>A simple, calm process</h2>
      <p>No jargon, no surprises — you'll know exactly where things stand at every step.</p>
    </div>
    <div class="steps">
      <div class="step reveal">
        <div class="step-num">1</div>
        <h3>Chat</h3>
        <p>A free 20-minute call about your goals.</p>
      </div>
      <div class="step reveal">
        <div class="step-num">2</div>
        <h3>Design</h3>
        <p>I craft the look and structure for your approval.</p>
      </div>
      <div class="step reveal">
        <div class="step-num">3</div>
        <h3>Build</h3>
        <p>Your site is built, tested and refined.</p>
      </div>
      <div class="step reveal">
        <div class="step-num">4</div>
        <h3>Launch</h3>
        <p>Live, handed over, and cared for.</p>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append outcomes + process CSS**

```css
/* ---------- Outcomes band ---------- */
.outcomes { background: var(--sage); color: var(--on-sage); }
.outcomes h2 { color: inherit; }
.outcome .glyph { font-size: 1.6rem; }
.outcome h3 {
  font-family: var(--sans);
  font-size: 1rem;
  font-weight: 600;
  margin: 10px 0 6px;
}
.outcome p { color: rgba(243, 239, 233, 0.8); font-size: 0.95rem; margin: 0; }

/* ---------- Process ---------- */
.steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  text-align: center;
}
@media (max-width: 720px) { .steps { grid-template-columns: repeat(2, 1fr); } }
.step-num {
  font-family: var(--serif);
  font-size: 1.3rem;
  color: var(--sage);
  border: 1px solid var(--line);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  background: #fff;
}
.step h3 { font-family: var(--sans); font-size: 1rem; font-weight: 600; margin-bottom: 4px; }
.step p { color: var(--ink-soft); font-size: 0.9rem; margin: 0; }
```

- [ ] **Step 3: Verify in browser**

Refresh. Expected: full-width sage band with three light-on-sage outcome columns; below it, four numbered circular steps on cream.

- [ ] **Step 4: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: add outcomes band and process section"
```

---

### Task 6: Testimonial slot, contact/CTA section, footer

**Files:**
- Modify: `index.html` (append inside `<main>`, then replace the footer comment after `</main>`)
- Modify: `css/style.css` (append)

- [ ] **Step 1: Add testimonial (hidden until a real quote exists) + contact HTML inside `<main>`**

```html
<!-- Testimonial: remove the `hidden` attribute and fill in a REAL client quote.
     Do not publish fabricated quotes. -->
<section class="section testimonial" hidden>
  <div class="container">
    <blockquote class="reveal">
      “Quote from a real client goes here.”
      <cite>— Name, Business, City</cite>
    </blockquote>
  </div>
</section>

<section class="section contact" id="contact">
  <div class="container">
    <div class="section-head reveal">
      <h2>Ready for a website you're proud of?</h2>
      <p>A free 20-minute chat about your goals. No pressure, no jargon.</p>
    </div>
    <!-- TODO at deploy time: replace YOUR_FORM_ID with a real Formspree form ID.
         Until then, JS falls back to a mailto submission. -->
    <form class="contact-form reveal" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
      <div class="field">
        <label for="name">Name</label>
        <input id="name" name="name" type="text" required autocomplete="name">
      </div>
      <div class="field">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" required autocomplete="email">
      </div>
      <div class="field">
        <label for="message">What do you need?</label>
        <textarea id="message" name="message" rows="5" required></textarea>
      </div>
      <button class="btn" type="submit">Send message</button>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>
    <p class="alt">Prefer email? <a href="mailto:hello@devilladesign.com">hello@devilladesign.com</a></p>
    <!-- TODO: add Calendly booking link here once created, e.g.
         <p class="alt">Or <a href="https://calendly.com/devilladesign/intro">book a time directly</a>.</p> -->
  </div>
</section>
```

- [ ] **Step 2: Replace the footer comment (after `</main>`) with footer HTML**

```html
<footer class="site-footer">
  <div class="container">
    <span>De Villa Design · Websites for health &amp; wellness</span>
    <a href="mailto:hello@devilladesign.com">hello@devilladesign.com</a>
    <!-- TODO: add ABN once registered, e.g. <span>ABN 00 000 000 000</span> -->
  </div>
</footer>
```

- [ ] **Step 3: Append testimonial/contact/footer CSS**

```css
/* ---------- Testimonial ---------- */
.testimonial { background: var(--cream-2); text-align: center; }
.testimonial blockquote {
  font-family: var(--serif);
  font-size: 1.5rem;
  line-height: 1.4;
  max-width: 620px;
  margin: 0 auto;
}
.testimonial cite {
  display: block;
  font-family: var(--sans);
  font-style: normal;
  font-size: 0.85rem;
  color: var(--ink-soft);
  margin-top: 16px;
}

/* ---------- Contact ---------- */
.contact { text-align: center; }
.contact-form {
  max-width: 520px;
  margin: 0 auto;
  text-align: left;
  display: grid;
  gap: 16px;
}
.field label {
  font-size: 0.85rem;
  font-weight: 500;
  display: block;
  margin-bottom: 6px;
}
.field input,
.field textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #D9D2C5;
  border-radius: var(--radius);
  background: #fff;
  font: inherit;
  color: var(--ink);
}
.field input:focus,
.field textarea:focus {
  outline: 2px solid var(--sage);
  outline-offset: 1px;
  border-color: var(--sage);
}
.contact-form .btn { justify-self: start; }
.form-status { font-size: 0.9rem; min-height: 1.4em; margin: 0; }
.form-status.success { color: var(--sage-dark); }
.form-status.error { color: #A4472F; }
.contact .alt { margin-top: 22px; font-size: 0.95rem; color: var(--ink-soft); }

/* ---------- Footer ---------- */
.site-footer {
  background: var(--ink);
  color: var(--footer-ink);
  padding: 28px 0;
  font-size: 0.85rem;
}
.site-footer .container {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.site-footer a { color: inherit; }
```

- [ ] **Step 4: Verify in browser**

Refresh. Expected: contact section with centred heading, left-aligned form (cream inputs on white), sage submit button, email alternative below; dark footer with name and email. Testimonial section NOT visible (hidden attribute).

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: add testimonial slot, contact form and footer"
```

---

### Task 7: JavaScript — mobile nav, scroll reveal, form handling

**Files:**
- Modify: `js/main.js` (replace placeholder comment with the following)

- [ ] **Step 1: Write `js/main.js`**

```js
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

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

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
```

- [ ] **Step 2: Verify in browser**

Refresh and check all of:
1. Scroll down — cards/sections fade-and-rise into view once.
2. Narrow below 720px — hamburger opens/closes the menu; tapping a link closes it and scrolls.
3. Submit the form empty — browser validation blocks it.
4. Fill the form and submit — a mailto draft opens (fallback path, since YOUR_FORM_ID is unconfigured).
5. No console errors.

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "feat: add mobile nav, scroll reveal and contact form handling"
```

---

### Task 8: Final verification pass (acceptance criteria from spec)

**Files:**
- Possibly modify: `index.html`, `css/style.css` (only if checks fail)

- [ ] **Step 1: Run the acceptance checklist**

Against `http://localhost:4173`:
1. **Responsive:** check 375px, 768px, 1280px widths — no horizontal scroll, nav usable at all sizes, grids stack correctly.
2. **Anchors:** every nav link and CTA scrolls to the right section, heading not hidden under the sticky header (scroll-margin-top handles this).
3. **Copy sweep:** Australian English; no lorem ipsum; no fabricated testimonials visible.
4. **Accessibility quick pass:** exactly one `h1`; form fields all have labels; `aria-expanded` toggles on the hamburger; focus outlines visible on inputs and links.

- [ ] **Step 2: Run Lighthouse**

Run: `npx -y lighthouse http://localhost:4173 --quiet --chrome-flags="--headless" --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=./lighthouse.json`
Then read the four category scores from `lighthouse.json`.
Expected: ≥ 90 in all four categories. If any score is below 90, fix the reported issues and re-run. Delete `lighthouse.json` afterwards (do not commit it).

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: final responsive/accessibility/Lighthouse polish"
```

(Skip the commit if no changes were needed.)
