/**
 * Cloudflare Pages Function: auth/logout
 * Path: POST /api/auth/logout
 *
 * Wylogowanie po stronie serwera (F12): unieważnia sesję z nagłówka
 * `Authorization: Bearer <session_token>` (czyści users.session_token i
 * session_expires). Wcześniej wylogowanie czyściło tylko localStorage, więc
 * przechwycony token działał do wygaśnięcia (7 dni).
 *
 * Idempotentne: brak/nieznany token → 200 z `revoked: false` (front woła to
 * best-effort i nie czeka na wynik). Nie zdradza, czy token istniał — poza
 * flagą dla posiadacza tego tokenu, co niczego nie ujawnia.
 */

import { serverError } from '../_shared/errors';

interface Env {
  DB: D1Database;
}

// session_token to 32 znaki hex (verify_token) — krótsze wartości odrzucamy,
// żeby pusty/śmieciowy nagłówek nigdy nie trafił do WHERE.
const MIN_TOKEN_LEN = 16;

function bearer(request: Request): string | null {
  const h = request.headers.get('Authorization') ?? '';
  const token = h.startsWith('Bearer ') ? h.slice(7).trim() : '';
  return token.length >= MIN_TOKEN_LEN && token.length <= 200 ? token : null;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const token = bearer(request);
  if (!token) return json({ status: 'success', revoked: false });

  try {
    const res = await env.DB.prepare(
      'UPDATE users SET session_token = NULL, session_expires = NULL WHERE session_token = ?',
    )
      .bind(token)
      .run();
    return json({ status: 'success', revoked: (res.meta?.changes ?? 0) > 0 });
  } catch (err) {
    return serverError(err, 'auth/logout');
  }
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
