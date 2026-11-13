import { describe, it, expect, vi, beforeEach } from 'vitest';

// MIX-1268 (plan SEO A11): wybór linków bloku „Powiązane”. Atrapa Sanity oddaje kształt
// z RELATED_POOL_QUERY ("slug": slug.current, "title": coalesce(title, name)).
const fetchWithCache = vi.fn();
vi.mock('../../services/cms/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/cms/client')>();
  return { ...actual, fetchWithCache: (...args: unknown[]) => fetchWithCache(...args) };
});

import {
  pickRelated,
  normalizeTopic,
  relatedHref,
  isSafeSlug,
  RelatedPoolItem,
  RELATED_LIMIT,
} from '../../utils/related';
import {
  relatedService,
  toPoolItem,
  parseRelatedKey,
  relatedKey,
} from '../../services/cms/relatedService';
import { CmsUnavailableError } from '../../services/cms/client';

const art = (slug: string, topics: string[], title = `A ${slug}`): RelatedPoolItem => ({
  _type: 'article',
  slug,
  title,
  topics,
});
const cs = (slug: string, topics: string[]): RelatedPoolItem => ({
  _type: 'caseStudy',
  slug,
  title: `R ${slug}`,
  topics,
});
const ind = (slug: string): RelatedPoolItem => ({
  _type: 'industry',
  slug,
  title: `B ${slug}`,
  topics: [],
});

const keys = (links: { _type: string; slug: string }[]) => links.map((l) => `${l._type}:${l.slug}`);

const POOL: RelatedPoolItem[] = [
  art('react', ['React', 'Frontend', 'JavaScript']),
  art('vue', ['VueJS', 'Frontend', 'JavaScript']),
  art('tailwind', ['TailwindCSS', 'Frontend']),
  art('node', ['NodeJS', 'JavaScript', 'Backend']),
  art('redis', ['Backend', 'Database']),
  art('waf', ['Security']),
  cs('pickme', ['web', 'landing', 'React', 'TypeScript', 'Tailwind CSS']),
  cs('trydive', ['web', 'corporate', 'React']),
  cs('glam', ['design', 'branding']),
  ind('e-commerce'),
  ind('medycyna'),
  ind('edukacja'),
];

describe('pickRelated: dodatnie nogi', () => {
  it('ten sam rodzaj najpierw (najwyżej 3), potem inny rodzaj; limit 4', () => {
    const out = pickRelated({ _type: 'article', slug: 'react' }, POOL);
    expect(out).toHaveLength(RELATED_LIMIT);
    expect(keys(out)).toEqual([
      'article:vue', // 2 wspólne (frontend, javascript)
      'article:tailwind', // 1 wspólny (frontend); remis: „tailwind” leży po „react” (cyklicznie)
      'article:node', // 1 wspólny (javascript); „node” przed „react” = na końcu cyklu
      'caseStudy:trydive', // react; „trydive” po „react”, „pickme” przed
    ]);
  });

  it('kolejność nie zależy od kolejności puli (deterministyczna)', () => {
    const a = pickRelated({ _type: 'article', slug: 'react' }, POOL);
    const b = pickRelated({ _type: 'article', slug: 'react' }, [...POOL].reverse());
    expect(b).toEqual(a);
  });

  it('ten sam rodzaj ma ≥ limit dopasowań: najwyżej limit - 1 miejsc, ostatnie dla innego rodzaju', () => {
    // 4 artykuły z 2 wspólnymi tematami i 1 realizacja z 1 wspólnym: realizacja i tak dostaje
    // miejsce (ten sam rodzaj zajmuje najwyżej limit - 1), a 4. artykuł z wyższym wynikiem nie.
    const pool = [
      art('a', ['x', 'y']),
      art('b', ['x', 'y']),
      art('c', ['x', 'y']),
      art('d', ['x', 'y']),
      art('e', ['x', 'y']),
      cs('z', ['x']),
    ];
    const out = keys(pickRelated({ _type: 'article', slug: 'a' }, pool));
    expect(out).toEqual(['article:b', 'article:c', 'article:d', 'caseStudy:z']);
    expect(out.filter((k) => k.startsWith('article:'))).toHaveLength(RELATED_LIMIT - 1);
    expect(out).not.toContain('article:e');
    // limit 2: jeden artykuł i jedna realizacja, nie dwa artykuły
    expect(keys(pickRelated({ _type: 'article', slug: 'a' }, pool, 2))).toEqual([
      'article:b',
      'caseStudy:z',
    ]);
  });

  it('za mało innych rodzajów: dopełnienie tym samym rodzajem do limitu', () => {
    const pool = [
      art('a', ['x']),
      art('b', ['x']),
      art('c', ['x']),
      art('d', ['x']),
      art('e', ['x']),
    ];
    expect(keys(pickRelated({ _type: 'article', slug: 'a' }, pool))).toEqual([
      'article:b',
      'article:c',
      'article:d',
      'article:e',
    ]);
  });

  it('remis: porządek cykliczny od bieżącego sluga (różne strony, różne linki)', () => {
    const pool = ['a', 'b', 'c', 'd', 'e'].map((s) => art(s, ['x']));
    expect(keys(pickRelated({ _type: 'article', slug: 'c' }, pool, 3))).toEqual([
      'article:d',
      'article:e',
      'article:a',
    ]);
  });

  it('branże wiążą się ze sobą (hub) i z innymi rodzajami przez słowa sluga', () => {
    const pool = [...POOL, art('sklep', ['E-commerce', 'UX']), cs('shop', ['ecommerce'])];
    const out = pickRelated({ _type: 'industry', slug: 'e-commerce' }, pool);
    expect(keys(out)).toEqual([
      'industry:edukacja',
      'industry:medycyna',
      'caseStudy:shop',
      'article:sklep',
    ]);
  });

  it('normalizacja tematów: wielkość liter, znaki i synonimy', () => {
    expect(normalizeTopic('Next.js')).toBe(normalizeTopic('NextJS'));
    expect(normalizeTopic('Tailwind CSS')).toBe(normalizeTopic('TailwindCSS'));
    expect(normalizeTopic('ReactJS')).toBe('react');
    expect(normalizeTopic('UX/UI')).toBe(normalizeTopic('uiux'));
    expect(normalizeTopic('google_ads')).toBe(normalizeTopic('Google Ads'));
    expect(normalizeTopic('Łódź')).toBe('lodz');
    expect(normalizeTopic(7)).toBe('');
  });

  it('adresy z ukośnikiem na końcu dla każdego rodzaju', () => {
    expect(relatedHref({ _type: 'article', slug: 'x' })).toBe('/baza-wiedzy/x/');
    expect(relatedHref({ _type: 'caseStudy', slug: 'x' })).toBe('/portfolio/x/');
    expect(relatedHref({ _type: 'industry', slug: 'x' })).toBe('/branza/x/');
  });
});

