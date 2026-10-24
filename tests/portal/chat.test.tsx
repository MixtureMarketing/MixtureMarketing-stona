import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';
import PortalChat from '../../components/portal/client/PortalChat';
import AdminChat from '../../components/portal/admin/AdminChat';
import PortalDashboard from '../../components/portal/PortalDashboard';
import type { Message } from '../../components/portal/types';

// jsdom nie liczy layoutu — wysokości kontenera czatu podajemy ręcznie.
let scrollHeight = 2000;
const CLIENT_HEIGHT = 400;
const origSH = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight');
const origCH = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
beforeEach(() => {
  scrollHeight = 2000;
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => scrollHeight,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => CLIENT_HEIGHT,
  });
});
afterEach(() => {
  if (origSH) Object.defineProperty(HTMLElement.prototype, 'scrollHeight', origSH);
  if (origCH) Object.defineProperty(HTMLElement.prototype, 'clientHeight', origCH);
});

const msg = (id: number, sender_type: Message['sender_type'], content = `Wiadomość ${id}`) =>
  ({
    id: String(id),
    content,
    sender_type,
    created_at: '2026-10-24 10:00:00',
    is_read: 1,
  }) as Message;
const history = Array.from({ length: 30 }, (_, i) => msg(i + 1, i % 2 ? 'admin' : 'client'));

const chatProps = {
  newMessage: '',
  setNewMessage: vi.fn(),
  onSendMessage: vi.fn(),
  onKeyDown: vi.fn(),
};
const scroller = (container: HTMLElement) =>
  container.querySelector('.overflow-y-auto') as HTMLDivElement;

describe('PortalChat: przewijanie do najnowszej wiadomości', () => {
  it('po załadowaniu historii pokazuje najnowszą (scrollTop = scrollHeight)', () => {
    const { container } = render(<PortalChat {...chatProps} messages={history} />);
    expect(scroller(container).scrollTop).toBe(2000);
  });

  it('nowa wiadomość przewija, gdy użytkownik był przy dole', () => {
    const { container, rerender } = render(<PortalChat {...chatProps} messages={history} />);
    scrollHeight = 2100;
    rerender(<PortalChat {...chatProps} messages={[...history, msg(31, 'admin')]} />);
    expect(scroller(container).scrollTop).toBe(2100);
  });

  it('nie wyrywa z czytania starszych; własna wiadomość przewija zawsze', () => {
    const { container, rerender } = render(<PortalChat {...chatProps} messages={history} />);
    const el = scroller(container);
    el.scrollTop = 0;
    fireEvent.scroll(el);

    scrollHeight = 2100;
    const withIncoming = [...history, msg(31, 'admin')];
    rerender(<PortalChat {...chatProps} messages={withIncoming} />);
    expect(el.scrollTop).toBe(0);

    scrollHeight = 2200;
    rerender(<PortalChat {...chatProps} messages={[...withIncoming, msg(32, 'client')]} />);
    expect(el.scrollTop).toBe(2200);
  });

  it('długi URL łamie się w dymku (overflow-wrap:anywhere)', () => {
    const url = 'https://drive.google.com/drive/folders/' + 'A1b2C3'.repeat(30);
    render(<PortalChat {...chatProps} messages={[msg(1, 'admin', url)]} />);
    const bubble = screen.getByText(url);
    expect(bubble.className).toContain('[overflow-wrap:anywhere]');
    expect(bubble).toHaveClass('min-w-0');
  });

  it('w trakcie wysyłki przycisk jest zablokowany, a pole tylko do odczytu', () => {
    render(<PortalChat {...chatProps} newMessage="Treść" messages={[]} isSending />);
    expect(screen.getByRole('button', { name: /Wysyłanie/ })).toBeDisabled();
    expect(screen.getByPlaceholderText('Napisz wiadomość...')).toHaveAttribute('readonly');
  });
});

describe('AdminChat: przewijanie i blokada wysyłki', () => {
  const adminProps = {
    conversations: [
      { id: '7', name: 'Anna', email: 'a@b.pl', company_name: 'Firma', unread_count: 0 },
    ],
    setActiveChatId: vi.fn(),
    adminMessage: 'Odpowiedź',
    setAdminMessage: vi.fn(),
    searchTerm: '',
    setSearchTerm: vi.fn(),
    sendAdminMessage: vi.fn(),
    handleKeyDown: vi.fn(),
  };

  it('otwarta rozmowa startuje od najnowszej; zmiana rozmowy znów przewija na dół', () => {
    const { container, rerender } = render(
      <AdminChat {...adminProps} activeChatId="7" chatMessages={history} />,
    );
    const el = scroller(container.querySelector('[class*="md:col-span-8"]') as HTMLElement);
    expect(el.scrollTop).toBe(2000);
    el.scrollTop = 0;
    fireEvent.scroll(el);
    scrollHeight = 1500;
    rerender(<AdminChat {...adminProps} activeChatId="8" chatMessages={history.slice(0, 20)} />);
    expect(el.scrollTop).toBe(1500);
  });

  it('isSending blokuje przycisk', () => {
    render(<AdminChat {...adminProps} activeChatId="7" chatMessages={[]} isSending />);
    expect(screen.getByRole('button', { name: /Wysyłanie/ })).toBeDisabled();
  });
});

describe('PortalDashboard: brak dubli przy wolnej sieci', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    localStorage.clear();
    localStorage.setItem(
      'portal_user',
      JSON.stringify({ id: '1', name: 'Jan Test', email: 'jan@test.pl', role: 'client' }),
    );
    localStorage.setItem('portal_token', 'tok');
  });

  it('2 kliknięcia + Enter w trakcie wysyłki → jedno send_message', async () => {
    let release: (v: unknown) => void = () => {};
    (global.fetch as Mock).mockImplementation((url: string) => {
      if (url.includes('send_message')) {
        return new Promise((resolve) => {
          release = () => resolve({ ok: true, json: async () => ({ status: 'success' }) });
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({ projects: [], messages: [] }) });
    });

    render(
      <MemoryRouter>
        <NotificationProvider>
          <AuthProvider>
            <PortalDashboard />
          </AuthProvider>
        </NotificationProvider>
      </MemoryRouter>,
    );
    const input = await screen.findByPlaceholderText('Napisz wiadomość...');
    fireEvent.change(input, { target: { value: 'Test dubla' } });
    const button = screen.getByRole('button', { name: /Wyślij/ });
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.keyDown(input, { key: 'Enter' });

    const sendCalls = () =>
      (global.fetch as Mock).mock.calls.filter(([u]) => String(u).includes('send_message'));
    expect(sendCalls()).toHaveLength(1);
    await waitFor(() => expect(screen.getByRole('button', { name: /Wysyłanie/ })).toBeDisabled());

    await act(async () => release(undefined));
    await waitFor(() => expect(input).toHaveValue(''));
    expect(sendCalls()).toHaveLength(1);
  });
});
