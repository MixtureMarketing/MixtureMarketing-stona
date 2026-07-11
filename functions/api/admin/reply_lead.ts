/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/reply_lead
 * Path: /api/admin/reply_lead
 */

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

    // 1. Update status in D1
    await env.DB.prepare('UPDATE leads SET status = ? WHERE id = ?')
      .bind('contacted', lead_id)
      .run();

    // 2. Send Email via Resend
    if (env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Jakub z Mixture Marketing <biuro@mixturemarketing.pl>',
          to: [email],
          subject: 'Odpowiedź na Twoje zapytanie - Mixture Marketing',
          text: message,
          html: `<div style="font-family:sans-serif;line-height:1.6;"><p>Witaj!</p><p>${message.replace(/\n/g, '<br>')}</p><hr><p>Z poważaniem,<br>Jakub Niedziela<br>Mixture Marketing</p></div>`,
        }),
      });
    }

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
};
