// Pokolenie nawigacji dla powrotu z realizacji (MIX-1675 r4). Decyzje: utils/caseStudyBack.ts.
import { listKey } from './caseStudyBack';

/**
 * Pokolenie nawigacji (MIX-1675 r4). Każde cofnięcie (popstate) i każde przejście linkiem (PUSH,
 * REPLACE) zwiększa licznik. Każdy odroczony skutek powrotu (czekanie na listę, timer, rAF, korekta, ogon
 * przejścia) bierze bilet w chwili zaplanowania i działa tylko, gdy licznik się nie zmienił, a
 * lokalizacja (ścieżka + query) jest nadal lokalizacją listy. Nieznany albo błędny stan = nic.
 */
let generation = 0;

export function bumpGeneration(): void {
  generation += 1;
}

export function currentGeneration(): number {
  return generation;
}

export interface BackLocation {
  pathname: string;
  search: string;
}

function locationKey(read: () => BackLocation | null | undefined): string | null {
  try {
    const loc = read();
    if (!loc || typeof loc.pathname !== 'string' || typeof loc.search !== 'string') return null;
    if (!loc.pathname.startsWith('/')) return null;
    return `${listKey(loc.pathname)}\n${loc.search}`;
  } catch {
    return null;
  }
}

/** Bilet odroczonego skutku: `true` tylko w tym samym pokoleniu i na tej samej lokalizacji. */
export function backTicket(read: () => BackLocation | null | undefined): () => boolean {
  const gen = generation;
  const at = locationKey(read);
  if (at === null) return () => false;
  return () => gen === generation && locationKey(read) === at;
}
