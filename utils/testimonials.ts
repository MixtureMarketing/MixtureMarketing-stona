// MIX-1326: czysta normalizacja opinii klientów z CMS (bez zależności od Sanity, żeby widok i testy
// nie ciągnęły klienta). Dane z CMS to dane wejściowe niezaufane: braki odrzucamy, a link do
// oryginalnej opinii przepuszczamy tylko jako https (allowlista; javascript:, data:, http: = brak linku).
import type { SanityTestimonial } from '@/types/sanity';

/** Sekcja pokazuje 3–5 opinii; więcej niż 5 ucinamy (limit jest też w zapytaniu GROQ). */
export const MAX_TESTIMONIALS = 5;

/** Zwraca znormalizowany adres https albo `undefined` (każdy inny schemat, błąd parsowania, nie-tekst). */
export function safeReviewUrl(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  try {
    const url = new URL(raw.trim());
    return url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}

const text = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;

/**
 * Pozycja jest pełna tylko z nazwą firmy, branżą, imieniem i cytatem (kryterium MIX-1326).
 * Wynik nigdy nie jest dłuższy niż MAX_TESTIMONIALS; nie-tablica = pusta lista (sekcja się nie renderuje).
 */
export function normalizeTestimonials(raw: unknown): SanityTestimonial[] {
  if (!Array.isArray(raw)) return [];
  const out: SanityTestimonial[] = [];
  for (const r of raw as Array<Record<string, unknown> | null>) {
    if (!r || typeof r !== 'object') continue;
    const companyName = text(r.companyName);
    const industry = text(r.industry);
    const personFirstName = text(r.personFirstName);
    const quote = text(r.quote);
    if (!companyName || !industry || !personFirstName || !quote || typeof r._id !== 'string') {
      continue;
    }
    out.push({
      _id: r._id,
      companyName,
      industry,
      personFirstName,
      quote,
      logo: (r.logo as SanityTestimonial['logo']) ?? undefined,
      googleReviewUrl: safeReviewUrl(r.googleReviewUrl),
    });
    if (out.length === MAX_TESTIMONIALS) break;
  }
  return out;
}
