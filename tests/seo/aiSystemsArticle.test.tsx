// MIX-1280 (plan SEO A34), publikacja MIX-1680 (14.11.2026, decyzja Jakuba): artykuł „aplikacje dedykowane
// z AI” jest OPUBLIKOWANY (indeksowany, w sitemapie, rejestrze Bazy wiedzy i llms.txt, jak inne artykuły), ma
// Article + FAQPage JSON-LD, ≥ 3 linki wewnętrzne ze slashem, 1200–1800 słów i nie zawiera nazw klientów.
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModalProvider } from '../../context/ModalContext';
import { NotificationProvider } from '../../context/NotificationContext';
import AiSystemsArticle from '../../components/articles/AiSystemsArticle';
import UxAuditArticle from '../../components/articles/UxAuditArticle';
import { appRoutes } from '../../config/routes';
import { routes, prerenderOnlyRoutes } from '../../routes.js';
import { LEGACY_ARTICLES } from '../../services/cms/legacyArticles';
import ArticleShell from '../../components/articles/ArticleShell';
import { TITLE_MAX } from '../../utils/seo/title';
import {
  AI_ARTICLE_CONTENT as CONTENT,
  AI_ARTICLE_ID,
  AI_ARTICLE_PUBLISHED,
  AI_ARTICLE_SLUG,
} from '../../data/content/articles/ai-systems';

vi.mock('../../utils/analytics', () => ({ trackEvent: vi.fn() }));

const root = path.resolve(__dirname, '../..');
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const strip = (h: string) => h.replace(/<[^>]*>/g, '');
const SLUG_BARE = AI_ARTICLE_SLUG.replace(/\/$/, '');

const renderAt = (page: React.ReactElement, route = AI_ARTICLE_SLUG) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[route]}>
        <NotificationProvider>
          <ModalProvider>{page}</ModalProvider>
        </NotificationProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

type Ld = { '@type'?: string; [k: string]: unknown };
const headLd = (): Ld[] =>
  Array.from(document.head.querySelectorAll('script[type="application/ld+json"]')).flatMap((s) => {
    const d = JSON.parse(s.textContent || 'null') as Ld | Ld[];
    return Array.isArray(d) ? d : [d];
  });

/** Wszystkie teksty artykułu widoczne dla czytelnika (bez <title> z SEO i etykiet CTA). */
const articleTexts = (): string[] => [
  CONTENT.header.subtitle,
  CONTENT.lead.highlight,
  CONTENT.lead.text,
  ...CONTENT.sections.flatMap((s) => [
    s.title,
    ...s.paragraphs,
    ...('bullets' in s && s.bullets ? s.bullets : []),
  ]),
  CONTENT.faq.title,
  ...CONTENT.faq.items.flatMap((f) => [f.q, f.a]),
];
const countWords = (texts: string[]) =>
  texts.reduce((n, t) => n + strip(t).split(/\s+/).filter(Boolean).length, 0);

beforeEach(() => {
  document.head.innerHTML = '';
});

