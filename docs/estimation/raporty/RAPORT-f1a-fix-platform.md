# RAPORT f1a-fix — krok Platforma (pakiet B/C, przegląd architekta) — 2026-07-14

Gałąź: `feat/estimation-f1`. Commit fix: `aff7b57` (+ test `e79b3f5`). 101/101 testów, build:full EXIT 0.

## Przyczyna źródłowa (Część A) — z dowodem

**Integracja silnik↔UI NIE była martwa — działa.** Reprodukcja w przeglądarce (puppeteer, tryb dev,
log wejścia/wyjścia `evaluateRules` przy każdej zmianie) wykazała: przy poprawnym komplecie
odpowiedzi rekomendacja pojawia się prawidłowo (`custom_logic=false` → ★ WooCommerce). Mój pierwszy
„repro" przez `puppeteer el.click()` dawał fałszywy negatyw (klik w środek bounding-boxa nie trafiał
po re-renderze); realny/ludzki klik rejestruje odpowiedź.

**Faktyczna przyczyna obserwacji „pusto / Medusa":** kombinacja UX + luk seedów:
kolejność pytań (bool przed `project_goal`), mylące brzmienie `frontend_headless`
(„React/headless/PWA" → klient odpowiada „Tak" myśląc o nowoczesności), brak reguły dla
`portal_tresci`, oraz komunikat „Odpowiedz na pytania…" nierozróżniający „czekam" od „brak
dopasowania".

**Dlaczego testy f1a/E2E nie „złapały":** bo nie było buga w kodzie integracji — potwierdza to
nowy `PlatformStep.test.tsx` (RTL + realne reguły + symulacja klików), który przechodzi. Luka była
w SIATCE testów (brak testu na widoczną rekomendację z realnymi regułami), nie w kodzie — zamknięta
klasą testu.

**Rule 38 (Medusa) nadczuła?** NIE. Warunek = `frontend_headless=true AND custom_logic=true`.
Sam sygnał „nowoczesność=Tak" (przy `custom_logic=false`) NIE przełącza Woo→Medusa (test:
„nowoczesność=Tak SAMA ≠ Medusa", green; przeglądarka: scenariusz nie pokazał Medusy). **Brak
potrzeby zaostrzania reguły** — DRAFT niewymagany.

## Co zmienione — SEEDY (do korekty Jakuba przy przeglądzie)

Pliki: `migrations/seed/questions.sql`, `migrations/seed/rules.sql`.

| # | Zmiana | Szczegóły |
|---|---|---|
| C.6 | `sort_order` | `custom_logic` 15→**230**, `frontend_headless` 16→**240** → kolejność Platformy: project_goal → products_count → product_variants → payments → shipping → custom_logic → frontend_headless |
| C.7 | `frontend_headless` treść | z „Czy nowoczesny, szybki front (React/headless) jest priorytetem?" → **„Czy zależy Wam na nowoczesnym, dopracowanym wrażeniu i bardzo płynnym działaniu strony?"**; help bez „front oddzielony od backendu" (pytamy o skutek, nie technologię — inwariant 9) |
| C.8 | `visible_if_json` | `products_count`, `product_variants`, `payments`, `shipping` ← `{"q":"project_goal","op":"in","val":["sklep","b2b"]}` (widoczne tylko dla sklepu/B2B) |
| B.4 | reguły recommend (nowe) | **45**: `project_goal=portal_tresci` → `wordpress` („waga treści, edycja przez klienta, najniższy koszt"); **46**: `portal_tresci AND frontend_headless=true` → `headless` („priorytet nowoczesności — Astro/React") |
| C.10 | `products_count` help | „Liczba pozycji (możesz wpisać np. 300k, 1m)." |

Liczby po zmianie (local): **rules 44→46, questions 42** (bez zmian liczby, treść/sort/visible zmienione).
**Wartości do przeglądu Jakuba:** progi reguł v1 (nadal DRAFT), treść nowego `frontend_headless`,
zakres `visible_if` (czy portal B2B ma widzieć katalog — obecnie tak dla `b2b`).

## Co zmienione — UI (kod, nie do korekty seedowej)

Plik: `components/portal/admin/estimation/PlatformStep.tsx`.

| # | Zmiana |
|---|---|
| C.8 | Filtr widoczności pytań przez `matchCondition(visible_if_json, answers)` — data-driven, ten sam mechanizm, którego f1b użyje w całym wizardzie (kolumna `visible_if_json` z 02, **zero zmiany schematu**) |
| B.5 | Pusty wynik z odpowiedzianym `project_goal` → komunikat „Brak jednoznacznej rekomendacji — wybierz ręcznie i podaj uzasadnienie" (zamiast „Odpowiedz na pytania…") |
| C.9 | Wybór archetypu bez rekomendacji = „ręczny z pominięciem doradcy" → obowiązkowy powód od razu (rekomendacja = ścieżka domyślna) |
| C.10 | `products_count` renderowany jako input tekstowy (nie `type=number`) — akceptuje `300k`/`1m`; koercja po stronie silnika (`toNum`) |

## Testy (Część D)

`components/portal/admin/estimation/PlatformStep.test.tsx` — 7 scenariuszy RTL z realnymi regułami:
Woo (→WooCommerce, nie Medusa), Medusa (oba sygnały), **nowoczesność=Tak sama ≠ Medusa**, portal
treści→WordPress, widoczność warunkowa (products_count tylko sklep/B2B), brak dopasowania (komunikat),
wybór ręczny→powód. **101/101** cała siatka.

## Weryfikacja w przeglądarce (pages dev)

Potwierdzone wizualnie: C.6 (`project_goal` pierwsze), C.7 (nowe brzmienie), C.8 (katalog ukryty do
wyboru sklep/B2B; ukryty dla portalu), B.4 (portal→★WordPress + Headless), B.5 (komunikat „brak
dopasowania" widoczny), oraz że scenariusz z samą nowoczesnością NIE pokazuje Medusy.

## Pozostałe / do domknięcia

- **Prod D1 ma seedy f1a (44 rules), nie B/C** — re-apply na prod (rytuał: backup + liczby przed/po
  + `COUNT status != 'draft' = 0`) przy merge/deploy `feat/estimation-f1`, nie teraz.
- **Token API `cfut_…`** — nadal ważny; do skasowania po pracach.

## Następny krok

STOP przed f1b: Jakub klika lokalnie 4 scenariusze (Woo, Medusa=nowoczesność+custom, portal treści,
brak dopasowania) + widoczność warunkową + wybór ręczny z powodem. Po akceptacji → f1b (pełny wizard).
