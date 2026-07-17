---
name: Mixture Marketing
description: Ciemne premium jako oprawa prawdziwej roboty — inżynierska precyzja × kreatywność, bez atrap i bez wymyślonych liczb.
colors:
  primary: '#61b6de'
  accent-dark: '#2d739a'
  secondary: '#3f3d91'
  dark: '#213261'
  deep-dark: '#0b1120'
  scene-mid: '#0d1529'
  brand-pink: '#e1306c'
  success: '#00c853'
  light-gray: '#f9fafb'
  ink-muted: '#374151'
  ink-subtle: '#4b5563'
  hairline: '#f3f4f6'
typography:
  display:
    fontFamily: 'Manrope, system-ui, sans-serif'
    fontSize: 'clamp(3rem, 8.5vw, 6rem)'
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: '-0.025em'
  headline:
    fontFamily: 'Manrope, system-ui, sans-serif'
    fontSize: 'clamp(1.875rem, 4vw, 3rem)'
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: '-0.025em'
  title:
    fontFamily: 'Manrope, system-ui, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: '-0.025em'
  body:
    fontFamily: 'Manrope, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.625
  lede:
    fontFamily: 'Manrope, system-ui, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: 'Manrope, system-ui, sans-serif'
    fontSize: '0.625rem'
    fontWeight: 800
    letterSpacing: '0.18em'
rounded:
  card: '1rem'
  band: '1.5rem'
  sheet: '2rem'
  sheet-lg: '3rem'
  icon: '1rem'
  pill: '9999px'
spacing:
  section-y: '6rem'
  section-y-lg: '7rem'
  card-p: '2rem'
  gutter: '1rem'
  gutter-lg: '2rem'
components:
  button-primary:
    backgroundColor: '{colors.secondary}'
    textColor: '#ffffff'
    rounded: '{rounded.pill}'
    padding: '1rem 2.5rem'
    typography: '{typography.title}'
  button-ghost-dark:
    backgroundColor: 'transparent'
    textColor: '#ffffff99'
    rounded: '{rounded.pill}'
    padding: '0.5rem'
  card-light:
    backgroundColor: '#ffffff'
    textColor: '{colors.dark}'
    rounded: '{rounded.card}'
    padding: '{spacing.card-p}'
  band-dark:
    backgroundColor: '{colors.dark}'
    textColor: '#ffffff'
    rounded: '{rounded.band}'
    padding: '2.5rem'
  section-sheet:
    backgroundColor: '{colors.light-gray}'
    rounded: '{rounded.sheet-lg}'
    padding: '7rem 2rem'
---

# Design System: Mixture Marketing

## 1. Overview

**Creative North Star: "Warsztat pod granatowym niebem"**

System jest oprawą dla cudzej roboty — naszej, ale pokazanej, nie opowiedzianej. Granat (`#0b1120`) to nie „dark mode dla efektu", tylko ciemnia, w której zrzuty realizacji zaczynają świecić. Wszystko, co nie jest dowodem, schodzi o ton niżej: tło jest głębokie i spokojne, typografia jest ciężka i pewna, a kolor pojawia się tam, gdzie coś naprawdę się dzieje. Strona ma wyglądać jak zrobiona przez ludzi, którzy potrafią zrobić stronę — precyzja wykonania jest sama w sobie argumentem sprzedażowym.

Rytm strony to **hybryda ciemno-jasna, nie jednolity dark**: ciemny hero i pasy dowodu (granat, scena generatywna), a pod nimi jasne arkusze treści (`#f9fafb`, biel), które najeżdżają na ciemność zaokrąglonym grzbietem (`rounded-t-[3rem]`, `-mt-16`). Ta krawędź jest sygnaturą layoutu — arkusz fizycznie zakrywa hero przy scrollu i to jest zadanie tego ruchu, nie jego ozdoba.

Ruch jest częścią budowy, nie warstwą doklejaną na końcu. Każda animacja jest **scroll-linked i dwukierunkowa** (`--p` z `useSectionProgress`), nigdy one-shot, a jej stan spoczynkowy to stan widoczny. System odrzuca: SaaS-cream (beżowe tło + tracked eyebrow nad każdą sekcją + bliźniacze siatki kart), atrapy zamiast dowodu (puste mockupy przeglądarki, floating bloby, ozdobne snippety kodu), wymyślone metryki i countery „dla efektu", gradient-clip text jako ozdobę oraz editorial-magazine (display serif + italic + drop caps).

