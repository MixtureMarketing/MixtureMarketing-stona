/**
 * Cloudflare Pages Function: admin/estimation/quote-close
 * Path: /api/admin/estimation/quote-close
 * Auth: dziedziczona z admin/_middleware.ts (rola admin).
 * POST {id, actuals:[{code, hours, note?}]} — godziny rzeczywiste (f3a) do est_actual_hours (0003).
 *
 * Rozdział close/status (decyzja architekta): TEN endpoint NIE rusza statusu — zapisuje wyłącznie
 * fakty. Zamknięcie (won→closed) to osobne przejście (quote-status). Dzięki temu actuale są
 * edytowalne PO zamknięciu (status zostaje `closed`). Guard: tylko wyceny `won`/`closed`.
 * Puste godziny = brak wiersza (kasowanie: „nie mierzyliśmy"). Fakty w est_actual_hours, NIGDY
 * w snapshocie (est_quote_aspects/items) — inwariant 3.
 */
interface Env {
  DB: D1Database;
}

interface Actual {
  code?: string;
  hours?: number | null | '';
  note?: string | null;
}
interface Body {
  id?: number;
  actuals?: Actual[];
}

/** Statusy, dla których godziny rzeczywiste mają sens (projekt przyjęty lub domknięty). */
const MIERZALNE = new Set(['won', 'closed']);

const isEmpty = (h: unknown): boolean => h === null || h === undefined || h === '';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  try {
    const body = (await request.json()) as Body;
    if (!body.id) return json({ error: 'Pole „id" jest wymagane.' }, 400);
    const actuals = body.actuals ?? [];

    const quote = (await env.DB.prepare('SELECT id, status FROM est_quotes WHERE id = ?')
      .bind(body.id)
      .first()) as { id: number; status: string } | null;
    if (!quote) return json({ error: 'Wycena nie istnieje.' }, 404);
    if (!MIERZALNE.has(quote.status)) {
      return json(
        {
          error: `Godziny rzeczywiste dotyczą wyceny wygranej lub zamkniętej, nie „${quote.status}".`,
        },
        409,
      );
    }

    // ── Walidacja PRZED zapisem (atomowość) ──
    const errors: string[] = [];
    for (const a of actuals) {
      if (typeof a.code !== 'string' || a.code.trim() === '') {
        errors.push('Pozycja bez kodu obszaru/itemu.');
        continue;
      }
      if (isEmpty(a.hours)) continue; // pusto = kasowanie, dozwolone
      if (typeof a.hours !== 'number' || !Number.isFinite(a.hours) || a.hours < 0)
        errors.push(`Godziny dla „${a.code}" muszą być liczbą ≥ 0.`);
    }
    if (errors.length > 0) return json({ errors }, 400);

    // ── Batch atomowy: upsert lub kasowanie per pozycja + stempel updated_at ──
    const P = (sql: string) => env.DB.prepare(sql);
    const stmts: D1PreparedStatement[] = [];
    let saved = 0;
    let cleared = 0;
    for (const a of actuals) {
      const code = (a.code as string).trim();
      if (isEmpty(a.hours)) {
        stmts.push(
          P('DELETE FROM est_actual_hours WHERE quote_id = ? AND aspect_code = ?').bind(
            body.id,
            code,
          ),
        );
        cleared++;
      } else {
        stmts.push(
          P(
            `INSERT INTO est_actual_hours (quote_id, aspect_code, hours, note, recorded_at)
             VALUES (?, ?, ?, ?, datetime('now'))
             ON CONFLICT(quote_id, aspect_code) DO UPDATE SET
               hours = excluded.hours, note = excluded.note, recorded_at = datetime('now')`,
          ).bind(body.id, code, a.hours, a.note ?? null),
        );
        saved++;
      }
    }
    stmts.push(P(`UPDATE est_quotes SET updated_at = datetime('now') WHERE id = ?`).bind(body.id));

    await env.DB.batch(stmts);
    return json({ ok: true, saved, cleared });
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
