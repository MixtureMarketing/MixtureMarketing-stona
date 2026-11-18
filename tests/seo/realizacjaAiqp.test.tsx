// MIX-1275: realizacja AI Q-PLAST w portfolio za przełącznikiem VITE_MM_REALIZACJA_AIQP.
// Wyłączony = trasy (prerender, sitemap), lista portfolio i strona realizacji jak z samego CMS.
// Włączony = wpis z repo na liście, strona z tym samym szablonem, JSON-LD z bezwzględnym zdjęciem,
// linki do strony usługi AI i wyceny; tekst zgodny ze szkicem docs/tresci/MIX-1275.md.
import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { PortableTextBlock } from '@portabletext/types';

const fetchWithCache = vi.hoisted(() => vi.fn());
vi.mock('@/services/cms/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/cms/client')>()),
  fetchWithCache,
}));
const getCaseStudyPage = vi.hoisted(() => vi.fn());
vi.mock('@/services/cmsService', async (importOriginal) => {
  const orig = await importOriginal<typeof import('@/services/cmsService')>();
  return { ...orig, cmsService: { ...orig.cmsService, getCaseStudyPage } };
});
vi.mock('@/components/articles/RelatedArticles', () => ({ default: () => null }));
vi.mock('@/components/common/Powiazane', () => ({ default: () => null }));
vi.mock('@/components/templates/case-study/CaseStudyNavigation', () => ({ default: () => null }));

import CaseStudyTemplate from '@/components/templates/CaseStudyTemplate';
import PortfolioGrid from '@/components/features/portfolio/PortfolioGrid';
import { isRealizacjaAiqpEnabled } from '@/config/flags';
import { realizacjaAiqpRoutes } from '../../routes.js';
import { caseStudyService, withRepoCaseStudies } from '@/services/cms/caseStudyService';
import { localImage, localImageSrc, urlFor } from '@/services/cms/client';
import {
  AIQP_CASE_STUDY,
  AIQP_IMAGE_SRC,
  AIQP_PATH,
  AIQP_SLUG,
  AI_SERVICE_PATH,
  WYCENA_PATH,
} from '@/data/realizacje/aiQPlast';
import { caseStudyTitle } from '@/utils/seo/title';
import type { SanityCaseStudy } from '@/types/sanity';

const FLAG = 'VITE_MM_REALIZACJA_AIQP';
const CMS_ROWS = [
  { _id: 'a', title: 'Alfa', slug: 'alfa', category: 'web' },
  { _id: 'b', title: 'Beta', slug: 'beta', category: 'marketing' },
] as SanityCaseStudy[];