describe('artykuł „aplikacje dedykowane z AI”: długość, FAQ, SEO tekstu', () => {
  it('ma 1200–1800 słów', () => {
    const words = countWords(articleTexts());
    expect(words).toBeGreaterThanOrEqual(1200);
    expect(words).toBeLessThanOrEqual(1800);
  });

  it('liczy słowa poprawnie: HTML nie jest liczony, puste łańcuchy nie dodają słów', () => {
    expect(countWords(['<a href="/x/">jeden dwa</a> trzy', '  '])).toBe(3);
  });

  it('FAQ ma 3–5 pytań, każde z odpowiedzią', () => {
    expect(CONTENT.faq.items.length).toBeGreaterThanOrEqual(3);
    expect(CONTENT.faq.items.length).toBeLessThanOrEqual(5);
    for (const f of CONTENT.faq.items) {
      expect(f.q.trim().endsWith('?')).toBe(true);
      expect(f.a.trim().length).toBeGreaterThan(40);
    }
  });

  it('<title> mieści się w 60 znakach i zawiera frazę „aplikacje dedykowane”', () => {
    expect(CONTENT.header.seoTitle.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(CONTENT.header.seoTitle.toLowerCase()).toContain('aplikacje dedykowane');
    expect(CONTENT.header.title.toLowerCase()).toContain('aplikacje dedykowane');
  });

  it('ślad w docs/tresci/MIX-1280.md: status opublikowany, każdy nagłówek i pytanie z kodu', () => {
    const doc = read('docs/tresci/MIX-1280.md');
    expect(doc).toContain('Status: **opublikowany 14.11.2026**');
    expect(doc).not.toContain('do akceptacji Jakuba');
    expect(doc).toContain(CONTENT.header.title);
    for (const s of CONTENT.sections) expect(doc).toContain(`## ${s.title}`);
    for (const f of CONTENT.faq.items) expect(doc).toContain(f.q);
  });
});

describe('artykuł „aplikacje dedykowane z AI”: publikacja (MIX-1680)', () => {
  const urlCount = (xml: string, slug: string) => xml.split(`<loc>https://mixturemarketing.pl${slug}</loc>`).length - 1;

  it('trasa istnieje w tabeli routingu i jest w `routes` (sitemapa), nie w `prerenderOnlyRoutes`', () => {
    expect(appRoutes.map((r) => r.path)).toContain(SLUG_BARE);
    expect(routes.filter((r) => r === AI_ARTICLE_SLUG)).toHaveLength(1);
    expect(prerenderOnlyRoutes).not.toContain(AI_ARTICLE_SLUG);
  });

  it('public/sitemap.xml ma adres dokładnie raz, z datą publikacji w lastmod; data/seo/lastmod.json też', () => {
    const xml = read('public/sitemap.xml');
    expect(urlCount(xml, AI_ARTICLE_SLUG)).toBe(1);
    expect(xml).toMatch(
      new RegExp(`${AI_ARTICLE_SLUG}</loc>\\s*<lastmod>${AI_ARTICLE_PUBLISHED}</lastmod>`),
    );
    expect(JSON.parse(read('data/seo/lastmod.json'))[AI_ARTICLE_SLUG]).toBe(AI_ARTICLE_PUBLISHED);
  });

  it('nogi ujemne: licznik adresów w sitemapie widzi brak i duplikat', () => {
    const xml = read('public/sitemap.xml');
    expect(urlCount(xml.replace(AI_ARTICLE_SLUG, '/x/'), AI_ARTICLE_SLUG)).toBe(0);
    expect(urlCount(`${xml}${xml}`, AI_ARTICLE_SLUG)).toBe(2);
  });

  it('jest w rejestrze Bazy wiedzy z datą publikacji i kategorią; slug zgodny z trasą', () => {
    const entries = LEGACY_ARTICLES.filter((a) => a.id === AI_ARTICLE_ID);
    expect(entries).toHaveLength(1);
    expect(entries[0].slug).toBe(SLUG_BARE);
    expect(entries[0].date).toBe(AI_ARTICLE_PUBLISHED);
    expect(entries[0].title).toBe(CONTENT.header.title);
    expect(entries[0].updatedDate).toBeUndefined();
  });

  it('public/llms.txt ma wpis z adresem artykułu dokładnie raz', () => {
    const llms = read('public/llms.txt');
    expect(llms.split(`](https://mixturemarketing.pl${AI_ARTICLE_SLUG})`).length - 1).toBe(1);
    expect(llms).toMatch(
      new RegExp(`^ {2}- \\[[^\\]]+\\]\\(https://mixturemarketing.pl${AI_ARTICLE_SLUG}\\): \\S`, 'm'),
    );
  });

  it('komponent nie ustawia `noindex`', () => {
    expect(read('components/articles/AiSystemsArticle.tsx')).not.toMatch(/^\s*noindex\b/m);
  });

  it('render: indeksowany (brak meta robots noindex), kanoniczny adres ze slashem', async () => {
    renderAt(<AiSystemsArticle />);
    await waitFor(() => {
      expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
        `https://mixturemarketing.pl${AI_ARTICLE_SLUG}`,
      );
    });
    expect(document.head.querySelector('meta[name="robots"][content*="noindex"]')).toBeNull();
  });

  it('noga ujemna: wykrywacz widzi noindex, gdy artykuł ma go ustawionego (ArticleShell z `noindex`)', async () => {
    renderAt(
      <ArticleShell
        id={AI_ARTICLE_ID}
        title="x"
        description="x"
        category="tech"
        categoryLabel="x"
        image="/assets/images/backend.png"
        accentColor="#3B82F6"
        slug={AI_ARTICLE_SLUG}
        publishedDate={AI_ARTICLE_PUBLISHED}
        noindex
      >
        <p>x</p>
      </ArticleShell>,
    );
    await waitFor(() => {
      expect(
        document.head.querySelector('meta[name="robots"][content*="noindex"]'),
      ).not.toBeNull();
    });
  });
});

