// MIX-1272 (plan SEO A18): strona usługi „Systemy AI i aplikacje” jest UKRYTA do akceptacji Jakuba
// (noindex, poza sitemapą i menu), ma JSON-LD jak strony-siostry i linki wewnętrzne ze slashem.
// Publikacja = świadoma zmiana tych testów (patrz docs/tresci/MIX-1272.md).
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModalProvider } from '../../context/ModalContext';
import { NotificationProvider } from '../../context/NotificationContext';
import AiSystemsApps from '../../components/pages/AiSystemsApps';
import { appRoutes } from '../../config/routes';
import { routes, prerenderOnlyRoutes } from '../../routes.js';
import { checkPrerenderedPage } from '../../scripts/prerender-gate.js';
import {
  AI_SYSTEMS_CONTENT,
  AI_SYSTEMS_PATH,
} from '../../data/content/services/web-development/ai-systems';

vi.mock('../../utils/analytics', () => ({ trackEvent: vi.fn() }));

const root = path.resolve(__dirname, '../..');
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[AI_SYSTEMS_PATH]}>
        <NotificationProvider>
          <ModalProvider>
            <AiSystemsApps />
          </ModalProvider>
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

beforeEach(() => {
  document.head.innerHTML = '';
});

describe('/web-development/systemy-ai-aplikacje/: trasa i ukrycie', () => {
  it('trasa renderuje się w tabeli routingu', () => {
    expect(appRoutes.map((r) => r.path)).toContain('/web-development/systemy-ai-aplikacje');
  });

  it('jest prerenderowana (prerenderOnlyRoutes), ale NIE jest w liście sitemapy', () => {
    expect(prerenderOnlyRoutes).toContain(AI_SYSTEMS_PATH);
    expect(routes).not.toContain(AI_SYSTEMS_PATH);
    expect(routes).not.toContain(AI_SYSTEMS_PATH.replace(/\/$/, ''));
  });

  it('nie ma jej w wygenerowanym public/sitemap.xml', () => {
    expect(read('public/sitemap.xml')).not.toContain('systemy-ai-aplikacje');
  });

  it('bramka prerenderu przepuszcza noindex tej trasy, ale odrzuca ją, gdyby wypadła z prerenderOnlyRoutes', () => {
    const signals = { noindex: true, title: 'Systemy AI i aplikacje' };
    expect(checkPrerenderedPage(AI_SYSTEMS_PATH, signals, { prerenderOnlyRoutes })).toBeNull();
    expect(checkPrerenderedPage(AI_SYSTEMS_PATH, signals, { prerenderOnlyRoutes: [] })).toMatch(
      /nieoczekiwane <meta name="robots" content="noindex">/,
    );
  });

  it('żadne menu ani stopka nie linkują do strony (ukryta do akceptacji)', () => {
    for (const f of [
      'components/layout/navbarData.ts',
      'components/layout/MegaMenu.tsx',
      'components/common/WebDevSpokeFooter.tsx',
      'components/pages/CustomWebApp.tsx',
      'components/pages/WebDevelopment.tsx',
      'components/pages/Home.tsx',
      'public/llms.txt',
    ]) {
      expect(read(f), `${f} nie może linkować do ukrytej strony`).not.toContain(
        'systemy-ai-aplikacje',
      );
    }
  });
});

describe('/web-development/systemy-ai-aplikacje/: renderowanie, noindex, JSON-LD', () => {
  it('ma dokładnie jeden H1 z frazą „Systemy AI i aplikacje”', () => {
    renderPage();
    const h1 = screen.getAllByRole('heading', { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0].textContent).toMatch(/Systemy AI i aplikacje/);
  });

  it('jest noindex i ma kanoniczny adres ze slashem', async () => {
    renderPage();
    await waitFor(() => {
      expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
        'noindex, follow',
      );
    });
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `https://mixturemarketing.pl${AI_SYSTEMS_PATH}`,
    );
  });

  it('JSON-LD: Service, BreadcrumbList i FAQPage z tą samą liczbą pytań co widoczne FAQ', async () => {
    renderPage();
    await waitFor(() => expect(headLd().length).toBeGreaterThanOrEqual(3));
    const types = headLd().map((b) => b['@type']);
    expect(types).toEqual(expect.arrayContaining(['Service', 'BreadcrumbList', 'FAQPage']));
    const faq = headLd().find((b) => b['@type'] === 'FAQPage') as Ld & {
      mainEntity: unknown[];
    };
    expect(faq.mainEntity).toHaveLength(AI_SYSTEMS_CONTENT.faqs.length);
    const crumbs = headLd().find((b) => b['@type'] === 'BreadcrumbList') as Ld & {
      itemListElement: { item: string }[];
    };
    expect(crumbs.itemListElement.at(-1)!.item).toBe(
      `https://mixturemarketing.pl${AI_SYSTEMS_PATH}`,
    );
  });

  it('linkuje do stron wskazanych w planie (aplikacje dedykowane, wycena, realizacja AI, realizacje)', () => {
    renderPage();
    const hrefs = Array.from(document.querySelectorAll('a[href]')).map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toEqual(
      expect.arrayContaining([
        '/web-development/custom-app/',
        '/wycena/',
        '/portfolio/studentpi/',
        '/portfolio/',
      ]),
    );
  });
});

describe('treść: bez nazw klientów (zgoda A17 w toku, MIX-1325)', () => {
  const FORBIDDEN_NAMES = [/AI\s?Q-?PLAST/i, /PsychON/i, /Bibmot/i, /Niepodzielni/i, /Gabinet/i];

  it('przykłady nie mają nazwy klienta (clientName === null)', () => {
    for (const c of AI_SYSTEMS_CONTENT.cases) expect(c.clientName).toBeNull();
  });

  it('żadna nazwa klienta nie trafia do widocznego tekstu ani do JSON-LD', async () => {
    renderPage();
    await waitFor(() => expect(headLd().length).toBeGreaterThan(0));
    const visible = document.body.textContent ?? '';
    const ld = JSON.stringify(headLd());
    for (const re of FORBIDDEN_NAMES) {
      expect(visible).not.toMatch(re);
      expect(ld).not.toMatch(re);
    }
  });

  it('wykrywacz nazw nie jest pusty: łapie nazwę w tekście, przepuszcza opis ogólny', () => {
    expect(FORBIDDEN_NAMES.some((re) => re.test('Projekt dla AI Q-PLAST'))).toBe(true);
    expect(FORBIDDEN_NAMES.some((re) => re.test('Zakład produkcji tworzyw sztucznych'))).toBe(
      false,
    );
  });

  it('plik treści nie zawiera nazw klientów poza komentarzami', () => {
    const src = read('data/content/services/web-development/ai-systems.ts')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    for (const re of FORBIDDEN_NAMES) expect(src).not.toMatch(re);
  });
});
