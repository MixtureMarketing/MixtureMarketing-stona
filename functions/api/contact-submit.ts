/**
 * Cloudflare Pages Function: contact form backend.
 *
 * Route: POST /api/contact-submit
 *
 * Przepływ:
 *   1) Klient (leadService.ts) wysyła JSON {action, lead, details, ...}
 *   2) Funkcja weryfikuje Turnstile token (Cloudflare) — odrzuca boty
 *   3) Wysyła e-mail powiadomienia do NOTIFY_EMAIL przez Resend API
 *   4) Zwraca {success, id} — kod 200/400/403
 *
 * Env vars wymagane w CF Pages (Production):
 *   - TURNSTILE_SECRET    — secret key widgetu Turnstile (encrypted)
 *   - RESEND_API_KEY      — klucz API Resend.com (encrypted)
 *   - NOTIFY_EMAIL        — adres docelowy powiadomień (plain text)
 *
 * Compat: zachowujemy strukturę API zgodną z poprzednim /api/contact_submit.php,
 * żeby leadService.ts nie wymagał zmian (action: 'create'|'update'|'send_notification'|'get_lead').
 */

interface Env {
  TURNSTILE_SECRET: string;
  RESEND_API_KEY: string;
  NOTIFY_EMAIL: string;
}

interface LeadPayload {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  service_interest?: string;
  captcha_token?: string;
  website_verify?: string;
  [k: string]: unknown;
}

interface RequestBody {
  action: 'create' | 'update' | 'send_notification' | 'get_lead';
  lead?: LeadPayload;
  id?: string;
  details?: Record<string, unknown>;
  step?: number;
  type?: 'abandoned_step_1' | 'abandoned_step_2' | 'success';
  source_url?: string;
  website_verify?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://mixturemarketing.pl',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });

async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  // Bypass dla zaufanych pseudo-tokenów (zachowuje compat z leadService.ts).
  if (token === 'local_bypass' || token === 'existing_lead_verified') return true;
  if (!token || !secret) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendEmail(
  env: Env,
  subject: string,
  html: string,
  replyTo?: string,
): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Mixture Marketing <leads@mixturemarketing.pl>',
        to: [env.NOTIFY_EMAIL],
        subject,
        html,
        reply_to: replyTo,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function leadEmailHtml(lead: LeadPayload, details: Record<string, unknown> = {}): string {
  const rows = Object.entries({ ...lead, ...details })
    .filter(
      ([k, v]) =>
        v && !['captcha_token', 'website_verify', 'id'].includes(k) && typeof v !== 'object',
    )
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:600">${escapeHtml(
          k,
        )}</td><td style="padding:6px 12px;border-bottom:1px solid #eee">${escapeHtml(v)}</td></tr>`,
    )
    .join('');
  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;color:#222">
    <h1 style="color:#4f46e5">Nowy lead z formularza</h1>
    <p>Lead ID: <code>${escapeHtml(lead.id)}</code></p>
    <table style="border-collapse:collapse;width:100%;max-width:600px">${rows}</table>
    <p style="color:#888;font-size:12px;margin-top:24px">Mixture Marketing — automatyczne powiadomienie</p>
  </body></html>`;
}

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { status: 204, headers: CORS_HEADERS });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return json({ message: 'Niepoprawny JSON' }, 400);
  }

  // Honeypot — bot wypełniający niewidzialne pole.
  if (body.lead?.website_verify || body.website_verify) {
    return json({ message: 'Spam detected' }, 403);
  }

  const ip = request.headers.get('cf-connecting-ip') || '';

  switch (body.action) {
    case 'create': {
      if (!body.lead?.name || !body.lead?.email) {
        return json({ message: 'Brak wymaganych pól (name, email)' }, 400);
      }
      const ok = await verifyTurnstile(body.lead.captcha_token || '', env.TURNSTILE_SECRET, ip);
      if (!ok) return json({ message: 'Weryfikacja captcha nieudana' }, 403);

      // Powiadomienie do agencji (fire-and-forget, ale czekamy żeby zgłosić ewentualny błąd).
      const subject = `🆕 Nowy lead — ${body.lead.name} (${body.lead.service_interest || 'general'})`;
      await sendEmail(env, subject, leadEmailHtml(body.lead), body.lead.email);

      return json({ success: true, id: body.lead.id });
    }

    case 'update': {
      // Update nie wymaga captcha (lead już zweryfikowany). Wysyłamy email gdy step=3 (final).
      if (body.step === 3 && body.id) {
        const subject = `📝 Aktualizacja leada ${body.id} (step ${body.step})`;
        await sendEmail(env, subject, leadEmailHtml({ id: body.id }, body.details || {}));
      }
      return json({ success: true });
    }

    case 'send_notification': {
      const subjectMap: Record<string, string> = {
        success: '✅ Lead skonwertowany',
        abandoned_step_1: '⚠️ Lead porzucony (krok 1)',
        abandoned_step_2: '⚠️ Lead porzucony (krok 2)',
      };
      const subject = `${subjectMap[body.type || 'success'] || 'Lead notyfikacja'} — ID ${body.id}`;
      await sendEmail(env, subject, leadEmailHtml({ id: body.id || '?' }));
      return json({ success: true });
    }

    case 'get_lead': {
      // Bez persystencji — frontowa logika "resume from email" nie jest aktualnie
      // wspierana w trybie serverless. Zwracamy null, leadService obsługuje brak.
      return json({ lead: null });
    }

    default:
      return json({ message: 'Nieobsługiwana akcja' }, 400);
  }
};
