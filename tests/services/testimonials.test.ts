// MIX-1326 kryterium 1: zapytanie GROQ, normalizacja danych z CMS i zachowanie przy 0 pozycji / błędzie.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MAX_TESTIMONIALS, normalizeTestimonials, safeReviewUrl } from '../../utils/testimonials';

const fetchMock = vi.fn();
vi.mock('../../services/cms/client', () => ({
  fetchWithCache: (...a: unknown[]) => fetchMock(...a),
  CmsUnavailableError: class extends Error {},
  client: {},
  urlFor: () => ({}),
}));

import { TESTIMONIALS_QUERY, testimonialService } from '../../services/cms/testimonialService';

const full = (i: number, extra: Record<string, unknown> = {}) => ({
  _id: `id${i}`,
  companyName: `Firma Testowa ${i}`,
  industry: 'Branża testowa',
  personFirstName: 'Anna',
  quote: 'Fikcyjna opinia.',
  ...extra,
});

describe('zapytanie GROQ opinii', () => {
  it('bierze tylko typ testimonial ze zgodą klienta i ma limit 5', () => {
    expect(TESTIMONIALS_QUERY).toContain('_type == "testimonial"');
    expect(TESTIMONIALS_QUERY).toContain('consentConfirmed == true');
    expect(TESTIMONIALS_QUERY).toContain('[0...5]');
    expect(MAX_TESTIMONIALS).toBe(5);
  });

  it.each(['companyName', 'industry', 'personFirstName', 'quote'])(
    'projekcja i filtr zawierają pole %s',
    (f) => {
      expect(TESTIMONIALS_QUERY).toContain(`defined(${f})`);
      expect(TESTIMONIALS_QUERY).toMatch(new RegExp(`\\{[^}]*\\b${f}\\b`));
    },
  );
});

describe('normalizeTestimonials', () => {
  it('pełna pozycja przechodzi z przyciętym tekstem', () => {
    const out = normalizeTestimonials([full(1, { quote: '  Opinia  ' })]);
    expect(out).toHaveLength(1);
    expect(out[0].quote).toBe('Opinia');
  });

  it.each(['companyName', 'industry', 'personFirstName', 'quote'])(
    'brak albo pusty %s odrzuca pozycję',
    (field) => {
      expect(normalizeTestimonials([full(1, { [field]: undefined })])).toEqual([]);
      expect(normalizeTestimonials([full(1, { [field]: '   ' })])).toEqual([]);
      expect(normalizeTestimonials([full(1, { [field]: 7 })])).toEqual([]);
    },
  );

  it('nie-tablica, null i śmieci w tablicy dają pustą listę lub pomijają wpis', () => {
    expect(normalizeTestimonials(null)).toEqual([]);
    expect(normalizeTestimonials({})).toEqual([]);
    expect(normalizeTestimonials([null, 3, 'x', full(2)])).toHaveLength(1);
  });

  it('ucina do 5 pozycji', () => {
    const out = normalizeTestimonials(Array.from({ length: 9 }, (_, i) => full(i)));
    expect(out).toHaveLength(5);
  });

  it('niebezpieczny link jest usuwany, https zostaje', () => {
    const [a, b] = normalizeTestimonials([
      full(1, { googleReviewUrl: 'javascript:alert(1)' }),
      full(2, { googleReviewUrl: 'https://example.com/x' }),
    ]);
    expect(a.googleReviewUrl).toBeUndefined();
    expect(b.googleReviewUrl).toBe('https://example.com/x');
  });
});

describe('safeReviewUrl', () => {
  it.each([
    ['http://example.com'],
    ['javascript:alert(1)'],
    ['JAVASCRIPT:alert(1)'],
    ['data:text/html,x'],
    ['//example.com'],
    ['not a url'],
    [''],
    [null],
    [undefined],
    [42],
  ])('odrzuca %p', (raw) => {
    expect(safeReviewUrl(raw)).toBeUndefined();
  });

  it('przepuszcza https (także z białymi znakami)', () => {
    expect(safeReviewUrl(' https://example.com/a?b=1 ')).toBe('https://example.com/a?b=1');
  });
});

describe('testimonialService.getTestimonials', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('wysyła zapytanie z TESTIMONIALS_QUERY i zwraca znormalizowane pozycje', async () => {
    fetchMock.mockResolvedValue([full(1), full(2)]);
    const out = await testimonialService.getTestimonials();
    expect(fetchMock).toHaveBeenCalledWith(TESTIMONIALS_QUERY);
    expect(out.map((t) => t._id)).toEqual(['id1', 'id2']);
  });

  it('0 pozycji = []', async () => {
    fetchMock.mockResolvedValue([]);
    expect(await testimonialService.getTestimonials()).toEqual([]);
  });

  it('błąd pobrania = [] (bez wyjątku)', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));
    expect(await testimonialService.getTestimonials()).toEqual([]);
  });
});
