// MIX-1791 K2/K3/K4: link do konfiguracji w kalkulatorze za przełącznikiem VITE_MM_CONFIG_LINK.
// Wyłączony = brak przycisków, `?k=` nieczytany, 0 nowych zapytań. Włączony = link odtwarza
// odpowiedzi, a pasek ceny pyta o te same odpowiedzi co po ręcznym wyborze. GA4: jedno
// calculator_share na kliknięcie, tylko source i method.
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
  {
    code: 'languages',
    text: 'Ile wersji językowych?',
    help_text: null,
    answer_type: 'number',
    options: null,
    visible_if: null,
    group: 'projekt',
    sort_order: 1,
  },
  {
    code: 'sensitive_data',
    text: 'Czy będą dane wrażliwe?',
    help_text: null,
    answer_type: 'bool',
    options: null,
    visible_if: null,
    group: 'projekt',
    sort_order: 2,
  },
  {
    code: 'modules',
    text: 'Jakie moduły?',
    help_text: null,
    answer_type: 'multiselect',
    options: [
      { value: 'blog', label: 'Blog' },
      { value: 'faq', label: 'FAQ' },
    ],
    visible_if: null,
    group: 'projekt',
    sort_order: 3,
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
import { CONFIG_LINK_MAX, decodeConfigLink, encodeConfigLink } from './configLink';

const PR = { min: 27500, max: 53000 };
const ANSWERS = { project_goal: 'portal', languages: 3, sensitive_data: true, modules: ['faq'] };
const GOOD_K = encodeConfigLink(QUESTIONS, ANSWERS)!;
const rawK = (json: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const wait = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
const at = (search: string) => window.history.replaceState(null, '', `/wycena/${search}`);
const mount = async () => {
  const view = render(
    <MemoryRouter>
      <PublicCalculator />
    </MemoryRouter>,
  );
  await screen.findByText('Jaki jest cel projektu?');
  // efekt odczytu linku i jego setAnswer po pierwszym renderze z pytaniami
  await act(async () => {});
  return view;
};
const radio = (name: string) => screen.getByRole('radio', { name });
const toggle = (name: string) => screen.getByRole('button', { name });
const formIsEmpty = () => {
  expect(radio('Sklep')).toHaveAttribute('aria-checked', 'false');
  expect(radio('Portal')).toHaveAttribute('aria-checked', 'false');
  expect(screen.getByRole('spinbutton', { name: 'Ile wersji językowych?' })).toHaveValue(null);
  expect(toggle('Tak')).toHaveAttribute('aria-pressed', 'false');
  expect(toggle('FAQ')).toHaveAttribute('aria-pressed', 'false');
};
const shareCalls = () => trackEvent.mock.calls.filter((c) => c[0] === 'calculator_share');
let fetchSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.stubEnv('VITE_MM_CONFIG_LINK', '');
  vi.stubEnv('VITE_MM_CONFIG_PREVIEW', '');
  vi.stubEnv('VITE_MM_LIVE_PRICE_BAR', '');
  requestPricePreview.mockReset();
  requestPricePreview.mockResolvedValue({ ok: true, priceRange: PR, scope: [] });
  trackEvent.mockReset();
  fetchSpy = vi.spyOn(globalThis, 'fetch');
  at('');
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  at('');
  Reflect.deleteProperty(navigator, 'share');
  Reflect.deleteProperty(navigator, 'clipboard');
});

describe('K4 przełącznik VITE_MM_CONFIG_LINK wyłączony', () => {
  it('poprawny ?k= jest ignorowany, brak przycisków po odpowiedzi, 0 zapytań', async () => {
    for (const v of ['', 'true', 'TRUE', ' 1', 'yes', 'on', '0']) {
      vi.stubEnv('VITE_MM_CONFIG_LINK', v);
      at(`?k=${GOOD_K}`);
      const { unmount } = await mount();
      formIsEmpty();
      fireEvent.click(radio('Sklep'));
      expect(screen.queryByTestId('config-link')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Skopiuj link' })).not.toBeInTheDocument();
      unmount();
    }
    expect(requestPricePreview).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(shareCalls()).toHaveLength(0);
  }, 30_000);
});

describe('K4 przełącznik włączony (tylko 1; MIX-1846)', () => {
  it('link odtwarza odpowiedzi każdego typu; bez zapytań własnych funkcji linku', async () => {
    for (const v of ['1']) {
      vi.stubEnv('VITE_MM_CONFIG_LINK', v);
      at(`?k=${GOOD_K}`);
      const { unmount } = await mount();
      expect(radio('Portal')).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('spinbutton', { name: 'Ile wersji językowych?' })).toHaveValue(3);
      expect(toggle('Tak')).toHaveAttribute('aria-pressed', 'true');
      expect(toggle('FAQ')).toHaveAttribute('aria-pressed', 'true');
      expect(toggle('Blog')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByRole('button', { name: 'Skopiuj link' })).toBeInTheDocument();
      unmount();
    }
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(requestPricePreview).not.toHaveBeenCalled();
  });

  it('pasek ceny pyta o te same odpowiedzi co po ręcznym wyborze', async () => {
    vi.stubEnv('VITE_MM_CONFIG_LINK', '1');
    vi.stubEnv('VITE_MM_LIVE_PRICE_BAR', '1');
    // ręcznie
    const manual = await mount();
    vi.useFakeTimers();
    fireEvent.click(radio('Portal'));
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Ile wersji językowych?' }), {
      target: { value: '3' },
    });
    fireEvent.click(toggle('Tak'));
    fireEvent.click(toggle('FAQ'));
    await wait(3000);
    expect(requestPricePreview).toHaveBeenCalledTimes(1);
    const manualAnswers = requestPricePreview.mock.calls[0][0].answers;
    expect(screen.getByTestId('live-price-bar')).toHaveTextContent('27');
    manual.unmount();
    vi.useRealTimers();
    requestPricePreview.mockClear();
    // z linku
    at(`?k=${GOOD_K}`);
    await mount();
    // odtworzenie i odliczanie (400 ms) ruszyły przy prawdziwym zegarze: czekamy naprawdę
    await act(() => new Promise((r) => setTimeout(r, 900)));
    expect(requestPricePreview).toHaveBeenCalledTimes(1);
    expect(requestPricePreview.mock.calls[0][0].answers).toEqual(manualAnswers);
    expect(manualAnswers).toEqual(ANSWERS);
    expect(screen.getByTestId('live-price-bar')).toHaveTextContent('27');
  });
});

