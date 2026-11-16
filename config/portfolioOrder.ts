/**
 * MIX-1829: realizacje wyróżnione na początku listy /portfolio/, w tej kolejności.
 * Jedyne miejsce, gdzie ustawia się tę kolejność — zmiana = edycja tej listy (bez zmian w CMS).
 * Slug, którego nie ma w CMS (np. PsychON przed publikacją realizacji), jest pomijany bez luki.
 * Reszta zostaje w kolejności z CMS (po dacie realizacji, najnowsze pierwsze).
 */
export const PORTFOLIO_PINNED_SLUGS: readonly string[] = [
  // PsychON — realizacji jeszcze nie ma w CMS; gdy powstanie pod innym slugiem, popraw tutaj.
  'psychon',
  'fundacja-niepodzielni',
  'impackt-edu',
  'try-dive-szkola-nurkowania',
];

/** Wyróżnione slugi na początek (w kolejności listy), pozostałe pozycje bez zmiany kolejności. */
export function orderPortfolio<T extends { slug: string }>(
  projects: readonly T[],
  pinned: readonly string[] = PORTFOLIO_PINNED_SLUGS,
): T[] {
  const rank = new Map(pinned.map((slug, i) => [slug, i]));
  const head = projects
    .filter((p) => rank.has(p.slug))
    .sort((a, b) => (rank.get(a.slug) as number) - (rank.get(b.slug) as number));
  const rest = projects.filter((p) => !rank.has(p.slug));
  return [...head, ...rest];
}
