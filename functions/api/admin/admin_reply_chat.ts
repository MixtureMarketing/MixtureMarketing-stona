/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/admin_reply_chat
 * Path: /api/admin/admin_reply_chat
 */

import { escapeHtml, escapeHtmlMultiline } from '../_shared/security';
import { sendEmail } from '../_shared/email';

interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  RESEND_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const { user_id, content, project_id } = (await request.json()) as {
      user_id: number;
      content: string;
      project_id?: number;
    };

    if (!user_id || !content) {
      return new Response('Missing user_id or content', { status: 400 });
    }

    // 1. Save to D1
    await env.DB.prepare(
      `
      INSERT INTO messages (user_id, admin_id, project_id, content, sender_type, is_read)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    )
      .bind(user_id, 1, project_id || null, content, 'admin', 0)
      .run();

    // 2. Invalidate KV Cache for this user
    await env.CACHE.delete(`chat_history_${user_id}`);

    // 3. Send Email Notification to Client via Resend
    const client: any = await env.DB.prepare('SELECT email, name FROM users WHERE id = ?')
      .bind(user_id)
      .first();

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
        ...(mail && !mail.ok
          ? {
              warning:
                'Wiadomość zapisana, ale powiadomienie e-mail do klienta NIE zostało wysłane.',
            }
          : {}),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    console.error('[admin_reply_chat]', err?.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