describe('artykuł „aplikacje dedykowane z AI”: JSON-LD (Article + FAQPage)', () => {
  it('ma Article z autorem i datami, BreadcrumbList i dokładnie jeden FAQPage z liczbą pytań jak FAQ', async () => {
    renderAt(<AiSystemsArticle />);
    await waitFor(() => expect(headLd().length).toBeGreaterThanOrEqual(3));
    const types = headLd().map((b) => b['@type']);
    expect(types).toEqual(expect.arrayContaining(['Article', 'BreadcrumbList', 'FAQPage']));

    const article = headLd().find((b) => b['@type'] === 'Article') as Ld & {
      headline: string;
      author: { name: string; '@type': string };
      datePublished: string;
      dateModified: string;
      mainEntityOfPage: { '@id': string };
    };
    expect(article.headline).toBe(CONTENT.header.title);
    expect(article.author['@type']).toBe('Person');
    expect(article.author.name.length).toBeGreaterThan(0);
    expect(article.datePublished.slice(0, 10)).toBe(AI_ARTICLE_PUBLISHED);
    expect(article.dateModified.slice(0, 10)).toBe(AI_ARTICLE_PUBLISHED);
    expect(article.mainEntityOfPage['@id']).toBe(`https://mixturemarketing.pl${AI_ARTICLE_SLUG}`);

    const faq = headLd().filter((b) => b['@type'] === 'FAQPage') as (Ld & {
      mainEntity: { '@type': string; name: string; acceptedAnswer: { text: string } }[];
    })[];
    expect(faq).toHaveLength(1);
    expect(faq[0].mainEntity).toHaveLength(CONTENT.faq.items.length);
    expect(faq[0].mainEntity.map((q) => q.name)).toEqual(CONTENT.faq.items.map((f) => f.q));
    for (const q of faq[0].mainEntity) {
      expect(q['@type']).toBe('Question');
      expect(q.acceptedAnswer.text.length).toBeGreaterThan(40);
    }
  });

  it('okruszki kończą się adresem artykułu', async () => {
    renderAt(<AiSystemsArticle />);
    await waitFor(() => expect(headLd().some((b) => b['@type'] === 'BreadcrumbList')).toBe(true));
    const crumbs = headLd().find((b) => b['@type'] === 'BreadcrumbList') as Ld & {
      itemListElement: { item: string }[];
    };
    expect(crumbs.itemListElement.at(-1)!.item).toBe(
      `https://mixturemarketing.pl${AI_ARTICLE_SLUG}`,
    );
  });
});

