/**
 * Przełączniki funkcji (build-time, Vite). Domyślnie wszystko wyłączone.
 * Funkcja zamiast stałej: wartość czytana przy wywołaniu (testy podmieniają ją
 * przez vi.stubEnv), a w buildzie Vite i tak wstawia literał.
 */

/** Klauzula informacyjna RODO pod formularzami + pełna treść w polityce prywatności (MIX-844). */
export const isRodoKlauzulaEnabled = (): boolean => import.meta.env.VITE_RODO_KLAUZULA === '1';

/**
 * Baner zgód w prerenderowanym HTML (MIX-1579, LCP mobile). Baner rysował się dopiero po
 * starcie Reacta (ok. 4–5 s na telefonie w Lighthouse) i był elementem LCP na /, /audyt-360/
 * i /baza-wiedzy/. Włączony: prerender zapisuje baner i przycisk zgód w HTML, a skrypt
 * w <head> (index.html) chowa baner gościom z zapisaną zgodą jeszcze przed pierwszym
 * malowaniem. Wyłączony = dotychczasowe zachowanie.
 */
export const isCookieBannerStaticEnabled = (): boolean =>
  import.meta.env.VITE_MM_COOKIE_BANNER_STATIC === '1';

/**
 * Blok „Powiązane” (MIX-1268, plan SEO A11) na stronach artykułu, realizacji i branży z CMS.
 * Włączony: `components/common/Powiazane.tsx` zamiast dawnego `RelatedArticles` (artykuł,
 * realizacja) i nowy blok na branży. Wyłączony = dotychczasowe zachowanie.
 */
export const isPowiazaneEnabled = (): boolean => import.meta.env.VITE_MM_POWIAZANE === '1';

/**
 * Sekcja „Aplikacje i systemy z elementami AI” na stronie głównej i zdanie z linkiem na
 * /web-development/custom-app/ (MIX-1276, plan SEO A20). Prowadzą na ukrytą stronę usługi
 * (MIX-1272), więc cały ruch zostaje za przełącznikiem do akceptacji tekstu przez Jakuba.
 * Wyłączony (domyślnie) = HTML obu stron bez zmian co do bajta.
 */
export const isAiSectionEnabled = (): boolean => import.meta.env.VITE_MM_AI_SECTION === '1';

/**
 * Sekcje lokalne „Rzeszów” na stronach Google Ads i sklepów internetowych (MIX-1286, plan SEO A35).
 * Tekst czeka na akceptację Jakuba (docs/tresci/MIX-1286.md). Wyłączony = sekcji nie ma w DOM ani
 * w prerenderowanym HTML; Preview buduje się z `VITE_MM_RZESZOW_SEKCJE=1` (ci.yml).
 */
export const isRzeszowSectionsEnabled = (): boolean =>
  import.meta.env.VITE_MM_RZESZOW_SEKCJE === '1';

/**
 * Filmy w portfolio (MIX-1831/MIX-1873): lista `/portfolio/` (film po najechaniu, doczytany w tle
 * po `load`) i strona realizacji (film w miejscu zdjęcia hero po `load`). Mapa filmów:
 * `data/portfolioVideos.ts`. Wyłączony = brak `<video>` w DOM i zero żądań filmów. Włączony na
 * produkcji, w Preview i w PR (MIX-1896, decyzja Jakuba w MIX-1953; ci.yml).
 */
export const isPortfolioVideoEnabled = (): boolean =>
  import.meta.env.VITE_MM_PORTFOLIO_VIDEO === '1';

/**
 * Strona /cennik/ z widełkami cen (MIX-1855): trasa, adres w sitemap.xml i llms.txt, linki
 * z artykułów bazy wiedzy i przycisk „Chcesz podobny projekt?” w realizacjach. Czeka na
 * akceptację Jakuba. Wyłączony (domyślnie) = brak trasy, a /cennik i /cennik/ dostają 301 na
 * /offers/ (public/_redirects), HTML pozostałych stron bez zmian. Preview buduje się z
 * `VITE_MM_CENNIK=1` (ci.yml); w buildzie z włączonym przełącznikiem scripts/apply-cennik-build.mjs
 * zdejmuje te 301 z dist/_redirects i dopisuje stronę do dist/llms.txt.
 */
export const isCennikEnabled = (): boolean => import.meta.env.VITE_MM_CENNIK === '1';

/**
 * Strona główna pod „systemy dedykowane” i automatyzację AI (MIX-1269 r3, plan SEO A12): nowy title,
 * meta description, fraza w H1 i linki lokalne z opisowymi kotwicami w pasie „Lokalnie · Rzeszów”.
 * Tekst czeka na akceptację Jakuba (docs/tresci/MIX-1269.md). Wyłączony (domyślnie) = strona główna
 * bez zmian co do bajta (tests/seo/homeSeo.test.tsx). Preview buduje się z `VITE_MM_HOME_SEO=1` (ci.yml).
 */
export const isHomeSeoEnabled = (): boolean => import.meta.env.VITE_MM_HOME_SEO === '1';

/**
 * Sekcja dowodu na /web-development/custom-app/ (MIX-1975): PsychON (platforma szkoleniowa Fundacji
 * Niepodzielni, zrzuty z danych testowych w public/assets/custom-app/) zamiast KorepetytorAI
 * (StudentPI). Link prowadzi do /portfolio/ (PsychON nie ma jeszcze strony realizacji w CMS).
 * Wyłączony (domyślnie) = sekcja jak przed zmianą. Preview buduje się z `VITE_MM_CUSTOMAPP_PSYCHON=1`
 * (ci.yml); produkcja i PR puste do akceptacji Jakuba.
 */
export const isCustomAppPsychonEnabled = (): boolean =>
  import.meta.env.VITE_MM_CUSTOMAPP_PSYCHON === '1';
