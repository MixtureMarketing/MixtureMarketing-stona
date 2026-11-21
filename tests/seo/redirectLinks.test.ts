/**
 * MIX-1825 (eksport GSC „Dlaczego strony nie są zindeksowane”, 16.11.2026, MIX-1824):
 * 404 → 301 na żywą stronę, przekierowania jednym skokiem na wersję z „/”, żaden link /
 * wpis w sitemap / canonical nie wskazuje adresu, który przekierowuje.
 *
 * Symulacja Cloudflare Pages: pierwsza pasująca reguła public/_redirects wygrywa
 * (scripts/check-redirect-links.mjs: firstMatch / redirectReason).
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { routes, prerenderOnlyRoutes } from '../../routes.js';
import {
  SITE,
  collectTargets,
  parseRedirects,
  firstMatch,
  ruleTarget,
  redirectReason,
  findRedirectingLinks,
} from '../../scripts/check-redirect-links.mjs';

const ROOT = path.resolve(__dirname, '../..');
const rules = parseRedirects(fs.readFileSync(path.join(ROOT, 'public/_redirects'), 'utf8'));
const sitemapPaths = [
  ...fs
    .readFileSync(path.join(ROOT, 'public/sitemap.xml'), 'utf8')
    .matchAll(/<loc>([^<]+)<\/loc>/g),
].map((m) => m[1].slice(SITE.length) || '/');
/** Adresy, które zwracają 200: trasy statyczne + strony z CMS z sitemap. */
const LIVE = new Set<string>([...routes, ...sitemapPaths]);

/** Jeden skok: pierwsza reguła daje 301, a cel jest żywą stroną, która już nie przekierowuje. */
const expectOneHop301 = (from: string, expectedTo?: string) => {
  const pathname = from.split('?')[0];
  const rule = firstMatch(rules, pathname);
  expect(rule, from).not.toBeNull();
  expect(rule!.status, from).toBe('301');
  const to = ruleTarget(rule!, pathname)!;
  if (expectedTo) expect(to, from).toBe(expectedTo);
  expect(LIVE.has(to), `${from} -> ${to} nie jest żywą stroną`).toBe(true);
  expect(redirectReason(rules, to), `${from} -> ${to} przekierowuje dalej (łańcuch)`).toBeNull();
};

describe('MIX-1825 — 404 z GSC dostają 301 na żywą stronę', () => {
  it.each([
    ['/home', '/'],
    ['/home/', '/'],
    ['/baza-wiedzy/glamspace', '/portfolio/glamspace/'],
    ['/baza-wiedzy/glamspace/', '/portfolio/glamspace/'],
    [
      '/baza-wiedzy/fbx-redesign-aplikacji-ogloszeniowej-i-kampania-performance',
      '/portfolio/fbx-redesign-aplikacji-ogloszeniowej-i-kampania-performance/',
    ],
    [
      '/baza-wiedzy/fbx-redesign-aplikacji-ogloszeniowej-i-kampania-performance/',
      '/portfolio/fbx-redesign-aplikacji-ogloszeniowej-i-kampania-performance/',
    ],
  ])('%s → 301 %s', (from, to) => expectOneHop301(from, to));
});

describe('MIX-1825 — duplikaty bez kanonicznej', () => {
  it.each(['/branza/saas--startups', '/branza/saas--startups/'])(
    '%s (podwójny myślnik) → 301 /branza/saas-startups/',
    (from) => expectOneHop301(from, '/branza/saas-startups/'),
  );

  it('pickme bez „/” → 301 na wersję z „/” (canonical wskazuje wersję z „/”)', () => {
    expectOneHop301(
      '/portfolio/high-performance-landing-page-dla-aplikacji-mobilnej-pickme',
      '/portfolio/high-performance-landing-page-dla-aplikacji-mobilnej-pickme/',
    );
  });
});

