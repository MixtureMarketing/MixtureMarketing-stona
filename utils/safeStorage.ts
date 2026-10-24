/**
 * Bezpieczny dostęp do Web Storage (localStorage / sessionStorage).
 *
 * W przeglądarce z zablokowanymi cookies / danymi witryny (Safari private,
 * Firefox z blokadą, iframe third-party) już samo odwołanie do
 * `window.localStorage` rzuca `SecurityError`, a `setItem` może rzucić
 * `QuotaExceededError`. Komponenty poza ErrorBoundary (CookieBanner,
 * AuthProvider) zamieniały to w białą stronę — ten helper nigdy nie rzuca:
 * odczyt zwraca `null`, zapis/usunięcie zwraca `false`.
 */

export type StorageKind = 'local' | 'session';

const getStorage = (kind: StorageKind): Storage | null => {
  try {
    if (typeof window === 'undefined') return null;
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};

export const safeGetItem = (key: string, kind: StorageKind = 'local'): string | null => {
  try {
    return getStorage(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

export const safeSetItem = (key: string, value: string, kind: StorageKind = 'local'): boolean => {
  try {
    const storage = getStorage(kind);
    if (!storage) return false;
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

export const safeRemoveItem = (key: string, kind: StorageKind = 'local'): boolean => {
  try {
    const storage = getStorage(kind);
    if (!storage) return false;
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

/** Odczyt + JSON.parse; uszkodzony/nieobecny wpis → `null`. */
export const safeGetJSON = <T>(key: string, kind: StorageKind = 'local'): T | null => {
  const raw = safeGetItem(key, kind);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};
