/**
 * Cloudflare Pages Function: audit/capture-lead
 * Path: /api/audit/capture-lead  (multipart/form-data)
 *
 * Zapis leada z audytu 360 (source='audit') do D1 + wysyłka raportu PDF
 * DO UŻYTKOWNIKA (Resend, załącznik) + powiadomienie do agencji.
 * Przebudowane 2026-07-17: wcześniej bramka obiecywała „Raport PDF jest
 * gotowy", a maila dostawała wyłącznie agencja — użytkownik oddawał e-mail
 * za nieistniejący produkt. PDF generuje frontend (services/auditPdfService).
 *
 * Zabezpieczenia (2026-10-24): endpoint wysyła maila z załącznikiem na adres podany
 * w żądaniu, więc bez bramek był otwartym przekaźnikiem poczty z domeny firmy.
 * Kolejność: honeypot → walidacja (email, url http/https, PDF: typ + rozmiar) →
 * Turnstile → limit per IP → limit per adres odbiorcy → zapis + maile (escapowane).
 */

import { checkRateLimit } from '../estimation/_rateLimit';
import { clientIp, escapeHtml, safeHttpUrl, sha256Hex, verifyTurnstile } from '../_shared/security';

interface Env {
  DB: D1Database;
  FILES?: R2Bucket;
  CACHE?: KVNamespace;
  RESEND_API_KEY?: string;
  NOTIFY_EMAIL?: string;
  TURNSTILE_SECRET?: string;
}

const MAX_PDF_BYTES = 5 * 1024 * 1024;
const IP_LIMIT_PER_HOUR = 5;
const RECIPIENT_LIMIT_PER_DAY = 3;
const EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Base64 z ArrayBuffer bez spreada (spread na dużej tablicy przepełnia stos).
function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/** Plik zaczyna się sygnaturą PDF ("%PDF-"). */
function isPdf(buf: ArrayBuffer): boolean {
  const head = new Uint8Array(buf, 0, Math.min(5, buf.byteLength));
  return String.fromCharCode(...head) === '%PDF-';
}

async function sendEmail(env: Env, to: string, subject: string, html: string, pdfB64?: string) {
  if (!env.RESEND_API_KEY) return;
  const body: Record<string, unknown> = {
    from: 'Mixture Marketing <info@mixturemarketing.pl>',
    to: [to],
    subject,
    html,
  };
  if (pdfB64) {
    body.attachments = [{ filename: 'audyt_mixture.pdf', content: pdfB64 }];
  }
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error('audit email failed:', e);
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ status: 'error', message: 'Oczekiwano multipart/form-data' }, 400);
  }

  // Honeypot — niewidoczne pole wypełniane tylko przez boty.
  if (formData.get('website_verify')) {
    return json({ status: 'error', message: 'Spam detected' }, 403);
  }

  const email = String(formData.get('email') ?? '').trim();
  const url = safeHttpUrl(formData.get('url'));
  const companyName = String(formData.get('companyName') ?? '')
    .trim()
    .slice(0, 200);
  const scoreRaw = formData.get('score') as string | null;
  const scoreNum = scoreRaw !== null ? Number(scoreRaw) : NaN;
  const score = Number.isFinite(scoreNum) ? Math.max(0, Math.min(100, scoreNum)) : undefined;
  // Sprawdzenie kształtu zamiast `instanceof File` (klasa File bywa z innego kontekstu).
  const pdfField = formData.get('pdf') as unknown;
  const pdf =
    pdfField && typeof pdfField === 'object' && 'arrayBuffer' in pdfField && 'size' in pdfField
      ? (pdfField as Blob)
      : null;

  if (email.length > 254 || !EMAIL_RE.test(email) || !url) {
    return json({ status: 'error', message: 'Poprawny e-mail i adres strony są wymagane' }, 400);
  }
  if (pdf && pdf.size > MAX_PDF_BYTES) {
    return json({ status: 'error', message: 'Plik raportu jest za duży' }, 413);
  }

  const ip = clientIp(request);
  const captchaOk = await verifyTurnstile(
    String(formData.get('captcha_token') ?? ''),
    env.TURNSTILE_SECRET,
    ip,
  );
  if (!captchaOk) {
    return json({ status: 'error', message: 'Weryfikacja captcha nieudana' }, 403);
  }

  if (env.CACHE) {
    const byIp = await checkRateLimit(env.CACHE, ip, IP_LIMIT_PER_HOUR, 3600, 'audit:lead:ip:');
    if (!byIp.allowed) {
      return json({ status: 'error', message: 'Zbyt wiele zgłoszeń. Spróbuj później.' }, 429);
    }
    const toKey = await sha256Hex(email.toLowerCase());
    const byTo = await checkRateLimit(
      env.CACHE,
      toKey,
      RECIPIENT_LIMIT_PER_DAY,
      86400,
      'audit:lead:to:',
    );
    if (!byTo.allowed) {
      return json({ status: 'error', message: 'Zbyt wiele zgłoszeń. Spróbuj później.' }, 429);
    }
  }

  let pdfB64: string | undefined;
  let r2Key: string | null = null;
  if (pdf) {
    const buf = await pdf.arrayBuffer();
    if (!isPdf(buf)) {
      return json({ status: 'error', message: 'Niepoprawny plik raportu' }, 400);
    }
    pdfB64 = toBase64(buf);
    // Kopia do R2 — best-effort, brak pliku nie blokuje leada/maila.
    if (env.FILES) {
      r2Key = `audit/${Date.now()}_${crypto.randomUUID()}.pdf`;
      try {
        await env.FILES.put(r2Key, buf, { httpMetadata: { contentType: 'application/pdf' } });
      } catch (e) {
        console.error('R2 put failed:', e);
        r2Key = null;
      }
    }
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
        JSON.stringify({ score, pdf_key: r2Key }),
      )
      .run();
  } catch (e) {
    console.error('D1 insert audit lead failed:', e);
    return json({ status: 'error', message: 'DB error' }, 500);
  }

  const safeUrl = escapeHtml(url);
  const safeEmail = escapeHtml(email);

  // Raport PDF do użytkownika (obietnica z bramki — teraz prawdziwa).
  if (pdfB64) {
    await sendEmail(
      env,
      email,
      'Twój raport z audytu strony — Mixture Marketing',
      `<h3>Dziękujemy za skorzystanie z audytu 360!</h3>
       <p>W załączniku znajdziesz raport PDF z pomiarów strony <a href="${safeUrl}">${safeUrl}</a>.</p>
       <p>Masz pytania o wyniki? Po prostu odpowiedz na tego maila.</p>
       <p>Zespół Mixture Marketing</p>`,
      pdfB64,
    );
  }

  // Powiadomienie do agencji.
  if (env.NOTIFY_EMAIL) {
    await sendEmail(
      env,
      env.NOTIFY_EMAIL,
      `Nowy lead z audytu 360 — ${email}`,
      `<p>Użytkownik <strong>${safeEmail}</strong> ukończył audyt strony
       <a href="${safeUrl}">${safeUrl}</a>${
         typeof score === 'number' ? ` (wynik: <strong>${score}/100</strong>)` : ''
       }.${pdfB64 ? ' Raport PDF w załączniku.' : ''}</p>`,
      pdfB64,
    );
  }

  return json({ status: 'success', id });
};
