// MIX-1326 kryterium 2: sekcja opinii o własnej firmie NIE emituje danych strukturalnych
// Review / AggregateRating (zasada Google dla opinii „self-serving”; kara ręczna za takie dane).
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ModalProvider } from '../../context/ModalContext';
import { cmsItems } from '../fixtures/testimonials';
import TestimonialsView from '../../components/sections/testimonials/TestimonialsView';
import { viewItems } from '../fixtures/testimonials';
import Home from '../../components/pages/Home';
import PortfolioPage from '../../components/pages/PortfolioPage';

const h = vi.hoisted(() => ({ getTestimonials: vi.fn() }));
vi.mock('../../services/cmsService', () => ({
  cmsService: {
    getTestimonials: (...a: unknown[]) => h.getTestimonials(...a),
    getCaseStudies: () => Promise.resolve([]),
    getCaseStudyList: () => Promise.resolve([]),
    getArticles: () => Promise.resolve([]),
  },
}));
vi.mock('../../services/cms/client', () => ({
  urlFor: () => ({ width: () => ({ height: () => ({ url: () => 'https://example.com/l.png' }) }) }),
}));
vi.mock('../../components/sections/Hero', () => ({ default: () => null }));
vi.mock('../../components/common/StickyMobileBar', () => ({ default: () => null }));
vi.mock('../../components/sections/WhyUs', () => ({ default: () => null }));
vi.mock('../../components/sections/Services', () => ({ default: () => null }));
vi.mock('../../components/sections/LeadMagnet', () => ({ default: () => null }));
vi.mock('../../components/sections/KnowledgeBaseTeaser', () => ({ default: () => null }));
vi.mock('../../components/sections/FinalBand', () => ({ default: () => null }));
vi.mock('../../components/features/portfolio/PortfolioGrid', () => ({ default: () => null }));

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

const FORBIDDEN_TYPES = ['Review', 'AggregateRating', 'Rating', 'EmployerAggregateRating'];
const FORBIDDEN_KEYS = ['review', 'reviews', 'aggregateRating', 'reviewRating', 'reviewBody'];

/** Zwraca opisy znalezisk: typ Review/AggregateRating albo klucz ocen w dowolnym miejscu drzewa. */
export const ratingLeaks = (ld: Json, trail = '$'): string[] => {
  if (ld === null || typeof ld !== 'object') return [];
  if (Array.isArray(ld)) return ld.flatMap((n, i) => ratingLeaks(n, `${trail}[${i}]`));
  const out: string[] = [];
  for (const [k, v] of Object.entries(ld)) {
    if (FORBIDDEN_KEYS.includes(k)) out.push(`${trail}.${k}`);
    if (k === '@type') {
      const types = Array.isArray(v) ? v : [v];
      for (const t of types)
        if (FORBIDDEN_TYPES.includes(String(t))) out.push(`${trail}.@type=${t}`);
    }
    out.push(...ratingLeaks(v, `${trail}.${k}`));
  }
  return out;
};

const headLd = (): Json[] =>
  Array.from(document.head.querySelectorAll('script[type="application/ld+json"]')).flatMap((s) => {
    const d = JSON.parse(s.textContent || 'null') as Json;
    return Array.isArray(d) ? d : [d];
  });

const renderPage = (el: React.ReactElement, p: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[p]}>
        <ModalProvider>{el}</ModalProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

beforeEach(() => {
  document.head.innerHTML = '';
});
afterEach(() => {
  vi.unstubAllEnvs();
  h.getTestimonials.mockReset();
});

describe('wykrywacz Review/AggregateRating (test nie jest pusty)', () => {
  it.each([
    ['typ Review', { '@type': 'Review', reviewBody: 'x' }],
    ['typ AggregateRating', { '@type': 'Organization', x: { '@type': 'AggregateRating' } }],
    ['klucz aggregateRating', { '@type': 'LocalBusiness', aggregateRating: { ratingValue: 5 } }],
    ['klucz review w tablicy', [{ '@type': 'Service', review: [{ '@type': 'Review' }] }]],
    ['typ w tablicy typów', { '@type': ['Organization', 'Review'] }],
  ])('wykrywa: %s', (_n, ld) => {
    expect(ratingLeaks(ld as Json).length).toBeGreaterThan(0);
  });

  it('dozwolony bliźniak: zwykły WebSite/Organization przechodzi', () => {
    const ok = { '@type': 'Organization', name: 'Mixture Marketing', sameAs: ['https://x.pl'] };
    expect(ratingLeaks(ok as Json)).toEqual([]);
  });
});

describe.each([
  ['strona główna', Home, '/'],
  ['portfolio', PortfolioPage, '/portfolio/'],
] as Array<[string, React.ComponentType, string]>)(
  '%s z włączoną sekcją opinii: brak Review/AggregateRating',
  (_name, Page, p) => {
    it('żaden JSON-LD w <head> nie ma typu ani klucza ocen, a sekcja jest w DOM', async () => {
      vi.stubEnv('VITE_MM_TESTIMONIALS', '1');
      h.getTestimonials.mockResolvedValue(cmsItems);
      const { container } = renderPage(<Page />, p);
      await screen.findByRole('heading', { level: 2, name: 'Opinie klientów' });
      const blocks = headLd();
      expect(blocks.length).toBeGreaterThanOrEqual(1);
      expect(blocks.flatMap((b) => ratingLeaks(b))).toEqual([]);
      expect(container.querySelector('script[type="application/ld+json"]')).toBeNull();
    });
  },
);

describe('sama sekcja opinii nie emituje danych strukturalnych', () => {
  it('brak <script ld+json>, mikrodanych itemtype/itemprop/itemscope i RDFa typeof', () => {
    const { container } = render(<TestimonialsView items={viewItems} />);
    expect(container.querySelector('script')).toBeNull();
    expect(
      container.querySelector('[itemscope], [itemtype], [itemprop], [typeof], [property]'),
    ).toBeNull();
    expect(container.innerHTML).not.toMatch(/Review|AggregateRating|ratingValue/);
  });

  it('kod źródłowy sekcji i warstwy SEO nie zawiera Review/AggregateRating', () => {
    const root = path.resolve(__dirname, '../..');
    const dirs = ['components/sections/testimonials', 'utils/seo', 'utils/testimonials.ts'];
    const files: string[] = [];
    const walk = (p: string) => {
      const full = path.join(root, p);
      if (fs.statSync(full).isDirectory())
        fs.readdirSync(full).forEach((f) => walk(path.join(p, f)));
      else files.push(full);
    };
    dirs.forEach(walk);
    expect(files.length).toBeGreaterThan(3);
    for (const f of files) {
      expect(fs.readFileSync(f, 'utf8'), f).not.toMatch(
        /AggregateRating|"@type":\s*"Review"|'@type':\s*'Review'|aggregateRating/,
      );
    }
  });
});
