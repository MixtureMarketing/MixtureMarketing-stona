# Roadmap Mixture Marketing — stan na 2026-05-21

## ✅ FAZA 1: Migracja do Cloudflare (ZAKOŃCZONA, lutego 2026)

Przeniesienie z PHP/Apache/MySQL/SMTP na nowoczesny stack Edge.

- [x] **Cloudflare Pages** — repo zintegrowane, deploy automatyczny przez `wrangler-action@v3` (commit hash w CF dashboard)
- [x] **Cloudflare Workers / Pages Functions** — `functions/` zastąpiło `public/api/*.php`
- [x] **Resend** (email API) — zastąpił PHPMailer/SMTP, templates w workers
- [x] **Cloudflare Turnstile** — zastąpił reCAPTCHA dla form anti-spam
- [x] **Cloudflare KV** — cache + sessions
- [x] **Hyperdrive + D1** — leady i analytics w SQL on Edge
- [x] **Static Site Generation** — Puppeteer prerender (`prerender.js`) dla SEO
- [x] **Sanity CMS** — content (artykuły, branże, miasta, projekty) z headless API
- [x] **`_redirects`** — SPA fallback + 404 handling

## ✅ FAZA 2: SaaS Abonament (ZAKOŃCZONA, maja 2026)

Nowy produkt — `/abonament/` SaaS dla mikrofirm.

- [x] **4 pakiety** (Starter 179 zł / Standard 249 zł / Premium 349 zł / Professional 549 zł)
- [x] **Native `<dialog>` modal** — focus trap + ESC + inert + Top Layer
- [x] **Stripe Checkout** integration via `binary-planet` hub (Cloudflare Workers)
- [x] **Preonboard form** z draft persistence (sessionStorage), inline walidacja onBlur
- [x] **Cross-page consistency:** HeroBadge live-dot, MagneticButton (framer-motion), CountUp
- [x] **3 strony porównawcze** — `/abonament/professional/`, `/vs-wix/`, `/vs-orange-klikai/`
- [x] **Sticky mobile CTA bar** z auto-offset dla CookieFloatingButton
- [x] **DOMPurify** — sanityzacja Sanity CMS HTML (XSS prevention)
- [x] **GA4 funnel events** — view_pricing → click_tier → submit_preonboard → stripe_redirect → purchase

## ✅ FAZA 3: SEO + a11y refactor (ZAKOŃCZONA, maja 2026)

8 grup stron (44 podstrony) przeszły audyt 3-skill (checkout-ux + WCAG 2.2 AA + ui-patterns-2026):

- [x] **Grupa A** — `/abonament/*` (4 strony)
- [x] **Grupa B** — `/`, `/contact/`, `/offers/`, `/audyt-360/` (4)
- [x] **Grupa C** — Local Rzeszów (`/agencja-interaktywna-rzeszow/`, web-dev, seo, miasto) (4)
- [x] **Grupa D** — Doorway pages: 7 miast `noindex` + filter sitemap
- [x] **Grupa E** — `/web-development/` + 4 subroutes
- [x] **Grupa F** — `/marketing/` + 4 subroutes (SEO, Google Ads, Meta Ads, Analytics)
- [x] **Grupa G** — `/design/` + 4 subroutes (UI/UX, branding, print, audyt)
- [x] **Grupa H** — Industries Pseo template (10 branż)

**Wspólne komponenty utworzone:** HeroBadge, HeroTrustLine, FounderCard, StickyMobileBar, MagneticButton, CountUp, WebDev/Marketing/DesignSpokeFooter, InlineContactForm, native `<dialog>` Modal.

**Naprawione blockers:** schema BreadcrumbList + Service na każdej subroute, NAP "biuro wirtualne" zgodne z memory, FAQ semantic `<details>/<summary>`, klikalne div → Link, fake CTA, hub-spoke triangle linking, DOMPurify, modal type unification, `<ol>` timeline, animate-blob orbs, prefers-reduced-motion guards.

---

## ⏳ TODO — czeka na klucze i dane

### KRYTYCZNE (czeka na dostępy od klienta):
- [ ] Google Search Console — realne pozycje, CTR, query gaps, indexation per podstrona
- [ ] Google Business Profile — manager access dla Map Pack visibility + Insights
- [ ] Google Analytics 4 — organic landing pages × konwersje (które grupy A-H najsilniej konwertują)
- [ ] PageSpeed Insights API key — CrUX field data LCP/INP/CLS po refactorze
- [ ] Senuto / Ahrefs / Semrush — wolumen fraz PL + competitive gap

### Pozostałe grupy (P3, do późniejszego sprintu):
- [ ] Grupa I — `/portfolio/` + 7 case studies (wspólny template)
- [ ] Grupa J — `/baza-wiedzy/` 30+ artykułów (wspólny template)
- [ ] Grupa K — `/o-nas/`, `/privacy-policy/`, `/terms/`

### Drugi audyt (gdy klucze będą):
- [ ] Geo-grid rank tracking GBP per fraza Rzeszów
- [ ] Sitemap drift + canonical audit z Senuto
- [ ] AI visibility checks (GPTBot / ClaudeBot / PerplexityBot widzą stronę?)
- [ ] Local SEO citations w katalogach Tier 1 PL

### Continuous improvements:
- [ ] **41 pre-existing TypeScript errors** w komponentach legacy (CI loguje, deploy nie blokuje). Files: `features/audit/dashboard/ModuleDetails.tsx`, `features/audit/HeuristicsGrid.tsx`, `features/audit/steps/AuditDashboard.tsx`, `features/web-development/WebDevInfrastructure.tsx`, `pages/abonament/Abonament.tsx` (lines 1549-1551, COMPARE_ROWS status type), `pages/abonament/VsWix.tsx`, `VsOrange.tsx` (same), `pages/Ecommerce.tsx`, `pages/GoogleAds.tsx` (PricingSection import), `pages/UiUxDesign.tsx`, `portal/admin/*`, `portal/PortalDashboard.tsx`, `sections/FaqSection.tsx`, `visuals/hero/DesignVisual.tsx`, `utils/analytics.ts`, `utils/contactFormHelpers.ts`. Po naprawie usunąć `continue-on-error: true` z CI typecheck step
- [ ] PageSpeed pod Cloudflare Zaraz worker mode (LCP `/web-development/` z 6.2s → ~3.0s mobile)
- [ ] Image sitemap dla portfolio + WebP/AVIF konwersja sygnet.png/favicon.png
- [ ] Outreach lokalne backlinki: nowiny24.pl, rzeszow-news, Klaster IT Podkarpacie, RARR
- [ ] Strona dla Mielca lub Krosna jako test ekspansji regionalnej

---

## 📊 KPI Snapshot

| Metryka | Wartość |
|---|---|
| Stron w sitemap | ~80 |
| Tested w refactorze | 44 podstrony |
| Sprinty zakończone | 22+ |
| Wspólne komponenty | 10+ (HeroBadge, FounderCard, SpokeFooter, etc.) |
| Tests passing | 43/43 |
| Lighthouse a11y (przed/po) | wzrost — gotowy do pomiaru po deploy |
| Dependabot alerts (po fix) | 4 (1 high + 3 moderate, vs 91 przed) |
