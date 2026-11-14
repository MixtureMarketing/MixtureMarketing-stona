// MIX-1280 b: warstwa wizualna artykułu „aplikacje dedykowane z AI”. Tekst bez zmian (zgodny ze szkicem
// docs/tresci/MIX-1280.md), ≥ 12 sekcji z AnimateOnScroll, ≥ 3 infografiki z aria-label, SVG z role="img",
// fakty infografik tylko z tekstu, prefers-reduced-motion = brak ruchu, artykuł nadal ukryty.
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ModalProvider } from '../../context/ModalContext';
import { NotificationProvider } from '../../context/NotificationContext';
import AiSystemsArticle from '../../components/articles/AiSystemsArticle';
import { AiProcessTimeline } from '../../components/articles/visuals/AiSystemsVisuals';
import {
  AI_ARTICLE_CONTENT as CONTENT,
  AI_ARTICLE_SLUG,
  AI_ARTICLE_VISUALS as VISUALS,
} from '../../data/content/articles/ai-systems';

vi.mock('../../utils/analytics', () => ({ trackEvent: vi.fn() }));

const root = path.resolve(__dirname, '../..');
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const strip = (h: string) => h.replace(/<[^>]*>/g, '');

const renderArticle = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[AI_ARTICLE_SLUG]}>
        <NotificationProvider>
          <ModalProvider>
            <AiSystemsArticle />
          </ModalProvider>
        </NotificationProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

const sectionTexts = () =>
  CONTENT.sections.flatMap((s) => [
    ...s.paragraphs,
    ...('bullets' in s && s.bullets ? s.bullets : []),
  ]);
const allText = () =>
  [CONTENT.lead.highlight, CONTENT.lead.text, ...sectionTexts()].map(strip).join(' ').toLowerCase();

// NIE vi.unstubAllGlobals(): zdjęłoby też stuby z tests/setup.ts (matchMedia, IntersectionObserver), a hooki
// motion-safe wywołałyby window.matchMedia, którego jsdom nie ma. Po każdym teście wracamy do ruchu dozwolonego.
const mockMedia = (reduce: boolean) =>
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: reduce && query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );

afterEach(() => {
  mockMedia(false);
});

