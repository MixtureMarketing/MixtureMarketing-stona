/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/reply_lead
 * Path: /api/admin/reply_lead
 */

import { escapeHtmlMultiline } from '../_shared/security';
import { sendEmail, emailFailedResponse } from '../_shared/email';
import { serverError } from '../_shared/errors';

interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const { lead_id, email, message } = (await request.json()) as {
      lead_id: string;
      email: string;
      message: string;
    };

    if (!lead_id || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing lead_id, email or message' }), {
        status: 400,
      });
    }

    // 1. NAJPIERW mail — status 'contacted' tylko, gdy odpowiedź faktycznie wyszła.
    const mail = await sendEmail(
      env,
      {
        from: 'Jakub z Mixture Marketing <biuro@mixturemarketing.pl>',
        to: [email],
        subject: 'Odpowiedź na Twoje zapytanie - Mixture Marketing',
        text: message,
        html: `<div style="font-family:sans-serif;line-height:1.6;"><p>Witaj!</p><p>${escapeHtmlMultiline(message)}</p><hr><p>Z poważaniem,<br>Jakub Niedziela<br>Mixture Marketing</p></div>`,
      },
      'reply_lead',
    );
    if (!mail.ok) {
      return emailFailedResponse(
        'Nie udało się wysłać odpowiedzi e-mail — status leada bez zmian. Spróbuj ponownie.',
        mail,
      );
    }

    // 2. Update status in D1
    await env.DB.prepare('UPDATE leads SET status = ? WHERE id = ?')
      .bind('contacted', lead_id)
      .run();

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (err: any) {
    return serverError(err, 'admin/reply_lead');
  }
};
