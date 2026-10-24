/**
 * Cloudflare Pages Function: admin/save_project
 * Path: /api/admin/save_project
 *
 * Bez `id` → INSERT (nowy projekt), z `id` → UPDATE tylko pól obecnych w body.
 * Pola nieruszone w formularzu (JSON gubi undefined) nie mogą trafić do .bind()
 * jako undefined — D1 rzuca wtedy D1_TYPE_ERROR i zapis kończył się 500.
 */

import {
  ValidationError,
  badRequest,
  buildUpdate,
  intInRange,
  optId,
  optText,
  readJsonObject,
  reqId,
  reqText,
} from '../_shared/input';
import { serverError } from '../_shared/errors';

interface Env {
  DB: D1Database;
}

const text =
  (label: string, max = 500) =>
  (v: unknown) =>
    optText(v, label, max);

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const data = await readJsonObject(request);
    const id = optId(data.id, 'id');

    // Typ i status: formularz pokazuje domyślnie „web”/„pending”, ale nie wysyła
    // ich, jeśli admin ich nie zmienił — stąd fallbacki (a nie odrzucenie).
    // Nieznana wartość (np. dawny typ z bazy) jest przepuszczana jako tekst.
    const typeOf = (v: unknown) => reqText(v, 'Typ projektu', 50);
    const statusOf = (v: unknown) => reqText(v, 'Status', 50);

    if (id) {
      const { sets, values } = buildUpdate(data, {
        user_id: (v) => reqId(v, 'Klient'),
        name: (v) => reqText(v, 'Nazwa projektu', 200),
        type: typeOf,
        status: statusOf,
        progress: (v) => intInRange(v, 'Postęp', 0, 100, 0),
        drive_link: text('Link do Drive', 1000),
        next_milestone: text('Następny krok', 500),
        next_milestone_date: text('Data następnego kroku', 50),
        budget: text('Budżet', 100),
      });
      if (sets.length === 0) return badRequest('Brak pól do zapisania.');

      const res = await env.DB.prepare(
        `UPDATE projects SET ${sets.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
      )
        .bind(...values, id)
        .run();
      if (!res.meta?.changes) return badRequest('Projekt nie istnieje.', 404);
      return json({ status: 'success', id });
    }

    // INSERT
    const res = await env.DB.prepare(
      `
      INSERT INTO projects (user_id, name, type, status, progress, drive_link, next_milestone, next_milestone_date, budget)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    )
      .bind(
        reqId(data.user_id, 'Klient'),
        reqText(data.name, 'Nazwa projektu', 200),
        data.type === undefined || data.type === '' ? 'web' : typeOf(data.type),
        data.status === undefined || data.status === '' ? 'pending' : statusOf(data.status),
        intInRange(data.progress, 'Postęp', 0, 100, 0),
        optText(data.drive_link, 'Link do Drive', 1000),
        optText(data.next_milestone, 'Następny krok', 500),
        optText(data.next_milestone_date, 'Data następnego kroku', 50),
        optText(data.budget, 'Budżet', 100),
      )
      .run();

    return json({ status: 'success', id: res.meta?.last_row_id ?? null });
  } catch (err: unknown) {
    if (err instanceof ValidationError) return badRequest(err.message);
    return serverError(err, 'admin/save_project');
  }
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
