// MIX-1269 (plan SEO A12): strona główna pod „agencja marketingowa Rzeszów”, za przełącznikiem
// VITE_MM_HOME_SEO (domyślnie wyłączony).
// Kryteria: wyłączony = HTML treści, title, meta, canonical i JSON-LD identyczne z wzorcem zdjętym
// z kodu bazowego (tests/fixtures/mix1269/home-flag-off.json, .bieg/m1269/zrzut.sh); włączony =
// nowy title ≤ 60 i meta ≤ 155 znaków, fraza w title i H1 dokładnie raz, jeden H1, canonical
// i JSON-LD bez zmian, 5 linków lokalnych i usług z adresów w sitemap.xml; poza H1 i pasem
// linków strona bez zmian; axe bez naruszeń serious/critical.
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import axe from 'axe-core';
import { renderHomeSeo, snapshotHome, type HomeSnapshot } from '../helpers/homeSeoPage';
import { isHomeSeoEnabled } from '../../config/flags';
import {
  HOME_LOCAL_LINKS,
  HOME_SEO,
  HOME_SEO_BASE,
  HOME_SEO_PHRASE,
} from '../../data/content/pages/homeSeo';
import { fitTitle } from '../../utils/seo/title';

const mk = vi.hoisted(() => (name: string) => async () => {
  const R = await import('react');
  return { default: () => R.createElement('div', { 'data-mock': name, 'data-testid': name }) };
});
vi.mock('../../services/cmsService', () => ({
  cmsService: { getArticles: () => Promise.resolve([]) },
}));
vi.mock('../../components/visuals/hero/MixtureField', mk('field'));
vi.mock('../../components/common/StickyMobileBar', () => ({ default: () => null }));
vi.mock('../../components/sections/WhyUs', mk('whyus'));
vi.mock('../../components/sections/LeadMagnet', mk('leadmagnet'));
vi.mock('../../components/sections/KnowledgeBaseTeaser', mk('kb'));
vi.mock('../../components/sections/FinalBand', mk('final'));

const root = path.resolve(__dirname, '../..');
const BASE: HomeSnapshot = JSON.parse(
  fs.readFileSync(path.join(root, 'tests/fixtures/mix1269/home-flag-off.json'), 'utf8'),
);
const SITEMAP = fs.readFileSync(path.join(root, 'public/sitemap.xml'), 'utf8');

/** Wartości, przy których zmian ma NIE być (allowlista: tylko dokładnie „1”). */
const OFF: Array<string | undefined> = [undefined, '', '0', 'false', 'true', 'TRUE', ' 1', '1 '];

const stubFlag = (v: string | undefined) => vi.stubEnv('VITE_MM_HOME_SEO', v as unknown as string);

/** Liczba wystąpień frazy (bez rozróżniania wielkości liter). */
const count = (text: string, phrase = HOME_SEO_PHRASE) =>
  text.toLocaleLowerCase('pl-PL').split(phrase).length - 1;

/** Opis pierwszej różnicy (komunikat porażki; długie HTML w jednej linii vitest ucina). */
const firstDiff = (a: string, b: string) => {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return `pierwsza różnica na znaku ${i}: …${a.slice(Math.max(0, i - 80), i + 80)}… ≠ …${b.slice(Math.max(0, i - 80), i + 80)}…`;
};

/** Pas „Lokalnie · Rzeszów”: lista linków z hubem lokalnym. */
const band = (el: ParentNode) =>
  [...el.querySelectorAll<HTMLElement>('div.flex.flex-wrap.gap-2')].find((d) =>
    d.querySelector('a[href="/miasto/rzeszow/"]'),
  );

afterEach(() => {
  vi.unstubAllEnvs();
  cleanup();
  document.head.innerHTML = '';
  document.title = '';
});

describe('isHomeSeoEnabled', () => {
  it.each(OFF)('%p = wyłączony', (v) => {
    stubFlag(v);
    expect(isHomeSeoEnabled()).toBe(false);
  });
  it('„1” = włączony', () => {
    stubFlag('1');
    expect(isHomeSeoEnabled()).toBe(true);
  });
});

describe('wzorzec bazowy (sanity)', () => {
  it('wzorzec ma dzisiejszy title, meta, jeden H1 i 4 linki pasa lokalnego', () => {
    expect(BASE.title).toBe(HOME_SEO_BASE.title);
    expect(BASE.description).toBe(HOME_SEO_BASE.description);
    const d = document.createElement('div');
    d.innerHTML = BASE.html;
    expect(d.querySelectorAll('h1')).toHaveLength(1);
    expect(band(d)!.querySelectorAll('a')).toHaveLength(4);
  });
});

