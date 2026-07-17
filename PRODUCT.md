# Product

## Register

brand

## Platform

web

## Users

Właściciele i decydenci małych oraz średnich firm (B2B), głównie z Rzeszowa i Podkarpacia, ale realizacje prowadzone są dla klientów z całej Polski. Trafiają na stronę główną, gdy szukają wykonawcy strony, kampanii Google/Meta Ads, SEO lub brandingu — i w ciągu kilku sekund oceniają, czy mają do czynienia z przypadkowym „wykonawcą", czy z partnerem, któremu można powierzyć wizerunek i budżet. Kontekst jest oceniający i nieufny: widzieli już dziesiątki agencyjnych landingów, które obiecują wszystko i nie pokazują niczego. Ich zadanie to szybko rozstrzygnąć wiarygodność i zrobić niskoprogowy pierwszy krok (darmowy audyt), zanim zdecydują się na rozmowę o projekcie.

## Product Purpose

Strona główna Mixture Marketing ma w kilka sekund udowodnić, że agencja łączy inżynierską precyzję software house'u z kreatywnością agencji marketingowej — i że stoi za tym prawdziwa, widoczna robota. Sukces to odwiedzający, który po zobaczeniu realnych realizacji (nie atrap) wykonuje główne CTA: zamawia darmowy audyt strony. Strona jest prerenderowana pod SEO, więc substancja (realne zrzuty, kopia, dowód) musi być realna także dla robota, nie tylko dla oka.

## Positioning

Nie wykonawca pojedynczych zleceń, lecz partner strategiczny, który łączy rzemiosło software house'u z kreatywnością agencji — i pokazuje to prawdziwą robotą, nie deklaracjami.

## Conversion & proof

