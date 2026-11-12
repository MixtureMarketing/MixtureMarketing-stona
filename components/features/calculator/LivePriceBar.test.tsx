// MIX-1385 (Z5 z MIX-1377): pasek widełek na żywo — zwłoka 400 ms, pamięć wyników, komunikaty
// o błędach, przełącznik. Klient podglądu (Z4) jest atrapą; liczniki czasu są sztuczne.
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
vi.mock('../../../services/pricePreviewService', () => ({
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

  it('bez odpowiedzi nie ma paska ani zapytań', async () => {
    await mount();
    await wait(2000);
    expect(screen.queryByTestId('live-price-bar')).not.toBeInTheDocument();
    expect(requestPricePreview).not.toHaveBeenCalled();
  });

  it('zapytanie dopiero po 400 ms ciszy; cena pojawia się w pasku', async () => {
    await mount();
    pick('Sklep');
    await wait(399);
    expect(requestPricePreview).not.toHaveBeenCalled();
    await wait(1);
    expect(requestPricePreview).toHaveBeenCalledTimes(1);
    expect(requestPricePreview.mock.calls[0][0]).toEqual({
      answers: { project_goal: 'sklep' },
      captcha_token: 'captcha-1',
    });
    expect(screen.getByTestId('live-price-bar')).toHaveTextContent(/27\s?500\s–\s53\s?000\szł/);
  });

  it('kolejna zmiana przed upływem 400 ms przesuwa zapytanie (jedno zapytanie z ostatnim stanem)', async () => {
    await mount();
    pick('Sklep');
    await wait(300);
    pick('Wizytówka');
    await wait(300);
    expect(requestPricePreview).not.toHaveBeenCalled();
    await wait(100);
    expect(requestPricePreview).toHaveBeenCalledTimes(1);
    expect(requestPricePreview.mock.calls[0][0].answers).toEqual({ project_goal: 'wizytowka' });
  });

  it('te same odpowiedzi drugi raz: 0 nowych zapytań, a cena wraca z pamięci', async () => {
    await mount();
    pick('Sklep');
    await wait(400);
    pick('Wizytówka');
    await wait(400);
    expect(requestPricePreview).toHaveBeenCalledTimes(2);
    pick('Sklep');
    await wait(2000);
    expect(requestPricePreview).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('live-price-bar')).toHaveTextContent(/27\s?500/);
  });

  it('po pierwszym zapytaniu idzie token podglądu, nie Turnstile', async () => {
    requestPricePreview.mockImplementation(async (p: { answers: Record<string, string> }) =>
      ok(p.answers, { previewToken: 'prev-1' }),
    );
    await mount();
    pick('Sklep');
    await wait(400);
    pick('Portal');
    await wait(400);
    expect(getToken).toHaveBeenCalledTimes(1);
    expect(requestPricePreview.mock.calls[1][0]).toEqual({
      answers: { project_goal: 'portal' },
      preview_token: 'prev-1',
    });
  });

  it('odrzucony token podglądu (403): jeden powrót do Turnstile i cena się pokazuje', async () => {
    let n = 0;
    requestPricePreview.mockImplementation(async (p: { answers: Record<string, string> }) => {
      n += 1;
      if (n === 1) return ok(p.answers, { previewToken: 'prev-1' });
      if (n === 2) return { ok: false, status: 403 };
      return ok(p.answers, { previewToken: 'prev-2' });
    });
    await mount();
    pick('Sklep');
    await wait(400);
    pick('Portal');
    await wait(400);
    expect(requestPricePreview).toHaveBeenCalledTimes(3);
    expect(requestPricePreview.mock.calls[2][0]).toMatchObject({ captcha_token: 'captcha-1' });
    expect(screen.getByTestId('live-price-bar')).toHaveTextContent(/40\s?000/);
  });

  it('429: komunikat po polsku bez słów technicznych, a poprzednia cena zostaje', async () => {
    await mount();
    pick('Sklep');
    await wait(400);
    requestPricePreview.mockResolvedValueOnce({ ok: false, status: 429 });
    pick('Wizytówka');
    await wait(400);
    const bar = screen.getByTestId('live-price-bar');
    expect(bar).toHaveTextContent('Liczymy za często. Odczekaj chwilę');
    expect(bar.textContent).not.toMatch(/429|HTTP|błąd serwera|API|token/i);
    expect(bar).toHaveTextContent(/27\s?500/);
  });

  it('błąd (serwer i sieć): inny komunikat niż przy 429, bez słów technicznych', async () => {
    await mount();
    for (const [status, label] of [
      [500, 'Sklep'],
      [0, 'Wizytówka'],
    ] as const) {
      requestPricePreview.mockResolvedValueOnce({ ok: false, status });
      pick(label);
      await wait(400);
      const bar = screen.getByTestId('live-price-bar');
      expect(bar).toHaveTextContent('Nie udało się teraz policzyć ceny');
      expect(bar).not.toHaveTextContent('Liczymy za często');
      expect(bar.textContent).not.toMatch(/500|HTTP|błąd serwera|API|token|sieci/i);
    }
  });

  it('błędu nie zapamiętujemy: powrót do tych samych odpowiedzi pyta serwer jeszcze raz', async () => {
    await mount();
    requestPricePreview.mockResolvedValueOnce({ ok: false, status: 500 });
    pick('Sklep');
    await wait(400);
    pick('Wizytówka');
    await wait(400);
    pick('Sklep');
    await wait(400);
    expect(requestPricePreview).toHaveBeenCalledTimes(3);
    expect(screen.getByTestId('live-price-bar')).toHaveTextContent(/27\s?500/);
  });

  it('pasek na telefonie podnosi przycisk ciasteczek (znacznik na body)', async () => {
    await mount();
    pick('Sklep');
    await wait(400);
    expect(document.body.dataset.stickyMobileBar).toBe('true');
  });
});

describe('pasek widełek na żywo — przełącznik wyłączony', () => {
  beforeEach(() => {
    requestPricePreview.mockReset();
    getToken.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it.each([undefined, '', '0', 'false', 'yes'])(
    'wartość %j: brak paska i 0 zapytań mimo odpowiedzi',
    async (value) => {
      if (value !== undefined) vi.stubEnv('VITE_MM_LIVE_PRICE_BAR', value);
      await mount();
      pick('Sklep');
      await wait(3000);
      expect(screen.queryByTestId('live-price-bar')).not.toBeInTheDocument();
      expect(requestPricePreview).not.toHaveBeenCalled();
      expect(getToken).not.toHaveBeenCalled();
      expect(document.body.dataset.stickyMobileBar).toBeUndefined();
    },
  );
});
