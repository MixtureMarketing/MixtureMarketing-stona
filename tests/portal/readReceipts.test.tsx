import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { AuthProvider } from '../../context/AuthContext';
import { usePortalData } from '../../components/portal/client/usePortalData';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const mk = (is_read: number) => [
  { id: '1', content: 'Pytanie', sender_type: 'client', created_at: '2026-10-24 10:00', is_read },
  { id: '2', content: 'Odpowiedź', sender_type: 'admin', created_at: '2026-10-24 10:01', is_read },
];

describe('usePortalData: zmiana samego is_read trafia do stanu', () => {
  let serverMessages = mk(0);

  beforeEach(() => {
    serverMessages = mk(0);
    localStorage.clear();
    localStorage.setItem(
      'portal_user',
      JSON.stringify({ id: '7', name: 'Anna', email: 'a@b.pl', role: 'client' }),
    );
    localStorage.setItem('portal_token', 'tok');
    global.fetch = vi.fn((url: string) =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: async () =>
          String(url).includes('get_messages') ? { messages: serverMessages } : { projects: [] },
      }),
    ) as unknown as typeof fetch;
  });

  it('ta sama lista z innym is_read → nowe wiadomości (tytuł i podwójny ptaszek się aktualizują)', async () => {
    const { result } = renderHook(() => usePortalData(), { wrapper });
    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    expect(result.current.messages.map((m) => Number(m.is_read))).toEqual([0, 0]);

    serverMessages = mk(1); // ta sama długość, to samo id ostatniej — zmienił się tylko is_read
    await act(async () => {
      await result.current.refreshMessages();
    });
    expect(result.current.messages.map((m) => Number(m.is_read))).toEqual([1, 1]);
  });

  it('identyczna odpowiedź z pollingu zostawia tę samą referencję (bez zbędnego re-renderu)', async () => {
    const { result } = renderHook(() => usePortalData(), { wrapper });
    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    const before = result.current.messages;
    await act(async () => {
      await result.current.refreshMessages();
    });
    expect(result.current.messages).toBe(before);
    expect((global.fetch as Mock).mock.calls.length).toBeGreaterThan(1);
  });
});
