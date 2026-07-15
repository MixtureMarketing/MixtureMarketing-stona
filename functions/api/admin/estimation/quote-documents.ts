/**
 * Cloudflare Pages Function: admin/estimation/quote-documents
 * Path: /api/admin/estimation/quote-documents
 * Auth: dziedziczona z admin/_middleware.ts (rola admin).
 * POST multipart {id, oferta, karta} — zapis obu PDF-ów wyceny do R2 + klucze do est_quotes.
 *
 * PDF-y powstają w PRZEGLĄDARCE (jsPDF w lazy chunku — SKILL.md), a tu trafiają gotowe.
 * Worker ich nie generuje: renderer waży ~400 kB i musiałby żyć w dwóch runtime'ach,
 * a wtedy „ten sam dokument" byłby założeniem, nie faktem.
 *
 * Klucze wracają do bazy, bo są WARUNKIEM przejścia na `sent` (D30, quote-status).
 */

interface Env {
  DB: D1Database;
  FILES: R2Bucket;
}

/** Statusy, w których dokumenty mają sens: po finalize istnieje snapshot, a to z niego są. */
const Z_SNAPSHOTEM = new Set(['review', 'sent', 'won', 'lost', 'closed']);

const KLUCZ = {
  oferta: (id: number) => `quotes/${id}/oferta.pdf`,
  karta: (id: number) => `quotes/${id}/karta-decyzji.pdf`,
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  try {
    const form = await request.formData();
    const id = Number(form.get('id'));
    if (!id) return json({ error: 'Pole „id" jest wymagane.' }, 400);

    const oferta = form.get('oferta');
    const karta = form.get('karta');
    // Komplet albo nic: połowa kompletu w R2 to plik-sierota przy wycenie, której guard D30
    // i tak nie przepuści na `sent`. Odmowa jest czystsza niż śmieć w koszyku.
    if (!(oferta instanceof File) || !(karta instanceof File)) {
      return json({ error: 'Wymagane są OBA dokumenty: „oferta" i „karta".' }, 400);
    }

    const quote = (await env.DB.prepare('SELECT id, status FROM est_quotes WHERE id = ?')
      .bind(id)
      .first()) as { id: number; status: string } | null;
    if (!quote) return json({ error: 'Wycena nie istnieje.' }, 404);
    if (!Z_SNAPSHOTEM.has(quote.status)) {
      return json(
        {
          error: `Wycena w statusie „${quote.status}" nie ma snapshotu — dokumenty powstają dopiero po finalize.`,
        },
        409,
      );
    }

    const pdfKey = KLUCZ.oferta(id);
    const cardKey = KLUCZ.karta(id);
    const meta = { httpMetadata: { contentType: 'application/pdf' } };
    // Klucz deterministyczny (bez znacznika czasu): ponowna generacja NADPISUJE komplet,
    // zamiast zostawiać w R2 kolejne osierocone pliki.
    // Zapis do bazy DOPIERO po udanym R2 — klucz bez pliku przepuściłby wycenę na `sent`
    // z martwym linkiem, czyli dokładnie to, przed czym guard D30 ma chronić.
    await env.FILES.put(pdfKey, await oferta.arrayBuffer(), meta);
    await env.FILES.put(cardKey, await karta.arrayBuffer(), meta);

    await env.DB.prepare(
      `UPDATE est_quotes SET pdf_r2_key = ?, card_r2_key = ?, updated_at = datetime('now') WHERE id = ?`,
    )
      .bind(pdfKey, cardKey, id)
      .run();

    return json({ id, pdf_r2_key: pdfKey, card_r2_key: cardKey });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
