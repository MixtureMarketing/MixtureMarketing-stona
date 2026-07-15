/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/estimation/quote
 * Path: /api/admin/estimation/quote?id=<id>
 * Auth: dziedziczona z admin/_middleware.ts (rola admin).
 * GET — pojedyncza wycena + zapisane odpowiedzi (resume draftu, f1b) ORAZ snapshot po finalize
 * (est_quote_aspects/items/multipliers + sparsowane totals/confidence, f1c) — ekran wyniku czyta
 * autorytatywny zapis z D1, nie stan lokalny UI (read-back, f1c #6).
 */

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return json({ error: 'Brak parametru id.' }, 400);

    const quote = await env.DB.prepare('SELECT * FROM est_quotes WHERE id = ?').bind(id).first();
    if (!quote) return json({ error: 'Wycena nie istnieje.' }, 404);

    const answersRes = await env.DB.prepare(
      'SELECT question_code, answer_json FROM est_quote_answers WHERE quote_id = ?',
    )
      .bind(id)
      .all();

    const answers: Record<string, unknown> = {};
    for (const row of (answersRes.results ?? []) as {
      question_code: string;
      answer_json: string;
    }[]) {
      try {
        answers[row.question_code] = JSON.parse(row.answer_json);
      } catch {
        answers[row.question_code] = row.answer_json;
      }
    }

    // Snapshot warstwy wyceny (obecny dopiero po finalize). Read-back ekranu wyniku (f1c #6).
    const [aspectsRes, itemsRes, multipliersRes] = await Promise.all([
      env.DB.prepare('SELECT * FROM est_quote_aspects WHERE quote_id = ?').bind(id).all(),
      env.DB.prepare('SELECT * FROM est_quote_items WHERE quote_id = ?').bind(id).all(),
      env.DB.prepare('SELECT * FROM est_quote_multipliers WHERE quote_id = ?').bind(id).all(),
    ]);
    const snapshot = {
      aspects: aspectsRes.results ?? [],
      items: itemsRes.results ?? [],
      multipliers: multipliersRes.results ?? [],
      totals: parseJson((quote as any).totals_json),
      confidenceBreakdown: parseJson((quote as any).confidence_breakdown_json),
    };

    return json({ quote, answers, snapshot });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
};

function parseJson(v: unknown): unknown {
  if (typeof v !== 'string' || v === '') return null;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
