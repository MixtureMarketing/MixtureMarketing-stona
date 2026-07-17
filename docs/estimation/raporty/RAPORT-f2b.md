# RAPORT f2b — 2026-07-15

Faza: **cykl życia wyceny + szlif dokumentów**. Gałąź `feat/estimation-f2b`
(`8a9966d`, `ccf7fd6`, `39fe4b3`) z `main` = `df2cbba`.

## Zakres zrealizowany

| #   | Zakres                                                        | Stan                             |
| --- | ------------------------------------------------------------- | -------------------------------- |
| 1   | Logo w PDF-ach + hierarchia, rytm, separatory, kolumny stopki | ✅ bramka wizualna zaakceptowana |
| 2   | Statusy `review → sent → won/lost` + daty + guard D30         | ✅                               |
| 3   | Otwieranie wyceny z listy (o ekranie decyduje status)         | ✅                               |
| 4   | Duplikacja („rewizja")                                        | ✅                               |
| 5   | R2: zapis obu PDF-ów, link do pobrania z listy                | ✅                               |

**Rytuał produkcyjny: NIEWYKONANY** — czeka na świeży token (TTL 24h). Kolejność ustalona
przez Jakuba: **migracja 0006 na prod D1 PRZED deployem kodu** (nowy kod czyta `sent_at`
i `card_r2_key`; odwrotna kolejność = 500). Bezpiecznik: `migrations list --remote` musi
pokazać pending **wyłącznie 0006**.

## Odstępstwa od dokumentacji

1. **`lost_reason` wymagany** — nie było tego w zakresie fazy od architekta, ale
   `docs/02` (zasada 3) mówi to wprost. Docs = spec, więc wdrożone jako wymagane
   (potwierdzone przez Jakuba przed kodem). API: 400 przy braku, także przy pustym stringu.
2. **`migrations/seed/README.md` ma nieaktualne liczby** — mówi „34 reguły (draft v1)",
   „40 pytań", „27 modułów", „104 domyślne poziomy", a realny seed daje 58/41/32/144.
   Rozjazd sprzed f2b, nietknięty świadomie (ZASADY §5: nie doklejamy zakresu przy okazji).
   Do naprawy w f2c przy CRUD biblioteki.

## Decyzje podjęte samodzielnie (poziom 1)

**Ratyfikowane przez Jakuba w trakcie fazy:**

- **400 ≠ 409.** 400 = status spoza słownika modelu („DELETED", SQL w polu); 409 = status
  znany, ale przejście niedozwolone teraz. Pierwsza wersja kodu dawała 400 na
  `sent → review` („cofnij wysłaną do edycji"), czyli traktowała sensowną prośbę jak śmieć.
  `closed` jest w słowniku ⇒ 409 (przejście dołoży F3).
- **Duplikat bierze świeże parametry**, nie `params_json` źródła — „bez snapshotu" obejmuje
  też parametry; to nowa wycena, z dzisiaj.
- **`(rev 2)` → `(rev 3)`**, nie `(rev 2) (rev 2)`.

**Pozostałe:**

- `lib/pdf/theme.ts` (tokeny) + `lib/pdf/layout.ts` (prymitywy) zamiast jednego pliku —
  rozdzielenie „co" od „czym rysujemy".
- Nagłówek oferty: logo **zastępuje** nazwę pisaną tekstem (logo to lockup z wordmarkiem —
  nazwa obok byłaby tym samym dwa razy).
- Karta: plakietka „DOKUMENT WEWNĘTRZNY" + własna stopka na każdej stronie (D28 — dokument
  pokazuje Confidence i mnożniki; ma o sobie mówić, czym jest).
- `components/portal/admin/estimation/status.ts` — etykiety, style i **odbicie** tabeli
  przejść dla UI (wyłącznie po to, by nie rysować przycisku, który dostanie 409).
- `LIST_QUERY` rozszerzone o daty i klucze R2; kolumna „Data" pokazuje datę **przejścia**,
  nie utworzenia.
- `quote-file`: `Content-Disposition: wycena-{id}-{oferta|karta-decyzji}.pdf` +
  `Cache-Control: private` (D28).
- `QuoteWizard.resumeQuoteId` — wizard umiał dotąd tylko tworzyć.
- `addImage(..., alias, 'SLOW')` — patrz „Wyniki".

## Decyzje czekające

- **Poziom 2 (Jakub):** brak nowych. Backlog zgłoszony przez Jakuba przy bramce wizualnej
  (do f2c/F3, świadomie nietknięty): (a) angielskie nazwy obszarów w dokumentach klienckich
  („Authentication", „Backend Logic", „Observability") → polskie nazwy klienckie albo kolumna
  w `est_aspects`; (b) zbicie pozycji „poziom domyślny" w Karcie w jedną sekcję zbiorczą.
- **Poziom 3 (architekt):** brak otwartych. D30 rozstrzygnięte i zapisane.

## Wyniki testów

`npm run build:full` — **exit 0**:

- lint: `eslint . --max-warnings 0` → **0 błędów**
- testy: **258 passed (33 pliki)**; typecheck **15 błędów = baseline** (zero w plikach f2b)
- size-limit: `index.js` **67,7 kB / 300 kB**, `index.css` **29,11 kB / 50 kB**
- audit:health: **61 healthy / 0 broken**

Dołożone w f2b: **+70 przypadków**

| plik                      | testy      |
| ------------------------- | ---------- |
| `quote-status.test.ts`    | 24         |
| `quote-duplicate.test.ts` | 12         |
| `quote-documents.test.ts` | 9          |
| `quote-file.test.ts`      | 8          |
| `e2e-f2b.test.tsx`        | 8          |
| `pdf/render.test.ts`      | 8 → **17** |

**Baza od zera, dwa razy** (`.wrangler/state/v3/d1` skasowany):
migracje 0001–0006 ✅; seedy ×2 w kolejności zależności → liczby po **dwóch** przebiegach
równe wartościom z jednego (brak duplikacji ⇒ idempotencja):
`aspects 31 · levels 155 · archetypes 8 · archetype_defaults 144 · questions 41 · rules 58 ·
modules 32 · integrations 37 · multipliers 4 · cost_item_types 7 · params 11`.

## Kryteria akceptacji

Kryteria F2 z `docs/07` obejmują całą fazę 2 (f2a + f2b + f2c). Stan po f2b:

- [x] **PDF: plik w R2, link działa** — E2E niżej: upload → `quotes/1/oferta.pdf` →
      pobranie 200, `application/pdf`, **83 553 bajty = dokładnie tyle, ile miał wysłany plik**.
- [x] **PDF: polskie znaki, sekcje, ważność** (domknięte w f2a; w f2b utrzymane — 17 testów
      realnego renderu, w tym waga i logo).
- [x] **Karta decyzji: każda decyzja ma uzasadnienie** (f2a; w f2b bez zmian merytorycznych).
- [ ] **Edycja widełek w UI → nowa wycena po nowemu, stara bez zmian** — f2c (CRUD biblioteki).
- [ ] **Reguła dodana w UI działa bez deployu** — f2c.
- [ ] **Import/eksport JSON round-trip** — f2c.

Kryteria własne f2b (z zakresu Jakuba) — **dowody z żywego `wrangler pages dev`**
(`--d1 DB=… --r2 FILES`, bindingi `env.DB` i `env.FILES` zgłoszone przez wranglera):

| kryterium            | dowód                                                                                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| auth bez zmian       | bez tokenu **401**, token klienta **403**, admin **200**                                                                                                                                 |
| guard D30            | `sent` bez dokumentów → **409** „brak dokumentów w repozytorium (oferta, Karta decyzji)"                                                                                                 |
| upload obu PDF-ów    | **200** `{"pdf_r2_key":"quotes/1/oferta.pdf","card_r2_key":"quotes/1/karta-decyzji.pdf"}`                                                                                                |
| `sent` po uploadzie  | **200**, `sent_at = 2026-07-15 19:46:37` w bazie                                                                                                                                         |
| pobranie z R2        | **200**, `Content-Disposition: inline; filename="wycena-1-oferta.pdf"`, `Cache-Control: private`, 83 553 B, nagłówek `%PDF-`                                                             |
| przejścia nielegalne | `sent→review` **409**, `sent→draft` **409**, `sent→closed` **409**, `won→lost` **409**                                                                                                   |
| status-śmieć         | `"DELETED"` → **400** (nie 409)                                                                                                                                                          |
| `lost` bez powodu    | **400** „Przegrana wymaga podania powodu"                                                                                                                                                |
| `sent → won`         | **200**, `won_at` ostemplowane                                                                                                                                                           |
| finalize na wysłanej | **409** (guard C.6 z f1c nadal żyje)                                                                                                                                                     |
| duplikacja           | `{"id":2,"status":"draft","source_id":1,"answers":1}`, nazwa `… (rev 2)`                                                                                                                 |
| **inwariant 3**      | źródło #1: `sent`, `sent_at`, `pdf_r2_key`, **30 aspektów** snapshotu; duplikat #2: `draft`, `sent_at=null`, `pdf_r2_key=null`, `totals=null`, **0 aspektów**, odpowiedzi skopiowane 1:1 |

## Ryzyka i długi

1. **`npm run build:full` jest lokalnie zepsuty** (nie przez f2b): `scripts/generate-sitemap.js`
   woła `process.loadEnvFile()` bez argumentu, czyli czyta `.env`, a konwencją repo (CLAUDE.md)
   jest `.env.local`. CI przechodzi, bo podaje zmienne wprost. Obszedłem, eksportując `VITE_*`
   z `.env.local` przed uruchomieniem. Poza zakresem modułu ⇒ **do decyzji Jakuba** (poziom 2).
2. **Pułapka harnessu, nie aplikacji:** w E2E nazwa „E2E f2b — sklep" zapisała się z U+FFFD.
   Diagnoza: pauzę zjadła **moja linia poleceń w Git Bashu**, nie API. Dowód kontrolny — ten
   sam JSON wysłany z pliku UTF-8: `hex(name) = E28094` (U+2014), `client_name = „Świętosław
Ćwikła"` zapisane poprawnie. Wniosek na przyszłość: treści z polskimi znakami w E2E
   podajemy przez `--data-binary @plik`, nigdy inline.
3. **Osierocone obiekty w R2:** nie ma ścieżki kasowania wyceny, więc i nie ma czego sprzątać —
   ale gdy powstanie (F3), musi kasować `quotes/{id}/*`. Klucz jest deterministyczny, więc
   sprzątanie będzie trywialne.
4. **Karta nie renderuje sekcji „Odstępstwa od sugestii systemu"** w PDF (markdown ma).
   Informacja nie ginie — odstępstwa są przy każdej decyzji jako „Korekta". Do rozważenia w f2c.
5. **`closed` nieosiągalny** do F3 — świadome; `PRZEJSCIA` i test już to opisują.
6. **`lib/pdf/` jest współdzielone** z publicznym kalkulatorem (`services/pdfService.ts`).
   f2b dołożyło tam tylko nowe pliki (`theme`, `layout`, `logoPng`) — `fontPl`/`text` bez
   zmian, testy kalkulatora zielone. Przy kolejnych zmianach warstwy: pamiętać o obu stronach.
7. **Odbicie tabeli przejść w UI** (`status.ts`) może się rozjechać z `quote-status.ts`.
   Rozjazd jest niegroźny (API zawsze wygrywa: 409), ale myli. Docelowo: jedno źródło.

## Propozycja następnego kroku

1. **Rytuał prod f2b** (czeka na token): backup → `d1 migrations list --remote` (pending =
   wyłącznie 0006) → `d1 migrations apply --remote` → **dopiero potem** merge i deploy →
   smoke: `/portal/admin` 200, otwarcie wyceny z listy, guard 409 na prodzie.
2. **f2c**: CRUD biblioteki + eksport/import JSON (domyka kryteria F2) + backlog z bramki
   wizualnej: polskie nazwy obszarów w dokumentach klienckich, zbiorcza sekcja „poziom
   domyślny" w Karcie, liczby w `seed/README.md`.
3. Pierwsza prawdziwa oferta — ruch Jakuba. Wycena #4 zostaje w `review` (nie
   przefinalizowujemy atrapy).
