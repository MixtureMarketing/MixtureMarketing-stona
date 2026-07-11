/**
 * Cloudflare Pages Function: audit/capture-lead
 * Path: /api/audit/capture-lead
 *
 * Zapis leada z audytu 360 (source='audit') do D1 + opcjonalne powiadomienie
 * e-mail do agencji (Resend). Wywolywane po przejsciu bramki e-mail w kreatorze.
 * Wzorowane na functions/api/calculator-submit.ts (ten sam styl insertu do `leads`).
 */

interface Env {
  DB: D1Database;
  RESEND_API_KEY?: string;
  NOTIFY_EMAIL?: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function notify(env: Env, email: string, url: string, score?: number) {
  if (!env.RESEND_API_KEY || !env.NOTIFY_EMAIL) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Mixture Marketing <noreply@mixturemarketing.pl>',
        to: env.NOTIFY_EMAIL,
        subject: `🔎 Nowy lead z audytu 360 — ${email}`,
        html: `<p>Użytkownik <strong>${email}</strong> ukończył audyt strony
               <a href="${url}">${url}</a>${
                 typeof score === 'number' ? ` (wynik: <strong>${score}/100</strong>)` : ''
               }.</p>`,
      }),
    });
  } catch (e) {
    console.error('audit lead notify failed:', e);
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = (await request.json()) as {
      email?: string;
      url?: string;
      companyName?: string;
      score?: number;
      details?: Record<string, unknown>;
    };
    const { email, url, companyName, score, details } = body;

    if (!email || !url) {
      return json({ status: 'error', message: 'email i url są wymagane' }, 400);
    }

    const id = crypto.randomUUID();
    try {
      await env.DB.prepare(
        `INSERT INTO leads (id, email, name, company, website, source, source_url, details, status)
         VALUES (?, ?, ?, ?, ?, 'audit', ?, ?, 'new')`,
      )
        .bind(
          id,
          email,
          companyName || 'Lead z audytu',
          companyName || null,
          url,
          url,
          JSON.stringify({ score, ...(details || {}) }),
        )
        .run();
    } catch (e) {
      console.error('D1 insert audit lead failed:', e);
      return json({ status: 'error', message: 'DB error' }, 500);
    }

    await notify(env, email, url, score);

    return json({ status: 'success', id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return json({ status: 'error', message }, 500);
  }
};
