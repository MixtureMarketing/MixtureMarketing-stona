// Walidacja i normalizacja pól z body przed .bind() w D1 (bez handlerów → nie tworzy trasy).
//
// D1 rzuca D1_TYPE_ERROR dla `undefined` w .bind(), a JSON.stringify gubi klucze
// z wartością undefined — więc każde pole nieruszone w formularzu panelu kończyło
// się 500 („Błąd zapisu zmian”) zamiast zapisu. Tu: brak pola → null (dla
// opcjonalnych) albo ValidationError → 400 z czytelnym komunikatem (dla wymaganych).

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/** undefined → null (D1 nie przyjmuje undefined w bind). */
export function orNull<T>(v: T | undefined): T | null {
  return v === undefined ? null : v;
}

/** Odpowiedź 400 z komunikatem dla człowieka (apiClient czyta pole `message`). */
export function badRequest(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: 'bad_request', message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Wymagany niepusty tekst (po trim), z limitem długości. */
export function reqText(v: unknown, label: string, max = 500): string {
  if (typeof v !== 'string' && typeof v !== 'number') {
    throw new ValidationError(`Pole „${label}” jest wymagane.`);
  }
  const s = String(v).trim();
  if (!s) throw new ValidationError(`Pole „${label}” jest wymagane.`);
  if (s.length > max) throw new ValidationError(`Pole „${label}” może mieć maks. ${max} znaków.`);
  return s;
}

/** Opcjonalny tekst: undefined/null → null; inaczej string z limitem długości. */
export function optText(v: unknown, label: string, max = 2000): string | null {
  if (v === undefined || v === null) return null;
  if (typeof v !== 'string' && typeof v !== 'number') {
    throw new ValidationError(`Pole „${label}” ma nieprawidłowy format.`);
  }
  const s = String(v);
  if (s.length > max) throw new ValidationError(`Pole „${label}” może mieć maks. ${max} znaków.`);
  return s;
}

/** Wymagany identyfikator: dodatnia liczba całkowita (także jako string, np. z <select>). */
export function reqId(v: unknown, label: string): number {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v;
  if (typeof n !== 'number' || !Number.isSafeInteger(n) || n <= 0) {
    throw new ValidationError(`Brak lub nieprawidłowe pole „${label}”.`);
  }
  return n;
}

/** Opcjonalny identyfikator: brak/''/0/null → null. */
export function optId(v: unknown, label: string): number | null {
  if (v === undefined || v === null || v === '' || v === 0) return null;
  return reqId(v, label);
}

/** Liczba całkowita w zakresie (np. postęp 0–100); brak → fallback. */
export function intInRange(
  v: unknown,
  label: string,
  min: number,
  max: number,
  fallback: number,
): number {
  if (v === undefined || v === null || v === '') return fallback;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new ValidationError(`Pole „${label}” musi być liczbą.`);
  return Math.min(max, Math.max(min, Math.round(n)));
}

/** Wartość z zamkniętej listy; brak → fallback (jeśli podany), inaczej błąd. */
export function oneOf<T extends string>(
  v: unknown,
  allowed: readonly T[],
  label: string,
  fallback?: T,
): T {
  if ((v === undefined || v === null || v === '') && fallback !== undefined) return fallback;
  if (typeof v === 'string' && (allowed as readonly string[]).includes(v)) return v as T;
  throw new ValidationError(`Pole „${label}” musi mieć jedną z wartości: ${allowed.join(', ')}.`);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Wymagany adres e-mail (trim). Bez zmiany wielkości liter: logowanie
 * (send_magic_link) porównuje adres dokładnie tak, jak jest zapisany.
 */
export function reqEmail(v: unknown, label = 'E-mail'): string {
  const s = reqText(v, label, 254);
  if (!EMAIL_RE.test(s)) throw new ValidationError(`Pole „${label}” nie jest poprawnym adresem.`);
  return s;
}

/**
 * Body żądania jako obiekt. Niepoprawny JSON / tablica / prymityw → ValidationError
 * (wcześniej `await request.json()` rzucał i endpoint zwracał 500).
 */
export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError('Nieprawidłowe dane żądania (oczekiwano JSON).');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('Nieprawidłowe dane żądania (oczekiwano obiektu JSON).');
  }
  return body as Record<string, unknown>;
}

/**
 * Buduje `SET a = ?, b = ?` tylko z pól obecnych w body (partial update). Pole
 * pominięte w body zostaje bez zmian w bazie, zamiast być nadpisane NULL-em albo
 * wywalić bind. `columns` = biała lista: kolumna → normalizator wartości.
 */
export function buildUpdate(
  body: Record<string, unknown>,
  columns: Record<string, (v: unknown) => unknown>,
): { sets: string[]; values: unknown[] } {
  const sets: string[] = [];
  const values: unknown[] = [];
  for (const [col, normalize] of Object.entries(columns)) {
    if (body[col] === undefined) continue;
    sets.push(`${col} = ?`);
    values.push(orNull(normalize(body[col])));
  }
  return { sets, values };
}