**Key Characteristics:**

- Jedna rodzina (Manrope), skrajny kontrast wag: 400 i 800. Nic pomiędzy.
- Granat jako ciemnia dla dowodu; biel/`#f9fafb` jako arkusze treści.
- Kolor marki = błękit dominuje, indygo wspiera, róż jako rzadki akcent.
- Ruch scroll-linked z kontraktem `var(--p, 1)`; spoczynek = pełna widoczność.
- Zero wymyślonych liczb. Dowód jest wizualny (zrzuty), nie numeryczny.
- Kontrast AA jest twardym wymogiem, nie aspiracją — jasnoszary tekst na granacie jest zakazany.

## 2. Colors

Paleta jest wąska i celowa: jeden błękit niesie markę, indygo dźwiga akcje, róż pojawia się rzadko — a granat jest tłem, na którym cała reszta ma świecić.

### Primary

- **Błękit Mixture** (`#61b6de`): główny akcent marki i dominujący prąd sceny generatywnej. Na ciemnym tle: akcenty tekstowe („Wybierz **Partnera**."), ikony, checkmarki, kropki statusu. **Na jasnym tle nigdy jako tekst poniżej 18px** — nie trzyma AA (patrz Akcent AA).
- **Akcent AA** (`#2d739a`): wyłącznie zastępnik Błękitu Mixture dla tekstu na jasnym tle. Trzyma hue marki i ~5.2:1 na bieli. Istnieje, bo `#3a8fb7` dawał 3.62:1 i wypadał w axe.

### Secondary

- **Indygo Robocze** (`#3f3d91`): kolor akcji i zaufania. Nosi przycisk główny, linki „dowiedz się więcej" na jasnym tle, focus-ring i drugi prąd sceny. To on, nie błękit, jest kolorem klikalności.

### Tertiary

- **Róż Sygnałowy** (`#e1306c`): trzeci akcent, celowo rzadki — trzecia karta w triadzie, trzeci prąd sceny o najmniejszej sile (0.6). Nigdy jako kolor akcji; jego rzadkość jest jego zadaniem.

### Neutral

- **Granat Sceny** (`#0b1120`): tło hero i pasów dowodu. Ciemnia, nie „dark mode".
- **Granat Środkowy** (`#0d1529`): wartość sceniczna — środek pionowego gradientu hero; podnosi centrum kadru, żeby typografia nie leżała na płaskiej czerni.
- **Granat Marki** (`#213261`): ciemne pasy i bandy wewnątrz jasnych sekcji (SaaS band), tekst nagłówków na bieli.
- **Arkusz** (`#f9fafb`): tło jasnych sekcji treściowych, które najeżdżają na hero.
- **Tusz** (`#374151`) / **Tusz Miękki** (`#4b5563`): tekst pomocniczy na jasnym tle. Obie wartości są już skorygowane pod AA — to nie są domyślne szarości Tailwinda i nie wolno ich rozjaśniać.
- **Hairline** (`#f3f4f6`): jedyna dozwolona linia podziału w sekcjach editorialnych.

### Named Rules

**The Ciemnia Rule.** Granat istnieje po to, żeby realizacje świeciły. Jeśli w ciemnej sekcji nie ma dowodu (zrzutu, realizacji, logo), ta sekcja nie ma powodu być ciemna — zrób ją jasną.

**The AA-on-Navy Rule.** Na granacie tekst treściowy chodzi na `text-white/75` lub jaśniej, nigdy niżej. `text-white/55` jest dopuszczalne wyłącznie dla elementów pomocniczych ≥14px z ikoną. Jasnoszary tekst „dla elegancji" na granacie jest zakazany.

**The Trzy Prądy Rule.** Błękit dominuje, indygo wspiera, róż jest rzadki. Czwarty kolor akcentu nie istnieje — jeśli sekcja go potrzebuje, sekcja ma za dużo kategorii.

## 3. Typography

**Display Font:** Manrope (800) — z `system-ui, sans-serif` jako fallback
**Body Font:** Manrope (400) — ta sama rodzina
**Label/Mono Font:** brak. Mono jest kostiumem, nie głosem tej marki.

**Character:** Jedna rodzina, dwa skrajne bieguny wagi. Manrope 800 w dużym stopniu jest ciężki, geometryczny i pewny bez krzyku — czyta się jak podpis pod robotą, nie jak nagłówek reklamy. Kontrast niesie waga i skala (400 vs 800, 1rem vs 6rem), nigdy druga rodzina.

### Hierarchy

- **Display** (800, `clamp(3rem, 8.5vw, 6rem)`, line-height 1.04, tracking-tight): wyłącznie H1 hero. Sufit 6rem jest sufitem — powyżej strona krzyczy, zamiast projektować.
- **Headline** (800, `clamp(1.875rem, 4vw, 3rem)`, line-height ~1.1): H2 sekcji. Zawsze z `text-balance`.
- **Title** (700, 1.25–1.5rem): H3 kart i wierszy.
- **Lede** (400, 1.125–1.25rem, line-height 1.625): akapit pod H1/H2. Na ciemnym tle `text-white/75`, na jasnym `text-gray-700`. Maks. `max-w-2xl` (~65–75ch).
- **Body** (400, 0.875–1rem, line-height 1.625): treść kart i wierszy.
- **Label** (800, 0.625rem, tracking 0.18em, uppercase): mikro-etykieta. Reglamentowana — patrz The Jeden Eyebrow Rule.

### Named Rules

**The 800 Ceiling Rule.** Ładujemy Manrope 400 i 800 (latin + latin-ext). `font-black` (900) nie ma pliku i renderuje się jako 800 — więc 800 jest realnym sufitem. Nie dodawaj kolejnych wag „dla niuansu"; każda to transfer na każdej stronie. (Precedens: Montserrat + Playfair jechały globalnie na gapę dla jednego komponentu — zostały przeniesione do lazy chunku.)

**The Jeden Eyebrow Rule.** Mikro-etykieta uppercase (`text-xxs tracking-[0.18em]`) to akcent, nie gramatyka sekcji. Maksymalnie **jedna na widok**. Eyebrow nad każdym nagłówkiem to szablon agencyjny z 2023 i jest zakazany — anty-referencja „SaaS-cream" wymienia go z nazwy.

**The Jedna Rodzina Rule.** Manrope niesie całą stronę. Druga rodzina wchodzi tylko z lazy chunkiem komponentu, który jej faktycznie potrzebuje, i nigdy do `index.tsx`.

## 4. Elevation

System jest **płaski w spoczynku i podnosi się dopiero w reakcji na stan**. Głębia rodzi się z trzech rzeczy w tej kolejności: nakładania arkuszy (jasna sekcja fizycznie najeżdża na ciemny hero), taniej poświaty radialnej (`radial-gradient`, nie `filter: blur`) i dopiero na końcu z cienia. Blur-filtry i glass-karty są kosztowne i dekoracyjne — trzymamy je poza systemem.

### Shadow Vocabulary

- **Spoczynek** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)` — `shadow-sm`): karta na jasnym tle. Ledwo obecny; ma odkleić kartę od `#f9fafb`, nie unieść jej.
- **Hover** (`shadow-xl`): odpowiedź karty na kursor, razem z `motion-safe:hover:-translate-y-1`. Zawsze `transition-all duration-300`.
- **Poświata akcji** (`shadow-2xl shadow-secondary/30`): wyłącznie pod głównym CTA i ciemnym bandem SaaS. Kolorowa, bo sygnalizuje akcję — nie używać jej dekoracyjnie.
- **Poświata sceniczna** (`radial-gradient(...) color-mix(in srgb, var(--color-primary) 18%, transparent)`): głębia w ciemnych bandach. Tania, bo to gradient tła, nie filtr.

