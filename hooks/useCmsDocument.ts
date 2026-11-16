import { useCallback, useEffect, useState } from 'react';
import { reportError } from '../utils/errorReporter';
import { isValidSnapshotEntry } from './cmsSnapshotSchema';

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

/**
 * Stałe nazwy rodzajów dokumentu (MIX-922). Klucz zrzutu danych w HTML nie może
 * zależeć od nazwy funkcji (minifikacja w buildzie ją zmienia).
 */
export const CMS_DOC = {
  article: 'article',
  industry: 'industry',
  location: 'location',
  caseStudy: 'caseStudy',
  industryList: 'industryList',
  caseStudyList: 'caseStudyList',
  articleList: 'articleList',
  // Blok „Powiązane” (MIX-1268): lista linków dla klucza `<rodzaj>:<slug>`.
  related: 'related',
} as const;
export type CmsDocId = (typeof CMS_DOC)[keyof typeof CMS_DOC];

// ---------------------------------------------------------------------------
// Zrzut danych CMS w prerenderowanym HTML (MIX-922, audyt MIX-897 P1).
// Prerender (window.isPrerendering) zapisuje każdy pobrany dokument do
// <script type="application/json" id="cms-snapshot"> poza #root; page.content()
// zabiera go do dist/. Po JS hook bierze dane ze zrzutu i NIE pyta Sanity
// ponownie, więc treść, title i canonical są te same co w prerenderze, także gdy
// Sanity jest wolne albo niedostępne (wcześniej: szkielet/stan błędu bez canonical).
// ---------------------------------------------------------------------------
export const CMS_SNAPSHOT_ID = 'cms-snapshot';

const snapshotKey = (id: CmsDocId, slug: string) => `${id}|${slug}`;

let cachedEl: Element | null = null;
let cachedText: string | null = null;
let cachedMap = new Map<string, unknown>();

function snapshotMap(): Map<string, unknown> {
  if (typeof document === 'undefined') return new Map();
  // W trakcie prerenderu zrzut dopiero powstaje — nie czytamy go jako źródła.
  if (typeof window !== 'undefined' && window.isPrerendering) return new Map();
  const el = document.getElementById(CMS_SNAPSHOT_ID);
  const text = el?.textContent ?? null;
  if (el === cachedEl && text === cachedText) return cachedMap;
  cachedEl = el;
  cachedText = text;
  cachedMap = new Map();
  if (!text) return cachedMap;
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (v !== null && v !== undefined) cachedMap.set(k, v);
      }
    }
  } catch {
    /* uszkodzony zrzut = brak zrzutu: hook pobierze dane jak dawniej */
  }
  return cachedMap;
}

export { isValidSnapshotEntry };

/** Dane dokumentu ze zrzutu w HTML albo `undefined`, gdy zrzutu (dla tego sluga) nie ma lub ma zły kształt. */
export function readCmsSnapshot<T>(id: CmsDocId, slug: string): T | undefined {
  const value = snapshotMap().get(snapshotKey(id, slug));
  return value !== undefined && isValidSnapshotEntry(id, value) ? (value as T) : undefined;
}

/** JSON bezpieczny w treści <script>: bez `<` (`</script>`, `<!--`) i U+2028/2029. */
export function serializeCmsSnapshot(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/** Tylko w prerenderze: dopisuje dokument do zrzutu w DOM (trafi do dist/ z page.content()). */
export function recordCmsSnapshot(id: CmsDocId, slug: string, data: unknown): void {
  if (typeof window === 'undefined' || !window.isPrerendering || data == null) return;
  let el = document.getElementById(CMS_SNAPSHOT_ID);
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/json');
    el.id = CMS_SNAPSHOT_ID;
    document.body.appendChild(el);
  }
  let current: Record<string, unknown> = {};
  try {
    const parsed: unknown = JSON.parse(el.textContent || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      current = parsed as Record<string, unknown>;
    }
  } catch {
    current = {};
  }
  current[snapshotKey(id, slug)] = data;
  el.textContent = serializeCmsSnapshot(current);
}

type Primed = { status: 'ok' | 'notfound'; data: unknown };

// Dane pobrane PRZED pierwszym renderem (preloadRoute w index.tsx przy starcie z
// prerenderowanego HTML bez zrzutu). Klucz: referencja fetchera → slug.
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
 * Kolejność źródeł przy pierwszej próbie: zrzut w HTML (MIX-922) → preload → Sanity.
 * „Spróbuj ponownie” zawsze pyta Sanity.
 *
 * `fetcher` musi mieć stabilną referencję (funkcja modułu / metoda serwisu).
 */
export function useCmsDocument<T>(
  slug: string | undefined,
  fetcher: (slug: string) => Promise<T | null>,
  cmsId: CmsDocId,
) {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(() => {
    if (!slug) return null;
    const hit = primed.get(fetcher)?.get(slug);
    return hit ? { key: `${slug}#0`, status: hit.status, data: hit.data as T | null } : null;
  });
  const key = `${slug ?? ''}#${attempt}`;

  useEffect(() => {
    if (!slug) return;
    if (attempt === 0) {
      // Zrzut z prerenderu: bez żądania do Sanity (także po powrocie na ten slug);
      // dane bierze render niżej, bez stanu.
      if (readCmsSnapshot<T>(cmsId, slug) !== undefined) return;
      // Dane z preloadu: zużyj je raz, bez drugiego żądania. Przy pierwszym montowaniu są
      // już w stanie początkowym; przy zmianie sluga bez remountu (MIX-1308: preload przed
      // przejściem realizacja → realizacja) przenosimy je do stanu tutaj, inaczej hook
      // zostałby w `loading` na zawsze.
      const hit = primed.get(fetcher)?.get(slug);
      if (hit) {
        primed.get(fetcher)?.delete(slug);
        let dropped = false;
        void Promise.resolve().then(() => {
          if (dropped) return;
          setSettled((prev) =>
            prev && prev.key === key
              ? prev
              : { key, status: hit.status, data: hit.data as T | null },
          );
        });
        return () => {
          dropped = true;
        };
      }
    }
    let cancelled = false;
    fetcher(slug).then(
      (data) => {
        if (data) recordCmsSnapshot(cmsId, slug, data);
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
  }, [slug, fetcher, cmsId, key, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  if (!slug) return { status: 'notfound' as CmsDocumentStatus, data: null, retry };
  const current = settled && settled.key === key ? settled : null;
  if (!current && attempt === 0) {
    const snap = readCmsSnapshot<T>(cmsId, slug);
    if (snap !== undefined) return { status: 'ok' as CmsDocumentStatus, data: snap, retry };
    // Preload przed nawigacją SPA (MIX-1308): dane od pierwszego renderu nowego sluga.
    const hit = primed.get(fetcher)?.get(slug);
    if (hit) return { status: hit.status as CmsDocumentStatus, data: hit.data as T | null, retry };
  }
  return {
    status: (current ? current.status : 'loading') as CmsDocumentStatus,
    data: current ? current.data : null,
    retry,
  };
}
