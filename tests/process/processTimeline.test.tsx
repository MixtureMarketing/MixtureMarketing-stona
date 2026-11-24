// MIX-1317: K1 „Oś procesu” w sekcjach procesu podstron usług, za przełącznikiem
// VITE_MM_PROCESS_TIMELINE (domyślnie wyłączony).
// Kryteria: wyłączony = HTML sekcji procesu identyczny co do znaku z wzorcem z kodu bazowego
// (tests/fixtures/mix1317/process-flag-off.json, zrzut .bieg/m1317/zrzut.sh na integracja bc51ab2);
// włączony = jedna oś K1 z tyloma krokami co dziś, te same tytuły i opisy w tej samej kolejności,
// numery 1..n ukryte przed czytnikiem (kolejność niesie <ol>), bez stylów zależnych od JS (--p);
// sam CSS: animacje tylko przy wsparciu animation-timeline i bez „ogranicz ruch”, stan końcowy
// opacity 1, animowane wyłącznie transform/opacity/kolor; komputer = rząd na całą szerokość;
// axe bez naruszeń serious/critical.
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import axe from 'axe-core';
import {
  PROCESS_PAGES,
  findProcessSection,
  renderProcessPage,
  stableHtml,
  type ProcessPage,
} from '../helpers/processPages';
import { isProcessTimelineEnabled } from '../../config/flags';
import { K1_LONG_FROM } from '../../components/common/ProcessTimeline';

vi.mock('../../utils/analytics', () => ({ trackEvent: vi.fn() }));
vi.mock('../../services/cmsService', () => ({
  cmsService: {
    getArticles: () => Promise.resolve([]),
    getPricingSection: () => Promise.resolve(null),
  },
}));
vi.mock('../../components/common/StickyMobileBar', () => ({ default: () => null }));

const root = path.resolve(__dirname, '../..');
const BASE: Record<string, string> = JSON.parse(
  fs.readFileSync(path.join(root, 'tests/fixtures/mix1317/process-flag-off.json'), 'utf8'),
);
const CSS = fs.readFileSync(path.join(root, 'index.css'), 'utf8');
const COMPONENT = fs.readFileSync(path.join(root, 'components/common/ProcessTimeline.tsx'), 'utf8');

/** Wartości, przy których zmian ma NIE być (allowlista: tylko dokładnie „1”). */
const OFF: Array<string | undefined> = [undefined, '', '0', 'false', 'true', ' 1', '1 '];
const stubFlag = (v: string | undefined) =>
  vi.stubEnv('VITE_MM_PROCESS_TIMELINE', v as unknown as string);

const firstDiff = (a: string, b: string) => {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return `pierwsza różnica na znaku ${i}: …${a.slice(Math.max(0, i - 80), i + 80)}… ≠ …${b.slice(Math.max(0, i - 80), i + 80)}…`;
};

/**
 * Tytuły i opisy kroków w kolejności: H3 i pierwszy akapit po nim w najbliższym przodku, który
 * taki akapit ma (stare układy zawijają H3 w osobny div z ikoną albo etykietą).
 */
const stepTexts = (el: HTMLElement) =>
  [...el.querySelectorAll('h3')].map((h) => {
    let desc: string | null = null;
    for (let a = h.parentElement; a && desc === null; a = a.parentElement) {
      const p = [...a.querySelectorAll('p')].find(
        (x) => h.compareDocumentPosition(x) & Node.DOCUMENT_POSITION_FOLLOWING,
      );
      if (p) desc = p.textContent?.trim() ?? '';
      if (a === el) break;
    }
    return { title: h.textContent?.trim(), desc };
  });

async function section(p: ProcessPage, flag: string | undefined) {
  stubFlag(flag);
  renderProcessPage(p);
  return findProcessSection(p);
}

afterEach(() => {
  vi.unstubAllEnvs();
  cleanup();
});

describe('isProcessTimelineEnabled', () => {
  it.each(OFF)('%p = wyłączony', (v) => {
    stubFlag(v);
    expect(isProcessTimelineEnabled()).toBe(false);
  });
  it('"1" = włączony', () => {
    stubFlag('1');
    expect(isProcessTimelineEnabled()).toBe(true);
  });
});