- Primary CTA: „Darmowy audyt strony w 60s" → `/audyt-360/`. Niskoprogowy lead magnet, wzmacniany przez sticky mobile bar. Zostaje jako główne CTA także po redesignie.
- Secondary CTA: „Oblicz wycenę projektu" → `/offers#calculator`, dla odwiedzających jeszcze nie gotowych na audyt.
- Linia zapamiętywana po 10 sekundach: „Nie szukaj wykonawców. Wybierz Partnera." — inżynierska precyzja spotyka kreatywność.
- Belief ladder (co odwiedzający musi uwierzyć, po kolei, zanim kliknie audyt): (1) „to nie jest kolejny szablonowy landing agencyjny — to widać w rzemiośle"; (2) „oni naprawdę robią tę robotę — oto realne realizacje, nie atrapy"; (3) „potrafią i technicznie, i marketingowo — jedno miejsce zamiast dwóch dostawców"; (4) „pierwszy krok jest darmowy i bez ryzyka".
- Proof on hand:
  - **7 realnych case studies z prawdziwymi zrzutami** (Sanity, `caseStudy`): Impackt Edu (Google Ad Grants 10 000 USD/mies), Driftmark Marine (e-commerce + konfigurator łodzi + rebranding), BDB Biuro (kalkulatory finansowe), PickMe (high-performance landing), FBX (redesign aplikacji + performance), GlamSpace (UI premium kempingu), KorepetytorAI/StudentPI (SaaS React+Laravel z AI). To główny materiał wizualny redesignu.
  - **Logo klientów** i **opinie/testimoniale** — dostępne, ale jeszcze NIE w CMS. Zależność: do zebrania i wprowadzenia (prawa do logotypów, cytaty z imieniem/firmą) zanim trafią na produkcję. Do tego czasu proof niesie marquee + miniatury realizacji.
  - **Brak twardych liczb/KPI.** Świadoma decyzja: dowód jest wizualny, nie numeryczny. Nie tworzymy animowanych counterów ani żadnych metryk (ROAS, %, „+24%"), których nie da się firmować. Wymyślone liczby (obecne w atrapach hero) są usuwane, nie zastępowane innymi.

## Constraints

Twarde zasady właściciela. Nie podlegają negocjacji per sekcja ani per podstrona — obowiązują cały serwis i każdą kolejną sesję projektową.

- **Zakaz umieszczania zrzutów/screenów realizacji w sekcjach hero — na WSZYSTKICH stronach serwisu.** Realizacje i dowody wizualne żyją w dedykowanych sekcjach (proof, Realizacje). Hero jest domeną typografii i słowa. (Właściciel, 2026-07. Zastępuje i rozszerza wcześniejszą decyzję, która dotyczyła wyłącznie strony głównej.)
- **Metryki wydajności publikujemy wyłącznie zmierzone, z datą pomiaru, i tylko gdy wynik jest godny ekspozycji (mobile 90+). Nigdy z ręki.** (Właściciel, 2026-07-15. Powód: wskaźnik „PageSpeed Insights / Wydajność Mobile" na stronach realizacji publikował wartości wpisywane ręcznie w CMS, rozbieżne z realnym pomiarem o 20–35 pkt, przy nazwanych klientach. Usunięty hotfixem `b6db1c7` na produkcji. Pole `performanceScore` zostaje w CMS nieużywane. Wskaźnik wraca dopiero przy realnym wyniku mobile 90+ — osobny projekt: optymalizacja realizacji klientów.)
- **Zakres technologiczny publikujemy wyłącznie potwierdzony przez właściciela. Artykuł w bazie wiedzy NIE jest dowodem kompetencji.** (Właściciel, 2026-07-15. Powód: FAQ na `/web-development/` obiecywało „Headless Shopify", a szablon pSEO wystawiał Shopify jako usługę na każdej stronie `/miasto/*` — firma nie robi Shopify. Strona przeczyła przy tym sama sobie: `/web-development/e-commerce/` argumentowało PRZECIW Shopify. Usunięte hotfixem na produkcji. Zakres potwierdzony listą tak/nie — odrzucone wprost: Shopify, Svelte, Go, Magento, Shoper/IdoSell, Payload/Directus/Contentful. Istnieje artykuł o Go, a Go nie robimy — to nie jest sprzeczność, dopóki artykuł nie deklaruje kompetencji.)
- **Kod klienta: repozytorium od pierwszego dnia i pełne prawa autorskie po odbiorze obowiązują przy KAŻDYM projekcie. Dokumentacja techniczna (API, schemat bazy, README) — tylko przy systemach dedykowanych.** (Właściciel, 2026-07-15. Powód rozróżnienia: przy landingu za 3 900 zł nie ma API ani własnej bazy, więc nie ma czego dokumentować — obietnica dokumentacji brzmiałaby standardowo i pusto. Dotąd te klauzule żyły wyłącznie na `/web-development/custom-app/`; hub o własności kodu milczy, mimo że to najczęstsza obawa persony.)

## Brand Personality

Pewny siebie, rzemieślniczy, żywy. Głos eksperta, który nie musi krzyczeć, bo pokazuje pracę: bezpośredni, konkretny, z charakterem w kopii („Nie szukaj wykonawców. Wybierz Partnera."), bez korpo-ogólników i bez pustych superlatyw. Emocje docelowe: pewność (można im zaufać budżet i wizerunek) i podziw dla rzemiosła („jak to zrobili?"). Ruch jest częścią osobowości marki — strona jest żywa, animowana, premium; ale ruch jest atutem tylko dopóki ma zadanie.

## Anti-references

- Odrzucone wcześniej kierunki A/B/C (nie wracamy do nich).
- Generyczny szablonowy landing agencyjny „SaaS-cream": jasne beżowe tło, drobny tracked eyebrow nad każdą sekcją, identyczne siatki kart ikona+nagłówek+tekst.
- **Atrapy i dekoracje zamiast dowodu**: puste mockupy przeglądarki, floating bloby, ozdobne snippety kodu z wymyślonymi danymi (obecne `BrowserMockup`, `CodeSnippet` z `roas: 1250%`, `AdsDashboardMini` z `+24%` — wszystkie do usunięcia).
- Wymyślone metryki i countery „dla efektu".
- Nieśmiała typografia i bezpieczne, niewidoczne layouty. Gradient-clip text jako ozdoba.
- Editorial-magazine (display serif + italic + drop caps) — to nie jest nasz rejestr.
- **Zrzuty realizacji w HERO — patrz twarda zasada w sekcji Constraints** (obowiązuje wszystkie strony, nie tylko główną). Hero niesie rzemiosło i markę (typografia + słowo; na home dodatkowo sygnaturowy wizual generatywny „Mixture"), dowód realizacjami żyje PONIŻEJ hero (proof-strip, Realizacje, sekcje treściowe). Odrzucone iteracje hero na zrzutach: bento-showcase, konwergencja-linework, korytarz 3D, prawa kolumna z kartami realizacji.

## Design Principles

- **Prawdziwa robota jako wizual.** Każda atrapa, blob i wymyślona liczba ustępuje realnej realizacji: zrzut, miniatura portfolio, logo klienta. Dowód bije dekorację. Zero placeholderów tam, gdzie ma być praca.
- **Ruch to atut marki; każdy ruch ma zadanie.** Animacja jest częścią budowy, nie ozdobą doklejaną na końcu. Ruch, który niczego nie komunikuje, wypada. `prefers-reduced-motion` jest zawsze respektowane — reveal wzmacnia treść widoczną domyślnie, nigdy jej nie ukrywa (constraint prerenderu: `window.isPrerendering`).
- **Pewna siebie substancja, nie chwalenie się liczbami.** Skoro nie mamy twardych KPI, siłę niesie rzemiosło: typografia, realne zrzuty, kopia z charakterem. Nigdy nie fabrykujemy danych, żeby wyglądać na większych.
- **Ciemne premium jako oprawa dowodu.** Granat/błękit (paleta zostaje) buduje premium tło, na którym realne realizacje świecą. Ciemność służy pracy, nie sama sobie — hybryda: ciemny hero+proof, jaśniejsze sekcje treściowe.
- **Partner, nie wykonawca — w każdym detalu.** Precyzja wykonania (kontrast, wyrównanie, spójność) jest sama w sobie dowodem tezy: „robimy to lepiej niż wykonawca, którego rozważasz".

## Accessibility & Inclusion

`prefers-reduced-motion: reduce` jest wymogiem, nie opcją — każda animacja ma wariant (crossfade / stan natychmiastowy), a treść nigdy nie jest bramkowana klasą uruchamianą przez transition (inaczej prerender/headless renderuje pustą sekcję). Na ciemnym premium tle kontrast tekstu musi trzymać WCAG AA (≥4.5:1 dla treści, ≥3:1 dla dużego) — jasnoszary tekst „dla elegancji" na granacie jest zakazany. Cel roboczy: WCAG 2.1 AA.
