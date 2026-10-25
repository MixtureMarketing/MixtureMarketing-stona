import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';
import AdminDashboard from '../../components/portal/AdminDashboard';
import PortalPrzeniesiony from '../../components/portal/PortalPrzeniesiony';

// Stary panel przeniesiony do Mixture CRM (decyzja Karola z 25.10.2026): admin widzi tylko leady,
// bez „Odpisz” i „Zrób klienta”; klient pod /portal/dashboard widzi informację o nowym portalu.
const lead = {
  id: 'l1',
  email: 'ola@x.test',
  name: 'Ola',
  service_type: 'Sklep',
  status: 'new',
  created_at: '2026-10-20 10:00:00',
  message: 'Dzień dobry',
};

const zaloguj = (role: 'admin' | 'client') => {
  localStorage.setItem(
    'portal_user',
    JSON.stringify({ id: '1', name: 'Jan', email: 'jan@test.pl', role }),
  );
  localStorage.setItem('portal_token', 'token');
};

const pokaz = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <NotificationProvider>
        <AuthProvider>
          <Routes>
            <Route path="/portal" element={<p>logowanie</p>} />
            <Route path="/portal/dashboard" element={<PortalPrzeniesiony />} />
            <Route path="/portal/admin" element={<AdminDashboard />} />
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </MemoryRouter>,
  );

describe('panel po przeniesieniu do Mixture CRM', () => {
  const originalFetch = global.fetch;
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('admin: same leady tylko do odczytu, baner z linkiem do CRM, bez starych zakładek', async () => {
    zaloguj('admin');
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: async () => ({ leads: [lead] }) }),
    ) as unknown as typeof fetch;

    pokaz('/portal/admin');
    expect(await screen.findByText('Ola')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Otwórz Mixture CRM/ })).toHaveAttribute(
      'href',
      'https://mixture-crm.pages.dev',
    );
    expect(screen.queryByRole('button', { name: /Odpisz/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Zrób Klienta/i })).not.toBeInTheDocument();
    for (const zakladka of [/^Klienci$/, /^Projekty$/, /^Czat$/, /^Metryki$/, /^Wyceny$/]) {
      expect(screen.queryByRole('button', { name: zakladka })).not.toBeInTheDocument();
    }
    const adresy = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.map((c) =>
      String(c[0]),
    );
    expect(adresy.every((a) => a.startsWith('/api/admin/get_leads'))).toBe(true);
  });

  it('klient pod /portal/dashboard: informacja o nowym portalu i kontakt', async () => {
    zaloguj('client');
    pokaz('/portal/dashboard');
    expect(await screen.findByText('Portal klienta ma nowy adres')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'info@mixturemarketing.pl' })).toHaveAttribute(
      'href',
      'mailto:info@mixturemarketing.pl',
    );
  });

  it('admin pod /portal/dashboard trafia do podglądu leadów', async () => {
    zaloguj('admin');
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: async () => ({ leads: [] }) }),
    ) as unknown as typeof fetch;
    pokaz('/portal/dashboard');
    await waitFor(() => expect(screen.getByText('Leady ze strony')).toBeInTheDocument());
  });
});
