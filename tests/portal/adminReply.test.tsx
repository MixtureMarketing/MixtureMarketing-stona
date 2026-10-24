import React from 'react';
import { render, screen, renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';
import { useAdminActions } from '../../components/portal/admin/useAdminActions';
import { ReplyModal } from '../../components/portal/admin/AdminModals';
import type { Lead } from '../../components/portal/types';

const lead: Lead = {
  id: 'L1',
  email: 'jan@sklep.pl',
  name: 'Jan',
  service_type: 'web',
  status: 'new',
  created_at: '2026-10-20 10:00:00',
  message: 'Chcę sklep',
  current_step: 3,
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NotificationProvider>
    <AuthProvider>{children}</AuthProvider>
  </NotificationProvider>
);

describe('Odpowiedź leadowi: jedna wysyłka mimo podwójnego kliknięcia', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('portal_token', 'tok');
  });

  it('handleReply w locie ignoruje drugie wywołanie → 1× reply_lead (1 mail)', async () => {
    let release: () => void = () => {};
    global.fetch = vi.fn(
      () =>
        new Promise((resolve) => {
          release = () =>
            resolve({
              ok: true,
              status: 200,
              headers: new Headers({ 'content-type': 'application/json' }),
              json: async () => ({ status: 'success' }),
              text: async () => '{"status":"success"}',
            });
        }),
    ) as unknown as typeof fetch;

    const { result } = renderHook(
      () =>
        useAdminActions({
          sessionToken: 'tok',
          refreshData: vi.fn(),
          refreshLeads: vi.fn(),
          refreshChat: vi.fn(),
        }),
      { wrapper },
    );

    let first: Promise<boolean> = Promise.resolve(false);
    let second: Promise<boolean> = Promise.resolve(false);
    act(() => {
      first = result.current.handleReply(lead, 'Dzień dobry');
      second = result.current.handleReply(lead, 'Dzień dobry');
    });
    expect(await second).toBe(false);
    expect(result.current.isReplying).toBe(true);

    await act(async () => {
      release();
      expect(await first).toBe(true);
    });
    expect((global.fetch as Mock).mock.calls).toHaveLength(1);
    expect(result.current.isReplying).toBe(false);
  });

  it('ReplyModal w trakcie wysyłki: „Wyślij Odpowiedź” zablokowany, Anuluj nie wysyła formularza', () => {
    const onReply = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <ReplyModal
        lead={lead}
        onClose={vi.fn()}
        replyMessage="Treść"
        setReplyMessage={vi.fn()}
        onReply={onReply}
        isSending
      />,
    );
    expect(screen.getByRole('button', { name: /Wysyłanie/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Anuluj' })).toHaveAttribute('type', 'button');
    expect(screen.getByPlaceholderText(/Wpisz treść/)).toHaveAttribute('readonly');
  });
});
