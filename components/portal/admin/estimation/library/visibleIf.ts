// Podgląd warunku widoczności pytania (visible_if_json) po ludzku — READ-ONLY (f2c-1, punkt 2:
// „podgląd visible_if bez edycji surowego JSON"). Ten sam format warunku co reguły (05):
//   { all: [...] } | { any: [...] } | { q, op, val }.
// Rozwiązuje kody pytań i value opcji na etykiety, żeby prowadzący czytał sens, nie kod.
import type { Condition } from '@/lib/estimation/types';

export interface QMeta {
  text: string;
  options?: { value: unknown; label: string }[];
}
export type QMap = Record<string, QMeta>;

const OP: Record<string, string> = { eq: '=', neq: '≠', gt: '>', gte: '≥', lt: '<', lte: '≤' };

function labelForValue(q: QMeta | undefined, v: unknown): string {
  if (typeof v === 'boolean') return v ? 'tak' : 'nie';
  const opt = q?.options?.find((o) => o.value === v);
  return opt ? opt.label : String(v);
}

export function describeCondition(cond: Condition, qmap: QMap): string {
  if ('all' in cond) return cond.all.map((c) => wrap(c, qmap)).join(' ORAZ ');
  if ('any' in cond) return cond.any.map((c) => wrap(c, qmap)).join(' LUB ');

  const q = qmap[cond.q];
  const name = q ? `„${q.text}"` : `„${cond.q}"`;
  switch (cond.op) {
    case 'answered':
      return `${name}: odpowiedziane`;
    case 'unknown':
      return `${name}: „nie wiem"`;
    case 'not_applicable':
      return `${name}: „nie dotyczy"`;
    case 'in': {
      const arr = Array.isArray(cond.val) ? cond.val : [cond.val];
      return `${name} ∈ {${arr.map((v) => labelForValue(q, v)).join(', ')}}`;
    }
    case 'contains':
      return `${name} zawiera ${labelForValue(q, cond.val)}`;
    default:
      return `${name} ${OP[cond.op] ?? cond.op} ${labelForValue(q, cond.val)}`;
  }
}

function wrap(c: Condition, qmap: QMap): string {
  const s = describeCondition(c, qmap);
  return 'all' in c || 'any' in c ? `(${s})` : s;
}

/** Pełny opis: null → „zawsze widoczne"; błędny JSON → komunikat, nie wyjątek. */
export function describeVisibleIf(json: string | null | undefined, qmap: QMap): string {
  if (!json) return 'zawsze widoczne';
  let cond: Condition;
  try {
    cond = JSON.parse(json) as Condition;
  } catch {
    return 'warunek nieczytelny (błędny JSON)';
  }
  return `widoczne, gdy: ${describeCondition(cond, qmap)}`;
}
