import { createClient } from '@sanity/client';
import createImageUrlBuilder from '@sanity/image-url';
import { SanityImage } from '@/types/sanity';

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2024-01-21';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

// Using the builder as recommended by modern Sanity docs
const builder = createImageUrlBuilder(client);

export function urlFor(source: SanityImage | { asset: { _ref: string } }) {
  return builder.image(source);
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
