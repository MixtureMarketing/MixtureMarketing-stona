import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { ModalProvider, useModal } from '@/context/ModalContext';
import { leadService } from '@/services/leadService';
import { installContactLinkTracking } from '@/utils/analytics';

/**
 * MIX-1253 K1: mapa „zdarzenie kluczowe GA4 -> sciezka kodu, ktora je naprawde wysyla”.
 * Kazdy test sprawdza, jakie wywolanie aplikacji konczy sie `zaraz.track(<zdarzenie>)`,
 * wiec dokumentuje tez, ktorych zdarzen NIE da sie dzis wywolac z UI.
 */
let track: Mock<(event: string, data?: Record<string, unknown>) => void>;
const names = () => track.mock.calls.map((c) => c[0] as string);

beforeEach(() => {
  track = vi.fn<(event: string, data?: Record<string, unknown>) => void>();
  window.zaraz = { track, consent: { set: vi.fn() } };
});
afterEach(() => {
  delete window.zaraz;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ModalProvider>{children}</ModalProvider>
);

describe('ModalContext.openModal', () => {
  it('consultation_click: kazde otwarcie modala (typ general)', () => {
    const { result } = renderHook(() => useModal(), { wrapper });
    act(() => result.current.openModal('general'));
    expect(names()).toEqual(['consultation_click']);
  });

  it('audit_request: tylko typ "audit" (dzis zaden komponent go nie wywoluje)', () => {
    const { result } = renderHook(() => useModal(), { wrapper });
    act(() => result.current.openModal('audit'));
    expect(names()).toEqual(['consultation_click', 'audit_request']);
  });

  it('calculator_submit: tylko gdy dane maja calculator_result / estimatedPrice / projectType', () => {
    const { result } = renderHook(() => useModal(), { wrapper });
    act(() => result.current.openModal('web', { projectType: 'landing' }));
    expect(names()).toEqual(['consultation_click', 'calculator_submit']);
  });

  it('negatyw: zwykle dane (specificType) nie wysylaja ani audit_request, ani calculator_submit', () => {
    const { result } = renderHook(() => useModal(), { wrapper });
    act(() => result.current.openModal('design', { specificType: 'visual_audit' }));
    expect(names()).toEqual(['consultation_click']);
  });
});

describe('leadService', () => {
  const okJson = (body: unknown) =>
    Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));

  it('lead_start: po udanym create (odpowiedz z id i tokenem)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => okJson({ id: 'L1', edit_token: 't' })),
    );
    await leadService.createLead({ name: 'A B', email: 'a@b.pl', service_interest: 'web' });
    expect(names()).toEqual(['lead_start']);
    vi.unstubAllGlobals();
  });

  it('negatyw: brak lead_start, gdy serwer nie zwroci id/tokenu', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => okJson({})),
    );
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(leadService.createLead({ name: 'A B', email: 'a@b.pl' })).rejects.toBeDefined();
    expect(names()).toEqual([]);
    vi.unstubAllGlobals();
  });

  it('contact_form_success: tylko sendNotification(type=success) z odpowiedzia ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => okJson({ ok: true })),
    );
    await leadService.sendNotification('L1', 'abandoned_step_1');
    expect(names()).toEqual([]);
    await leadService.sendNotification('L1', 'success');
    expect(names()).toEqual(['contact_form_success']);
    vi.unstubAllGlobals();
  });
});

describe('installContactLinkTracking', () => {
  it('phone_click i email_click na kliknieciu linkow tel: i mailto:', () => {
    document.body.innerHTML =
      '<a id="t" href="tel:+48123456789">t</a><a id="m" href="mailto:a@b.pl?subject=x">m</a><a id="o" href="/x">o</a>';
    // Bez nawigacji (jsdom nie ma handlera tel:), listener w fazie capture i tak biegnie pierwszy.
    document.addEventListener('click', (e) => e.preventDefault());
    const off = installContactLinkTracking();
    (document.getElementById('t') as HTMLElement).click();
    (document.getElementById('m') as HTMLElement).click();
    (document.getElementById('o') as HTMLElement).click();
    off();
    expect(names()).toEqual(['phone_click', 'email_click']);
    expect(track.mock.calls[1][1]).toMatchObject({ email: 'a@b.pl' });
  });
});
