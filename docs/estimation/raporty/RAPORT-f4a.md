# RAPORT f4a — 2026-07-17

Faza **f4a: publiczny kalkulator — warstwa API na wspólnym silniku.** Gałąź `feat/estimation-f4a`
z `origin/main` (`f784fc7`, po redesignie). **Bez migracji** (wariant a, E3.3). Bez zmian silnika/
`engine_version` (transform publiczny = warstwa prezentacji). Kontrakt: `docs/estimation/kontrakt-kalkulator-publiczny.md` v1.1 (ZATWIERDZONY).

## Zakres zrealizowany

| # | Zakres | Stan |
|---|---|---|
| 1 | Publiczny endpoint wyceny bez auth (pytania `visibility='public'` → silnik → **wynik zawężony**: tylko `priceRange`, zero godzin/Karty) + lead + draft w panelu | ✅ |
| 2 | Treści klienckie w pytaniach/wyniku — **wariant (a)**: pytania w języku klienta (`text`), bez nowych kolumn (E3.3) | ✅ |
| 3 | Ochrona: Turnstile (honeypot + siteverify), rate-limit KV (5/h/IP), walidacja wejścia (filtr kodów public + typy) + retry/backoff D1 (dług F3) | ✅ |
| 4 | Kontrakt API (`kontrakt-kalkulator-publiczny.md`) — źródło prawdy f4a+f4b, zatwierdzony przed kodem | ✅ |
| 5 | Poza f4a: UI (f4b), rekomendacja platformy (f4b), portal/rabaty (f4c), stary `/offers` | świadomie pominięte |

Pliki: `lib/estimation/{publicOffer,publicQuote,retry}.ts` (pure) + `functions/api/estimation/{_engineDb,_rateLimit,public-questions,public-quote}.ts` + seedy `questions.sql`/`params.sql`. Diff: 16 plików, +1396/−1.

## Odstępstwa od dokumentacji

- **Podział logiki inny niż w tabeli D planu.** Plan zakładał `computePublicResult` w `_engineDb.ts`.
  Wydzieliłem CZYSTĄ logikę do `lib/estimation/publicQuote.ts` (`computePublicQuote`, `sanitizePublicAnswers`,
  `parsePublicConfig`), a `_engineDb.ts` został cienką glue-warstwą D1 (`loadRawLibrary`, `loadPublicQuestionDefs`).
  Powód: TDD — matematyka i wiring testowalne bez bazy (przypadki kontrolne liczone ręcznie). Zgodne z ZASADY §1
  (TDD dla logiki). Kontrakt niezmieniony.
- Poza tym brak odstępstw — kontrakt v1.1 zaimplementowany 1:1 (w tym korekta §5 architekta: top-pick `recommend_archetype`).

## Decyzje podjęte samodzielnie (poziom 1)

- **Split pure/glue** (jw.) — struktura pod TDD.
- **Obronne domyślne parametrów** w `parsePublicConfig` (`0.15`/`500`/`5` przy braku klucza) — wzorzec jak
  `parseParams` w `toLibraryData.ts` (`hourly_rate` 50 itd.); wartość autorytatywna żyje w `est_params` (inwariant 2 zachowany).
- **Globalny fallback archetypu `'laravel'`** jako stała (spec §5, hit tylko przy braku rekomendacji i celu spoza mapy).
- **Rate-limit fail-open** przy błędzie KV (awaria cache nie blokuje; twardą bramą jest Turnstile).
- **Testowy sekret Turnstile Cloudflare** (`1x000…AA`) w lokalnym bindingu E2E — mechanizm testowy CF, NIE obejście
  w kodzie (siteverify wołane uczciwie); dowód z realnym tokenem → smoke prod.
- `withRetry` w `lib/estimation/` (pure, thunk) — użyty w zapisie public-quote; szersza adopcja pozostaje w backlogu.

## Decyzje czekające

- **Poziom 2 (Jakub):** `RESEND_API_KEY` na Pages **nieustawiony** (raport scalenia) → e-mail potwierdzający
  **degraduje łagodnie** (POST i tak zwraca cenę, lead+draft zapisane — zweryfikowane lokalnie bez RESEND).
  Akceptowalne na start; ustawienie klucza włączy maile. **Zależność Jakuba.**
- **Poziom 2 (Jakub):** kuratela/rozszerzenie zbioru pytań publicznych (starter 8 zatwierdzony dla v1).
- **Poziom 3 (architekt):** brak otwartych (E3.1–E3.4 rozstrzygnięte).

