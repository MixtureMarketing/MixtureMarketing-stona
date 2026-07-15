# RAPORT f1a — 2026-07-14

Gałąź: `feat/estimation-f1` (6 commitów, base `main` z f0). Diff: 16 plików, +1292/−96.
Dowody lokalne (D1 `--local` / `wrangler pages dev`) + realne wdrożenie seedów na prod.

## Zakres zrealizowany

Podfaza **f1a = utworzenie wyceny + krok „Platforma" (D21)** (podział F1: f1b = pełny wizard +
podgląd + walidacja; f1c = finalize + snapshot + wynik).

- **A — seedy platformowe** ✅ 10 reguł (recommend_archetype ×6, archetype_warning ×4, id 35–44,
  DRAFT progów) + 2 pytania neutralne (`custom_logic`, `frontend_headless`).
- **B — silnik** ✅ pokrycie recommend_archetype/archetype_warning (5 testów; silnik z F0 już
  wspierał akcje — test potwierdza kontrakt f1a).
- **C — API** ✅ `quotes.ts`: POST (draft + KOMPLET odpowiedzi atomowo) + PUT (autosave);
  `library.ts` GET (11 kolekcji dla silnika w UI). 12 testów (mock D1).
- **D — UI** ✅ `engineAdapter` (data-driven pytania z reguł) + `useEstimationLibrary` +
  `PlatformStep` (pytania → rekomendacja silnikiem → wybór + powód + warnings) + `QuoteWizard`
  + `EstimationTab`; `AdminDashboard` → EstimationTab (lazy).
- **E — bramka** ✅ `build:full` EXIT 0 + E2E `pages dev` + rytuał prod re-apply seedów.

Poza planem: `chore(lint)` — `.wrangler` do eslint ignores (autoryzowane przez Jakuba).

## Odstępstwa od dokumentacji

1. **Zestaw pytań kroku „Platforma" węższy niż blok neutralny D21.** Dotyczy: `docs/05` (blok
   neutralny: cel, produkty, warianty, sales_model, users, języki, stock, krytyczność, logika
   niestandardowa). Pytania Platformy wyprowadzane **data-driven z reguł `recommend_archetype`
   v1**, które używają tylko 7 sygnałów — patrz sekcja „Pokrycie kroku Platforma" niżej. Powód:
   inwariant 2 (pytamy dokładnie o to, czego wymagają reguły). Reszta bloku D21 wchodzi w wizard
   f1b i/lub warunki `archetype_warning`. Świadome, do rozszerzenia gdy Jakub dopracuje progi reguł.

## Decyzje podjęte samodzielnie (poziom 1)

- **Data-driven wyprowadzenie pytań neutralnych** z reguł `recommend_archetype` (`platformQuestionCodes`
  w `engineAdapter`) — zamiast przetagowywania grup `question_group`; zero hardkodu listy (inwariant 2).
- Draft dopiero po wyborze archetypu (est_quotes.archetype_code NOT NULL) — odpowiedzi neutralne
  w stanie React, zapis przy POST.
- POST zapisuje odpowiedzi w `env.DB.batch` (atomowo); id z `meta.last_row_id` (D1 nie ma
  transakcji międzywywołaniowych — batch po insercie quote). Nazwy pól/komponentów, treść UI.
- `library.ts` zwraca surowe kolumny JSON (parsowanie po stronie klienta w `engineAdapter`).

## Decyzje czekające

**Poziom 2 → Jakub (treść, inwariant 2):**
- Progi 10 reguł platformowych v1 (products<2000, ≥10000, ≥50000, product_variants, custom_logic,
  polskie integracje) — zapowiedziałeś korektę przy przeglądzie seedów przed f1c.
- Czy blok Platformy ma pytać także o sales_model/users/języki/stock/krytyczność (rozszerzenie
  reguł recommend), czy zostają w wizardzie f1b? (patrz sekcja pokrycia).

**Poziom 3 → architekt:** brak. Bez zmiany schematu 02 / formuł 03 / semantyki 05.

## Wyniki testów

- **`npm run build:full` — EXIT 0**: lint `--max-warnings 0` ✅ · **94 testy** (15 plików) ✅ ·
  size-limit index **67.81 kB / 300**, CSS **28.96 kB / 50** ✅ · prerender **61 healthy / 0 broken** ✅.
- Nowe testy f1a: silnik +5 (Platforma), API +9 (POST/PUT/library), engineAdapter +4.
- **TS baseline: 15 = jak `main`** (0 nowych).

## Pokrycie kroku „Platforma" (adnotacja #1)

Pytania renderowane w kroku Platforma są **wyprowadzane z warunków reguł `recommend_archetype`
v1** (rule 35–40). Porównanie z blokiem neutralnym D21 (docs/05):

