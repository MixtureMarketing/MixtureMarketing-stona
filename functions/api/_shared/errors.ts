// Odpowiedź 500 bez szczegółów błędu (bez handlerów → nie tworzy trasy).
//
// Wcześniej endpointy zwracały `err.message` (np. komunikaty D1/SQLite z nazwami
// tabel i kolumn) prosto do przeglądarki — dla auth/* i run_audit każdemu.
// Teraz klient dostaje ogólny komunikat + identyfikator korelacji, a pełny błąd
// (ze stosem) trafia do Workers Logs pod tym samym identyfikatorem.

export interface ServerErrorOptions {
  /** Kod HTTP (domyślnie 500). */
  status?: number;
  /** Komunikat dla użytkownika (bez szczegółów technicznych). */
  message?: string;
  /** Dodatkowe pola w body (np. `{ status: 'error' }` dla kontraktu run_audit). */
  extra?: Record<string, unknown>;
}

const DEFAULT_MESSAGE = 'Wystąpił błąd serwera. Spróbuj ponownie za chwilę.';

/**
 * Loguje błąd z identyfikatorem korelacji i zwraca ogólną odpowiedź JSON.
 * @param context krótka nazwa miejsca (np. 'admin/save_project') — do logów.
 */
export function serverError(
  err: unknown,
  context: string,
  opts: ServerErrorOptions = {},
): Response {
  const requestId = crypto.randomUUID();
  const detail = err instanceof Error ? (err.stack ?? `${err.name}: ${err.message}`) : err;
  console.error(`[${context}] request_id=${requestId}`, detail);

  const message = `${opts.message ?? DEFAULT_MESSAGE} (kod błędu: ${requestId.slice(0, 8)})`;
  return new Response(
    JSON.stringify({ ...opts.extra, error: 'server_error', message, request_id: requestId }),
    {
      status: opts.status ?? 500,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
    },
  );
}
