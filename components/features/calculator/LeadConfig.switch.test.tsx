// MIX-1813 (Z10) K1/K3: „Wyślij i umów rozmowę” z opcjonalnym telefonem za przełącznikiem budowy
// VITE_MM_LEAD_CONFIG. Wyłączony = ten sam DOM i ta sama treść wysyłki co dziś (bez pola phone).
// GA4: calculator_submit bez telefonu i e-maila (tylko source).
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
import { isLeadConfigEnabled } from './livePrice';

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
const submitBody = () => submitPublicQuote.mock.calls[0][0] as Record<string, unknown>;

beforeEach(() => {
  for (const f of ['VITE_MM_CONFIG_LINK', 'VITE_MM_CONFIG_PREVIEW', 'VITE_MM_LIVE_PRICE_BAR'])
    vi.stubEnv(f, '');
  submitPublicQuote.mockReset();
  submitPublicQuote.mockResolvedValue({
    ok: true,
    result: { priceRange: { min: 1000, max: 2000 }, currency: 'PLN', status: 'ok' },
  });
  trackEvent.mockReset();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('isLeadConfigEnabled', () => {
  it('tylko 1 albo true włącza', () => {
    expect(isLeadConfigEnabled('1')).toBe(true);
    expect(isLeadConfigEnabled('true')).toBe(true);
    for (const v of [undefined, '', '0', 'TRUE', ' 1', 'yes', 1])
      expect(isLeadConfigEnabled(v)).toBe(false);
  });
  it('brak VITE_MM_LEAD_CONFIG przy włączonych innych przełącznikach = wyłączony', () => {
    vi.stubEnv('VITE_MM_LIVE_PRICE_BAR', '1');
    vi.stubEnv('VITE_MM_CONFIG_LINK', '1');
    expect(isLeadConfigEnabled(undefined)).toBe(false);
    expect(isLeadConfigEnabled()).toBe(false);
  });
});

describe('K3 przełącznik wyłączony: DOM i wysyłka jak dziś', () => {
  it('brak pola telefonu, przycisk „Poznaj widełki”, wysyłka bez phone; DOM jak bez przełącznika', async () => {
    const html: string[] = [];
    for (const v of [undefined, '', '0', 'yes']) {
      if (v === undefined) vi.unstubAllEnvs();
      else vi.stubEnv('VITE_MM_LEAD_CONFIG', v);
      const { container, unmount } = await toContact();
      expect(screen.queryByLabelText('Telefon (opcjonalnie)')).not.toBeInTheDocument();
      expect(container.querySelector('input[type="tel"]')).toBeNull();
      expect(
        screen.queryByRole('button', { name: 'Wyślij i umów rozmowę' }),
      ).not.toBeInTheDocument();
      html.push(container.innerHTML);
      fireEvent.click(screen.getByRole('button', { name: 'Poznaj widełki' }));
      await waitFor(() => expect(submitPublicQuote).toHaveBeenCalledTimes(1));
      expect(Object.keys(submitBody()).sort()).toEqual(
        ['answers', 'captcha_token', 'email', 'website_verify'].sort(),
      );
      submitPublicQuote.mockClear();
      unmount();
    }
    expect(new Set(html).size).toBe(1);
  }, 30_000);
});

describe('K1 przełącznik włączony: „Wyślij i umów rozmowę” z opcjonalnym telefonem', () => {
  it('telefon wpisany idzie w treści (przycięty), GA4 bez telefonu i e-maila', async () => {
    vi.stubEnv('VITE_MM_LEAD_CONFIG', '1');
    await toContact();
    const tel = screen.getByLabelText('Telefon (opcjonalnie)');
    expect(tel).toHaveAttribute('type', 'tel');
    expect(tel).toHaveAttribute('autocomplete', 'tel');
    expect(tel).toHaveAttribute('maxlength', '32');
    expect(tel).not.toBeRequired();
    fireEvent.change(tel, { target: { value: '  +48 600 700 800 ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Wyślij i umów rozmowę' }));
    await waitFor(() => expect(submitPublicQuote).toHaveBeenCalledTimes(1));
    expect(submitBody().phone).toBe('+48 600 700 800');
    const submits = trackEvent.mock.calls.filter((c) => c[0] === 'calculator_submit');
    expect(submits).toHaveLength(1);
    expect(JSON.stringify(trackEvent.mock.calls)).not.toMatch(/600|jan@firma/);
  });

  it('pusty telefon: wysyłka bez pola phone (telefon opcjonalny)', async () => {
    vi.stubEnv('VITE_MM_LEAD_CONFIG', 'true');
    await toContact();
    fireEvent.change(screen.getByLabelText('Telefon (opcjonalnie)'), { target: { value: '   ' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Wyślij i umów rozmowę' }));
    });
    await waitFor(() => expect(submitPublicQuote).toHaveBeenCalledTimes(1));
    expect('phone' in submitBody()).toBe(false);
  });
});
