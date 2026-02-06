# ROADMAP - Mixture Marketing

## 🚀 Optymalizacja Silnika Budowania i Prerenderingu

- ✅ **Optymalizacja Obrazów (Bottleneck #1)**:
  - ✅ **Smart Cache**: Naprawa sprawdzania `mtime` w CI poprzez `actions/cache`.
  - ✅ **Parallel Sharp**: Przetwarzanie równoległe w `convert-images.js`.
- ✅ **Prerender Parallelism (Bottleneck #2)**:
  - ✅ **Scaling**: Zwiększenie `MAX_CONCURRENCY` do 10.
  - ✅ **Resource Interception**: Blokowanie obrazów, fontów i tracking-scripts w Puppeteer.
- ✅ **Infrastruktura CI (GitHub Actions)**:
  - ✅ **Puppeteer Cache**: Dodanie `actions/cache` dla `~/.cache/puppeteer`.
  - ✅ **Vite Cache**: Dodanie `actions/cache` dla `node_modules/.vite`.
- ✅ **Optymalizacja Audit Health**:
  - ✅ Równoległe sprawdzanie statusów stron w `audit-health.js`.
- ✅ **Critters & Beasties**:
  - ✅ Implementacja `reduceInlineStyles`.

## 🛡️ Gwarancja Jakości 100% (Zero-Error Deploy)

- ✅ **E2E Core Flow**: Integracja `test-e2e-contact.js` z CI (blokada deploya przy błędzie formularza).
- ✅ **Dynamiczny Smoke Test**:
  - ✅ Rozszerzenie `audit-health.js` o pobieranie tras z Sanity (sprawdzanie wszystkich 54+ stron).
  - ✅ **Visual Check**: Weryfikacja obecności krytycznych selektorów (`#root`, `nav`, `footer`) na każdej stronie.
- ✅ **Content Safety Gate**:
  - ✅ Skrypt sprawdzający, czy Sanity nie zwraca pustych tablic dla kluczowych sekcji przed startem builda.
- 🔵 **Automatyczny Rollback**: Wymagana konfiguracja w panelu Cloudflare (Health Checks).

## 🛠️ Infrastruktura i Bezpieczeństwo

- ✅ **Dependency Audit**: Automatyczne `npm audit` w CI z progiem `high`.
- ✅ **Sitemap Validation**: Sprawdzanie poprawności XML i dostępności linków po wygenerowaniu.

## ⚡ Performance & Core Web Vitals (PSI Audit)

- ✅ **Advanced Code Splitting**: Przywrócenie `manualChunks` (rozbicie na vendor-pdf, vendor-charts, vendor-motion).
- ✅ **Eliminacja Layout Thrashing**: Poprawa komponentów `CursorGlow`, `AmbientBackground` i `AnimateOnScroll`.
- ✅ **GTM/GA4 Isolation**: Implementacja Lazy Loadingu analityki (3.5s delay / interaction).
- ✅ **Icon Tree-shaking**: Optymalizacja paczki poprzez podział `manualChunks`.
- ✅ **SEO Payload Reduction**: Implementacja memoizacji JSON-LD w komponencie `Seo.tsx`.

## Legenda statusów:

- 🔵 Planowane
- 🟡 W trakcie
- ✅ Zakończone
