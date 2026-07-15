# RAPORT f1c — 2026-07-15

Faza **f1c** domyka **FAZĘ 1** (rdzeń wyceny end-to-end): finalize + snapshot, parytet UI↔serwer,
filtr modułów (archetyp ∩ cel), ekran wyniku, read-back. Gałąź `feat/estimation-f1`.
W trakcie fazy doszły trzy pakiety napraw z klikania (widoczność pytań, D26 „nie dotyczy",
bug kosztów dojazdu) oraz rozstrzygnięcia architekta.

## Zakres zrealizowany

**1. Finalize + snapshot** (`functions/api/admin/estimation/quote-finalize.ts`) — serwerowe,
autorytatywne przeliczenie tym samym `computeQuote`; snapshot atomowy (D1 `batch`) do
`est_quote_aspects` / `est_quote_items` / `est_quote_multipliers` + `totals_json`,
`confidence_breakdown_json`, `engine_version`; `validateForFinalize` (400 z listą błędów);
status `draft`→**`review`** (D25). Re-finalize z `draft`/`review` nadpisuje snapshot.

**2. Guard cyklu życia (D25)** — finalize ze statusu `sent`/`won`/`lost`/`closed` → **409**
(„wycena wysłana klientowi jest nietykalna, utwórz duplikat"); snapshot nietknięty.

**3. Parytet UI↔serwer** — jeden współdzielony `buildLibraryData` (przeniesiony do `lib/`)
+ jeden `computeQuote`. Obie ścieżki dostają te same argumenty (archetyp **i cel**).
Test na pełnej wycenie: odpowiedzi + „nie wiem" + overrides + odznaczone sugestie + moduł
+ integracja + koszt + mnożnik.

**4. Filtr modułów: archetyp ∩ cel (D24)** — `est_modules.archetypes_json` ∩ `goals_json`
(migracja **0004**, addytywna: jedna kolumna nullable). Checklista modułów **zawsze widoczna**,
ale jej OPCJE pochodzą z przefiltrowanej biblioteki (nie ze statycznego `options_json`).
Moduł spoza zakresu nie da się zaznaczyć i nie wchodzi do wyceny.

**5. Ekran wyniku** (`ResultScreen.tsx`) — widełki ofertowe + pełne wewnętrzne + Confidence
z rozbiciem + **lista decyzji technicznych** (obszar, poziom, uzasadnienia reguł, powód korekty)
+ pozycje dodatkowe. Wersja do odczytania klientowi na spotkaniu.

**6. Read-back** — `GET quote?id=` dokłada snapshot (obszary/itemy/mnożniki + sparsowane
`totals`/`confidence_breakdown`). Ekran wyniku czyta **D1**, nie stan lokalny UI.

**Naprawy z klikania (przyjęte przez architekta):**

- **fix2 — widoczność (luka systemowa):** przegląd CAŁEGO katalogu `est_questions`; 10 pytań
  bloku e-commerce dostało warunek SHOP, reszta ma jawny status „zawsze widoczne" w nagłówku seeda.
- **D26 — trzeci stan „nie dotyczy":** `{"not_applicable":true}`; zero kary Confidence, liczy się
  do kompletności, żadna reguła nie matchuje (także nie `answered`) poza operatorem `not_applicable`.
- **fix1 — bug kosztów dojazdu:** `computeQuote` zwracał sugestie `cost_item` z reguł, ale **nigdy
  ich nie wyceniał**; `LibraryData` nie miało `costItemTypes`. Teraz reguła → typ → `qty = km × 2`
  → `amount = qty × stawka`; sekcja „Koszty dodatkowe" dodana w LivePreviewPanel i ValidationScreen
  (wcześniej nie istniała nigdzie).
- **Ręczna kwota kosztu:** pozycje bez stawki (np. „usługa zewnętrzna") mają edytowalne pole kwoty
  przed finalize; **0 nie blokuje** finalize — pozycja z notatką „do wyceny ręcznej" wchodzi do
  snapshotu, żeby nie zginęła w ofercie.

## Odstępstwa od dokumentacji

- **`engine_version` 1.1 → 1.4** (docs/03). Cztery zmiany semantyki, każda udokumentowana:
  1.2 filtr modułów per archetyp (D24) · 1.3 D26 „nie dotyczy" + wycena `cost_item` z reguł ·
  1.4 filtr per cel (D24 rozszerzone) + ręczne kwoty kosztów. Brak wycen produkcyjnych ⇒ zero
  migracji danych.
- **Nowa migracja 0004** (`est_modules.goals_json TEXT NULL`) — zmiana schematu względem docs/02,
  **Level 3 zatwierdzony przez architekta z definicją**. Addytywna, forward-only, wszystkie moduły
  startują z `NULL` (zachowanie sprzed migracji). Do dopisania w docs/02 przy najbliższej edycji.
- **`modules` (checklista) zostaje ZAWSZE widoczna** — odstępstwo od pierwotnej instrukcji
  („checklista sklepowa → SHOP"). Zgłoszona konsekwencja (znikały moduły ogólne: `blog_kb`,
  `search_adv`, `pwa_push`, `gdpr_tools`, `livechat`), architekt zatwierdził rozwiązanie
  „filtrujemy OPCJE, nie pytanie" jako lepsze.
- **Rejestr: „nie dotyczy" = D26, nie D24** — D24/D25 były już zajęte przez f1c (filtr modułów /
  guard cyklu). Potwierdzone: rejestr docs/00 rządzi.

## Decyzje podjęte samodzielnie (poziom 1 — do przeglądu)

- **Rozróżnienie powodu w breakdownie Confidence** (znalezione w E2E podczas zamknięcia): kara jest
  identyczna (D23), ale powód mówi teraz prawdę — „Odpowiedź »nie wiem«: X" vs „Brak odpowiedzi: X".
  Wcześniej jawne „nie wiem" raportowało się jako „brak odpowiedzi" i myliło.
- **Poprawka spójności:** `activeModules`/`activeIntegrations` są filtrowane do zawartości
  biblioteki. Wcześniej moduł spoza zakresu (zasugerowany regułą lub zaznaczony) wisiał na liście
  aktywnych jako **goły kod** i nie był wyceniany.
- **Nieznany cel = brak filtra celu** (permisywnie) — dopóki `project_goal` bez odpowiedzi,
  checklista pokazuje wszystko dla archetypu.
- Nazwy plików/komponentów, `categoryLabels.ts`, treść komunikatów UI.

## Decyzje czekające

- **(Jakub, poziom 2)** Tabela **moduł → zakres** niżej: DRAFT przypisań `goals_json`/`archetypes_json`
  do korekty przy przeglądzie seedów.
- **(Jakub, poziom 2)** Tabela **pytanie → warunek** niżej: DRAFT polityki widoczności.
- **(Jakub, poziom 2)** Poziomy DRAFT kat. G, próg `confidence_completeness` 0.60, wagi Confidence
  (8/6/2), stawka dojazdu 1,15 zł/km — do kalibracji na realnych wycenach.
- **(architekt, poziom 3)** Czy formuła dojazdu ma objąć wielokrotne wyjazdy i noclegi? v1: JEDNA
  pozycja `km × 2 × stawka`, niezależnie od liczby spotkań (noclegi = pozycja ad hoc).

## Wyniki testów

- **`build:full`: EXIT 0** — lint `eslint . --max-warnings 0` czysty; **151 testów** (24 pliki);
  **116 tras** prerenderowanych; size-limit **67,81 kB** (limit 300) i **29,06 kB** (limit 50) ✅.
- **Moduł wycen: 109 testów** (13 plików) — silnik, quote (pure), parytet, snapshot-first,
  buildLibraryData (archetyp ∩ cel), finalize API (7), read-back, E2E f1b (6), E2E f1c (2).
- **TS baseline: 15** (bez wzrostu).

## Kryteria akceptacji (F1 wg docs/07)

- ✅ **Pełny przepływ end-to-end** — E2E przez `pages dev`: POST wycena → PUT komplet odpowiedzi
  (w tym „nie wiem" i „nie dotyczy") → finalize ze zmianą poziomu + powodem → status `review`.
- ✅ **Ten sam zestaw odpowiedzi ⇒ identyczny wynik UI i serwera** — `parity.test.ts` na pełnej
  wycenie; osobny test: filtr archetyp ∩ cel działa identycznie na obu ścieżkach (brak dryfu —
  serwer nie wyceni modułu, którego użytkownik nie widział).
- ✅ **Edycja biblioteki po finalize nie zmienia zapisanej wyceny** — dowód punktowy:
  `frontend` poz. 2 zmieniony w bibliotece 40–100 → 400–1000 h; snapshot wyceny #1 dalej **40–100**
  (`totals.base` 88–208, oferta 6900–10200 bez zmian), nowa wycena #2 liczy **400–1000**
  (base 431–1071, oferta 34 300–51 900).
- ✅ **`totals_json` zgodny z ręcznym przypadkiem kontrolnym** (krok po kroku, na realnym seedzie):

  | krok | ręcznie | serwer |
  |---|---|---|
  | 1. baza (suma 11 obszarów ze snapshotu) | 88 – 208 h | 88 – 208 h |
  | 2. + itemy (brak) | 88 – 208 h | 88 – 208 h |
  | 3. mnożniki Σ=0 (cap nieosiągnięty) | 88 – 208 h | 88 – 208 h |
  | 4. bufor ×1,10 | 96,8 – 228,8 h | 96,8 – 228,8 h |
  | 5. cena ×50 zł | 4 840 – 11 440 zł | 4 840 – 11 440 zł |
  | 6. oferta: mid 8 140, span 6 600 → ceil(6 820)/ceil(10 120) | 6 900 – 10 200 zł | 6 900 – 10 200 zł |

- ✅ **Zmiana poziomu bez powodu zablokowana** — E2E: finalize bez powodu → **400**
  („Obszar frontend: zmiana poziomu/godzin wymaga powodu"); z powodem → 200.
- ✅ **„nie wiem" obniża Confidence wg 03** — E2E: Confidence 56 z breakdownem nazwanym po ludzku.
- ✅ **Guard cyklu (D25)** — finalize na `sent` → 409, `batch` nie wykonany (test jednostkowy).
- ✅ **Dostęp admin-only** — `pages dev`: brak tokenu **401**, klient **403**, admin **200**.
- ✅ **Baza od zera ×2** — migracje 0001–**0004** ✅, seedy dwukrotnie, liczby identyczne:
  aspects 31, levels 155, archetype_defaults 144, questions 41, rules 46, modules 27
  (5 bez ograniczenia celu), cost_types 7, params 9.
- ✅ **`build:full` zielony; konsola bez błędów.**
- ⏭️ **Test retrospektywny na 2 projektach** — bramka JAKOŚCI SILNIKA, wykonuje Jakub z architektem
  po tej implementacji. Instrukcja niżej.
- ⏭️ **Karta decyzji technicznych jako dokument** — F2 (dziś decyzje widoczne na ekranie wyniku).
- ⏭️ **Statusy sent/won/lost + duplikacja wyceny + powiązanie z leadami** — F1 kroki 6–7, poza f1c.

## Instrukcja testu retrospektywnego (bramka f1c — Jakub + architekt)

**Cel:** sprawdzić, czy silnik trafia w rzeczywistość — to bramka jakości WIEDZY (seedów), nie kodu.

1. **Wybierz 2 zamknięte projekty** z przeszłości o znanych, rozliczonych godzinach — najlepiej
   różne (np. jeden sklep na WooCommerce, jeden custom/aplikacja).
2. Dla każdego: **przejdź wizard tak, jak wyglądała wiedza NA STARCIE** projektu (nie po fakcie —
   inaczej test jest bezwartościowy). Gdzie nie wiedzieliście → „nie wiem"; gdzie nie dotyczyło →
   „nie dotyczy".
3. Finalizuj i zanotuj: **widełki ofertowe**, pełne widełki, godziny `afterBuffer`, Confidence.
4. **Porównaj z realnymi godzinami/kosztem.** Kryterium: realny wynik **mieści się w widełkach
   ofertowych** albo odchylenie jest wyjaśnione i zaakceptowane.
5. Jeśli nie mieści — zanotuj **per obszar**, gdzie silnik zaniżył/zawyżył (ekran wyniku ma listę
   decyzji z godzinami). To wejście do korekty seedów, nie do zmiany kodu.
6. **Zapisz werdykt** w `docs/estimation/raporty/` (2 akapity: co się zgadzało, co nie, jakie
   widełki/reguły do korekty).

Wynik testu decyduje o merge F1 do `main` i o starcie F2.

## Ryzyka i długi

- **DRAFT wiedzy** (poziomy G, zakresy modułów, wagi Confidence, stawka km, progi reguł) — bez
  realnych wycen kalibracja niemożliwa; ryzyko systematycznego przestrzelenia w jedną stronę.
  Mitigacja: test retrospektywny wyżej + MPE w F3.
- **`options_json` checklisty modułów jest martwy** — UI bierze opcje z biblioteki. Zostawiony jako
  dokumentacja/fallback; przy edytorze biblioteki (F2) trzeba zdecydować, czy go usunąć, żeby nie
  było dwóch źródeł prawdy.
- **Statusy poza `review`** (`sent`/`won`/`lost`, duplikacja) nie mają jeszcze UI — guard D25 działa,
  ale nie da się dziś legalnie przejść do `sent`. Do F1 krok 6 / F2.
- **`workshops_travel_km` liczy jeden wyjazd** — przy cyklu warsztatów trzeba pozycji ad hoc
  (pytanie do architekta wyżej).
- **`public/sitemap.xml`** w working tree ma zmianę sprzed tej sesji (artefakt builda, nie f1c) —
  nie commitowałem.

## Tabela: pytanie → warunek widoczności (DRAFT do korekty Jakuba)

| grupa | pytanie | warunek widoczności |
|---|---|---|
| projekt | `project_goal` | zawsze widoczne |
| projekt | `views_count` | zawsze widoczne |
| projekt | `languages` | zawsze widoczne |
| projekt | `design_source` | zawsze widoczne |
| projekt | `workshops` | zawsze widoczne |
| projekt | `workshops_travel_km` | gdy workshops eq stacjonarne |
| uzytkownicy | `users_type` | zawsze widoczne |
| uzytkownicy | `users_concurrent` | zawsze widoczne |
| uzytkownicy | `traffic_monthly` | zawsze widoczne |
| uzytkownicy | `downtime_tolerance` | zawsze widoczne |
| uzytkownicy | `sla_formal` | gdy downtime_tolerance neq nic LUB users_type eq b2b |
| uzytkownicy | `sla_value` | gdy sla_formal eq konkretny |
| uzytkownicy | `sensitive_data` | zawsze widoczne |
| funkcje | `products_count` | SHOP (cel: sklep/B2B) |
| funkcje | `product_variants` | SHOP (cel: sklep/B2B) |
| funkcje | `stock_source` | SHOP (cel: sklep/B2B) |
| funkcje | `sales_model` | SHOP (cel: sklep/B2B) |
| funkcje | `promos_planned` | SHOP (cel: sklep/B2B) |
| funkcje | `returns_handling` | SHOP (cel: sklep/B2B) |
| funkcje | `payments` | SHOP (cel: sklep/B2B) |
| funkcje | `shipping` | SHOP (cel: sklep/B2B) |
| funkcje | `erp` | SHOP (cel: sklep/B2B) |
| platforma | `custom_logic` | zawsze widoczne |
| funkcje | `marketplace` | SHOP (cel: sklep/B2B) |
| platforma | `frontend_headless` | zawsze widoczne |
| funkcje | `other_integrations` | zawsze widoczne |
| funkcje | `modules` | zawsze widoczne |
| funkcje | `existing_data` | zawsze widoczne |
| funkcje | `data_sample` | gdy existing_data eq przenosimy |
| funkcje | `configurator_type` | gdy modules contains configurator_options LUB modules contains configurator_2d LUB modules contains configurator_3d |
| funkcje | `configurator_products` | gdy modules contains configurator_options LUB modules contains configurator_2d LUB modules contains configurator_3d |
| funkcje | `config_assets_source` | gdy modules contains configurator_2d LUB modules contains configurator_3d |
| funkcje | `config_matrix` | gdy modules contains configurator_options LUB modules contains configurator_2d LUB modules contains configurator_3d |
| funkcje | `config_output` | gdy modules contains configurator_options LUB modules contains configurator_2d LUB modules contains configurator_3d |
| marketing | `ads_planned` | zawsze widoczne |
| marketing | `tracking_scope` | zawsze widoczne |
| marketing | `seo_migration` | zawsze widoczne |
| realizacja | `content_source` | zawsze widoczne |
| realizacja | `training` | zawsze widoczne |
| realizacja | `deadline_hard` | zawsze widoczne |
| realizacja | `team_new_tech` | zawsze widoczne |

## Tabela: moduł → zakres (archetyp ∩ cel) — DRAFT do korekty Jakuba

| moduł | archetypy | cele (project_goal) |
|---|---|---|
| `b2b_approval` — Workflow akceptacji B2B | wszystkie | b2b, sklep |
| `b2b_pricing` — Cenniki B2B / grupy cenowe | wszystkie | b2b, sklep |
| `blog_kb` — Blog / baza wiedzy | wszystkie | wszystkie |
| `click_collect` — Click & collect / punkty odbioru własne | wszystkie | sklep, b2b |
| `client_panel_ext` — Rozszerzony panel klienta | wszystkie | sklep, b2b, aplikacja |
| `configurator_2d` — Konfigurator z wizualizacją 2D | wszystkie | sklep, b2b |
| `configurator_3d` — Konfigurator 3D (Three.js/R3F) | woo_headless, medusa, laravel, headless | sklep, b2b |
| `configurator_assets` — Produkcja assetów 2D wariantów | wszystkie | sklep, b2b |
| `configurator_options` — Konfigurator opcji (bez wizualizacji) | wszystkie | sklep, b2b |
| `cpq_engine` — Silnik CPQ (wycena produkcyjna) | woo_headless, medusa, laravel, headless | sklep, b2b |
| `gdpr_tools` — Narzędzia RODO (eksport/anonimizacja) | wszystkie | wszystkie |
| `gift_cards` — Karty podarunkowe | wszystkie | sklep, b2b |
| `invoices_auto` — Automatyczne fakturowanie | wszystkie | sklep, b2b |
| `livechat` — Live chat / Messenger / callback | wszystkie | wszystkie |
| `loyalty` — Program lojalnościowy | wszystkie | sklep, b2b |
| `marketplace_mv` — Marketplace multi-vendor | woo_headless, medusa, laravel, headless | sklep, b2b |
| `multicurrency` — Wielowalutowość | wszystkie | sklep, b2b |
| `omnibus` — Omnibus — najniższa cena 30 dni (wymóg UE) | wszystkie | sklep, b2b |
| `promo_engine` — Promocje zaawansowane / kody rabatowe | wszystkie | sklep, b2b |
| `pwa_push` — PWA + web push | wszystkie | wszystkie |
| `quotes_rfq` — Zapytania ofertowe (RFQ) | wszystkie | b2b, sklep |
| `reviews` — Opinie o produktach | wszystkie | sklep, b2b |
| `rma` — Zwroty i reklamacje (RMA) | wszystkie | sklep, b2b |
| `search_adv` — Wyszukiwarka zaawansowana | wszystkie | wszystkie |
| `size_tables` — Tabele rozmiarów (fashion) | wszystkie | sklep, b2b |
| `subscriptions` — Produkty subskrypcyjne | wszystkie | sklep, b2b |
| `wishlist` — Wishlist / schowek | wszystkie | sklep, b2b |

## Propozycja następnego kroku

1. **Test retrospektywny** (Jakub + architekt) wg instrukcji wyżej — bramka F1.
2. **Rytuał prod:** re-apply seedów + **migracja 0004** na produkcyjnym D1 (backup → liczby
   przed/po → ochrona snapshotów → apply → weryfikacja). Czeka na świeży token API.
3. Po akceptacji: merge `feat/estimation-f1` → `main` (Jakub), potem **F2** (biblioteka w panelu,
   PDF oferty, Karta decyzji, eksport/import).
