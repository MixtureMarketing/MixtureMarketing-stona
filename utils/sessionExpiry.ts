/**
 * Wspólna obsługa wygasłej/zastąpionej sesji portalu i panelu admina.
 *
 * Sesja żyje 7 dni, a zalogowanie na drugim urządzeniu nadpisuje `session_token`
 * — stary token zaczyna dostawać 401/403. Wcześniej panel admina wpisywał
 * `undefined` w stan list (crash w ErrorBoundary), a portal pokazywał stałe
 * „Błąd ładowania”. Teraz każde źródło zapytań (authFetch z AuthContext,
 * MixtureApiClient) zgłasza tu wygaśnięcie; AuthProvider wylogowuje, a strony
 * portalu przekierowują do logowania z komunikatem „Sesja wygasła”.
 */

export class SessionExpiredError extends Error {
  constructor() {
    super('Sesja wygasła — zaloguj się ponownie');
    this.name = 'SessionExpiredError';
  }
}

function pathOf(url: string): string {
  try {
    return new URL(url, 'http://localhost').pathname;
  } catch {
    return url;
  }
}

/**
 * Czy odpowiedź oznacza nieważną sesję.
 * - 401 z /api/admin/* i /api/portal/* — brak/wygasła sesja (middleware).
 * - 403 z /api/admin/* — admin/_middleware.ts zwraca 403 także dla wygasłej sesji.
 * - 403 z /api/portal/* NIE — tam oznacza brak uprawnień do konkretnego zasobu
 *   (download.ts, update_milestone.ts), sesja jest ważna.
 */
export function isSessionExpiredResponse(url: string, status: number): boolean {
  const path = pathOf(url);
  if (status === 401) return /^\/api\/(admin|portal)\//.test(path);
  if (status === 403) return /^\/api\/admin\//.test(path);
  return false;
}

type Listener = () => void;
const listeners = new Set<Listener>();

export function onSessionExpired(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function signalSessionExpired(): void {
  listeners.forEach((l) => l());
}

/** Rzuca SessionExpiredError (po zgłoszeniu), gdy odpowiedź oznacza nieważną sesję. */
export function assertSessionValid(url: string, res: Response): Response {
  if (isSessionExpiredResponse(url, res.status)) {
    signalSessionExpired();
    throw new SessionExpiredError();
  }
  return res;
}

/** Dane z API trafiające do stanu listy — nigdy `undefined`/obiekt błędu. */
export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
