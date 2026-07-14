# System Wyceny Projektów — Przegląd (v1.0)

Moduł panelu admina mixturemarketing.pl. Deterministyczny system ekspercki **wspomagający
decyzje techniczne i wycenę** projektów (sklepy, systemy dedykowane, strony), używany na żywo
podczas spotkań z klientem. Wymagania biznesowe klienta (SLA, skala, integracje, dane) są
tłumaczone przez reguły na decyzje architektoniczne per obszar — wycena godzinowa i cenowa
jest pochodną tych decyzji, nie celem samym w sobie.

Data: 14/07/2026 · Właściciel merytoryczny: Jakub · Kod: Claude Code (Opus 4.8 / Sonnet)

## Mapa dokumentacji

| Plik | Zawartość |
|---|---|
| 00-przeglad.md | Ten plik: cel, decyzje, słownik |
| 01-architektura.md | Integracja z istniejącym repo, stack, routing, auth, deploy |
| 02-model-danych.md | Schemat D1 (tabele `est_*`), snapshoty, seedy |
| 03-model-obliczeniowy.md | Składanie godzin, mnożniki, koszty, Confidence, prezentacja |
| 04-katalog-obszarow.md | Finalna lista obszarów, nowe obszary z poziomami, zmiany w istniejących |
| 05-silnik-regul.md | Warstwa pytań biznesowych, format i ewaluacja reguł |
| 06-biblioteka-startowa.md | Startowa biblioteka integracji i modułów — DO KOREKTY PRZEZ JAKUBA |
| 07-plan-wdrozenia.md | Fazy, kroki, kryteria akceptacji pod Claude Code |

## Zasady nadrzędne

