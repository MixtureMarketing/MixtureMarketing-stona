# Roadmap Projektu Mixture Marketing

Niniejszy dokument definiuje strategiczny plan rozwoju projektu, skupiając się na jakości kodu, wydajności, SEO, dostępności oraz bezpieczeństwie.

## 🏗️ Faza 2: Code Quality & Refactoring (Fundamenty)

**Cel:** Spłata długu technologicznego, zwiększenie czytelności kodu i ułatwienie przyszłego skalowania.

### Module 1: Dekompozycja "God Components" ✅

- **Zadania:**
  - ✅ Identyfikacja i podział zbyt dużych plików (np. `SeoContent.tsx` > 600 linii, `Marketing.tsx`) na mniejsze, atomowe komponenty (np. `components/features/seo/AuditResults.tsx`).
  - ✅ Wydzielenie logiki biznesowej do niestandardowych hooków (np. `useAuditCalculation`).
- **Efekt:**
  - Zwiększona czytelność i łatwość utrzymania kodu.
  - Możliwość pisania precyzyjnych testów jednostkowych.
  - Lepsze "tree-shaking" (mniejszy rozmiar paczek JS).

### Module 2: Migracja i Czyszczenie CSS (Tailwind v4) ✅

- **Zadania:**
  - ✅ Skanowanie kodu w poszukiwaniu "magic values" (np. `text-[14px]`, `w-[350px]`) i zastąpienie ich klasami z konfiguracji (`text-sm`, `w-card`).
  - ✅ Usunięcie pozostałości po stylach inline oraz starych plikach CSS/SCSS.
  - ✅ Standaryzacja kolorów i odstępów zgodnie z Design Systemem.
- **Efekt:**
  - Spójny wygląd całej aplikacji.
  - Mniejszy plik wyjściowy CSS.
  - Łatwiejsze wprowadzanie globalnych zmian w designie.

### Module 3: Strict TypeScript & Type Safety ✅

- **Zadania:**
  - ✅ Audyt kodu pod kątem typów `any` i zastąpienie ich ścisłymi interfejsami.
  - ✅ Stworzenie/aktualizacja typów dla odpowiedzi z Sanity CMS oraz tabel Supabase.
  - ✅ Weryfikacja typowania formularzy i propsów komponentów.
- **Efekt:**
  - Drastyczna redukcja błędów w czasie działania (runtime errors).
  - Lepsze podpowiadanie kodu w IDE (IntelliSense).
  - Bezpieczniejszy refactoring w przyszłości.

### Module 4: Architektura Importów ✅

- **Zadania:**
  - ✅ Analiza i naprawa cyklicznych zależności (circular dependencies), np. między kontekstami a komponentami.
  - ✅ Eliminacja problematycznych "barrel files" (index.ts), które powodują wciąganie nieużywanych modułów.
  - ✅ Standaryzacja importów absolutnych (`@/components/...`).
- **Efekt:**
  - Szybsze budowanie aplikacji.
  - Wyeliminowanie błędów inicjalizacji ("undefined is not a function").

---

## ⚡ Faza 3: Performance & Core Web Vitals (Wydajność) ✅

**Cel:** Osiągnięcie wyniku 95-100/100 w Google Lighthouse Mobile oraz minimalizacja wskaźnika TBT (Total Blocking Time).

### Module 1: Zaawansowana Hydracja (Lazy Hydration) ✅

- **Zadania:**
  - ✅ Wdrożenie `LazyHydrate` dla sekcji "below the fold" (poza pierwszym widokiem), stopki oraz ciężkich komponentów interaktywnych.
  - ✅ Implementacja `content-visibility: auto` dla długich list elementów.
- **Efekt:**
  - Znacząca redukcja TBT (strona szybciej reaguje na kliknięcia).
  - Szybszy czas do pełnej interaktywności (TTI).

### Module 2: Bundle Splitting & Optymalizacja JS ✅

- **Zadania:**
  - ✅ Analiza wizualizacji paczek (bundle analyzer).
  - ✅ Wydzielenie ciężkich bibliotek (np. `framer-motion`, `recharts`, mapy) do osobnych chunków ładowanych tylko wtedy, gdy są potrzebne.
  - ✅ Usunięcie nieużywanego kodu (Dead Code Elimination).
