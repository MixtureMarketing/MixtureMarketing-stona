import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CookieBanner from '../../components/features/CookieBanner';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { blockStorage } from '../utils/storageBlock';

vi.mock('../../utils/analytics', () => ({
  applyConsent: vi.fn(),
}));

const renderBanner = () =>
  render(
    <MemoryRouter>
      <CookieBanner />
    </MemoryRouter>,
  );

// CookieBanner otwiera się w setTimeout(0) — przepychamy kolejkę.
const flush = () => act(() => new Promise((r) => setTimeout(r, 0)));

describe('CookieBanner', () => {
  let restore: (() => void) | null = null;

  beforeEach(() => {
    window.localStorage.clear();
    window.isPrerendering = undefined;
  });

  afterEach(() => {
    restore?.();
    restore = null;
    window.isPrerendering = undefined;
  });

  it('otwiera baner przy braku zgody', async () => {
    renderBanner();
    await flush();
    expect(screen.getByRole('region', { name: 'Baner plików cookies' })).toBeInTheDocument();
  });

  it('podczas prerenderu NIE otwiera banera (zostaje tylko przycisk)', async () => {
    window.isPrerendering = true;
    renderBanner();
    await flush();
    expect(screen.queryByRole('region', { name: 'Baner plików cookies' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Ustawienia plików cookies' })).toBeInTheDocument();
  });

  it('nie otwiera banera, gdy zgoda jest zapisana', async () => {
    window.localStorage.setItem(
      'cookie-consent-v2',
      JSON.stringify({ analytics: true, marketing: false }),
    );
    renderBanner();
    await flush();
    expect(screen.queryByRole('region', { name: 'Baner plików cookies' })).toBeNull();
  });

  it('uszkodzony wpis zgody traktuje jak brak zgody (bez wyjątku)', async () => {
    window.localStorage.setItem('cookie-consent-v2', '{zepsute');
    renderBanner();
    await flush();
    expect(screen.getByRole('region', { name: 'Baner plików cookies' })).toBeInTheDocument();
  });

  it('przy zablokowanym storage renderuje się i pozwala zaakceptować bez wyjątku', async () => {
    restore = blockStorage('localStorage');
    renderBanner();
    await flush();
    const region = screen.getByRole('region', { name: 'Baner plików cookies' });
    expect(region).toBeInTheDocument();

    fireEvent.click(screen.getByText('Akceptuję wszystkie'));
    expect(screen.queryByRole('region', { name: 'Baner plików cookies' })).toBeNull();
  });
});

describe('AuthProvider przy zablokowanym storage', () => {
  let restore: (() => void) | null = null;

  afterEach(() => {
    restore?.();
    restore = null;
  });

  const Probe = () => {
    const { user, sessionToken, logout } = useAuth();
    return (
      <div>
        <span data-testid="state">{`${user ? user.email : 'anon'}|${sessionToken ?? 'none'}`}</span>
        <button onClick={logout}>logout</button>
      </div>
    );
  };

  it('montuje się jako niezalogowany i wylogowanie nie rzuca', () => {
    restore = blockStorage('localStorage');
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    expect(screen.getByTestId('state')).toHaveTextContent('anon|none');
    expect(() => fireEvent.click(screen.getByText('logout'))).not.toThrow();
  });

  it('uszkodzony portal_user nie wywraca providera', () => {
    window.localStorage.setItem('portal_user', '{zepsute');
    window.localStorage.setItem('portal_token', 'tok');
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    expect(screen.getByTestId('state')).toHaveTextContent('anon|tok');
    window.localStorage.clear();
  });
});
