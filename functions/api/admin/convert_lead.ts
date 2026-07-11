/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/convert_lead
 * Converts a lead into a client user.
 * Path: /api/admin/convert_lead
 */

interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const { lead_id } = (await request.json()) as { lead_id: string };

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
        .bind(lead.email, lead.name, lead.website || '', 'client', 1)
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

    // 4. Send Welcome Email via Resend
    if (env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Jakub z Mixture Marketing <biuro@mixturemarketing.pl>',
          to: [lead.email],
          subject: 'Twoje konto w portalu Mixture Marketing jest gotowe!',
          html: `
            <h3>Witaj ${lead.name}!</h3>
            <p>Z radością informujemy, że utworzyliśmy dla Ciebie konto w naszym portalu klienta.</p>
            <p>Możesz się tam zalogować w każdej chwili, używając swojego adresu email, aby sprawdzić postępy prac lub pobrać dokumenty.</p>
            <a href="https://mixturemarketing.pl/portal" style="background:#000;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">Przejdź do Portalu</a>
          `,
        }),
      });
    }

    return new Response(JSON.stringify({ status: 'success', user_id: user.id }), { status: 200 });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
};
