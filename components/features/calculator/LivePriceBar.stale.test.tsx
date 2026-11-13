// MIX-1495 (N1): spóźniona odpowiedź na stare odpowiedzi nie nadpisuje nowej ceny paska.
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PublicQuestion } from '../../../services/calculatorService';

const Q = (over: Partial<PublicQuestion>): PublicQuestion => ({
  code: 'x',
  text: '?',
  help_text: null,
  answer_type: 'select',
  options: null,
  visible_if: null,
  group: null,
  sort_order: 0,
  ...over,
});

const QUESTIONS: PublicQuestion[] = [
  Q({
    code: 'project_goal',
    text: 'Jaki jest cel projektu?',
    group: 'projekt',
    options: [
      { value: 'sklep', label: 'Sklep' },
      { value: 'wizytowka', label: 'Wizytówka' },
      { value: 'portal', label: 'Portal' },
    ],
  }),
];

const requestPricePreview = vi.fn();
// MIX-1466: prawdziwe isPreviewUnavailable (rozpoznanie braku endpointu), atrapa tylko zapytania.
vi.mock('../../../services/pricePreviewService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../services/pricePreviewService')>()),
  requestPricePreview: (...a: unknown[]) => requestPricePreview(...a),
}));
vi.mock('../../../services/calculatorService', () => ({
  fetchPublicQuestions: () => Promise.resolve(QUESTIONS),
  submitPublicQuote: vi.fn(),
}));

const getToken = vi.fn();
vi.mock('../contact/TurnstileWidget', async () => {
  const R = await import('react');
  return {
    default: R.forwardRef((_p: unknown, ref: React.Ref<unknown>) => {
      R.useImperativeHandle(ref, () => ({
        getToken: () => getToken(),
        reset: () => {},
        prepare: () => {},
      }));
      return null;
    }),
  };
});

import PublicCalculator from './PublicCalculator';

const PRICES: Record<string, { min: number; max: number }> = {
  sklep: { min: 27500, max: 53000 },
  wizytowka: { min: 8000, max: 15000 },
  portal: { min: 40000, max: 90000 },
};
const ok = (answers: Record<string, string>, extra: object = {}) => ({
  ok: true,
  priceRange: PRICES[answers.project_goal],
  ...extra,
});

const pick = (name: string) => fireEvent.click(screen.getByRole('radio', { name }));
const wait = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

const mount = async () => {
  render(
    <MemoryRouter>
      <PublicCalculator />
    </MemoryRouter>,
  );
  // Pytania ładują się z obietnicy atrapy; po załadowaniu przechodzimy na sztuczne liczniki.
  await screen.findByText('Jaki jest cel projektu?');
  vi.useFakeTimers();
};

describe('pasek widełek na żywo — spóźniona odpowiedź', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_MM_LIVE_PRICE_BAR', '1');
    requestPricePreview.mockReset();
    getToken.mockReset();
    getToken.mockResolvedValue('captcha-1');
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('MIX-1495 N1: first response deferred, click, second settles first, first settles late: bar keeps the new price', async () => {
    await mount();
    const late: Array<() => void> = [];
    // 1. zapytanie (Sklep) wisi do ręcznego rozstrzygnięcia, mimo przerwania sygnału.
    requestPricePreview.mockImplementationOnce(
      (p: { answers: Record<string, string> }) =>
        new Promise((resolve) => late.push(() => resolve(ok(p.answers)))),
    );
    requestPricePreview.mockImplementationOnce(async (p: { answers: Record<string, string> }) =>
      ok(p.answers),
    );
    pick('Sklep');
    await wait(400);
    expect(requestPricePreview).toHaveBeenCalledTimes(1);
    expect(requestPricePreview.mock.calls[0][0].answers).toEqual({ project_goal: 'sklep' });
    pick('Portal');
    await wait(1000);
    expect(requestPricePreview).toHaveBeenCalledTimes(2);
    expect(requestPricePreview.mock.calls[1][0].answers).toEqual({ project_goal: 'portal' });
    const bar = screen.getByTestId('live-price-bar');
    expect(bar).toHaveTextContent(/40\s?000/);
    const signals = requestPricePreview.mock.calls.map((c) => c[1] as AbortSignal);
    expect(signals.map((s) => s.aborted)).toEqual([true, false]);
    // Teraz spóźnia się odpowiedź na Sklep.
    expect(late).toHaveLength(1);
    await act(async () => {
      late[0]();
      await vi.advanceTimersByTimeAsync(0);
    });
    await wait(5000);
    expect(requestPricePreview).toHaveBeenCalledTimes(2);
    expect(bar).toHaveTextContent(/40\s?000/);
    expect(bar).not.toHaveTextContent(/27\s?500/);
    expect(bar).not.toHaveTextContent(/53\s?000/);
  });

  it('MIX-1495 N1: late rejection of the stale request does not turn the new price into an error', async () => {
    await mount();
    const fail: Array<() => void> = [];
    requestPricePreview.mockImplementationOnce(
      () => new Promise((_r, reject) => fail.push(() => reject(new Error('aborted')))),
    );
    requestPricePreview.mockImplementationOnce(async (p: { answers: Record<string, string> }) =>
      ok(p.answers),
    );
    pick('Sklep');
    await wait(400);
    pick('Portal');
    await wait(1000);
    const bar = screen.getByTestId('live-price-bar');
    expect(bar).toHaveTextContent(/40\s?000/);
    await act(async () => {
      fail[0]();
      await vi.advanceTimersByTimeAsync(0);
    });
    await wait(5000);
    expect(bar).toHaveTextContent(/40\s?000/);
    expect(bar).not.toHaveTextContent('Nie udało się');
  });
});
