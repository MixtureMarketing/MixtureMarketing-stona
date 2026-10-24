import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { signalSessionExpired } from '../../utils/sessionExpiry';

const Probe: React.FC = () => {
  const { user, sessionToken, logout } = useAuth();
  return (
    <div>
      <span data-testid="state">{user ? `in:${sessionToken}` : 'out'}</span>
      <button onClick={logout}>wyloguj</button>
    </div>
  );
};

const renderWithSession = () => {
  localStorage.setItem(
    'portal_user',
    JSON.stringify({ id: '2', name: 'Jan', email: 'jan@test.pl', role: 'client' }),
  );
  localStorage.setItem('portal_token', 'tok_123456789012345678');
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
};

describe('AuthContext.logout — wylogowanie także na serwerze (F12)', () => {
  const originalFetch = global.fetch;
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('woła POST /api/auth/logout z tokenem i czyści stan lokalny', () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response('{}')));
    global.fetch = fetchMock as unknown as typeof fetch;
    renderWithSession();
    expect(screen.getByTestId('state').textContent).toBe('in:tok_123456789012345678');

    fireEvent.click(screen.getByText('wyloguj'));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/auth/logout');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer tok_123456789012345678',
    );
    expect(init.keepalive).toBe(true);
    expect(screen.getByTestId('state').textContent).toBe('out');
    expect(localStorage.getItem('portal_token')).toBeNull();
  });

  it('błąd sieci przy wylogowaniu nie blokuje wylogowania lokalnego', () => {
    global.fetch = vi.fn(() => Promise.reject(new TypeError('offline'))) as unknown as typeof fetch;
    renderWithSession();
    fireEvent.click(screen.getByText('wyloguj'));
    expect(screen.getByTestId('state').textContent).toBe('out');
    expect(localStorage.getItem('portal_user')).toBeNull();
  });

  it('wygaśnięcie sesji (serwer już odrzucił token) nie woła /api/auth/logout', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response('{}')));
    global.fetch = fetchMock as unknown as typeof fetch;
    renderWithSession();
    act(() => signalSessionExpired());
    expect(screen.getByTestId('state').textContent).toBe('out');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
