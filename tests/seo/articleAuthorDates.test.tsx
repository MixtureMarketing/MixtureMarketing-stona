// MIX-783: prawdziwe daty i autor artykułów bazy wiedzy + LinkedIn założyciela w sameAs.
// Daty: rejestr services/cms/legacyArticles.ts (to samo co publishedAt w Sanity, zasilonym z
// rejestru). Autor: Jakub Niedziela (decyzja MIX-920). LinkedIn: jeden adres na całej stronie.
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModalProvider } from '../../context/ModalContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { LEGACY_ARTICLES } from '../../services/cms/legacyArticles';
import { normalizeTeamMember } from '../../utils/teamMember';
import { FOUNDER_ID, FOUNDER_LINKEDIN, FOUNDER_NAME } from '../../utils/seo/organizationSchema';
import { SanityTeamMember } from '../../types/sanity';
import ArticleShell from '../../components/articles/ArticleShell';
import WafArticle from '../../components/articles/WafArticle';
import IleKosztujeStronaRzeszowArticle from '../../components/articles/IleKosztujeStronaRzeszowArticle';
import ServerSideTrackingArticle from '../../components/articles/ServerSideTrackingArticle';

vi.mock('../../utils/analytics', () => ({ trackEvent: vi.fn() }));

const ROOT = path.resolve(__dirname, '../..');
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const LINKEDIN_RE = /https:\/\/[a-z.]*linkedin\.com\/in\/[A-Za-z0-9-]+/g;

const wrap = (node: React.ReactNode) =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <NotificationProvider>
          <ModalProvider>{node}</ModalProvider>
        </NotificationProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

type Ld = Record<string, unknown> & {
  author?: Record<string, unknown>;
  datePublished?: string;
  dateModified?: string;
};

const findArticleLd = async (): Promise<Ld> => {
  let found: Ld | undefined;
  await waitFor(() => {
    found = Array.from(document.head.querySelectorAll('script[type="application/ld+json"]'))
      .flatMap((s) => {
        const d = JSON.parse(s.textContent || 'null');
        return Array.isArray(d) ? d : [d];
      })
      .find((d) => d?.['@type'] === 'Article');
    expect(found).toBeDefined();
  });
  return found!;
};

const staticArticleRoutes = (): string[] => {
  const src = fs.readFileSync(path.join(ROOT, 'config/routes.tsx'), 'utf-8');
  // Ukryte artykuły (noindex, poza rejestrem do akceptacji, np. MIX-1280) nie należą do rejestru dat.
  const hidden = new Set(['/baza-wiedzy/aplikacje-dedykowane-z-ai-kiedy-warto']);
  return Array.from(src.matchAll(/path: '(\/baza-wiedzy\/[a-z0-9-]+)'/g))
    .map((m) => m[1])
    .filter((r) => !hidden.has(r));
};

beforeEach(() => {
  document.head.innerHTML = '';
});

describe('rejestr dat artykułów (legacyArticles)', () => {
  it('29 artykułów, każdy statyczny artykuł z tras ma wpis w rejestrze', () => {
    const routes = staticArticleRoutes();
    expect(routes).toHaveLength(29);
    expect(LEGACY_ARTICLES).toHaveLength(29);
    const slugs = new Set(LEGACY_ARTICLES.map((a) => a.slug));
    expect(routes.filter((r) => !slugs.has(r))).toEqual([]);
  });

  it('daty ISO, prawidłowe, nie z przyszłości; aktualizacja nie wcześniej niż publikacja', () => {
    const today = new Date().toISOString().slice(0, 10);
    for (const a of LEGACY_ARTICLES) {
      expect(a.date, a.id).toMatch(ISO);
      expect(Number.isNaN(new Date(a.date).getTime()), a.id).toBe(false);
      expect(a.date <= today, `${a.id} ${a.date}`).toBe(true);
      if (a.updatedDate) {
        expect(a.updatedDate, a.id).toMatch(ISO);
        expect(a.updatedDate >= a.date, a.id).toBe(true);
        expect(a.updatedDate <= today, a.id).toBe(true);
      }
    }
  });

  it('wartości przypięte: publikacja jak w CMS, WAF bez daty z przyszłości, cennik z aktualizacją', () => {
    const byId = Object.fromEntries(LEGACY_ARTICLES.map((a) => [a.id, a]));
    expect(byId['server-side-tracking'].date).toBe('2025-12-22');
    expect(byId['python-django-framework-fintech'].date).toBe('2025-12-31');
    expect(byId['google-ads-skalowanie-budzetu'].date).toBe('2026-01-20');
    expect(byId['waf-bezpieczenstwo'].date).toBe('2026-01-28');
    expect(byId['ile-kosztuje-strona-rzeszow-2026'].date).toBe('2026-05-19');
    expect(byId['ile-kosztuje-strona-rzeszow-2026'].updatedDate).toBe('2026-10-24');
    expect(byId['ux-audit'].updatedDate).toBe('2026-11-13'); // przebudowa pod frazę, MIX-1270
    expect(LEGACY_ARTICLES.filter((a) => a.updatedDate).map((a) => a.id)).toEqual([
      'ile-kosztuje-strona-rzeszow-2026',
      'ux-audit',
    ]);
  });
});

