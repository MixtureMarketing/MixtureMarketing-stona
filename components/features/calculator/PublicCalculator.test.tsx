import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { PublicQuestion } from '../../../services/calculatorService';

// Regresja (raport 10, #3): pominięte wymagane pytanie z kroku 1 blokowało „Poznaj widełki"
// na ostatnim kroku BEZ komunikatu — błąd renderował się na niewidocznym kroku.

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
    ],
    sort_order: 1,
  }),
  Q({
    code: 'languages',
    text: 'Ile wersji językowych?',
    answer_type: 'number',
    group: 'platforma',
    sort_order: 2,
  }),
];

const submitPublicQuote = vi.fn();
vi.mock('../../../services/calculatorService', () => ({
  fetchPublicQuestions: () => Promise.resolve(QUESTIONS),
  submitPublicQuote: (...a: unknown[]) => submitPublicQuote(...a),
}));

// Ostatnie propsy widgetu Turnstile (MIX-1383 B1: kalkulator nadaje akcję `public_quote`).
const widgetProps: Record<string, unknown>[] = [];
vi.mock('../contact/TurnstileWidget', async () => {
  const R = await import('react');
  return {
    default: R.forwardRef((p: Record<string, unknown>, ref: React.Ref<unknown>) => {
      widgetProps.push(p);
      R.useImperativeHandle(ref, () => ({
        getToken: () => Promise.resolve('tok'),
        reset: () => {},
        prepare: () => {},
      }));
      return null;
    }),
  };
});

import { MemoryRouter } from 'react-router-dom';
import PublicCalculator from './PublicCalculator';
import { PUBLIC_QUOTE_TURNSTILE_ACTION } from '../../../lib/estimation/turnstileAction';
import { QUOTE_TURNSTILE } from '../../../functions/api/estimation/_quoteGate';

const renderCalc = () =>
  render(
    <MemoryRouter>
      <PublicCalculator />
    </MemoryRouter>,
  );

const goToLastStep = async () => {
  await screen.findByText('Jaki jest cel projektu?');
  fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
  fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
  expect(screen.getByText(/Krok 3 z 3/)).toBeInTheDocument();
};

describe('PublicCalculator — akcja Turnstile (MIX-1383 B1)', () => {
  it('widget dostaje action public_quote, tę samą co serwer (QUOTE_TURNSTILE.action)', async () => {
    widgetProps.length = 0;
    renderCalc();
    await screen.findByText('Jaki jest cel projektu?');
    expect(widgetProps.length).toBeGreaterThan(0);
    expect(widgetProps.every((p) => p.action === 'public_quote')).toBe(true);
    expect(widgetProps[0]).toMatchObject({ defer: true });
    expect(PUBLIC_QUOTE_TURNSTILE_ACTION).toBe('public_quote');
    expect(QUOTE_TURNSTILE.action).toBe(PUBLIC_QUOTE_TURNSTILE_ACTION);
  });
});

describe('PublicCalculator — błąd walidacji na innym kroku', () => {
  beforeEach(() => {
    submitPublicQuote.mockReset();
    submitPublicQuote.mockResolvedValue({
      ok: true,
      result: { priceRange: { min: 1000, max: 2000 } },
    });
  });

  it('pominięte project_goal: przejście do kroku 1, komunikat, fokus, aria-invalid + aria-describedby', async () => {
    renderCalc();
    await goToLastStep();
    fireEvent.change(screen.getByLabelText('Twój e-mail'), { target: { value: 'jan@firma.pl' } });
    fireEvent.click(screen.getByRole('button', { name: 'Poznaj widełki' }));

    await waitFor(() => expect(screen.getByText(/Krok 1 z 3/)).toBeInTheDocument());
    expect(submitPublicQuote).not.toHaveBeenCalled();

    const group = screen.getByRole('radiogroup', { name: 'Jaki jest cel projektu?' });
    expect(group).toHaveAttribute('aria-invalid', 'true');
    const errId = group.getAttribute('aria-describedby');
    expect(errId).toBeTruthy();
    expect(document.getElementById(errId!)).toHaveTextContent('To pole jest wymagane.');

    expect(screen.getByRole('alert')).toHaveTextContent(/Uzupełnij.*Jaki jest cel projektu\?/);
    await waitFor(() => expect(document.activeElement).toHaveTextContent('Sklep'));
  });

  it('po uzupełnieniu odpowiedzi błąd gaśnie, a wysyłka przechodzi', async () => {
    renderCalc();
    await goToLastStep();
    fireEvent.change(screen.getByLabelText('Twój e-mail'), { target: { value: 'jan@firma.pl' } });
    fireEvent.click(screen.getByRole('button', { name: 'Poznaj widełki' }));
    await waitFor(() => expect(screen.getByText(/Krok 1 z 3/)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('radio', { name: 'Sklep' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Jaki jest cel projektu?' })).not.toHaveAttribute(
      'aria-invalid',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    fireEvent.click(screen.getByRole('button', { name: 'Poznaj widełki' }));
    await waitFor(() => expect(submitPublicQuote).toHaveBeenCalledTimes(1));
  });

  it('zły e-mail na ostatnim kroku: zostaje na kroku, fokus na e-mailu z aria-invalid', async () => {
    renderCalc();
    await screen.findByText('Jaki jest cel projektu?');
    fireEvent.click(screen.getByRole('radio', { name: 'Sklep' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    const email = screen.getByLabelText('Twój e-mail');
    fireEvent.change(email, { target: { value: 'jan@' } });
    fireEvent.click(screen.getByRole('button', { name: 'Poznaj widełki' }));

    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('Twój e-mail')));
    const input = screen.getByLabelText('Twój e-mail');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'calc-email-err');
    expect(screen.getByText(/Krok 3 z 3/)).toBeInTheDocument();
    expect(submitPublicQuote).not.toHaveBeenCalled();
  });
});
