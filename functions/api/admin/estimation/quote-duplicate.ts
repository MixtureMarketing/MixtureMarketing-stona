/**
 * Cloudflare Pages Function: admin/estimation/quote-duplicate
 * Path: /api/admin/estimation/quote-duplicate
 * Auth: dziedziczona z admin/_middleware.ts (rola admin).
 * POST {id, name?} — rewizja wyceny: NOWY draft z odpowiedziami źródłowej.
 *
 * Po co: „klient prosi o poprawkę, ale wysłanej wersji nie wolno ruszyć" (docs/02 — edycja
 * merytoryczna tylko w draft/review, `sent+` zmieniamy przez duplikację).
 *
 * Kopiujemy WEJŚCIE (odpowiedzi, archetyp, klient), nie WYNIK. Snapshot, status, daty
 * i dokumenty zostają przy źródle — duplikat ma je dostać dopiero z własnego finalize.
 * Snapshot skopiowany do draftu udawałby wynik, którego nikt nie policzył.
 */
import { ENGINE_VERSION } from '../../../../lib/estimation/engine';

interface Env {
  DB: D1Database;
}

interface Body {
  id?: number;
  name?: string;
}

interface QuoteRow {
  id: number;
  name: string;
  lead_id: string | null;
  project_id: number | null;
  client_name: string | null;
  archetype_code: string;
  archetype_recommended: string | null;
  archetype_reason: string | null;
}

/**
 * „Sklep" → „Sklep (rev 2)", „Sklep (rev 2)" → „Sklep (rev 3)".
 * Bez tego rewizja rewizji nazywałaby się „Sklep (rev 2) (rev 2)" i po trzech rundach
 * nikt by nie wiedział, która jest która.
 */
export function nazwaRewizji(nazwa: string): string {
  const m = nazwa.match(/^(.*) \(rev (\d+)\)$/);
  return m ? `${m[1]} (rev ${Number(m[2]) + 1})` : `${nazwa} (rev 2)`;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  try {
    const body = (await request.json()) as Body;
    if (!body.id) return json({ error: 'Pole „id" jest wymagane.' }, 400);

    const zrodlo = (await env.DB.prepare(
      `SELECT id, name, lead_id, project_id, client_name, archetype_code,
              archetype_recommended, archetype_reason
         FROM est_quotes WHERE id = ?`,
    )
      .bind(body.id)
      .first()) as QuoteRow | null;
    if (!zrodlo) return json({ error: 'Wycena nie istnieje.' }, 404);

    // Duplikować wolno z KAŻDEGO statusu — także z draftu („a co, gdyby inaczej").
    // Nie ma tu czego chronić: źródła nie dotykamy.

    // Świeże parametry, jak przy tworzeniu wyceny (quotes.ts). NIE params_json źródła:
    // to nowa wycena, powstaje dziś i policzy się dzisiejszą stawką.
    const paramsRes = await env.DB.prepare('SELECT key, value FROM est_params').all();
    const params: Record<string, string> = {};
    for (const row of (paramsRes.results ?? []) as { key: string; value: string }[]) {
      params[row.key] = row.value;
    }
    const hourlyRate = Number(params.hourly_rate ?? 50);

    const inserted = await env.DB.prepare(
      `INSERT INTO est_quotes
         (name, lead_id, project_id, client_name, archetype_code, archetype_recommended,
          archetype_reason, status, hourly_rate, params_json, engine_version)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)`,
    )
      .bind(
        body.name?.trim() || nazwaRewizji(zrodlo.name),
        zrodlo.lead_id,
        zrodlo.project_id,
        zrodlo.client_name,
        zrodlo.archetype_code,
        zrodlo.archetype_recommended,
        zrodlo.archetype_reason,
        hourlyRate,
        JSON.stringify(params),
        ENGINE_VERSION,
      )
      .run();
    const nowyId = inserted.meta.last_row_id as number;

    const odp = await env.DB.prepare(
      'SELECT question_code, answer_json FROM est_quote_answers WHERE quote_id = ?',
    )
      .bind(body.id)
      .all();
    const wiersze = (odp.results ?? []) as { question_code: string; answer_json: string }[];
    if (wiersze.length) {
      await env.DB.batch(
        wiersze.map((r) =>
          env.DB.prepare(
            'INSERT INTO est_quote_answers (quote_id, question_code, answer_json) VALUES (?, ?, ?)',
          ).bind(nowyId, r.question_code, r.answer_json),
        ),
      );
    }

    return json({ id: nowyId, status: 'draft', source_id: body.id, answers: wiersze.length });
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
