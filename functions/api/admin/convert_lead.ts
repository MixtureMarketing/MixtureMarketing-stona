/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/convert_lead
 * Converts a lead into a client user.
 * Path: /api/admin/convert_lead
 */

import { escapeHtml } from '../_shared/security';
import { sendEmail } from '../_shared/email';
import { ValidationError, badRequest, readJsonObject, reqText } from '../_shared/input';

interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = await readJsonObject(request);
    const lead_id = reqText(body.lead_id, 'lead_id', 100);

    // 1. Get Lead
    const lead: any = await env.DB.prepare('SELECT * FROM leads WHERE id = ?')
      .bind(lead_id)
      .first();
    if (!lead) return new Response('Lead not found', { status: 404 });

    // 2. Check if user already exists
    let user: any = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
      .bind(lead.email)
      .first();

    if (!user) {
      // Create new user
      await env.DB.prepare(
        `
        INSERT INTO users (email, name, company_name, role, is_active)
        VALUES (?, ?, ?, ?, ?)
      `,
      )
        // users.name jest NOT NULL, a leads.name bywa puste (np. lead z audytu) →
        // fallback na e-mail. Firma: kolumna `company`, dopiero potem strona www.
        .bind(
          lead.email,
          lead.name || lead.email,
          lead.company || lead.website || null,
          'client',
          1,
        )
        .run();

      // Get the newly created ID
      const newUser: any = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
        .bind(lead.email)
        .first();
      user = { id: newUser.id };
    }

    // 3. Update Lead status
    await env.DB.prepare('UPDATE leads SET status = ?, user_id = ? WHERE id = ?')
      .bind('converted', user.id, lead_id)
      .run();

    // 4. Mail powitalny. Konto JUŻ istnieje — przy porażce maila nie zwracamy błędu
    // (konwersja się udała), tylko email_sent:false + ostrzeżenie dla admina.
    const mail = await sendEmail(
      env,
      {
        from: 'Jakub z Mixture Marketing <biuro@mixturemarketing.pl>',
        to: [lead.email],
        subject: 'Twoje konto w portalu Mixture Marketing jest gotowe!',
        html: `
            <h3>Witaj ${escapeHtml(lead.name)}!</h3>
            <p>Z radością informujemy, że utworzyliśmy dla Ciebie konto w naszym portalu klienta.</p>
            <p>Możesz się tam zalogować w każdej chwili, używając swojego adresu email, aby sprawdzić postępy prac lub pobrać dokumenty.</p>
            <a href="https://mixturemarketing.pl/portal" style="background:#000;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">Przejdź do Portalu</a>
          `,
      },
      'convert_lead',
    );

    return new Response(
      JSON.stringify({
        status: 'success',
        user_id: user.id,
        email_sent: mail.ok,
        ...(mail.ok
          ? {}
          : {
              warning:
                'Konto utworzone, ale mail powitalny NIE został wysłany — poinformuj klienta ręcznie.',
            }),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    if (err instanceof ValidationError) return badRequest(err.message);
    console.error('[convert_lead]', err?.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
