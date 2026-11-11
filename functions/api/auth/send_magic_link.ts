/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: auth/send_magic_link
 * Path: /api/auth/send_magic_link
 */

import { checkRateLimit } from '../estimation/_rateLimit';
import { clientIp, escapeHtml, sha256Hex } from '../_shared/security';
import { sendEmail, emailFailedResponse } from '../_shared/email';
import { serverError } from '../_shared/errors';

interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
  CACHE?: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const { email } = (await request.json()) as { email: string };

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
    }

    // Limit: per IP (10/h) i per adres (3/15 min) — bez tego endpoint pozwalał zasypywać
    // skrzynki klientów linkami i zużywać limit Resend. KV fail-open.
    if (env.CACHE) {
      const byIp = await checkRateLimit(env.CACHE, clientIp(request), 10, 3600, 'auth:ml:ip:');
      const byEmail = byIp.allowed
        ? await checkRateLimit(
            env.CACHE,
            await sha256Hex(String(email).trim().toLowerCase()),
            3,
            900,
            'auth:ml:to:',
          )
        : byIp;
      if (!byEmail.allowed) {
        return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429 });
      }
    }

    // 1. Check if user exists
    const user = await env.DB.prepare(
      // Po przeniesieniu portalu do Mixture CRM link logowania dostaje tylko admin (podgląd leadów).
      "SELECT id, name FROM users WHERE email = ? AND is_active = 1 AND role = 'admin'",
    )
      .bind(email)
      .first();

    if (!user) {
      // For security, don't reveal if user exists. Just return 200.
      return new Response(
        JSON.stringify({ status: 'success', note: 'If user exists, link sent' }),
        { status: 200 },
      );
    }

    // 2. Generate Token
    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    // 3. Save to D1
    await env.DB.prepare('INSERT INTO auth_tokens (email, token, expires_at) VALUES (?, ?, ?)')
      .bind(email, token, expiresAt)
      .run();

    // 4. Send Email via Resend — logowanie w całości zależy od tego maila, więc
    // porażka (także brak klucza) = 502, a nie „sprawdź skrzynkę” bez linku.
    const loginUrl = `https://mixturemarketing.pl/portal/verify?token=${token}`;
    const mail = await sendEmail(
      env,
      {
        from: 'Mixture Marketing <portal@mixturemarketing.pl>',
        to: [email],
        subject: 'Twój magiczny link do Portalu Klienta',
        html: `
            <h3>Witaj ${escapeHtml(user.name)}!</h3>
            <p>Kliknij w poniższy przycisk, aby zalogować się do swojego panelu klienta:</p>
            <a href="${loginUrl}" style="background:#000;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">Zaloguj się</a>
            <p>Link jest ważny przez 1 godzinę.</p>
            <p>Jeśli to nie Ty prosiłeś o ten link, zignoruj tę wiadomość.</p>
          `,
      },
      'send_magic_link',
    );
    if (!mail.ok) {
      return emailFailedResponse(
        'Nie udało się wysłać linku logowania — spróbuj ponownie za chwilę.',
        mail,
      );
    }

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (err: any) {
    return serverError(err, 'auth/send_magic_link');
  }
};
