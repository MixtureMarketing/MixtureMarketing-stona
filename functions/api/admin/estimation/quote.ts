/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/estimation/quote
 * Path: /api/admin/estimation/quote?id=<id>
 * Auth: dziedziczona z admin/_middleware.ts (rola admin).
 * GET — pojedyncza wycena + zapisane odpowiedzi (resume draftu w wizardzie, f1b).
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

    return json({ quote, answers });
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
