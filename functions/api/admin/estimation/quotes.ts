/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/estimation/quotes
 * Path: /api/admin/estimation/quotes
 * Auth: dziedziczona z functions/api/admin/_middleware.ts (rola admin; klient → 403).
 * GET  — lista wycen (F0).
 * POST — utworzenie draftu wyceny wraz z KOMPLETEM odpowiedzi neutralnych (f1a, krok Platforma).
 * PUT  — autosave odpowiedzi / pól archetypu na draftcie (f1a; pełny per-odpowiedź autosave w f1b).
 */
import { ENGINE_VERSION } from '../../../../lib/estimation/engine';

interface Env {
  DB: D1Database;
}

const LIST_QUERY = `
  SELECT id, name, client_name, archetype_code, status, confidence, engine_version,
         created_at, updated_at
  FROM est_quotes
  ORDER BY created_at DESC
`;

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const quotes = await context.env.DB.prepare(LIST_QUERY).all();
    return json({ quotes: quotes.results ?? [] });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};

interface CreateBody {
  name?: string;
  lead_id?: string | null;
  client_name?: string | null;
  archetype_code?: string;
  archetype_recommended?: string | null;
  archetype_reason?: string | null;
  answers?: Record<string, unknown>;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  try {
    const body = (await request.json()) as CreateBody;

    // Draft powstaje dopiero po wyborze archetypu (est_quotes.archetype_code NOT NULL).
    if (!body.name?.trim()) return json({ error: 'Pole „name" jest wymagane.' }, 400);
    if (!body.archetype_code?.trim())
      return json({ error: 'Pole „archetype_code" jest wymagane.' }, 400);

    // Snapshot parametrów (03) — wycena samowystarczalna od utworzenia.
    const paramsRes = await env.DB.prepare('SELECT key, value FROM est_params').all();
    const params: Record<string, string> = {};
    for (const row of (paramsRes.results ?? []) as { key: string; value: string }[]) {
      params[row.key] = row.value;
    }
    const hourlyRate = Number(params.hourly_rate ?? 50);

    const inserted = await env.DB.prepare(
      `INSERT INTO est_quotes
         (name, lead_id, client_name, archetype_code, archetype_recommended, archetype_reason,
          status, hourly_rate, params_json, engine_version)
       VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)`,
    )
      .bind(
        body.name.trim(),
        body.lead_id ?? null,
        body.client_name ?? null,
        body.archetype_code.trim(),
        body.archetype_recommended ?? null,
        body.archetype_reason ?? null,
        hourlyRate,
        JSON.stringify(params),
        ENGINE_VERSION,
      )
      .run();

    const quoteId = inserted.meta.last_row_id as number;

    // KOMPLET odpowiedzi neutralnych zapisywany razem z draftem (batch = jedna transakcja).
    const answers = body.answers ?? {};
    const answerStmts = Object.entries(answers).map(([code, value]) =>
      env.DB.prepare(
        'INSERT INTO est_quote_answers (quote_id, question_code, answer_json) VALUES (?, ?, ?)',
      ).bind(quoteId, code, JSON.stringify(value)),
    );
    if (answerStmts.length > 0) await env.DB.batch(answerStmts);

    return json({ id: quoteId, status: 'draft', engine_version: ENGINE_VERSION }, 201);
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};

interface UpdateBody {
  id?: number;
  name?: string;
  client_name?: string | null;
  archetype_code?: string;
  archetype_recommended?: string | null;
  archetype_reason?: string | null;
  answers?: Record<string, unknown>;
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  try {
    const body = (await request.json()) as UpdateBody;
    if (!body.id) return json({ error: 'Pole „id" jest wymagane.' }, 400);

    // Edycja tylko na draftcie (sent+ przez duplikację — 02 zasada spójności 3).
    const fields: string[] = [];
    const binds: unknown[] = [];
    const set = (col: string, val: unknown) => {
      fields.push(`${col} = ?`);
      binds.push(val);
    };
    if (body.name !== undefined) set('name', body.name);
    if (body.client_name !== undefined) set('client_name', body.client_name);
    if (body.archetype_code !== undefined) set('archetype_code', body.archetype_code);
    if (body.archetype_recommended !== undefined)
      set('archetype_recommended', body.archetype_recommended);
    if (body.archetype_reason !== undefined) set('archetype_reason', body.archetype_reason);

    if (fields.length > 0) {
      fields.push(`updated_at = datetime('now')`);
      binds.push(body.id);
      await env.DB.prepare(
        `UPDATE est_quotes SET ${fields.join(', ')} WHERE id = ? AND status = 'draft'`,
      )
        .bind(...binds)
        .run();
    }

    const answers = body.answers ?? {};
    const answerStmts = Object.entries(answers).map(([code, value]) =>
      env.DB.prepare(
        `INSERT INTO est_quote_answers (quote_id, question_code, answer_json) VALUES (?, ?, ?)
         ON CONFLICT(quote_id, question_code) DO UPDATE SET answer_json = excluded.answer_json`,
      ).bind(body.id, code, JSON.stringify(value)),
    );
    if (answerStmts.length > 0) await env.DB.batch(answerStmts);

    return json({ ok: true });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
