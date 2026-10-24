import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';
import PortalLogin from '../../components/portal/PortalLogin';

const renderAt = () =>
  render(
    <MemoryRouter initialEntries={['/portal']}>
      <NotificationProvider>
        <AuthProvider>
          <Routes>
            <Route path="/portal" element={<PortalLogin />} />
            <Route path="/portal/dashboard" element={<div>Panel klienta</div>} />
            <Route path="/portal/admin" element={<div>Panel admina</div>} />
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </MemoryRouter>,
  );

const loginAs = (role: string) => {
  localStorage.setItem(
    'portal_user',
    JSON.stringify({ id: '1', name: 'Jan', email: 'jan@x.pl', role }),
  );
  localStorage.setItem('portal_token', 'tok');
};

describe('PortalLogin: zalogowany użytkownik trafia do swojego panelu', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it('klient → /portal/dashboard', async () => {
    loginAs('client');
    renderAt();
    expect(await screen.findByText('Panel klienta')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/jan@twoja-firma.pl/)).toBeNull();
  });

  it('admin → /portal/admin', async () => {
    loginAs('admin');
    renderAt();
    expect(await screen.findByText('Panel admina')).toBeInTheDocument();
  });

  it('niezalogowany widzi formularz logowania', () => {
    renderAt();
    expect(screen.getByPlaceholderText(/jan@twoja-firma.pl/)).toBeInTheDocument();
  });

  it('sam user bez tokenu sesji (niespójny storage) → formularz, bez przekierowania', () => {
    localStorage.setItem(
      'portal_user',
      JSON.stringify({ id: '1', name: 'Jan', email: 'jan@x.pl', role: 'client' }),
    );
    renderAt();
    expect(screen.getByPlaceholderText(/jan@twoja-firma.pl/)).toBeInTheDocument();
  });
});
