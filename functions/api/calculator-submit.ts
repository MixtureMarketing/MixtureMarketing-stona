/**
 * Cloudflare Pages Function: kalkulator wyceny.
 * Route: POST /api/calculator-submit  (multipart/form-data)
 *
 * Pola: email, pdf (Blob), data (JSON {selections, result}).
 * Przepływ:
 *   1) zapis PDF do R2 (FILES),
 *   2) mail do klienta (załącznik PDF) + powiadomienie do NOTIFY_EMAIL przez Resend,
 *   3) zapis leada do D1 (source='calculator').
 *
 * Zastępuje martwy public/api/calculator_submit.php (PHP nie wykonuje się na CF Pages).
 */

interface Env {
  RESEND_API_KEY: string;
  NOTIFY_EMAIL: string;
  DB: D1Database;
  FILES: R2Bucket;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

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
    body.attachments = [{ filename: 'wycena_mixture.pdf', content: pdfB64 }];
  }
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ message: 'Oczekiwano multipart/form-data' }, 400);
  }

  const email = (formData.get('email') as string) || '';
  const pdf = formData.get('pdf') as File | null;
  const dataRaw = (formData.get('data') as string) || '{}';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return json({ message: 'Nieprawidłowy adres email.' }, 400);
  }
  if (!pdf) {
    return json({ message: 'Brak pliku PDF.' }, 400);
  }

  let parsed: { selections?: Record<string, unknown>; result?: Record<string, unknown> } = {};
  try {
    parsed = JSON.parse(dataRaw);
  } catch {
    /* details zostaną puste */
  }
  const selections = parsed.selections || {};
  const result = parsed.result || {};

  const buf = await pdf.arrayBuffer();
  const pdfB64 = toBase64(buf);

  // 1. Zapis PDF do R2 (best-effort — brak pliku nie może zablokować leada/maila).
  const id = crypto.randomUUID();
  const r2Key = `calculator/${Date.now()}_${id}.pdf`;
  try {
    await env.FILES.put(r2Key, buf, { httpMetadata: { contentType: 'application/pdf' } });
  } catch (e) {
    console.error('R2 put failed:', e);
  }

  // 2. Maile (klient + agencja).
  await sendEmail(
    env,
    email,
    'Twoja wycena projektu — Mixture Marketing',
    `<h3>Dziękujemy za skorzystanie z kalkulatora!</h3>
     <p>W załączniku przesyłamy wstępny kosztorys Twojego projektu.</p>
     <p>Jeśli masz pytania, po prostu odpowiedz na tego maila.</p>
     <p>Zespół Mixture Marketing</p>`,
    pdfB64,
  );
  await sendEmail(
    env,
    env.NOTIFY_EMAIL,
    `🧮 Nowa wycena z kalkulatora — ${email}`,
    `<p>Użytkownik <strong>${email}</strong> wygenerował wycenę.</p>
     <pre>${dataRaw.replace(/</g, '&lt;')}</pre>`,
    pdfB64,
  );

  // 3. Zapis leada do D1 (naprawia regresję — wersja z gałęzi migracyjnej tego nie robiła).
  try {
    const priceRange =
      result.minPrice && result.maxPrice ? `${result.minPrice} - ${result.maxPrice}` : null;
    await env.DB.prepare(
      `INSERT INTO leads (id, email, name, service_type, budget, details, source, status)
       VALUES (?, ?, ?, ?, ?, ?, 'calculator', 'new')`,
    )
      .bind(
        id,
        email,
        'Klient z kalkulatora',
        `Kalkulator: ${(selections.projectType as string) || 'projekt'}`,
        priceRange,
        JSON.stringify({ selections, result, pdf_key: r2Key }),
      )
      .run();
  } catch (e) {
    console.error('D1 insert calculator lead failed:', e);
  }

  return json({ status: 'success', message: 'Wycena wysłana pomyślnie.' });
};
