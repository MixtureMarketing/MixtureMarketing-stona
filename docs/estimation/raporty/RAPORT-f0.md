# RAPORT f0 — 2026-07-14

Gałąź: `feat/estimation-f0` (10 commitów, base `main`). Diff: 37 plików, +4062/−11.
Wszystkie dowody uzyskane lokalnie (D1 `--local` / `wrangler pages dev`).

## Zakres zrealizowany

Kroki F0 z `docs/estimation/07-plan-wdrozenia.md`:

- **krok 0 — scaffolding** ✅ docs/estimation/ (00–07, PROMPTS, ZASADY-PRACY, SEED-LEVELS-DOCX), skille `/faza` `/zamknij-faze`, SKILL.md, sekcja CLAUDE.md.
- **F0.1 — migracja `0003_estimation_core.sql`** ✅ 18 tabel `est_*` (12 biblioteka + 6 warstwa wycen), 1:1 z docs/02, addytywna, `IF NOT EXISTS`.
- **F0.2 — seedy (11 plików)** ✅ 31 obszarów, 155 poziomów, 8 archetypów + 104 domyślne, 40 pytań, 34 reguły, 27 modułów, 37 integracji, 4 mnożniki, 7 typów kosztów, 8 parametrów. Idempotentne, spójne referencyjnie.
- **F0.3 — silnik `lib/estimation/`** ✅ `types.ts` + `engine.ts` (pure TS: `matchCondition`, `evaluateRules`, `aggregate`, `computeConfidence`, `validateForFinalize`, `ENGINE_VERSION=1.0`) + `engine.test.ts` (30 testów TDD).
- **F0.4 — endpoint + zakładka** ✅ `functions/api/admin/estimation/quotes.ts` (GET) + test (3); lazy zakładka „Wyceny" w `AdminDashboard` + `QuotesList.tsx` (osobny chunk), deep-link `?tab=wyceny`.
- **F0.5 — `_redirects`** ✅ `/portal/* → /index.html 200` nad catch-allem; `routes.js`/sitemap pomijają `/portal` (zweryfikowane: 0 wzmianek w sitemap).

Poza planem (infrastruktura testowa): `wrangler.d1.toml` (Opcja B), `migrations/seed/README.md`.

## Odstępstwa od dokumentacji

1. **Fix migracji `0002` (edycja prod-zaaplikowanej migracji — normalnie poziom 2 nietykalny).**
   Dotyczy: `migrations/0002_leads_add_source_company.sql`. Usunięto dwa martwe
   `ALTER TABLE leads ADD COLUMN source/company` (zostaje `CREATE INDEX`). Powód: `0001`
   (`CREATE TABLE IF NOT EXISTS leads`) już tworzy te kolumny, więc na czystej bazie ALTERy
   rzucały `duplicate column: source` i blokowały `wrangler d1 migrations apply` (kryterium F0).
   **Analiza równoważności (na żądanie architekta): TAK** — schemat docelowy identyczny w każdym
   kontekście występującym odtąd (prod: 0002 już zaaplikowane, brak re-runu, wrangler nie
   sprawdza hasha; świeża baza: kolumny gwarantuje 0001). Fix tylko uodparnia na czyste
   środowisko. Wykonane po eskalacji i **jawnej zgodzie Jakuba**. Do przeglądu architektonicznego.