### Named Rules

**The Flat-At-Rest Rule.** Powierzchnia w spoczynku ma `shadow-sm` albo nic. Cień jest odpowiedzią na stan (hover, focus, elevation), nie właściwością obiektu.

**The No-Glass Rule.** `backdrop-blur` jako dekoracja jest zakazany (audyt strony głównej wskazał glass-kartę LeadMagnet jako resztkę maniery). Głębię robi nakładanie arkuszy i poświata radialna. Jeśli sięgasz po glass, to znaczy, że tło nie jest wystarczająco przemyślane.

## 5. Components

### Buttons

- **Shape:** pełna pigułka (`rounded-full`, 9999px). Bez wyjątków — to najstalsza stała systemu.
- **Primary:** gradient indygo (`from-secondary` → `#5A58AD`), biały tekst, `shadow-lg`. Hero: `h-14`/`h-16`, `px-9`, `text-base`/`text-lg`. Gradient **tła** jest dozwolony; gradient **tekstu** jest zakazany.
- **Hover / Focus:** `motion-safe:hover:-translate-y-1` + poświata `shadow-[0_8px_25px_-5px_rgba(97,182,222,0.6)]`, `duration-300`. Focus: globalny `:focus-visible` — dwukolorowy `box-shadow` (biały pierścień + indygo), działa na jasnym i ciemnym tle.
- **Secondary (ciemne tło):** goły tekst `text-white/60`, `min-h-11`, hover → biel + podkreślenie. Nie konkuruje wizualnie z primary; jest wyjściem, nie akcją.
- **Ikona:** lucide, `size={18–22}`, `aria-hidden`, przesuw `group-hover:translate-x-1`. Emoji są zakazane wszędzie.

