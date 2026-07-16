# RAPORT f2c-1 — 2026-07-16

Podfaza **f2c-1: CRUD prostych tabel biblioteki + kolumny `client_*` + porządki z backlogu**.
Gałąź `feat/estimation-f2c` z `main` = `dcec6bf`. Druga bramka (f2c-2: reguły + eksport/import
+ CREATE modułów/integracji) — osobna sesja.

## Zakres zrealizowany

| #   | Zakres                                                                    | Stan |
| --- | ------------------------------------------------------------------------- | ---- |
| 1   | Migracja 0007 (opcja A): 4 kolumny `client_*` — biblioteka + snapshot     | ✅   |
| 2   | Silnik: przewleczenie `client_*` do snapshotu + `buildOffer` fallback     | ✅   |
| 3   | Finalize zamraża `client_*`; `quote` read-back i `library` GET je zwracają | ✅   |
| 4   | API `PATCH /library` + czysty walidator (twarde granice)                   | ✅   |
| 5   | UI edytora `library/` (6 encji, podgląd `visible_if`, widok w zakładce)    | ✅   |
| 6   | Backlog: README aktualne liczby + Karta — zbicie poziomów domyślnych       | ✅   |

**Twarde granice edytora (punkt 2 zakresu)** — egzekwowane przez walidator ORAZ potwierdzone
na żywym SQL (E2E): kody obszarów/modułów/integracji/pytań, klucze parametrów i **value opcji**
są nieedytowalne (400); edytowalne są etykiety i liczby. Zmiany działają wyłącznie wprzód —
snapshoty nietknięte (dowód: E2E niżej + `parity.test.ts`).

## Odstępstwa od dokumentacji

1. **Ruling #2 (monotoniczność) — zweryfikowany, 0 wyjątków.** Poprawiona reguła (`hours_min`
   ściśle rosnące PO POZIOMACH i `hours_max` ściśle rosnące; nakładanie pasm legalne) sprawdzona
   parserem na **komplecie 155 poziomów z seedów** → 0 naruszeń. Walidator egzekwuje ją twardo
   (400) bez odrzucania istniejących seedów. Nakładanie (np. frontend L2 40–100 vs L3 80–160) —
   legalne, nie sprawdzane.
2. **Integracje: `category` poza edycją f2c-1.** Kategoria integracji ma inny słownik niż A..G
   obszarów (`payments/shipping/...`); nie było jej na liście „widełki, ryzyko, zakresy". Usunięta
   z pól edytowalnych integracji, żeby nie mieszać dwóch słowników. Check A..G przypięty wyłącznie
   do obszarów.

## Decyzje podjęte samodzielnie (poziom 1)

- **Jeden endpoint `PATCH` z dyskryminatorem `entity`** (zatwierdzone przez architekta w planie).
  Naturalny klucz (`code`/`{aspect_code,level}`/`key`) jako niezmienny identyfikator — to samo,
  co „kod = kontrakt danych".
- **Walidator jako osobny czysty moduł** `lib/estimation/libraryEdit.ts` — testowalny bez D1,
  endpoint tylko go woła i buduje UPDATE z pól whitelisty (nazwy kolumn ze stałej listy, wartości
  bindowane; brak wstrzyknięcia SQL).
