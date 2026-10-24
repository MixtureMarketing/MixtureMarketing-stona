// Bramka jakości prerenderu (fail-loud). Czysta funkcja — testowana w
// tests/scripts/prerenderGate.test.ts; prerender.js zbiera sygnały ze strony
// (page.evaluate) i woła `checkPrerenderedPage` PRZED zapisem do dist/.
//
// Po co: chwilowy błąd Sanity w prerenderze kończył się stroną NotFound
// (noindex, tytuł „404”) zapisaną jako dist/<trasa>/index.html → CF Pages
// serwował ją z HTTP 200, a build był zielony. Teraz taka trasa wywala build.

/**
 * Trasy z CELOWYM `noindex` poza prerenderOnlyRoutes (routes.js). Dla nich
 * sprawdzamy tylko, że nie są stroną 404 / błędu.
 * - /miasto/<slug>/ poza siedzibą: PseoTemplate ustawia `noindex={slug !== 'rzeszow'}`
 *   (ochrona przed doorway pages do czasu unikalnej treści per miasto).
 */
export const INTENTIONAL_NOINDEX_PATTERNS = [/^\/miasto\/(?!rzeszow\/)[^/]+\/$/];

/** @param {string} route */
export function normalizeRoute(route) {
  if (route === '/') return '/';
  return `${route.replace(/\/+$/, '')}/`;
}

/**
 * @param {string} route
 * @param {{ noindex: boolean; title: string; notFound?: boolean; cmsError?: boolean; errorBoundary?: boolean }} signals
 * @param {{ prerenderOnlyRoutes?: string[] }} [options]
 * @returns {string | null} opis problemu albo null, gdy strona jest OK
 */
export function checkPrerenderedPage(route, signals, options = {}) {
  const norm = normalizeRoute(route);
  const noindexAllowed =
    (options.prerenderOnlyRoutes || []).map(normalizeRoute).includes(norm) ||
    INTENTIONAL_NOINDEX_PATTERNS.some((re) => re.test(norm));

  if (signals.errorBoundary) return `${route}: wyrenderował się fallback ErrorBoundary`;
  if (signals.cmsError) return `${route}: stan błędu CMS (Sanity niedostępne w trakcie prerenderu)`;
  if (signals.notFound || /^\s*404\b/.test(signals.title || '')) {
    return `${route}: wyrenderowała się strona 404 (tytuł: "${signals.title}")`;
  }
  if (signals.noindex && !noindexAllowed) {
    return `${route}: nieoczekiwane <meta name="robots" content="noindex">`;
  }
  return null;
}
