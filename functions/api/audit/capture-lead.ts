/**
 * Cloudflare Pages Function: audit/capture-lead
 * Path: /api/audit/capture-lead  (multipart/form-data)
 *
 * Zapis leada z audytu 360 (source='audit') do D1 + wysyłka raportu PDF
 * DO UŻYTKOWNIKA (Resend, załącznik) + powiadomienie do agencji.
 * Przebudowane 2026-07-17: wcześniej bramka obiecywała „Raport PDF jest
 * gotowy", a maila dostawała wyłącznie agencja — użytkownik oddawał e-mail
 * za nieistniejący produkt. PDF generuje frontend (services/auditPdfService),
 * wzorzec: functions/api/calculator-submit.ts.
 */

interface Env {
  DB: D1Database;
  FILES?: R2Bucket;
  RESEND_API_KEY?: string;
  NOTIFY_EMAIL?: string;
}

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

  const email = (formData.get('email') as string) || '';
  const url = (formData.get('url') as string) || '';
  const companyName = (formData.get('companyName') as string) || '';
  const scoreRaw = formData.get('score') as string | null;
  const score = scoreRaw !== null ? Number(scoreRaw) : undefined;
  const pdf = formData.get('pdf') as File | null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || !url) {
    return json({ status: 'error', message: 'email i url są wymagane' }, 400);
  }

  let pdfB64: string | undefined;
  let r2Key: string | null = null;
  if (pdf) {
    const buf = await pdf.arrayBuffer();
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

  // Raport PDF do użytkownika (obietnica z bramki — teraz prawdziwa).
  if (pdfB64) {
    await sendEmail(
      env,
      email,
      'Twój raport z audytu strony — Mixture Marketing',
      `<h3>Dziękujemy za skorzystanie z audytu 360!</h3>
       <p>W załączniku znajdziesz raport PDF z pomiarów strony <a href="${url}">${url}</a>.</p>
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
      `<p>Użytkownik <strong>${email}</strong> ukończył audyt strony
       <a href="${url}">${url}</a>${
         typeof score === 'number' && !Number.isNaN(score)
           ? ` (wynik: <strong>${score}/100</strong>)`
           : ''
       }.${pdfB64 ? ' Raport PDF w załączniku.' : ''}</p>`,
      pdfB64,
    );
  }

  return json({ status: 'success', id });
};