describe('wizualnie: sekcje z animacją i infografiki', () => {
  it('kod ma ≥ 12 literalnych AnimateOnScroll, a w DOM ≥ 12 opakowań animacji', async () => {
    const src = read('components/articles/AiSystemsArticle.tsx');
    expect((src.match(/<AnimateOnScroll/g) ?? []).length).toBeGreaterThanOrEqual(12);
    const { container } = renderArticle();
    await waitFor(() => expect(container.querySelector('h1')).not.toBeNull());
    const wrappers = container.querySelectorAll('div.duration-700.ease-out.transform');
    expect(wrappers.length).toBeGreaterThanOrEqual(12);
  });

  it('każda sekcja tekstowa i FAQ są w opakowaniu AnimateOnScroll', async () => {
    const { container } = renderArticle();
    await waitFor(() => expect(container.querySelector('h1')).not.toBeNull());
    const titles = [...CONTENT.sections.map((x) => x.title), CONTENT.faq.title];
    const h2s = Array.from(container.querySelectorAll('h2'));
    for (const t of titles) {
      const h = h2s.find(
        (x) => (x.textContent ?? '').replace(/\s+/g, '') === t.replace(/\s+/g, ''),
      );
      expect(h, `brak h2 „${t}”`).toBeDefined();
      expect(
        h!.closest('div.duration-700.ease-out.transform'),
        `„${t}” poza AnimateOnScroll`,
      ).not.toBeNull();
    }
  });

  it('ma ≥ 3 infografiki, każda z niepustym aria-label po polsku', async () => {
    const { container } = renderArticle();
    await waitFor(() => expect(container.querySelector('h1')).not.toBeNull());
    const infos = Array.from(container.querySelectorAll('[data-infographic]'));
    expect(infos.length).toBeGreaterThanOrEqual(3);
    for (const el of infos) {
      const label = el.getAttribute('aria-label') ?? '';
      expect(label.length, `${el.getAttribute('data-infographic')} bez aria-label`).toBeGreaterThan(
        20,
      );
      expect(label).toMatch(/[ąćęłńóśźż]/i);
    }
  });

  it('każdy SVG w treści: role="img" i aria-label (ozdobne ikony mają aria-hidden)', async () => {
    const { container } = renderArticle();
    await waitFor(() => expect(container.querySelector('h1')).not.toBeNull());
    const svgs = Array.from(container.querySelectorAll('svg')).filter(
      (s) => s.getAttribute('aria-hidden') !== 'true',
    );
    const diagrams = svgs.filter((s) => s.closest('[data-infographic]'));
    expect(diagrams.length).toBeGreaterThanOrEqual(1);
    for (const s of diagrams) {
      expect(s.getAttribute('role')).toBe('img');
      expect((s.getAttribute('aria-label') ?? '').length).toBeGreaterThan(20);
    }
  });

  it('ruch tylko przez opacity/transform: infografiki nie ustawiają width, height, top ani left w stylach animacji', () => {
    const src = read('components/articles/visuals/AiSystemsVisuals.tsx');
    expect(src).not.toMatch(/transition-\[?(width|height|top|left|margin)/);
    expect(src).not.toMatch(/animate-(?!none)/);
  });
});

describe('wizualnie: tekst bez zmian, fakty infografik z tekstu', () => {
  it('każdy akapit, punkt i zdanie leadu bez HTML jest dosłownie w szkicu docs/tresci/MIX-1280.md', () => {
    const doc = read('docs/tresci/MIX-1280.md');
    const plain = [CONTENT.lead.highlight, CONTENT.lead.text, ...sectionTexts()].filter(
      (t) => !t.includes('<'),
    );
    expect(plain.length).toBeGreaterThan(30);
    for (const t of plain) expect(doc, `brak w szkicu: ${t.slice(0, 50)}…`).toContain(t);
    for (const f of CONTENT.faq.items) {
      expect(doc).toContain(f.q);
      expect(doc).toContain(f.a);
    }
  });

  it('wyrenderowany artykuł zawiera każdy akapit i punkt bez zmian', async () => {
    const { container } = renderArticle();
    await waitFor(() => expect(container.querySelector('h1')).not.toBeNull());
    const text = (container.textContent ?? '').replace(/\s+/g, ' ');
    for (const t of sectionTexts()) expect(text).toContain(strip(t).replace(/\s+/g, ' '));
  });

  it('liczby i moduły infografik występują w tekście artykułu (nic nowego)', () => {
    const text = allText();
    const faq = CONTENT.faq.items.map((f) => `${f.q} ${f.a}`.toLowerCase()).join(' ');
    const haystack = `${text} ${faq}`;
    const strings = [
      VISUALS.process.label,
      VISUALS.stats.label,
      VISUALS.compare.label,
      VISUALS.stack.label,
      ...VISUALS.stats.items.flatMap((i) => [i.value, i.caption]),
      ...VISUALS.compare.yes.items,
      ...VISUALS.compare.no.items,
    ];
    for (const s of strings) {
      for (const n of s.match(/\d[\d\s]*\d|\d/g) ?? []) {
        expect(haystack, `liczba „${n}” z infografiki nie występuje w tekście`).toContain(n.trim());
      }
    }
    for (const i of VISUALS.stats.items) expect(haystack).toContain(i.value.toLowerCase());
    for (const t of VISUALS.compare.yes.items) expect(haystack).toContain(t.toLowerCase());
    for (const m of VISUALS.stack.modules) {
      expect(haystack, `moduł „${m}” nie występuje w tekście`).toMatch(
        new RegExp(m.toLowerCase().slice(0, 5)),
      );
    }
  });

  it('wykrywacz faktów nie jest pusty: nowa liczba nie przechodzi', () => {
    expect(allText()).not.toContain('99 000');
    expect(allText()).toContain('23 000');
  });

  it('kroki osi czasu pochodzą z punktów sekcji „Jak wygląda projekt krok po kroku”', async () => {
    const { container } = render(
      <MemoryRouter>
        <AiProcessTimeline />
      </MemoryRouter>,
    );
    const titles = Array.from(container.querySelectorAll('h3')).map((h) => h.textContent);
    const section = CONTENT.sections.find((s) => s.title === VISUALS.process.sectionTitle)!;
    expect(titles).toHaveLength(4);
    const bullets = 'bullets' in section && section.bullets ? section.bullets : [];
    titles.forEach((t, i) => expect(bullets[i].startsWith(`${t}.`)).toBe(true));
  });
});

describe('wizualnie: prefers-reduced-motion', () => {
  it('bez preferencji ruchu kontener infografiki dostaje --p (ruch działa)', async () => {
    mockMedia(false);
    const { container } = render(
      <MemoryRouter>
        <AiProcessTimeline />
      </MemoryRouter>,
    );
    await waitFor(() => {
      const el = container.querySelector<HTMLElement>('[data-infographic] > div');
      expect(el?.style.getPropertyValue('--p')).not.toBe('');
    });
  });

  it('z prefers-reduced-motion: reduce nic nie ustawia --p, więc elementy stoją w stanie końcowym', async () => {
    mockMedia(true);
    const { container } = render(
      <MemoryRouter>
        <AiProcessTimeline />
      </MemoryRouter>,
    );
    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
      await new Promise((r) => setTimeout(r, 50));
    });
    const el = container.querySelector<HTMLElement>('[data-infographic] > div');
    expect(el?.style.getPropertyValue('--p')).toBe('');
  });

  it('opakowanie AnimateOnScroll ma klasy motion-reduce (bez ruchu)', () => {
    const src = read('components/common/AnimateOnScroll.tsx');
    expect(src).toContain('motion-reduce:translate-y-0');
    expect(src).toContain('motion-reduce:transition-none');
  });
});

describe('wizualnie: artykuł nadal ukryty', () => {
  it('noindex w komponencie, poza sitemapą i llms.txt', () => {
    expect(read('components/articles/AiSystemsArticle.tsx')).toMatch(/^\s*noindex\s*$/m);
    for (const f of ['public/sitemap.xml', 'public/llms.txt', 'data/seo/lastmod.json']) {
      expect(read(f)).not.toContain('aplikacje-dedykowane-z-ai');
    }
  });
});