| Blok neutralny D21 | Pytanie (code) | Wyprowadzone z reguł v1? | Adnotacja |
|---|---|---|---|
| cel | `project_goal` | ✅ | reguły 35–40 |
| produkty | `products_count` | ✅ | reguły 35, 36, 37 |
| warianty | `product_variants` | ✅ | reguła 37 |
| logika niestandardowa | `custom_logic` | ✅ (nowe f1a) | reguły 35, 38 |
| model sprzedaży | `sales_model` | ❌ | v1 recommend nie używa; jest w warning 41 (post-wybór) + wizard f1b |
| użytkownicy | `users_type` / `users_concurrent` | ❌ | `users_concurrent` w warning 41; `users_type` nieużywane v1 → wizard f1b |
| języki | `languages` | ❌ | nieużywane w recommend v1 → wizard f1b |
| stock | `stock_source` | ❌ | nieużywane w recommend v1 → wizard f1b |
| krytyczność | `downtime_tolerance` | ❌ | nieużywane w recommend v1 → wizard f1b |
| (dodatkowe) | `frontend_headless` | ✅ (nowe f1a) | reguły 36, 38 — sygnał „front headless/React priorytetem" z D21 |
| (dodatkowe) | `payments`, `shipping` | ✅ | reguła 37 — „polskie płatności/kurierzy" |

**Wniosek:** zestaw Platformy = dokładnie 7 sygnałów wymaganych przez recommend v1 (podzbiór D21 +
payments/shipping/frontend_headless). Pozostałe pytania D21 (sales_model, users, języki, stock,
krytyczność) nie są potrzebne rekomendacji v1, więc nie pytamy o nie na Platformie — wejdą w
wizard f1b i/lub warunki `archetype_warning`. Podejście data-driven: gdy Jakub rozszerzy reguły
recommend o te sygnały, zestaw pytań Platformy **auto-rozszerzy się** bez zmian w kodzie.

## Rytuał prod re-apply seedów (adnotacja #2 — pełne outputy)

Procedura na stałe (ZASADY §2): backup → liczby przed/po → `COUNT est_quotes WHERE status != 'draft'`.

```
(a) backup remote:  d:/tmp/backup-mixture-db-przed-f1a-seedy.sql — 992244 bajtów (~969 kB) ✅
(b) liczby PRZED:   aspects=31  levels=155  rules=34  questions=40
(e) non-draft:      COUNT est_quotes WHERE status != 'draft' = 0   ✅ (brak sfinalizowanych)
(c) re-apply:       aspects levels archetypes questions rules modules integrations
                    multipliers cost_item_types params — wszystkie ok
(d) liczby PO:      aspects=31  levels=155  rules=44  questions=42
```

**Nieinwazyjność:** `aspects`/`levels` bez zmian (istniejąca biblioteka nietknięta); `rules`
34→44 (+10 reguł f1a), `questions` 40→42 (+2 pytania f1a) — przyrost dokładnie o dodatki f1a,
zero destrukcji. Snapshot-first + `non_draft=0` chronią wyceny (w f1a formalność; rytuał wchodzi
na stałe).

## Kryteria akceptacji (F1, zakres f1a)

- ✅ **Krok „Platforma"** (kryterium F1 dodane w planie) — recommend_archetype zwraca ≥1
  rekomendację z uzasadnieniem (E2E: 8 archetypów, reguły 35–40); wybór wbrew rekomendacji
  wymaga powodu (UI `mismatch` + `archetype_reason`); archetype_warning widoczne (druga linia).
- ✅ **Utworzenie draftu + zapis odpowiedzi** (E2E: POST → 201, `est_quote_answers` = 4 wpisy
  w tym „nie wiem" `{"unknown":true}`); autosave PUT → 200 (archetype_reason + odpowiedź).
- ✅ **zakładka admin-only** — E2E `pages dev`: library admin **200** / klient **403**.
- ✅ **„nie wiem"** — E2E: `custom_logic={"unknown":true}` zapisane (feed Confidence w f1c).
- ✅ **`build:full` zielony, lazy chunk** — EXIT 0; moduł w `EstimationTab-*.js`, index bez wzrostu.
- ⏸️ **Pełny przepływ do finalize / totals / test retrospektywny / snapshot / parytet UI-serwer**
  — zakres **f1c** (finalize), nie f1a. Odłożone świadomie wg podziału f1a/f1b/f1c.

## Ryzyka i długi

- **Progi reguł platformowych = DRAFT** — rekomendacje „ładne, ale mogą kłamać" dopóki Jakub nie
  skalibruje (zapowiedziane przed f1c). Największy dług merytoryczny f1a.
- **Zawężony blok Platformy** (patrz pokrycie) — jeśli rekomendacja ma uwzględniać sales_model/
  users/języki/stock/krytyczność, trzeba rozszerzyć reguły recommend (auto-rozszerzy pytania).
- **Prod D1 ma reguły f1a, ale kod jeszcze nie** — krok Platforma zadziała na prod dopiero po
  merge f1 → main → deploy (Jakub). Do tego czasu prod D1 i prod kod są niespójne wersyjnie
  (bezpieczne: brak UI korzystającego z nowych reguł do deployu).
- **Token API `cfut_…`** — nadal ważny (użyty do rytuału); do skasowania po zakończeniu prac.

## Propozycja następnego kroku

Po akceptacji raportu + przeglądzie architektonicznym: **merge `feat/estimation-f1` → main**
(Jakub) — uwaga: gałąź obejmie też f1b/f1c, więc merge dopiero po ich zamknięciu, albo cherry-pick
f1a jeśli chcesz wdrożyć krok Platforma wcześniej. Następnie **f1b**: pełny wizard pytań
(pozostałe grupy) + podgląd na żywo (silnik w UI) + walidacja techniczna (poziomy, override,
moduły/integracje/mnożniki). Kalibracja progów reguł przez Jakuba przed f1c.
