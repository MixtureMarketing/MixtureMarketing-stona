# 05 — Silnik reguł i warstwa pytań biznesowych

## Formularz biznesowy (warstwa 1)

Zasady: język klienta (zero żargonu), pytania dynamiczne (`visible_if_json` + filtr archetypu),
grupy pytań jako kroki wizarda: **Projekt → Użytkownicy i skala → Funkcje i integracje →
Marketing → Realizacja**. Cel: 5–15 minut na spotkaniu.

### Stany odpowiedzi (D26)

Pytanie z `allow_unknown=1` ma trzy sposoby domknięcia — plus stan „bez odpowiedzi":

| Stan | Zapis w `est_quote_answers.answer_json` | Confidence | Reguły |
| --- | --- | --- | --- |
| Odpowiedziane | wartość (`"sklep"`, `500`, `true`, `["inpost"]`) | bez kary | matchują normalnie |
| **„nie wiem"** | `{"unknown":true}` | **kara** 8 × `unknown_weight` | tylko operator `unknown` |
| **„nie dotyczy"** (D26) | `{"not_applicable":true}` | **bez kary**, liczy się do kompletności | tylko operator `not_applicable` (NIE `answered`) |
| Brak odpowiedzi | brak klucza | **kara** jak „nie wiem" (D23) | nic nie matchuje |

