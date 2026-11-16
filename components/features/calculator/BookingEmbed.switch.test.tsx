// MIX-1814 (Z9, wariant A): harmonogram rozmów z I14 pod wynikiem /wycena/, ładowany dopiero po
// kliknięciu „Wyślij i umów rozmowę” i zapisie leada. Przełącznik VITE_MM_BOOKING_EMBED (tylko `1`)
// razem z VITE_MM_LEAD_CONFIG. Kryteria: przed kliknięciem 0 odwołań do calendar.google.com w DOM;
// po kliknięciu ramka z CALENDAR_IFRAME_SRC; calculator_booking_open = 1 na kliknięcie, bez e-maila.
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PublicQuestion } from '../../../services/calculatorService';

const QUESTIONS: PublicQuestion[] = [
  {
    code: 'project_goal',
    text: 'Jaki jest cel projektu?',
    help_text: null,
    answer_type: 'select',
    options: [
      { value: 'sklep', label: 'Sklep' },
      { value: 'portal', label: 'Portal' },
    ],
    visible_if: null,
    group: 'projekt',
    sort_order: 0,
  },
];

const submitPublicQuote = vi.fn();
vi.mock('../../../services/calculatorService', () => ({
  fetchPublicQuestions: () => Promise.resolve(QUESTIONS),
  submitPublicQuote: (...a: unknown[]) => submitPublicQuote(...a),
}));
const trackEvent = vi.fn();
vi.mock('../../../utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../utils/analytics')>()),
  trackEvent: (...a: unknown[]) => trackEvent(...a),
}));
vi.mock('../contact/TurnstileWidget', async () => {
  const R = await import('react');
  return {
    default: R.forwardRef((_p: unknown, ref: React.Ref<unknown>) => {
      R.useImperativeHandle(ref, () => ({
        getToken: () => Promise.resolve('captcha-1'),
        reset: () => {},
        prepare: () => {},
      }));
      return null;
    }),
  };
});

import PublicCalculator from './PublicCalculator';
import { isBookingEmbedEnabled } from './livePrice';
import { CALENDAR_IFRAME_SRC } from '../contact/contactConfig';

const OK = {
  ok: true,
  result: { priceRange: { min: 1000, max: 2000 }, currency: 'PLN', status: 'ok' },
};
const BTN = 'Wyślij i umów rozmowę';
const bookingOpens = () => trackEvent.mock.calls.filter((c) => c[0] === 'calculator_booking_open');
const calendarRefs = (root: HTMLElement) =>
  (root.innerHTML.match(/calendar\.google\.com/g) ?? []).length;

const toContact = async () => {
  const view = render(
    <MemoryRouter>
      <PublicCalculator />
    </MemoryRouter>,
  );
  await screen.findByText('Jaki jest cel projektu?');
  fireEvent.click(screen.getByRole('radio', { name: 'Portal' }));
  fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
  await screen.findByLabelText('Twój e-mail');
  fireEvent.change(screen.getByLabelText('Twój e-mail'), { target: { value: 'jan@firma.pl' } });
  return view;
};
const flags = (booking: string | undefined, lead: string | undefined) => {
  if (booking !== undefined) vi.stubEnv('VITE_MM_BOOKING_EMBED', booking);
  if (lead !== undefined) vi.stubEnv('VITE_MM_LEAD_CONFIG', lead);
};

