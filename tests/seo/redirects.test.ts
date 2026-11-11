import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { routes } from '../../routes.js';
import { INDUSTRY_SLUG_ALIASES } from '../../config/slugAliases.js';

// public/_redirects: pierwsza pasująca reguła wygrywa, catch-all `/*` musi być ostatni.
const rules = fs
  .readFileSync(path.resolve(__dirname, '../../public/_redirects'), 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [from, to, status] = l.split(/\s+/);
    return { from, to, status };
  });

const ALIASES: Record<string, string> = {
  '/kontakt': '/contact/',
  '/oferta': '/offers/',
  '/realizacje': '/portfolio/',
  // MIX-781 (S7): zgadywane adresy, które wcześniej dawały 404.
  '/cennik': '/offers/', // tymczasowo — brak osobnej strony z cennikiem
  '/opinie': '/wycena/',
  '/kalkulator': '/wycena/',
  '/audyt': '/audyt-360/',
};

describe('public/_redirects — polskie aliasy URL', () => {
  it('catch-all 404 jest ostatnią regułą', () => {
    expect(rules[rules.length - 1]).toEqual({ from: '/*', to: '/404.html', status: '404' });
  });

  it.each(Object.entries(ALIASES))('%s (z i bez slasha) → 301 %s', (alias, target) => {
    for (const from of [alias, `${alias}/`]) {
      const idx = rules.findIndex((r) => r.from === from);
      expect(idx, from).toBeGreaterThanOrEqual(0);
      expect(rules[idx]).toEqual({ from, to: target, status: '301' });
      expect(idx).toBeLessThan(rules.length - 1);
    }
    // Cel to realna, prerenderowana trasa (nie łańcuch przekierowań do 404).
    expect(routes).toContain(target);
    // Alias nie koliduje z istniejącą trasą.
    expect(routes).not.toContain(`${alias}/`);
  });
});

// MIX-921 (audyt MIX-897 P5): stary adres strony głównej z WordPressa dostawał od Google 404.
describe('public/_redirects — /home ze starego WordPressa', () => {
  it.each(['/home', '/home/'])('%s → 301 / przed catch-allem 404', (from) => {
    const idx = rules.findIndex((r) => r.from === from);
    expect(idx, from).toBeGreaterThanOrEqual(0);
    expect(rules[idx]).toEqual({ from, to: '/', status: '301' });
    expect(idx).toBeLessThan(rules.findIndex((r) => r.from === '/*'));
  });

  it('cel „/” jest trasą, a /home/ nie jest trasą (bez kolizji z prerenderem)', () => {
    expect(routes).toContain('/');
    expect(routes).not.toContain('/home/');
  });
});

// Cloudflare Pages: pierwsza pasująca reguła wygrywa; splat `/portal/*` NIE łapie `/portal`
// (bez slasha) — ten adres z maili dostawał HTTP 404 z catch-alla.
describe('public/_redirects — panel klienta', () => {
  const idxOf = (from: string) => rules.findIndex((r) => r.from === from);

  it('/portal (bez slasha, link z maili) → 301 /portal/ przed catch-allem', () => {
    const idx = idxOf('/portal');
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(rules[idx]).toEqual({ from: '/portal', to: '/portal/', status: '301' });
    expect(idx).toBeLessThan(idxOf('/*'));
  });

  it('/portal/* → SPA rewrite 200 na "/" (obsługuje też cel przekierowania /portal/)', () => {
    const idx = idxOf('/portal/*');
    expect(rules[idx]).toEqual({ from: '/portal/*', to: '/', status: '200' });
    expect(idx).toBeLessThan(idxOf('/*'));
  });
});

// MIX-1266 (audyt MIX-897 P9): błędne slugi i literówka z zewnątrz → 301, bez 404 i bez łańcuchów.
describe('public/_redirects — błędne slugi (P9)', () => {
  const idxOf = (from: string) => rules.findIndex((r) => r.from === from);
  const catchAll = () => idxOf('/*');

  it.each(Object.entries(INDUSTRY_SLUG_ALIASES))(
    '/branza/%s (z i bez slasha) → 301 /branza/%s/ przed regułą slasha i catch-allem',
    (legacy, pub) => {
      for (const from of [`/branza/${legacy}`, `/branza/${legacy}/`]) {
        const idx = idxOf(from);
        expect(idx, from).toBeGreaterThanOrEqual(0);
        expect(rules[idx]).toEqual({ from, to: `/branza/${pub}/`, status: '301' });
        // musi stać przed ogólną regułą /branza/:slug (pierwsza pasująca wygrywa)
        expect(idx).toBeLessThan(idxOf('/branza/:slug'));
        expect(idx).toBeLessThan(catchAll());
      }
    },
  );

  it('cel przekierowania branży kończy się slashem (bez łańcucha 301 przez /branza/:slug)', () => {
    for (const pub of Object.values(INDUSTRY_SLUG_ALIASES)) {
      const rule = rules.find((r) => r.to === `/branza/${pub}/`);
      expect(rule, pub).toBeDefined();
      expect(rule!.to.endsWith('/')).toBe(true);
    }
  });

  it.each([
    ['/baze-wiedzy', '/baza-wiedzy/'],
    ['/baze-wiedzy/', '/baza-wiedzy/'],
    ['/baze-wiedzy/:slug', '/baza-wiedzy/:slug/'],
    ['/baze-wiedzy/:slug/', '/baza-wiedzy/:slug/'],
  ])('literówka %s → 301 %s przed catch-allem', (from, to) => {
    const idx = idxOf(from);
    expect(idx, from).toBeGreaterThanOrEqual(0);
    expect(rules[idx]).toEqual({ from, to, status: '301' });
    expect(idx).toBeLessThan(catchAll());
  });

  it('cele to realne trasy: /baza-wiedzy/ jest w routes.js, nowe sloty branż nie kolidują z trasami statycznymi', () => {
    expect(routes).toContain('/baza-wiedzy/');
    for (const [legacy, pub] of Object.entries(INDUSTRY_SLUG_ALIASES)) {
      expect(routes).not.toContain(`/branza/${legacy}/`);
      expect(routes).not.toContain(`/branza/${pub}/`); // dokłada je generator z CMS
    }
  });
});