### Cards / Containers

- **Corner Style:** `rounded-2xl` (1rem) karta, `rounded-3xl` (1.5rem) band.
- **Background:** biel na `#f9fafb`. Karta na bieli musi mieć `border-gray-100`.
- **Shadow Strategy:** patrz Elevation — `shadow-sm` w spoczynku, `shadow-xl` na hover.
- **Border:** 1px `border-gray-100`, na hover przechodzi w kolor akcentu domeny (`hover:border-primary`). **Boczny pasek koloru (`border-left` > 1px) jest zakazany.**
- **Internal Padding:** `p-8` (2rem) karta, `p-8 md:p-10` band.
- **Link:** karta klikalna używa stretched linku (`after:absolute after:inset-0`) — dokładnie jeden focusable element na kartę (WCAG 4.1.2).

### Navigation

Sticky, `h-20` (5rem), z-index `--z-header: 60`. `scroll-padding-top: 5rem` na `html` chroni focus przed wpadnięciem pod nav (WCAG 2.4.11). Z-index zawsze z semantycznej skali (`--z-header`, `--z-nav`, `--z-modal`…), nigdy wartość dowolna.

### Hero (wzorzec obowiązujący wszystkie strony)

**The Hero Is Words Rule.** *Zakaz umieszczania zrzutów/screenów realizacji w sekcjach hero — na WSZYSTKICH stronach serwisu. Realizacje i dowody wizualne żyją w dedykowanych sekcjach (proof, Realizacje). Hero jest domeną typografii i słowa.* (Twarda zasada właściciela, PRODUCT.md → Constraints. Nie podlega negocjacji per podstrona.)

Co hero **może** nieść: monumentalną typografię (Display), jedno zdanie konkretu, jedno główne CTA + jedno wyjście, trust line, oraz — na stronie głównej — sygnaturowy wizual generatywny „Mixture" (abstrakcja marki, nie dowód). Co hero **nie może** nieść: zrzutów realizacji, kart portfolio, mockupów przeglądarki, fejkowych dashboardów, wykresów, liczb bez pokrycia.

Dowód zaczyna się **pod** hero: pierwszy pas proof (marquee / Realizacje) jest pierwszą rzeczą po foldzie. Hero buduje wiarygodność rzemiosłem wykonania, nie eksponatem.

Podstrony usługowe dziedziczą ten wzorzec: H1 + konkret + trust line, bez prawej kolumny z „wizualem". Jeśli podstrona ma pustą prawą kolumnę po usunięciu atrapy — hero idzie na pełną szerokość, a nie szuka nowego eksponatu.

### Section Sheet (signature)

Jasna sekcja treściowa, która **najeżdża na ciemny hero**: `-mt-10 md:-mt-16`, `rounded-t-[2rem] md:rounded-t-[3rem]`, `bg-gray-50`, `relative z-10`, `pt-20 md:pt-28`. Sylwetka arkusza jest też kształtem Suspense fallbacku — fallback nigdy nie jest białą dziurą, tylko tym samym grzbietem i tłem, którego użytkownik zaraz się spodziewa.

### Scena Mixture (signature)

Sygnaturowy wizual generatywny: inżynierska siatka kropek (`#94a3b8`), przez którą płyną trzy barwne prądy marki — dosłowna wizualizacja nazwy (precyzja × kreatywność = Mixture). Scena jest interaktywna: kliknięcie/tapnięcie budzi falę uderzeniową, za której frontem turbulencje gasną i siatka na moment staje w idealnym porządku (chaos → forma — teza marki w jednym geście); okresowo, wyłącznie gdy na prawo od kolumny tekstu jest wolne miejsce (nigdy pod H1), z pola zbiega się konstelacja sygnetu (podsiatka ×2, próbkowana z SVG logo). Canvas montuje się dopiero po hydratacji; prerender i no-JS widzą czysty granat z poświatami CSS. Reduced-motion: statyczna, deterministyczna klatka (hash zamiast `Math.random`; sygnet w niej stoi wygaszony do 0.65, fale i wskaźnik nie istnieją). Przycisk pauzy (WCAG 2.2.2) zatrzymuje całość, łącznie z falami i sygnetem. **Nie replikuj sceny na podstronach** — jest własnością hero strony głównej; podstrony dziedziczą granat i typografię, nie canvas.

