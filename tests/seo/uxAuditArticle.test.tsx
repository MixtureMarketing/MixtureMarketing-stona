// MIX-1270 (SEO A13): artykuł „audyt UX sklepu internetowego” przebudowany pod frazę
// i artykuł o cenie strony podlinkowany z 3 stron (oraz z samego artykułu o audycie).
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, it, expect, vi } from 'vitest';
import { ModalProvider } from '../../context/ModalContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { LEGACY_ARTICLES } from '../../services/cms/legacyArticles';
import { UX_AUDIT_ARTICLE_CONTENT as CONTENT } from '../../data/content/articles/ux-audit';
import { routes } from '../../routes.js';
import { TITLE_MAX } from '../../utils/seo/title';
import UxAuditArticle from '../../components/articles/UxAuditArticle';

vi.mock('../../utils/analytics', () => ({ trackEvent: vi.fn() }));

const ROOT = path.resolve(__dirname, '../..');
const PRICE = '/baza-wiedzy/ile-kosztuje-strona-internetowa-rzeszow-2026/';
const PHRASE = 'audyt ux sklepu internetowego';

const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

describe('artykuł o cenie strony: 3 linki wewnętrzne z innych stron (A13)', () => {
  it.each([
    ['/web-development/rzeszow/', 'components/pages/WebDevRzeszow.tsx'],
    ['/wycena/', 'components/pages/WycenaCalculator.tsx'],
    ['/abonament/', 'components/pages/abonament/Abonament.tsx'],
  ])('%s linkuje do artykułu o cenie (ze slashem na końcu)', (_route, file) => {
    expect(read(file)).toContain(`to="${PRICE}"`);
  });

  it('adres artykułu o cenie jest w mapie stron i w rejestrze', () => {
    expect(routes).toContain(PRICE);
    expect(LEGACY_ARTICLES.some((a) => `${a.slug}/` === PRICE)).toBe(true);
  });
});

describe('artykuł „audyt UX sklepu” pod frazę (A13)', () => {
  it('<title> mieści się w 60 znakach i zaczyna od frazy', () => {
    expect(CONTENT.header.seoTitle.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(CONTENT.header.seoTitle.toLowerCase().startsWith(PHRASE)).toBe(true);
  });

  it('rejestr: tytuł i opis zawierają frazę, jest data przebudowy', () => {
    const a = LEGACY_ARTICLES.find((x) => x.id === 'ux-audit')!;
    expect(a.title.toLowerCase()).toContain(PHRASE);
    expect(a.description.toLowerCase()).toContain(PHRASE);
    expect(a.updatedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(a.updatedDate! > a.date).toBe(true);
  });

  it('treść nie zawiera liczb bez źródła usuniętych w przebudowie (70% ruchu, 100x)', () => {
    const all = JSON.stringify(CONTENT);
    expect(all).not.toMatch(/ponad 70%/);
    expect(all).not.toMatch(/100x/);
    expect(all).not.toMatch(/45%/);
  });

  it('linki wewnętrzne w treści prowadzą do istniejących stron i mają slash', () => {
    for (const href of [CONTENT.related.cost.href, CONTENT.related.speed.href]) {
      expect(href.endsWith('/')).toBe(true);
      expect(routes).toContain(href);
    }
  });

  it('render: H1 z frazą, nowe sekcje, link do ceny i CTA do /design/visual-audit/', async () => {
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter>
          <NotificationProvider>
            <ModalProvider>
              <UxAuditArticle />
            </ModalProvider>
          </NotificationProvider>
        </MemoryRouter>
      </HelmetProvider>,
    );
    await waitFor(() => expect(container.querySelector('h1')).not.toBeNull());
    expect(container.querySelector('h1')!.textContent!.toLowerCase()).toContain(PHRASE);
    // SectionHeader rozbija tytuł na słowa (TextReveal), więc porównujemy tekst nagłówków bez spacji.
    const headings = Array.from(container.querySelectorAll('h2')).map((h) =>
      h.textContent!.replace(/\s+/g, ''),
    );
    for (const title of [CONTENT.checklist.title, CONTENT.process.title]) {
      expect(headings).toContain(title.replace(/\s+/g, ''));
    }
    expect(container.querySelector(`a[href="${PRICE}"]`)).not.toBeNull();
    expect(container.querySelector('a[href="/design/visual-audit/"]')).not.toBeNull();
    await waitFor(() => expect(document.title.toLowerCase()).toContain(PHRASE));
  });
});