describe('pickRelated: ujemne nogi', () => {
  it('nigdy link do siebie, także gdy bieżący jest w puli dwa razy', () => {
    const pool = [art('a', ['x']), art('a', ['x']), art('b', ['x'])];
    const out = pickRelated({ _type: 'article', slug: 'a' }, pool);
    expect(keys(out)).toEqual(['article:b']);
  });

  it('ten sam slug innego rodzaju NIE jest linkiem do siebie', () => {
    const pool = [art('e-commerce', ['ecommerce']), ind('e-commerce')];
    expect(keys(pickRelated({ _type: 'article', slug: 'e-commerce' }, pool))).toEqual([
      'industry:e-commerce',
    ]);
  });

  it('pusta pula, sam bieżący albo bieżący spoza puli = pusta lista', () => {
    expect(pickRelated({ _type: 'article', slug: 'a' }, [])).toEqual([]);
    expect(pickRelated({ _type: 'article', slug: 'a' }, [art('a', ['x'])])).toEqual([]);
    expect(pickRelated({ _type: 'article', slug: 'zz' }, POOL)).toEqual([]);
    expect(
      pickRelated({ _type: 'article', slug: 'a' }, null as unknown as RelatedPoolItem[]),
    ).toEqual([]);
  });

  it('brak wspólnego tematu = brak linku (pusta lista, gdy nic nie pasuje)', () => {
    expect(pickRelated({ _type: 'article', slug: 'waf' }, POOL)).toEqual([]);
    const out = pickRelated({ _type: 'caseStudy', slug: 'glam' }, POOL);
    expect(out).toEqual([]);
  });

  it('limit: nigdy więcej niż 4, także gdy wywołujący prosi o więcej; 0 i ujemny = pusto', () => {
    const pool = Array.from({ length: 12 }, (_, i) => art(`s${i}`, ['x']));
    expect(pickRelated({ _type: 'article', slug: 's0' }, pool)).toHaveLength(4);
    expect(pickRelated({ _type: 'article', slug: 's0' }, pool, 99)).toHaveLength(4);
    expect(pickRelated({ _type: 'article', slug: 's0' }, pool, 3)).toHaveLength(3);
    expect(pickRelated({ _type: 'article', slug: 's0' }, pool, 0)).toEqual([]);
    expect(pickRelated({ _type: 'article', slug: 's0' }, pool, -2)).toEqual([]);
  });

  it('niebezpieczny slug, pusty tytuł, nieznany rodzaj = pozycja odrzucona (fail-closed)', () => {
    const bad = [
      art('../admin', ['x']),
      art('javascript:alert(1)', ['x']),
      art('a/b', ['x']),
      art('UPPER', ['x']),
      art('', ['x']),
      art('-lead', ['x']),
      art('ok-spacja ', ['x']),
      art('pusty', ['x'], '   '),
      {
        _type: 'location',
        slug: 'rzeszow',
        title: 'M',
        topics: ['x'],
      } as unknown as RelatedPoolItem,
      null,
      undefined,
    ];
    const good = art('dobry--slug', ['x']);
    const out = pickRelated({ _type: 'article', slug: 'a' }, [art('a', ['x']), ...bad, good]);
    expect(keys(out)).toEqual(['article:dobry--slug']);
    // bieżący z niebezpiecznym slugiem: pusto, nawet gdy jest w puli
    expect(pickRelated({ _type: 'article', slug: '../a' }, [art('../a', ['x']), good])).toEqual([]);
  });

  it('isSafeSlug: allowlista znaków', () => {
    for (const s of ['a', 'abc-1', 'saas--startups', 'x9']) expect(isSafeSlug(s), s).toBe(true);
    for (const s of ['', 'A', 'a b', 'a/b', 'a.b', 'a?x', '-a', 'a-', 'ą', 'a'.repeat(201), 7])
      expect(isSafeSlug(s), String(s)).toBe(false);
  });
});