### Proof Strip (signature)

Pas dowodu pod hero. Dziś typograficzny (`TrustMarquee`): CSS-only marquee bez nowego JS, lista renderowana 2× dla bezszwowej pętli (`translate -50%`), `mask-fade-x` na krawędziach, kropka `bg-primary/70` jako separator, etykieta `text-white/45`. Przycisk pauzy obok (WCAG 2.2.2), ukryty przy reduced-motion.

Struktura jest przygotowana na podmianę na logo klientów **bez zmiany layoutu** — gdy prawa do logotypów będą zebrane, wymieniamy zawartość `MarqueeRow`, nie wzorzec.

### Empty State (wzorzec obowiązkowy dla sekcji z CMS)

Każda sekcja zasilana z Sanity **musi** mieć stan pustki: uczciwy komunikat + droga dalej. Wzorzec z `KnowledgeBaseTeaser`: `rounded-2xl border-gray-100 bg-gray-50 px-6 py-10 text-center` — „Nie udało się załadować… **Przejdź do pełnej Bazy Wiedzy**". Pusta sekcja bez komunikatu jest defektem, nie stanem.

### Motion (per-component behavior)

- **Kontrakt `--p`:** `useSectionProgress` publikuje postęp wejścia sekcji (0..1) jako CSS var `--p`. Transformy **muszą** używać `var(--p, 1)` — domyślna wartość 1 = stan spoczynkowy = pełna widoczność. Hook nie robi nic przy `window.isPrerendering` ani przy `prefers-reduced-motion` — wtedy strona po prostu stoi w spoczynku, czyli jest w pełni czytelna.
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo). Bez bounce, bez elastic.
- **Scheduler:** wszystkie efekty scrollowe idą przez `addScrollTask` — jeden listener, jeden rAF, rozdział faz READ → WRITE. Własny `scroll` listener z `getBoundingClientRect` w komponencie jest zakazany (layout thrash).
- **`TextReveal`** — reveal per słowo (`revealUp`, 0.8s). `priority` dla H1 (słowo hero JEST LCP, animuje natychmiast); domyślnie czeka na `useDeferUntilLoad` i dopiero wtedy uzbraja IntersectionObserver. Do tego czasu tekst jest **widoczny** — zachowuje stan prerenderu, zero CLS.

#### Katalog choreografii (każda sekcja home ma własną — to jest reguła, nie przypadek)

| Sekcja | Ruch | Zadanie, które niesie |
|---|---|---|
| Hero → Services | Arkusz najeżdża na przypięte hero; treść hero ucieka (`--cover`) i gaśnie | Fizyczne przykrycie: nowa warstwa wchodzi na starą |
| Services | Dryf zależny od głębi: nagłówek 24px, karty 56+30·i, pasy dolne 120–140px | Treść „dogania" nadjeżdżający arkusz |
| WhyUs | Wiersze wpływają z **prawej** ku przyklejonemu nagłówkowi (48+36·i px) | Argumenty schodzą się do tezy |
| LeadMagnet | Karta skaluje się 0.96→1; wewnątrz paralaksa przeciwbieżna (tekst +36px, wizual −32px) | Oferta „dojeżdża" i ma głębię |
| KnowledgeBase | Karty schodzą się z trzech stron (−44px / +52px / +44px) | Wiedza zbiera się w bibliotekę |

**The Motion Has A Job Rule.** Nowa sekcja nie kopiuje choreografii poprzedniej — dostaje własną, wyprowadzoną z tego, co komunikuje. Jednakowy fade-in-up na każdej sekcji to reflex AI, nie projekt. Ruch, który niczego nie komunikuje, wypada.

**The Delay Is Not Choreography Rule.** `animate-fade-in-up` + `style={{animationDelay}}` to stary język serwisu (one-shot, nie działa wstecz, nie reaguje na pozycję). Nowe i przebudowywane sekcje używają `useSectionProgress` + `var(--p, 1)`.

