// Wspólna wysyłka maili przez Resend (bez handlerów → nie tworzy trasy).
//
// Wcześniej każdy endpoint robił `await fetch('https://api.resend.com/emails', …)`
// bez sprawdzenia wyniku: przy 4xx/5xx Resend (zły klucz, limit, zablokowana
// domena) albo braku RESEND_API_KEY admin widział „Odpowiedź wysłana!”, lead
// dostawał status `contacted`, a mail nie wychodził. Ten helper ZAWSZE zwraca
// wynik i loguje porażkę przez console.error (Workers Logs).

export type EmailResult =
  | { ok: true }
  | { ok: false; reason: 'no_key' | 'network' | `http_${number}` };

export interface ResendPayload {
  from: string;
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  reply_to?: string;
}

const RESEND_URL = 'https://api.resend.com/emails';
const TIMEOUT_MS = 10_000;

/**
 * Wysyła maila przez Resend. Nigdy nie rzuca.
 * @param tag krótki identyfikator miejsca wywołania do logów (np. 'reply_lead')
 */
export async function sendEmail(
  env: { RESEND_API_KEY?: string },
  payload: ResendPayload,
  tag: string,
): Promise<EmailResult> {
  if (!env.RESEND_API_KEY) {
    console.error(`[email:${tag}] brak RESEND_API_KEY — mail NIE wysłany`);
    return { ok: false, reason: 'no_key' };
  }
  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      const body = (await res.text().catch(() => '')).slice(0, 500);
      console.error(`[email:${tag}] Resend HTTP ${res.status}: ${body}`);
      return { ok: false, reason: `http_${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error(`[email:${tag}] wyjątek wysyłki:`, err instanceof Error ? err.message : err);
    return { ok: false, reason: 'network' };
  }
}

/** Odpowiedź 502 dla akcji, której istotą jest wysłanie maila. */
export function emailFailedResponse(message: string, result: EmailResult): Response {
  return new Response(
    JSON.stringify({
      error: 'email_failed',
      message,
      reason: result.ok ? undefined : result.reason,
    }),
    { status: 502, headers: { 'Content-Type': 'application/json' } },
  );
}
