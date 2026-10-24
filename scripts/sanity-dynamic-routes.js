// Pobieranie list tras dynamicznych z Sanity dla prerender.js i generate-sitemap.js — FAIL-LOUD.
//
// Dawniej oba skrypty łapały błąd pobrania i jechały dalej z pustą listą: build był zielony,
// a deploy wypuszczał stronę bez /branza/*, /miasto/*, /portfolio/* i artykułów z CMS
// (catch-all 404 na produkcji) oraz sitemapę bez tych adresów. Teraz:
//   - błąd pobrania którejkolwiek listy = wyjątek z czytelnym komunikatem (build pada),
//   - pusta lista przy poprawnej odpowiedzi = też wyjątek, bo produkcja ma te strony
//     (świadome wyczyszczenie kolekcji: ALLOW_EMPTY_SANITY_ROUTES=1).
// Czysta logika (bez sieci) — testy: tests/scripts/sanityDynamicRoutes.test.ts.

/** Kolekcje Sanity → prefiks trasy. Kolejność = kolejność w logach. */
export const DYNAMIC_COLLECTIONS = /** @type {const} */ ([
  { type: 'article', prefix: '/baza-wiedzy/' },
  { type: 'industry', prefix: '/branza/' },
  { type: 'location', prefix: '/miasto/' },
  { type: 'caseStudy', prefix: '/portfolio/' },
]);

/**
 * @param {{ fetch: (query: string) => Promise<unknown> }} client klient Sanity
 * @param {Record<string, string>} queries GROQ per typ (klucze z DYNAMIC_COLLECTIONS)
 * @param {{ allowEmpty?: boolean }} [options]
 * @returns {Promise<Record<string, Array<Record<string, unknown>>>>}
 */
export async function fetchDynamicLists(client, queries, options = {}) {
  const allowEmpty = options.allowEmpty ?? process.env.ALLOW_EMPTY_SANITY_ROUTES === '1';
  const entries = await Promise.all(
    DYNAMIC_COLLECTIONS.map(async ({ type, prefix }) => {
      const query = queries[type];
      if (!query) throw new Error(`Brak zapytania GROQ dla typu "${type}".`);
      let list;
      try {
        list = await client.fetch(query);
      } catch (err) {
        throw new Error(
          `Nie udało się pobrać listy tras ${prefix}* z Sanity (typ "${type}"): ${
            err instanceof Error ? err.message : String(err)
          }. Build przerwany — bez tej listy deploy wypuściłby stronę bez tych podstron. ` +
            'Sprawdź VITE_SANITY_PROJECT_ID / VITE_SANITY_DATASET i dostępność api.sanity.io.',
        );
      }
      if (!Array.isArray(list)) {
        throw new Error(
          `Sanity zwróciło nieoczekiwaną odpowiedź dla typu "${type}" (oczekiwano tablicy). Build przerwany.`,
        );
      }
      return [type, list];
    }),
  );
  const lists = Object.fromEntries(entries);

  const empty = DYNAMIC_COLLECTIONS.filter(({ type }) => lists[type].length === 0);
  if (empty.length > 0 && !allowEmpty) {
    throw new Error(
      `Sanity zwróciło PUSTĄ listę dla: ${empty
        .map(({ type, prefix }) => `${type} (${prefix}*)`)
        .join(', ')}. Produkcja ma te strony — to najpewniej zły dataset albo awaria CMS. ` +
        'Build przerwany. Jeśli kolekcja została wyczyszczona celowo, ustaw ALLOW_EMPTY_SANITY_ROUTES=1.',
    );
  }
  return lists;
}

/**
 * Lista tras do prerenderu (bez trailing slasha — prerender i tak deduplikuje).
 * Dokumenty bez sluga są pomijane (zapytanie powinno je odfiltrować `defined(slug.current)`).
 * @param {Record<string, Array<{ slug?: unknown }>>} lists
 * @returns {string[]}
 */
export function toRoutes(lists) {
  return DYNAMIC_COLLECTIONS.flatMap(({ type, prefix }) =>
    (lists[type] || [])
      .filter((d) => typeof d.slug === 'string' && d.slug)
      .map((d) => `${prefix}${d.slug}`),
  );
}
