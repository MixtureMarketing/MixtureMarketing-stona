# Roadmap Projektu Mixture Marketing - Finalizacja i Wdrożenie

Dokument ten obejmuje "ostatnią prostą" przed pełnym wdrożeniem produkcyjnym.

---

## 🏗️ Faza 11-14: ZAKOŃCZONE ✅

- [x] Globalna Standaryzacja FAQ (StandardFaq.tsx)
- [x] Migracja wszystkich 28 artykułów do ArticleShell.tsx
- [x] Walidacja formularzy Zod + React Hook Form (ContactModal, Contact Section)
- [x] Weryfikacja danych strukturalnych JSON-LD (Home, Blog, pSEO)
- [x] Stress-test SSG (160+ podstron wyrenderowanych pomyślnie)
- [x] **Stabilność wizualna i Hydracja:** Eliminacja migania sekcji i blokada wysokości (AnimateOnScroll, LazyHydrate).
- [x] **Kompleksowe poprawki RWD:** Navbar, Fluid Typography w Hero, Grids & Cards, Modale.
- [x] **Dostępność i Aria Labels:** Pełna weryfikacja etykiet i kontrastu (Footer, StandardCta).
- [x] **Optymalizacja Rozmiaru:** Redukcja wagi obrazów o 140MB, konsolidacja CSS, manualChunks i czyszczenie zależności.
- [x] **Eliminacja Redundancji:** Konsolidacja komponentów RelatedArticles, optymalizacja stylów PHP, scalenie typów i refaktoryzacja prerender.js.

---

## 🧹 Faza 15: Operation Deep Clean & Weryfikacja Architektury ✅

Faza dedykowana "sterylizacji" kodu przed wdrożeniem. Nie dodajemy nowych funkcji, tylko sprzątamy.

### Krok 1: Weryfikacja Automatyczna (Smoke Test) ✅

- [x] **Type Check:** Uruchomienie `tsc --noEmit` (naprawiono 35 błędów w 11 plikach).
- [x] **Linting:** Naprawa błędów ESLint v9 (w tym `set-state-in-effect` i Prettier).
- [x] **Tests:** Uruchomienie `npm test` (Unit - 39 testów przeszło).

### Krok 2: Eliminacja Długu Technicznego (Tailwind & Style) ✅

- [x] **Audyt Kolorów:** Wyciągnięcie hex-kodów (`#0B1120`, `#F9FAFB`) do `index.css` (zmienne semantyczne: `deep-dark`, `light-gray`).
- [x] **Refaktoryzacja:** Zamiana arbitralnych wartości `bg-[#...]` na klasy np. `bg-deep-dark`.

### Krok 3: Czyszczenie Zależności i Bazy Danych ✅

- [x] **Supabase Purge:** Całkowite usunięcie resztek kodu/konfiguracji Supabase.
- [x] **Analiza Bibliotek:** Przegląd `package.json` – dodano brakujące `zod` i `@portabletext/types`.
- [x] **Martwy Kod:** Usunięto nieużywaną sekcję `Contact.tsx`.

### Krok 4: Weryfikacja Treści (Hybrid Content System) ✅

- [x] **Hardcoded Articles (Legacy - PROTECTED):** Weryfikacja 28 artykułów (pozostają jako komponenty React).
- [x] **CMS Articles (New):** Weryfikacja `ArticleTemplate.tsx` dla treści z Sanity.
- [x] **Zombie Text:** Tłumaczenie i oczyszczenie etykiet w `HeroVisuals.tsx`.

## 💎 Faza 17: Hyper-Optimization & Sterilization (Deep Clean)

Faza skupiona na maksymalnym odchudzeniu kodu wynikowego i usunięciu redundancji logicznej.

### Krok 1: Głęboka Analiza (Audit) ✅

- [x] **Vite Visualizer:** Analiza `stats.html` – identyfikacja i naprawa błędów importu.
- [x] **Knip Advanced:** Wykrycie nieużywanych eksportów i typów.
- [ ] **Font Audit:** Redukcja ładowanych wag czcionek (@fontsource) do niezbędnego minimum.

### Krok 2: Refaktoryzacja i Unifikacja ✅

- [x] **Dictionary Extraction:** Wydzielenie powtarzających się fraz z `data/content` do `dictionary.ts`.
- [x] **Semantic Wrappers:** Stworzenie `SectionWrapper` i wdrożenie na LandingPage.
- [x] **SVG Sterilization:** Usunięcie redundancji SVG w `HeroVisuals.tsx` poprzez atomy UI.

### Krok 3: Tuning Builda ✅

- [x] **Advanced Minification:** Usunięcie zależności od `dotenv` na rzecz natywnych rozwiązań Node.js.
- [x] **CSS De-bloat:** Wyciągnięcie ciężkich Data URI (grain/grid) z CSS do plików zewnętrznych.
- [ ] **Bundle Fine-tuning:** Przeniesienie `html2canvas` i `zod` do dedykowanych vendor-chunków (wymaga weryfikacji stabilności).
- [x] **Dynamic Service Loading:** Refaktoryzacja `pdfService.ts` na dynamiczne importy.

### Krok 4: Optymalizacja Zasobów (Assets) ✅

- [x] **Font Subsetting:** Ograniczenie ładowanych wag czcionek do niezbędnego minimum.
- [x] **Lucide Tree-shaking:** Poprawa importów ikon i usunięcie błędów ReferenceError.
- [x] **SVG Sterilization:** Automatyczne czyszczenie inline SVG za pomocą SVGO podczas builda.

---

## 🚀 Faza 18: Deployment & CI/CD (Automation)

---

## 🎨 Faza 16: Final Polish

- [ ] **Review Animacji:** Wyłączenie ciężkich animacji dla `prefers-reduced-motion`.
- [ ] **Mikrointerakcje:** Subtelne efekty hover w `StandardCta` i `TopicLink`.
