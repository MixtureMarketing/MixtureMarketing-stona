# RAPORT f4b — 2026-07-17

Faza **f4b: UI publicznego kalkulatora wyceny (`/wycena/`)**. Gałąź `feat/estimation-f4b` z
`origin/main` (`337cece`). **Sesja UI** — granica własności: żadnych zmian w
`functions/api/estimation/*`, `lib/estimation/*` (poza read-only importem `matchCondition`),
`migrations/`, seedach. Konsumuje ŻYWE, zweryfikowane API modułu wycen (kontrakt v1.1).

## Zakres zrealizowany

| # | Zakres | Stan |
|---|---|---|
| 1 | Wielokrokowy formularz **data-driven** z GET `public-questions` (render z API, `visible_if` honorowane przez reużyty `matchCondition` — parytet z wizardem) | ✅ |
| 2 | Submit: e-mail wymagany + walidacja, **Turnstile invisible** (`utils/turnstile.ts` z fixa), honeypot; wynik = `priceRange` + „orientacyjne widełki — nie wiążąca oferta" + CTA (Umów rozmowę) | ✅ |
| 3 | Stany: loading / 429 / 403 / błąd sieci — po ludzku; wynik bez odświeżenia (SPA) | ✅ |
| 4 | Umiejscowienie: **dedykowana `/wycena/`** (pSEO — Seo, intro prerenderowane); stary kalkulator Sanity **nietknięty** (wygaszenie po akceptacji nowego) | ✅ / decyzja L2 czeka |
| 5 | E2E na preview (real Turnstile) | ⏸ blokada tokenu CF |

Pliki: `services/calculatorService.ts`, `components/features/calculator/{formLogic,QuestionField,CalculatorForm,CalculatorResult,CalculatorStates,PublicCalculator}`, `hooks/usePublicCalculator.ts`, `components/pages/WycenaCalculator.tsx`, `config/routes.tsx`, `routes.js`. Diff: 14 plików, +1011.

## Odstępstwa od dokumentacji
- **Kroki formularza = grupy pytań z API** (nie 1 pytanie/krok). Dane `question_group` sterują krokami; ostatni krok = kontakt (e-mail). Zgodne z „wielokrokowy" + „data-driven"; kontrakt niezmieniony.
- Brak innych odstępstw. Kontrakt `kontrakt-kalkulator-publiczny.md` zaimplementowany po stronie klienta 1:1 (zwrot tylko `priceRange`, honeypot, Turnstile, e-mail wymagany).

## Decyzje podjęte samodzielnie (poziom 1)
- **2 warstwy: pure `formLogic` (testowalna) + hook (orkiestracja).** Widoczność przez `matchCondition` z silnika — zero duplikacji logiki.
- **Reużycie `TurnstileWidget`** (invisible-execute) z fixa lead-capture — ten sam prymityw, zgodnie z wymogiem „reużywalny loader".
- **Etykiety grup, copy wyniku i CTA** (treść UI, honest per DESIGN.md).
- **Guard `isPrerendering`** na stronie — intro prerenderowane pod SEO, interaktywny kalkulator tylko w przeglądarce (w Puppeteerze brak żywego API).
- **`/wycena` jako trasa** (rekomendacja z planu; łatwo zmienialna).

## Decyzje czekające
- **Poziom 2 (Jakub):** (a) potwierdzenie umiejscowienia **`/wycena/`** vs sekcja `/offers`; (b) **wygaszenie starego kalkulatora Sanity** (`components/features/PriceCalculator.tsx` w `Offers.tsx`) + ewentualny redirect — **po akceptacji nowego na prodzie** (timing/decyzja).
- **Poziom 3 (architekt):** brak — UI konsumuje żywe, chronione API; polityka ujawniania rozstrzygnięta w kontrakcie.

## Wyniki testów
`npm run build:full` — **exit 0**: lint **0/0**; **vitest 440 passed (55 plików)** — +18 f4b
(formLogic 8, usePublicCalculator 5, QuestionField 5); typecheck **10 = baseline** (0 w f4b);
**size-limit** `index.js` **69,27 kB / 300**, `index.css` **27,2 kB / 50**; audit:health **62/0**;
**`/wycena/` prerender healthy**; kalkulator w **osobnym lazy chunku** `WycenaCalculator-*.js`
**12,18 kB** (index bez wzrostu).

**Baza od zera ×2: N/D** — f4b jest czysto UI (zero migracji/seedów/D1). Nie dotyczy.

## Kryteria akceptacji

| kryterium | dowód |
|---|---|
| Renderuje z API (data-driven), `visible_if` honorowane | `formLogic.test` (visibleQuestions ukrywa/pokazuje wg `matchCondition`); render z GET w hooku |
| Wynik = tylko `priceRange` + uczciwy komunikat + CTA | `CalculatorResult` + test happy-path hooka (result.priceRange) |
| Stany loading/429/403/sieć po ludzku, bez reloadu | `usePublicCalculator.test` (429 → komunikat, phase ready); `humanError` test |
| Wszystko nowe w **lazy chunku** | size-limit: kalkulator `WycenaCalculator-*.js` 12 kB; index.js bez wzrostu |
| `build:full` zielony, typecheck bez nowych błędów | jw. |
| **Routing `/wycena/` 200 z Pages** | ⏸ **do preview/prod** (ZASADY §1 — nie dowodzę lokalnie) |
| **E2E preview: UI 200 + `priceRange` z Turnstile** | ⏸ **blokada: brak żywego tokenu CF** (placeholder `[JAKUB WKLEJA]`; §5 — nie wskrzeszam z historii) |

## Ryzyka i długi
1. **Preview-E2E + routing-na-Pages niedowiedzione** — czekają wyłącznie na token CF (Pages:Edit, TTL 24h). Cała logika UI pokryta testami; brakuje warstwy Pages/real-Turnstile.
2. **Stary kalkulator** dubluje funkcję do czasu wygaszenia — świadome, decyzja L2 o timingu.
3. **Weryfikacja draft/lead w D1 + sprzątanie wpisów testowych (preview I prod)** = sesja wycen (granica własności) — po smoke prod.

## Propozycja następnego kroku
1. **Świeży token CF** (Pages:Edit) → preview deploy → dowód UI (200 + `priceRange`, zrzut/JSON) + `/wycena/` 200 z Pages.
2. Akceptacja raportu → **merge JAKUB** → smoke prod (`/wycena/` 200 + jeden realny przebieg).
3. **Sygnał sesji wycen:** weryfikacja draft/lead w D1 + sprzątnięcie testów z preview i prod.
4. Po akceptacji nowego na prodzie: **f4c** lub wygaszenie starego kalkulatora (redirect).
