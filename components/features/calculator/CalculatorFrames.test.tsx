// MIX-1894: nowy wygląd kalkulatora (VITE_MM_CALC_NEW_UI=1) bez zagnieżdżonych ramek.
// Atrapy API i Turnstile jak w CalculatorNewUi.test.tsx (MIX-1867).
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PublicQuestion } from '../../../services/calculatorService';

const QUESTIONS: PublicQuestion[] = [
  {
    code: 'project_goal',
    text: 'Jaki jest cel projektu?',
    help_text: 'Wybierz najbliższy.',
    answer_type: 'select',
    options: [
      { value: 'sklep', label: 'Sklep' },
      { value: 'wizytowka', label: 'Wizytówka' },
    ],
    visible_if: null,
    group: 'projekt',
    sort_order: 1,
  },
  {
    code: 'languages',
    text: 'Ile wersji językowych?',
    help_text: null,
    answer_type: 'number',
    options: null,
    visible_if: null,
    group: 'platforma',
    sort_order: 2,
  },
];

let fetchQuestions: () => Promise<PublicQuestion[]> = () => Promise.resolve(QUESTIONS);
const submitPublicQuote = vi.fn();
vi.mock('../../../services/calculatorService', () => ({
  fetchPublicQuestions: () => fetchQuestions(),
  submitPublicQuote: (...a: unknown[]) => submitPublicQuote(...a),
}));

let token = 'tok';
vi.mock('../contact/TurnstileWidget', async () => {
  const R = await import('react');
  return {
    default: R.forwardRef((_p: unknown, ref: React.Ref<unknown>) => {
      R.useImperativeHandle(ref, () => ({
        getToken: () => Promise.resolve(token),
        reset: () => {},
        prepare: () => {},
      }));
      return null;
    }),
  };
});

import PublicCalculator from './PublicCalculator';
import { NEW_UI_SHELL } from './calcUi';

const renderCalc = () =>
  render(
    <MemoryRouter>
      <PublicCalculator />
    </MemoryRouter>,
  );