describe('relatedService', () => {
  beforeEach(() => fetchWithCache.mockReset());

  it('klucz strony: tworzenie i odczyt; zły klucz = null', () => {
    expect(parseRelatedKey(relatedKey('industry', 'e-commerce'))).toEqual({
      _type: 'industry',
      slug: 'e-commerce',
    });
    expect(parseRelatedKey('location:rzeszow')).toBeNull();
    expect(parseRelatedKey('article:')).toBeNull();
    expect(parseRelatedKey(':x')).toBeNull();
    expect(parseRelatedKey('bez-dwukropka')).toBeNull();
  });

  it('wiersz GROQ → pula: makiety odrzucone, slug branży publiczny, tematy zebrane', () => {
    expect(
      toPoolItem({ _type: 'caseStudy', slug: 'impackt-edu', title: 'M', category: 'web' }),
    ).toBe(null);
    expect(toPoolItem({ _type: 'industry', slug: 'saas--startups', title: 'SaaS' })).toEqual({
      _type: 'industry',
      slug: 'saas-startups',
      title: 'SaaS',
      topics: [],
    });
    expect(
      toPoolItem({
        _type: 'caseStudy',
        slug: 'x',
        title: 'X',
        category: 'web',
        subcategory: ['seo', 7],
        techStack: ['React'],
        platforms: null,
      })?.topics,
    ).toEqual(['web', 'seo', 'React']);
    expect(
      toPoolItem({ _type: 'article', slug: 'x', title: 'X', category: { _ref: 'c' } })?.topics,
    ).toEqual([]);
    expect(toPoolItem({ _type: 'location', slug: 'x', title: 'X' })).toBeNull();
    expect(toPoolItem({ _type: 'article', slug: 'x' })).toBeNull();
    expect(toPoolItem(null)).toBeNull();
  });

  it('getRelatedFor: jedno zapytanie o pulę i wybór dla bieżącej strony', async () => {
    fetchWithCache.mockResolvedValue([
      { _type: 'article', slug: 'a', title: 'A', tags: ['SEO'] },
      { _type: 'article', slug: 'b', title: 'B', tags: ['seo'] },
      { _type: 'caseStudy', slug: 'c', title: 'C', subcategory: ['seo'], category: 'web' },
    ]);
    const out = await relatedService.getRelatedFor('article:a');
    expect(keys(out)).toEqual(['article:b', 'caseStudy:c']);
    expect(fetchWithCache).toHaveBeenCalledTimes(1);
    expect(String(fetchWithCache.mock.calls[0][0])).toContain('"slug": slug.current');
  });

  it('getRelatedFor: zły klucz = pusta lista bez zapytania', async () => {
    expect(await relatedService.getRelatedFor('location:rzeszow')).toEqual([]);
    expect(fetchWithCache).not.toHaveBeenCalled();
  });

  it('getRelatedFor: błąd Sanity RZUCA CmsUnavailableError (pusty wynik z awarii nie trafia do zrzutu)', async () => {
    fetchWithCache.mockRejectedValueOnce(new Error('timeout'));
    const err = await relatedService.getRelatedFor('article:a').then(
      () => null,
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(CmsUnavailableError);
    expect(String((err as Error).message)).toBe(
      'Sanity niedostępne (getRelatedFor: article:a): timeout',
    );
  });

  it('getRelatedFor: odpowiedź null z CMS = pusta lista', async () => {
    fetchWithCache.mockResolvedValue(null);
    expect(await relatedService.getRelatedFor('article:a')).toEqual([]);
  });
});
