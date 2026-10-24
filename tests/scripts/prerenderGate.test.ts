import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { checkPrerenderedPage } from '../../scripts/prerender-gate.js';
import { prerenderOnlyRoutes } from '../../routes.js';

const ok = { noindex: false, title: 'Strona WWW | Mixture Marketing' };
const notFoundTitle = '404 - Nie znaleziono strony | Mixture Marketing';

describe('bramka prerenderu (scripts/prerender-gate.js)', () => {
  it('przepuszcza zwykłą stronę', () => {
    expect(checkPrerenderedPage('/baza-wiedzy/x', ok)).toBeNull();
  });

  it('wywala trasę z kolejki, która wyrenderowała się jako 404 (tytuł)', () => {
    const problem = checkPrerenderedPage('/baza-wiedzy/x', { noindex: true, title: notFoundTitle });
    expect(problem).toMatch(/404/);
  });

  it('wywala trasę z markerem NotFound nawet przy innym tytule', () => {
    expect(checkPrerenderedPage('/portfolio/x', { ...ok, notFound: true })).toMatch(/404/);
  });

  it('wywala nieoczekiwany noindex', () => {
    expect(checkPrerenderedPage('/offers/', { ...ok, noindex: true })).toMatch(/noindex/);
  });

  it('wywala stan błędu CMS i fallback ErrorBoundary', () => {
    expect(checkPrerenderedPage('/branza/x', { ...ok, cmsError: true })).toMatch(/CMS/);
    expect(checkPrerenderedPage('/', { ...ok, errorBoundary: true })).toMatch(/ErrorBoundary/);
  });

  it('prerenderOnlyRoutes mogą mieć noindex, ale nie mogą być stroną 404', () => {
    const opts = { prerenderOnlyRoutes };
    expect(
      checkPrerenderedPage('/abonament/dziekujemy/', { ...ok, noindex: true }, opts),
    ).toBeNull();
    expect(
      checkPrerenderedPage('/abonament/dziekujemy', { ...ok, noindex: true }, opts),
    ).toBeNull();
    expect(
      checkPrerenderedPage('/abonament/dziekujemy/', { noindex: true, title: notFoundTitle }, opts),
    ).toMatch(/404/);
  });

  it('miasta poza Rzeszowem mają celowy noindex (PseoTemplate) — ale Rzeszów nie', () => {
    expect(checkPrerenderedPage('/miasto/krakow', { ...ok, noindex: true })).toBeNull();
    expect(checkPrerenderedPage('/miasto/rzeszow', { ...ok, noindex: true })).toMatch(/noindex/);
    expect(
      checkPrerenderedPage('/miasto/krakow', { ...ok, noindex: true, notFound: true }),
    ).toMatch(/404/);
  });

  it('prerender.js używa bramki zamiast martwego detektora „< 500 znaków”', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../../prerender.js'), 'utf8');
    expect(src).toMatch(/checkPrerenderedPage\(route, signals, \{ prerenderOnlyRoutes \}\)/);
    expect(src).not.toMatch(/bodyText\.length < 500/);
  });
});
