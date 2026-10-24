import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';
import PortalDashboard from '../../components/portal/PortalDashboard';

const ok = (body: unknown) =>
  Promise.resolve({ ok: true, status: 200, json: async () => body, blob: async () => new Blob() });
const fail = (status: number) =>
  Promise.resolve({ ok: false, status, json: async () => ({}), text: async () => 'x' });

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <NotificationProvider>
        <AuthProvider>
          <PortalDashboard />
        </AuthProvider>
      </NotificationProvider>
    </MemoryRouter>,
  );

const project = {
  id: '1',
  name: 'Sklep',
  type: 'web',
  status: 'in_progress',
  progress: 40,
  documents: [
    {
      id: '11',
      name: 'Umowa.pdf',
      file_path: 'x',
      type: 'document',
      subtype: 'contract',
      created_at: '2026-10-01',
    },
  ],
  milestones: [],
};

describe('Portal: błędy nie są już ciche', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      'portal_user',
      JSON.stringify({ id: '7', name: 'Anna', email: 'a@b.pl', role: 'client' }),
    );
    localStorage.setItem('portal_token', 'tok');
  });

  it('500 dashboardu: baner błędu BEZ sprzecznego „Brak aktywnych projektów”', async () => {
    global.fetch = vi.fn((url: string) =>
      String(url).includes('dashboard') ? fail(500) : ok({ messages: [] }),
    ) as unknown as typeof fetch;
    renderDashboard();
    expect(await screen.findByText('Błąd ładowania projektów.')).toBeInTheDocument();
    expect(screen.queryByText('Brak aktywnych projektów')).toBeNull();
  });

  it('pusty stan kieruje na info@ (jedyny adres agencji w serwisie)', async () => {
    global.fetch = vi.fn(() => ok({ projects: [], messages: [] })) as unknown as typeof fetch;
    renderDashboard();
    const cta = await screen.findByRole('button', { name: /Skontaktuj się z opiekunem/ });
    expect(cta).toHaveAttribute('href', 'mailto:info@mixturemarketing.pl');
  });

  it('pobieranie dokumentu z 404 pokazuje komunikat', async () => {
    global.fetch = vi.fn((url: string) => {
      const u = String(url);
      if (u.includes('download')) return fail(404);
      if (u.includes('dashboard')) return ok({ projects: [project] });
      return ok({ messages: [] });
    }) as unknown as typeof fetch;
    renderDashboard();
    fireEvent.click(await screen.findByRole('button', { name: 'Pobierz dokument: Umowa.pdf' }));
    expect(await screen.findByText(/Nie znaleziono pliku/)).toBeInTheDocument();
  });
});
