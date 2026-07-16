# 07 — Plan wdrożenia (fazy · kroki · kryteria akceptacji)

Dwa równoległe strumienie:
- **KOD** — Claude Code w repo `MixtureMarketing-stona` (Opus 4.8: architektura/silnik/API; Sonnet: UI powtarzalne, CRUD-y, seedy z gotowych tabel).
- **TREŚĆ** — praca merytoryczna Jakuba (korekty seedów, reguły, biblioteka). Fazy kodu mają jawne zależności od treści; kod nie czeka — używa wersji roboczej i podmienia seedy.

Każda faza kończy się przejściem `npm run build:full` (lint + testy + build + size-limit) i deployem na produkcję (moduł jest za auth admina — bezpieczny do wdrażania przyrostowo).

---

## FAZA 0 — Fundament danych i szkielet

**Kod:**
1. Migracja `0003_estimation_core.sql` — wszystkie tabele z 02.
2. Seedy `migrations/seed/*`: aspects + levels (z docx + 04), questions, rules (25 z 05), archetypes + defaults, modules, integrations, multipliers, cost_item_types, params.
3. `lib/estimation/engine.ts` — typy domenowe + ewaluator reguł (05) + agregacja (03), czysty TS, bez React. Testy Vitest: ewaluator (operatory, unknown, monotoniczność min_level), agregacja (cap, bufor, oferta, pozycje kosztowe, inwarianty 03).
4. Zakładka „Wyceny" w `AdminDashboard` (lazy): lista wycen (pusta), przycisk „Nowa wycena" (disabled do F1). Endpoint `GET /api/admin/estimation/quotes`.
5. `_redirects`: `/portal/*  /index.html  200` nad catch-allem; weryfikacja, że prerender/sitemap nie łapią `/portal/*`.

**Treść (Jakub):** korekta `levels.sql` (zwłaszcza 9 tabel z 04) · korekta 06 (skreślenia, godziny, stawka_km/nocleg) · przegląd 25 reguł i pytań (progi liczbowe).

**Kryteria akceptacji F0:**
- [ ] `wrangler d1 migrations apply` przechodzi na czystej bazie i na kopii produkcyjnej; seedy idempotentne.
- [ ] 100% testów silnika zielone; pokrycie przypadków: pusta wycena, poziom 0, cap osiągnięty, „nie wiem", override min>max odrzucony.
- [ ] Zakładka widoczna tylko dla roli admin (test: token klienta → 403 na `/api/admin/estimation/*`).
- [ ] Głęboki link `/portal/admin?tab=wyceny` działa po odświeżeniu (fallback `_redirects`).
- [ ] `build:full` zielony; bundle index bez wzrostu (moduł w lazy chunku).

---

## FAZA 1 — Rdzeń wyceny (przepływ end-to-end)

