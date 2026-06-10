# De Villa Design — Website Design Spec

**Date:** 2026-06-10
**Status:** Approved direction; pending final user review of this document

## Purpose

A marketing website for De Villa Design (devilladesign.com), a web design business
that builds websites for small businesses. The site's job is to win clients: it
must *itself* be the proof of design quality, and convert visitors into a free
intro call.

## Positioning (locked during brainstorming)

- **Target market:** Australia (native English removes the language constraint;
  solid budgets AUD $2,000–6,000/site; less competition than US/UK).
- **Niche:** Health & wellness, kept broad — clinics, studios, practitioners,
  therapists, med spas.
- **Voice:** Calm, professional, jargon-free. Australian English spelling
  (e.g. "specialise", "colour").
- **Primary conversion goal:** "Book a free chat" — a free 20-minute intro call.

## Visual Direction (locked: "Calm & Premium")

- **Palette:** warm cream background `#F3EFE9`, secondary panel `#ECE6DB`,
  ink text `#3B3A36`, sage green accent `#6B7A5E` (buttons, accents),
  dark footer `#3B3A36` with `#CFC9BD` text.
- **Typography:** elegant serif for headings (Google Fonts: Fraunces), clean
  sans for body/UI (Inter). Generous whitespace,
  unhurried spacing.
- **Feel:** soft neutrals, earth tones, breathing room — fluent in the wellness
  aesthetic; looks expensive and trustworthy.

## Site Structure

**v1 is a one-page site** with anchor navigation (Work · Services · Process ·
Contact scroll to sections). One page keeps v1 shippable and focused; separate
case-study pages can come later once there is real client work.

Homepage sections, in approved order:

1. **Hero** — eyebrow ("Websites for health & wellness · Australia"), headline
   "Calm, beautiful websites that fill your books.", subline, primary CTA
   "Book a free chat", secondary link "See recent work →".
2. **Trust strip** — slim band: "Trusted by wellness businesses across
   Australia" with logo placeholders.
3. **Services** — three cards: New websites · Redesigns · Care & updates.
4. **Recent work** — three portfolio cards. Until real client work exists,
   these are polished *concept* pieces (e.g. Serenity Physio, Bloom Yoga
   Studio, Coastal Dental), honestly labelled as concept work.
5. **Outcomes band** (sage background) — More bookings · Instant credibility ·
   Found on Google.
6. **Process** — four steps: Chat → Design → Build → Launch.
7. **Testimonial** — one quote slot; ships with placeholder styling and gets
   real quotes later (no fabricated client quotes on the live site).
8. **Final CTA** — "Ready for a website you're proud of?" + Book a free chat.
9. **Footer** — business name, tagline, hello@devilladesign.com, ABN slot.

## Conversion & Contact

- All "Book a free chat" buttons scroll to the Contact section.
- Contact section contains: email link (hello@devilladesign.com), a simple
  contact form, and a slot for a Calendly/booking link (added when Andre
  creates one).
- The form posts to a no-backend form service (Formspree or equivalent) so the
  site stays static. Until the service is configured, the form falls back to a
  `mailto:` submission.

## Technical Approach

- **Stack:** static site — semantic HTML, modern CSS, a small amount of vanilla
  JS (smooth scroll, mobile nav, scroll-reveal). No framework, no build step.
  Rationale: fastest to ship, trivially hostable, easy for a designer to tweak,
  and performance is itself a sales point.
- **Files:** `index.html`, `css/style.css`, `js/main.js`, `assets/` for images.
- **Responsive:** mobile-first; nav collapses to a simple menu on small screens.
- **SEO basics:** title/meta description targeting "web design for health &
  wellness Australia", Open Graph tags, semantic headings, alt text,
  `LocalBusiness`/`ProfessionalService` JSON-LD.
- **Performance:** system-font fallbacks, optimised images, no heavy libraries.
  Target Lighthouse 90+ across the board.
- **Hosting (post-build):** any static host (Netlify / Cloudflare Pages /
  GitHub Pages) pointed at devilladesign.com. Deployment is out of scope for
  this spec but the output must be host-ready static files.

## Error handling

Static site — minimal surface. The contact form validates required fields
client-side and shows a clear success/failure message; if the form service is
unreachable, the mailto fallback link is always visible.

## Testing / acceptance

- Renders correctly on mobile (375px), tablet, and desktop widths.
- All nav anchors and CTAs scroll to the right sections.
- Form validation works; submit succeeds against the configured endpoint (or
  mailto fallback).
- Lighthouse: 90+ performance/accessibility/best-practices/SEO.
- Australian English throughout; no lorem ipsum left anywhere.

## Out of scope (v1)

- Separate case-study pages, blog, pricing page (revisit after first clients).
- CMS integration.
- Analytics (can be added at deploy time).
- Domain/DNS/hosting setup.
