// MIX-1276 (plan SEO A20): sekcja „Aplikacje i systemy z elementami AI” na stronie głównej i link
// z /web-development/custom-app/, za przełącznikiem VITE_MM_AI_SECTION (domyślnie wyłączony).
// Kryteria: wyłączony = HTML obu stron identyczny z wzorcem z gałęzi bazowej (tests/fixtures/mix1276,
// zdjęty przed zmianą); włączony = sekcja i link; sekcja pod hero (poza LCP), bez obrazów i stanu
// (CLS 0); axe bez naruszeń.
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import axe from 'axe-core';
import { renderHome, renderCustomApp } from '../helpers/aiSectionPages';
import { isAiSectionEnabled } from '../../config/flags';
import { AI_SYSTEMS_PATH } from '../../data/content/services/web-development/ai-systems';

const mk = vi.hoisted(() => (name: string) => async () => {
  const R = await import('react');
  return { default: () => R.createElement('div', { 'data-mock': name, 'data-testid': name }) };
});
vi.mock('../../services/cmsService', () => ({
  cmsService: {
    getArticles: () => Promise.resolve([]),
    getPricingSection: () => new Promise(() => {}),
  },
}));
vi.mock('../../components/sections/Hero', mk('hero'));
vi.mock('../../components/common/StickyMobileBar', () => ({ default: () => null }));
vi.mock('../../components/sections/WhyUs', mk('whyus'));
vi.mock('../../components/sections/Services', mk('services'));
vi.mock('../../components/sections/LeadMagnet', mk('leadmagnet'));
vi.mock('../../components/sections/KnowledgeBaseTeaser', mk('kb'));
vi.mock('../../components/sections/FinalBand', mk('final'));
vi.mock('../../components/common/StandardHero', mk('standardhero'));
vi.mock('../../components/common/HeroTrustLine', mk('trustline'));
vi.mock('../../components/common/WebDevSpokeFooter', mk('spokefooter'));
vi.mock('../../components/common/BaseCta', mk('basecta'));
vi.mock('../../components/common/LazyHydrate', async () => {
  const R = await import('react');
  return {
    default: ({ children }: { children: React.ReactNode }) =>
      R.createElement(R.Fragment, null, children),
  };
});
vi.mock('../../components/common/PricingTable', mk('pricing'));
vi.mock('../../components/features/web-development/CustomAppProof', mk('proof'));
vi.mock('../../components/features/web-development/CustomAppStart', mk('start'));
vi.mock('../../components/features/web-development/WebAppUseCases', mk('usecases'));
vi.mock('../../components/features/web-development/WebAppTechStack', mk('techstack'));
vi.mock('../../components/features/web-development/WebAppTrust', mk('trust'));
vi.mock('../../components/features/web-development/WebAppQaPipeline', mk('qa'));
vi.mock('../../components/sections/FaqSection', mk('faq'));

const root = path.resolve(__dirname, '../..');
const fixture = (n: string) =>
  fs.readFileSync(path.join(root, 'tests/fixtures/mix1276', n), 'utf8').replace(/\n$/, '');
const HOME_BASE = fixture('home-flag-off.html.txt');
const CUSTOM_BASE = fixture('customapp-flag-off.html.txt');

/** Czy `b` leży w dokumencie za `a`. */
const follows = (a: Node, b: Node) =>
  Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

/** Wartości, przy których sekcji ma NIE być (allowlista: tylko dokładnie „1”). */
const OFF: Array<string | undefined> = [undefined, '', '0', 'false', 'true', 'TRUE', ' 1', 'yes'];

const stubFlag = (v: string | undefined) =>
  vi.stubEnv('VITE_MM_AI_SECTION', v as unknown as string);

afterEach(() => {
  vi.unstubAllEnvs();
  cleanup();
});

describe('isAiSectionEnabled', () => {
  it.each(OFF)('%p = wyłączony', (v) => {
    stubFlag(v);
    expect(isAiSectionEnabled()).toBe(false);
  });
  it('„1” = włączony', () => {
    stubFlag('1');
    expect(isAiSectionEnabled()).toBe(true);
  });
});

