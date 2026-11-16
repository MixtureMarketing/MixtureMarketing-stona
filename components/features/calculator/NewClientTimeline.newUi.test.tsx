// MIX-1892: scalenie osi czasu (MIX-1816, VITE_MM_NEW_CLIENT_TIMELINE) z nowym wyglądem kalkulatora
// (MIX-1867, VITE_MM_CALC_NEW_UI). Cztery kombinacje przełączników na ekranie wyniku: oś czasu jest
// TYLKO przy osi = 1 i zawsze jako ostatni element ekranu wyniku; wygląd wyniku zależy TYLKO od
// VITE_MM_CALC_NEW_UI (nowy = karta „Twój projekt” z fokusem, stary = „Orientacyjne widełki”).
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PublicQuestion } from '../../../services/calculatorService';

const QUESTIONS: PublicQuestion[] = [
  {
    code: 'project_goal',
    text: 'Jaki jest cel projektu?',
    help_text: null,
    answer_type: 'select',
    options: [{ value: 'sklep', label: 'Sklep' }],
    visible_if: null,
    group: 'projekt',
    sort_order: 1,
  },
];
const submitPublicQuote = vi.fn();
vi.mock('../../../services/calculatorService', () => ({
  fetchPublicQuestions: () => Promise.resolve(QUESTIONS),
  submitPublicQuote: (...a: unknown[]) => submitPublicQuote(...a),
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
import PublicCalculator from './PublicCalculator';

async function reachResult() {
  const view = render(
    <MemoryRouter>
      <PublicCalculator />
    </MemoryRouter>,
  );
  await screen.findByText('Jaki jest cel projektu?');
  fireEvent.click(screen.getByRole('radio', { name: /Sklep/ }));
  fireEvent.click(screen.getByRole('button', { name: /Dalej/ }));
  fireEvent.change(screen.getByLabelText('Twój e-mail'), { target: { value: 'jan@firma.pl' } });
  fireEvent.click(screen.getByRole('button', { name: 'Poznaj widełki' }));
  await waitFor(() => expect(screen.getByText(/orientacyjne widełki/i)).toBeInTheDocument());
  return view;
}

beforeEach(() => {
  submitPublicQuote.mockReset();
  submitPublicQuote.mockResolvedValue({
    ok: true,
    result: { priceRange: { min: 27500, max: 53000 } },
  });
});
afterEach(() => vi.unstubAllEnvs());

const COMBOS = [
  { timeline: '', ui: '' },
  { timeline: '1', ui: '' },
  { timeline: '', ui: '1' },
  { timeline: '1', ui: '1' },
] as const;

describe('MIX-1892 oś czasu × nowy wygląd: 4 kombinacje przełączników', () => {
  for (const combo of COMBOS) {
    const name = `oś=${combo.timeline || 'pusta'}, nowy wygląd=${combo.ui || 'pusty'}`;
    it(name, async () => {
      vi.stubEnv('VITE_MM_NEW_CLIENT_TIMELINE', combo.timeline);
      vi.stubEnv('VITE_MM_CALC_NEW_UI', combo.ui);
      const { container, unmount } = await reachResult();

      // wygląd wyniku zależy tylko od VITE_MM_CALC_NEW_UI
      const newBox = screen.queryByTestId('calc-result');
      const oldBox = container.querySelector('div.text-center.space-y-6');
      const box = combo.ui === '1' ? newBox : oldBox;
      expect(box, 'ekran wyniku we właściwym wyglądzie').not.toBeNull();
      if (combo.ui === '1') {
        expect(oldBox).toBeNull();
        const head = screen.getByRole('heading', {
          level: 2,
          name: 'Twój projekt: orientacyjne widełki',
        });
        await waitFor(() => expect(head).toHaveFocus());
      } else {
        expect(newBox).toBeNull();
        expect(screen.getByText('Orientacyjne widełki')).toBeInTheDocument();
      }
      expect(box!.textContent).toContain('27 500 – 53 000 zł');
      expect(screen.getByRole('link', { name: /Umów rozmowę/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Policz jeszcze raz' })).toBeInTheDocument();

      // oś czasu tylko przy osi = 1, jako ostatni element ekranu wyniku
      const sections = screen.queryAllByTestId('new-client-timeline');
      if (combo.timeline === '1') {
        expect(sections).toHaveLength(1);
        expect(box!.lastElementChild).toBe(sections[0]);
        expect(
          screen.getByRole('heading', { level: 2, name: 'Co dostajesz i kiedy' }),
        ).toBeVisible();
        expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
          'Tydzień 1',
          'Miesiąc 1',
          '90 dni',
        ]);
      } else {
        expect(sections).toHaveLength(0);
        expect(screen.queryByText('Co dostajesz i kiedy')).not.toBeInTheDocument();
        expect(document.body.dataset.timelineCookie).toBeUndefined();
      }
      unmount();
    }, 30_000);
  }

  it('„Policz jeszcze raz” w nowym wyglądzie z osią wraca do formularza i zdejmuje oś', async () => {
    vi.stubEnv('VITE_MM_NEW_CLIENT_TIMELINE', '1');
    vi.stubEnv('VITE_MM_CALC_NEW_UI', '1');
    await reachResult();
    expect(screen.getByTestId('new-client-timeline')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Policz jeszcze raz' }));
    await screen.findByText('Jaki jest cel projektu?');
    expect(screen.queryByTestId('new-client-timeline')).not.toBeInTheDocument();
  }, 30_000);
});
