/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: portal/send_message
 * Path: /api/portal/send_message
 */

import { escapeHtml, escapeHtmlMultiline } from '../_shared/security';
import { sendEmail } from '../_shared/email';
import { chatCacheKey, kvDelete } from '../_shared/kv';
import { serverError } from '../_shared/errors';
import { ValidationError, badRequest, optId, readJsonObject, reqText } from '../_shared/input';

const MESSAGE_MAX = 10_000;

interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  RESEND_API_KEY: string;
  NOTIFY_EMAIL: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env, data } = context;
  const user = data.user as { id: number; name: string };

  try {
    const body = await readJsonObject(request);
    const content = reqText(body.content, 'Treść wiadomości', MESSAGE_MAX);
    const project_id = optId(body.project_id, 'project_id');

    // project_id z body musi należeć do zalogowanego klienta — inaczej klient
    // mógł przypiąć wiadomość do cudzego projektu (F11).
    if (project_id !== null) {
      const own = await env.DB.prepare('SELECT 1 AS ok FROM projects WHERE id = ? AND user_id = ?')
        .bind(project_id, user.id)
        .first();
      if (!own) return badRequest('Brak dostępu do tego projektu.', 403);
    }

    // 1. Save to D1
    await env.DB.prepare(
      `
      INSERT INTO messages (user_id, project_id, content, sender_type, is_read)
      VALUES (?, ?, ?, ?, ?)
    `,
    )
      .bind(user.id, project_id, content, 'client', 0)
      .run();

    // 2. Invalidate KV Cache. Wiadomość JEST już w D1 — błąd KV (np. limit zapisów)
    // nie może dać 500, bo ponowienie przez klienta zdublowałoby wiadomość.
    await kvDelete(env.CACHE, chatCacheKey(user.id));

    // 3. Powiadomienie agencji. Wiadomość JEST już zapisana i widoczna w panelu,
    // więc porażka maila nie jest błędem dla klienta (ponowienie zdublowałoby
    // wiadomość) — ale ląduje w Workers Logs (sendEmail → console.error).
    await sendEmail(
      env,
      {
        from: 'Mixture Marketing <portal@mixturemarketing.pl>',
        to: [env.NOTIFY_EMAIL],
        subject: `Nowa wiadomość od ${String(user.name ?? '').replace(/[\r\n]+/g, ' ')}`,
        html: `<p>Użytkownik <strong>${escapeHtml(user.name)}</strong> wysłał nową wiadomość:</p><blockquote>${escapeHtmlMultiline(content)}</blockquote>`,
      },
      'portal_send_message',
    );

    return new Response(JSON.stringify({ status: 'success' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    if (err instanceof ValidationError) return badRequest(err.message);
    return serverError(err, 'portal/send_message');
  }
};
