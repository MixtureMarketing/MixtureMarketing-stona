// MIX-1934: tryb testowy Turnstile dla pomiarów automatu na Preview. BEZ onRequest* → nie trasa.
//
// Na Preview CF lider ustawia publiczny sekret testowy Cloudflare „zawsze przechodzi”
// (dokumentacja Turnstile, „Testing”). Wtedy:
//  - siteverify zwraca success z hostname „example.com” i bez `action`, więc ścisła weryfikacja
//    (verifyTurnstileStrict) w trybie testowym oczekuje dokładnie tego hosta i nie sprawdza akcji;
//  - ŻADEN lead nie trafia do CRM (D1 `leads`, est_quotes, Linear, maile do agencji i klienta):
//    funkcje zwracają tę samą odpowiedź co zwykle, z nagłówkiem `X-MM-Turnstile-Test: 1`.
//
// Fail-closed: sekret wyglądający na testowy (1x/2x/3x + zera, dowolna wielkość liter, spacje)
// działa tylko na hoście aliasu Preview gałęzi dev (`dev.mixturemarketing-stona.pages.dev`). Na
// produkcji (mixturemarketing.pl, www, główny i hashowe adresy *.pages.dev, bo wdrożenie Production
// też ma adres <hash>.mixturemarketing-stona.pages.dev) i na każdym innym hoście = odmowa
// 503 z linią powodu, zanim cokolwiek zostanie zapisane. Sekret prawdziwy = dotychczasowa ścieżka.

export const TURNSTILE_TEST_SECRET = '1x0000000000000000000000000000000AA';

/** Hostname w odpowiedzi siteverify dla sekretów testowych (stały wg Cloudflare). */
export const TURNSTILE_TEST_HOSTNAME = 'example.com';

/** Nagłówek odpowiedzi w trybie testowym (dla automatu pomiarów). */
export const TURNSTILE_TEST_HEADER = 'X-MM-Turnstile-Test';

/** Jedyny host trybu testowego: alias Preview gałęzi dev (dokładne porównanie). */
export const TURNSTILE_TEST_HOST = 'dev.mixturemarketing-stona.pages.dev';

/** Każdy sekret przypominający testowy Cloudflare (także z białymi znakami i innymi literami). */
const TEST_LIKE_RE = /^\s*[0-9]x0{10,}/i;

export type TurnstileMode =
  { kind: 'real' } | { kind: 'test' } | { kind: 'refuse'; reason: string };

export const TEST_SECRET_REFUSAL = {
  host: 'captcha: sekret testowy poza Preview',
  unknown: 'captcha: nieznany sekret testowy',
} as const;

/** Sekret wygląda na publiczny testowy Cloudflare (nie może służyć jako klucz HMAC itp.). */
export function isTestLikeSecret(secret: unknown): boolean {
  return typeof secret === 'string' && TEST_LIKE_RE.test(secret);
}

export function turnstileMode(secret: unknown, requestUrl: string): TurnstileMode {
  if (typeof secret !== 'string' || !isTestLikeSecret(secret)) return { kind: 'real' };
  let host = '';
  try {
    host = new URL(requestUrl).hostname;
  } catch {
    return { kind: 'refuse', reason: TEST_SECRET_REFUSAL.host };
  }
  if (host !== TURNSTILE_TEST_HOST) return { kind: 'refuse', reason: TEST_SECRET_REFUSAL.host };
  if (secret !== TURNSTILE_TEST_SECRET)
    return { kind: 'refuse', reason: TEST_SECRET_REFUSAL.unknown };
  return { kind: 'test' };
}

/** Odpowiedź 503 dla trybu `refuse` (linia powodu w logu, bez danych od klienta). */
export function testModeRefusal(tag: string, reason: string): Response {
  console.error(`[${tag}] odmowa 503: ${reason}`);
  return new Response(
    JSON.stringify({ error: 'Usługa chwilowo niedostępna. Spróbuj później.', reason }),
    { status: 503, headers: { 'Content-Type': 'application/json' } },
  );
}

/** Oznacza odpowiedź trybu testowego (kopia z nagłówkiem). */
export function markTestMode(res: Response): Response {
  const out = new Response(res.body, res);
  out.headers.set(TURNSTILE_TEST_HEADER, '1');
  return out;
}
