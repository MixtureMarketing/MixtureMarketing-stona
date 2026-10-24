import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import {
  fetchDynamicLists,
  toRoutes,
  DYNAMIC_COLLECTIONS,
} from '../../scripts/sanity-dynamic-routes.js';

// Regresja (raport 3/10): przy błędzie Sanity prerender i sitemapa jechały dalej z pustą
// listą — zielony build bez /branza/*, /miasto/*, /portfolio/* (404 na produkcji).

const QUERIES = Object.fromEntries(DYNAMIC_COLLECTIONS.map(({ type }) => [type, `q:${type}`]));

const clientWith = (byType: Record<string, unknown>) => ({
  fetch: vi.fn(async (q: string) => {
    const v = byType[q.slice(2)];
    if (v instanceof Error) throw v;
    return v;
  }),
});

const FULL = {
  article: [{ slug: 'a1' }],
  industry: [{ slug: 'e-commerce' }],
  location: [{ slug: 'rzeszow' }],
  caseStudy: [{ slug: 'p1' }],
};

describe('fetchDynamicLists — fail-loud', () => {
  it('poprawne, niepuste listy → zwraca je; toRoutes buduje trasy z prefiksami', async () => {
    const lists = await fetchDynamicLists(clientWith(FULL), QUERIES, { allowEmpty: false });
    expect(toRoutes(lists)).toEqual([
      '/baza-wiedzy/a1',
      '/branza/e-commerce',
      '/miasto/rzeszow',
      '/portfolio/p1',
    ]);
  });

  it('błąd pobrania którejkolwiek listy → wyjątek z czytelnym komunikatem', async () => {
    const client = clientWith({ ...FULL, industry: new Error('Request failed 503') });
    await expect(fetchDynamicLists(client, QUERIES, { allowEmpty: false })).rejects.toThrow(
      /Nie udało się pobrać listy tras \/branza\/\* z Sanity.*503.*Build przerwany/,
    );
  });

  it('pusta lista przy poprawnej odpowiedzi → wyjątek (produkcja ma te strony)', async () => {
    const client = clientWith({ ...FULL, caseStudy: [], location: [] });
    await expect(fetchDynamicLists(client, QUERIES, { allowEmpty: false })).rejects.toThrow(
      /PUSTĄ listę dla: location \(\/miasto\/\*\), caseStudy \(\/portfolio\/\*\)/,
    );
  });

  it('pustą listę można świadomie dopuścić (ALLOW_EMPTY_SANITY_ROUTES)', async () => {
    const client = clientWith({ ...FULL, caseStudy: [] });
    const lists = await fetchDynamicLists(client, QUERIES, { allowEmpty: true });
    expect(lists.caseStudy).toEqual([]);
  });

  it('odpowiedź, która nie jest tablicą → wyjątek', async () => {
    const client = clientWith({ ...FULL, article: null });
    await expect(fetchDynamicLists(client, QUERIES, { allowEmpty: false })).rejects.toThrow(
      /nieoczekiwaną odpowiedź dla typu "article"/,
    );
  });

  it('toRoutes pomija dokumenty bez sluga (zamiast /branza/null)', () => {
    expect(toRoutes({ ...FULL, industry: [{ slug: null }, { slug: 'b2b' }] })).toContain(
      '/branza/b2b',
    );
    expect(toRoutes({ ...FULL, industry: [{ slug: null }] })).not.toContain('/branza/null');
  });
});

describe('prerender.js / generate-sitemap.js używają wersji fail-loud', () => {
  const read = (p: string) => fs.readFileSync(path.resolve(__dirname, '../..', p), 'utf8');

  it.each(['prerender.js', 'scripts/generate-sitemap.js'])('%s', (file) => {
    const src = read(file);
    expect(src).toMatch(/sanity-dynamic-routes\.js/);
    expect(src).toMatch(/fetchDynamicLists\(/);
    // Stary wzorzec „ostrzeż i jedź dalej z pustą listą" nie może wrócić.
    expect(src).not.toMatch(/Failed to fetch dynamic routes/);
  });

  it('prerender.js nie robi process.exit(1) w catch (ucinało finally → żywy preview)', () => {
    expect(read('prerender.js')).not.toMatch(
      /catch \(err\) \{\s*console\.error\([^)]*\);\s*process\.exit\(1\)/,
    );
  });
});
