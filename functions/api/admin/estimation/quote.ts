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
    const [aspectsRes, itemsRes, multipliersRes, actualsRes, validityRes] = await Promise.all([
      env.DB.prepare('SELECT * FROM est_quote_aspects WHERE quote_id = ?').bind(id).all(),
      env.DB.prepare('SELECT * FROM est_quote_items WHERE quote_id = ?').bind(id).all(),
      env.DB.prepare('SELECT * FROM est_quote_multipliers WHERE quote_id = ?').bind(id).all(),
      // f3a: godziny rzeczywiste (est_actual_hours) — fundament pod raporty f3b. Read-back
      // formularza zamknięcia (prefill) + eksport. Klucz aspect_code = obszar LUB item (module:/integration:).
      env.DB.prepare('SELECT aspect_code, hours, note FROM est_actual_hours WHERE quote_id = ?')
        .bind(id)
        .all(),
      // f2a: termin ważności oferty — wartość domenowa, więc z est_params (inwariant 2).
      // Świadomie NIE ze snapshotu params_json: to parametr dokumentu, nie obliczeń — zmiana
      // polityki („oferty ważne 14 dni") ma działać na dokumentach generowanych od teraz.
      env.DB.prepare(
        "SELECT key, value FROM est_params WHERE key IN ('offer_validity_days','offer_terms')",
      ).all(),
    ]);
    const params = new Map(
      ((validityRes.results ?? []) as { key: string; value: string }[]).map((r) => [
        r.key,
        r.value,
      ]),
    );
    const validityDays = Number(params.get('offer_validity_days') ?? 30);
    // Warunki oferty: jedna pozycja na `|` (treść żyje w seedach, nie w kodzie).
    const terms = (params.get('offer_terms') ?? '')
      .split('|')
      .map((t) => t.trim())
      .filter(Boolean);

    // f3a: mapa aspect_code → {hours, note} — do prefillu formularza i raportów f3b.
    const actualHours: Record<string, { hours: number; note: string | null }> = {};
    for (const r of (actualsRes.results ?? []) as {
      aspect_code: string;
      hours: number;
      note: string | null;
    }[]) {
      actualHours[r.aspect_code] = { hours: r.hours, note: r.note };
    }

    const snapshot = {
      aspects: aspectsRes.results ?? [],
      items: itemsRes.results ?? [],
      multipliers: multipliersRes.results ?? [],
      actualHours, // f3a: godziny rzeczywiste (closed_at już w `quote` przez SELECT *)
      totals: parseJson((quote as any).totals_json),
      confidenceBreakdown: parseJson((quote as any).confidence_breakdown_json),
      warnings: parseJson((quote as any).warnings_json) ?? [], // f2a: alerty do Karty decyzji
      validityDays: Number.isFinite(validityDays) ? validityDays : 30,
      terms,
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
