/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: portal/update_profile
 * Path: /api/portal/update_profile
 */

import { ValidationError, badRequest, optText, readJsonObject, reqText } from '../_shared/input';

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env, data } = context;
  const user = data.user as { id: number };

  try {
    const body = await readJsonObject(request);
    // name jest NOT NULL; company_name opcjonalne (brak pola → NULL, nie undefined w bind).
    const name = reqText(body.name, 'Imię i nazwisko', 200);
    const company_name = optText(body.company_name, 'Nazwa firmy', 200);

    await env.DB.prepare(
      `
      UPDATE users SET name = ?, company_name = ? WHERE id = ?
    `,
    )
      .bind(name, company_name, user.id)
      .run();

    const updatedUser: any = await env.DB.prepare(
      'SELECT id, email, name, role, company_name FROM users WHERE id = ?',
    )
      .bind(user.id)
      .first();

    return new Response(JSON.stringify({ status: 'success', user: updatedUser }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    if (err instanceof ValidationError) return badRequest(err.message);
    return new Response(err.message, { status: 500 });
  }
};
