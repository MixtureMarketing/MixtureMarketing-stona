# RAPORT f2c-2a — 2026-07-16

Podfaza **f2c-2a: edytor reguł + CREATE modułów/integracji** (pierwsza bramka f2c-2; druga —
f2c-2b: eksport/import). Gałąź `feat/estimation-f2c` z `main` = `9d440ec`. **Bez migracji**
(`est_rules.is_active` już istnieje; CREATE działa na istniejących tabelach).

## Zakres zrealizowany

| # | Zakres | Stan |
|---|---|---|
| 1 | Edytor reguł: edycja wartości drzewa (progi `val`) + parametrów akcji + name/priority/is_active/reason_template; JSON read-only | ✅ |
| 2 | Walidator spójności (sieroty akcji I warunku, poziom poza zakresem) → 400 | ✅ |
| 3 | Adapter reguł z testem kontraktu (korekta architekta) | ✅ |
| 4 | CREATE modułów/integracji: kod snake_case + unikalny, po zapisie immutable; cele/archetypy przez checkboxy | ✅ |
| 5 | Kryterium F2 „reguła zmieniona w UI działa bez deployu" | ✅ (E2E) |

Tworzenie/restrukturyzacja drzewa reguł → **F3** (potwierdzone odroczenie). Eksport/import → **f2c-2b**.

## Odstępstwa od dokumentacji

1. **`est_integrations.category` w CREATE (było wyłączone z EDYCJI w f2c-1).** Kolumna jest
   `NOT NULL`, więc INSERT integracji MUSI ją podać. Dodana do `CREATE_FIELDS.integration`
   z walidacją słownika (`payments/shipping/erp/marketplace/feeds/marketing/other`). Edycja
   kategorii istniejącej integracji nadal poza UI (nie było w zakresie).

## Decyzje podjęte samodzielnie (poziom 1)

- **Walidacja spójności jako osobny czysty moduł** `lib/estimation/ruleValidation.ts`
  (`validateRule` + `buildRuleContext`) — endpoint ładuje kody z D1 i woła walidator PRZED UPDATE.
  Reguła-sierota → 400, nie cichy zapis (zgodne z inwariantem SKILL „błędny kod → skip", ale
  łapane wcześniej). Walidowane: akcje (`min_level` obszar+poziom, `multiplier/module/integration/
  cost_item/recommend_archetype` kody, `cost_item.qty_from` pytanie) ORAZ warunki (liść `q` =
  istniejące pytanie, operator ze słownika), plus poprawność JSON i niepusta lista akcji.
- **Adapter reguł z testem kontraktu** (`library/ruleAdapter.ts`) — JEDYNE miejsce znające
  format surowego wiersza reguły; `toRuleModel`/`ruleToPatch` symetryczne, round-trip pod testem.
  Zmiana formatu eksportu (f2c-2b) zapali test adaptera, nie wysypie UI.
- **Tożsamość reguły = `id`** (niezmienne); pełny odczyt edytora przez `GET ?scope=editor`
  (reguły też nieaktywne + `is_active`) — osobno od engine-facing GET (nie psujemy podglądu wizarda).
  `useEditorRules` — dedykowany hook.
- **`RulesEditor` aktualizuje stan NIEMUTUJĄCO** (immutable) — `setLeafValAt` przebudowuje drzewo,
  `react-hooks/immutability` wymusiło to i tak (i słusznie). Koercja `val` do typu oryginału
  (próg liczbowy zostaje liczbą).
- **`CreateItemForm`: `numField` to funkcja zwracająca JSX, nie komponent** — komponent w renderze
  remontowałby input i gubił focus po każdym znaku.
- **`is_active` reguł wystawiony w UI** (toggle) — w f2c-1 był w API, nie w formularzu.

## Decyzje czekające

- **Poziom 2 (Jakub): brak nowych.** Bez migracji, bez zależności, CI nietknięte. Nie zmieniam
  wartości w seedach — udostępniam Tobie edycję/tworzenie przez UI.
- **Poziom 3 (architekt): brak otwartych.** Bez zmiany schematu, formuł, kolejności obliczeń
  (bez bumpu `engine_version`) ani semantyki ewaluacji względem docs/05.

## Wyniki testów

`npm run build:full` (czysty env, potwierdza też fix `prerender.js` na main) — **exit 0**:

- lint 0/0; testy **349 passed (40 plików)**; typecheck **15 = baseline** (0 w plikach f2c-2a)
- size-limit: `index.js` **67,76 kB / 300 kB** (edytor reguł+CREATE w lazy chunku — bundle płaski),
  `index.css` **29,12 kB / 50 kB**; audit:health **61/0**

Dołożone w f2c-2a: **+39** (310 → 349)

| plik | testy |
|---|---|
| `ruleValidation.test.ts` | 14 |
| `library.test.ts` (rule/create/scope) | +9 |
| `libraryEdit.test.ts` (rule/create) | +9 |
| `ruleAdapter.test.ts` | 5 |
| `RulesEditor.test.tsx` | 2 |

**Baza od zera, dwa razy**: migracje 0001–0007 ✅; seedy ×2 idempotentne (rules 58, modules 32,
questions 41, aspects 31 — identyczne po obu przebiegach).

## Kryteria akceptacji (E2E na żywym `pages dev` + lokalne D1 — 12/12 OK)

| kryterium | dowód |
|---|---|
| auth | admin `scope=editor` **200**, klient **403** |
| **reguła bez deployu** | próg reguły #1 `critical_247`→`critical_999` (PATCH **200**) → **nowa wycena `high_availability` sug=0**, **stara sug=2 (snapshot zamrożony)** |
| sierota AKCJI | `suggest_module` na nieistniejący kod → **400** |
| sierota WARUNKU | liść `q="widmo"` → **400** |
| poziom poza zakresem | `min_level` poziom 9 → **400** |
| CREATE modułu | **201** → widoczny w `GET /library` |
| duplikat kodu | **409** |
| zły kod | `Zly-Kod` (nie snake_case) → **400** |

Kryterium F2 „reguła zmieniona w UI działa bez deployu" — **domknięte**. Pozostaje
„import/eksport round-trip" → **f2c-2b**.

## Ryzyka i długi

1. **Edycja zakresów istniejących modułów** (`goals_json`/`archetypes_json` przez checkboxy) —
   w CREATE jest, w EDYCJI istniejącego modułu jeszcze nie (generyczny `EntityTable` ma pola
   tekstowe/liczbowe, checkboxy nie pasują). Do f2c-2b albo szlifu.
2. **Eksport/import** — cała f2c-2b (diff, atomowość, dry-run, removed-nie-kasowane).
3. **Restrukturyzacja drzewa reguł / tworzenie reguł od zera** → F3 (świadome).
4. **Edytor reguł na dużej liście** (58 reguł) — bez paginacji/filtra; przy rozroście do rozważenia.

## Propozycja następnego kroku

1. Akceptacja raportu → merge (delegacja) + deploy. **Bez rytuału migracji** (0 zmian schematu) —
   tylko deploy kodu. Rytuał seedów niepotrzebny (nie dotykam wartości).
2. **f2c-2b**: eksport/import JSON z dry-run (domyka ostatnie kryterium F2), + edycja zakresów
   istniejących modułów jeśli zmieści się w bramce.
