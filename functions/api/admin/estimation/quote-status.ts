/**
 * Cloudflare Pages Function: admin/estimation/quote-status
 * Path: /api/admin/estimation/quote-status
 * Auth: dziedziczona z admin/_middleware.ts (rola admin).
 * POST {id, status, lost_reason?} — przejście w cyklu życia wyceny (D30, docs/02).
 *
 * Legalności przejść pilnuje TA funkcja, nie UI. Ukryty przycisk nie jest zabezpieczeniem:
 * pierwszy nowy ekran, skrypt albo deep link go omija. Kontrakt jest tutaj, testy w
 * quote-status.test.ts (pełna macierz).
 */

interface Env {
  DB: D1Database;
}

/** Dozwolone przejścia: z → dokąd wolno. Reszta = 409. */
const PRZEJSCIA: Record<string, string[]> = {
  draft: [], // najpierw finalize (quote-finalize: draft/review → review)
  review: ['sent'],
  sent: ['won', 'lost'],
  won: ['closed'], // f3a: zamknięcie projektu (godziny rzeczywiste w est_actual_hours)
  lost: [],
  closed: [], // stan końcowy — actuale edytowalne osobno (quote-close), bez zmiany statusu
};

/**
 * Słownik statusów modelu (docs/02). Służy do rozróżnienia DWÓCH różnych błędów:
 *  - status spoza słownika = śmieć w żądaniu → 400,
 *  - status znany, ale przejście niedozwolone (np. „cofnij wysłaną do edycji") → 409.
 * Zrównanie ich dawałoby 400 na sensowną próbę i gubiło informację, o co komuś chodziło.
 * `closed` jest w słowniku, ale nic do niego nie prowadzi — dołoży to F3 (godziny rzeczywiste),
 * dopisując `won: ['closed']` do PRZEJSCIA. Do tego czasu żądanie „closed" to uczciwe 409.
 */
const ZNANE_STATUSY = new Set(['draft', 'review', 'sent', 'won', 'lost', 'closed']);

/** Kolumna ze stemplem czasu dla docelowego statusu. */
const STEMPEL: Record<string, string> = {
  sent: 'sent_at',
  won: 'won_at',
  lost: 'lost_at',
  closed: 'closed_at', // f3a (0008)
};

interface Body {
  id?: number;
  status?: string;
  lost_reason?: string;
}

interface QuoteRow {
  id: number;
  status: string;
  pdf_r2_key: string | null;
  card_r2_key: string | null;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  try {
    const body = (await request.json()) as Body;
    if (!body.id) return json({ error: 'Pole „id" jest wymagane.' }, 400);
    if (!body.status || !ZNANE_STATUSY.has(body.status)) {
      return json({ error: `Nieznany status docelowy: „${body.status ?? ''}".` }, 400);
    }

    const quote = (await env.DB.prepare(
      'SELECT id, status, pdf_r2_key, card_r2_key FROM est_quotes WHERE id = ?',
    )
      .bind(body.id)
      .first()) as QuoteRow | null;
    if (!quote) return json({ error: 'Wycena nie istnieje.' }, 404);

    // ── Legalność przejścia ──
    if (!(PRZEJSCIA[quote.status] ?? []).includes(body.status)) {
      return json(
        {
          error: `Przejście „${quote.status}" → „${body.status}" jest niedozwolone.`,
          status: quote.status,
        },
        409,
      );
    }

    // ── Guard D30: „wysłana" znaczy, że dokumenty istnieją ──
    // Sprawdzany TYLKO przy wejściu w `sent`. Przy won/lost byłby szkodliwy: rozstrzygnięcia
    // nie wolno blokować z powodu stanu plików sprzed tygodni.
    if (body.status === 'sent' && !(quote.pdf_r2_key && quote.card_r2_key)) {
      const brakuje = [!quote.pdf_r2_key && 'oferta', !quote.card_r2_key && 'Karta decyzji'].filter(
        Boolean,
      );
      return json(
        {
          error: `Nie można oznaczyć jako wysłana: brak dokumentów w repozytorium (${brakuje.join(', ')}). Wygeneruj i zapisz dokumenty przed zmianą statusu.`,
        },
        409,
      );
    }

    // ── lost_reason wymagany (docs/02) ──
    // To dane kalibracji handlowej F3, nie pole do odklikania — pusty string nie przechodzi.
    const powod = body.lost_reason?.trim();
    if (body.status === 'lost' && !powod) {
      return json({ error: 'Przegrana wymaga podania powodu (pole „lost_reason").' }, 400);
    }

    const stempel = STEMPEL[body.status];
    const ustawPowod = body.status === 'lost';
    await env.DB.prepare(
      `UPDATE est_quotes
          SET status = ?, ${stempel} = datetime('now'),
              ${ustawPowod ? 'lost_reason = ?,' : ''}
              updated_at = datetime('now')
        WHERE id = ?`,
    )
      .bind(...[body.status, ...(ustawPowod ? [powod] : []), body.id])
      .run();

    return json({ id: body.id, status: body.status });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
