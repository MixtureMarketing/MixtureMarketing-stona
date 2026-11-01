# Mixture Marketing — mixturemarketing.pl

Strona firmowa + SaaS abonament (`/abonament/`) agencji marketingowej Mixture Marketing z Rzeszowa.

## 🚀 Stack

**Frontend:** React 19 · TypeScript · Tailwind CSS v4 · Vite 6 · Framer Motion · Lucide React

**Routing/Render:** React Router 7 (SPA) · Puppeteer prerender (SSG dla SEO/AI search)

**Content:** Sanity CMS (artykuły, branże, miasta, projekty, pricing tiers) — folder `studio-mixture-marketing/`

**Backend / Edge:** Cloudflare Pages (hosting) · Cloudflare Workers (`functions/`) · Hyperdrive + D1 (SQL) · KV (cache) · Resend (email) · Turnstile (anti-spam)

**SaaS Abonament:** Stripe Checkout (via `binary-planet` hub) · GA4 funnel events · sessionStorage draft persistence

**Security:** DOMPurify (XSS prevention) · Gitleaks scan w CI · native `<dialog>` modal (focus trap)

## 📦 Quickstart

```bash
# 1. Klon + dependencies
npm install --legacy-peer-deps

# 2. Skopiuj env example, uzupełnij własne klucze
cp .env.example .env.local

# 3. Dev server
npm run dev
# → http://localhost:5173

# 4. Sanity Studio (osobno, w innym terminalu)
cd studio-mixture-marketing
npm install
npm run dev
# → http://localhost:3333
```

## 🔑 Environment variables (`.env.local`)

```bash
# Sanity CMS (wymagane do build + prerender)
VITE_SANITY_PROJECT_ID=...
VITE_SANITY_DATASET=production

# SaaS Abonament — Stripe via binary-planet hub
VITE_MM_PREONBOARD_KEY=...
VITE_MM_HUB_URL=https://api.mixturemarketing.pl
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... # lub pk_live_

# Cloudflare deploy (tylko w GitHub Actions secrets)
# CLOUDFLARE_API_TOKEN
# CLOUDFLARE_ACCOUNT_ID
```

## 🛠 NPM scripts

```bash
npm run dev         # Vite dev server (HMR)
npm run build       # Vite + sitemap + prerender + size-check
npm run lint        # ESLint + Prettier
npm run test        # Vitest (43 testów)
npm run test -- --run    # Vitest jednorazowo (jak w CI)
npm run audit:health     # Custom health audit (a11y/seo/perf)
```

## 🧪 Testing

- **Vitest** + Testing Library — 43 testy w `tests/`
- Native `<dialog>` defensive guard dla jsdom (showModal/close fallback)
- CI: lint + typecheck (non-blocking baseline 41 ts errors) + unit tests + build + deploy

## 📬 Leady → Linear

Źródłem prawdy dla leadów jest D1 (`leads`). Zgłoszenia z formularza kontaktowego, audytu i kalkulatora zapisują się w D1, a agencja dostaje maila przez Resend (`NOTIFY_EMAIL`, `RESEND_API_KEY`). Zadanie w Linearze (zespół LEA) tworzy moduł `functions/api/_linear.ts` po udanym zapisie w D1 (w tle: formularz, audyt, kalkulator), a niewysłane zgłoszenia ponawia `POST /api/leady/ponow` (osobny sekret i prefiks podpisu).

**Mixture CRM — wysyłka wyłączona.** Strona nie wysyła już leadów do `mixture-crm.pages.dev` (w kodzie od 2026-10-31; na produkcji od wdrożenia tej gałęzi). Zostaje tylko odczyt: `GET /api/crm/leady` (podpisany, od `updated_at`), którym CRM sam dociąga leady. Dawny moduł wysyłki leży w `functions/_archiwum/_crm.ts.txt` (test: `_crm.test.ts.txt`); rozszerzenie `.txt` sprawia, że Pages nie tworzy trasy, a `tsc` i `vitest` plików nie czytają. Zmienne `CRM_INGEST_URL` i `CRM_INGEST_SECRET` są już nieużywane; usunięcie ich z panelu Cloudflare robi Jakub po wdrożeniu na produkcję.