describe('artykuł „aplikacje dedykowane z AI”: render i linki wewnętrzne', () => {
  it('ma jeden H1 z frazą oraz widoczne nagłówki sekcji i FAQ', async () => {
    const { container } = renderAt(<AiSystemsArticle />);
    await waitFor(() => expect(container.querySelector('h1')).not.toBeNull());
    const h1s = container.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
    expect(h1s[0].textContent!.toLowerCase()).toContain('aplikacje dedykowane');
    const headings = Array.from(container.querySelectorAll('h2')).map((h) =>
      h.textContent!.replace(/\s+/g, ''),
    );
    for (const s of CONTENT.sections) expect(headings).toContain(s.title.replace(/\s+/g, ''));
    for (const f of CONTENT.faq.items) {
      expect(container.textContent).toContain(f.q);
    }
  });

  it('ma byline autora i datę publikacji', async () => {
    const { container } = renderAt(<AiSystemsArticle />);
    await waitFor(() => expect(container.querySelector('a[rel="author"]')).not.toBeNull());
    const time = container.querySelector('time');
    expect(time?.getAttribute('dateTime')?.slice(0, 10)).toBe(AI_ARTICLE_PUBLISHED);
  });

  it('≥ 3 unikalne linki wewnętrzne ze slashem, w tym strona usługi MIX-1272 i formularz wyceny', async () => {
    const { container } = renderAt(<AiSystemsArticle />);
    await waitFor(() => expect(container.querySelectorAll('a[href]').length).toBeGreaterThan(0));
    const hrefs = Array.from(container.querySelectorAll('a[href^="/"]'))
      .map((a) => a.getAttribute('href')!)
      .filter((h) => !h.startsWith('/assets/'));
    const unique = new Set(hrefs);
    expect(unique.size).toBeGreaterThanOrEqual(3);
    for (const h of unique) expect(h.endsWith('/'), `${h} bez slasha`).toBe(true);
    expect(unique).toContain('/web-development/systemy-ai-aplikacje/');
    expect(unique).toContain('/wycena/');
    expect(unique).toContain('/web-development/custom-app/');
  });

  it('linki wewnętrzne z treści prowadzą do istniejących stron', () => {
    const html = articleTexts().join(' ');
    const hrefs = Array.from(html.matchAll(/href="(\/[^"]+)"/g)).map((m) => m[1]);
    expect(hrefs.length).toBeGreaterThanOrEqual(3);
    const known = new Set<string>([...routes, ...prerenderOnlyRoutes, '/portfolio/studentpi/']);
    for (const h of hrefs) {
      expect(h.endsWith('/')).toBe(true);
      expect(known.has(h), `${h} nie istnieje w routes`).toBe(true);
    }
  });
});

describe('treść: bez nazw klientów (zgoda A17 w toku, MIX-1325)', () => {
  const FORBIDDEN_NAMES = [/AI\s?Q-?PLAST/i, /PsychON/i, /Bibmot/i, /Niepodzielni/i, /Gabinet/i];

  it('żadna nazwa klienta nie trafia do tekstu, FAQ, JSON-LD ani szkicu do akceptacji', async () => {
    const { container } = renderAt(<AiSystemsArticle />);
    await waitFor(() => expect(headLd().length).toBeGreaterThan(0));
    const visible = container.textContent ?? '';
    const ld = JSON.stringify(headLd());
    const src = read('data/content/articles/ai-systems.ts')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    const doc = read('docs/tresci/MIX-1280.md').split('# Tekst artykułu')[1] ?? '';
    expect(doc.length).toBeGreaterThan(1000);
    for (const re of FORBIDDEN_NAMES) {
      expect(visible).not.toMatch(re);
      expect(ld).not.toMatch(re);
      expect(src).not.toMatch(re);
      expect(doc).not.toMatch(re);
    }
  });

  it('wykrywacz nazw nie jest pusty: łapie nazwę w tekście, przepuszcza opis ogólny', () => {
    expect(FORBIDDEN_NAMES.some((re) => re.test('Projekt dla AI Q-PLAST'))).toBe(true);
    expect(FORBIDDEN_NAMES.some((re) => re.test('Zakład produkcji tworzyw sztucznych'))).toBe(
      false,
    );
  });
});