describe('ArticleShell: autor i daty w treści i JSON-LD', () => {
  it.each([
    ['WAF', WafArticle, '2026-01-28', '2026-01-28'],
    ['Server-Side Tracking', ServerSideTrackingArticle, '2025-12-22', '2025-12-22'],
    ['Cennik Rzeszów', IleKosztujeStronaRzeszowArticle, '2026-05-19', '2026-10-24'],
  ])('%s', async (_n, Article, published, modified) => {
    const { container } = wrap(React.createElement(Article as React.FC));
    const ld = await findArticleLd();
    expect(ld.author).toMatchObject({
      '@type': 'Person',
      '@id': FOUNDER_ID,
      name: FOUNDER_NAME,
      sameAs: [FOUNDER_LINKEDIN],
      url: 'https://mixturemarketing.pl/o-nas/',
    });
    expect(ld.datePublished?.slice(0, 10)).toBe(published);
    expect(ld.dateModified?.slice(0, 10)).toBe(modified);

    const byline = container.querySelector('a[rel="author"]');
    expect(byline?.textContent).toContain('Jakub Niedziela');
    expect(container.textContent).not.toContain('Zespół Mixture Marketing');
    const times = Array.from(container.querySelectorAll('header time')).map((t) =>
      t.getAttribute('datetime')?.slice(0, 10),
    );
    expect(times).toEqual(published === modified ? [published] : [published, modified]);
  });

  it('artykuł spoza rejestru bez dat: brak zmyślonej daty (żadnego 2025-01-01)', async () => {
    const { container } = wrap(
      <ArticleShell
        id="x"
        title="Test"
        description="Opis"
        category="tech"
        categoryLabel="Tech"
        image="/assets/images/sygnet.png"
        accentColor="#000"
        slug="/baza-wiedzy/nie-ma-takiego"
      >
        <p>treść</p>
      </ArticleShell>,
    );
    const ld = await findArticleLd();
    expect(ld.datePublished).toBeUndefined();
    expect(ld.dateModified).toBeUndefined();
    expect(container.querySelectorAll('header time')).toHaveLength(0);
    expect(JSON.stringify(ld)).not.toContain('2025-01-01');
  });

  it('autor spoza zespołu: bez @id założyciela i bez sameAs', async () => {
    wrap(
      <ArticleShell
        id="y"
        title="Gość"
        description="Opis"
        category="tech"
        categoryLabel="Tech"
        image="/assets/images/sygnet.png"
        accentColor="#000"
        slug="/baza-wiedzy/redis-optymalizacja"
        author={{ name: 'Ktoś Inny' }}
      >
        <p>treść</p>
      </ArticleShell>,
    );
    const ld = await findArticleLd();
    expect(ld.author?.['@id']).toBeUndefined();
    expect(ld.author?.sameAs).toBeUndefined();
    expect(ld.datePublished?.slice(0, 10)).toBe('2025-12-22');
  });
});

describe('LinkedIn: jeden adres na stronie', () => {
  it('w kodzie strony jest dokładnie jeden adres profilu LinkedIn osoby', () => {
    const found = new Map<string, string[]>();
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(tsx?|js)$/.test(e.name)) {
          for (const m of fs.readFileSync(p, 'utf-8').match(LINKEDIN_RE) ?? []) {
            found.set(m, [...(found.get(m) ?? []), path.relative(ROOT, p)]);
          }
        }
      }
    };
    for (const d of ['components', 'config', 'data', 'utils', 'services']) walk(path.join(ROOT, d));
    expect([...found.keys()]).toEqual([FOUNDER_LINKEDIN]);
    expect(found.get(FOUNDER_LINKEDIN)).toEqual(['utils/seo/organizationSchema.ts']);
  });

  it('/o-nas/: założyciel bez LinkedIn w CMS dostaje potwierdzony adres; inni bez zgadywania', () => {
    const jakub = normalizeTeamMember({
      _id: '1',
      name: 'Jakub Niedziela',
      role: 'CEO',
      linkedin: null,
    } as unknown as SanityTeamMember);
    expect(jakub.linkedin).toBe(FOUNDER_LINKEDIN);
    const karol = normalizeTeamMember({
      _id: '2',
      name: 'Karol Mierzwa ',
      role: 'CCO',
    } as SanityTeamMember);
    expect(karol.linkedin).toBeUndefined();
    const cms = normalizeTeamMember({
      _id: '3',
      name: 'Jakub Niedziela',
      linkedin: 'https://pl.linkedin.com/in/inny',
    } as SanityTeamMember);
    expect(cms.linkedin).toBe('https://pl.linkedin.com/in/inny');
    const proto = normalizeTeamMember({ _id: '4', name: 'constructor' } as SanityTeamMember);
    expect(proto.linkedin).toBeUndefined();
  });
});