„nie wiem" = niewiadoma do dopytania. „nie dotyczy" = świadome domknięcie („tego u nas nie ma") —
dlatego nie obniża pewności i nie może włączać reguł zakresu.

### Pytania startowe (seed `questions.sql` — v1, do rozbudowy)

| code | pytanie | typ | grupa |
|---|---|---|---|
| archetype | Na czym budujemy? | select(5 archetypów) | projekt |
| project_goal | Co ma robić projekt? (sklep / wizytówka / portal treści / aplikacja z logowaniem / B2B) | select | projekt |
| views_count | Ile unikalnych podstron/widoków? | number | projekt |
| languages | Ile wersji językowych? | number | projekt |
| design_source | Skąd projekt graficzny? (klient dostarcza / mamy identyfikację / wszystko od zera) | select | projekt |
| workshops | Jak ustalamy zakres? (mail-telefon / spotkania online / warsztaty u klienta) | select | projekt |
| workshops_travel_km | Ile km w jedną stronę? (gdy warsztaty stacjonarne) | number | projekt |
| users_type | Kto się loguje? (nikt / klienci sklepu / pracownicy / firmy B2B / wiele organizacji) | select | użytkownicy |
| users_concurrent | Ilu użytkowników jednocześnie w szczycie? (help: wyprowadź z faktów — zamówień dziennie, liczby pracowników, szczytu sezonowego) | number | użytkownicy |
| traffic_monthly | Szacowany ruch miesięczny? | select(progów) | użytkownicy |
| downtime_tolerance | Co się dzieje, gdy system stoi godzinę? (nic / tracimy sprzedaż / krytyczne 24/7) | select | użytkownicy |
| sla_formal | Czy w umowie będzie formalna gwarancja dostępności? Jaka? (brak / zapis ogólny / konkretny % — podaj) | select+number; widoczne gdy downtime≠nic lub users_type=B2B | użytkownicy |
| sensitive_data | Czy przetwarzamy dane wrażliwe/płatnicze poza bramką? | bool | użytkownicy |
| products_count | Ile produktów/pozycji katalogu? | select(progów) | funkcje |
| product_variants | Czy produkty mają warianty (rozmiar/kolor) lub konfigurację? (brak / proste warianty / masowe warianty / konfigurowalne) | select | funkcje |
| stock_source | Skąd produkty i stany magazynowe? (ręcznie / feedy hurtowni / ERP / dropshipping) | multiselect | funkcje |
| sales_model | Sprzedaż B2C, B2B czy mieszana? | select | funkcje |
| promos_planned | Czy będą promocje/wyprzedaże? | bool | funkcje |
| returns_handling | Zwroty przez system czy mailowo/poza systemem? | select | funkcje |
| payments | Płatności online? (jakie bramki) | multiselect(z biblioteki: payments) | funkcje |
| shipping | Wysyłka? (jacy przewoźnicy/broker) | multiselect(shipping) | funkcje |
| erp | Integracja z ERP/magazynem/księgowością? (który system) | multiselect(erp) | funkcje |
| marketplace | Sprzedaż na marketplace'ach? (Allegro/Amazon/Baselinker) | multiselect(marketplace) | funkcje |
| other_integrations | Inne systemy do połączenia? | multiselect(other)+text | funkcje |
| modules | Funkcje dodatkowe (checklista z biblioteki modułów wg archetypu) | multiselect | funkcje |
| existing_data | Skąd dane startowe? (nowy projekt / przenosimy z istniejącego systemu / plik CSV) | select | funkcje |
| data_sample | Czy mamy dostęp/próbkę danych źródłowych? | bool | funkcje |
| ads_planned | Kampanie płatne po starcie? (Google/Meta/inne) | multiselect | marketing |
| tracking_scope | Jak ważna jest dokładność pomiaru kampanii? (podstawowa / pełny pomiar sprzedaży i remarketing / maksymalna — odporna na blokady reklam i ograniczenia Apple, istotna przy większych budżetach) | select | marketing |
| seo_migration | Czy istnieje strona z pozycjami do zachowania? | bool | marketing |
| content_source | Kto wprowadza treści/produkty? (klient / my z materiałów / my z redakcją) | select | realizacja |
| training | Szkolenie i opieka po starcie? (przekazanie / szkolenie+tydzień / pełny hypercare) | select | realizacja |
| deadline_hard | Sztywny deadline, który wymusi pracę równoległą? | bool | realizacja |
| team_new_tech | (wewnętrzne) Czy stack poza naszą rutyną? | bool | realizacja |

Multiselecty `payments/shipping/erp/marketplace` mapują się bezpośrednio na pozycje
`est_quote_items` typu integration — bez osobnej reguły.

## System jako doradca techniczny (D20)

Reguły nie służą tylko doborowi widełek — każda akcja `min_level` jest **decyzją
architektoniczną z uzasadnieniem**. Widok walidacji prezentuje ją w języku inżynierskim:
nazwa + opis wybranego poziomu (z `est_levels.description` — dlatego opisy poziomów w 04 muszą
mówić „co technicznie robimy", nie tylko klasyfikować) oraz `reason_template` reguły
(„SLA {sla}% = maks. ~{downtime_h} h przestoju/rok — wymagana redundancja"). Nadpisanie decyzji
przez człowieka wymaga powodu i jest zapisywane — po roku baza wycen jest jednocześnie bazą
wiedzy „jak podejmujemy decyzje techniczne".

**Karta decyzji technicznych** (generowana per wycena, F2): per obszar — decyzja (poziom: nazwa
+ opis), uzasadnienie (reguły + powody nadpisań), wymagania od klienta (`est_integrations.requirements`
wybranych integracji), ryzyka (mnożniki + itemy risk≥medium), sekcja „poza zakresem"
(chosen < suggested). Zastosowania: załącznik-specyfikacja do oferty, brief startowy dla
wykonawcy (kontekst pod Claude Code), zapis decyzji projektowych.

## Format reguł (warstwa 2)

`condition_json` — drzewo warunków:
```json
{ "all": [
    { "q": "downtime_tolerance", "op": "eq", "val": "critical_247" },
    { "any": [
        { "q": "users_concurrent", "op": "gte", "val": 500 },
        { "q": "traffic_monthly", "op": "gte", "val": "300k" } ] }
] }
```
Operatory: `eq, neq, gt, gte, lt, lte, in, contains (multiselect), answered, unknown,
not_applicable`. Wartość „nie wiem" nie spełnia żadnego warunku poza `unknown`; „nie dotyczy"
(D26) nie spełnia żadnego poza `not_applicable` — w szczególności NIE `answered`.

`actions_json` — lista akcji:
```json
[ { "type": "min_level", "aspect": "load_balancing", "level": 2 },
  { "type": "min_level", "aspect": "high_availability", "level": 2 },
  { "type": "multiplier", "code": "hard_deadline" },
  { "type": "suggest_module", "code": "b2b_pricing" },
  { "type": "cost_item", "code": "travel", "qty_from": "workshops_travel_km" } ]
```

`reason_template`: „Deklarowana krytyczność 24/7 przy {users_concurrent} użytk. jednoczesnych
wymaga redundancji" — placeholdery z odpowiedzi; wynik trafia do `rule_reasons_json` obszaru.

## Algorytm ewaluacji (deterministyczny)

1. Start: poziomy = `est_archetype_defaults` archetypu (obszary `is_locked` → poziom 0, ukryte).
2. Ewaluuj wszystkie aktywne reguły (kolejność: `priority` DESC, potem id — stabilna).
3. `min_level`: `poziom[aspect] = max(poziom[aspect], level)` — reguły tylko PODNOSZĄ (monotoniczność ⇒ brak zależności od kolejności dla poziomów; priorytet istotny tylko dla przyszłych typów reguł).
4. `multiplier` / `suggest_module` / `cost_item`: dołóż do zbiorów (dedupe po code).
5. Wynik: `suggested_level` per obszar + uzasadnienia; sugestie modułów/mnożników/kosztów
   zaznaczone, ale odznaczalne w walidacji.
6. Walidacja (warstwa 3): użytkownik zmienia poziomy (w obie strony; zmiana ⇒ `override_reason`),
   dodaje/usuwa itemy, zatwierdza → finalize (serwer liczy 03 i snapshotuje).

Konflikt reguł nie istnieje dla `min_level` (max). Reguła nieaktywna/z błędnym kodem obszaru →
log + pominięcie (nigdy crash wyceny).

## Reguły startowe (seed `rules.sql` — v1 ok. 25 reguł; przykłady wzorcowe)

| nazwa | warunek (skrót) | akcje |
|---|---|---|
| Krytyczność 24/7 | downtime=critical_247 | HA≥2, observability≥2, infrastructure≥2 |
| Formalne SLA | sla_formal=konkretny% AND wartość≥99,5 | load_balancing≥1, HA≥3, observability≥3, disaster_recovery≥2 („SLA {sla_formal}% = maks. ~{downtime_h} h przestoju/rok — wymagana redundancja i monitoring") |
| Krytyczność + skala | downtime=critical_247 AND users≥500 | load_balancing≥2, HA≥3 |
| Sklep = fundament e-commerce | project_goal=sklep | payments wymagane (walidacja), emails≥1, analytics≥1, consent≥1, seo≥1 |
| Ruch duży | traffic≥300k | caching≥2, cdn≥1, infrastructure≥2 |
| B2B wiele organizacji | users_type=wiele_organizacji | permissions≥3, rls≥2, multiplier:multi_tenant |
| Dane wrażliwe | sensitive_data=true | security≥2, rls≥1 |
| Logowanie klientów | users_type≠nikt | authentication≥1, permissions≥1 |
| Migracja z istn. systemu | existing_data=przenosimy | data_migration≥2, seo_migration? seo≥3 |
| Brak próbki danych | existing_data=przenosimy AND data_sample=false | multiplier:data_migration_risk |
| Projekt od zera graficznie | design_source=od_zera | uxui≥4 |
| Identyfikacja istnieje | design_source=identyfikacja | uxui≥2 |
| Klient ma projekt | design_source=klient | uxui=0 (default, nie min) → realizowane przez archetype_defaults + brak podbicia |
| Warsztaty stacjonarne | workshops=stacjonarne | discovery≥3, cost_item:travel |
| Warsztaty online | workshops=online | discovery≥2 |
| Kampanie płatne | ads_planned niepuste | sem≥1, tracking: analytics≥2 |
| Pomiar maksymalny | tracking_scope=maksymalna | sst≥2, consent≥2 |
| Duży katalog | products_count≥1000 | database≥2, content≥3 (gdy content_source≠klient) |
| Warianty masowe/konfiguracja | product_variants∈{masowe,konfigurowalne} | backend_logic≥2, database≥2, content≥3 (gdy my wprowadzamy) |
| Hurtownie/feedy | stock_source contains hurtownie|dropshipping | suggest_integration:feed_standard (dropshipping→suggest:dropshipping), observability≥1 (monitoring importów) |
| Promocje planowane | promos_planned=true AND project_goal=sklep | suggest_module:omnibus (wymóg prawny), suggest_module:promo_engine |
| Sprzedaż B2B/mieszana | sales_model∈{b2b,mieszana} | suggest_module:b2b_pricing, rls≥1, permissions≥2 |
| Zwroty w systemie | returns_handling=system | suggest_module:rma |
| Sztywny deadline | deadline_hard=true | multiplier:hard_deadline |
| Nowy stack | team_new_tech=true | multiplier:new_tech |
| Języki 3+ | languages≥3 | frontend≥3, seo≥3 (hreflang), content+1 poziom gdy my wprowadzamy |
| Wielojęzyczny sklep | languages≥2 AND project_goal=sklep | emails≥2 |
| Aplikacja custom | archetype∈{laravel,headless} | apis≥2, cicd≥2, qa≥2, observability≥2 |
| Hypercare pełny | training=hypercare | golive≥3 |
| Szkolenie standard | training=szkolenie | golive≥2 |

Pełną listę reguł v1 (z dokładnymi progami) tworzy Jakub na szablonie
`nazwa / JEŻELI / TO / uzasadnienie` podczas fazy 0 — powyższe wchodzą jako baza do korekty.

## Archetypy — domyślne poziomy (seed `archetypes.sql`, szkic do korekty)

| obszar | wordpress | woocommerce | prestashop | woo_headless | sylius | medusa | laravel | headless |
|---|---|---|---|---|---|---|---|---|
| frontend | 1 | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| apis | 0 | 0 | 0 | 1 | 1 | 2 | 2 | 2 |
| backend_logic | 0 | 1 | 1 | 1 | 2 | 2 | 2 | 1 |
| database | 0 | 1 | 1 | 1 | 2 | 2 | 2 | 1 |
| authentication | 0 | 1 | 1 | 1 | 1 | 1 | 2 | 1 |
| rls | LOCK | LOCK | LOCK | LOCK | 0 | 0 | 0 | 0 |
| infrastructure | 1 | 1 | 1 | 2 | 2 | 2 | 2 | 1 |
| cicd | 0 | 1 | 1 | 2 | 2 | 2 | 2 | 2 |
| observability | 0 | 1 | 1 | 1 | 2 | 2 | 2 | 1 |
| emails | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| seo | 1 | 1 | 1 | 1 | 1 | 1 | 0 | 1 |
| analytics | 1 | 1 | 1 | 1 | 1 | 1 | 0 | 1 |
| consent | 1 | 1 | 1 | 1 | 1 | 1 | 0 | 1 |
(pozostałe obszary: default 0, odblokowane — podnoszą je reguły)

`integration_mode`: platform = wordpress, woocommerce, prestashop, sylius (pluginy BitBag);
custom = woo_headless (front), medusa, laravel, headless. Sylius i Medusa: do czasu pierwszego
zamkniętego projektu reguła dokłada mnożnik `new_tech`.

## Reguły doboru platformy i konfiguratorów (D20; akcja `archetype_warning` nie blokuje — zostawia ślad w Karcie decyzji)

**Krok „Platforma" w wizardzie:** archetyp NIE jest pierwszym pytaniem. Najpierw blok pytań
technologicznie neutralnych (cel, produkty, warianty, sales_model, users_type, języki,
stock_source, krytyczność, logika niestandardowa), potem system ewaluuje reguły z akcją
`recommend_archetype` i prezentuje 1–2 rekomendacje Z UZASADNIENIEM + pełną listę. Użytkownik
wybiera (wybór ostateczny — czynniki spoza formularza są legalne); wybór wbrew rekomendacji
wymaga powodu. `est_quotes` zapisuje `archetype_recommended` + `archetype_chosen` +
`archetype_reason` (wzorzec suggested/chosen). Dopiero wybrany archetyp ustawia domyślne
poziomy i filtruje dalsze pytania. Reguły `archetype_warning` działają dalej jako druga linia
(odpowiedzi z późniejszych kroków mogą podważyć wybór).

Przykładowe reguły `recommend_archetype` (seed, do korekty progów):

| warunek (skrót) | rekomendacja + uzasadnienie |
|---|---|
| sklep AND products<2000 AND brak custom logiki | woocommerce („standardowy sklep — najniższy koszt wejścia i utrzymania") |
| sklep AND products 2k–10k AND bez headless | prestashop lub woocommerce („średni katalog; wybór wg preferencji utrzymania") |
| sklep AND (products≥10000 OR warianty=masowe) AND polskie płatności/kurierzy | sylius („duża skala + polskie integracje z półki — BitBag") |
| sklep AND front headless/React priorytetem AND logika custom | medusa („headless-first, TS end-to-end; uwaga: polskie integracje custom") |
| cel=aplikacja/B2B portal AND commerce dodatkiem | laravel („logika biznesowa jest produktem; commerce od zera lub moduł") |
| cel=wizytówka/landing | wordpress lub headless-astro („waga treści vs wydajność/animacje") |

| nazwa | warunek (skrót) | akcje |
|---|---|---|
| Wyrastanie z Woo | archetype∈{woocommerce,woo_headless} AND (products≥50000 OR (product_variants=masowe AND products≥10000) OR users_concurrent≥500 OR sales_model=b2b z workflow) | archetype_warning: „Wymagania wykraczają poza komfort WooCommerce — rozważ Sylius/Medusa/Laravel; kontynuacja = ryzyko przebudowy" |
| Duży PL sklep → Sylius | project_goal=sklep AND products≥10000 AND stock/płatności polskie AND archetype∉{sylius} | archetype_warning: „Profil pasuje do Sylius (polskie integracje z półki — BitBag)" |
| Headless custom → Medusa | archetype=headless AND project_goal=sklep AND logika custom | archetype_warning: „Rozważ Medusa zamiast budowy commerce od zera" |
| Pierwsze wdrożenie Sylius/Medusa | archetype∈{sylius,medusa} AND brak zamkniętego projektu na archetypie | multiplier:new_tech |
| Konfigurator — konsekwencje | modules contains configurator_* | backend_logic≥2, qa≥2 |
| Konfigurator wizualny | modules contains configurator_2d|configurator_3d | frontend≥3, storage≥2, cdn≥1, cost/moduł: produkcja assetów wg configurator_assets |
| Konfigurator 3D | modules contains configurator_3d | frontend≥3, suggest cost_item:external (modele 3D), multiplier:new_tech (pierwszy raz) |
| Konfigurator bez macierzy opcji | modules contains configurator_* AND config_matrix=false | Confidence −15, alert: „rekomenduj płatny etap Discovery + prototyp jednej ścieżki" |
| CPQ → produkcja | modules contains cpq_engine | integracja ERP (taryfa custom), backend_logic≥3 |

Pytania dodatkowe (grupa: funkcje; widoczne gdy wybrano konfigurator):

| code | pytanie | typ |
|---|---|---|
| configurator_type | Czy kupujący ma widzieć produkt podczas konfigurowania? (nie — tylko lista opcji / płaski podgląd zmieniający się z wyborami / obracany model przestrzenny) | select |
| configurator_products | Ile bazowych produktów konfigurowalnych i ile wymiarów opcji (kolor/rozmiar/materiał/…)? | number×2 |
| config_assets_source | Skąd wizualizacje wariantów? (klient dostarcza gotowe / klient ma surowce / produkcja od zera) | select |
| config_matrix | Czy klient ma spisaną macierz zależności opcji (co z czym można łączyć)? | bool |
| config_output | Co dzieje się z konfiguracją? (koszyk / zapis+link / PDF specyfikacji / do ERP-produkcji) | multiselect |