beforeEach(() => {
  fetchWithCache.mockReset();
  getCaseStudyPage.mockReset();
  document.head.innerHTML = '';
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('isRealizacjaAiqpEnabled (allowlista: tylko "1")', () => {
  it.each([[undefined], [''], ['0'], ['true'], [' 1'], ['1 '], ['yes']])('%p = wyłączony', (raw) => {
    vi.stubEnv(FLAG, raw as unknown as string);
    expect(isRealizacjaAiqpEnabled()).toBe(false);
  });
  it('"1" = włączony', () => {
    vi.stubEnv(FLAG, '1');
    expect(isRealizacjaAiqpEnabled()).toBe(true);
  });
});

describe('routes.js (prerender i sitemap.xml)', () => {
  it.each([[undefined], [''], ['0'], ['true'], [' 1']])('%p = brak trasy', (raw) => {
    expect(realizacjaAiqpRoutes(raw)).toEqual([]);
  });
  it('"1" = dokładnie /portfolio/ai-q-plast/', () => {
    expect(realizacjaAiqpRoutes('1')).toEqual([AIQP_PATH]);
    expect(AIQP_PATH).toBe('/portfolio/ai-q-plast/');
  });
  it('lista tras bez przełącznika nie ma realizacji, z przełącznikiem ma ją raz (reszta bez zmian)', async () => {
    vi.stubEnv(FLAG, '');
    vi.resetModules();
    const off = (await import('../../routes.js')).routes as string[];
    expect(off).not.toContain(AIQP_PATH);
    expect(off.filter((r) => r.includes('ai-q-plast'))).toEqual([]);
    vi.stubEnv(FLAG, '1');
    vi.resetModules();
    const on = (await import('../../routes.js')).routes as string[];
    expect(on.filter((r) => r === AIQP_PATH)).toHaveLength(1);
    expect(on.filter((r) => r !== AIQP_PATH)).toEqual(off);
  });
});

describe('caseStudyService: lista i strona realizacji', () => {
  it('wyłączony: lista z CMS bez zmian (ta sama tablica), strona ai-q-plast idzie do CMS', async () => {
    fetchWithCache.mockResolvedValue(CMS_ROWS);
    expect(await caseStudyService.getCaseStudyList()).toBe(CMS_ROWS);
    expect(await caseStudyService.getCaseStudies()).toBe(CMS_ROWS);
    fetchWithCache.mockResolvedValue(null);
    expect(await caseStudyService.getCaseStudyBySlug(AIQP_SLUG)).toBeNull();
    expect(fetchWithCache).toHaveBeenCalledTimes(3);
    expect(withRepoCaseStudies(CMS_ROWS)).toBe(CMS_ROWS);
  });

  it('wyłączony: błąd CMS w getCaseStudies = pusta lista (jak przed kartą)', async () => {
    fetchWithCache.mockRejectedValue(new Error('offline'));
    expect(await caseStudyService.getCaseStudies()).toEqual([]);
  });

  it('włączony: realizacja na początku listy, raz; reszta z CMS w tej samej kolejności', async () => {
    vi.stubEnv(FLAG, '1');
    fetchWithCache.mockResolvedValue(CMS_ROWS);
    const list = await caseStudyService.getCaseStudyList();
    expect(list.map((p) => p.slug)).toEqual([AIQP_SLUG, 'alfa', 'beta']);
    expect(list[0]).toBe(AIQP_CASE_STUDY);
    expect((await caseStudyService.getCaseStudies()).map((p) => p.slug)).toEqual([
      AIQP_SLUG,
      'alfa',
      'beta',
    ]);
  });

  it('włączony: wpis CMS o tym samym slugu wypada (bez dubla), filtr kategorii działa', async () => {
    vi.stubEnv(FLAG, '1');
    const dup = [{ _id: 'x', title: 'Stara', slug: AIQP_SLUG, category: 'web' }, ...CMS_ROWS];
    expect(withRepoCaseStudies(dup as SanityCaseStudy[]).map((p) => p._id)).toEqual([
      AIQP_CASE_STUDY._id,
      'a',
      'b',
    ]);
    expect(withRepoCaseStudies(CMS_ROWS, 'marketing')).toBe(CMS_ROWS);
    expect(withRepoCaseStudies(CMS_ROWS, 'web')[0]).toBe(AIQP_CASE_STUDY);
  });

  it('włączony: strona realizacji z repo bez zapytania do CMS; inne slugi dalej z CMS', async () => {
    vi.stubEnv(FLAG, '1');
    expect(await caseStudyService.getCaseStudyBySlug(AIQP_SLUG)).toBe(AIQP_CASE_STUDY);
    expect(fetchWithCache).not.toHaveBeenCalled();
    fetchWithCache.mockResolvedValue(CMS_ROWS[0]);
    expect(await caseStudyService.getCaseStudyBySlug('alfa')).toBe(CMS_ROWS[0]);
    expect(fetchWithCache).toHaveBeenCalledTimes(1);
  });

  it('włączony: błąd CMS w getCaseStudies = sama realizacja z repo; getCaseStudyList dalej rzuca', async () => {
    vi.stubEnv(FLAG, '1');
    fetchWithCache.mockRejectedValue(new Error('offline'));
    expect(await caseStudyService.getCaseStudies()).toEqual([AIQP_CASE_STUDY]);
    await expect(caseStudyService.getCaseStudyList()).rejects.toThrow();
  });
});

describe('urlFor: zdjęcie z repo (localImage)', () => {
  it('ścieżka lokalna niezależnie od łańcucha width/height/fit/auto', () => {
    const img = localImage(AIQP_IMAGE_SRC);
    expect(urlFor(img).width(1600).height(900).fit('crop').auto('format').url()).toBe(
      AIQP_IMAGE_SRC,
    );
    expect(localImageSrc(img)).toBe(AIQP_IMAGE_SRC);
  });
  it.each([
    'local://evil.example/x.webp',
    'local:https://evil.example/x.webp',
    'local:/../secret',
    'local:/a b.webp',
    'local:/x.webp?y=1',
    'local:x.webp',
    'local:',
  ])('niedozwolona ścieżka %s = nie lokalna', (ref) => {
    expect(localImageSrc({ _type: 'image', asset: { _ref: ref, _type: 'reference' } })).toBeNull();
  });
  it('obraz z Sanity bez zmian (adres CDN z auto=format)', () => {
    const url = urlFor({
      _type: 'image',
      asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg', _type: 'reference' },
    }).url();
    expect(url).toMatch(/^https:\/\/cdn\.sanity\.io\//);
    expect(url).toContain('auto=format');
  });
});

// --- treść ---
const spansText = (b: PortableTextBlock): string =>
  ((b.children ?? []) as { text?: string }[]).map((c) => c.text ?? '').join('');
const allBlocks = [
  ...(AIQP_CASE_STUDY.challenge ?? []),
  ...(AIQP_CASE_STUDY.solution ?? []),
  ...(AIQP_CASE_STUDY.result ?? []),
];
const links = allBlocks.flatMap(
  (b) => ((b.markDefs ?? []) as { _type: string; href: string }[]).map((m) => m.href) ?? [],
);
const draft = readFileSync(resolve(__dirname, '../../docs/tresci/MIX-1275.md'), 'utf8');
const draftBody = draft.split('## Treść (szkic)')[1].split('## Źródła')[0];
const norm = (s: string) =>
  s
    .replace(/\s*\[S\d(?:, S\d)*\]/g, '')
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*(?:#+|\d+\.|-)\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

describe('treść realizacji (kryterium 1)', () => {
  it('title ≤ 60 znaków i z marką; meta ≤ 155; H1 = tytuł', () => {
    const title = caseStudyTitle(AIQP_CASE_STUDY.title, 'Mixture Marketing');
    expect(title).toBe('AI Q-PLAST: system AI dla wtryskarek | Mixture Marketing');
    expect(title.length).toBeLessThanOrEqual(60);
    expect((AIQP_CASE_STUDY.excerpt ?? '').length).toBeGreaterThan(50);
    expect((AIQP_CASE_STUDY.excerpt ?? '').length).toBeLessThanOrEqual(155);
    expect(draft).toContain(`| title | ${title.replace('|', '\\|')} | ${title.length} |`);
    expect(draft).toContain(
      `| meta description | ${AIQP_CASE_STUDY.excerpt} | ${AIQP_CASE_STUDY.excerpt?.length} |`,
    );
  });

  it('600–900 słów treści', () => {
    const words = allBlocks
      .map(spansText)
      .join(' ')
      .split(/\s+/)
      .filter((w) => /[\p{L}\d]/u.test(w));
    expect(words.length).toBeGreaterThanOrEqual(600);
    expect(words.length).toBeLessThanOrEqual(900);
  });

  it('2–3 linki: strona usługi AI i wycena (oba obecne)', () => {
    expect(links.length).toBeGreaterThanOrEqual(2);
    expect(links.length).toBeLessThanOrEqual(3);
    expect(links).toContain(AI_SERVICE_PATH);
    expect(links).toContain(WYCENA_PATH);
    expect(new Set(links)).toEqual(new Set([AI_SERVICE_PATH, WYCENA_PATH]));
  });

  it('każdy akapit na stronie jest w szkicu docs/tresci/MIX-1275.md (nic spoza szkicu)', () => {
    const d = norm(draftBody);
    for (const b of allBlocks) expect(d).toContain(norm(spansText(b)));
  });

  it('brak źródła = „[do uzupełnienia przez Jakuba]” (3 miejsca), bez danych osobowych', () => {
    const text = allBlocks.map(spansText).join('\n');
    expect(text.match(/\[do uzupełnienia przez Jakuba\]/g)).toHaveLength(3);
    expect(text).not.toMatch(/@|\b\d{10}\b|KRS|NIP|\+48|\b\d{3}[ -]\d{3}[ -]\d{3}\b/);
  });

  it('każda liczba w treści ma źródło w szkicu (lista liczb)', () => {
    const text = allBlocks.map(spansText).join(' ');
    const nums = [...new Set(text.match(/\d+(?:[.,]\d+)?/g) ?? [])].sort();
    expect(nums).toEqual(['0', '1', '10', '100', '2', '25.6', '77', '95'].sort());
  });
});

// --- render ---
const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[AIQP_PATH]}>
        <Routes>
          <Route path="/portfolio/:slug" element={<CaseStudyTemplate />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('strona realizacji (szablon CaseStudyTemplate)', () => {
  it('H1, zdjęcie z repo jako hero (fetchpriority high, 16:9), linki do usługi AI i wyceny', async () => {
    getCaseStudyPage.mockResolvedValue({ project: AIQP_CASE_STUDY, nextProject: null });
    const { container } = renderPage();
    const h1 = await screen.findByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(AIQP_CASE_STUDY.title);
    const hero = container.querySelector('img[fetchpriority="high"]');
    expect(hero?.getAttribute('src')).toBe(AIQP_IMAGE_SRC);
    expect(hero?.getAttribute('width')).toBe('1600');
    expect(hero?.getAttribute('height')).toBe('900');
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain(AI_SERVICE_PATH);
    expect(hrefs).toContain(WYCENA_PATH);
  });

  it('JSON-LD Article: poprawny JSON, nagłówek, zdjęcie z adresem bezwzględnym', async () => {
    getCaseStudyPage.mockResolvedValue({ project: AIQP_CASE_STUDY, nextProject: null });
    renderPage();
    await screen.findByRole('heading', { level: 1 });
    await waitFor(() => {
      const ld = Array.from(document.head.querySelectorAll('script[type="application/ld+json"]'))
        .flatMap((s) => {
          const d = JSON.parse(s.textContent || 'null');
          return Array.isArray(d) ? d : [d];
        })
        .find((d) => d?.['@type'] === 'Article');
      expect(ld).toBeTruthy();
      expect(ld.headline).toBe(AIQP_CASE_STUDY.title);
      expect(ld.image).toEqual([`https://mixturemarketing.pl${AIQP_IMAGE_SRC}`]);
      expect(ld.description).toBe(AIQP_CASE_STUDY.excerpt);
    });
    expect(document.title).toBe('AI Q-PLAST: system AI dla wtryskarek | Mixture Marketing');
  });
});

describe('lista portfolio (PortfolioGrid)', () => {
  it('karta realizacji prowadzi na /portfolio/ai-q-plast/ i ma zdjęcie z repo', () => {
    const { container } = render(
      <MemoryRouter>
        <PortfolioGrid projects={[AIQP_CASE_STUDY]} />
      </MemoryRouter>,
    );
    const a = container.querySelector(`a[href="${AIQP_PATH}"], a[href="/portfolio/${AIQP_SLUG}"]`);
    expect(a).not.toBeNull();
    expect(container.querySelector('img')?.getAttribute('src')).toBe(AIQP_IMAGE_SRC);
  });
});