- **Podgląd `visible_if` READ-ONLY** (`visibleIf.ts`) — rozwiązuje kody pytań i value opcji na
  etykiety („widoczne, gdy: «Cel projektu» = Sklep"), zero edycji surowego JSON (punkt 2 zakresu).
- **Edytor opcji pytania**: value pokazane jako plakietka read-only, edytowalna tylko etykieta —
  twarda granica także w UI (obrona w głąb; serwer i tak egzekwuje).
- **UI edytora w lazy chunku** (`lazy(() => import('./library/LibraryView'))`) — `index.js`
  bez wzrostu (67,74 kB). „Biblioteka" to czwarty widok w istniejącej zakładce Wyceny — **bez
  dotykania `AdminDashboard`** (zakres nietykalny nietknięty, nawet autoryzowany wyjątek zbędny).
- **Zakres pól edytowalnych f2c-1** (świadome zawężenie, nie ubytek): `is_active` (toggle
  aktywności), `allow_unknown`/`unknown_weight` pytań oraz **zakresy modułów/integracji**
  (`archetypes_json`/`goals_json`) są w whiteliście API, ale **nie wystawione w formularzu** —
  wymagają edycji list/JSON, którą łączę z f2c-2 (CREATE + formularz reguł). Edycja etykiet,
  opisów, widełek, ryzyka, `client_*`, widoczności i parametrów pokrywa cel f2c-1.

## Decyzje czekające

- **Poziom 2 (Jakub) — `prerender.js` ma TEN SAM bug co sitemapa przed fix-em.** `process.loadEnvFile()`
  bez argumentu czyta `.env` (nie istnieje) zamiast `.env.local`, więc `build:full` **pada lokalnie**
  na `createClient` Sanity (brak `VITE_SANITY_PROJECT_ID`). **CI działa** (podaje zmienne wprost), więc
  produkcji to nie dotyczy — to dług lokalnego dev-u. Zgodnie z ZASADY §5 **nie doklejyłem tego do
  f2c** (obcy plik, obcy zakres); bramkę przeszedłem eksportując zmienne z `.env.local`. Propozycja:
  osobna mikro-gałąź, jedna linia `loadEnvFile('.env.local')`, jak przy `generate-sitemap.js` (a2bb840).
- **Poziom 3 (architekt): brak otwartych.** Opcja A (migracja 0007 + snapshot `client_*`) była
  jedynym punktem Level 3 i została zatwierdzona przed kodem.

## Wyniki testów

`npm run build:full` — **exit 0**:

- lint: `eslint . --max-warnings 0` → **0 błędów, 0 ostrzeżeń**
- testy: **310 passed (37 plików)**; typecheck **15 błędów = baseline** (0 w plikach f2c)
- size-limit: `index.js` **67,74 kB / 300 kB**, `index.css` **29,12 kB / 50 kB**
- prerender: wszystkie trasy; audit:health **61 healthy / 0 broken**

Dołożone w f2c-1: **+52 przypadki** (258 → 310)

| plik                          | testy      |
| ----------------------------- | ---------- |
| `libraryEdit.test.ts`         | 22         |
| `library.test.ts` (PATCH)     | +8 (→10)   |
| `library/visibleIf.test.ts`   | 9          |
| `documents.test.ts` (client\_)| +5 (→21)   |
| `library/EntityTable.test.tsx`| 4          |
| `pdf/decisionCardDoc.test.ts` | 4          |

**Baza od zera, dwa razy** (`.wrangler/state/v3/d1` skasowany): migracje 0001–0007 ✅ (0007
addytywne, 5 komend); seedy ×2 w kolejności zależności → liczby po **dwóch** przebiegach równe
(idempotencja), **zweryfikowane `COUNT(*)`**:
`aspects 31 · levels 155 · archetypes 8 · archetype_defaults 144 · questions 41 · rules 58 ·
modules 32 · integrations 37 · multipliers 4 · cost_item_types 7 · params 11`.

## Kryteria akceptacji

Kryteria F2 z `docs/07` obejmują całą fazę 2. Stan po f2c-1:

- [x] **Edycja widełek w UI → nowa wycena po nowemu, stara bez zmian** — E2E niżej.
- [x] **PDF / Karta decyzji** — f2a/f2b; f2c-1 poprawia tylko zbicie poziomów domyślnych (bez
      zmian danych, test markdownu + realny render PDF zielone).
- [ ] **Reguła zmieniona w UI działa bez deployu** — **f2c-2**.
- [ ] **Import/eksport JSON round-trip** — **f2c-2**.

**E2E na żywym `wrangler pages dev` + lokalne D1** (dowód warstwy LOGIKI API; warstwa Pages wg
ZASADY §1 wymaga preview/prod) — **10/10 OK**:

| obszar                       | dowód                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| auth nietknięty              | bez tokenu **401**, klient **403**, admin **200**                                          |
| PATCH: zmiana `code`         | **400**, żaden UPDATE nie idzie                                                             |
| PATCH: poziom `min>max`      | **400**                                                                                     |
| PATCH: poziom niemonotoniczny| `hours_min=250` (= L3 min) → **400**                                                        |
| PATCH: `client_name` obszaru | **200**, `GET library` pokazuje „Strona i wygląd"                                           |
| snapshot `client_*` zamrożony| wycena #1 finalizowana z ustawionym `client_name` → snapshot ma „Strona i wygląd"          |
| **edycja widełek**           | PATCH `analytics` L1 `hours_min` 4→7 → **nowa #2** `base.hoursMin=148`, **stara #1 = 145** |

## Ryzyka i długi

1. **`prerender.js` (Level 2)** — patrz „Decyzje czekające". Do mikro-gałęzi.
2. **CREATE modułów/integracji + edycja zakresów (`archetypes_json`/`goals_json`) + reguły** —
   świadomie w f2c-2 (ruling #3: CREATE modułów/integracji WYMAGANE w f2c-2).
3. **`is_active` / `allow_unknown` / `unknown_weight`** — w API, nie w formularzu f2c-1. Do
   uzupełnienia w f2c-2, jeśli okaże się potrzebne przy przeglądzie seedów.
4. **Treści klienckie (`client_*`) są puste (NULL)** — dokumenty klienta używają na razie nazw
   wewnętrznych (fallback). Uzupełnienie treści to praca merytoryczna Jakuba w edytorze (README
   seedów to odnotowuje). Kod gotowy: ustawione `client_name`/`client_description` wchodzą do
   oferty od następnej wyceny, a wysłane wyceny zostają zamrożone.
5. **Podgląd `visible_if` jest read-only** — edycja warunków widoczności (formularz) nie jest
   w zakresie f2c; tworzenie/edycja warunków reguł to f2c-2/F3.

## Propozycja następnego kroku

1. **Akceptacja raportu f2c-1** → merge `feat/estimation-f2c` do `main` (wykonawca wg Twojej
   jawnej delegacji). Rytuał prod (migracja 0007 na prod D1 + re-apply kompletu seedów) — jak przy
   0006: **0007 na prod PRZED deployem kodu** (nowy `library`/`finalize` czytają `client_*`);
   bezpiecznik `migrations list --remote` = pending wyłącznie 0007. Świeży token z TTL 24h.
2. **Mikro-gałąź `prerender.js`** (Level 2, jedna linia) — analogicznie do sitemapy.
3. **f2c-2** (osobna sesja): edytor reguł (formularz wartości warunków/akcji, JSON podgląd),
   CREATE modułów/integracji (kod nadawany przy tworzeniu, potem immutable), eksport/import JSON
   z dry-run. Domyka pozostałe kryteria F2.