**Kod:**
1. **Krok „Platforma" (D21, docs/05) — OBOWIĄZKOWY w F1a:** blok pytań technologicznie neutralnych (cel, produkty, warianty, sales_model, users_type, języki, stock_source, krytyczność, logika niestandardowa) → ewaluacja reguł `recommend_archetype` → prezentacja 1–2 rekomendacji archetypu Z UZASADNIENIEM + pełna lista → wybór użytkownika (ostateczny; wbrew rekomendacji = obowiązkowy powód). Zapis `archetype_recommended` / `archetype_chosen` / `archetype_reason` (wzorzec suggested/chosen). Dopiero wybrany archetyp ustawia domyślne poziomy i filtruje dalsze pytania. Reguły `archetype_warning` działają jako druga linia (odpowiedzi z późniejszych kroków mogą podważyć wybór). **Treść (odłożona z F0):** dopisać reguły `recommend_archetype` i `archetype_warning` do `rules.sql` (szkice w docs/05).
2. **Wizard formularza biznesowego**: kroki wg grup pytań, rendering z `est_questions` (typy odpowiedzi, visible_if, „nie wiem"), autosave draftu (PUT quotes), pasek postępu + licznik niewiadomych na żywo.
3. **Podgląd na żywo**: panel boczny z bieżącymi widełkami i Confidence (silnik w UI).
4. **Walidacja techniczna**: tabela obszarów per kategoria — suggested/chosen level, widełki, uzasadnienia reguł (rozwijane), zmiana poziomu (select 0–4) i override godzin z obowiązkowym powodem; sekcje modułów/integracji/mnożników/kosztów (sugestie odznaczalne, dodawanie z biblioteki, pozycje ad hoc).
5. **Finalize**: `POST quote_finalize` — serwerowe przeliczenie, snapshot (02), zapis `totals_json`, status `review`; ekran wyniku: pełne widełki (wewnętrzne), widełki ofertowe, koszty, Confidence z breakdownem i komunikatem progowym (zielony/żółty/czerwony + „zaproponuj Discovery").
6. Statusy i lista: draft/review/sent/won/lost (lost_reason), filtrowanie, duplikacja wyceny (rewizja).
7. Powiązanie z leadami: przycisk „Utwórz wycenę" w `AdminLeads` (prefill klienta), `lead_id` na wycenie.

**Treść:** finalna wersja pytań i reguł v1 (w tym `recommend_archetype`/`archetype_warning`) na podstawie użycia na 2–3 wycenach testowych — patrz kryteria.

**Kryteria akceptacji F1:**
- [ ] Pełny przepływ < 15 min: nowa wycena → formularz → walidacja → finalize → wynik (test na realnym, zakończonym projekcie z przeszłości).
- [ ] **Test retrospektywny na 2 znanych projektach:** widełki ofertowe obejmują znany realny koszt/godziny albo odchylenie wyjaśnione i zaakceptowane przez Jakuba (to jest bramka jakości silnika, nie kodu).
- [ ] Ten sam zestaw odpowiedzi ⇒ identyczny wynik UI i serwera (test porównawczy engine w obu środowiskach).
- [ ] Edycja biblioteki po finalize nie zmienia zapisanej wyceny (test snapshotu).
- [ ] **Krok „Platforma":** reguły `recommend_archetype` zwracają ≥1 rekomendację z uzasadnieniem dla wycen testowych; wybór wbrew rekomendacji wymaga powodu (zapis recommended vs chosen); reguły `archetype_warning` widoczne w Karcie decyzji.
- [ ] Zmiana poziomu bez powodu zablokowana; „nie wiem" obniża Confidence zgodnie z 03.
- [ ] Audyt językowy pytań (zasada nadrzędna 7): każde pytanie widoczne dla przepływu przechodzi test „właściciel firmy bez IT odpowie albo powie nie wiem"; pytania techniczne dozwolone wyłącznie z flagą (wewnętrzne).
- [ ] Konsola bez błędów; `build:full` zielony.

---

## FAZA 2 — Biblioteka w panelu + oferta PDF

**Kod:**
1. CRUD biblioteki w UI (`library/`): obszary+poziomy (edycja widełek), pytania, reguły (formularz warunków z podglądem JSON + walidacją kodów), moduły, integracje, mnożniki, archetypy+defaults, parametry. Zmiany działają tylko wprzód (snapshoty).
2. Generator oferty PDF (jspdf, lazy): szablon z 01; zapis do R2 + link na wycenie; status `sent` po wygenerowaniu/oznaczeniu.
3. Sekcja oferty „poza zakresem / klient zrezygnował": automatycznie z obszarów, gdzie chosen < suggested (raport rekomendowane-a-wyłączone).
3a. **Karta decyzji technicznych** (D20): generowana z wyceny (markdown w UI + PDF/eksport do R2) — decyzje per obszar z uzasadnieniami, wymagania od klienta z integracji, ryzyka, „poza zakresem". Wariant „brief wykonawczy": eksport markdown do wklejenia jako kontekst projektu (Claude Code).
4. Eksport/import seedów biblioteki (JSON) — kopia zapasowa wiedzy + przygotowanie pod przyszłe „paczki".

**Kryteria akceptacji F2:**
- [ ] Edycja widełek w UI → nowa wycena liczy po nowemu, stara bez zmian.
- [ ] Reguła dodana w UI działa bez deployu (wiedza = dane).
- [ ] PDF: poprawne polskie znaki, sekcje per kategoria + moduły/integracje + koszty + wyłączenia + ważność oferty; plik w R2, link działa.
- [ ] Import/eksport JSON round-trip bez utraty danych.
- [ ] Karta decyzji technicznych: każda decyzja ma uzasadnienie (reguła lub powód nadpisania); test przykładu wzorcowego „SLA 99,8% → load balancing ≥1 + HA ≥2" z czytelnym wyjaśnieniem.

---

## FAZA 3 — Zamknięcie, kalibracja, raporty

**Kod:**
1. Zamknięcie wyceny (`won → closed`): formularz godzin rzeczywistych per obszar + per moduł/integracja (szacunkowe OK), notatki.
2. Raport estimated vs actual: per wycena i zbiorczo per (obszar, poziom) — MPE (mediana), n, wykres odchyleń (recharts, lazy).
3. Ekran kalibracji: propozycje korekt widełek przy n≥3 i |MPE|>15%, podgląd przed/po, ręczne zatwierdzenie.
4. History Engine: wyszukiwarka zamkniętych wycen (archetyp, integracje, przedział godzin), widok „najbliższe podobne" przy nowej wycenie (dopasowanie po archetypie + wspólnych integracjach/modułach — deterministyczny scoring liczby wspólnych cech).
5. Mini-dashboard: skuteczność (won/lost + powody), średni błąd estymacji, najbardziej niedoszacowane obszary, czas przygotowania wyceny.
6. **Retry/backoff D1 w endpointach admina** (dług z f2c-2a): D1 potrafi zwrócić przejściowe 500 na pierwszym zapisie (cold start) — smoke f2c-2a złapał to na `PATCH is_active` (powtórka od razu 200). Endpointy nie mają retry, więc blip surfacuje jako 500 do klienta. Dodać cienki retry/backoff (idempotentne operacje) w warstwie zapisu Pages Functions modułu — dotyczy wszystkich endpointów, nie tylko wycen.

**Kryteria akceptacji F3:**
- [ ] Po zamknięciu ≥1 wyceny raport pokazuje odchylenia per obszar.
- [ ] Kalibracja nigdy nie zmienia snapshotów; korekta widełek wymaga kliknięcia „zatwierdź".
- [ ] „Podobne wyceny" zwraca sensowne wyniki na bazie testowej ≥5 wycen.

---

## FAZA 4 (przyszłość, poza bieżącym zakresem — decyzje osobno)

- **Publiczny kalkulator na wspólnym silniku (D18):** widok `/offers#calculator` (po przebudowie strony) renderuje pytania `visibility='public'`; endpoint publiczny (Turnstile + rate-limit, wzorzec calculator-submit) liczy serwerowo i zwraca WYŁĄCZNIE zawężone widełki cenowe + orientacyjny czas — nigdy godzin, breakdownu ani danych biblioteki; tworzy lead (source='calculator') + szkic est_quote z odpowiedziami. Zastępuje CalculatorConfig z Sanity.
- **Uzupełnianie w portalu klienta:** zalogowany klient (istniejący magic link) widzi swój szkic i uzupełnia pytania `visibility='portal'`; PM przejmuje ten sam rekord w adminie (pytania `internal` + walidacja + finalize). Wymaga: powiązania est_quotes z users przez lead→user oraz endpointów portalowych (wzorzec functions/api/portal/*).
- Warstwa handlowa: marże, rabaty, cena minimalna (D9).
- Komercjalizacja: multi-tenant (migracja D1 → Postgres/Hyperdrive), paczki wiedzy (format = eksport JSON z F2), onboarding zewnętrznych agencji.

**Poler UI (po akceptacji funkcjonalnej F1/F2):** dedykowana sesja designowa modułu — `/impeccable polish` (rejestr product) + review-animations na przejściach wizarda. Skille designowe NIE uczestniczą w fazach logiki (F0–F1 core) — szum kontekstowy.

---

## Ryzyka wdrożenia

| Ryzyko | Mitygacja |
|---|---|
| Treść (reguły/widełki) opóźnia kod | Seedy robocze od F0; korekty to UPDATE seedów, nie zmiany kodu |
| Silnik „ładny, ale kłamie" | Bramka F1: test retrospektywny na znanych projektach — obowiązkowy |
| Rozjazd UI vs serwer w obliczeniach | Jeden moduł engine + test porównawczy + engine_version |
| Bundle size przekroczony | Cały moduł lazy; jspdf/recharts w osobnych chunkach (wzorzec repo) |
| Baseline 41 błędów TS rośnie | Nowy kod strict-clean; CI typecheck monitorowany po każdej fazie |
| Kalibracja na „godzinach na oko" | Pole notatki przy godzinach rzeczywistych + rekomendacja zgrubnego trackingu od najbliższego projektu |

## Pierwszy prompt do Claude Code (skrót)

Kontekst: repo + folder `docs/estimation/` (ta dokumentacja, skopiowana do repo w F0 kroku 0).
Zadanie F0.1–F0.3 z tego planu, zgodnie z CLAUDE.md repo (lint, testy, size-limit, konwencje).
Zakaz: zmian w istniejących funkcjach poza `_redirects` i `AdminDashboard` (dodanie zakładki).
Definition of done: kryteria akceptacji F0.
