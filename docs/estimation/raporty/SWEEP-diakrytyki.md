# Sweep diakrytyków w seedach — pełny diff do przeglądu

Gałąź `feat/seed-diakrytyki`, commit `6aaea9f`. **82 zdania zmienione, zdanie po zdaniu.**

Metoda: mapa pełnych zdań, dopasowanie dokładne. NIE słownik — forma ASCII `logika`
występuje w 8 zdaniach i wymaga różnych poprawek (narzędnik vs mianownik), więc podmiana
per słowo produkowała „Nietypowa logiką biznesowa" w dokumencie dla klienta.

| # | przed | po |
|---|---|---|
| 1 | Deklarowana krytycznosc 24/7 wymaga redundancji i monitoringu. | **Deklarowana krytyczność 24/7 wymaga redundancji i monitoringu.** |
| 2 | Krytycznosc plus skala | **Krytyczność plus skala** |
| 3 | Krytycznosc 24/7 przy {users_concurrent} uzytkownikach jednoczesnych wymaga skalowania. | **Krytyczność 24/7 przy {users_concurrent} użytkownikach jednoczesnych wymaga skalowania.** |
| 4 | Sklep wymaga maili transakcyjnych, analityki, zgod i podstaw SEO. | **Sklep wymaga maili transakcyjnych, analityki, zgód i podstaw SEO.** |
| 5 | Ruch duzy | **Ruch duży** |
| 6 | Duzy ruch miesieczny wymaga cache, CDN i mocniejszej infrastruktury. | **Duży ruch miesięczny wymaga cache, CDN i mocniejszej infrastruktury.** |
| 7 | Wiele organizacji wymaga rozbudowanych uprawnien i izolacji danych (multi-tenant). | **Wiele organizacji wymaga rozbudowanych uprawnień i izolacji danych (multi-tenant).** |
| 8 | Dane wrazliwe | **Dane wrażliwe** |
| 9 | Przetwarzanie danych wrazliwych podnosi wymagania bezpieczenstwa. | **Przetwarzanie danych wrażliwych podnosi wymagania bezpieczeństwa.** |
| 10 | Logowanie klientow | **Logowanie klientów** |
| 11 | Logowanie uzytkownikow wymaga uwierzytelniania i podstawowych uprawnien. | **Logowanie użytkowników wymaga uwierzytelniania i podstawowych uprawnień.** |
| 12 | Migracja z istniejacego systemu | **Migracja z istniejącego systemu** |
| 13 | Przeniesienie danych z istniejacego systemu wymaga migracji. | **Przeniesienie danych z istniejącego systemu wymaga migracji.** |
| 14 | Zachowanie pozycji przy migracji wymaga pelnego SEO (301, link equity). | **Zachowanie pozycji przy migracji wymaga pełnego SEO (301, link equity).** |
| 15 | Brak probki danych | **Brak próbki danych** |
| 16 | Migracja bez probki zrodla to ryzyko jakosci danych. | **Migracja bez próbki źródła to ryzyko jakości danych.** |
| 17 | Istniejaca identyfikacja wymaga projektu kluczowych widokow. | **Istniejąca identyfikacja wymaga projektu kluczowych widoków.** |
| 18 | Spotkania online wymagaja discovery z mapowaniem wymagan. | **Spotkania online wymagają discovery z mapowaniem wymagań.** |
| 19 | Kampanie platne | **Kampanie płatne** |
| 20 | Kampanie platne wymagaja setupu SEM i dokladniejszej analityki. | **Kampanie płatne wymagają setupu SEM i dokładniejszej analityki.** |
| 21 | Maksymalna dokladnosc pomiaru wymaga server-side trackingu i zaawansowanych zgod. | **Maksymalna dokładność pomiaru wymaga server-side trackingu i zaawansowanych zgód.** |
| 22 | Duzy katalog baza | **Duży katalog baza** |
| 23 | Duzy katalog content | **Duży katalog content** |
| 24 | Wprowadzenie duzego katalogu po naszej stronie to rozbudowany content. | **Wprowadzenie dużego katalogu po naszej stronie to rozbudowany content.** |
| 25 | Masowe warianty/konfiguracja podnosza zlozonosc logiki i bazy. | **Masowe warianty/konfiguracja podnoszą złożoność logiki i bazy.** |
| 26 | Feedy hurtowni wymagaja integracji importu i monitoringu. | **Feedy hurtowni wymagają integracji importu i monitoringu.** |
| 27 | Promocje w sklepie wymagaja Omnibus (prawo) i silnika promocji. | **Promocje w sklepie wymagają Omnibus (prawo) i silnika promocji.** |
| 28 | Sprzedaz B2B lub mieszana | **Sprzedaż B2B lub mieszana** |
| 29 | Sprzedaz B2B wymaga cennikow grupowych i rozbudowanych uprawnien. | **Sprzedaż B2B wymaga cenników grupowych i rozbudowanych uprawnień.** |
| 30 | Obsluga zwrotow w systemie to modul RMA. | **Obsługa zwrotów w systemie to moduł RMA.** |
| 31 | Sztywny deadline wymusza prace rownolegla. | **Sztywny deadline wymusza pracę równoległą.** |
| 32 | Stack poza rutyna zespolu to narzut nauki. | **Stack poza rutyną zespołu to narzut nauki.** |
| 33 | Wielojezyczny sklep | **Wielojęzyczny sklep** |
| 34 | Sklep wielojezyczny wymaga maili w wielu jezykach. | **Sklep wielojęzyczny wymaga maili w wielu językach.** |
| 35 | Aplikacja custom wymaga wlasnego API, CI/CD, QA i observability. | **Aplikacja custom wymaga własnego API, CI/CD, QA i observability.** |
| 36 | Hypercare pelny | **Hypercare pełny** |
| 37 | Pelny hypercare to rozszerzone go-live. | **Pełny hypercare to rozszerzone go-live.** |
| 38 | Szkolenie i tydzien opieki to standardowe go-live. | **Szkolenie i tydzień opieki to standardowe go-live.** |
| 39 | Konfigurator produktu podnosi zlozonosc logiki i testow. | **Konfigurator produktu podnosi złożoność logiki i testów.** |
| 40 | Wizualizacja wariantow wymaga zaawansowanego frontendu i storage. | **Wizualizacja wariantów wymaga zaawansowanego frontendu i storage.** |
| 41 | [{"type":"recommend_archetype","code":"woocommerce","reason":"Standardowy sklep — najnizszy koszt wejscia i utrzymania"}] | **[{"type":"recommend_archetype","code":"woocommerce","reason":"Standardowy sklep — najniższy koszt wejścia i utrzymania"}]** |
| 42 | Standardowy sklep do 2000 produktow bez nietypowej logiki — WooCommerce. | **Standardowy sklep do 2000 produktów bez nietypowej logiki — WooCommerce.** |
| 43 | Rekomendacja: PrestaShop/WooCommerce (sredni katalog) | **Rekomendacja: PrestaShop/WooCommerce (średni katalog)** |
| 44 | [{"type":"recommend_archetype","code":"prestashop","reason":"Sredni katalog — wybor wg preferencji utrzymania"},{"type":"recommend_archetype","code":"woocommerce","reason":"Alternatywa dla sredniego katalogu"}] | **[{"type":"recommend_archetype","code":"prestashop","reason":"Średni katalog — wybór wg preferencji utrzymania"},{"type":"recommend_archetype","code":"woocommerce","reason":"Alternatywa dla średniego katalogu"}]** |
| 45 | Sredni katalog 2–10 tys. bez headless — PrestaShop lub WooCommerce. | **Średni katalog 2–10 tys. bez headless — PrestaShop lub WooCommerce.** |
| 46 | Rekomendacja: Sylius (duzy sklep PL) | **Rekomendacja: Sylius (duży sklep PL)** |
| 47 | [{"type":"recommend_archetype","code":"sylius","reason":"Duza skala + polskie integracje z polki (BitBag)"}] | **[{"type":"recommend_archetype","code":"sylius","reason":"Duża skala + polskie integracje z półki (BitBag)"}]** |
| 48 | Duzy katalog/warianty masowe + polskie platnosci/kurierzy — Sylius. | **Duży katalog/warianty masowe + polskie płatności/kurierzy — Sylius.** |
| 49 | Sklep headless z nietypowa logika — Medusa. | **Sklep headless z nietypową logiką — Medusa.** |
| 50 | [{"type":"recommend_archetype","code":"laravel","reason":"Logika biznesowa jest produktem; commerce od zera lub modul"}] | **[{"type":"recommend_archetype","code":"laravel","reason":"Logika biznesowa jest produktem; commerce od zera lub moduł"}]** |
| 51 | [{"type":"recommend_archetype","code":"wordpress","reason":"Waga tresci, szybkie wdrozenie"},{"type":"recommend_archetype","code":"headless","reason":"Alternatywa: wydajnosc/animacje (React/Astro)"}] | **[{"type":"recommend_archetype","code":"wordpress","reason":"Waga treści, szybkie wdrożenie"},{"type":"recommend_archetype","code":"headless","reason":"Alternatywa: wydajność/animacje (React/Astro)"}]** |
| 52 | Wizytowka/landing — WordPress lub headless (React/Astro). | **Wizytówka/landing — WordPress lub headless (React/Astro).** |
| 53 | [{"type":"archetype_warning","message":"Wymagania wykraczaja poza komfort WooCommerce — rozwaz Sylius/Medusa/Laravel; kontynuacja = ryzyko przebudowy"}] | **[{"type":"archetype_warning","message":"Wymagania wykraczają poza komfort WooCommerce — rozważ Sylius/Medusa/Laravel; kontynuacja = ryzyko przebudowy"}]** |
| 54 | Ostrzezenie: duzy sklep PL pasuje do Sylius | **Ostrzeżenie: duży sklep PL pasuje do Sylius** |
| 55 | [{"type":"archetype_warning","message":"Profil pasuje do Sylius (polskie integracje z polki — BitBag)"}] | **[{"type":"archetype_warning","message":"Profil pasuje do Sylius (polskie integracje z półki — BitBag)"}]** |
| 56 | Duzy sklep PL zwykle pasuje do Sylius. | **Duży sklep PL zwykle pasuje do Sylius.** |
| 57 | Ostrzezenie: headless commerce → Medusa | **Ostrzeżenie: headless commerce → Medusa** |
| 58 | [{"type":"archetype_warning","message":"Rozwaz Medusa zamiast budowy commerce od zera"}] | **[{"type":"archetype_warning","message":"Rozważ Medusa zamiast budowy commerce od zera"}]** |
| 59 | Headless sklep z custom logika — rozwaz Medusa. | **Headless sklep z custom logiką — rozważ Medusa.** |
| 60 | Pierwsze wdrozenie Sylius/Medusa | **Pierwsze wdrożenie Sylius/Medusa** |
| 61 | Pierwsze wdrozenie Sylius/Medusa — narzut nowej technologii. | **Pierwsze wdrożenie Sylius/Medusa — narzut nowej technologii.** |
| 62 | Rekomendacja: WordPress (portal tresci) | **Rekomendacja: WordPress (portal treści)** |
| 63 | [{"type":"recommend_archetype","code":"wordpress","reason":"Waga tresci, edycja przez klienta, najnizszy koszt utrzymania"}] | **[{"type":"recommend_archetype","code":"wordpress","reason":"Waga treści, edycja przez klienta, najniższy koszt utrzymania"}]** |
| 64 | Portal tresci — WordPress (edycja tresci, niski koszt utrzymania). | **Portal treści — WordPress (edycja treści, niski koszt utrzymania).** |
| 65 | Rekomendacja: Headless-Astro (portal tresci, nowoczesnosc) | **Rekomendacja: Headless-Astro (portal treści, nowoczesność)** |
| 66 | [{"type":"recommend_archetype","code":"headless","reason":"Priorytet nowoczesnosci/szybkosci — Astro/React"}] | **[{"type":"recommend_archetype","code":"headless","reason":"Priorytet nowoczesności/szybkości — Astro/React"}]** |
| 67 | Portal tresci z priorytetem nowoczesnosci — headless (Astro/React). | **Portal treści z priorytetem nowoczesności — headless (Astro/React).** |
| 68 | Skala: wiele widokow | **Skala: wiele widoków** |
| 69 | Projekt ma {views_count} unikalnych widokow — front i projekt UI ponad szablon. | **Projekt ma {views_count} unikalnych widoków — front i projekt UI ponad szablon.** |
| 70 | Skala: duzo widokow | **Skala: dużo widoków** |
| 71 | {views_count} widokow to rozbudowany frontend (system komponentow, stany, wydajnosc). | **{views_count} widoków to rozbudowany frontend (system komponentów, stany, wydajność).** |
| 72 | {languages} wersje jezykowe wymagaja i18n we froncie i obslugi tresci w kazdej wersji. | **{languages} wersje językowe wymagają i18n we froncie i obsługi treści w każdej wersji.** |
| 73 | Nietypowa logika biznesowa poza standardem platformy wymaga wlasnego backendu. | **Nietypowa logika biznesowa poza standardem platformy wymaga własnego backendu.** |
| 74 | Wlasna logika spieta z zewnetrznym systemem wymaga warstwy wlasnego API. | **Własna logika spięta z zewnętrznym systemem wymaga warstwy własnego API.** |
| 75 | Rezerwacje/platnosci wymagaja maili transakcyjnych (potwierdzenia, statusy). | **Rezerwacje/płatności wymagają maili transakcyjnych (potwierdzenia, statusy).** |
| 76 | Katalog {products_count} pozycji wymaga listingu z filtrowaniem i wlasnego modelu danych. | **Katalog {products_count} pozycji wymaga listingu z filtrowaniem i własnego modelu danych.** |
| 77 | Aplikacja z logowaniem: logika jest produktem — wlasny backend, API i testy sa rdzeniem zakresu. | **Aplikacja z logowaniem: logika jest produktem — własny backend, API i testy są rdzeniem zakresu.** |
| 78 | Rozne role uzytkownikow wymagaja modelu uprawnien, nie samego logowania. | **Różne role użytkowników wymagają modelu uprawnień, nie samego logowania.** |
| 79 | Konfigurator bez macierzy zaleznosci | **Konfigurator bez macierzy zależności** |
| 80 | [{"type":"min_level","aspect":"discovery","level":3},{"type":"archetype_warning","message":"Brak spisanej macierzy zaleznosci opcji: zaplanuj Discovery + prototyp przed wiazaca wycena."}] | **[{"type":"min_level","aspect":"discovery","level":3},{"type":"archetype_warning","message":"Brak spisanej macierzy zależności opcji: zaplanuj Discovery + prototyp przed wiążącą wyceną."}]** |
| 81 | Konfigurator bez spisanej macierzy zaleznosci: zakres nieokreslony do czasu Discovery/prototypu. | **Konfigurator bez spisanej macierzy zależności: zakres nieokreślony do czasu Discovery/prototypu.** |
| 82 | Silnik CPQ liczy wycene produkcyjna i oddaje specyfikacje do ERP — wlasna logika i integracja. | **Silnik CPQ liczy wycenę produkcyjną i oddaje specyfikację do ERP — własna logika i integracja.** |

Razem zmienionych tekstów: **82**.

## Świadomie bez zmian

Zdania, które są już poprawną polszczyzną (`Sklep fundament e-commerce`,
`SLA {sla_value}% wymaga redundancji, load balancingu i monitoringu.`, `Aplikacja custom`),
placeholdery `{...}`, kody archetypów, klucze JSON oraz **wartości opcji** — np. `value:"recznie"`
w `questions.sql` to KOD odpowiedzi, nie tekst; jego etykieta brzmi już „Ręcznie".
Zmiana kodu unieważniłaby odpowiedzi zapisane w D1 i reguły matchujące na wartości.

## Weryfikacja

- baza od zera + seedy ×2 → **58 reguł** na obu przebiegach (idempotencja)
- round-trip przez D1 zachowuje diakrytyki i obie formy `logika`
- lint 0, moduł 107 testów, TS baseline 15
- `engine.test.ts` używa własnych fikstur (nie seedów) → brak wpływu
- docs cytują `reason_template` tylko jako przykład w komentarzu schematu → brak dryfu docs=seedy

## Wymaga

Rytuał prod (seedy) przy deployu — czeka na token.