describe('wzorzec z bazy obejmuje wszystkie podstrony', () => {
  it('6 podstron, każda z wycinkiem we wzorcu', () => {
    expect(PROCESS_PAGES).toHaveLength(6);
    expect(Object.keys(BASE).sort()).toEqual(PROCESS_PAGES.map((p) => p.path).sort());
    for (const p of PROCESS_PAGES) expect(BASE[p.path].length).toBeGreaterThan(500);
  });
});

describe.each(PROCESS_PAGES)('$path', (p) => {
  it.each(['', '0', 'true'])(
    'wyłączony (%p) = HTML sekcji identyczny z bazą, bez K1',
    async (v) => {
      const el = await section(p, v);
      const html = stableHtml(el.outerHTML);
      expect(el.querySelector('[data-k1]')).toBeNull();
      expect(html === BASE[p.path], firstDiff(html, BASE[p.path])).toBe(true);
    },
  );

  it('włączony = jedna oś K1, te same kroki, numery 1..n, bez stylów z JS', async () => {
    const off = stepTexts(await section(p, ''));
    cleanup();
    vi.unstubAllEnvs();
    const el = await section(p, '1');
    const k1 = el.querySelectorAll<HTMLElement>('[data-k1]');
    expect(k1).toHaveLength(1);
    const os = k1[0];
    expect(os.classList.contains('mm-k1')).toBe(true);
    expect(os.classList.contains('mm-k1--dlugi')).toBe(p.steps >= K1_LONG_FROM);
    expect(os.style.getPropertyValue('--k1-n')).toBe(String(p.steps));
    const ol = os.querySelectorAll('ol.mm-k1-kroki');
    expect(ol).toHaveLength(1);
    const li = ol[0].querySelectorAll(':scope > li.mm-k1-krok');
    expect(li).toHaveLength(p.steps);
    const nr = [...os.querySelectorAll('.mm-k1-nr')];
    expect(nr.map((n) => n.textContent)).toEqual(
      Array.from({ length: p.steps }, (_, i) => String(i + 1)),
    );
    for (const n of nr) expect(n.getAttribute('aria-hidden')).toBe('true');
    expect(os.querySelector('.mm-k1-linia')?.getAttribute('aria-hidden')).toBe('true');
    // Treść kroków bez zmian (tytuł + opis, kolejność), stara lista znika.
    expect(stepTexts(os)).toEqual(off);
    expect(off).toHaveLength(p.steps);
    expect(el.querySelectorAll('h3')).toHaveLength(p.steps);
    // JS 0: nic w sekcji z osią nie zależy od zmiennej przewijania ustawianej skryptem.
    for (const x of [el, ...el.querySelectorAll<HTMLElement>('*')])
      expect(x.getAttribute('style') ?? '').not.toMatch(/var\(--p/);
    // Oś view() bierze najbliższy kontener przewijania: overflow hidden/auto/scroll między osią
    // a sekcją zatrzymałby animację (tak było w BrandProcess przez SectionWrapper).
    for (let a = os.parentElement; a; a = a.parentElement) {
      expect(a.className).not.toMatch(/(^|\s)overflow-(x-|y-)?(hidden|auto|scroll)(\s|$)/);
      if (a === el) break;
    }
    // Nagłówek sekcji zostaje jeden.
    expect(el.querySelectorAll('h2')).toHaveLength(1);
  });

  it('włączony: axe (wcag2a/aa) 0 naruszeń serious/critical w sekcji', async () => {
    const el = await section(p, '1');
    const res = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
      rules: { 'color-contrast': { enabled: false } },
    });
    const bad = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(bad.map((v) => v.id)).toEqual([]);
  });
});

/** Blok `{…}` zaczynający się od pierwszego `{` po indeksie `at` (indeksy otwarcia i zamknięcia). */
const block = (s: string, at: number): [number, number] => {
  const open = s.indexOf('{', at);
  let d = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === '{') d++;
    else if (s[i] === '}' && --d === 0) return [open, i];
  }
  throw new Error('niedomknięty blok CSS');
};

