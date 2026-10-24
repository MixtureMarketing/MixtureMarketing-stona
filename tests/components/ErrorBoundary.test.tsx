import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import ErrorBoundary, { isChunkLoadError } from '../../components/common/ErrorBoundary';

const Bomb = ({ message = 'boom' }: { message?: string }) => {
  throw new Error(message);
};

const Shell = () => {
  const location = useLocation();
  return (
    <>
      <nav>
        <Link to="/ok">Do działającej strony</Link>
      </nav>
      <ErrorBoundary resetKey={location.pathname}>
        <Routes>
          <Route path="/zepsuta" element={<Bomb />} />
          <Route path="/ok" element={<p>Strona działa</p>} />
        </Routes>
      </ErrorBoundary>
    </>
  );
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resetuje się po nawigacji (zmiana pathname)', () => {
    render(
      <MemoryRouter initialEntries={['/zepsuta']}>
        <Shell />
      </MemoryRouter>,
    );
    expect(screen.getByText('Coś poszło nie tak.')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Do działającej strony'));
    expect(screen.getByText('Strona działa')).toBeInTheDocument();
    expect(screen.queryByText('Coś poszło nie tak.')).not.toBeInTheDocument();
  });

  it('fallback "minimal" (granica nad całym App) — komunikat zamiast białej strony', () => {
    render(
      <ErrorBoundary fallback="minimal">
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Coś poszło nie tak — odśwież stronę')).toBeInTheDocument();
    expect(document.querySelector('[data-error-boundary]')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Odśwież stronę' })).toBeInTheDocument();
  });

  it('własny fallback (np. modal kontaktowy) nie zastępuje reszty strony', () => {
    render(
      <>
        <p>Treść strony</p>
        <ErrorBoundary fallback={<p>Nie udało się otworzyć formularza.</p>}>
          <Bomb />
        </ErrorBoundary>
      </>,
    );
    expect(screen.getByText('Treść strony')).toBeInTheDocument();
    expect(screen.getByText('Nie udało się otworzyć formularza.')).toBeInTheDocument();
  });

  it('„Spróbuj ponownie” przy zwykłym błędzie renderuje dzieci ponownie', () => {
    let shouldThrow = true;
    const Flaky = () => {
      if (shouldThrow) throw new Error('raz');
      return <p>Naprawione</p>;
    };
    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    );
    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));
    expect(screen.getByText('Naprawione')).toBeInTheDocument();
  });

  it('rozpoznaje błędy ładowania chunków (wtedy retry = reload)', () => {
    expect(
      isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: /a.js')),
    ).toBe(true);
    expect(isChunkLoadError(new Error('Importing a module script failed.'))).toBe(true);
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false);
  });

  it('App: granica w <main> ma resetKey=pathname, modal ma własną granicę; index.tsx owija całość', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const root = path.resolve(__dirname, '../..');
    const app = fs.readFileSync(path.join(root, 'App.tsx'), 'utf8');
    const index = fs.readFileSync(path.join(root, 'index.tsx'), 'utf8');
    expect(app).toMatch(/<ErrorBoundary resetKey=\{location\.pathname\}>/);
    expect(app).toMatch(/<ErrorBoundary fallback=\{<ContactModalError/);
    expect(index).toMatch(/<ErrorBoundary fallback="minimal">\s*<HelmetProvider>/);
  });
});
