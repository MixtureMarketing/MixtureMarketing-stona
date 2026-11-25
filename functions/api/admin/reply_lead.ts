/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/reply_lead
 * Path: /api/admin/reply_lead
 */

import { leadReplyEmail } from '../_shared/emailMessages';
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
        ...leadReplyEmail(message),
      },
      'reply_lead',
    );
    if (!mail.ok) {
      return emailFailedResponse(
        'Nie udało się wysłać odpowiedzi e-mail — status leada bez zmian. Spróbuj ponownie.',
        mail,
      );
    }

    // 2. Status new → contacted. Tylko z 'new': odpowiedź do leada już
    // skonwertowanego cofała go na „Kontakt”, a ponowne „Zrób Klienta” wysyłało
    // drugi mail powitalny.
    await env.DB.prepare(
      "UPDATE leads SET status = 'contacted' WHERE id = ? AND (status IS NULL OR status = 'new')",
    )
      .bind(lead_id)
      .run();

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (err: any) {
    return serverError(err, 'admin/reply_lead');
  }
};
