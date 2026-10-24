/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/admin_reply_chat
 * Path: /api/admin/admin_reply_chat
 */

import { escapeHtml, escapeHtmlMultiline } from '../_shared/security';
import { sendEmail } from '../_shared/email';
import { chatCacheKey, kvDelete } from '../_shared/kv';
import {
  ValidationError,
  badRequest,
  optId,
  readJsonObject,
  reqId,
  reqText,
} from '../_shared/input';
import { serverError } from '../_shared/errors';

interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  RESEND_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  // Autor odpowiedzi = zalogowany admin (admin/_middleware), nie „id 1” na sztywno.
  const adminId = (context.data?.user as { id?: number } | undefined)?.id ?? null;

  try {
    const body = await readJsonObject(request);
    const user_id = reqId(body.user_id, 'user_id');
    const content = reqText(body.content, 'Treść wiadomości', 10_000);
    const project_id = optId(body.project_id, 'project_id');

    // 1. Save to D1
    await env.DB.prepare(
      `
      INSERT INTO messages (user_id, admin_id, project_id, content, sender_type, is_read)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    )
      .bind(user_id, adminId, project_id, content, 'admin', 0)
      .run();

    // 2. Invalidate KV Cache for this user. Od tego miejsca wiadomość JEST zapisana —
    // nic poniżej nie może skończyć się 500 (ponowienie = duplikat wiadomości).
    await kvDelete(env.CACHE, chatCacheKey(user_id));

    // 3. Send Email Notification to Client via Resend
    const client: any = await env.DB.prepare('SELECT email, name FROM users WHERE id = ?')
      .bind(user_id)
      .first()
      .catch((e: unknown) => {
        console.error('[admin_reply_chat] odczyt klienta po zapisie:', e);
        return null;
      });

    // Wiadomość JEST już zapisana — mail to tylko powiadomienie. Przy porażce nie
    // zwracamy błędu (ponowienie zdublowałoby wiadomość), tylko email_sent:false
    // + ostrzeżenie, które panel pokazuje adminowi.
    const mail = client
      ? await sendEmail(
          env,
          {
            from: 'Jakub z Mixture Marketing <biuro@mixturemarketing.pl>',
            to: [client.email],
            subject: 'Nowa wiadomość w Twoim panelu klienta',
            html: `<p>Witaj ${escapeHtml(client.name)}!</p><p>Otrzymałeś nową wiadomość w panelu klienta:</p><blockquote>${escapeHtmlMultiline(content)}</blockquote><a href="https://mixturemarketing.pl/portal">Zaloguj się, aby odpowiedzieć</a>`,
          },
          'admin_reply_chat',
        )
      : null;

    return new Response(
      JSON.stringify({
        status: 'success',
        email_sent: mail?.ok === true,
        ...(!mail?.ok
          ? {
              warning:
                'Wiadomość zapisana, ale powiadomienie e-mail do klienta NIE zostało wysłane.',
            }
          : {}),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    if (err instanceof ValidationError) return badRequest(err.message);
    return serverError(err, 'admin/admin_reply_chat');
  }
};
