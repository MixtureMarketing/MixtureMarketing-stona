// MIX-1897: scalenie terminów rozmowy (MIX-1814, VITE_MM_BOOKING_EMBED) z nowym wyglądem kalkulatora
// (MIX-1867, VITE_MM_CALC_NEW_UI) i osią czasu (MIX-1816, VITE_MM_NEW_CLIENT_TIMELINE). Osiem kombinacji
// przy VITE_MM_LEAD_CONFIG=1 (bez niego terminy są zawsze wyłączone): ramka harmonogramu jest TYLKO przy
// terminach = 1 i w obu wyglądach wewnątrz ekranu wyniku; oś czasu TYLKO przy osi = 1 i zawsze jako
// ostatni element ekranu wyniku, więc przy obu włączonych terminy stoją tuż przed osią.
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
        getToken: () => Promise.resolve('tok'),
        reset: () => {},
        prepare: () => {},
      }));
      return null;
    }),
  };
});
import PublicCalculator from './PublicCalculator';
import { CALENDAR_IFRAME_SRC } from '../contact/contactConfig';

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
  fireEvent.click(screen.getByRole('button', { name: 'Wyślij i umów rozmowę' }));
  await waitFor(() => expect(screen.getByText(/orientacyjne widełki/i)).toBeInTheDocument());
  return view;
}

beforeEach(() => {
  for (const f of ['VITE_MM_CONFIG_LINK', 'VITE_MM_CONFIG_PREVIEW', 'VITE_MM_LIVE_PRICE_BAR'])
    vi.stubEnv(f, '');
  vi.stubEnv('VITE_MM_LEAD_CONFIG', '1');
  submitPublicQuote.mockReset();
  submitPublicQuote.mockResolvedValue({
    ok: true,
    result: { priceRange: { min: 27500, max: 53000 } },
  });
  trackEvent.mockReset();
});
afterEach(() => vi.unstubAllEnvs());
vi.setConfig({ testTimeout: 30_000 });

const COMBOS = ['', '1'].flatMap((ui) =>
  ['', '1'].flatMap((timeline) => ['', '1'].map((booking) => ({ ui, timeline, booking }))),
);

describe('MIX-1897 terminy × oś czasu × nowy wygląd: 8 kombinacji przełączników', () => {
  it('lista kombinacji jest pełna (2^3)', () => {
    expect(new Set(COMBOS.map((c) => JSON.stringify(c))).size).toBe(8);
  });
  for (const combo of COMBOS) {
    const name = `wygląd=${combo.ui || 'stary'}, oś=${combo.timeline || 'pusta'}, terminy=${combo.booking || 'puste'}`;
    it(name, async () => {
      vi.stubEnv('VITE_MM_CALC_NEW_UI', combo.ui);
      vi.stubEnv('VITE_MM_NEW_CLIENT_TIMELINE', combo.timeline);
      vi.stubEnv('VITE_MM_BOOKING_EMBED', combo.booking);
      const { container, unmount } = await reachResult();

      const newBox = screen.queryByTestId('calc-result');
      const oldBox = container.querySelector('div.text-center.space-y-6');
      const box = combo.ui === '1' ? newBox : oldBox;
      expect(box, 'ekran wyniku we właściwym wyglądzie').not.toBeNull();
      expect(combo.ui === '1' ? oldBox : newBox).toBeNull();
      expect(box!.textContent!.replace(/\s/g, ' ')).toContain('27 500 – 53 000 zł');

      const booking = screen.queryAllByTestId('booking-embed');
      const timeline = screen.queryAllByTestId('new-client-timeline');
      const opens = trackEvent.mock.calls.filter((c) => c[0] === 'calculator_booking_open');

      if (combo.booking === '1') {
        expect(booking).toHaveLength(1);
        expect(booking[0].parentElement).toBe(box);
        const frames = container.querySelectorAll('iframe');
        expect(frames).toHaveLength(1);
        expect(frames[0].getAttribute('src')).toBe(CALENDAR_IFRAME_SRC);
        expect(
          screen.getByRole('heading', { level: 3, name: 'Wybierz termin rozmowy' }),
        ).toBeInTheDocument();
        expect(opens).toHaveLength(1);
      } else {
        expect(booking).toHaveLength(0);
        expect(container.querySelectorAll('iframe')).toHaveLength(0);
        expect(container.innerHTML).not.toContain('calendar.google.com');
        expect(opens).toHaveLength(0);
      }

      if (combo.timeline === '1') {
        expect(timeline).toHaveLength(1);
        expect(box!.lastElementChild, 'oś czasu na końcu ekranu wyniku').toBe(timeline[0]);
        if (combo.booking === '1') {
          expect(timeline[0].previousElementSibling, 'terminy tuż przed osią').toBe(booking[0]);
        }
      } else {
        expect(timeline).toHaveLength(0);
        if (combo.booking === '1') {
          expect(box!.lastElementChild, 'bez osi terminy na końcu').toBe(booking[0]);
        }
      }
      unmount();
    });
  }
});
