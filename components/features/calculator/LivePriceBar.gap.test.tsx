// MIX-1495: odstęp 1 s między zapytaniami paska widełek i ponowienie po 503 (część testów paska).
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

describe('pasek widełek na żywo — przełącznik włączony', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_MM_LIVE_PRICE_BAR', '1');
    requestPricePreview.mockReset();
    getToken.mockReset();
    getToken.mockResolvedValue('captcha-1');
    requestPricePreview.mockImplementation(async (p: { answers: Record<string, string> }) =>
      ok(p.answers),
    );
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('MIX-1495: click during the gap wait: one trailing request with the newest answers, no stale send', async () => {
    await mount();
    pick('Sklep');
    await wait(400);
    expect(requestPricePreview).toHaveBeenCalledTimes(1);
    pick('Portal');
    await wait(500);
    expect(requestPricePreview).toHaveBeenCalledTimes(1);
    pick('Wizytówka');
    await wait(499);
    expect(requestPricePreview).toHaveBeenCalledTimes(1);
    await wait(1);
    expect(requestPricePreview).toHaveBeenCalledTimes(2);
    expect(requestPricePreview.mock.calls[1][0].answers).toEqual({ project_goal: 'wizytowka' });
    await wait(5000);
    expect(requestPricePreview).toHaveBeenCalledTimes(2);
    const bar = screen.getByTestId('live-price-bar');
    expect(bar).toHaveTextContent(/8\s?000/);
    expect(bar).not.toHaveTextContent('Nie udało się');
  });

  it('MIX-1495: 503 on the preview-token path: retry carries the preview token, Turnstile asked once', async () => {
    await mount();
    requestPricePreview.mockImplementationOnce(async (p: { answers: Record<string, string> }) =>
      ok(p.answers, { previewToken: 'pt-1' }),
    );
    pick('Sklep');
    await wait(400);
    requestPricePreview.mockResolvedValueOnce({ ok: false, status: 503 });
    pick('Portal');
    await wait(1000);
    expect(requestPricePreview).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('live-price-bar')).not.toHaveTextContent('Nie udało się');
    await wait(1000);
    expect(requestPricePreview).toHaveBeenCalledTimes(3);
    expect(getToken).toHaveBeenCalledTimes(1);
    expect(requestPricePreview.mock.calls[2][0]).toEqual({
      answers: { project_goal: 'portal' },
      preview_token: 'pt-1',
    });
    expect(screen.getByTestId('live-price-bar')).toHaveTextContent(/40\s?000/);
  });

  it('MIX-1495: 503 twice: error, but the next answer still asks the server', async () => {
    await mount();
    requestPricePreview
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: false, status: 503 });
    pick('Sklep');
    await wait(1400);
    expect(requestPricePreview).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('live-price-bar')).toHaveTextContent('Nie udało się');
    pick('Wizytówka');
    await wait(1000);
    expect(requestPricePreview).toHaveBeenCalledTimes(3);
    expect(screen.getByTestId('live-price-bar')).toHaveTextContent(/8\s?000/);
  });
});
