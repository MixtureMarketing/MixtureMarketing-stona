# 03 — Model obliczeniowy

Deterministyczny, w całości parametryzowany przez `est_params` / snapshoty. Implementacja jako
czyste funkcje TS (`lib/estimation/engine.ts`), identyczne w UI (podgląd) i API (finalize).

## Krok 1 — godziny bazowe (fundament: obszary)

```
H_min = Σ obszarów: (override_hours_min ?? hours_min poziomu wybranego)
H_max = Σ obszarów: (override_hours_max ?? hours_max poziomu wybranego)
```

Poziom 0 = 0 h. Obszary zablokowane przez archetyp nie uczestniczą (i nie są pokazywane w walidacji).

## Krok 2 — pozycje addytywne (moduły + integracje)

```
H_min += Σ itemów typu module|integration: hours_min (snapshot)
H_max += Σ itemów: hours_max
```

Zasada D4: obszar APIs nie rośnie od liczby integracji; funkcjonalności pokryte modułem nie
podnoszą poziomu obszaru (granice „includes/excludes" w bibliotece rozstrzygają spory).

**D24 (filtr modułów per archetyp, `engine_version` ≥ 1.2).** Moduły z `est_modules.archetypes_json`
(lista kodów; `NULL` = wszystkie) są odsiewane per wybrany archetyp już przy budowie biblioteki
silnika (`buildLibraryData`, współdzielony UI↔serwer). Moduł spoza archetypu nie wejdzie do
wyceny nawet, gdy zasugeruje go reguła lub odpowiedź. Zmiana kompozycji ⇒ bump do 1.2.

## Krok 3 — mnożniki ryzyka (addytywnie, z capem)

```
M = min( Σ aktywnych mnożników.value , multiplier_cap )      // domyślnie cap = 0.40
H_min *= (1 + M);  H_max *= (1 + M)
```

Mnożniki startowe (`est_multipliers`, wartości stałe — D6):

| code                | nazwa                                                       | wartość |
| ------------------- | ----------------------------------------------------------- | ------- |
| multi_tenant        | Multi-tenant / white-label (koordynacja)                    | +0.10   |
| new_tech            | Nowa technologia w zespole                                  | +0.15   |
| data_migration_risk | Ryzyko jakości danych źródłowych (sama migracja = obszar G) | +0.10   |
| hard_deadline       | Sztywny krótki deadline / praca równoległa                  | +0.10   |

Źródło: reguły (silnik włącza automatycznie z odpowiedzi) lub ręcznie w walidacji; oba widoczne
z uzasadnieniem, każdy da się wyłączyć.

## Krok 4 — bufor kontyngencyjny

```
H_min *= (1 + buffer);  H_max *= (1 + buffer)                // domyślnie 0.10
```

## Krok 5 — cena (pełne widełki wewnętrzne)

```
stawka(obszar) = est_category_rates[kategoria] ?? hourly_rate  // v1: wszędzie 50 zł
```

Dla precyzji per kategoria mnożniki i bufor aplikowane są proporcjonalnie do udziału kategorii
w bazie; w v1 (jedna stawka) upraszcza się do `P = H × stawka`. Silnik od początku liczy per
kategoria (struktura wyniku), żeby włączenie stawek kategorii nie zmieniało kodu.

```
P_min = Σ kategorii: H_min(kat) × stawka(kat)
P_max = Σ kategorii: H_max(kat) × stawka(kat)
```

## Krok 6 — widełki ofertowe (zawężone, D7)

Pełna rozpiętość agregatu przeszacowuje niepewność (błędy obszarów nie kumulują się wszystkie
naraz). Oferta pokazuje przedział zawężony i lekko przesunięty w górę (niedoszacowanie boli
bardziej niż przeszacowanie):

```
mid  = (P_min + P_max) / 2
span = P_max − P_min
Oferta_min = roundUp( mid − offer_low_k  × span , rounding_pln )   // offer_low_k  = 0.20
Oferta_max = roundUp( mid + offer_high_k × span , rounding_pln )   // offer_high_k = 0.30
```

Domyślnie oferta ma 50% szerokości pełnych widełek, środek +5% ponad matematyczny środek.
Zaokrąglenie w górę do 100 zł. Współczynniki w `est_params` — kalibracja pętlą zwrotną
(gdy MPE pokaże systematyczne niedoszacowanie, najpierw rosną widełki bazowe, nie współczynniki).

## Krok 7 — pozycje kosztowe (poza roboczogodzinami, D14)

```
Koszty = Σ itemów typu cost: (amount_pln ?? qty × unit_price)
```

Prezentowane w ofercie osobną sekcją („Koszty dodatkowe: dojazdy, licencje"), poza widełkami
godzinowymi; bez mnożników i bufora.

**Rozwiązywanie pozycji z reguł (`engine_version` ≥ 1.3).** Akcja reguły `cost_item` wskazuje
`code` typu z `est_cost_item_types` oraz opcjonalne `qty_from` (kod pytania z ilością). Silnik
wycenia pozycję i dopisuje ją do `items` (wcześniej sugestie reguł nigdy nie trafiały do
`totals.costs` — bug naprawiony w f1c).

```
Dojazd (v1):  qty = km_w_jedną_stronę × 2          // tam i z powrotem; JEDNA pozycja na wycenę,
              amount = qty × unit_price             // niezależnie od liczby spotkań
```
Przykład: 150 km w jedną stronę → 300 km × 1,15 zł = **345 zł**. Mnożnik ×2 to część specyfikacji
formuły (wersjonowana `engine_version`); stawka zł/km jest wartością domenową i żyje w seedach
(`est_cost_item_types.unit_price`). Typ bez `unit_price` albo bez rozwiązywalnego `qty_from`
(np. „usługa zewnętrzna") daje pozycję z kwotą 0 i notatką **„kwota do wyceny ręcznej"** —
sygnał z reguły jest widoczny, a nie po cichu gubiony. Noclegi/wyjazdy wielokrotne: poza v1
(pozycja ad hoc w walidacji).

## Widoczność a obliczenia — D27 (`engine_version` ≥ 1.5)

**Odpowiedzi na pytania NIEWIDOCZNE nie istnieją dla obliczeń.** `computeQuote` filtruje `answers`
przez ewaluację `visible_if` (ta sama funkcja co UI) **przed** regułami, pozycjami i Confidence.

Powód: prowadzący odpowiada na pytania sklepowe, potem zmienia cel na „portal treści" — pytania
znikają z wizarda, ale odpowiedzi zostają w stanie i w `est_quote_answers`. Przed 1.5 dalej po cichu
wyceniały integracje/moduły (wykryte w retro Niepodzielnych: Stripe wchodził do wyceny portalu,
choć pytania o płatności nie dało się zobaczyć).

Filtr jest **punktem stałym**: usunięcie odpowiedzi może ukryć kolejne pytania (kaskada warunków,
np. `sla_value` ← `sla_formal` ← `downtime_tolerance`), więc filtrowanie powtarza się do
stabilizacji. Zbiór odpowiedzi maleje monotonicznie ⇒ zbieżność ≤ liczba pytań. Klucze spoza
katalogu pytań (np. `archetype`) przechodzą nietknięte.

Konsekwencja dla treści seedów: **`visible_if` to nie kosmetyka UI, tylko element modelu
obliczeniowego** — ukrycie pytania usuwa jego wpływ na wycenę.

## Confidence Score (deterministyczny) — `engine_version` 1.3 (D23 + D26)

**D26 — trzy stany odpowiedzi.** Pytanie może być: (a) **odpowiedziane** wartością, (b) **„nie
wiem"** (`{"unknown":true}`) — niewiadoma, karana, (c) **„nie dotyczy"** (`{"not_applicable":true}`)
— PEŁNOPRAWNA odpowiedź: **zero kary**, liczy się do kompletności. Brak klucza = brak odpowiedzi
(karany wg D23). W regułach „nie dotyczy" nie spełnia żadnego operatora — także nie `answered` —
poza jawnym `not_applicable`.

```
C = 100
  − Σ pytań WIDOCZNYCH bez odpowiedzi LUB z „nie wiem": 8 × unknown_weight   // D23; „nie dotyczy" NIE liczy się tu (D26)
  − Σ itemów risk='high':   6
  − Σ itemów risk='medium': 2
  − (jest migracja danych bez próbki/dostępu do źródła: 8)
  − (archetyp = laravel/headless ORAZ brak specyfikacji [discovery poziom ≤1]: 6)
C = clamp(C, 0, 100)

completeness = (widoczne pytania z odpowiedzią) / (widoczne pytania)   // 1.0 gdy brak pytań
belowCompleteness = completeness < confidence_completeness             // param, DRAFT 0.60
```

**D23 (zmiana formuły 1.0→1.1).** Pytanie WIDOCZNE (spełniony `visible_if`) a NIEODPOWIEDZIANE
liczy się do Confidence tak samo jak jawne „nie wiem" (ta sama `unknown_weight`). Skutek:
pusta wycena startuje z niską pewnością, która rośnie w miarę odpowiadania — Confidence mierzy
faktyczną wiedzę o projekcie, nie tylko liczbę deklarowanych niewiadomych. Pytanie ukryte
(warunek `visible_if` niespełniony) NIE obniża pewności.

Próg kompletności `confidence_completeness` (param, DRAFT 0.60): poniżej progu — niezależnie od
score — etykieta zmienia się z „możesz podać widełki" na **„szacunek wstępny — odpowiedz na
więcej pytań"**. Chroni przed podaniem widełek na podstawie garstki odpowiedzi, gdy score
wypadł wysoko przypadkiem.

Przykład (ręcznie): 3 pytania widoczne, `unknown_weight` = 1 każde, 2 odpowiedziane bez „nie
wiem", 1 bez odpowiedzi → C = 100 − 8×1 = 92; completeness = 2/3 = 0,67 ≥ 0,60 → normalna
etykieta. Pusta wycena (0/3) → C = 100 − 3×8 = 76, completeness 0 < 0,60 → „szacunek wstępny".

Progi score (parametry): **≥ 80 zielony** — „możesz podać widełki"; **60–79 żółty** — „podaj
widełki z zastrzeżeniami / doprecyzuj X"; **< 60 czerwony** — „za dużo niewiadomych: zaproponuj
płatne Discovery zamiast wiążącej wyceny". Breakdown składników zapisywany w
`confidence_breakdown_json` i pokazywany w UI (lista: co obniżyło pewność → co dopytać klienta
jeszcze na spotkaniu); każdy składnik nazwany po ludzku (etykieta pytania/pozycji + poziom
ryzyka), nigdy „pozycja"/kod.

## Kolejność i inwarianty (testy silnika)

1. Kolejność kroków ściśle: baza → itemy → mnożniki (cap) → bufor → cena → oferta. Zmiana kolejności = zmiana `engine_version`.
2. `H_min ≤ H_max` po każdym kroku; `Oferta_min ≥ P_min`, `Oferta_max ≤ P_max` (współczynniki walidowane: `offer_low_k + offer_high_k ≤ 1` przy zapisie parametrów... właściwy warunek: `offer_low_k ≤ 0.5` i `offer_high_k ≤ 0.5`).
3. Wycena bez żadnego obszaru > 0 i bez itemów → blokada finalize („pusta wycena").
4. Override godzin nie może dać `min > max`; zmiana poziomu lub override wymaga `override_reason`.
5. Poziom 0 zeruje obszar niezależnie od reguł (użytkownik może świadomie nadpisać sugestię w dół — system zapisuje różnicę suggested/chosen; raport „rekomendowane a wyłączone" zasila sekcję wyłączeń oferty).

## Kalibracja (faza 3, deterministyczna — MPE)

Dla każdej pary (obszar, poziom) z zamkniętych wycen (status `closed`):

```
err_i = (actual_i − mid_est_i) / mid_est_i        // mid_est = środek snapshotowanych widełek
MPE(aspect, level) = mediana(err_i)               // mediana, nie średnia — odporność na outliery
```

Przy n ≥ 3: jeśli |MPE| > 15%, ekran kalibracji proponuje korektę widełek bazowych
`hours_min/max × (1 + MPE)` z podglądem przed/po. Zmiana wymaga ręcznego zatwierdzenia
(nigdy automatu) i działa tylko wprzód (snapshoty chronią historię). Ten sam raport dla
modułów i integracji po `ref_code`.
