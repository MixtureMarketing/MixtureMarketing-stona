// Transform prezentacyjny publicznego kalkulatora (f4a) — CZYSTY TS.
// Poszerza i zaokrągla zawężone widełki ofertowe silnika do publicznego pasma oraz wybiera
// archetyp wewnętrzny. NIE zmienia agregacji ani ENGINE_VERSION — to warstwa prezentacji
// czytająca parametry (docs/estimation/kontrakt-kalkulator-publiczny.md §4–§5).
import type { Totals, RuleEvaluation } from './types';

export interface PublicOfferParams {
  /** public_widen_k — poszerzenie pasma (0.15 = ±15%). */
  widenK: number;
  /** public_round_pln — krok zaokrąglenia (min w dół, max w górę). ≤ 0 = krok 1. */
  roundPln: number;
}

export interface PublicPriceRange {
  min: number;
  max: number;
}

/**
 * Poszerza `totals.offer` o ±widenK, zaokrągla min w DÓŁ i max w GÓRĘ do roundPln.
 * Wejściem jest zawężona oferta silnika; wynik to szersze, bezpieczne pasmo publiczne.
 */
export function toPublicOffer(totals: Totals, params: PublicOfferParams): PublicPriceRange {
  const { min, max } = totals.offer;
  const step = params.roundPln > 0 ? params.roundPln : 1;
  const wMin = min * (1 - params.widenK);
  const wMax = max * (1 + params.widenK);
  return {
    min: Math.floor(wMin / step) * step,
    max: Math.ceil(wMax / step) * step,
  };
}

export interface PublicArchetypePick {
  code: string;
  /** Uzasadnienie do zapisu na draftcie (archetype_reason). */
  reason: string;
}

/**
 * Archetyp wewnętrzny publicznej wyceny (kontrakt §5). Kolejność:
 *  1. top-pick z `recommend_archetype` — `recommendedArchetypes[0]` (evaluateRules zwraca w
 *     kolejności deterministycznej: priorytet DESC, id ASC), wyprowadzony z odpowiedzi;
 *  2. fallback: mapa per-cel (gdy brak rekomendacji);
 *  3. fallback globalny (cel spoza mapy / brak celu).
 */
export function pickPublicArchetype(
  recommended: RuleEvaluation['recommendedArchetypes'],
  goal: string | undefined,
  fallbackMap: Record<string, string>,
  globalFallback: string,
): PublicArchetypePick {
  if (recommended.length > 0) {
    const top = recommended[0];
    return { code: top.code, reason: top.reason ?? 'rekomendacja reguł' };
  }
  if (goal && fallbackMap[goal]) {
    return { code: fallbackMap[goal], reason: `fallback cel: ${goal}` };
  }
  return { code: globalFallback, reason: 'fallback globalny' };
}
