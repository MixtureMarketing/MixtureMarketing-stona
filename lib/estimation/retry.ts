// Cienki retry z wykładniczym backoffem dla przejściowych błędów D1 (dług z backlogu F3 —
// D1 potrafi zwrócić 500/cold-start na pierwszym zapisie). CZYSTY TS, bez importu D1:
// przyjmuje thunk, więc nadaje się do dowolnej idempotentnej operacji zapisu.
export interface RetryOptions {
  /** Maksymalna liczba prób (łącznie z pierwszą). Domyślnie 3. */
  attempts?: number;
  /** Bazowe opóźnienie (ms); rośnie wykładniczo: base·2^i. Domyślnie 50. */
  baseDelayMs?: number;
  /** Wstrzykiwalne opóźnienie (testy podają atrapę bez realnych timerów). */
  delay?: (ms: number) => Promise<void>;
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Uruchamia `fn`, ponawiając przy błędzie z backoffem (50, 100, 200…). Zwraca wynik pierwszej
 * udanej próby; po wyczerpaniu prób rzuca OSTATNI błąd. Opóźnienie występuje tylko MIĘDZY próbami.
 * Używać wyłącznie dla operacji idempotentnych (upsert/INSERT OR IGNORE), by ponowienie nie dublowało.
 */
export async function withRetry<T>(fn: () => Promise<T>, opts?: RetryOptions): Promise<T> {
  const attempts = opts?.attempts ?? 3;
  const base = opts?.baseDelayMs ?? 50;
  const wait = opts?.delay ?? sleep;
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await wait(base * 2 ** i);
    }
  }
  throw lastErr;
}
