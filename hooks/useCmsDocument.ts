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
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const key = `${slug ?? ''}#${attempt}`;

  useEffect(() => {
    if (!slug) return;
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
  }, [slug, fetcher, key]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  if (!slug) return { status: 'notfound' as CmsDocumentStatus, data: null, retry };
  const current = settled && settled.key === key ? settled : null;
  return {
    status: (current ? current.status : 'loading') as CmsDocumentStatus,
    data: current ? current.data : null,
    retry,
  };
}
