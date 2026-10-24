import { useCallback, useEffect, useState } from 'react';
import { reportError } from '../utils/errorReporter';

/**
 * Stan pobrania pojedynczego dokumentu CMS po slugu.
 * - `notfound` — fetcher zwrócił `null` (dokumentu NIE MA) → szablon renderuje NotFound (noindex).
 * - `error` — fetcher RZUCIŁ (Sanity niedostępne: timeout/429/5xx/offline) → stan błędu
 *   z „Spróbuj ponownie”, BEZ NotFound/noindex.
 */
export type CmsDocumentStatus = 'loading' | 'ok' | 'notfound' | 'error';

interface Settled<T> {
  key: string;
  status: Exclude<CmsDocumentStatus, 'loading'>;
  data: T | null;
}

type Fetcher<T> = (slug: string) => Promise<T | null>;

/**
 * Stały klucz dla stron-list bez sluga (np. hub /branza/): ten sam hook i ten sam
 * preload (config/routes.tsx) co szablony dokumentów, fetcher ignoruje argument.
 */
export const CMS_LIST_KEY = 'list';
type Primed = { status: 'ok' | 'notfound'; data: unknown };

// Dane pobrane PRZED pierwszym renderem (preloadRoute w index.tsx przy starcie z
// prerenderowanego HTML). Klucz: referencja fetchera → slug.
const primed = new WeakMap<Fetcher<unknown>, Map<string, Primed>>();

/**
 * Pobiera dokument z wyprzedzeniem, żeby pierwszy render szablonu miał dane od razu
 * (bez stanu `loading`, który zwija prerenderowaną treść do szkieletu). Błąd jest
 * połykany — hook spróbuje sam i pokaże stan błędu jak zwykle.
 */
export async function primeCmsDocument<T>(fetcher: Fetcher<T>, slug: string): Promise<void> {
  try {
    const data = await fetcher(slug);
    const bySlug = primed.get(fetcher) ?? new Map<string, Primed>();
    bySlug.set(slug, { status: data ? 'ok' : 'notfound', data: data ?? null });
    primed.set(fetcher, bySlug);
  } catch {
    /* hook pobierze ponownie i obsłuży błąd (CmsErrorState) */
  }
}

/**
 * Wynik jest kluczowany slugiem i numerem próby, więc zmiana sluga (nawigacja
 * artykuł → artykuł bez remountu trasy) albo „Spróbuj ponownie” natychmiast wraca
 * do `loading` — stary błąd/stare dane nie „przeciekają” na nowy URL. Odpowiedź
 * spóźnionego żądania (A→B, A odpowiada po B) jest ignorowana.
 *
 * `fetcher` musi mieć stabilną referencję (funkcja modułu / metoda serwisu).
 */
export function useCmsDocument<T>(
  slug: string | undefined,
  fetcher: (slug: string) => Promise<T | null>,
) {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(() => {
    const hit = slug ? primed.get(fetcher)?.get(slug) : undefined;
    return hit ? { key: `${slug}#0`, status: hit.status, data: hit.data as T | null } : null;
  });
  const key = `${slug ?? ''}#${attempt}`;

  useEffect(() => {
    if (!slug) return;
    // Dane z preloadu są już w stanie początkowym — zużyj je raz, bez drugiego żądania.
    if (attempt === 0 && primed.get(fetcher)?.delete(slug)) return;
    let cancelled = false;
    fetcher(slug).then(
      (data) => {
        if (!cancelled) setSettled({ key, status: data ? 'ok' : 'notfound', data: data ?? null });
      },
      (err: unknown) => {
        console.warn(`CMS fetch failed (${slug}):`, err);
        reportError('cms', err); // sygnał o awariach Sanity w runtime
        if (!cancelled) setSettled({ key, status: 'error', data: null });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [slug, fetcher, key, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  if (!slug) return { status: 'notfound' as CmsDocumentStatus, data: null, retry };
  const current = settled && settled.key === key ? settled : null;
  return {
    status: (current ? current.status : 'loading') as CmsDocumentStatus,
    data: current ? current.data : null,
    retry,
  };
}