1. **Pełny determinizm.** Zero AI w ścieżce decyzyjnej. Odpowiedzi biznesowe → reguły → poziomy → godziny → cena. Ten sam input zawsze daje ten sam output, a każdy wynik ma czytelne uzasadnienie („poziom 2, bo reguła X").
2. **Wiedza jako dane, nie kod.** Obszary, poziomy, widełki, reguły, biblioteka integracji i modułów, mnożniki, parametry — wszystko w D1, edytowalne z panelu. Kod tylko interpretuje. To umożliwia przyszłą komercjalizację (paczki wiedzy) bez zmian architektury.
3. **Snapshot przy zapisie.** Wycena kopiuje wszystkie użyte wartości (widełki, godziny modułów, mnożniki, stawki). Późniejsza edycja biblioteki nigdy nie zmienia zapisanych wycen.
4. **Trzy warstwy logiczne, jeden użytkownik.** Formularz biznesowy → silnik reguł → walidacja techniczna. Na start obsługuje je jedna osoba w jednym przepływie UI (bez systemu ról ponad istniejące admin/client).
5. **Narzędzie na spotkanie.** Formularz musi być szybki: pytania dynamiczne (archetyp filtruje), dopuszczalne odpowiedzi „nie wiem" (zasilają Confidence), wynik widoczny na bieżąco.
6. **Decyzje przed godzinami.** Wynikiem pierwszego rzędu jest architektura projektu (poziomy obszarów = decyzje techniczne z uzasadnieniami: „SLA 99,8% → load balancer + redundancja"); godziny i cena są wyprowadzane z decyzji. Każda wycena produkuje Kartę decyzji technicznych (specyfikacja zakresu / brief wykonawczy / zapis uzasadnień).
7. **Formularz wyłącznie biznesowy.** Test każdego pytania: właściciel firmy bez działu IT potrafi odpowiedzieć albo uczciwie powiedzieć „nie wiem". Pytanie wymagające wiedzy technicznej jest zepsute — decyzję techniczną ma wyprowadzić reguła z faktów biznesowych, nie pytanie z użytkownika. Jedyne dopuszczalne pytania techniczne to oznaczone „(wewnętrzne)" — o agencję, nie o klienta.

## Rejestr decyzji (etapy 1–3)

| # | Decyzja | Wartość |
|---|---|---|
| D1 | Charakter | Narzędzie wewnętrzne projektowane pod późniejszą komercjalizację |
| D2 | Zakres | Pełny (bez AI); fazowanie wg 07-plan-wdrozenia.md |
| D3 | Użytkownik | Jedna osoba (pracownik agencji) przez istniejący panel admina |
| D4 | Model składania | Obszary = fundament; moduły i integracje addytywne z biblioteki; obszar APIs wycenia tylko własne API (nie rośnie od liczby integracji) |
| D5 | Silnik | Reguły warunkowe; pole `typ` w regule zostawia furtkę na warianty punktowe |
| D6 | Mnożniki | Addytywne, cap +40% ponad bazę, bufor 10% na końcu; usunięty mnożnik „>5 integracji"; multi-tenant stały +10% (koordynacja); migracja danych +5–10% (tylko ryzyko jakości danych) |
| D7 | Widełki | Pełne wewnętrznie + zawężone w ofercie klienta (wzór w 03) |
| D8 | Stawka | 50 zł/h jako edytowalny parametr globalny; stawki per kategoria przewidziane w modelu danych (nullable, fallback do globalnej) |
| D9 | Handel | Marże/rabaty poza v1 (przewidziane w roadmapie); zaokrąglanie ofertowe w v1 |
| D10 | Nowe obszary | Discovery, UX/UI, QA, Migracja danych, Content, E-maile transakcyjne, Go-live/hypercare — kategoria G, poziomy 0–4 |
| D11 | Scalenia | Cloud Computing + Hosting → Infrastruktura; Error Tracking + Logging + Monitoring → Observability |
| D12 | Poziom 0 | Dostępny w każdym obszarze |
| D13 | AI | Całkowicie poza systemem |
| D14 | Koszty pozagodzinowe | Dojazdy/delegacje, licencje, koszty zewnętrzne — osobne pozycje oferty |
| D15 | Stack | Moduł istniejącej aplikacji CF Pages (React 19 + Pages Functions + D1); szczegóły w 01 |
| D16 | Godziny rzeczywiste | Rejestrowane w aplikacji przy zamykaniu wyceny/projektu (brak zewnętrznego timetrackera) |
| D17 | Archetypy startowe | WordPress, WooCommerce, PrestaShop, WooCommerce headless, Sylius, Medusa, Laravel custom, React/Astro headless; Sylius i Medusa z flagą „pierwsze wdrożenie = mnożnik new_tech"; reguły doboru platformy (w tym bezpiecznik wyrastania z Woo) jako akcje `archetype_warning` |
| D18 | Kalkulator publiczny | UJEDNOLICONY z systemem (F4, przy przebudowie strony): jeden katalog pytań z polem visibility (internal/public/portal) i jeden silnik; widok publiczny = podzbiór pytań public → zawężone widełki + CTA (bez breakdownu, bez godzin, Confidence tylko wewnętrznie) → lead + szkic wyceny; klient uzupełnia pytania portal po zalogowaniu w /portal; PM przejmuje ten sam rekord w adminie. Obecny kalkulator Sanity działa do F4 (dwie prawdy cenowe do tego czasu — świadomie zaakceptowane) |
| D19 | Snapshoty | Obowiązkowe (zasada nadrzędna 3) |
| D20 | Wsparcie decyzji | System jest doradcą technicznym (reguły → decyzje architektoniczne z uzasadnieniami); Karta decyzji technicznych jako drugi dokument wyjściowy obok oferty (F2) |
| D21 | Rekomendacja platformy | Archetyp nie jest pierwszym pytaniem: blok pytań neutralnych → reguły `recommend_archetype` → 1–2 rekomendacje z uzasadnieniem → wybór użytkownika (ostateczny; wbrew rekomendacji = wymagany powód); zapis recommended vs chosen |

## Słownik

- **Obszar (aspect)** — jednostka wyceny fundamentu (np. Frontend, Observability). Ma poziomy 0–4 z widełkami h.
- **Poziom** — stopień złożoności obszaru; 0 = nie dotyczy.
- **Archetyp** — fundament technologiczny projektu (WooCommerce, Laravel…); ustawia domyślne poziomy i blokuje nieistotne obszary.
- **Moduł** — funkcjonalność addytywna z biblioteki (Wishlist, Panel B2B…); ma własne widełki i deklarację „zawiera / nie zawiera".
- **Integracja** — połączenie z systemem zewnętrznym z biblioteki (Baselinker, InPost…); zawsze addytywna.
- **Reguła** — deterministyczny warunek na odpowiedziach → akcje (min. poziom obszaru / mnożnik / sugestia modułu).
- **Mnożnik** — procent ryzyka doliczany addytywnie do sumy godzin (cap +40%).
- **Pozycja kosztowa** — koszt pozagodzinowy oferty (dojazd, licencja).
- **Confidence** — deterministyczny wskaźnik pewności wyceny 0–100%.
- **Wycena (quote)** — rekord przejścia procesu dla jednego projektu; snapshotuje wszystkie użyte dane.
- **MPE** — Mean Percentage Error; średni błąd procentowy estymacji per obszar, napędza kalibrację.
