import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';
import PortalLogin from '../../components/portal/PortalLogin';
import PortalDashboard from '../../components/portal/PortalDashboard';
import AdminDashboard from '../../components/portal/AdminDashboard';
import ErrorBoundary from '../../components/common/ErrorBoundary';

const jsonResponse = (status: number, body: unknown) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    blob: async () => new Blob(),
  });

const loginAs = (role: 'admin' | 'client') => {
  localStorage.setItem(
    'portal_user',
    JSON.stringify({ id: '1', name: 'Jan', email: 'jan@test.pl', role }),
  );
  localStorage.setItem('portal_token', 'stary_token');
};

const renderPortal = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <NotificationProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Routes>
              <Route path="/portal" element={<PortalLogin />} />
              <Route path="/portal/dashboard" element={<PortalDashboard />} />
              <Route path="/portal/admin" element={<AdminDashboard />} />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </NotificationProvider>
    </MemoryRouter>,
  );

describe('wygasła / zastąpiona sesja', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const originalFetch = global.fetch;
  afterEach(() => {
    // NIE vi.unstubAllGlobals() — zdjęłoby też matchMedia/IntersectionObserver z tests/setup.ts.
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('panel admina: 403 z /api/admin → wylogowanie i logowanie z komunikatem (bez crasha)', async () => {
    loginAs('admin');
    global.fetch = vi.fn(() =>
      jsonResponse(403, { error: 'Admin access required' }),
    ) as unknown as typeof fetch;

    renderPortal('/portal/admin');

    expect(
      await screen.findByText(/Sesja wygasła — zaloguj się ponownie/i, {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Wyślij Link Logowania/i)).toBeInTheDocument();
    expect(screen.queryByText(/Coś poszło nie tak/i)).not.toBeInTheDocument();
    expect(localStorage.getItem('portal_token')).toBeNull();
  });

  it('portal klienta: 401 → logowanie z komunikatem zamiast stałego „Błąd ładowania”', async () => {
    loginAs('client');
    global.fetch = vi.fn(() =>
      jsonResponse(401, { error: 'Invalid or expired session' }),
    ) as unknown as typeof fetch;

    renderPortal('/portal/dashboard');

    expect(
      await screen.findByText(/Sesja wygasła — zaloguj się ponownie/i, {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Błąd ładowania projektów/i)).not.toBeInTheDocument();
  });

  it('panel admina: odpowiedź bez tablic (np. 500/obiekt błędu) nie wywraca list', async () => {
    loginAs('admin');
    global.fetch = vi.fn((url: string) =>
      url.includes('get_leads')
        ? jsonResponse(200, { error: 'D1 limit' }) // brak `leads`
        : jsonResponse(500, { error: 'boom' }),
    ) as unknown as typeof fetch;

    renderPortal('/portal/admin');
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    fireEvent.click(await screen.findByRole('button', { name: /^Leads$/ }));
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByText(/Coś poszło nie tak/i)).not.toBeInTheDocument();
    expect(localStorage.getItem('portal_token')).toBe('stary_token'); // 500 ≠ wylogowanie
  });
});
