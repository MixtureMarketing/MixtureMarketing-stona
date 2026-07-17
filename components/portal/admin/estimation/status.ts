// Cykl życia wyceny w UI — etykiety i wygląd. Jedno miejsce dla listy i ekranu wyniku.
//
// UWAGA: to warstwa PREZENTACJI. O tym, co wolno zrobić, decyduje API (quote-status, D30) —
// tutejsze `MOZLIWE_PRZEJSCIA` służy wyłącznie do tego, żeby nie rysować przycisku, który
// i tak dostanie 409. Ukrycie przycisku nie jest zabezpieczeniem.

export const STATUS_LABEL: Record<string, string> = {
  draft: 'Szkic',
  review: 'W przeglądzie',
  sent: 'Wysłana',
  won: 'Wygrana',
  lost: 'Przegrana',
  closed: 'Zamknięta',
};

export const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  review: 'bg-amber-100 text-amber-800',
  sent: 'bg-sky-100 text-sky-800',
  won: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-rose-100 text-rose-800',
  closed: 'bg-slate-200 text-slate-700',
};

/** Odbicie tabeli przejść z API (quote-status.ts). Zmiana tam = zmiana tutaj. */
export const MOZLIWE_PRZEJSCIA: Record<string, string[]> = {
  draft: [],
  review: ['sent'],
  sent: ['won', 'lost'],
  won: ['closed'], // f3a: zamknięcie projektu (godziny rzeczywiste)
  lost: [],
  closed: [],
};

interface ZDatami {
  status: string;
  sent_at?: string | null;
  won_at?: string | null;
  lost_at?: string | null;
  closed_at?: string | null;
  created_at?: string | null;
}

/**
 * Data, która w danym statusie coś znaczy. Lista pokazywała `created_at` przy każdej
 * wycenie — przy wysłanej ofercie sprzed miesiąca to nie jest informacja, której się szuka.
 */
export function dataStatusu(q: ZDatami): string | null {
  const d =
    q.status === 'closed'
      ? q.closed_at
      : q.status === 'won'
        ? q.won_at
        : q.status === 'lost'
          ? q.lost_at
          : q.status === 'sent'
            ? q.sent_at
            : null;
  return (d ?? null)?.slice(0, 10) ?? null;
}
