/**
 * Cloudflare Pages Function: admin/save_client
 * Path: /api/admin/save_client
 *
 * Bez `id` → INSERT nowego klienta (przycisk „Dodaj Klienta” w panelu — wcześniej
 * endpoint wymagał id, więc dodanie klienta z UI zawsze kończyło się 400).
 * Z `id` → UPDATE tylko pól obecnych w body (name, email, company_name, is_active).
 */

import {
  ValidationError,
  badRequest,
  buildUpdate,
  optId,
  optText,
  readJsonObject,
  reqEmail,
  reqText,
} from '../_shared/input';
import { serverError } from '../_shared/errors';

interface Env {
  DB: D1Database;
}

const isUniqueEmailError = (err: unknown) =>
  err instanceof Error && /UNIQUE constraint failed: users\.email/i.test(err.message);

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const data = await readJsonObject(request);
    const id = optId(data.id, 'id');

    if (id) {
      const { sets, values } = buildUpdate(data, {
        name: (v) => reqText(v, 'Imię i nazwisko', 200),
        email: (v) => reqEmail(v),
        company_name: (v) => optText(v, 'Nazwa firmy', 200),
        is_active: (v) => (v === true || v === 1 || v === '1' ? 1 : 0),
      });
      if (sets.length === 0) return badRequest('Brak pól do zapisania.');

      // Tylko konta klientów — panel nie może przez ten endpoint edytować admina.
      const res = await env.DB.prepare(
        `UPDATE users SET ${sets.join(', ')} WHERE id = ? AND role = 'client'`,
      )
        .bind(...values, id)
        .run();
      if (!res.meta?.changes) return badRequest('Klient nie istnieje.', 404);
      return json({ status: 'success', id });
    }

    // INSERT — nowy klient jest od razu aktywny (logowanie magic linkiem na e-mail).
    const res = await env.DB.prepare(
      `INSERT INTO users (email, name, company_name, role, is_active) VALUES (?, ?, ?, 'client', ?)`,
    )
      .bind(
        reqEmail(data.email),
        reqText(data.name, 'Imię i nazwisko', 200),
        optText(data.company_name, 'Nazwa firmy', 200),
        data.is_active === undefined ? 1 : data.is_active ? 1 : 0,
      )
      .run();

    return json({ status: 'success', id: res.meta?.last_row_id ?? null });
  } catch (err: unknown) {
    if (err instanceof ValidationError) return badRequest(err.message);
    if (isUniqueEmailError(err)) {
      return badRequest('Konto z tym adresem e-mail już istnieje.', 409);
    }
    return serverError(err, 'admin/save_client');
  }
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
