# RAPORT f2a — 2026-07-15

Faza **f2a**: dwa dokumenty generowane po finalize — **oferta PDF** (klient) i **Karta decyzji
technicznych** (wewnętrzna / załącznik / brief wykonawczy). Gałąź `feat/estimation-f2a`,
commit bazowy `8987182`. Źródło obu dokumentów: **wyłącznie snapshot**, nigdy live biblioteka.

## Zakres zrealizowany

**1. Migracja 0005** (addytywna, Level 3 zatwierdzony): `est_quote_aspects.level_name`,
`est_quote_aspects.level_description`, `est_quotes.warnings_json`. Bez tego reguła „źródło =
wyłącznie snapshot" była **niewykonalna**: nazwa i opis poziomu (treść zakresu oferty) żyły tylko
w `est_levels`, a alerty nie były nigdzie zapisywane. Zero wpływu na liczby ⇒ **bez bumpu
`engine_version`** (udokumentowane w docs/03).

**2. `lib/estimation/documents.ts`** — czysty builder (zero jspdf/React), 15 testów:
- `buildOffer` → klient: widełki **ofertowe**, zakres słowami (nazwa + opis poziomu, **bez
  godzin**), moduły, integracje, koszty (pozycje „do wyceny ręcznej" **jawnie**), „poza zakresem"
  (`chosen < suggested`), warunki, metadane (nr, data, ważność).
- `buildDecisionCard` → wewnętrzne: rekomendacja vs wybór + powód, decyzje z uzasadnieniami reguł,
  overridy, alerty, Confidence, ryzyka, „czego świadomie nie robimy".

**3. Klasa testu internal-only** — jawna stała `INTERNAL_ONLY_FIELDS` + testy, że do oferty NIE
wyciekają: pełne widełki, godziny (bazowe/po buforze/per obszar/per pozycja), **Confidence i jego
rozbicie**, mnożniki ryzyka, `suggested_level`, uzasadnienia reguł, `engine_version`. Nowe pole
wewnętrzne = dopisz do stałej, test złapie regresję.

**4. Font PL** — wbudowana helvetica jsPDF nie ma Latin Ext („ą/ć/ę" połamane). Subset Manrope
(Latin + Latin Ext) przez `fonttools`, generator: `scripts/fonts/build-pdf-font.py` (uruchamiany
ręcznie, nie w buildzie). **~30 kB base64 na wagę**, w lazy chunkach — `size-limit` bez zmian.
Helper `registerPlFont()` gotowy pod naprawę `services/pdfService.ts` jednym importem.

**5. Metadane oferty**: numer #id, data wystawienia, **termin ważności** =
`est_params.offer_validity_days` (30, potwierdzone przez Jakuba).

**6. Warunki „co w cenie"**: `est_params.offer_terms` (treść = dane, pozycje po `|`).
✅ **Treść FINALNA zatwierdzona przez Jakuba** (6 pozycji) — DRAFT zastąpiony. Kluczowa różnica
wobec draftu: SLA **nie jest już obiecane „w cenie"**, tylko odsyła do wybranego pakietu
utrzymaniowego i umowy. Zarejestrowane jako **D29** w docs/00.

## Odstępstwa od dokumentacji

- **Migracja 0005 poza planem F2** — plan zakładał, że snapshot wystarczy. Nie wystarczał:
  inwariant 3 („snapshot kopiuje KAŻDĄ wartość, której wycena używa") był spełniony dla LICZB,
  ale nie dla TREŚCI. Do dopisania w docs/02 przy najbliższej edycji.
- **R2 + status `sent` NIE w f2a** (plan F2 krok 2 łączy PDF z zapisem do R2). Powód: R2 nie jest
  nowym zasobem (binding `FILES` istnieje), ale zapis wiąże się ze statusem `sent`, którego jeszcze
  nie ma. f2a dowozi wartość bez R2 — PDF pobiera się z przeglądarki. → f2b.
- **Kryterium „plik w R2, link działa"** — niespełnione świadomie (jak wyżej).

## Decyzje podjęte samodzielnie (poziom 1 — do przeglądu)

- **`fromArchetypeDefault` w Karcie decyzji.** E2E ujawnił, że w typowej wycenie sklepu
  **0 z 15 decyzji** miało uzasadnienie — wszystkie poziomy pochodziły z domyślnych archetypu,
  a reguła zapisuje powód tylko gdy PODNOSI poziom. Kryterium F2 mówi „każda decyzja ma
  uzasadnienie", więc Karta oznacza teraz takie decyzje jawnie: *„Poziom domyślny dla archetypu X
  — żadna reguła go nie podniosła"*. **To NIE jest „no-op reasons"** (reguła, która pasowała, ale
  nie podniosła) — tamto wymaga zmiany silnika i zostaje w F3 zgodnie z decyzją architekta.
- Warunki oferty jako **parametr w seedach**, nie stała w kodzie (treść = dane, inwariant 2).
- Termin ważności czytany z `est_params` przy read-backu, **nie ze snapshotu `params_json`**:
  to parametr dokumentu, nie obliczeń — zmiana polityki ma działać na dokumentach od teraz.
- Nazwy plików, layout PDF, `download()` w ResultScreen, struktura generatora fontu.

## Decyzje czekające

**Obie blokady z pierwszej wersji raportu — ROZSTRZYGNIĘTE przez Jakuba/architekta:**

- ✅ **Treść warunków „co w cenie"** — dostarczona i zaseedowana (6 pozycji, D29). Odrzucona
  pozycja draftu „6 miesięcy wsparcia technicznego (SLA) w cenie" zastąpiona odesłaniem do pakietu
  utrzymaniowego i umowy. Rytuał prod odblokowany po stronie treści.
- ✅ **„Poza zakresem" bez powodów** (decyzja architekta): oferta wymienia **tylko nazwy**
  wyłączonych pozycji; powody = notatki wewnętrzne, zostają w Karcie decyzji. Wdrożone:
  `Offer.excluded` to `{ title }[]` (bez `reason`), `override_reason` **dopisany do
  `INTERNAL_ONLY_FIELDS`** + test wycieku. Zarejestrowane jako **D28**.

Nic nie czeka. Nowe pytania z tej rundy → sekcja „Ryzyka i długi".

## Wyniki testów

- **`build:full`: EXIT 0** — lint `--max-warnings 0` czysty; **26 plików testowych / 177 testów**;
  116 tras prerenderowanych; size-limit **67,67 kB** (limit 300) i **29 kB** (limit 50) — **bez
  zmian mimo fontu** (lazy chunk).
- **Moduł wycen: 134 testy** (15 plików), w tym `documents.test.ts` — **16** (klasa internal-only,
  +1 test po decyzji o powodach wyłączeń).
- **TS baseline: 15** (bez wzrostu).

## Kryteria akceptacji (F2, część dokumentowa)

- ✅ **PDF: poprawne polskie znaki** — subset Manrope; zweryfikowane realnym renderem: „Zażółć gęślą
  jaźń — Piłsudskiego" ma glify (szerokość z ogonkami 164,61 ≈ bez 163,00 ⇒ brak podmiany na puste).
- ✅ **Sekcje: zakres + moduły/integracje + koszty + wyłączenia + ważność oferty** — E2E na realnym
  snapshocie: oferta #1 „Meble sp. z o.o.", 11 400–16 800 zł, ważna do 2026-08-14, 15 pozycji
  zakresu, integracja PayU, „poza zakresem: Observability (Klient ma własny monitoring)", 7 warunków.
- ✅ **Zero wycieku internal-only** — E2E na finalnych seedach (wycena #2, po decyzjach architekta):
  ```
  ✅ brak — pełne widełki 9955–22495        ✅ brak — Confidence
  ✅ brak — godziny (hoursMax)              ✅ brak — powód wyłączenia („Klient ma własny monitoring")
  ✅ brak — SLA obiecane „w cenie"
  POZA ZAKRESEM (oferta): [{"title":"Observability"}]          ← same nazwy
  outOfScope (Karta):     [{"title":"Observability","reason":"Klient ma własny monitoring"}]
  ```
  Klucze oferty: `meta, priceRange, scope, modules, integrations, costs, costsTotal, excluded, terms`.
- ✅ **Warunki i ważność z seedów, nie z kodu** — read-back: `validityDays=30`, `warunków=6`,
  ważna do `2026-08-14`; diakrytyki przeżywają round-trip przez D1 („Zarządzanie", „układu").
- ✅ **Karta decyzji: każda decyzja ma uzasadnienie** — reguła, korekta albo jawnie „domyślny
  archetypu" (test pętlą po wszystkich decyzjach).
- ✅ **Test wzorcowy „SLA 99,8% → load balancing ≥1 + HA ≥2 z czytelnym wyjaśnieniem"** — E2E:
  ```
  Load Balancing (poz. 2)     → „SLA 99.8% wymaga redundancji, load balancingu i monitoringu."
  High Availability (poz. 3)  → „Deklarowana krytyczność 24/7 wymaga redundancji i monitoringu."
                              → „SLA 99.8% wymaga redundancji, load balancingu i monitoringu."
  ```
  Kryterium wymagało ≥1 i ≥2 — wyszło **2 i 3**.
- ✅ **Baza od zera ×2** — migracje 0001–**0005** ✅, seedy dwukrotnie, liczby identyczne:
  aspects 31, levels 155, rules 58, modules 32, **params 11** (`offer_validity_days=30`,
  `offer_terms` obecne).
- ⏭️ **Plik w R2 + link** → f2b (razem ze statusem `sent`).
- ⏭️ **Edycja widełek w UI, eksport/import JSON** → f2b/f2c (CRUD biblioteki).

## Self-review

(a) **Zakres nietykalny**: diff dotyka wyłącznie `components/portal/admin/estimation`,
`lib/estimation`, `functions/api/admin/estimation`, `migrations`, `docs/estimation`,
`scripts/fonts` — **nic poza modułem**. (b) **Inwariant 2**: warunki i termin ważności w seedach;
w TS tylko kolory marki i layout. (c) **Inwariant 9**: zero nowych/zmienionych pytań.
(d) **TS baseline 15** bez wzrostu. (e) **Lazy chunki**: `manropeRegular 31 kB`, `manropeBold 31 kB`,
`offerPdf 3 kB`, `decisionCardDoc 4 kB`, `jspdf 386 kB` — **zero w `index`** (grep = 0).

## Ryzyka i długi

- **`services/pdfService.ts` — publiczny PDF kalkulatora ma DZIŚ połamane polskie znaki**
  („Piłsudskiego", „Wstępny"). To dokument z naszym logo wysyłany klientom. Naprawa = jeden import
  (`registerPlFont`), ~15 min. **Jakub autoryzował jako osobny task po f2a.**
- **Oferta wystawi się przy Confidence 0%.** E2E ze świadomie ubogim zestawem odpowiedzi
  (24 pytania bez odpowiedzi, suma kar −204 → clamp do 0) **wygenerował normalną ofertę
  z widełkami**. Silnik działa zgodnie z D23, ale dokument nie ma progu: nic nie broni wysłania
  klientowi ceny wyliczonej z niczego. Naturalnie łączy się z risk-floorem Confidence → **F3**
  (kandydat: blokada/ostrzeżenie przy generowaniu oferty poniżej `confidence_completeness`).
- **„No-op reasons"** (reguła pasowała, ale nie podniosła poziomu → brak uzasadnienia w Karcie)
  → F3 razem z risk-floor Confidence. Częściowo złagodzone przez `fromArchetypeDefault`.
- **Otwarcie istniejącej wyceny nie istnieje** — `QuotesList` renderowany bez `onOpen`,
  `EstimationTab` ma tylko `list | wizard`. Dlatego „pobieranie dokumentów z listy" NIE jest
  drobiazgiem na 30 min, tylko brakującym przepływem (plan F1 krok 6). → f2b.
- **Oferta pokazuje wszystkie 15 obszarów** (także „Podstawowy CI/CD") — czy klient ma to widzieć,
  czy zakres powinien być zwięźlejszy? Do oceny po pierwszym realnym wysłaniu.

## Propozycja następnego kroku

1. **Finalna treść warunków** od Jakuba → podmiana w seedzie.
2. **Rytuał prod**: migracja 0005 + seedy (`offer_terms`, `offer_validity_days`) — czeka na token.
3. Merge `feat/estimation-f2a` → `main` (Jakub, po akceptacji raportu).
4. **Osobny task**: naprawa polskich znaków w `services/pdfService.ts` (autoryzowana).
5. **f2b**: R2 + status `sent`, otwarcie istniejącej wyceny z listy + pobieranie dokumentów,
   CRUD biblioteki.
