# RAPORT f2c-2b — 2026-07-16

Podfaza **f2c-2b: eksport/import JSON + edycja zakresów istniejących modułów** (ostatnia bramka
f2c). Gałąź `feat/estimation-f2c` z `main` = `6d0889b`. **Bez migracji** (operacje na istniejących
tabelach), bez bumpu `engine_version`.

## Zakres zrealizowany

| # | Zakres | Stan |
|---|---|---|
| 1 | Eksport: pełny zrzut biblioteki (schema_version, exported_at, liczniki, też nieaktywne, deterministyczny) — plik do pobrania | ✅ |
| 2 | Import: dry-run (raport added/changed/removed + ostrzeżenia + błędy) → apply przy zerze błędów; atomowy upsert bez kasowania; `est_quote*` nietknięte | ✅ |
| 3 | Edycja `goals_json`/`archetypes_json` istniejących modułów (checkboxy data-driven) | ✅ |
| 4 | Backlog: docs F3 „retry/backoff D1" | ✅ |
| 5 | **Dopięcie WS2**: ostrzeżenie gaszonego/nieobecnego kodu (nie błąd blokujący) | ✅ |

## 🔴 Bug złapany przez E2E (i jego skutek dla f2c-2a na prodzie)

Round-trip E2E **wykrył realny fałszywy-pozytyw** w `ruleValidation`: reguły warunkujące na
`q:"archetype"` (np. „Aplikacja custom | archetype∈{laravel,headless}", docs/05) były odrzucane
jako „nieistniejące pytanie" — bo `archetype` to **syntetyczna odpowiedź** wstrzykiwana przez silnik
(`quote.ts: answers.archetype = quote.archetype_code`), nie wiersz `est_questions`. Naprawione:
whitelist `SYNTHETIC_Q` (świadomy wyjątek od inwariantu 2, jak `INTEGRATION_QUESTIONS`).

**Skutek szerszy:** ten sam fałszywy-pozytyw jest **latentny w f2c-2a na produkcji** — edycja
którejkolwiek z 5 reguł warunkujących na `archetype` przez edytor dostałaby 400. **Deploy f2c-2b
naprawia to na prodzie.** (Smoke f2c-2a testował tylko regułę #1 na `downtime_tolerance`, więc nie
złapał.) To argument, by nie zwlekać z mergo f2c-2b.

## Odstępstwa od dokumentacji

1. **Zakresy = tylko moduły** (rozstrzygnięcie a). `goals_json`/`archetypes_json` istnieją wyłącznie
   na `est_modules` (0004). Integracje nie mają kolumn zakresu — ich model zależności to taryfa
   platform/custom. Kolumna zakresu integracji = przyszły świadomy Level 3, nie teraz.

## Decyzje podjęte samodzielnie (poziom 1)

- **Klucz dopasowania reguł = `id`** (nie mają `code`) — nota o ograniczeniu przenośności cross-DB
  przy `SCHEMA_VERSION` w `libraryPack.ts` (v2 = stabilny klucz reguł, koncern paczek wiedzy F4).
- **`exported_at` poza porównaniem diff** — round-trip porównuje wiersze encji, nie metadane.
- **Rdzeń paczki czysty** (`lib/estimation/libraryPack.ts`): `buildExport`, `computeLibraryDiff`,
  `validateImport`, `computeImportWarnings` — testowalne bez D1. Warstwa D1 (`packDb.ts`, bez
  `onRequest*` → nie trasa) robi odczyt/upsert.
- **Model błąd vs ostrzeżenie** (dopięcie WS2): stan docelowy = `current ⊕ incoming` (upsert,
  no-delete). BŁĄD (blokuje apply) = reguła wskazuje kod NIEOBECNY w stanie docelowym. OSTRZEŻENIE
  (nie blokuje) = żywa reguła wskazuje kod OBECNY, ale `is_active=0` (gaszony) — cichy no-op przez plik.
- **`'checkboxes'` jako nowy `FieldKind`** w `EntityTable` — data-driven źródła (cele z `project_goal`,
  archetypy z `est_archetypes`); serializacja do posortowanego JSON, puste → `null` („wszystkie").
- **Import = upsert bez kasowania**; „removed" (w DB, brak w pliku) raportowane, gaszenie tylko przez
  `is_active=0` w pliku. Atomowy `D1 batch`. `est_quote*` nigdy nie dotykane (asercja w teście).

## Decyzje czekające
- **Poziom 2 (Jakub): brak.** Bez migracji, zależności, CI. Nie zmieniam wartości w seedach.
- **Poziom 3 (architekt): brak.** Bez zmiany schematu/formuł/semantyki.

## Wyniki testów

`npm run build:full` (czysty env) — **exit 0**: lint 0/0; testy **372 passed (43 pliki)**;
typecheck **15 = baseline** (0 w f2c-2b); size-limit `index.js` **67,77 kB / 300 kB** (paczka+import
w lazy chunku — bundle płaski), `index.css` **29,05 kB / 50 kB**; audit:health **61/0**.

Dołożone w f2c-2b: **+23** (349 → 372)

| plik | testy |
|---|---|
| `libraryPack.test.ts` (export+diff) | 7 |
| `libraryPackValidate.test.ts` (walidacja+ostrzeżenia) | 7 |
| `library-import.test.ts` (endpoint) | 6 |
| `EntityTable.test.tsx` (checkboxy) | +2 |
| `ruleValidation.test.ts` (regresja archetype) | +1 |

**Baza od zera ×2**: migracje 0001–0007 ✅; seedy ×2 idempotentne (rules 58, modules 32, aspects 31).

## Kryteria akceptacji (E2E na żywym `pages dev` + D1 — 13/13 OK)

| kryterium | dowód |
|---|---|
| auth | admin export **200**, klient **403** |
| **round-trip** | export → import dry-run → **wszystkie encje unchanged**, błędy 0 (kryterium F2 domknięte) |
| import zmienia wprzód | apply zmienionego modułu → **200**, biblioteka po nowemu (56→63), **`est_quotes` nietknięte** |
| sierota w imporcie | reguła→`ghost_import` → dry-run błąd, **apply 400 (zablokowany)** |
| **ostrzeżenie gaszony** | plik gasi `omnibus` (sugerowany przez regułę) → **errors 0, warning obecne** |
| zakres modułu | PATCH `goals_json` → **200**, zapisane |

**Kryteria F2 domknięte w całości** (import/eksport round-trip był ostatni).

## Ryzyka i długi

1. **Przenośność reguł cross-DB** (klucz `id`) — paczki wiedzy między bazami to F4 (`schema_version` v2).
2. **Import zorientowany na pełny pack** — częściowe importy działają (diff wspiera), ale UX/semantyka
   „paczek modułowych" to przyszłość.
3. **retry/backoff D1** — w backlogu F3 (blip ze smoke f2c-2a).
4. **Edycja zakresu integracji** — świadomie poza (brak kolumn; Level 3 na przyszłość).

## Propozycja następnego kroku

1. Akceptacja raportu → merge (delegacja) + deploy. **Bez rytuału** (0 zmian schematu/seedów) —
   sam deploy kodu. **Deploy niesie fix `archetype`** (naprawia latentny 400 edytora reguł na prodzie).
2. Smoke prod: export 200 + round-trip dry-run diff pusty; edycja reguły warunkującej na `archetype`
   (np. #29) → 200 (dowód, że latentny bug zniknął).
3. **f2c domknięte** — cały System Wycen ma edytor biblioteki: proste tabele + treści klienckie +
   reguły + CREATE + eksport/import. Następne: F3 (zamknięcie, kalibracja, raporty) albo pierwsza
   realna oferta (ruch Jakuba).