const fillAndSubmit = async () => {
  await screen.findByText('Jaki jest cel projektu?');
  fireEvent.click(screen.getByRole('radio', { name: /Sklep/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
  fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
  fireEvent.change(screen.getByLabelText('Twój e-mail'), { target: { value: 'jan@firma.pl' } });
  fireEvent.click(screen.getByRole('button', { name: 'Poznaj widełki' }));
};

beforeEach(() => {
  fetchQuestions = () => Promise.resolve(QUESTIONS);
  token = 'tok';
  submitPublicQuote.mockReset();
  submitPublicQuote.mockResolvedValue({
    ok: true,
    result: { priceRange: { min: 12000, max: 18000 } },
  });
  vi.stubEnv('VITE_MM_CALC_NEW_UI', '1');
});
afterEach(() => {
  vi.unstubAllEnvs();
});

// MIX-1894 (uwaga Jakuba „za dużo zagłębień bloczków”): jedyna ramka wokół odpowiedzi to karta
// kroku; na telefonie (< 640 px) karta bez ramki, z odstępem 16 px i tłem na całą szerokość.
const tokens = (el: Element) => (el.getAttribute('class') || '').split(/\s+/).filter(Boolean);
/** Klasa rysująca ramkę albo tło bloczka (bez wariantów stanu: hover/focus/aria/group). */
const FRAME =
  /^(?:(?:sm|md|lg):)?(?:border(?:-[trblxy])?|bg-(?:white|primary|red-500)\/.+|rounded-(?:xl|2xl|3xl))$/;
/** Elementy z ramką/tłem między `el` (bez niego) a kartą kroku (bez niej). */
const framesBetween = (el: Element, shell: Element) => {
  const out: string[] = [];
  for (let p = el.parentElement; p && p !== shell; p = p.parentElement) {
    const f = tokens(p).filter((t) => FRAME.test(t));
    if (f.length) out.push(`${p.tagName}.${f.join('.')}`);
  }
  return out;
};

describe('MIX-1894 nowy wygląd: jedna ramka wokół odpowiedzi', () => {
  it('karta kroku: ramka i zaokrąglenie dopiero od sm, na telefonie odstęp 16 px i tło do krawędzi', () => {
    const t = NEW_UI_SHELL.split(/\s+/);
    for (const c of ['-mx-4', 'p-4', 'sm:mx-0', 'sm:border', 'sm:rounded-3xl', 'sm:p-6', 'md:p-10'])
      expect(t).toContain(c);
    for (const c of ['border', 'rounded-3xl', 'p-6', 'p-5', 'px-6']) expect(t).not.toContain(c);
    // pasek ceny (-mx-6 pod p-6) dostaje na telefonie -mx-4 pod nowy odstęp karty
    expect(t).toContain('max-sm:[&_[data-testid=live-price-bar]]:-mx-4');
    expect(t).toContain('bg-[#0d1529]');
  });

  it('krok pytań: kontener kalkulatora = NEW_UI_SHELL, pytanie bez ramki i tła, opcje bez ramek pośrednich', async () => {
    const { container } = renderCalc();
    await screen.findByText('Jaki jest cel projektu?');
    const shell = container.querySelector('[data-calc-ui="new"]')!;
    for (const c of NEW_UI_SHELL.split(/\s+/)) expect(tokens(shell)).toContain(c);
    const q = screen.getByTestId('calc-question');
    expect(tokens(q).filter((x) => FRAME.test(x))).toEqual([]);
    expect(tokens(q).some((x) => /^p[xy]?-\d/.test(x))).toBe(false);
    expect(framesBetween(screen.getByRole('radio', { name: 'Sklep' }), shell)).toEqual([]);
    // ramkę ma sama odpowiedź (jeden poziom), wyraźny stan zaznaczenia bez zmian
    const sklep = screen.getByRole('radio', { name: 'Sklep' });
    expect(tokens(sklep)).toContain('border');
    fireEvent.click(sklep);
    expect(sklep).toHaveAttribute('aria-checked', 'true');
    expect(tokens(sklep)).toEqual(expect.arrayContaining(['border-primary', 'bg-primary/15']));
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    const num = screen.getByRole('spinbutton', { name: 'Ile wersji językowych?' });
    expect(framesBetween(num, shell)).toEqual([]);
  });

  it('błąd walidacji: pytanie nadal bez ramki, komunikat i data-invalid zostają', async () => {
    const { container } = renderCalc();
    await screen.findByText('Jaki jest cel projektu?');
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    fireEvent.click(screen.getByRole('button', { name: 'Poznaj widełki' }));
    await waitFor(() =>
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1'),
    );
    const q = screen.getByTestId('calc-question');
    expect(q).toHaveAttribute('data-invalid', 'true');
    expect(tokens(q).filter((x) => FRAME.test(x))).toEqual([]);
    expect(q).toHaveTextContent('!');
    const shell = container.querySelector('[data-calc-ui="new"]')!;
    expect(framesBetween(screen.getByRole('radio', { name: 'Sklep' }), shell)).toEqual([]);
  });

  it('kontakt: pole e-mail bez ramki wokół grupy (także przy błędzie)', async () => {
    const { container } = renderCalc();
    await screen.findByText('Jaki jest cel projektu?');
    fireEvent.click(screen.getByRole('radio', { name: 'Sklep' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    const shell = container.querySelector('[data-calc-ui="new"]')!;
    const email = screen.getByLabelText('Twój e-mail');
    expect(framesBetween(email, shell)).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'Poznaj widełki' }));
    await waitFor(() => expect(email).toHaveAttribute('aria-invalid', 'true'));
    expect(framesBetween(screen.getByLabelText('Twój e-mail'), shell)).toEqual([]);
  });

  it('wynik: widełki bez ramki wewnątrz karty', async () => {
    const { container } = renderCalc();
    await fillAndSubmit();
    const head = await screen.findByRole('heading', {
      name: 'Twój projekt: orientacyjne widełki',
    });
    const shell = container.querySelector('[data-calc-ui="new"]')!;
    expect(framesBetween(head, shell)).toEqual([]);
    const res = screen.getByTestId('calc-result');
    expect(res.querySelectorAll('[class*="border-primary"], [class*="bg-primary/"]').length).toBe(
      0,
    );
  });

  it('ładowanie: szkielet bez ramki pytania', () => {
    fetchQuestions = () => new Promise(() => {});
    const { container } = renderCalc();
    const s = screen.getByTestId('calc-loading');
    const shell = container.querySelector('[data-calc-ui="new"]')!;
    const framed = [...s.querySelectorAll('*')].filter(
      (e) => tokens(e).some((x) => /^(?:border|rounded-2xl)$/.test(x)) && e.children.length > 0,
    );
    expect(framed).toEqual([]);
    expect(shell.contains(s)).toBe(true);
  });
});