beforeEach(() => {
  for (const f of [
    'VITE_MM_CONFIG_LINK',
    'VITE_MM_CONFIG_PREVIEW',
    'VITE_MM_LIVE_PRICE_BAR',
    'VITE_MM_BOOKING_EMBED',
    'VITE_MM_LEAD_CONFIG',
  ])
    vi.stubEnv(f, '');
  submitPublicQuote.mockReset();
  submitPublicQuote.mockResolvedValue(OK);
  trackEvent.mockReset();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('isBookingEmbedEnabled', () => {
  it('włącza tylko `1` razem z włączonym VITE_MM_LEAD_CONFIG', () => {
    expect(isBookingEmbedEnabled('1', '1')).toBe(true);
    expect(isBookingEmbedEnabled('1', 'true')).toBe(true);
    for (const raw of [undefined, '', '0', 'true', 'TRUE', ' 1', 'yes', 1])
      expect(isBookingEmbedEnabled(raw, '1')).toBe(false);
    for (const lead of [undefined, '', '0', 'yes', 1])
      expect(isBookingEmbedEnabled('1', lead)).toBe(false);
  });
  it('domyślnie czyta obie zmienne budowy', () => {
    flags('1', '1');
    expect(isBookingEmbedEnabled()).toBe(true);
    flags('1', '');
    expect(isBookingEmbedEnabled()).toBe(false);
    flags('', '1');
    expect(isBookingEmbedEnabled()).toBe(false);
  });
});

describe('K1/K2 włączony: harmonogram dopiero po kliknięciu i zapisie leada', () => {
  it('przed kliknięciem 0 odwołań do calendar.google.com; po kliknięciu ramka I14 i 1 zdarzenie', async () => {
    flags('1', '1');
    const { container } = await toContact();
    expect(container.querySelector('iframe')).toBeNull();
    expect(calendarRefs(document.body)).toBe(0);
    expect(bookingOpens()).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: BTN }));
    const frame = await screen.findByTitle('Wolne terminy rozmowy (Kalendarz Google)');
    expect(frame.tagName).toBe('IFRAME');
    expect(frame.getAttribute('src')).toBe(CALENDAR_IFRAME_SRC);
    expect(new URL(frame.getAttribute('src') ?? '').host).toBe('calendar.google.com');
    expect(screen.getByRole('heading', { name: 'Wybierz termin rozmowy' })).toBeInTheDocument();
    // pod wynikiem: widełki są nad ramką
    const price = screen.getByText('Orientacyjne widełki');
    expect(price.compareDocumentPosition(frame) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(submitPublicQuote).toHaveBeenCalledTimes(1);
    expect(bookingOpens()).toEqual([['calculator_booking_open', { source: '/' }]]);
    // lead (POST) zapisany przed zdarzeniem i ramką
    const postOrder = submitPublicQuote.mock.invocationCallOrder[0];
    const evIdx = trackEvent.mock.calls.findIndex((c) => c[0] === 'calculator_booking_open');
    expect(trackEvent.mock.invocationCallOrder[evIdx]).toBeGreaterThan(postOrder);
    expect(JSON.stringify(trackEvent.mock.calls)).not.toMatch(/jan@firma/);
    expect(document.querySelectorAll('iframe')).toHaveLength(1);
  });

  it('ramka nie montuje się, zanim serwer odpowie (lead jeszcze nie zapisany)', async () => {
    flags('1', '1');
    let resolve: (v: unknown) => void = () => {};
    submitPublicQuote.mockReturnValue(new Promise((r) => (resolve = r)));
    await toContact();
    fireEvent.click(screen.getByRole('button', { name: BTN }));
    await waitFor(() => expect(submitPublicQuote).toHaveBeenCalledTimes(1));
    expect(document.querySelector('iframe')).toBeNull();
    expect(calendarRefs(document.body)).toBe(0);
    expect(bookingOpens()).toHaveLength(0);
    await act(async () => resolve(OK));
    await screen.findByTitle('Wolne terminy rozmowy (Kalendarz Google)');
    expect(bookingOpens()).toHaveLength(1);
  });

  it('podwójne kliknięcie: jeden POST, jedno zdarzenie, jedna ramka', async () => {
    flags('1', '1');
    await toContact();
    const btn = screen.getByRole('button', { name: BTN });
    await act(async () => {
      fireEvent.click(btn);
      fireEvent.click(btn);
    });
    await screen.findByTitle('Wolne terminy rozmowy (Kalendarz Google)');
    expect(submitPublicQuote).toHaveBeenCalledTimes(1);
    expect(bookingOpens()).toHaveLength(1);
    expect(document.querySelectorAll('iframe')).toHaveLength(1);
  });

  it('„Policz jeszcze raz” zamyka ramkę; kolejne wysłanie = kolejne 1 zdarzenie', async () => {
    flags('1', '1');
    await toContact();
    fireEvent.click(screen.getByRole('button', { name: BTN }));
    await screen.findByTitle('Wolne terminy rozmowy (Kalendarz Google)');
    fireEvent.click(screen.getByRole('button', { name: 'Policz jeszcze raz' }));
    await waitFor(() => expect(document.querySelector('iframe')).toBeNull());
    expect(bookingOpens()).toHaveLength(1);
    // formularz wraca do pierwszego kroku (odpowiedzi i e-mail zostają)
    fireEvent.click(await screen.findByRole('button', { name: 'Dalej' }));
    fireEvent.click(await screen.findByRole('button', { name: BTN }));
    await screen.findByTitle('Wolne terminy rozmowy (Kalendarz Google)');
    expect(submitPublicQuote).toHaveBeenCalledTimes(2);
    expect(bookingOpens()).toHaveLength(2);
  });

  it('negatyw: zapis leada odrzucony → brak ramki i brak zdarzenia', async () => {
    flags('1', '1');
    for (const status of [400, 403, 429, 500]) {
      submitPublicQuote.mockResolvedValueOnce({ ok: false, status });
      const { unmount } = await toContact();
      fireEvent.click(screen.getByRole('button', { name: BTN }));
      await waitFor(() => expect(submitPublicQuote).toHaveBeenCalled());
      await screen.findByRole('button', { name: BTN });
      expect(document.querySelector('iframe')).toBeNull();
      expect(calendarRefs(document.body)).toBe(0);
      expect(bookingOpens()).toHaveLength(0);
      submitPublicQuote.mockClear();
      unmount();
    }
  });
});

describe('K3 wyłączony: ekran wyniku jak dotąd, 0 ramek i 0 zdarzeń', () => {
  it.each([
    ['brak obu', '', ''],
    ['tylko BOOKING_EMBED (bez przycisku „Wyślij i umów rozmowę”)', '1', ''],
    ['tylko LEAD_CONFIG', '', '1'],
    ['BOOKING_EMBED=true', 'true', '1'],
    ['BOOKING_EMBED=0', '0', '1'],
  ])('%s', async (_n, booking, lead) => {
    flags(booking, lead);
    await toContact();
    const name = lead === '1' ? BTN : 'Poznaj widełki';
    fireEvent.click(screen.getByRole('button', { name }));
    await screen.findByText('Orientacyjne widełki');
    expect(submitPublicQuote).toHaveBeenCalledTimes(1);
    expect(document.querySelector('iframe')).toBeNull();
    expect(screen.queryByTestId('booking-embed')).toBeNull();
    expect(calendarRefs(document.body)).toBe(0);
    expect(bookingOpens()).toHaveLength(0);
    // wynik jak dotąd: link „Umów rozmowę” do /contact/
    expect(screen.getByRole('link', { name: 'Umów rozmowę' })).toHaveAttribute('href', '/contact/');
  });
});