- **Efekt:**
  - Szybsze ładowanie wstępne (LCP/FCP) na wolniejszych urządzeniach i sieciach 3G/4G.

### Module 3: Optymalizacja Mediów ✅

- **Zadania:**
  - ✅ Weryfikacja pipeline'u konwersji do formatów nowej generacji (AVIF, WebP).
  - ✅ Dodanie atrybutów `width` i `height` do wszystkich obrazów (zapobieganie CLS).
  - ✅ Implementacja responsywnych obrazów (`srcset`) – serwowanie małych obrazków na telefony.
- **Efekt:**
  - Wskaźnik CLS (Layout Shift) bliski 0.
  - Oszczędność transferu danych użytkownika.

### Module 4: Optymalizacja Wykonywania JS ✅

- **Zadania:**
  - ✅ Przeniesienie ciężkich obliczeń (np. symulacje audytów) do `useEffect` (po renderowaniu) lub Web Workerów.
  - ✅ Optymalizacja pętli animacji, aby nie blokowały głównego wątku przeglądarki.
- **Efekt:**
  - Płynne animacje (60 FPS).
  - Brak "przycięć" podczas przewijania strony.

---

## 🔍 Faza 4: SEO & Content Engine (Widoczność)

**Cel:** Maksymalizacja widoczności w organicznych wynikach wyszukiwania i perfekcyjna struktura danych.

### Module 1: Dane Strukturalne (Schema.org)

- **Zadania:**
  - Implementacja JSON-LD dla każdego typu strony: Service, Article, FAQPage, BreadcrumbList, Organization, LocalBusiness.
  - Weryfikacja poprawności w narzędziu Google Rich Results Test.
- **Efekt:**
  - Wyświetlanie elementów rozszerzonych w Google (gwiazdki, pytania FAQ, ceny).
  - Wyższy współczynnik klikalności (CTR).

### Module 2: Architektura Linkowania Wewnętrznego

- **Zadania:**
  - Stworzenie algorytmu "Powiązane treści" – automatyczne linkowanie usług do relewantnych artykułów i Case Studies.
  - Dodanie sekcji "Sugerowane" na końcach artykułów.
- **Efekt:**
  - Głębsze indeksowanie strony przez roboty Google.
  - Dłuższy czas spędzany na stronie (niższy Bounce Rate).

### Module 3: Skalowalność SSG (Static Site Generation)

- **Zadania:**
  - Optymalizacja skryptu `prerender.js` pod kątem obsługi tysięcy podstron pSEO (zarządzanie pamięcią, równoległość).
  - Obsługa mapy witryny (`sitemap.xml`) dla dużej liczby adresów URL.
- **Efekt:**
  - Możliwość generowania 10k+ podstron bez awarii procesu budowania.

---

## ♿ Faza 5: Accessibility & UX (Dostępność i RWD)

**Cel:** Zgodność ze standardem WCAG 2.1 AA oraz doskonałe doświadczenie na urządzeniach mobilnych.

### Module 1: Audyt i Poprawa Dostępności (WCAG)

- **Zadania:**
  - Weryfikacja kontrastów kolorystycznych tekstów i elementów UI.
  - Uzupełnienie brakujących etykiet ARIA (`aria-label`, `role`) dla elementów interaktywnych.
  - Zapewnienie alternatyw tekstowych dla wszystkich grafik znaczących.
- **Efekt:**
  - Zgodność z wymogami prawnymi (EAA 2025).
  - Dostępność serwisu dla osób korzystających z czytników ekranowych.

### Module 2: Nawigacja Klawiaturą

- **Zadania:**
  - Implementacja "Focus Trap" w modalach i panelach bocznych.
  - Zapewnienie widocznych stanów `:focus` dla wszystkich przycisków i linków.
  - Logiczna kolejność tabulacji (Tab Order).
- **Efekt:**
  - Możliwość pełnej obsługi strony bez użycia myszki.

### Module 3: Mobile UX Polish (RWD)

- **Zadania:**
  - Weryfikacja wielkości stref dotyku (min. 44x44px) dla przycisków.
  - Dostosowanie interfejsu do bezpiecznych stref ekranu (np. notch w iPhone).
  - Optymalizacja wielkości czcionek na małych ekranach.