// Kolumna „URL” z eksportu GSC „Strona zawiera przekierowanie” (36 adresów, 16.11.2026).
const GSC_REDIRECTS = [
  '/web-development/custom-app',
  '/marketing/seo/rzeszow/',
  '/baza-wiedzy/server-side-tracking-koniec-cookies',
  '/baza-wiedzy/redis-optymalizacja',
  '/marketing',
  '/home/',
  '/abonament',
  '/contact',
  '/design',
  '/privacy-policy',
  '/baza-wiedzy/python-django-bezpieczenstwo-fintech-mvp',
  '/design/ui-ux',
  '/marketing/seo',
  '/baza-wiedzy?q=%7Bsearch_term_string%7D',
  '/portfolio',
  '/portfolio/fundacja-niepodzielni',
  '/design/visual-audit',
  '/baza-wiedzy/tailwind-css-utility-first-przyszlosc-projektowania',
  '/baza-wiedzy/backend-bez-tajemnic-przewodnik-cto',
  '/portfolio/high-performance-landing-page-dla-aplikacji-mobilnej-pickme',
  '/portfolio/impackt-edu',
  '/baza-wiedzy/bazy-danych-kompendium-architekta',
  '/baza-wiedzy/go-golang-jezyk-chmury',
  '/baza-wiedzy/vue-js-harmonijny-kompromis-react-angular',
  '/portfolio/bdb-biuro-strona',
  '/baza-wiedzy/devops-fundament-nowoczesnego-biznesu',
  '/baza-wiedzy/postgresql-krol-baz-danych-open-source-dla-biznesu',
  '/baza-wiedzy/docker-konteneryzacja-przewodnik',
  '/baza-wiedzy/typescript-polisa-ubezpieczeniowa-twojego-kodu',
  '/baza-wiedzy/nodejs-jeden-jezyk',
  '/baza-wiedzy/mongodb-nosql-przyszlosc-big-data-i-dynamicznych-aplikacji',
  '/baza-wiedzy/headless-wordpress-wydajnosc-i-bezpieczenstwo',
  '/baza-wiedzy/nextjs-zloty-standard-aplikacji-webowych',
  '/baza-wiedzy/react-js-najbezpieczniejsza-technologia-dla-biznesu',
  '/baza-wiedzy/ile-kosztuje-strona-internetowa-rzeszow-2026',
  '/baza-wiedzy/audyt-ux-sklepu-internetowego',
];

describe('MIX-1825 — przekierowania z GSC idą jednym skokiem 301', () => {
  it('lista z eksportu ma 36 adresów', () => expect(GSC_REDIRECTS).toHaveLength(36));
  it.each(GSC_REDIRECTS)('%s → jawne 301 na żywą stronę z „/”', (from) => expectOneHop301(from));
});

describe('MIX-1825 — każda strona bez „/” ma jawne 301 (nie 308 z Pages)', () => {
  const pages = [...LIVE].filter((p) => p !== '/');
  it.each(pages)('%s', (p) => expectOneHop301(p.replace(/\/$/, ''), p));

  it.each(['/robots.txt', '/sitemap.xml', '/favicon.ico', '/llms.txt', '/404.html'])(
    'plik %s nie jest przekierowywany (brak ogólnej reguły /:slug)',
    (file) => {
      expect(firstMatch(rules, file)?.status).not.toBe('301');
    },
  );
});

describe('MIX-1825 — linki, sitemap i canonical nie wskazują przekierowań', () => {
  it('scripts/check-redirect-links.mjs: 0 naruszeń w repo', async () => {
    const offenders = await findRedirectingLinks(ROOT);
    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  it('żadna reguła 301 w _redirects nie wskazuje adresu, który znów przekierowuje (łańcuch/pętla)', () => {
    const chains = rules
      .filter((r) => r.status === '301')
      .map((r) => ({ r, to: r.to.replace(/:[a-z_]+/gi, 'x').replace('*', 'x') }))
      .filter(({ to }) => redirectReason(rules, to) !== null)
      .map(({ r, to }) => `${r.from} -> ${to} (${redirectReason(rules, to)})`);
    expect(chains).toEqual([]);
  });

  it('każda strona w sitemap jest żywa i nie przekierowuje', () => {
    expect(sitemapPaths.length).toBeGreaterThan(0);
    for (const p of sitemapPaths) expect(redirectReason(rules, p), p).toBeNull();
  });

  it('skrypt sprawdza też routes.js (w tym prerenderOnlyRoutes spoza sitemap)', async () => {
    const fromRoutes = (await collectTargets(ROOT)).filter((t) => t.source === 'routes.js');
    expect(fromRoutes.map((t) => t.url)).toEqual([...routes, ...prerenderOnlyRoutes]);
  });

  it('samotest: redirectReason wykrywa adresy przekierowujące', () => {
    for (const bad of [
      '/kontakt/',
      '/contact',
      `${SITE}/home/`,
      '/baza-wiedzy/glamspace/',
      '/branza/saas--startups/',
      '/marketing/seo/rzeszow/',
      '/portfolio/${slug}',
    ]) {
      expect(redirectReason(rules, bad), bad).not.toBeNull();
    }
    // Brak „/” bez żadnej reguły 301 (Pages i tak przekierowuje) — jedyny sygnał to brak slasha.
    expect(firstMatch(rules, '/web-development/rzeszow/oferta')?.status).not.toBe('301');
    expect(redirectReason(rules, '/web-development/rzeszow/oferta')).not.toBeNull();
    for (const ok of [
      '/contact/',
      '/',
      SITE,
      `${SITE}/baza-wiedzy/?kategoria=seo`,
      '/portfolio/${slug}/',
      '/assets/images/x.png',
      '/api/contact-submit',
    ]) {
      expect(redirectReason(rules, ok), ok).toBeNull();
    }
  });

  it('JSON-LD bez SearchAction (szablon /baza-wiedzy?q={search_term_string} trafiał do GSC)', () => {
    const home = fs.readFileSync(path.join(ROOT, 'components/pages/Home.tsx'), 'utf8');
    expect(home).not.toMatch(/SearchAction|search_term_string/);
  });
});
