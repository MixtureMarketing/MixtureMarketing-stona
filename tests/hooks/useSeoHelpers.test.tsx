import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useCanonicalUrl } from '../../hooks/useSeoHelpers';

// MIX-921 (audyt MIX-897 P3): domyślny canonical nie może doklejać location.search —
// ?kategoria=, ?gclid=, ?utm_* tworzyły w indeksie Google osobne strony.
const canonicalAt = (url: string, canonical?: string) =>
  renderHook(() => useCanonicalUrl(canonical), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
    ),
  }).result.current;

describe('useCanonicalUrl — domyślny canonical bez parametrów', () => {
  it.each([
    ['/baza-wiedzy/?kategoria=seo', 'https://mixturemarketing.pl/baza-wiedzy/'],
    ['/baza-wiedzy?kategoria=ux', 'https://mixturemarketing.pl/baza-wiedzy/'],
    ['/?gclid=abc123', 'https://mixturemarketing.pl/'],
    [
      '/web-development/?utm_source=google&utm_medium=cpc&utm_campaign=x',
      'https://mixturemarketing.pl/web-development/',
    ],
    ['/contact/?q=1#formularz', 'https://mixturemarketing.pl/contact/'],
  ])('%s → %s', (url, expected) => {
    expect(canonicalAt(url)).toBe(expected);
  });

  it.each([
    ['/', 'https://mixturemarketing.pl/'],
    ['/baza-wiedzy/', 'https://mixturemarketing.pl/baza-wiedzy/'],
    ['/marketing/analytics', 'https://mixturemarketing.pl/marketing/analytics/'],
  ])('bez parametrów: %s → %s (dopisany ukośnik, absolutny URL)', (url, expected) => {
    expect(canonicalAt(url)).toBe(expected);
  });

  it('jawny canonical wygrywa nad adresem z parametrami', () => {
    expect(canonicalAt('/baza-wiedzy/?kategoria=seo', '/baza-wiedzy/')).toBe(
      'https://mixturemarketing.pl/baza-wiedzy/',
    );
    expect(canonicalAt('/x/?gclid=1', 'https://example.com/y/')).toBe('https://example.com/y/');
  });
});
