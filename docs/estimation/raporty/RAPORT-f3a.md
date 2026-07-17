# RAPORT f3a — 2026-07-16

Faza **f3a: domknięcie cyklu życia danymi rzeczywistymi** (pierwsza podfaza F3; kalibracja/raporty
= f3b, silnik = f3c). Gałąź `feat/estimation-f3` z `main` = `2775be7`. Migracja 0008 **addytywna**
(jedna kolumna), bez bumpu `engine_version`.

## 🔴 Eskalacja Level 3 — rozstrzygnięta (B)

Brief proponował kolumnę `est_quote_aspects.actual_hours`. Zderzenie ze stanem: **tabela faktów
`est_actual_hours` już istnieje** (0003), docs/02 ją specyfikuje, docs/03 kalibracja z niej czyta
(obszary po `aspect_code`, moduły/integracje po `ref_code`). Architekt rozstrzygnął **B**: fakty
w `est_actual_hours` (brief był błędny — duplikat = dwa źródła prawdy + nie pokrywa itemów).
**Migracja 0008 = wyłącznie `est_quotes.closed_at`**; `actual_note` niepotrzebny (`est_actual_hours.note`).

## Zakres zrealizowany

| # | Zakres | Stan |
|---|---|---|
| 1 | Migracja 0008: `est_quotes.closed_at` (addytywna) | ✅ |
| 2 | Przejście `won → closed` (guard) + `closed_at` stemplowane | ✅ |
| 3 | Formularz zamknięcia (won/closed): tabela obszarów+pozycji, realne godziny, 5 minut | ✅ |
| 4 | Read-back: `actualHours` + `closed_at` w GET quote (fundament f3b) | ✅ |

## Decyzje podjęte samodzielnie (poziom 1 — zatwierdzone w planie)

- **Rozdział close/status.** `quote-status` robi przejście `won→closed` (+`closed_at`); nowy
  `quote-close` zapisuje wyłącznie fakty (`est_actual_hours`), NIE rusza statusu. Dzięki temu
  actuale są **edytowalne po `closed`** (status zostaje). Formularz woła oba.
- **Puste godziny = brak wiersza** (kasowanie „nie mierzyliśmy"); `hours < 0` → 400 (atomowo).
- **`actualHours` jako mapa** `aspect_code → {hours, note}` w GET; klucz obejmuje itemy
  (`module:X`/`integration:Y`) — pod kalibrację f3b (docs/03 „ten sam raport po ref_code").
- **Guard `quote-close`:** tylko wyceny `won`/`closed` (godziny nie mają sensu wcześniej) → 409.
- **`ResultScreen` rozbity** (limit 400 linii): wydzielony `ResultDecisions` (prezentacja) +
  `CloseProjectForm`. Zachowanie bez zmian.

## Decyzje czekające
- **Poziom 2 (Jakub): brak.** Migracja addytywna (closed_at pre-zatwierdzony w briefie), bez zależności/CI.
- **Poziom 3: rozstrzygnięty** (B). Brak otwartych.

## Wyniki testów

`npm run build:full` (czysty env) — **exit 0**: lint 0/0; testy **386 passed (46 plików)**;
typecheck **15 = baseline** (0 w f3a); size-limit `index.js` **67,66 kB / 300 kB**,
`index.css` **29,11 kB / 50 kB**; audit:health **61/0**.

Dołożone w f3a: **+14** (372 → 386)

| plik | testy |
|---|---|
| `quote-close.test.ts` | 7 |
| `quote-status.test.ts` (won→closed) | +1 |
| `quote.test.ts` (read-back actuals) | +1 |
| `CloseProjectForm.test.tsx` | 3 |

**Baza od zera ×2**: migracje 0001–0008 ✅ (0008 addytywne); seedy ×2 idempotentne (rules 58,
modules 32); `est_quotes.closed_at` obecne.

## Kryteria akceptacji (E2E na żywym `pages dev` + D1 — 12/12 OK)

| kryterium | dowód |
|---|---|
| `won → closed` | **200** + `closed_at` ostemplowane |
| zapis godzin | `quote-close` → `est_actual_hours` (saved 2) |
| read-back | GET zwraca `actualHours.frontend=45` + `note` + `closed_at` |
| **edycja po closed** | ponowny `quote-close` (45→50) → **200**, status **nadal closed** |
| puste = kasowanie | `hours:null` → wiersz zniknął z read-back |
| guardy | `closed→sent` **409**, godziny ujemne **400**, `quote-close` na `review` **409** |

Pokrywa F3 krok 1 („zamknięcie wyceny godzinami rzeczywistymi"). Raport MPE/kalibracja = f3b.

## Ryzyka i długi
1. **Item actuals w UI** — formularz zbiera też moduły/integracje (klucz `module:`/`integration:`),
   fundament pod kalibrację itemów f3b (docs/03). Gotowe.
2. **retry/backoff D1** — nadal w backlogu F3 (blip z f2c-2a).

## Propozycja następnego kroku
1. Akceptacja raportu → **rytuał prod: 0008 na prod D1 PRZED deployem** (nowy `quote`/`quote-status`
   czytają/piszą `closed_at`; odwrotna kolejność = 500). Bezpiecznik `migrations list --remote`
   pending = wyłącznie 0008. Merge JAKUB → smoke.
2. Smoke: `won→closed` na wycenie testowej (albo #4/#5 jeśli zdecydujesz) + `quote-close` + read-back.
3. **f3b**: raport estimated-vs-actual (MPE), ekran kalibracji, „podobne wyceny", mini-dashboard.
