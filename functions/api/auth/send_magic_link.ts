/**
 * Cloudflare Pages Function: send_magic_link
 * Path: /api/auth/send_magic_link
 */

interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const { email } = (await request.json()) as { email: string };

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
    }

    // 1. Check if user exists
    const user = await env.DB.prepare('SELECT id, name FROM users WHERE email = ? AND is_active = 1')
      .bind(email)
      .first();

    if (!user) {
      // For security, don't reveal if user exists. Just return 200.
      return new Response(JSON.stringify({ status: 'success', note: 'If user exists, link sent' }), { status: 200 });
    }

    // 2. Generate Token
    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    // 3. Save to D1
    await env.DB.prepare('INSERT INTO auth_tokens (email, token, expires_at) VALUES (?, ?, ?)')
      .bind(email, token, expiresAt)
      .run();

    // 4. Send Email via Resend
    if (env.RESEND_API_KEY) {
      const loginUrl = `https://mixturemarketing.pl/portal/verify?token=${token}`;
      
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Mixture Marketing <portal@mixturemarketing.pl>',
          to: [email],
          subject: 'Twój magiczny link do Portalu Klienta',
          html: `
            <h3>Witaj ${user.name}!</h3>
            <p>Kliknij w poniższy przycisk, aby zalogować się do swojego panelu klienta:</p>
            <a href="${loginUrl}" style="background:#000;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">Zaloguj się</a>
            <p>Link jest ważny przez 1 godzinę.</p>
            <p>Jeśli to nie Ty prosiłeś o ten link, zignoruj tę wiadomość.</p>
          `
        })
      });
    }

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
