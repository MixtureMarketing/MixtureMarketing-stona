/**
 * Cloudflare Pages Function: admin/save_milestone
 * Path: /api/admin/save_milestone
 *
 * Bez `id` (albo id '') → INSERT, z `id` → UPDATE tylko pól obecnych w body.
 * Żadne pole z body nie trafia do .bind() jako undefined (D1_TYPE_ERROR → 500).
 */

import {
  ValidationError,
  badRequest,
  buildUpdate,
  intInRange,
  oneOf,
  optId,
  optText,
  readJsonObject,
  reqId,
  reqText,
} from '../_shared/input';

interface Env {
  DB: D1Database;
}

const MILESTONE_STATUSES = ['pending', 'accepted', 'corrections'] as const;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const data = await readJsonObject(request);
    const id = optId(data.id, 'id');

    if (id) {
      const { sets, values } = buildUpdate(data, {
        title: (v) => reqText(v, 'Tytuł etapu', 200),
        description: (v) => optText(v, 'Opis prac', 5000),
        due_date: (v) => optText(v, 'Termin', 50) || null,
        status: (v) => oneOf(v, MILESTONE_STATUSES, 'Status', 'pending'),
        order_index: (v) => intInRange(v, 'Kolejność', 0, 100000, 0),
      });
      if (sets.length === 0) return badRequest('Brak pól do zapisania.');

      const res = await env.DB.prepare(`UPDATE milestones SET ${sets.join(', ')} WHERE id = ?`)
        .bind(...values, id)
        .run();
      if (!res.meta?.changes) return badRequest('Etap nie istnieje.', 404);
      return json({ status: 'success', id });
    }

    // INSERT
    const res = await env.DB.prepare(
      `
      INSERT INTO milestones (project_id, title, description, due_date, status, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    )
      .bind(
        reqId(data.project_id, 'Projekt'),
        reqText(data.title, 'Tytuł etapu', 200),
        optText(data.description, 'Opis prac', 5000),
        optText(data.due_date, 'Termin', 50) || null,
        oneOf(data.status, MILESTONE_STATUSES, 'Status', 'pending'),
        intInRange(data.order_index, 'Kolejność', 0, 100000, 0),
      )
      .run();

    return json({ status: 'success', id: res.meta?.last_row_id ?? null });
  } catch (err: unknown) {
    if (err instanceof ValidationError) return badRequest(err.message);
    return new Response(err instanceof Error ? err.message : String(err), { status: 500 });
  }
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
