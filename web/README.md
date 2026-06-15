# De Villa Design — homepage (Next.js)

Static-exported marketing homepage (Next.js 16 App Router + React 19 + Tailwind v4).
Light "liquid glass" design. Spec + plan:
`../docs/superpowers/specs/2026-06-14-devilla-nextjs-rebuild-design.md`,
`../docs/superpowers/plans/2026-06-14-web-nextjs-rebuild.md`.

## Commands
- `npm run dev` — local dev at http://localhost:3000
- `npm run build` — static export to `out/`
- `npm run test` / `npm run e2e` — unit (Vitest) / e2e (Playwright)
- `npm run lint` / `npm run typecheck`

## Structure
- Content is typed config in `src/content/`.
- Design tokens + glass component classes live in `src/app/globals.css`.
- Section components in `src/components/`; shared primitives in `src/components/ui/`.
  Only `Nav` and `Reveal` are client components.

## Notes
- Work-card / "Browse demos" links point at `/demos/<slug>/` (served by the repo-root
  site). They 404 in isolated `localhost:3000` preview; for full local click-through,
  copy the demos into `public/demos/` (git-ignored, local-only).
- **Deployment is intentionally not wired up.** Prod still serves the repo root until
  the publish dir is switched.
