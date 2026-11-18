import { createClient, type SanityClient } from '@sanity/client';
import imageUrlBuilder, { type SanityImageSource } from '@sanity/image-url';
import type { SanityImage } from '@/types/sanity';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2024-01-21';

/**
 * Błąd POBRANIA z Sanity (timeout, 429, 5xx, offline) — w odróżnieniu od `null`,
 * które oznacza „nie ma takiego dokumentu”. Szablony pokazują przy nim stan błędu
 * z „Spróbuj ponownie”, a NIE `NotFound` z `noindex` (chwilowa awaria Sanity nie
 * może wyindeksować strony ani wypalić 404 w prerenderze).
 */
export class CmsUnavailableError extends Error {
  constructor(context: string, cause?: unknown) {
    super(
      `Sanity niedostępne (${context}): ${cause instanceof Error ? cause.message : String(cause)}`,
    );
    this.name = 'CmsUnavailableError';
  }
}

/** Brak VITE_SANITY_PROJECT_ID w buildzie (np. lokalny build bez pliku ze zmiennymi). */
export const isCmsConfigured = Boolean(projectId && String(projectId).trim());

/**
 * Bez projectId `createClient` rzuca przy ładowaniu modułu (komunikat o brakującym
 * `projectId`), a Vite zgłasza to jako `vite:preloadError` i strona się przeładowuje.
 * Zamiast tego: jeden jawny błąd w konsoli i klient, którego pobrania kończą się
 * `CmsUnavailableError` — sekcje zależne od CMS pokazują swój istniejący stan błędu/pusty.
 */
const createUnconfiguredClient = (): SanityClient => {
  console.error(
    '[CMS] Brak VITE_SANITY_PROJECT_ID w buildzie: treści z Sanity są niedostępne (ustaw zmienną i zbuduj ponownie).',
  );
  const reason = new CmsUnavailableError('konfiguracja', new Error('brak VITE_SANITY_PROJECT_ID'));
  return {
    clientConfig: { projectId: '', dataset },
    fetch: () => Promise.reject(reason),
  } as unknown as SanityClient;
};

export const client: SanityClient = isCmsConfigured
  ? createClient({ projectId, dataset, apiVersion, useCdn: false })
  : createUnconfiguredClient();

const builder = imageUrlBuilder(client);

type UrlBuilder = ReturnType<typeof builder.image>;

/**
 * MIX-1275: zdjęcie z katalogu public/ zamiast zasobu Sanity (realizacje z repo, np. AI Q-PLAST).
 * Kształt jak obraz z CMS, więc szablony realizacji działają bez zmian; `urlFor` oddaje wtedy
 * samą ścieżkę (szerokość, kadr i format są już w pliku).
 */
export const LOCAL_IMAGE_PREFIX = 'local:';
/** Tylko ścieżka własna od `/` (bez `//host`, schematu, `..`, zapytania i spacji). */
const LOCAL_SRC = /^\/(?!\/)(?!.*\.\.)[A-Za-z0-9_\-./]+$/;

export const localImage = (src: string): SanityImage => ({
  _type: 'image',
  asset: { _ref: `${LOCAL_IMAGE_PREFIX}${src}`, _type: 'reference' },
});

/** Ścieżka zdjęcia lokalnego albo `null` (obraz z Sanity lub niedozwolona ścieżka). */
export const localImageSrc = (source: unknown): string | null => {
  const ref = (source as { asset?: { _ref?: unknown } } | null | undefined)?.asset?._ref;
  if (typeof ref !== 'string' || !ref.startsWith(LOCAL_IMAGE_PREFIX)) return null;
  const src = ref.slice(LOCAL_IMAGE_PREFIX.length);
  return LOCAL_SRC.test(src) ? src : null;
};

/** Atrapa łańcucha buildera: każda metoda zwraca ją samą, `url()` daje ścieżkę lokalną. */
const localBuilder = (src: string): UrlBuilder => {
  const chain: UrlBuilder = new Proxy({} as UrlBuilder, {
    get: (_t, prop) => (prop === 'url' || prop === 'toString' ? () => src : () => chain),
  });
  return chain;
};

export function urlFor(source: SanityImageSource): UrlBuilder {
  const local = localImageSrc(source);
  if (local) return localBuilder(local);
  // auto=format: WebP/AVIF zamiast PNG/JPG (PNG z CMS ważyły do 3 MB).
  return builder.image(source).auto('format');
}

// Simple In-Memory Cache
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export async function fetchWithCache<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  const cacheKey = JSON.stringify({ query, params });
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }

  const data = await client.fetch(query, params);
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}