describe('przełącznik wyłączony', () => {
  it.each(OFF)('wartość %s: strona główna identyczna z wzorcem sprzed zmiany', async (v) => {
    stubFlag(v);
    const { container } = await renderHomeSeo();
    const snap = snapshotHome(container);
    expect(snap.html, firstDiff(snap.html, BASE.html)).toBe(BASE.html);
    expect(snap.title).toBe(BASE.title);
    expect(snap.description).toBe(BASE.description);
    expect(snap.canonical).toBe(BASE.canonical);
    expect(snap.jsonLd).toEqual(BASE.jsonLd);
  });
});

describe('przełącznik włączony', () => {
  it('title: nowy, ≤ 60 znaków, fraza dokładnie raz', async () => {
    stubFlag('1');
    await renderHomeSeo();
    expect(document.title).toBe(fitTitle(HOME_SEO.title, 'Mixture Marketing'));
    expect(document.title).toBe(HOME_SEO.title);
    expect(document.title.length).toBeLessThanOrEqual(60);
    expect(count(document.title)).toBe(1);
  });

  it('meta description: nowa, ≤ 155 znaków', async () => {
    stubFlag('1');
    const { container } = await renderHomeSeo();
    const { description } = snapshotHome(container);
    expect(description).toBe(HOME_SEO.description);
    expect(description!.length).toBeLessThanOrEqual(155);
    expect(description).not.toBe(BASE.description);
  });

  it('jeden H1, fraza w H1 dokładnie raz, tekst czytelny ze spacjami', async () => {
    stubFlag('1');
    const { container } = await renderHomeSeo();
    const h1s = container.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
    const text = h1s[0].textContent!.replace(/\s+/g, ' ').trim();
    expect(text).toBe('Agencja marketingowa Rzeszów. Nie szukaj wykonawców. Wybierz Partnera.');
    expect(count(text)).toBe(1);
  });

  it('canonical i JSON-LD bez zmian, JSON-LD poprawny', async () => {
    stubFlag('1');
    const { container } = await renderHomeSeo();
    const snap = snapshotHome(container);
    expect(snap.canonical).toBe('https://mixturemarketing.pl/');
    expect(snap.canonical).toBe(BASE.canonical);
    expect(snap.jsonLd).toEqual(BASE.jsonLd);
    expect(snap.jsonLd.length).toBeGreaterThan(0);
    for (const j of snap.jsonLd) expect(() => JSON.parse(j)).not.toThrow();
  });

  it('pas lokalny: 5 linków w kolejności z danych, każdy adres w sitemap.xml', async () => {
    stubFlag('1');
    const { container } = await renderHomeSeo();
    const links = [...band(container)!.querySelectorAll('a')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(HOME_LOCAL_LINKS.map((l) => l.to));
    expect(links.map((a) => a.textContent!.trim())).toEqual(HOME_LOCAL_LINKS.map((l) => l.label));
    expect(links.length).toBeGreaterThanOrEqual(3);
    expect(links.length).toBeLessThanOrEqual(5);
    for (const l of HOME_LOCAL_LINKS) {
      expect(l.to).toMatch(/^\/[a-z0-9/-]+\/$/);
      expect(SITEMAP).toContain(`<loc>https://mixturemarketing.pl${l.to}</loc>`);
    }
    // Kotwice nie powtarzają frazy z title/H1 (fraza raz na stronie w nagłówkach).
    for (const l of HOME_LOCAL_LINKS) expect(count(l.label)).toBe(0);
    expect(links.filter((a) => a.className.includes('bg-secondary'))).toHaveLength(1);
  });

  it('poza pierwszą linią H1 i pasem linków HTML identyczny z wzorcem', async () => {
    stubFlag('1');
    const { container } = await renderHomeSeo();
    const live = container.cloneNode(true) as HTMLElement;
    const lead = [...live.querySelectorAll('h1 > span')].find(
      (s) => s.textContent === HOME_SEO.h1Lead,
    )!;
    expect(lead).toBeDefined();
    // Usuń linię frazy i spację po niej (węzeł tekstowy „ ”).
    const next = lead.nextSibling;
    expect(next?.nodeType).toBe(Node.TEXT_NODE);
    expect(next?.textContent).toBe(' ');
    next!.remove();
    lead.remove();
    const base = document.createElement('div');
    base.innerHTML = BASE.html;
    band(live)!.replaceWith(band(base)!.cloneNode(true));
    expect(live.innerHTML, firstDiff(live.innerHTML, BASE.html)).toBe(BASE.html);
  });

  it('axe (wcag2a/aa): 0 naruszeń serious/critical', async () => {
    stubFlag('1');
    const { container } = await renderHomeSeo();
    const res = await axe.run(container, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
      rules: { 'color-contrast': { enabled: false } },
    });
    const bad = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(bad.map((v) => v.id)).toEqual([]);
  });
});
