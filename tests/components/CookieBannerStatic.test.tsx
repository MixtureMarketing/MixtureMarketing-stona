// MIX-1579: baner zgód w prerenderowanym HTML (VITE_MM_COOKIE_BANNER_STATIC) i skrypt w <head>,
// który przed pierwszym malowaniem chowa go gościom z zapisaną zgodą. Skrypt powtarza
// allowlistę z utils/consentValue.ts, więc test sprawdza zgodność obu na tych samych wpisach.
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CookieBanner from '../../components/features/CookieBanner';
import { CONSENT_STORAGE_KEY, checkStoredConsent } from '../../utils/consentValue';
import { blockStorage } from '../utils/storageBlock';

vi.mock('../../utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../utils/analytics')>()),
  applyConsent: vi.fn(),
}));

const BANNER = { name: 'Baner plików cookies' };
const BUTTON = { name: 'Ustawienia plików cookies' };

const renderBanner = () =>
  render(
    <MemoryRouter>
      <CookieBanner />
    </MemoryRouter>,
  );
const flush = () => act(() => new Promise((r) => setTimeout(r, 0)));

// --- skrypt z index.html -------------------------------------------------------------------
const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
const headScript = (() => {
  const all = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const hit = all.find((s) => s.includes('mm-zgoda-baner'));
  if (!hit) throw new Error('index.html: brak skryptu banera zgód (mm-zgoda-baner)');
  return hit;
})();

const injectedStyles = () =>
  [...document.head.querySelectorAll('style')].filter((s) =>
    (s.textContent || '').includes('mm-zgoda-baner'),
  );
const runHeadScript = () => {
  injectedStyles().forEach((s) => s.remove());
  new Function(headScript)();
  return injectedStyles().map((s) => s.textContent || '');
};

// Wpisy w localStorage (null = brak wpisu). Każda odmowa ma dozwolonego bliźniaka.
const ENTRIES: Array<[string, string | null]> = [
  ['zgoda pełna', '{"analytics":true,"marketing":true}'],
  ['odmowa wszystkiego (też decyzja)', '{"analytics":false,"marketing":false}'],
  ['mieszana', '{"marketing":true,"analytics":false}'],
  ['brak wpisu', null],
  ['pusty napis', ''],
  ['uszkodzony JSON', '{"analytics":true,'],
  ['null', 'null'],
  ['liczba', '1'],
  ['napis', '"tak"'],
  ['tablica', '[true,true]'],
  ['pusty obiekt', '{}'],
  ['brak pola marketing', '{"analytics":true}'],
  ['obce pole', '{"analytics":true,"marketing":true,"x":1}'],
  ['obce pole zamiast marketing', '{"analytics":true,"ads":true}'],
  ['napis zamiast boolean', '{"analytics":"true","marketing":true}'],
  ['liczba zamiast boolean', '{"analytics":1,"marketing":0}'],
  ['null w polu', '{"analytics":null,"marketing":true}'],
  ['__proto__ jako pole', '{"__proto__":{"analytics":true},"marketing":true}'],
  ['zagnieżdżony obiekt', '{"analytics":{"v":true},"marketing":true}'],
];

describe('index.html: skrypt widoczności banera zgód (MIX-1579)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.isPrerendering = undefined;
  });
  afterEach(() => {
    injectedStyles().forEach((s) => s.remove());
    window.isPrerendering = undefined;
  });

  it('klucz w skrypcie = CONSENT_STORAGE_KEY', () => {
    expect(headScript).toContain(`'${CONSENT_STORAGE_KEY}'`);
  });

  it.each(ENTRIES)(
    '%s: skrypt chowa baner wtedy i tylko wtedy, gdy allowlista przyjmuje',
    (_n, raw) => {
      if (raw !== null) window.localStorage.setItem(CONSENT_STORAGE_KEY, raw);
      const styles = runHeadScript();
      const allowed = checkStoredConsent(raw).ok;
      expect(styles.length).toBe(allowed ? 1 : 0);
      if (allowed) {
        expect(styles[0]).toBe(
          '.mm-zgoda-baner{display:none!important}.mm-zgoda-przycisk{display:block!important}',
        );
      }
    },
  );

  // MIX-1589 (luka V1 z werdyktu MIX-1579): pole marketing, które nie jest true/false, nie może
  // przejść jako zgoda (skrypt nie chowa banera, allowlista odmawia). Bliźniak: false/true przechodzą.
  it.each([
    ['napis "true"', '"true"'],
    ['liczba 1', '1'],
    ['napis "yes"', '"yes"'],
    ['null', 'null'],
    ['tablica', '[true]'],
    ['obiekt', '{"v":true}'],
  ])('marketing jako %s nie chowa banera (skrypt i allowlista odmawiają)', (_n, value) => {
    const raw = `{"analytics":true,"marketing":${value}}`;
    window.localStorage.setItem(CONSENT_STORAGE_KEY, raw);
    const check = checkStoredConsent(raw);
    expect(check.ok).toBe(false);
    expect(check.ok ? '' : check.reason).toBe('odmowa: pole marketing nie jest true/false');
    expect(runHeadScript()).toEqual([]);
  });

  it.each(['true', 'false'])('bliźniak: marketing %s (boolean) chowa baner', (value) => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      `{"analytics":false,"marketing":${value}}`,
    );
    expect(runHeadScript()).toHaveLength(1);
  });

  it('zgoda pod starym kluczem (cookie-consent) nie chowa banera', () => {
    window.localStorage.setItem('cookie-consent', '{"analytics":true,"marketing":true}');
    expect(runHeadScript()).toEqual([]);
  });

  it('pole z zatrutego prototypu nie liczy się jako własne (allowlista też odmawia)', () => {
    const raw = '{"analytics":true,"x":1}';
    window.localStorage.setItem(CONSENT_STORAGE_KEY, raw);
    const proto = Object.prototype as unknown as Record<string, unknown>;
    proto.marketing = true;
    try {
      expect(checkStoredConsent(raw).ok).toBe(false);
      expect(runHeadScript()).toEqual([]);
    } finally {
      delete proto.marketing;
    }
  });

  it('zablokowany storage: brak stylu (baner widoczny), bez wyjątku', () => {
    const restore = blockStorage();
    try {
      expect(() => runHeadScript()).not.toThrow();
      expect(injectedStyles()).toHaveLength(0);
    } finally {
      restore();
    }
  });

  it('w prerenderze nic nie wstrzykuje, nawet przy zapisanej zgodzie', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, '{"analytics":true,"marketing":true}');
    window.isPrerendering = true;
    expect(runHeadScript()).toEqual([]);
  });
});