- **Efekt:**
  - Wygodniejsza obsługa na telefonach.
  - Lepsza ocena w Google Mobile-Friendly Test.

---

## 🛡️ Faza 6: Security & Stability (Bezpieczeństwo)

**Cel:** Ochrona danych użytkowników i zapewnienie stabilności produkcyjnej.

### Module 1: Bezpieczeństwo Backendowe (Supabase)

- **Zadania:**
  - Audyt i zaostrzenie reguł RLS (Row Level Security) w bazie danych.
  - Weryfikacja uprawnień API keys (anon vs service_role).
- **Efekt:**
  - Ochrona przed wyciekiem lub nieautoryzowaną modyfikacją danych.

### Module 2: Ochrona Formularzy i API

- **Zadania:**
  - Implementacja walidacji danych (Zod) po stronie klienta i serwera.
  - Wdrożenie Rate Limitingu dla endpointów formularzy kontaktowych.
  - Ochrona przed atakami XSS i Injection.
- **Efekt:**
  - Redukcja spamu.
  - Zwiększone bezpieczeństwo infrastruktury.

### Module 3: Obsługa Błędów (Resilience)

- **Zadania:**
  - Wdrożenie `Error Boundaries` w React – łapanie błędów komponentów bez "wywalania" całej strony.
  - Stworzenie przyjaznych stron błędów 404 i 500.
- **Efekt:**
  - "Graceful degradation" – strona działa nawet przy awarii pojedynczego elementu.
  - Lepsze wrażenie użytkownika w sytuacjach awaryjnych.

---

## 🔬 Faza 7: Deep Code Analysis & Optimization

**Cel:** Głęboka analiza statyczna kodu w celu wykrycia redundancji, martwego kodu i problemów architektonicznych, a następnie wdrożenie poprawek.

### Module 1: Wielkie Czyszczenie (Dead Code Removal) 🔄

- **Zadania:**
  - ✅ Analiza raportów `knip` (martwy kod) i `jscpd` (duplikacja).
  - ✅ Usunięcie martwych komponentów (`Portfolio.tsx`, `PremiumWebsites.tsx`, `VisualContent.tsx`).
  - ✅ Usunięcie starych plików danych (`articles-content.ts`, `pricing_archive.ts`).
  - ✅ Eliminacja "barrel files" (`components/common/index.ts`).
  - Usunięcie pozostałych 34 martwych plików wskazanych przez `knip` (skrypty, nieużywane wizualizacje).
  - Wyczyszczenie nieużywanych zależności w `package.json` (`@google/genai`, `why-did-you-render`).
- **Efekt:**
  - Zmniejszenie rozmiaru projektu i szumu informacyjnego.

### Module 2: Deduplikacja UI (DRY) 🔄

- **Zadania:**
  - ✅ Refaktoryzacja `Input.tsx` i `Select.tsx` do `FieldWrapper.tsx`.
  - ✅ Unifikacja logiki pobierania danych pSEO via `usePseoData` hook.
  - ✅ Refaktoryzacja `GoogleAds.tsx` (wydzielenie kalkulatora i FAQ).
  - Scalenie JSX w szablonach pSEO (`IndustryTemplate.tsx` i `LocationTemplate.tsx`).
  - Standaryzacja sekcji powtarzalnych w Landing Page'ach (Hero, FAQ, Pricing).
- **Efekt:**
  - Łatwiejsze utrzymanie spójności wizualnej (zmiana w jednym miejscu).
  - Mniejszy rozmiar kodu (redukcja duplikatów).

### Module 3: Refaktoryzacja "God Objects"

- **Zadania:**
  - `ContactModal`: Wydzielenie konfiguracji formularza i podział na mniejsze sub-komponenty.
  - `Marketing.tsx`: Dalsza atomizacja sekcji.
- **Efekt:**
  - Lepsza czytelność i testowalność kluczowych elementów UI.

### Module 4: Optymalizacja Artykułów

- **Zadania:**
  - Analiza duplikacji między komponentami artykułów (`...Article.tsx`) a ich wizualizacjami (`...Visuals.tsx`).
  - Weryfikacja, czy wizualizacje nie renderują redundantnej treści.
- **Efekt:**
  - Eliminacja zduplikowanego kodu (ok. 5.5% całego TSX).

---

## 🚀 Faza 8: Execution & Polish
