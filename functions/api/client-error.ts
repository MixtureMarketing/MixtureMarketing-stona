/**
 * Cloudflare Pages Function: POST /api/client-error
 *
 * Odbiornik raportów błędów frontu (utils/errorReporter.ts, navigator.sendBeacon).
 * Front wycina console.* w produkcji, więc to jedyne źródło wiedzy o wyjątkach
 * w przeglądarkach użytkowników. Zapis WYŁĄCZNIE przez console.error → Workers
 * Logs (`wrangler pages deployment tail` / dashboard) — bez migracji D1.
 *
 * Ochrona: limit rozmiaru (8 kB), walidacja i przycięcie pól, ten sam origin,
 * limit per IP przez KV (CACHE, fail-open). Odpowiedź bez treści — beacon jej
 * i tak nie czyta.
 */

import { checkRateLimit } from './estimation/_rateLimit';
import { clientIp } from './_shared/security';

interface Env {
  CACHE?: KVNamespace;
}

export const MAX_BODY_BYTES = 8 * 1024;
export const REPORTS_PER_IP_PER_HOUR = 30;

const str = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.length > 0 ? v.slice(0, max) : null;

/** Tylko origin + ścieżka — gdyby klient przysłał query/hash, odcinamy je. */
function cleanUrl(v: unknown): string | null {
  const raw = str(v, 500);
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return `${u.origin}${u.pathname}`;
  } catch {
    return null;
  }
}

const noContent = (status: number) => new Response(null, { status });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return noContent(413);

  // Tylko z tej samej domeny (prod i preview *.pages.dev mają własny host).
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return noContent(403);

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return noContent(413);

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return noContent(400);
    body = parsed as Record<string, unknown>;
  } catch {
    return noContent(400);
  }

  const message = str(body.message, 500);
  const kind = str(body.kind, 40);
  if (!message || !kind) return noContent(400);

  if (env.CACHE) {
    const rl = await checkRateLimit(
      env.CACHE,
      clientIp(request),
      REPORTS_PER_IP_PER_HOUR,
      3600,
      'clierr:',
    );
    if (!rl.allowed) return noContent(429);
  }

  const cf = (request as Request & { cf?: { country?: string } }).cf;
  const row = {
    kind,
    message,
    stack: str(body.stack, 2048),
    url: cleanUrl(body.url),
    release: str(body.release, 64),
    ua: str(body.ua, 256),
    country: cf?.country ?? null,
  };
  console.error('[client-error]', JSON.stringify(row));
  return noContent(204);
};
