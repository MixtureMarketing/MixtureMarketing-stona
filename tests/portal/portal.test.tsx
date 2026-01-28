import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import PortalLogin from '../../components/portal/PortalLogin';
import PortalDashboard from '../../components/portal/PortalDashboard';
import AdminDashboard from '../../components/portal/AdminDashboard';

// Mock fetch
global.fetch = vi.fn();

// Mock LocalStorage
const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem: function (key: string) {
      return store[key] || null;
    },
    setItem: function (key: string, value: string) {
      store[key] = value.toString();
    },
    clear: function () {
      store = {};
    },
    removeItem: function (key: string) {
      delete store[key];
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Portal Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('PortalLogin sends magic link request', async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Link sent' }),
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <PortalLogin />
        </AuthProvider>
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText(/np. jan@twoja-firma.pl/i);
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    const button = screen.getByText(/Wyślij Link Logowania/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/send_magic_link.php',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Sprawdź skrzynkę!/i)).toBeInTheDocument();
    });
  });

  it('PortalDashboard renders projects for logged in user', async () => {
    // Mock User in LocalStorage
    const mockUser = { id: '1', name: 'Jan Test', email: 'jan@test.pl', role: 'client' };
    localStorage.setItem('portal_user', JSON.stringify(mockUser));
    localStorage.setItem('portal_token', 'mock_token_123');

    // Mock API responses
    (global.fetch as Mock).mockImplementation((url: string) => {
      if (url.includes('dashboard.php')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            projects: [
              {
                id: '101',
                name: 'Projekt Testowy',
                type: 'web',
                status: 'in_progress',
                progress: 50,
              },
            ],
          }),
        });
      }
      if (url.includes('get_messages.php')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ messages: [] }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <PortalDashboard />
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Projekt Testowy')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  it('PortalDashboard allows sending a message', async () => {
    const mockUser = { id: '1', name: 'Jan Test', email: 'jan@test.pl', role: 'client' };
    localStorage.setItem('portal_user', JSON.stringify(mockUser));
    localStorage.setItem('portal_token', 'mock_token_123');

    (global.fetch as Mock).mockImplementation((url: string) => {
      if (url.includes('dashboard.php') || url.includes('get_messages.php')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ projects: [], messages: [] }),
        });
      }
      if (url.includes('send_message.php')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: 'Sent' }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <PortalDashboard />
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByPlaceholderText(/Napisz wiadomość.../i));

    const input = screen.getByPlaceholderText(/Napisz wiadomość.../i);
    fireEvent.change(input, { target: { value: 'Hello Admin' } });

    const sendBtn = screen.getByText(/Wyślij/i);
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/portal/send_message.php',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            content: 'Hello Admin',
            sender_type: 'client',
          }),
        }),
      );
    });
  });

  it('AdminDashboard redirects non-admin users', async () => {
    // Mock Client User
    const mockUser = { id: '1', name: 'Jan Client', email: 'client@test.pl', role: 'client' };
    localStorage.setItem('portal_user', JSON.stringify(mockUser));
    localStorage.setItem('portal_token', 'mock_token_123');

    // We need to mock navigation to verify redirect
    // Since MemoryRouter handles navigation internally, we can check if PortalDashboard is rendered instead of AdminDashboard
    // Or we can mock useNavigate. Let's try checking if it redirects to dashboard.

    // Mock API to prevent errors during initial render attempt
    (global.fetch as Mock).mockResolvedValue({ ok: true, json: async () => ({}) });

    render(
      <MemoryRouter initialEntries={['/portal/admin']}>
        <AuthProvider>
          <Routes>
            <Route path="/portal/admin" element={<AdminDashboard />} />
            <Route path="/portal/dashboard" element={<div>Client Dashboard Reached</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Client Dashboard Reached')).toBeInTheDocument();
    });
  });
});
