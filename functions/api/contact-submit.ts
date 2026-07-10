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
  DB: D1Database;
}

// Kolumny leads mapowane wprost; reszta pól z formularza ląduje w details (JSON).
const LEAD_COLUMNS = new Set([
  'name',
  'email',
  'phone',
  'website',
  'budget',
  'message',
  'package_name',
  'service_interest',
]);
const LEAD_SKIP = new Set(['captcha_token', 'website_verify', 'privacy', 'id']);

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
  // Uwaga: NIE ma tu pseudo-tokenów obejścia ('local_bypass' itp.). Wcześniejsza
  // wersja akceptowała je bezwarunkowo, co pozwalało spamować przez Resend bez
  // captchy. Dev korzysta z proxy Vite → to nigdy nie trafia do tej funkcji.
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

// Rozdziel pola formularza na kolumny leads + resztę do JSON `details`.
function splitLeadFields(src: Record<string, unknown>) {
  const details: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(src)) {
    if (LEAD_SKIP.has(k) || LEAD_COLUMNS.has(k)) continue;
    if (v !== undefined && v !== null && v !== '') details[k] = v;
  }
  return details;
}

// Odtwórz kształt leada oczekiwany przez frontend (leadService.Lead).
function rowToLead(row: Record<string, unknown>) {
  let extra: Record<string, unknown> = {};
  if (typeof row.details === 'string' && row.details) {
    try {
      extra = JSON.parse(row.details);
    } catch {
      /* ignore malformed */
    }
  }
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    service_interest: row.service_type,
    website: row.website,
    budget: row.budget,
    message: row.message,
    package_name: row.package_name,
    ...extra,
  };
}

// GET /api/contact-submit?action=get_lead&id=... — wznowienie formularza z maila.
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  if (url.searchParams.get('action') !== 'get_lead') {
    return json({ message: 'Nieobsługiwana akcja' }, 400);
  }
  const id = url.searchParams.get('id');
  if (!id) return json({ lead: null });
  try {
    const row = await env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(id).first();
    return json({ lead: row ? rowToLead(row as Record<string, unknown>) : null });
  } catch {
    return json({ lead: null });
  }
};

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

      // Zapis do D1 (źródło prawdy). INSERT OR IGNORE — idempotentny przy wznowieniu
      // (ten sam lead.id może przyjść ponownie).
      try {
        await env.DB.prepare(
          `INSERT OR IGNORE INTO leads (id, name, email, phone, service_type, source_url, source, status, current_step)
           VALUES (?, ?, ?, ?, ?, ?, 'website', 'new', 1)`,
        )
          .bind(
            body.lead.id,
            body.lead.name,
            body.lead.email,
            body.lead.phone || null,
            body.lead.service_interest || null,
            body.source_url || null,
          )
          .run();
      } catch (e) {
        // Zapis nie może blokować powiadomienia — logujemy i lecimy dalej.
        console.error('D1 insert lead failed:', e);
      }

      // Powiadomienie do agencji.
      const subject = `🆕 Nowy lead — ${body.lead.name} (${body.lead.service_interest || 'general'})`;
      await sendEmail(env, subject, leadEmailHtml(body.lead), body.lead.email);

      return json({ success: true, id: body.lead.id });
    }

    case 'update': {
      // Update nie wymaga captcha (lead już utworzony i zweryfikowany w kroku 1).
      if (body.id) {
        const d = (body.details || {}) as Record<string, unknown>;
        const detailsJson = JSON.stringify(splitLeadFields(d));
        try {
          await env.DB.prepare(
            `UPDATE leads SET
               name = COALESCE(?, name),
               email = COALESCE(?, email),
               phone = COALESCE(?, phone),
               website = COALESCE(?, website),
               budget = COALESCE(?, budget),
               message = COALESCE(?, message),
               package_name = COALESCE(?, package_name),
               details = ?,
               current_step = COALESCE(?, current_step)
             WHERE id = ?`,
          )
            .bind(
              (d.name as string) ?? null,
              (d.email as string) ?? null,
              (d.phone as string) ?? null,
              (d.website as string) ?? null,
              (d.budget as string) ?? null,
              (d.message as string) ?? null,
              (d.package_name as string) ?? null,
              detailsJson,
              body.step ?? null,
              body.id,
            )
            .run();
        } catch (e) {
          console.error('D1 update lead failed:', e);
        }
      }
      // Email do agencji przy finalnym kroku (step=3).
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
      if (!body.id) return json({ lead: null });
      try {
        const row = await env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(body.id).first();
        return json({ lead: row ? rowToLead(row as Record<string, unknown>) : null });
      } catch {
        return json({ lead: null });
      }
    }

    default:
      return json({ message: 'Nieobsługiwana akcja' }, 400);
  }
};
