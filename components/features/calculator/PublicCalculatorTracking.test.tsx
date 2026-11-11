import React from 'react';
import { afterEach, beforeEach, describe, it, expect, vi, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { PublicQuestion } from '../../../services/calculatorService';

// MIX-1384 (Z3): calculator_step = dokladnie 1 zdarzenie na faktyczna zmiane kroku,
// 0 przy renderze, bez e-maila i odpowiedzi w parametrach.

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
    options: [{ value: 'sklep', label: 'Sklep' }],
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

vi.mock('../../../services/calculatorService', () => ({
  fetchPublicQuestions: () => Promise.resolve(QUESTIONS),
  submitPublicQuote: () =>
    Promise.resolve({ ok: true, result: { priceRange: { min: 1, max: 2 } } }),
}));

vi.mock('../contact/TurnstileWidget', async () => {
  const R = await import('react');
  return {
    default: R.forwardRef((_p: unknown, ref: React.Ref<unknown>) => {
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

let track: Mock<(event: string, data?: Record<string, unknown>) => void>;
const steps = () => track.mock.calls.filter((c) => c[0] === 'calculator_step');

beforeEach(() => {
  track = vi.fn<(event: string, data?: Record<string, unknown>) => void>();
  window.zaraz = { track, consent: { set: vi.fn() } };
});
afterEach(() => {
  delete window.zaraz;
});

const renderCalc = () =>
  render(
    <MemoryRouter>
      <PublicCalculator />
    </MemoryRouter>,
  );

describe('PublicCalculator: calculator_step', () => {
  it('render i wybor odpowiedzi nie wysylaja zdarzenia', async () => {
    renderCalc();
    await screen.findByText('Jaki jest cel projektu?');
    fireEvent.click(screen.getByRole('radio', { name: 'Sklep' }));
    expect(track).not.toHaveBeenCalled();
  });

  it('Dalej, Dalej, Wstecz = 3 zdarzenia z numerem kroku i kierunkiem', async () => {
    renderCalc();
    await screen.findByText('Jaki jest cel projektu?');
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    fireEvent.click(screen.getByRole('button', { name: 'Wstecz' }));
    expect(steps().map((c) => c[1])).toEqual([
      { step_number: 2, step_count: 3, step_group: 'platforma', direction: 'next' },
      { step_number: 3, step_count: 3, step_group: 'contact', direction: 'next' },
      { step_number: 2, step_count: 3, step_group: 'platforma', direction: 'back' },
    ]);
  });

  it('Dalej na ostatnim kroku i Wstecz na pierwszym nie wysylaja zdarzenia', async () => {
    renderCalc();
    await screen.findByText('Jaki jest cel projektu?');
    expect(screen.getByRole('button', { name: 'Wstecz' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Wstecz' }));
    expect(steps()).toHaveLength(0);
  });

  it('blad e-maila na ostatnim kroku (zostaje na kroku) = 0 zdarzen calculator_step', async () => {
    renderCalc();
    await screen.findByText('Jaki jest cel projektu?');
    fireEvent.click(screen.getByRole('radio', { name: 'Sklep' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    track.mockClear();
    fireEvent.change(screen.getByLabelText('Twój e-mail'), { target: { value: 'jan@' } });
    fireEvent.click(screen.getByRole('button', { name: 'Poznaj widełki' }));
    await waitFor(() =>
      expect(screen.getByLabelText('Twój e-mail')).toHaveAttribute('aria-invalid'),
    );
    expect(steps()).toHaveLength(0);
  });

  it('skok do kroku z bledem = 1 zdarzenie "error", e-mail nie trafia do parametrow', async () => {
    renderCalc();
    await screen.findByText('Jaki jest cel projektu?');
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    track.mockClear();
    fireEvent.change(screen.getByLabelText('Twój e-mail'), { target: { value: 'jan@firma.pl' } });
    fireEvent.click(screen.getByRole('button', { name: 'Poznaj widełki' }));
    await waitFor(() => expect(screen.getByText(/Krok 1 z 3/)).toBeInTheDocument());
    expect(steps()).toHaveLength(1);
    expect(steps()[0][1]).toEqual({
      step_number: 1,
      step_count: 3,
      step_group: 'projekt',
      direction: 'error',
    });
    expect(JSON.stringify(track.mock.calls)).not.toContain('jan@firma.pl');
  });
});
