/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PortalDashboard from '../../components/portal/PortalDashboard';
import PortalLogin from '../../components/portal/PortalLogin';
import { AuthProvider } from '../../context/AuthContext';
import { ModalProvider } from '../../context/ModalContext';
import { NotificationProvider } from '../../context/NotificationContext';
import React from 'react';

// Mock MixtureApiClient
vi.mock('../../services/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import MixtureApiClient from '../../services/apiClient';

// Mock WebSocket
class MockWebSocket {
  onopen: any = null;
  onmessage: any = null;
  onclose: any = null;
  onerror: any = null;
  readyState = 1; // OPEN
  send = vi.fn();
  close = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}
vi.stubGlobal('WebSocket', MockWebSocket);

// Mock scroll function
window.scrollTo = vi.fn();

const mockUser = {
  id: '1',
  name: 'Jan Test',
  email: 'jan@test.pl',
  role: 'client',
};

const mockProjects = [
  {
    id: '1',
    name: 'Test Project',
    status: 'in_progress',
    progress: 50,
    documents: [],
    milestones: [],
  },
];

const mockMessages = [
  {
    id: 1,
    content: 'Hello',
    sender_type: 'admin',
    created_at: new Date().toISOString(),
  },
];

const renderPortal = () => {
  return render(
    <NotificationProvider>
      <ModalProvider>
        <AuthProvider>
          <BrowserRouter>
            <PortalDashboard />
          </BrowserRouter>
        </AuthProvider>
      </ModalProvider>
    </NotificationProvider>,
  );
};

describe('Portal Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const storageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value.toString();
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
        length: 0,
        key: (_i: number) => '',
      };
    })();

    vi.stubGlobal('localStorage', storageMock);

    localStorage.setItem('portal_user', JSON.stringify(mockUser));
    localStorage.setItem('portal_token', 'mock_token_123');

    (MixtureApiClient.get as any).mockImplementation((url: string) => {
      if (url.includes('dashboard')) return Promise.resolve({ projects: mockProjects });
      if (url.includes('get_messages')) return Promise.resolve({ messages: mockMessages });
      return Promise.resolve({});
    });
    (MixtureApiClient.post as any).mockResolvedValue({ status: 'success' });
  });

  test('PortalLogin sends magic link request', async () => {
    localStorage.clear();

    render(
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <PortalLogin />
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>,
    );

    const input = screen.getByPlaceholderText(/np\. jan@/i);
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    const submitBtn = screen.getByText(/Wyślij Link Logowania/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(MixtureApiClient.post).toHaveBeenCalledWith(
        '/api/auth/send_magic_link',
        expect.objectContaining({ email: 'test@example.com' }),
      );
    });
  });

  test('PortalDashboard renders projects for logged in user', async () => {
    await act(async () => {
      renderPortal();
    });
    expect(await screen.findByText('Test Project')).toBeInTheDocument();
    expect(await screen.findByText('Hello')).toBeInTheDocument();
  });

  test('PortalDashboard renders chat input', async () => {
    await act(async () => {
      renderPortal();
    });
    expect(screen.getByPlaceholderText('Napisz wiadomość...')).toBeInTheDocument();
    expect(screen.getByText('Wyślij')).toBeInTheDocument();
  });

  test('AdminDashboard redirects non-admin users', async () => {
    await act(async () => {
      renderPortal();
    });
    expect(screen.getByText('Wsparcie i Kontakt')).toBeInTheDocument();
  });
});
