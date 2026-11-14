// MIX-1280 b: warstwa wizualna artykułu „aplikacje dedykowane z AI”. Tekst bez zmian (zgodny ze szkicem
// docs/tresci/MIX-1280.md), ≥ 12 sekcji z AnimateOnScroll, dokładnie 4 infografiki z aria-label, SVG z role="img",
// fakty infografik tylko z tekstu (liczby, nazwy z dużej litery i każde słowo małą literą), prefers-reduced-motion = brak ruchu,
// artykuł opublikowany (MIX-1680).
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ModalProvider } from '../../context/ModalContext';
import { NotificationProvider } from '../../context/NotificationContext';
import AiSystemsArticle from '../../components/articles/AiSystemsArticle';
import {
  AiCompare,
  AiProcessTimeline,
  AiStackDiagram,
  AiStatCards,
} from '../../components/articles/visuals/AiSystemsVisuals';
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

  it('ma dokładnie 4 infografiki, każda z niepustym aria-label po polsku', async () => {
    const { container } = renderArticle();
    await waitFor(() => expect(container.querySelector('h1')).not.toBeNull());
    const infos = Array.from(container.querySelectorAll('[data-infographic]'));
    expect(infos).toHaveLength(4);
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

// MIX-1677: pełny skan widocznego tekstu infografik (allowlista, nie denylista). Każda liczba musi być
// liczbą z tekstu artykułu; każde słowo z dużej litery to albo słowo z tekstu (początek zdania), albo
// pozycja z krótkiej jawnej listy NAZWY_DOZWOLONE (w środku zdania). Nazwa klienta albo nowa liczba = czerwono.
// Początki etykiet (Porównanie, Schemat) i grzeczne formy (Twój, Twoim, Ciebie) są zwykłymi słowami, nie nazwami.
const NAZWY_DOZWOLONE = new Set(['AI', 'B2B', 'Twój', 'Twoim', 'Ciebie', 'Porównanie', 'Schemat']);
// MIX-1677 W6 (MIX-1680): słowa małą literą też z allowlisty. Każde słowo widocznego tekstu infografiki jest
// słowem z tekstu artykułu (po zmniejszeniu liter) albo z tej krótkiej jawnej listy słów ogólnych (odmiany
// i spójniki, których nie ma w artykule w tej formie). Nazwa klienta małą literą (`historia bibmot`) = czerwono.
const SLOWA_DOZWOLONE = new Set<string>([
  'schemat', // początek etykiety „Schemat aplikacji …” (jak „Porównanie”, „Schemat” w nazwach dozwolonych)
  'porównanie',
  'dedykowanej',
  'jego',
  'sprawdza',
  'skutki',
  'poważne',
  'liczbach',
  'krokach',
  'czterech',
  'inżynieria',
]);
/** Etykiety generowane kodem (numer kroku osi czasu), nie fakty. */
const ETYKIETY_KODU = /^Krok [1-4]$/;
const norm = (s: string) => s.replace(/\s+/g, ' ').trim(); // \s w JS obejmuje też spację niełamliwą
const liczby = (s: string) =>
  norm(s).match(/(?<![\p{L}\p{N}])\d+(?:\s\d{3})*(?![\p{L}\p{N}])/gu) ?? [];
const slowa = (s: string) =>
  norm(s)
    .toLowerCase()
    .match(/[\p{L}\p{N}-]+/gu) ?? [];
/** Wszystkie teksty artykułu (liście obiektu treści, HTML bez znaczników), połączone spacją; bez nazw pól. */
const liscie = (v: unknown): string[] =>
  typeof v === 'string'
    ? [v.replace(/<[^>]*>/g, ' ')]
    : Array.isArray(v)
      ? v.flatMap(liscie)
      : v && typeof v === 'object'
        ? Object.values(v).flatMap(liscie)
        : [];
const articleJson = () => liscie(CONTENT).join(' ');

/** Cały widoczny tekst: węzły tekstowe (w tym SVG text/tspan/title) + aria-label, title, alt. */
const visibleItems = (root: Element): string[] => {
  const out: string[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = norm(walker.currentNode.textContent ?? '');
    if (t) out.push(t);
  }
  root.querySelectorAll('[aria-label],[title],[alt]').forEach((el) => {
    for (const a of ['aria-label', 'title', 'alt']) {
      const v = norm(el.getAttribute(a) ?? '');
      if (v) out.push(v);
    }
  });
  return out.filter((t) => !ETYKIETY_KODU.test(t));
};

const renderAllVisuals = () =>
  render(
    <MemoryRouter>
      <AiProcessTimeline />
      <AiStatCards />
      <AiCompare />
      <AiStackDiagram />
    </MemoryRouter>,
  );

/** Naruszenia: liczby spoza tekstu artykułu i nazwy własne spoza listy. Puste = czysto. */
const naruszenia = (items: string[], article: string): string[] => {
  const num = new Set(liczby(article));
  const words = new Set(slowa(article));
  const bad: string[] = [];
  for (const it of items) {
    for (const n of liczby(it)) if (!num.has(n)) bad.push(`liczba „${n}” w „${it}”`);
    for (const w of slowa(it)) {
      if (/^\d+$/.test(w) || words.has(w) || SLOWA_DOZWOLONE.has(w)) continue;
      bad.push(`słowo „${w}” spoza tekstu artykułu w „${it}”`);
    }
    const re = /\p{Lu}[\p{L}\p{N}-]*/gu;
    let m: RegExpExecArray | null;
    while ((m = re.exec(it))) {
      const w = m[0];
      const pocz = /^$|[.!?:]\s+$/.test(it.slice(0, m.index));
      if (NAZWY_DOZWOLONE.has(w)) continue;
      if (pocz && words.has(w.toLowerCase())) continue;
      bad.push(`nazwa „${w}” w „${it}”`);
    }
  }
  return bad;
};

describe('wizualnie: pełny skan tekstu infografik (MIX-1677)', () => {
  it('skan obejmuje stack (aiNote, frame, engineering), tytuły i punkty „nie”, podpisy, moduły i etykiety', () => {
    const { container } = renderAllVisuals();
    const all = visibleItems(container);
    const items = all.join(' | ');
    const S = VISUALS.stack;
    const expected = [
      ...S.aiNote.split(' '),
      S.frame,
      S.engineering,
      S.ai,
      ...S.modules,
      VISUALS.compare.yes.title,
      VISUALS.compare.no.title,
      ...VISUALS.compare.no.items,
      ...VISUALS.compare.yes.items,
      ...VISUALS.stats.items.flatMap((i) => [i.value, i.caption]),
      VISUALS.process.label,
      VISUALS.stats.label,
      VISUALS.compare.label,
      S.label,
    ];
    expect(all.length).toBeGreaterThan(30);
    for (const e of expected) expect(items, `skan nie widzi „${e}”`).toContain(e);
    expect(container.querySelectorAll('svg text').length).toBeGreaterThan(8);
  });

  it('każda liczba i każda nazwa własna w widocznym tekście infografik pochodzi z tekstu artykułu albo z listy dozwolonych', () => {
    const { container } = renderAllVisuals();
    expect(naruszenia(visibleItems(container), articleJson())).toEqual([]);
  });

  it('wykrywacz działa: nowa liczba, nazwa klienta i nazwa w środku zdania są czerwone, tekst z artykułu nie', () => {
    const a = articleJson();
    expect(naruszenia(['bywa tylko 5% systemu'], a)).toHaveLength(1);
    expect(naruszenia(['portal B2B Q-PLAST'], a).join()).toContain('Q-PLAST');
    expect(naruszenia(['Q-PLAST bywa'], a)).toHaveLength(1);
    expect(naruszenia(['od 77 000 zł'], a)).toHaveLength(1);
    // MIX-1677 W6: nazwa klienta małą literą (w środku i na początku etykiety) też jest czerwona
    expect(naruszenia(['historia bibmot'], a).join()).toContain('bibmot');
    expect(naruszenia(['bibmot historia'], a).join()).toContain('bibmot');
    expect(naruszenia(['portal b2b q-plast'], a).join()).toContain('q-plast');
    expect(naruszenia(['studentpi'], a).join()).toContain('studentpi');
    expect(naruszenia(['od 23 000 zł', 'aplikacje dedykowane z AI', '24 godziny'], a)).toEqual([]);
  });

  it('domyślna wartość ruchu: bez --p z hooka (prerender, brak JS) markup ma var(--p, 1), nigdy var(--p, 0) ani var(--p) bez wartości', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <AiProcessTimeline />
        <AiStackDiagram />
      </MemoryRouter>,
    );
    const wszystkie = html.match(/var\(--p[^)]*\)/g) ?? [];
    expect(wszystkie.length).toBeGreaterThan(10);
    for (const w of wszystkie) expect(w).toBe('var(--p, 1)');
    expect(html).not.toContain('--p:');
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

describe('wizualnie: artykuł opublikowany (MIX-1680)', () => {
  it('komponent bez `noindex`, adres w sitemapie i llms.txt', () => {
    expect(read('components/articles/AiSystemsArticle.tsx')).not.toMatch(/^\s*noindex\s*$/m);
    for (const f of ['public/sitemap.xml', 'public/llms.txt', 'data/seo/lastmod.json']) {
      expect(read(f), `${f} musi zawierać artykuł`).toContain('aplikacje-dedykowane-z-ai');
    }
  });
});
