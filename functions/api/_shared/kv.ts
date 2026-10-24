// Operacje na KV, które nigdy nie rzucają (fail-open; bez handlerów → nie tworzy trasy).
//
// KV jest tu wyłącznie cache'em. Na planie Workers Free limit to 1000 put i 1000
// delete na dobę — po jego wyczerpaniu put/delete rzucają. Wcześniej taki wyjątek
// po udanym INSERT do D1 dawał 500, a ponowienie przez użytkownika tworzyło
// duplikat wiadomości. Błąd cache'u ma kończyć się logiem, nie błędem żądania.

type KVLike = Pick<KVNamespace, 'get' | 'put' | 'delete'>;

const log = (op: string, key: string, err: unknown) =>
  console.error(`[kv:${op}] ${key}:`, err instanceof Error ? err.message : err);

/** JSON z KV albo null (brak klucza, brak bindingu, błąd KV). */
export async function kvGetJson<T>(kv: KVLike | undefined, key: string): Promise<T | null> {
  if (!kv) return null;
  try {
    return ((await kv.get(key, 'json')) as T | null) ?? null;
  } catch (err) {
    log('get', key, err);
    return null;
  }
}

/** Zapis do KV; zwraca false przy błędzie (np. wyczerpany dzienny limit zapisów). */
export async function kvPut(
  kv: KVLike | undefined,
  key: string,
  value: string,
  opts?: KVNamespacePutOptions,
): Promise<boolean> {
  if (!kv) return false;
  try {
    await kv.put(key, value, opts);
    return true;
  } catch (err) {
    log('put', key, err);
    return false;
  }
}

/** Usunięcie klucza z KV; zwraca false przy błędzie. */
export async function kvDelete(kv: KVLike | undefined, key: string): Promise<boolean> {
  if (!kv) return false;
  try {
    await kv.delete(key);
    return true;
  } catch (err) {
    log('delete', key, err);
    return false;
  }
}

/** Klucz cache'u historii czatu klienta (portal/get_messages). */
export const chatCacheKey = (userId: number | string) => `chat_history_${userId}`;

/**
 * TTL cache'u czatu. Krótszy niż dawne 3600 s: jeśli unieważnienie (delete) się nie
 * uda, klient zobaczy nową wiadomość najpóźniej po tym czasie, a nie po godzinie.
 */
export const CHAT_CACHE_TTL = 600;
