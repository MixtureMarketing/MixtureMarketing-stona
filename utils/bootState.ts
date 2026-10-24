/**
 * Stan startu aplikacji: czy pierwszy render React zastępuje prerenderowany HTML.
 *
 * Strona przychodzi z Cloudflare jako statyczny zrzut z prerenderu (Puppeteer), a
 * `index.tsx` montuje aplikację przez `createRoot` — React buduje DOM od zera i
 * podmienia nim zawartość `#root`. Żeby ta podmiana była niewidoczna, pierwszy
 * render musi dać TĘ SAMĄ treść co zrzut: bez fallbacków Suspense i bez zwijania
 * sekcji do placeholderów (`LazyHydrate`). Flaga jest prawdziwa od startu do
 * pierwszej nawigacji SPA (`endPrerenderBoot` w `ScrollToTop`); potem komponenty
 * wracają do zwykłego, leniwego trybu.
 */
let bootFromPrerender = false;

export const markPrerenderBoot = () => {
  bootFromPrerender = true;
};

export const endPrerenderBoot = () => {
  bootFromPrerender = false;
};

export const isPrerenderBoot = () => bootFromPrerender;