describe('CookieBanner z VITE_MM_COOKIE_BANNER_STATIC (MIX-1579)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.isPrerendering = undefined;
    vi.stubEnv('VITE_MM_COOKIE_BANNER_STATIC', '1');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    window.isPrerendering = undefined;
  });

  it('prerender: baner otwarty w zrzucie (mm-zgoda-baner, bez animacji) + ukryty przycisk', () => {
    window.isPrerendering = true;
    renderBanner();
    const banner = screen.getByRole('region', BANNER);
    expect(banner.className).toContain('mm-zgoda-baner');
    expect(banner.className).not.toContain('animate-fade-in-up');
    const button = screen.getByRole('button', { ...BUTTON, hidden: true });
    expect(button.className).toContain('mm-zgoda-przycisk');
    expect(button.className.split(' ')).toContain('hidden');
  });

  it('przeglądarka bez zgody: baner otwarty już w pierwszym renderze, bez animacji wejścia', () => {
    renderBanner();
    const banner = screen.getByRole('region', BANNER);
    expect(banner.className).not.toContain('animate-fade-in-up');
    expect(banner.className).not.toContain('mm-zgoda-baner');
    expect(screen.queryByRole('button', BUTTON)).toBeNull();
  });

  it('przeglądarka z zapisaną zgodą: od razu tylko przycisk, ponowne otwarcie z animacją', async () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, '{"analytics":true,"marketing":false}');
    renderBanner();
    expect(screen.queryByRole('region', BANNER)).toBeNull();
    const button = screen.getByRole('button', BUTTON);
    expect(button.className).not.toContain('mm-zgoda-przycisk');
    fireEvent.click(button);
    expect(screen.getByRole('region', BANNER).className).toContain('animate-fade-in-up');
    await flush();
  });

  it('przeglądarka z podmienionym wpisem: baner (fail-closed)', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, '{"analytics":true,"marketing":true,"x":1}');
    renderBanner();
    expect(screen.getByRole('region', BANNER)).toBeInTheDocument();
  });

  it('UA headless poza prerenderem: baner się nie otwiera (jak dotąd)', async () => {
    const ua = vi
      .spyOn(Navigator.prototype, 'userAgent', 'get')
      .mockReturnValue('HeadlessChrome/140');
    try {
      renderBanner();
      await flush();
      expect(screen.queryByRole('region', BANNER)).toBeNull();
      expect(screen.getByRole('button', BUTTON).className).not.toContain('mm-zgoda-przycisk');
    } finally {
      ua.mockRestore();
    }
  });
});

describe('CookieBanner bez flagi: dotychczasowe zachowanie (MIX-1579)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.isPrerendering = undefined;
    vi.stubEnv('VITE_MM_COOKIE_BANNER_STATIC', '');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    window.isPrerendering = undefined;
  });

  it('prerender: bez banera i bez klas mm-zgoda-*', async () => {
    window.isPrerendering = true;
    renderBanner();
    await flush();
    expect(screen.queryByRole('region', BANNER)).toBeNull();
    expect(screen.getByRole('button', BUTTON).className).not.toContain('mm-zgoda');
  });

  it('przeglądarka bez zgody: baner otwiera się dopiero po efekcie, z animacją', async () => {
    renderBanner();
    expect(screen.queryByRole('region', BANNER)).toBeNull();
    await flush();
    expect(screen.getByRole('region', BANNER).className).toContain('animate-fade-in-up');
  });
});
