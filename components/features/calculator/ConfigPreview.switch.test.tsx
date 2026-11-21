// MIX-1790 K2/K4/K5: podgląd konfiguracji w kalkulatorze za przełącznikiem VITE_MM_CONFIG_PREVIEW.
// Wyłączony = 0 nowych elementów DOM i 0 nowych zapytań. Klient podglądu jest atrapą (jak
// LivePriceBar.test.tsx), liczniki czasu sztuczne.
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

const requestPricePreview = vi.fn();
vi.mock('../../../services/pricePreviewService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../services/pricePreviewService')>()),
  requestPricePreview: (...a: unknown[]) => requestPricePreview(...a),
}));
vi.mock('../../../services/calculatorService', () => ({
  fetchPublicQuestions: () => Promise.resolve(QUESTIONS),
  submitPublicQuote: vi.fn(),
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

const SCOPE = [
  { client_name: 'Koszyk i płatności', client_description: 'Zakupy bez zakładania konta.' },
  { client_name: 'Dwie wersje językowe', client_description: null },
];
const PR = { min: 27500, max: 53000 };

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
  await screen.findByText('Jaki jest cel projektu?');
  vi.useFakeTimers();
};
const env = (config?: string, live?: string) => {
  if (config !== undefined) vi.stubEnv('VITE_MM_CONFIG_PREVIEW', config);
  if (live !== undefined) vi.stubEnv('VITE_MM_LIVE_PRICE_BAR', live);
};

beforeEach(() => {
  vi.stubEnv('VITE_MM_CONFIG_PREVIEW', '');
  vi.stubEnv('VITE_MM_LIVE_PRICE_BAR', '');
  requestPricePreview.mockReset();
  requestPricePreview.mockResolvedValue({ ok: true, priceRange: PR, scope: SCOPE });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('przełącznik VITE_MM_CONFIG_PREVIEW (K2)', () => {
  it('oba wyłączone: po odpowiedzi 0 elementów podglądu i 0 zapytań', async () => {
    await mount();
    pick('Sklep');
    await wait(3000);
    expect(screen.queryByTestId('config-preview')).not.toBeInTheDocument();
    expect(screen.queryByText('Twój zakres')).not.toBeInTheDocument();
    expect(document.querySelector('svg[role="img"]')).toBeNull();
    expect(requestPricePreview).not.toHaveBeenCalled();
  });

  it('pasek włączony, podgląd wyłączony: pasek jest, podglądu brak (0 nowego DOM)', async () => {
    env('', '1');
    await mount();
    pick('Sklep');
    await wait(500);
    expect(screen.getByTestId('live-price-bar')).toBeInTheDocument();
    expect(screen.queryByTestId('config-preview')).not.toBeInTheDocument();
    expect(requestPricePreview).toHaveBeenCalledTimes(1);
  });

  it('U5 wartości inne niż 1 (true, TRUE, " 1", yes, 0, on) = wyłączony; tylko 1 = włączony (MIX-1846)', async () => {
    for (const v of ['true', 'TRUE', ' 1', 'yes', '0', 'on']) {
      env(v);
      const { unmount } = render(
        <MemoryRouter>
          <PublicCalculator />
        </MemoryRouter>,
      );
      await screen.findByText('Jaki jest cel projektu?');
      pick('Sklep');
      expect(screen.queryByTestId('config-preview')).not.toBeInTheDocument();
      unmount();
    }
    for (const v of ['1']) {
      env(v);
      const { unmount } = render(
        <MemoryRouter>
          <PublicCalculator />
        </MemoryRouter>,
      );
      await screen.findByText('Jaki jest cel projektu?');
      pick('Sklep');
      expect(screen.getByTestId('config-sketch')).toBeInTheDocument();
      unmount();
    }
  });
});

describe('podgląd włączony', () => {
  beforeEach(() => env('1'));

  it('przed odpowiedzią brak podglądu; po wyborze sklepu szkic, po podglądzie lista „Twój zakres"', async () => {
    await mount();
    expect(screen.queryByTestId('config-preview')).not.toBeInTheDocument();
    pick('Sklep');
    expect(screen.getByRole('img', { name: 'Szkic: Sklep internetowy' })).toBeInTheDocument();
    expect(screen.queryByTestId('config-scope')).not.toBeInTheDocument();
    await wait(400);
    expect(requestPricePreview).toHaveBeenCalledTimes(1);
    const items = screen.getAllByRole('listitem');
    expect(items.map((i) => i.textContent)).toEqual([
      'Koszyk i płatnościZakupy bez zakładania konta.',
      'Dwie wersje językowe',
    ]);
    // pasek widełek ma osobny przełącznik (wyłączony)
    expect(screen.queryByTestId('live-price-bar')).not.toBeInTheDocument();
  });

  it('K5 typ spoza listy szkiców: brak szkicu, lista działa', async () => {
    await mount();
    pick('Portal');
    await wait(400);
    expect(screen.queryByTestId('config-sketch')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('K5 pusty zakres albo serwer v1 = lista ukryta, szkic zostaje', async () => {
    requestPricePreview.mockResolvedValueOnce({ ok: true, priceRange: PR, scope: [] });
    await mount();
    pick('Sklep');
    await wait(400);
    expect(screen.queryByTestId('config-scope')).not.toBeInTheDocument();
    expect(screen.getByTestId('config-sketch')).toBeInTheDocument();
  });

  it('błąd podglądu = lista znika (stary zakres nie pasuje do nowych odpowiedzi)', async () => {
    await mount();
    pick('Sklep');
    await wait(400);
    expect(screen.getByTestId('config-scope')).toBeInTheDocument();
    requestPricePreview.mockResolvedValueOnce({ ok: false, status: 500 });
    pick('Portal');
    await wait(1500);
    expect(screen.queryByTestId('config-scope')).not.toBeInTheDocument();
  });

  it('K4 HTML z API renderuje się dosłownie (0 elementów img/script w podglądzie)', async () => {
    requestPricePreview.mockResolvedValueOnce({
      ok: true,
      priceRange: PR,
      scope: [
        {
          client_name: '<img src=x onerror="window.__xss=1">',
          client_description: '<script>window.__xss=2</script>',
        },
      ],
    });
    await mount();
    pick('Sklep');
    await wait(400);
    const box = screen.getByTestId('config-scope');
    expect(box.querySelector('img, script')).toBeNull();
    expect(box).toHaveTextContent('<img src=x onerror="window.__xss=1">');
    expect(box).toHaveTextContent('<script>window.__xss=2</script>');
    expect((window as unknown as { __xss?: number }).__xss).toBeUndefined();
  });
});
