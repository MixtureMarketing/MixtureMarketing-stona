#!/usr/bin/env node
// Wywołanie retencji audytu (MIX-1820): POST /api/audit/retencja z podpisem HMAC. Do timera na serwerze firmy
// (raz na dobę, obok timera `leady-ponow`). Node 22, bez zależności.
//
// Środowisko (sekret wyłącznie z env, nigdy z plików ani argumentów):
//   RETENCJA_URL      adres bazowy, np. https://mixturemarketing.pl (bez ścieżki)
//   RETENCJA_SECRET   ta sama wartość co AUDIT_RETENCJA_SECRET w panelu Pages danego środowiska
// Argument `--proba` wymusza tryb próbny niezależnie od flagi AUDIT_RETENCJA_KASUJ.
// Wyjście: odpowiedź JSON (same liczby, id leadów i klucze plików) na stdout; kod 0 przy HTTP 200, inaczej 1.
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

export const SCIEZKA_RETENCJI = '/api/audit/retencja';

/** Podpis zgodny z `functions/api/crm/_podpis.ts` (prefiks `audyt-retencja:v1:`). */
export function podpisRetencji(sekret, czasSek, nonce) {
  const tekst = `audyt-retencja:v1:${czasSek}.${nonce}.POST ${SCIEZKA_RETENCJI}`;
  return `sha256=${crypto.createHmac('sha256', sekret).update(tekst).digest('hex')}`;
}

async function main() {
  const baza = process.env.RETENCJA_URL;
  const sekret = process.env.RETENCJA_SECRET;
  if (!baza || !sekret) {
    console.error('Brak RETENCJA_URL albo RETENCJA_SECRET.');
    process.exit(2);
  }
  const czas = String(Math.floor(Date.now() / 1000));
  const nonce = crypto.randomUUID();
  const odp = await fetch(new URL(SCIEZKA_RETENCJI, baza), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Mixture-Timestamp': czas,
      'X-Mixture-Nonce': nonce,
      'X-Mixture-Signature': podpisRetencji(sekret, czas, nonce),
    },
    body: process.argv.includes('--proba') ? '{"proba":true}' : '',
  });
  console.log(`HTTP ${odp.status} ${await odp.text()}`);
  process.exit(odp.status === 200 ? 0 : 1);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((e) => {
    console.error(`Błąd: ${e?.name ?? 'Error'}`);
    process.exit(1);
  });
}