## 6. Do's and Don'ts

### Do:

- **Do** pokazuj prawdziwą robotę: zrzut realizacji, miniaturę portfolio, logo klienta. „Dowód bije dekorację" — każda atrapa ustępuje realnej realizacji.
- **Do** trzymaj kontrakt `var(--p, 1)`: stan spoczynkowy jest stanem widocznym. Reveal wzmacnia treść widoczną domyślnie, nigdy jej nie ukrywa.
- **Do** bramkuj wszystko, co dotyka API przeglądarki, na `window.isPrerendering` — prerender (Puppeteer) odwiedza każdą trasę i zapisuje HTML.
- **Do** ładuj ciężkie zależności przez `lazy()`; `size-limit` blokuje build (index JS ≤ 300 kB, CSS ≤ 50 kB).
- **Do** używaj `#2d739a` (nie `#61b6de`) dla tekstu akcentowego na jasnym tle. `#61b6de` daje 2.2:1 na bieli i wypada w axe.
- **Do** dawaj każdej ciągłej animacji przycisk pauzy (WCAG 2.2.2) i wariant reduced-motion.
- **Do** używaj ikon lucide w jednym, spójnym stylu.
- **Do** dawaj każdej sekcji zasilanej z CMS uczciwy empty-state z drogą dalej.
- **Do** pokazuj prawdziwe liczby **z dumą**, gdy je masz: realny wynik PageSpeed z URL-em i datą pomiaru bije pięć wymyślonych wierszy. Reguła brzmi „nie fabrykuj", nie „nie mierz".

### Don't:

- **Don't** wstawiaj **zrzutów realizacji do hero** — na żadnej stronie serwisu. Hero to typografia i słowo; dowód żyje w sekcjach proof/Realizacje. Patrz The Hero Is Words Rule.
- **Don't** twórz **wymyślonych metryk i counterów „dla efektu"**. Zero ROAS-ów, procentów, „+24%", „99.5% uptime SLA" i animowanych counterów, których nie da się firmować. Brak twardych KPI to świadoma decyzja — wymyślone liczby są **usuwane, nie zastępowane innymi**.
- **Don't** buduj **fejkowych dashboardów, terminali i „żywej" telemetrii**: liczników rosnących z `Math.random()`, symulowanych logów bezpieczeństwa, atrapowych paneli admina z wymyślonymi użytkownikami i przychodem. Liczba, która animuje się, żeby wyglądać na żywą, jest gorsza od liczby po prostu wymyślonej.
- **Don't** podawaj **dwóch różnych wartości tej samej metryki** w obrębie serwisu. Sprzeczność to dowód fabrykacji dla uważnego czytelnika — czyli dla naszej persony.
- **Don't** wstawiaj **atrap i dekoracji zamiast dowodu**: pustych mockupów przeglądarki, floating blobów, ozdobnych snippetów kodu z wymyślonymi danymi (`BrowserMockup`, `CodeSnippet` z `roas: 1250%`, `AdsDashboardMini` z `+24%` — wszystkie do usunięcia).
- **Don't** buduj **generycznego szablonowego landingu agencyjnego „SaaS-cream"**: jasne beżowe tło, drobny tracked eyebrow nad każdą sekcją, identyczne siatki kart ikona+nagłówek+tekst.
- **Don't** używaj **gradient-clip text jako ozdoby** (`background-clip: text` + gradient). Emfaza idzie przez wagę i skalę.
- **Don't** wchodź w **editorial-magazine** (display serif + italic + drop caps) — to nie jest nasz rejestr.
- **Don't** dawaj **zrzutów realizacji w HERO strony głównej** (decyzja właściciela, 2026-07). Hero niesie rzemiosło i markę; dowód realizacjami żyje PONIŻEJ hero.
- **Don't** używaj `border-left`/`border-right` > 1px jako kolorowego paska na kartach i callboxach.
- **Don't** stosuj `backdrop-blur`/glass dekoracyjnie ani nie dodawaj czwartego koloru akcentu.
- **Don't** pisz **nieśmiałej typografii i bezpiecznych, niewidocznych layoutów**. Safe = invisible.
- **Don't** używaj emoji. Nigdy.
- **Don't** wprowadzaj mono „bo technicznie" — mono bez powodu to kostium (`System.Return_To_Home()` jako etykieta powrotu jest dokładnie tym błędem).
