// „Twój zakres" w podglądzie wyceny (MIX-1790, Z6 z MIX-1377; spec MIX-1320 U4, decyzja P5 = A).
// CZYSTY TS. Z wyniku silnika wybiera obszary, które realnie wchodzą do projektu (godziny > 0, jak
// zakres oferty w documents.ts), i zwraca dla nich WYŁĄCZNIE treść kliencką z migracji 0007:
// `client_name` (nazwa obszaru) i `client_description` (opis wybranego poziomu).
// Lista dozwolona i fail-closed: nowy obiekt z dwoma polami (nic z wiersza nie przechodzi
// „przy okazji"), brak albo pusta nazwa kliencka = obszar pominięty (BEZ fallbacku na nazwę
// wewnętrzną), nie-tekst, sam biały znak, za długi tekst = pominięty albo opis = null.
import type { AspectComputation } from './types';

export interface PublicScopeItem {
  client_name: string;
  client_description: string | null;
}

/** Najdłuższa nazwa obszaru, którą pokażemy (znaki). Dłuższa = obszar pominięty. */
export const SCOPE_NAME_MAX = 120;
/** Najdłuższy opis (znaki). Dłuższy = opis pominięty (null), nazwa zostaje. */
export const SCOPE_DESCRIPTION_MAX = 500;
/** Najwięcej pozycji listy w jednej odpowiedzi. */
export const SCOPE_MAX_ITEMS = 30;

// Znaki, które nie są widoczne: miękki dywiz, spacje zerowej szerokości, znaczniki kierunku, BOM.
const INVISIBLE = /[\u00AD\u200B-\u200F\u2060-\u2064\uFEFF]/g;

/** Tekst do pokazania albo null: tylko string, bez znaków niewidocznych, niepusty, ≤ max. */
export function cleanClientText(raw: unknown, max: number): string | null {
  if (typeof raw !== 'string') return null;
  const t = raw.replace(INVISIBLE, '').trim();
  if (t === '' || t.length > max) return null;
  return t;
}

/** Obszary wybrane (godziny > 0) → lista „Twój zakres" (najwyżej SCOPE_MAX_ITEMS pozycji). */
export function toPublicScope(aspects: readonly AspectComputation[]): PublicScopeItem[] {
  const out: PublicScopeItem[] = [];
  for (const a of aspects) {
    if (out.length >= SCOPE_MAX_ITEMS) break;
    if (!(a.hoursMax > 0)) continue;
    const name = cleanClientText(a.clientName, SCOPE_NAME_MAX);
    if (name === null) continue;
    out.push({
      client_name: name,
      client_description: cleanClientText(a.levelClientDescription, SCOPE_DESCRIPTION_MAX),
    });
  }
  return out;
}