## 🚀 Deploy

**Automatyczny** przez GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml)):

```
push → main → Quality → Build → Deploy do Cloudflare Pages
```

- Concurrency cancel-in-progress (oszczędza minuty CI)
- Cache: `node_modules` + puppeteer chromium + converted images
- Gitleaks security scan
- 4 jobs: quality (lint+typecheck+tests), build (Vite+prerender), deploy (wrangler-action@v3)

**Cloudflare Pages projekt:** `mixturemarketing-stona`

## 📁 Struktura

```
mixturemarketing-stona/
├── components/              # React komponenty
│   ├── pages/              # Routes pages (Home, Abonament, Marketing, Design, etc.)
│   ├── sections/           # Sekcje Home (Hero, Services, WhyUs, LeadMagnet, KB)
│   ├── features/           # Feature modules (audit, contact, marketing, design)
│   ├── common/             # Reusable: HeroBadge, FounderCard, StickyMobileBar,
│   │                       #          WebDevSpokeFooter, MarketingSpokeFooter,
│   │                       #          DesignSpokeFooter, native <dialog> Modal
│   ├── templates/pseo/     # Sanity-driven: PseoIndustry (10 branż), PseoLocation
│   └── articles/           # Baza wiedzy (30+ artykułów)
├── data/content/           # Static content (hero, faq, pricing, etc.)
├── config/                 # Site config, routes, breadcrumbs
├── services/               # CMS service, lead service
├── functions/              # Cloudflare Workers (api/contact, api/audit)
│   └── _archiwum/          # wyłączone moduły (np. _crm.ts.txt — wysyłka do Mixture CRM)
├── public/                 # Static assets, _redirects, sitemap
├── scripts/                # Build scripts: convert-images, generate-sitemap, audit-health
├── studio-mixture-marketing/  # Sanity Studio (osobny projekt)
├── tests/                  # Vitest tests
├── prerender.js            # Puppeteer SSG engine
└── ROADMAP.md              # Status faz / TODO
```

## 🎯 Główne sekcje produktu

- **`/`** Home — hero z Audyt 360™ jako primary CTA (lead magnet)
- **`/abonament/`** SaaS — 4 pakiety (179/249/349/549 zł/mc) ze Stripe Checkout + native `<dialog>` modal preonboard
- **`/web-development/`** + 4 subroutes — corporate / ecommerce / landing-page / custom-app
- **`/marketing/`** + 4 subroutes — SEO / Google Ads / Meta Ads / Analytics
- **`/design/`** + 4 subroutes — UI/UX / branding / print / visual-audit
- **`/audyt-360/`** — interaktywny audyt strony (lead form)
- **`/miasto/rzeszow/`** + **`/agencja-interaktywna-rzeszow/`** — local SEO pillar
- **`/branza/*`** — 10 branż Sanity-driven Pseo
- **`/baza-wiedzy/`** — 30+ artykułów

## 📈 Performance

- Critical CSS inline (Critters)
- LCP optimization: preload kluczowych obrazów
- Code splitting: lazy() na rzadkich sekcjach (Recharts, etc.)
- WebP/AVIF konwersja obrazów (script `scripts/convert-images.js`)
- Cloudflare Pages CDN globally
- Zaraz worker mode (opcjonalnie — w roadmapie LCP ~3s mobile)

## 📚 Dokumentacja

- [ROADMAP.md](ROADMAP.md) — status faz, TODO, KPI snapshot
- Per-grupa audity i sprinty udokumentowane w git log commitów

## 📞 Kontakt

- **Email:** info@mixturemarketing.pl
- **Telefon:** +48 794 443 551
- **Adres rejestrowy:** Al. Józefa Piłsudskiego 17/4, 35-074 Rzeszów (biuro wirtualne — pracujemy mobilnie)
- **Sp. z o.o. PL** · KRS 0001034514 · NIP PL5170435774 · REGON 525228202