2. **D22 — konwencja poziomów otwartych „X+"** (decyzja architekta w tej sesji). Dotyczy:
   `docs/estimation/04` + `SEED-LEVELS-DOCX` (opisują „X+" bez górnej granicy). W `levels.sql`
   31 poziomów 4 ma `hours_max = 1.5 × hours_min` (wcześniej `= hours_min`). Dopisane jako D22
   do `docs/estimation/00`.

3. **Reguły `recommend_archetype` / `archetype_warning` odłożone do F1.** Dotyczy: `docs/05`
   (opisuje je jako część kroku „Platforma"). W F0 archetyp jest bezpośrednim pytaniem; te
   reguły wymagają wizardowego przepływu wyboru platformy (F1). Seed `rules.sql` ich nie zawiera.

## Decyzje podjęte samodzielnie (poziom 1)

- Nazwy/struktura plików silnika i UI; `QuotesList` jako pojedynczy komponent listy.
- `wrangler.d1.toml` jako **Opcja B** (dedykowany, poza odczytem CF Pages) — wybór potwierdzony przez Jakuba.
- Idempotencja `rules.sql` przez **jawne id + ON CONFLICT(id)** (bez dodawania UNIQUE do schematu 02).
- Koercja `k/m` w operatorach liczbowych silnika (`"300k"` → 300000) — deterministyczna.
- Reprezentacja itemów (moduły/integracje) w agregacji jako grupa `items` wyceniana stawką globalną (v1 jedna stawka — bez wpływu na wynik; struktura per-kategoria gotowa na stawki kategorii).

## Decyzje czekające

**Poziom 2 → Jakub (właściciel treści, inwariant 2):**
- Przegląd wartości DRAFT w seedach: progi 34 reguł v1, `unknown_weight` 40 pytań, taryfy `custom`
  integracji (przyjęte ×2), górne granice L4 wg D22 (1.5×), `travel.unit_price` (1,15 zł/km).
- `wrangler.d1.toml`: `database_id` = placeholder — wstaw prawdziwe id z dashboardu CF przed `--remote`.

**Poziom 2/3 → architekt (przegląd w chacie):**
- Zatwierdzenie odstępstwa #1 (edycja `0002`) — czy akceptowalne trwale, czy wymaga innego wzorca (np. reset/squash migracji).
- Krok migracji D1 w CI — odłożony poza F0 (decyzja Jakuba); do zaprojektowania gdy będą sekrety CF.

## Wyniki testów

- **`npm run build:full` — EXIT 0** (pełny, z `.env.local`): lint `--max-warnings 0` ✅ · **76 testów** (13 plików) ✅ · vite build ✅ · sitemap (79 URL, 0× /portal) ✅ · prerender ✅ · size-limit: index **67.74 kB / 300**, CSS **28.99 kB / 50** ✅ · audit:health **61 healthy / 0 broken** ✅.
- **Silnik:** 30 testów TDD (operatory, „nie wiem", monotoniczność min_level, cap 0.40, bufor, oferta z inwariantami, poziom 0, poziom 4 D22, override min>max, pusta wycena, Confidence). Przypadki agregacji liczone ręcznie w komentarzach.
- **Endpoint:** 3 testy (lista / pusta → `[]` / błąd → 500).
- **TS baseline:** 15 błędów = tyle co `main` (0 nowych).

## Kryteria akceptacji (z dowodami)

- ✅ **`migrations apply` na czystej bazie** — `16 + 2 + 25 commands executed successfully` (0001→0002→0003, 18 tabel `est_*`); po fixie 0002.
- ✅ **seedy idempotentne** — PASS 1 i PASS 2 wszystkie `ok` na czystej bazie.
- ✅ **100% testów silnika** — 30/30; pokrycie: pusta wycena, poziom 0, cap, „nie wiem", override min>max.
- ✅ **zakładka admin-only** — E2E `wrangler pages dev`: admin `Bearer admintoken123` → **200** `{"quotes":[]}`; klient → **403** `{"error":"Admin access required"}`; brak tokenu → **401**.
- ✅ **deep-link `?tab=wyceny` po refreshu** — reguła `/portal/* → /index.html 200` w `_redirects`; init `activeTab` z URL.
- ✅ **`build:full` zielony, bundle bez wzrostu** — EXIT 0; moduł w lazy chunku `QuotesList--Smnw0NP.js` (2.9 kB), poza `index`.
- ⚠️ **„na kopii produkcyjnej"** — niezweryfikowane lokalnie (brak dostępu do prod D1); logicznie 0003 to jedyna pending migracja na prod-copy, standalone-clean. Do potwierdzenia przy pierwszym `--remote`.

## Ryzyka i długi

- **Wartości DRAFT w seedach** — silnik „ładny, ale kłamie" dopóki Jakub nie skalibruje reguł/widełek. Bramka jakości to test retrospektywny w F1 (07). To najważniejszy dług.
- **Fix 0002** — jednorazowe naruszenie zasady „nie edytuj zaaplikowanych migracji"; uzasadnione równoważnością, ale wymaga akceptacji architekta co do wzorca na przyszłość.
- **`wrangler.d1.toml` database_id = placeholder** — działa `--local`; `--remote`/CI wymaga prawdziwego id.
- **Kryterium „kopia produkcyjna"** — niesprawdzone bez prod D1.
- **Reguły `recommend_archetype` odłożone** — krok „Platforma" (F1) musi je dodać, inaczej wybór archetypu jest ręczny bez rekomendacji.

## Propozycja następnego kroku

Po akceptacji raportu + przeglądzie architektonicznym sekcji Odstępstwa/Decyzje: **merge do `main`**
(Jakub). Następnie **FAZA 1** (`feat/estimation-f1`): wizard formularza biznesowego → podgląd na
żywo → walidacja techniczna → `quote_finalize` (serwerowe przeliczenie + snapshot) → ekran wyniku.
Bramka jakości F1: test retrospektywny na 2 znanych projektach (07) — to moment kalibracji seedów
DRAFT przez Jakuba.
