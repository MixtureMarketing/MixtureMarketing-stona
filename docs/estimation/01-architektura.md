# 01 — Architektura i integracja z istniejącą aplikacją

## Stan zastany (repo MixtureMarketing-stona, main, lipiec 2026)

- React 19 SPA (Vite, Tailwind v4 config-less, react-router, lazy routes) + prerender SSG (Puppeteer) — hosting **Cloudflare Pages**, deploy GitHub Actions (`wrangler-action@v3`).
- Backend: **Pages Functions** w `functions/api/**`; bindingi: `DB` (D1), `FILES` (R2), KV; sekrety w CF Pages (Resend, Turnstile).
- Auth: magic link (`/api/auth/send_magic_link` → `verify_token`), sesja jako Bearer token w tabeli `users` (`session_token`, `session_expires`, `role: 'client'|'admin'`). Middleware `functions/api/admin/_middleware.ts` chroni cały prefiks `/api/admin/*`.
- Panel admina: route `/portal/admin` → `components/portal/AdminDashboard.tsx` z zakładkami (`AdminLeads`, `AdminProjects`, `AdminClients`, `AdminChat`, `AdminMetrics`) + hooki `useAdminData` / `useAdminActions`.
- D1: tabele `users`, `leads` (source: website/calculator/audit), `projects`, `milestones`, `messages`, `documents`, `auth_tokens`, `logs`, `performance_metrics`; migracje w `migrations/*.sql`.
- `jspdf` w zależnościach; kalkulator publiczny generuje PDF client-side i wysyła przez `/api/calculator-submit` (R2 + Resend + lead).
- Ograniczenia repo: size-limit (index JS ≤ 300 kB → wszystko nowe jako lazy chunk), ESLint blokujący, Vitest, 41 baseline'owych błędów TS (nie dokładać nowych), treści PL.

## Umiejscowienie systemu wycen

### Frontend
```
components/portal/admin/estimation/
  EstimationTab.tsx          # wejście: lista wycen + przycisk „Nowa wycena"
  QuoteWizard/               # formularz biznesowy (kroki: archetyp → pytania → wynik)
  QuoteValidation/           # walidacja techniczna: obszary, poziomy, uzasadnienia, override
  QuoteItems/                # moduły, integracje, pozycje kosztowe
  QuoteResult/               # agregacja, widełki, Confidence, akcje (zapis, PDF)
  QuoteClose/                # zamknięcie: godziny rzeczywiste per obszar
  library/                   # CRUD biblioteki: obszary/poziomy, reguły, moduły, integracje, archetypy, parametry
  reports/                   # estimated vs actual, MPE, propozycje kalibracji (faza 3)
  usePricingEngine.ts        # czysty TS: ewaluacja reguł + agregacja (współdzielony docelowo z kalkulatorem publicznym)
```
- Nowa zakładka **„Wyceny"** w `AdminDashboard` obok istniejących; cały moduł ładowany `lazy()` (limit bundla).
- **Routing/gotcha `_redirects`:** `/portal/*` NIE ma dziś SPA fallbacku — głębokie linki (`/portal/admin/wyceny/123`) trafią w catch-all 404. Decyzja: v1 prowadzi nawigację wewnątrz zakładki (stan + `?quote=123` w query stringu), a do `public/_redirects` dodajemy `/portal/*  /index.html  200` nad catch-allem, żeby odświeżenie strony i linki działały. `/portal/*` pozostaje poza `routes.js` (nie prerenderujemy paneli) i poza sitemapą.
- Silnik obliczeń (`usePricingEngine.ts` + `lib/estimation/engine.ts`) pisany jako **czyste funkcje TS bez zależności od React/DOM** — ten sam kod wykona się w komponencie (podgląd live podczas spotkania) i w Pages Function (wynik autorytatywny przy zapisie). Testy jednostkowe silnika w Vitest obowiązkowe.

### Backend (Pages Functions)
```
functions/api/admin/estimation/
  quotes.ts            # GET lista / POST nowa / PUT update (draft)
  quote_finalize.ts    # POST: serwerowe przeliczenie + snapshot + status
  quote_close.ts       # POST: godziny rzeczywiste, status closed
  library.ts           # CRUD: aspects, levels, rules, modules, integrations, archetypes, questions, params
  reports.ts           # estimated vs actual, MPE (faza 3)
```
- Prefiks `/api/admin/estimation/*` → istniejący `_middleware.ts` autoryzuje automatycznie (rola admin). **Zero nowej autoryzacji.**
- Walidacja wejścia: zod (już w zależnościach przez @hookform/resolvers — potwierdzić; jeśli nie, lekka walidacja ręczna jak w istniejących funkcjach).

### Baza danych
- Nowe migracje `migrations/0003_estimation_*.sql`+ (schemat w 02-model-danych.md). Wszystkie tabele z prefiksem `est_` — brak kolizji z istniejącą tabelą `projects`.
- Seed wiedzy (obszary, poziomy, pytania, reguły, biblioteka) jako migracje seedujące lub skrypt `scripts/seed-estimation.ts` uruchamiany przez wrangler — decyzja w fazie 0 (preferencja: osobne pliki seed SQL, wersjonowane w repo, bo to „wiedza jako dane" i musi być w git).

## Powiązania z istniejącymi danymi

- `est_quotes.lead_id → leads.id` (nullable). Ścieżka: lead z formularza/kalkulatora → „Utwórz wycenę" w AdminLeads → wycena podpięta pod lead.
- `est_quotes.project_id → projects.id` (nullable). Po wygranej: istniejący `convert_lead` tworzy projekt → wycena podpina `project_id`; godziny rzeczywiste raportuje się z poziomu wyceny przy zamknięciu projektu.
- Klient/nazwa na wycenie kopiowane z leada, edytowalne (nie każda wycena ma lead).

## Generowanie PDF oferty

- v1: **client-side jspdf** (wzorzec z kalkulatora publicznego — `wycena_mixture.pdf`), lazy chunk. Szablon: logo, dane klienta, zakres per kategoria, moduły/integracje, pozycje kosztowe, widełki ofertowe, wyłączenia z zakresu, ważność oferty.
- Zapis kopii PDF do R2 (`FILES`) przez endpoint (jak `calculator-submit`) + link w wycenie.
- Jeśli jakość typografii jspdf okaże się niewystarczająca → fallback: Cloudflare Browser Rendering (HTML→PDF) jako osobna decyzja; nie blokuje v1.

## Parametry globalne (edytowalne w panelu, tabela `est_params`)

`stawka_domyslna` (50), `cap_mnoznikow` (0.40), `bufor` (0.10), `oferta_wsp_min` / `oferta_wsp_max` (zawężanie widełek, 03), `zaokraglenie_pln` (100), progi Confidence (80/60), `stawka_km` i `stawka_nocleg` (pozycje kosztowe dojazdu).

## Bezpieczeństwo i jakość

- Cały moduł za istniejącym auth; brak endpointów publicznych w v1 (kalkulator publiczny = przyszła faza z osobnym, ograniczonym endpointem read-only na regułach).
- Dane wycen zawierają dane klientów → obowiązują istniejące praktyki repo (brak logowania PII do `logs`, DOMPurify przy renderowaniu treści wpisywanych ręcznie).
- Testy: silnik obliczeń pokryty Vitest (przypadki brzegowe: cap, poziom 0, brak odpowiedzi, konflikt reguł); funkcje API testowane jak istniejące.
- Lint/size-limit/CI bez zmian — moduł musi przechodzić `npm run build:full`.
