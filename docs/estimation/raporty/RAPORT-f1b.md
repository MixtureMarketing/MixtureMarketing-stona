# RAPORT f1b — 2026-07-15

Faza **f1b**: pełny wizard formularza biznesowego + podgląd na żywo + walidacja techniczna
(bez finalize — to f1c). Gałąź `feat/estimation-f1`. Zamknięcie po pakiecie napraw 1–4 z klikania
architekta/Jakuba oraz korektach 5–7 (jeden ciąg pracy).

## Zakres zrealizowany

**Architektura stanu (zatwierdzona):** jedno źródło prawdy `useQuoteState` (answers + overrides)
→ `computeQuote` (pure, `useMemo`) → `QuoteContext` → komponenty tylko czytają. Autosave
odpowiedzi: debounce 800 ms + FLUSH przy zmianie kroku i przy unmount; `beforeunload` gdy są
niezapisane overrides lub wisząca odpowiedź. Overrides walidacji = wyłącznie stan klienta do
finalize (wariant A, zero Level 3).

Komponenty: `QuoteWizard` (krok Platforma → draft) → `QuoteEditor` (nagłówek archetypu + wizard/
walidacja) → `WizardSteps` (grupy pytań, visible_if, licznik „nie wiem"), `LivePreviewPanel`
(widełki + Confidence + top-3 „co obniżyło pewność" + rozbicie per kategoria + uwagi do platformy),
`ValidationScreen` (obszary per kategoria, zmiana poziomu z powodem), `QuestionField` (współdzielone).

**Naprawy 1–4 (feedback z klikania):**

1. **Dedup pytań (BUG).** Pytania zadane w kroku Platforma nie wracają w wizardzie — filtr
   data-driven `platformQuestionCodes(rules)` w `WizardSteps` (niezależny od grupy pytania).
   Pytanie `archetype` USUNIĘTE z katalogu (`est_questions`) — archetyp to atrybut/wynik kroku
   Platforma, nie pytanie; `DELETE FROM est_questions WHERE code='archetype'` w seedzie dla baz
   zaseedowanych wcześniej. Test regresji: `wizard.test.tsx` (pytanie platformy pominięte, zwykłe
   widoczne).
2. **Archetyp read-only + „Zmień platformę".** Nagłówek w `QuoteEditor` z nazwą archetypu; akcja
   „Zmień platformę" wraca do kroku Platforma i AKTUALIZUJE istniejący draft (PUT), bez sierocych
   draftów. Reguły `archetype_warning` renderowane w podglądzie (sekcja „Uwagi do platformy") —
   dzięki wstrzyknięciu archetypu do `answers` na potrzeby silnika (`{ ...answers, archetype }`),
   bez zapisu jako odpowiedź.
3. **Confidence D23 (zmiana formuły, `engine_version` 1.0→1.1).** WIDOCZNE pytanie (visible_if
   spełniony) a nieodpowiedziane liczy się jak „nie wiem" (ta sama `unknown_weight`). Pewność
   startuje nisko i rośnie z odpowiedziami. Nowy param `confidence_completeness` (DRAFT 0.60):
   poniżej progu etykieta „szacunek wstępny — odpowiedz na więcej pytań". Zaktualizowane docs/00
   (rejestr D23) i docs/03 (formuła + przykład ręczny). Testy przeliczone JAWNIE (nowe wyliczenie
   w komentarzu, nie dopasowanie do wyniku funkcji).
4. **Czytelność podglądu.** (a) „Co obniżyło pewność" nazywa źródło po ludzku (etykieta pytania /
   pozycji + poziom ryzyka), nigdy „pozycja"/kod — silnik zwraca gotowe `reason`. (b) Rozbicie per
   kategoria po nazwach (`Prezentacja`, `Realizacja projektu`…), nie litery A–G — współdzielony
   `categoryLabels.ts`. (c) **Zbadana luka G=0:** `archetype_defaults` pokrywał 13 obszarów
   (kat. A–F), ZERO obszarów kat. G → każda wycena miała „G · Realizacja 0–0" (to była luka
   seedu, nie decyzja). Dodane DRAFT domyślne poziomy dla 5 obszarów G (discovery/uxui/qa/content/
   golive) dla wszystkich 8 archetypów (`data_migration` celowo 0 — nowy projekt, podnosi reguła
   przy `existing_data='przenosimy'`).

**Naprawa 4c — dodane domyślne poziomy kat. G per archetyp (DRAFT do korekty Jakuba):**

| archetyp | discovery | uxui | qa | content | golive | Σ G |
|---|---|---|---|---|---|---|
| wordpress | 1 | 1 | 1 | 1 | 1 | 5 |
| woocommerce | 1 | 2 | 2 | 1 | 1 | 7 |
| prestashop | 1 | 2 | 2 | 1 | 1 | 7 |
| woo_headless | 2 | 2 | 2 | 1 | 2 | 9 |
| sylius | 2 | 2 | 2 | 1 | 2 | 9 |
| medusa | 2 | 2 | 2 | 1 | 2 | 9 |
| laravel | 2 | 2 | 2 | 0 | 2 | 8 |
| headless | 1 | 2 | 1 | 1 | 1 | 6 |

(Medusa — zgłoszony przypadek „sklep na Medusie G=0–0" — teraz Σ G = 9.)

## Odstępstwa od dokumentacji

- **`engine_version` 1.0 → 1.1** (docs/03). Uzasadnione: zmiana formuły Confidence (D23) to zmiana
  semantyki silnika, wymaga bumpu wg reguły „zmiana formuły = zmiana engine_version". Zaktualizowane
  docs/00 (D23 w rejestrze) i docs/03 (formuła). Snapshoty wcześniejszych wycen (jeśli będą)
  pozostają na 1.0 — brak wycen produkcyjnych, więc bez migracji danych.
- **Resume z serwera przez GET-single-with-answers NIE istnieje w f1b** (endpoint tylko list/POST/
  PUT). Wznowienie w f1b = poziom komponentu (`initialAnswers` + flush-on-unmount); pełny read-back
  przez API to f1c (patrz Zobowiązania). Zgodne z granicą fazy (bez finalize).

## Decyzje podjęte samodzielnie (poziom 1 — do przeglądu)

- Poziomy kat. G (naprawa 4c) — heurystyka DRAFT: platformy gotowe niżej, custom/headless wyżej;
  `content=0` dla Laravel (custom bez modelu treści); `data_migration` poza domyślnymi. Wartości
  w seedzie (inwariant 2), oznaczone DRAFT, do korekty Jakuba.
- Próg `confidence_completeness = 0.60` — DRAFT, w `est_params` (edytowalny).
- „Zmień platformę" reużywa draft przez PUT (zamiast tworzyć nowy) — zero sierocych draftów;
  nazwa/klient zablokowane po utworzeniu (edycja platformy, nie metadanych).
- Etykiety kategorii A–G (`categoryLabels.ts`) — nazwy strukturalne taksonomii (docs/04), nie
  wartości domenowe; współdzielone przez ValidationScreen i LivePreviewPanel.

## Decyzje czekające

- **(Jakub, poziom 2)** Poziomy DRAFT kat. G per archetyp — akceptacja/korekta tabeli wyżej.
- **(Jakub, poziom 2)** Próg kompletności 0.60 — czy podnieść/obniżyć po pierwszych realnych
  wycenach?
- **(Jakub, poziom 2)** Wagi formuły Confidence (8 za unknown, 6/2 za ryzyko) — DRAFT z docs/03,
  do kalibracji na realnych wycenach.

## Wyniki testów

- **Testy modułu wycen:** 79 zielonych (9 plików) — silnik 35, quote(pure) 7, quotes API 10,
  quote(API) 3, library 2, engineAdapter 4, PlatformStep 7, wizard 5, **e2e-f1b 6**.
- **`build:full`: EXIT 0** — lint `eslint . --max-warnings 0` czysty; **116 testów** (19 plików)
  zielonych; vite build OK; prerender wszystkich tras ✅.
- **size-limit:** index JS **67.77 kB** (limit 300 kB) ✅; CSS **29.02 kB** (limit 50 kB) ✅ —
  moduł w lazy chunkach, główny bundel bez zmian.
- **TS baseline:** 15 błędów (bez zmian względem baseline'u — brak nowych).

## Kryteria akceptacji (dowody)

Kryteria f1b (podzbiór F1 z docs/07: kroki 2–4 wizarda; finalize/retrospektywa/snapshot = f1c):

- ✅ **Wizard z `est_questions`** (typy, visible_if, „nie wiem", autosave, pasek postępu, licznik
  niewiadomych) — `WizardSteps`; E2E scenariusz „nie wiem": licznik = 1, odpowiedź `{unknown:true}`
  zapisana w D1 (`est_quote_answers.deadline_hard = {"unknown":true}` przez pages dev PUT 200).
- ✅ **Podgląd na żywo** (widełki + Confidence, silnik w UI) — `LivePreviewPanel`; parity silnika
  UI↔pure zapewniona przez wspólny `computeQuote` (ten sam moduł w podglądzie i docelowym finalize).
- ✅ **Walidacja techniczna** (obszary per kategoria, zmiana poziomu z powodem) — `ValidationScreen`;
  test: zmiana poziomu bez powodu → pole + ostrzeżenie „wymaga powodu".
- ✅ **„nie wiem" obniża Confidence wg 03 (D23)** — testy jawne quote.test.ts (pusty 76 /
  belowCompleteness; komplet 100); E2E „szacunek wstępny" przy pustym formularzu.
- ✅ **Zmiana poziomu bez powodu zablokowana** — ValidationScreen (test wizard.test.tsx).
- ✅ **Naprawy 1–4** — E2E `e2e-f1b.test.tsx` (dedup, nagłówek archetypu, archetype_warning,
  kategorie po nazwach, breakdown po ludzku, „nie wiem", przepływ do walidacji, flush→PUT,
  wznowienie z `initialAnswers`, overrides client-only wyczyszczone po wznowieniu).
- ✅ **Baza od zera ×2** — świeży lokalny D1: migracje 0001–0003 ✅; seedy ×2 → identyczne liczby
  (idempotencja): aspects 31, levels 155, archetypes 8, archetype_defaults **144** (104+40 G),
  questions **41** (archetype usunięty), rules 46, G-defaults **40** (8×5), archetype_q **0**.
- ✅ **Dostęp admin-only** — pages dev: brak tokenu **401**, klient **403**, admin **200**.
- ✅ **Snapshot przy utworzeniu** — POST → `engine_version=1.1`, `hourly_rate=50` w `est_quotes`.
- ✅ **`build:full` zielony, konsola bez błędów.**
- ⏭️ **Finalize + snapshot totals + parity serwerowa + retrospektywa 2 projekty + test snapshotu
  biblioteki** — granica f1c (patrz Zobowiązania).

## Zobowiązania f1c (przeniesione ze scope, MOCNE)

1. **Finalize** (`POST quote_finalize`): serwerowe przeliczenie tym samym `computeQuote`, snapshot
   `totals_json` + `confidence_breakdown_json`, status `review`; ekran wyniku (pełne widełki,
   ofertowe, koszty, Confidence z progiem).
2. **Parity UI↔serwer**: test porównawczy — ten sam zestaw odpowiedzi ⇒ identyczny `totals_json`
   w podglądzie (UI) i po finalize (serwer). Ręczny przypadek kontrolny krok po kroku (baza →
   itemy → mnożniki+cap → bufor → cena → oferta) vs wynik funkcji.
3. **Test snapshotu**: edycja widełek w bibliotece po finalize NIE zmienia zapisanej wyceny.
4. **Filtr modułów/pytań per archetyp (`archetypes_json`)** — PODNIESIONE z „doszlifowania" do
   OBOWIĄZKOWEGO zakresu f1c: pytania/moduły nieistotne dla archetypu nie mają się pokazywać
   (dziś wizard pokazuje wszystkie z grupy). Wymaga pola zakresu archetypów na pytaniu/module
   i filtra w `WizardSteps`/bibliotece.
5. **Read-back z serwera**: endpoint GET single quote + answers (wznowienie draftu z bazy po
   ponownym wejściu, nie tylko w obrębie sesji komponentu).
6. **Test retrospektywny na 2 realnych, zakończonych projektach** (bramka jakości silnika, nie
   kodu): widełki ofertowe obejmują znany koszt/godziny albo odchylenie wyjaśnione i zaakceptowane
   przez Jakuba.

## Ryzyka i długi

- **Wagi Confidence i poziomy G to DRAFT** — bez realnych wycen kalibracja niemożliwa; ryzyko, że
  „szacunek wstępny" pojawia się za często/za rzadko. Mitigacja: parametry edytowalne, kalibracja
  po pierwszych wycenach (F3 MPE).
- **Wizard pokazuje wszystkie pytania grupy niezależnie od archetypu** — do filtra archetypowego
  w f1c (Zobowiązanie 4). Dziś częściowo maskowane przez `visible_if`.
- **Brak read-backu z serwera** — wznowienie draftu po zamknięciu przeglądarki zadziała dopiero po
  f1c (Zobowiązanie 5). W f1b answers są w D1 (autosave), brak tylko ścieżki odczytu do UI.
- **`pages dev` na Windows** — `--config` z niestandardową ścieżką nieobsługiwane przez Pages
  (crash); obejście: `--d1 DB=<id>` bez `--config`. Nie wpływa na kod, tylko na lokalny rytuał.

## Propozycja następnego kroku

Merge `feat/estimation-f1` do `main` po akceptacji raportu (przegląd „Odstępstwa" + „Decyzje" —
głównie bump engine_version i poziomy G DRAFT). Rytuał prod: re-apply seedów na produkcyjnym D1
(naprawy 1–4 zmieniają seedy: usunięcie pytania `archetype`, +40 G-defaults, +param
`confidence_completeness`) — **czeka na świeży token API od Jakuba** (poprzedni skasowany).
Następnie start f1c wg Zobowiązań.