describe('CSS K1 (index.css): sam CSS, ogranicz ruch, stan końcowy widoczny', () => {
  const start = CSS.indexOf('/* MIX-1317 K1');
  const kfNr = CSS.indexOf('@keyframes mm-k1-nr');
  const k1 = CSS.slice(start, block(CSS, kfNr)[1] + 1);
  const supAt = k1.indexOf('@supports (animation-timeline: view())');
  const [supOpen, supClose] = supAt >= 0 ? block(k1, supAt) : [-1, -1];
  const sup = k1.slice(supOpen + 1, supClose);

  it('blok K1 istnieje i ma jeden @supports (animation-timeline: view())', () => {
    expect(start).toBeGreaterThan(0);
    expect(supAt).toBeGreaterThan(0);
    expect(k1.split('@supports').length - 1).toBe(1);
  });

  it('animacje wyłącznie wewnątrz @supports i @media (prefers-reduced-motion: no-preference)', () => {
    const poza = k1.slice(0, supAt) + k1.slice(supClose + 1);
    expect(poza).not.toMatch(/animation(-name|-timeline|-range)?\s*:/);
    expect(poza).not.toMatch(/view-timeline/);
    // W @supports tylko bloki @media i każdy z nich wymaga braku „ogranicz ruch”.
    let reszta = sup;
    let i = reszta.indexOf('@media');
    let media = 0;
    while (i >= 0) {
      const [o, c] = block(reszta, i);
      expect(reszta.slice(i, o)).toContain('(prefers-reduced-motion: no-preference)');
      reszta = reszta.slice(0, i) + reszta.slice(c + 1);
      media++;
      i = reszta.indexOf('@media');
    }
    expect(media).toBeGreaterThanOrEqual(3);
    expect(reszta).not.toContain('{');
  });

  it('każda animacja: fill both, oś przewijania; kroki kończą na opacity 1 bez przesunięcia', () => {
    const shorthand = [...sup.matchAll(/animation:\s*([^;]+);/g)].map((m) => m[1]);
    expect(shorthand.length).toBe(3);
    for (const a of shorthand) expect(a).toMatch(/\bboth\b/);
    expect(sup.match(/animation-timeline:/g)?.length).toBe(3);
    for (const name of ['mm-k1-tekst', 'mm-k1-tekst-y']) {
      const at = k1.indexOf(`@keyframes ${name} `);
      expect(at).toBeGreaterThan(0);
      const kf = k1.slice(...block(k1, at));
      const to = kf.slice(kf.indexOf('to'));
      expect(to).toMatch(/opacity:\s*1;/);
      expect(to).toMatch(/transform:\s*none;/);
    }
  });

  it('keyframes animują tylko transform, opacity, tło i kolor (bez zmian układu = CLS 0)', () => {
    const kfs = [...k1.matchAll(/@keyframes [\w-]+/g)].map((m) => k1.slice(...block(k1, m.index!)));
    expect(kfs).toHaveLength(5);
    for (const kf of kfs) {
      const props = [...kf.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]);
      for (const pr of props) expect(['transform', 'opacity', 'background', 'color']).toContain(pr);
    }
  });

  it('komputer: rząd kroków na całą szerokość (1024 px krótkie, 1280 px wszystkie)', () => {
    for (const q of ['@media (min-width: 1024px)', '@media (min-width: 1280px)']) {
      const at = k1.indexOf(q);
      expect(at).toBeGreaterThan(0);
      const b = k1.slice(...block(k1, at));
      expect(b).toContain('grid-template-columns: repeat(var(--k1-n), minmax(0, 1fr));');
    }
    expect(k1.slice(...block(k1, k1.indexOf('@media (min-width: 1024px)')))).toContain(
      ':not(.mm-k1--dlugi)',
    );
  });

  it('komponent bez JS: bez hooków, refów i nasłuchu zdarzeń', () => {
    expect(COMPONENT).not.toMatch(/use(State|Effect|LayoutEffect|Ref|SectionProgress)\b/);
    expect(COMPONENT).not.toMatch(/addEventListener|IntersectionObserver|requestAnimationFrame/);
  });
});