describe('strona główna', () => {
  it.each(OFF)('przełącznik %p: HTML identyczny z wzorcem sprzed zmiany', async (v) => {
    stubFlag(v);
    const { container } = await renderHome();
    expect(container.innerHTML).toBe(HOME_BASE);
    expect(container.querySelector('#ai-systems')).toBeNull();
  });

  it('włączony: H2, wstęp, 3 punkty i link do strony usługi; reszta strony bez zmian', async () => {
    stubFlag('1');
    const { container } = await renderHome();
    const section = container.querySelector<HTMLElement>('#ai-systems')!;
    expect(section).not.toBeNull();
    const h2 = section.querySelector('h2')!;
    expect(h2.textContent).toBe('Aplikacje i systemy z elementami AI');
    expect(section.getAttribute('aria-labelledby')).toBe(h2.id);
    expect(section.querySelectorAll('li')).toHaveLength(3);
    const link = section.querySelector('a')!;
    expect(link.getAttribute('href')).toBe(AI_SYSTEMS_PATH);
    expect(link.textContent).toContain('systemy AI i aplikacje');
    // Po wycięciu sekcji zostaje dokładnie HTML sprzed zmiany: nic poza sekcją się nie ruszyło.
    expect(container.innerHTML.replace(section.outerHTML, '')).toBe(HOME_BASE);
  });

  it('włączony: sekcja pod hero (poza LCP), przed końcowym pasem, bez mediów i obrazów', async () => {
    stubFlag('1');
    const { container } = await renderHome();
    const section = container.querySelector<HTMLElement>('#ai-systems')!;
    const hero = container.querySelector('[data-mock="hero"]')!;
    const runway = container.querySelector('.hero-runway')!;
    const final = container.querySelector('[data-mock="final"]')!;
    expect(runway.contains(section)).toBe(false);
    expect(follows(hero, section)).toBe(true);
    expect(follows(section, final)).toBe(true);
    const media = 'img, picture, video, iframe, canvas, svg:not([aria-hidden])';
    expect(section.querySelectorAll(media)).toHaveLength(0);
  });

  it('kod sekcji nie ma stanu ani efektów (CLS 0: treść statyczna od pierwszego renderu)', () => {
    const src = fs.readFileSync(path.join(root, 'components/sections/AiSystemsTeaser.tsx'), 'utf8');
    expect(src).not.toMatch(/useState|useEffect|useLayoutEffect|useRef|lazy\(|<img|fetch\(/);
  });

  it('axe: 0 naruszeń w sekcji (kontrast mierzy audyt-strony na Preview)', async () => {
    stubFlag('1');
    const { container } = await renderHome();
    const section = container.querySelector('#ai-systems')!;
    const res = await axe.run(section, { rules: { 'color-contrast': { enabled: false } } });
    expect(res.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
});

describe('/web-development/custom-app/', () => {
  it.each(OFF)('przełącznik %p: HTML identyczny z wzorcem sprzed zmiany', (v) => {
    stubFlag(v);
    const { container } = renderCustomApp();
    expect(container.innerHTML).toBe(CUSTOM_BASE);
    expect(container.querySelector('a[href="' + AI_SYSTEMS_PATH + '"]')).toBeNull();
  });

  it('włączony: zdanie z linkiem po sekcji „co zbudujemy”; reszta bez zmian', () => {
    stubFlag('1');
    const { container } = renderCustomApp();
    const link = container.querySelector<HTMLAnchorElement>('a[href="' + AI_SYSTEMS_PATH + '"]')!;
    expect(link).not.toBeNull();
    expect(link.textContent).toBe('Systemy AI i aplikacje');
    const section = link.closest('section')!;
    const useCases = container.querySelector('[data-mock="usecases"]')!;
    const start = container.querySelector('[data-mock="start"]')!;
    expect(follows(useCases, section)).toBe(true);
    expect(follows(section, start)).toBe(true);
    expect(container.innerHTML.replace(section.outerHTML, '')).toBe(CUSTOM_BASE);
  });

  it('axe: 0 naruszeń w zdaniu z linkiem', async () => {
    stubFlag('1');
    const { container } = renderCustomApp();
    const link = container.querySelector('a[href="' + AI_SYSTEMS_PATH + '"]')!;
    const res = await axe.run(link.closest('section')!, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(res.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
});

describe('Preview', () => {
  it('ci.yml włącza przełącznik tylko dla celu preview (produkcja i PR: wyłączony)', () => {
    const ci = fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8');
    expect(ci).toContain(
      "VITE_MM_AI_SECTION: ${{ steps.target.outputs.target == 'preview' && '1' || '' }}",
    );
  });
});
