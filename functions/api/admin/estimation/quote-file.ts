/**
 * Cloudflare Pages Function: admin/estimation/quote-file
 * Path: /api/admin/estimation/quote-file?id=4&doc=offer|card
 * Auth: dziedziczona z admin/_middleware.ts (rola admin).
 * GET — strumień dokumentu wyceny z R2 (wzorzec: functions/api/portal/download.ts).
 *
 * Klucza NIE składamy tutaj z id. Czytamy go z est_quotes, bo baza wie, co naprawdę
 * zostało zapisane — i to ona jest źródłem prawdy dla guardu D30. Zgadywanie ścieżki
 * dawałoby 200 na plik, którego nie ma, albo 404 na plik, który jest pod inną nazwą.
 */

interface Env {
  DB: D1Database;
  FILES: R2Bucket;
}

const DOKUMENTY = {
  offer: { kolumna: 'pdf_r2_key', nazwa: 'oferta' },
  card: { kolumna: 'card_r2_key', nazwa: 'karta-decyzji' },
} as const;

type Dok = keyof typeof DOKUMENTY;

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const id = Number(url.searchParams.get('id'));
  const doc = url.searchParams.get('doc') as Dok | null;

  if (!id || !Number.isInteger(id)) return new Response('Brak lub błędne „id".', { status: 400 });
  if (!doc || !(doc in DOKUMENTY)) {
    return new Response(`Parametr „doc" musi być jednym z: ${Object.keys(DOKUMENTY).join(', ')}.`, {
      status: 400,
    });
  }

  const quote = (await env.DB.prepare(
    'SELECT id, name, pdf_r2_key, card_r2_key FROM est_quotes WHERE id = ?',
  )
    .bind(id)
    .first()) as Record<string, string | null> | null;
  if (!quote) return new Response('Wycena nie istnieje.', { status: 404 });

  const klucz = quote[DOKUMENTY[doc].kolumna];
  if (!klucz) return new Response('Dokument nie został jeszcze wygenerowany.', { status: 404 });

  const obiekt = await env.FILES.get(klucz);
  if (!obiekt) return new Response('Pliku nie ma w repozytorium (R2).', { status: 404 });

  const headers = new Headers();
  obiekt.writeHttpMetadata(headers);
  headers.set('etag', obiekt.httpEtag);
  // Numer wyceny w nazwie: bez tego w folderze pobranych leży dziesięć plików „oferta.pdf".
  headers.set('Content-Disposition', `inline; filename="wycena-${id}-${DOKUMENTY[doc].nazwa}.pdf"`);
  // `private`: dokumenty wyceny (a Karta w szczególności — D28) nie mają prawa wylądować
  // w cache’u pośrednika.
  headers.set('Cache-Control', 'private, max-age=300');
  return new Response(obiekt.body as BodyInit, { headers });
};
