// MIX-1269: render strony głównej do testów SEO (title, meta, H1, linki lokalne).
// Prawdziwe: Home, Hero, Services i <Seo>. Zastąpione znacznikami (vi.mock w pliku testu): canvas hero,
// pozostałe sekcje i pasek mobilny, więc wzorzec w tests/fixtures/mix1269 obejmuje dokładnie to,
// czego dotyka przełącznik VITE_MM_HOME_SEO.
import React from 'react';
import { expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ModalProvider } from '../../context/ModalContext';
import Home from '../../components/pages/Home';

export interface HomeSnapshot {
  html: string;
  title: string;
  description: string | null;
  canonical: string | null;
  jsonLd: string[];
}

/** Home po załadowaniu leniwych sekcji i po zapisaniu <head> przez Helmet. */
export async function renderHomeSeo() {
  const r = render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/']}>
        <ModalProvider>
          <Home />
        </ModalProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
  await screen.findByTestId('final');
  await waitFor(() => expect(r.container.querySelector('[data-mock="kb"]')).not.toBeNull());
  await waitFor(() => expect(document.title).not.toBe(''));
  return r;
}

/** Zrzut tego, co widzi robot: HTML treści i znaczniki SEO z <head>. */
export function snapshotHome(container: HTMLElement): HomeSnapshot {
  const head = document.head;
  return {
    html: container.innerHTML,
    title: document.title,
    description: head.querySelector('meta[name="description"]')?.getAttribute('content') ?? null,
    canonical: head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
    jsonLd: [...head.querySelectorAll('script[type="application/ld+json"]')].map(
      (s) => s.textContent ?? '',
    ),
  };
}
