# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Marketing agency site + SaaS product (`/abonament/`) for **Mixture Marketing** (Rzeszów, PL). React 19 SPA prerendered to static HTML for SEO, hosted on Cloudflare Pages. Content is bilingual-leaning Polish; most code comments and CMS content are in Polish.

## Commands

```bash
npm install --legacy-peer-deps   # deps require legacy peer resolution (CI writes .npmrc with legacy-peer-deps=true)
npm run dev                      # Vite dev server — NOTE: config sets port 3000, README says 5173; check console
npm run build                    # clean → convert images → vite build → sitemap → prerender → size-limit
npm run lint                     # ESLint (--max-warnings 0) + Prettier via eslint-plugin-prettier — must pass, blocks CI
npm run test                     # Vitest watch mode
npm run test -- --run            # Vitest single run (as in CI)
npm run format                   # prettier --write .
npx tsc --noEmit -p tsconfig.json  # typecheck — see "TypeScript" gotcha below
```

Run a single test file / test:
```bash
npm run test -- --run tests/services/leadService.test.ts
npm run test -- --run -t "creates a lead"
```

Sanity Studio is a **separate project** in `studio-mixture-marketing/` with its own `package.json` — `cd` in and `npm install && npm run dev` (port 3333).

## Architecture

**Rendering model — SPA + build-time SSG.** The app is a client-side React Router SPA (`index.tsx` → `App.tsx`), but every public route is prerendered to a static `index.html` at build time by `prerender.js` (Puppeteer). Cloudflare Pages serves the prerendered HTML, then React hydrates. This is the core constraint to keep in mind for almost any change:

- `prerender.js` boots `vite preview`, then visits each route with a headless browser and writes `dist/<route>/index.html`. It sets `window.isPrerendering = true` — components that touch browser-only APIs, open modals, or load third-party widgets (Turnstile, Zaraz) **must guard on this flag** (see `App.tsx` excluding `ContactModal` during prerender).
- It waits for React Helmet to finish hydrating `<title>` + canonical + meta description before snapshotting, so **SEO tags come from `Seo.tsx` via react-helmet-async**, not static HTML.
- Beasties inlines critical CSS per page during prerender.
- `dist/404.html` is generated from the `NotFound` component (`noindex`) for Cloudflare's soft-404 handling.

**Route sources — three places must stay in sync:**
1. `config/routes.tsx` — the actual React Router route table (all `lazy()`-loaded). This is what renders.
2. `routes.js` — a plain-JS list of static paths consumed **only** by `prerender.js` and `scripts/generate-sitemap.js`. Static/hardcoded pages must be listed here (with trailing slashes) or they won't be prerendered/in the sitemap.
3. Dynamic routes (`/baza-wiedzy/:slug`, `/branza/:slug`, `/miasto/:slug`, `/portfolio/:slug`) are fetched from Sanity at prerender time in `prerender.js` — no manual listing needed.

When adding a static page: add the component + route in `config/routes.tsx` AND the path in `routes.js`.

**Content model — two sources:**
- **Static content** lives in `data/content/**` (typed TS objects: pages, services, articles). Most service/landing pages read from here.
- **Sanity CMS** (`services/cms/*`) drives dynamic collections: articles (`article`), industries (`industry`), locations (`location`), case studies (`caseStudy`), config, pricing. `services/cms/client.ts` exposes `client`, `urlFor()`, and `fetchWithCache()` (5-min in-memory TTL). Programmatic-SEO pages render via `components/templates/pseo/PseoTemplate` with `mode="industry" | "location"`.
- Note: `/baza-wiedzy/` articles have **two origins** — hardcoded React components (custom UI/animation, in `components/articles/`) and Sanity `article` docs (rendered by `ArticleTemplate`). The sitemap generator dedupes by slug, preferring the static version.

**Contact / lead flow.** `services/leadService.ts` (client) → `POST /api/contact-submit` → `functions/api/contact-submit.ts` (Cloudflare Pages Function). The function verifies a Turnstile token, checks a honeypot field (`website_verify`), and emails the agency via Resend. Actions: `create | update | send_notification | get_lead`. **There is no persistence** — `get_lead` always returns `null`, so the "resume form from email" path in `App.tsx` is effectively inert server-side. This function replaced a legacy PHP backend; the API shape is kept identical for compat.

**Global state via React Context** (`context/`): `ModalContext` (the single global `ContactModal`, opened via `useModal().openModal(type, data)` — also fires GA4 events), plus `AuthProvider`, `NotificationProvider`. The contact modal is a native `<dialog>` (focus trap); tests include a jsdom guard for `showModal`/`close`.

**Analytics.** GA4 events go through Cloudflare Zaraz (`window.zaraz.track` / `utils/analytics.ts` `trackEvent`). Web Vitals (`index.tsx`) forward to GA4 as `web_vital_*` events. Key funnel events: `consultation_click`, `audit_request`, `calculator_submit`, `lead_start`, `contact_form_success`.

**SaaS abonament** (`components/pages/abonament/`): self-serve Stripe Checkout via an external "binary-planet" hub (`VITE_MM_HUB_URL`), draft persisted in `sessionStorage`, preonboard in a native `<dialog>` modal. `/abonament/dziekujemy` is `noindex` and intentionally excluded from sitemap.

## Conventions & gotchas

- **Path alias:** `@/` → repo root (both `tsconfig.json` and `vite.config.ts`). Import as `@/components/...`.
- **TypeScript typecheck is non-blocking in CI** — there is a baseline of pre-existing TS errors (see `.github/workflows/ci.yml` `continue-on-error` on the typecheck step and the ROADMAP note). Lint and unit tests **do** block. Don't assume a green build means zero TS errors; avoid adding new ones.
- **Bundle size is enforced:** `size-limit` runs at the end of `build` (index JS ≤ 300 kB, CSS ≤ 50 kB). Prefer `lazy()` for heavy/rare deps (recharts, jspdf, framer-motion usage) — `vite.config.ts` `manualChunks` only pins react/router/helmet as eager vendor chunks; everything else should stay in lazy chunks.
- **`console`/`debugger` are stripped in production builds** (`esbuild.drop`).
- Tailwind **v4** (via `@tailwindcss/vite`, config-less) — no `tailwind.config.js`.
- User-generated/CMS HTML must be sanitized with **DOMPurify** before `dangerouslySetInnerHTML`.
- CI: `push` to `main` runs quality → build → deploy to Cloudflare Pages project `mixturemarketing-stona`. Markdown-only changes are skipped (`paths-ignore`). Gitleaks scans secrets. Node 22.

## Environment variables (`.env.local`)

Build/prerender needs `VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET`. Abonament needs `VITE_MM_PREONBOARD_KEY`, `VITE_MM_HUB_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`. Cloudflare Function secrets (set in CF Pages, not `.env`): `TURNSTILE_SECRET`, `RESEND_API_KEY`, `NOTIFY_EMAIL`. See `.env.example`.