describe('K2 złośliwy albo zepsuty link = pusty formularz, nic nie wykonane', () => {
  beforeEach(() => vi.stubEnv('VITE_MM_CONFIG_LINK', '1'));

  const cases: [string, string][] = [
    ['HTML/skrypt w wartości', rawK('{"project_goal":"<script>window.__xss=1</script>"}')],
    ['HTML zamiast JSON', rawK('<img src=x onerror="window.__xss=2">')],
    ['klucz __proto__', rawK('{"project_goal":"portal","__proto__":{"polluted":1}}')],
    ['nieznane kody', rawK('{"obce":"x","toString":"y"}')],
    ['opcja spoza listy', rawK('{"project_goal":"Portal","modules":["obca"]}')],
    ['zły typ', rawK('{"languages":"3","sensitive_data":1}')],
    ['zły base64', '%3Cscript%3E'],
    ['za długi', GOOD_K + 'A'.repeat(CONFIG_LINK_MAX)],
    ['dwa parametry k', `${GOOD_K}&k=${GOOD_K}`],
  ];
  for (const [name, k] of cases)
    it(`${name}: pusty formularz, 0 elementów script/img, brak przycisków`, async () => {
      at(`?k=${k}`);
      const { container } = await mount();
      formIsEmpty();
      expect(container.querySelectorAll('script, img')).toHaveLength(0);
      expect((window as unknown as { __xss?: number }).__xss).toBeUndefined();
      expect(Object.prototype).not.toHaveProperty('polluted');
      expect(screen.queryByTestId('config-link')).not.toBeInTheDocument();
    });

  it('bliźniak: ten sam link bez złych pól odtwarza dobrą część', async () => {
    at(`?k=${rawK('{"project_goal":"portal","obce":"x","languages":"3"}')}`);
    await mount();
    expect(radio('Portal')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('spinbutton', { name: 'Ile wersji językowych?' })).toHaveValue(null);
  });
});

describe('K3 przyciski i GA4 calculator_share', () => {
  beforeEach(() => vi.stubEnv('VITE_MM_CONFIG_LINK', '1'));

  it('przed odpowiedzią brak przycisków; po odpowiedzi przyciski 44 px (min-h-11)', async () => {
    await mount();
    expect(screen.queryByTestId('config-link')).not.toBeInTheDocument();
    fireEvent.click(radio('Sklep'));
    expect(screen.getByRole('button', { name: 'Skopiuj link' }).className).toMatch(/\bmin-h-11\b/);
  });

  it('Skopiuj link: link w schowku odtwarza odpowiedzi; 1 zdarzenie na klik, tylko source i method', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    await mount();
    fireEvent.click(radio('Portal'));
    fireEvent.click(toggle('Tak'));
    trackEvent.mockClear();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Skopiuj link' }));
    });
    expect(shareCalls()).toEqual([['calculator_share', { source: 'wycena', method: 'copy' }]]);
    expect(trackEvent).toHaveBeenCalledTimes(1);
    const link = writeText.mock.calls[0][0] as string;
    expect(link).toMatch(/^http:\/\/localhost(:\d+)?\/wycena\/\?k=[A-Za-z0-9_-]+$/);
    const k = new URL(link).searchParams.get('k');
    expect(decodeConfigLink(k, QUESTIONS)).toEqual({
      ok: true,
      answers: { project_goal: 'portal', sensitive_data: true },
      skipped: 0,
    });
    const params = JSON.stringify(shareCalls());
    expect(params).not.toContain('portal');
    expect(params).not.toContain(k);
    expect(params).not.toContain('@');
    expect(screen.getByText('Link skopiowany.')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Skopiuj link' }));
    });
    expect(shareCalls()).toHaveLength(2);
  });

  it('schowek niedostępny: link do ręcznego skopiowania, jedno zdarzenie', async () => {
    await mount();
    fireEvent.click(radio('Sklep'));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Skopiuj link' }));
    });
    const input = screen.getByLabelText(/Skopiuj link poniżej/);
    expect((input as HTMLInputElement).value).toContain('/wycena/?k=');
    expect(shareCalls()).toHaveLength(1);
  });

  it('Udostępnij tylko z Web Share; klik = 1 zdarzenie method native, anulowanie bez błędu', async () => {
    const { unmount } = await mount();
    fireEvent.click(radio('Sklep'));
    expect(screen.queryByRole('button', { name: 'Udostępnij' })).not.toBeInTheDocument();
    unmount();
    const share = vi.fn().mockRejectedValue(new DOMException('cancel', 'AbortError'));
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    await mount();
    fireEvent.click(radio('Sklep'));
    trackEvent.mockClear();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Udostępnij' }));
    });
    expect(shareCalls()).toEqual([['calculator_share', { source: 'wycena', method: 'native' }]]);
    expect(share).toHaveBeenCalledTimes(1);
    expect(share.mock.calls[0][0].url).toMatch(/\/wycena\/\?k=/);
    expect(screen.queryByText('Link skopiowany.')).not.toBeInTheDocument();
  });
});