## Wyniki testów

`npm run build:full` — **exit 0**: lint **0/0**; **vitest 417 passed (51 plików)**; build (vite+sitemap+prerender)
OK; **size-limit** `index.js` **69,25 kB / 300**, `index.css` **27,17 kB / 50**; audit:health **61/0**.
Typecheck: **10 błędów = baseline** (było 15; **0 w plikach f4a**). Nowe testy: **+31** (publicOffer 7, retry 3,
_rateLimit 5, publicQuote 9, public-questions 1, public-quote 6).

**Baza od zera ×2** (świeże D1, migracje 0001–0008 + seedy ×2): liczby identyczne oba przebiegi —
aspects 31, levels 155, questions 41, rules 58, modules 32, integrations 37, **params 15** (11+4 public),
**pytania public 8**, params public 4. Idempotencja seedów public potwierdzona.

## Kryteria akceptacji (E2E na `wrangler pages dev` + lokalne D1)

| kryterium | dowód |
|---|---|
| **K1** parytet silnika, zwrot tylko `priceRange` | POST happy-path → **200** `{"priceRange":{"min":26000,"max":50500},"currency":"PLN","status":"ok"}`; zero pól wewnętrznych (hours/confidence/quoteId/archetype) |
| **K2** GET tylko public, bez wycieków | GET → **200**, 8 pytań (`project_goal…frontend_headless`), pola: `code,text,help_text,answer_type,options,visible_if,group,sort_order`; brak `unknown_weight`/`visibility`/`options_json` |
| **K3** Turnstile/honeypot/rate-limit | honeypot **403**, zły email **400**, brak `project_goal` **400** (na żywym serwerze); rate-limit 429 pokryty testem jednostkowym |
| **K4** transform z parametrów, bez bumpu engine_version | przypadek kontrolny `{32400,46000}`→`{27500,53000}` liczony ręcznie w teście; `ENGINE_VERSION` niezmienione |
| **K5** lead + draft + odpowiedzi | D1: draft `Kalkulator — e2e-f4a@test.local — 2026-07-17` status `draft`, `archetype_code=laravel` (z reguły recommend_archetype), `lead_id` powiązany; lead `source=calculator` budget `26000 - 50500`; **8 odpowiedzi** w `est_quote_answers` |
| **K-routing (Pages)** | ⏸ **do smoke prod po merge** — dowód routingu Pages + **realny Turnstile** wymaga preview/prod. Brak tokenu CF do preview (§5 — nie samozaopatruję). Uwaga: sitekey Turnstile może odrzucać `*.pages.dev` (zawężone hostnames) — Jakub dodaje `pages.dev` na czas testu albo domykamy na prodzie. |

## Ryzyka i długi

1. **Dowód Pages-routing + realny Turnstile odłożony na smoke prod** (brak tokenu CF do preview; caveat hostname
   Turnstile). Logika Functions w pełni dowiedziona lokalnie; brakuje wyłącznie warstwy Pages (ZASADY §1).
2. **RESEND_API_KEY nieustawiony** — maile milczą (degradacja łagodna). Zależność Jakuba.
3. **Rate-limit miękki** (KV eventually consistent) — świadome; Turnstile jest twardą bramą.
4. **`withRetry`** użyty tylko w public-quote — szersza adopcja retry/backoff D1 w endpointach admina nadal w backlogu F3.

## Propozycja następnego kroku

1. Przegląd architekta (sekcje „Odstępstwa" + „Decyzje" niepuste).
2. **Rytuał prod** (TY): komplet seedów (bez migracji — f4a addytywne w seedach); bezpiecznik
   `migrations list --remote` = brak pending; liczby przed/po dla `est_*`; weryfikacja: pytania public 8,
   params public 4, wyceny #4/#5/#9/#10 + moduły 36/reguły 59 (DRAFT) nietknięte. Token CF od Jakuba.
3. **Merge JAKUB** → deploy.
4. **Smoke prod** (TY, realny Turnstile): GET public-questions 200 z Pages + POST happy-path → `priceRange`
   + draft widoczny w panelu „Wyceny" + lead w bazie; potem **sprzątnięcie draftu/leada testowego** (D1).
5. Potem **f4b** (UI kalkulatora, sesja redesignu — kontrakt jako wejście).
