// MIX-1815 r3: ekran wyniku Z11 (VITE_MM_RESULT_CONTACT=1) przeniesiony na integracja z nowym
// wyglądem (MIX-1867/MIX-1937, VITE_MM_CALC_NEW_UI), terminami (MIX-1814, VITE_MM_BOOKING_EMBED) i osią
// czasu (MIX-1816, VITE_MM_NEW_CLIENT_TIMELINE). Osiem kombinacji przy VITE_MM_LEAD_CONFIG=1:
// - zawsze nagłówek „Twój projekt: X – Y zł netto”, tekst P4, „Umów rozmowę” z konfiguracją w stanie
//   historii i hak ciasteczek na przyciskach wyniku;
// - nowy wygląd: pigułka #4D4B9F z ikoną SVG (MIX-1937), przyciski min-h-12 (48 px), fokus na
//   nagłówku; stary wygląd: przyciski min-h-11 (44 px) jak w r2;
// - terminy i oś czasu jak w MIX-1897: wewnątrz ekranu wyniku, oś ostatnia, terminy tuż przed osią.
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
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
vi.mock('../../../utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../utils/analytics')>()),
  trackEvent: () => {},
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
import { readHandoff } from './calculatorHandoff';

// Strona kontaktu = sonda: stan historii (konfiguracja) wypisany jako JSON.
const ContactProbe: React.FC = () => (
  <pre data-testid="contact-state">{JSON.stringify(useLocation().state ?? null)}</pre>
);
// Twarde spacje (kwoty, &nbsp;) jako zwykłe, żeby porównać tekst.
const flat = (s: string | null | undefined) => (s ?? '').replace(/\s/g, ' ');

async function reachResult() {
  const view = render(
    <MemoryRouter initialEntries={['/wycena/']}>
      <Routes>
        <Route path="/wycena/" element={<PublicCalculator />} />
        <Route path="/contact/" element={<ContactProbe />} />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByText('Jaki jest cel projektu?');
  fireEvent.click(screen.getByRole('radio', { name: /Sklep/ }));
  fireEvent.click(screen.getByRole('button', { name: /Dalej/ }));
  fireEvent.change(screen.getByLabelText('Twój e-mail'), { target: { value: 'jan@firma.pl' } });
  fireEvent.click(screen.getByRole('button', { name: 'Wyślij i umów rozmowę' }));
  await screen.findByTestId('calc-result-actions');
  return view;
}

beforeEach(() => {
  for (const f of ['VITE_MM_CONFIG_LINK', 'VITE_MM_CONFIG_PREVIEW', 'VITE_MM_LIVE_PRICE_BAR'])
    vi.stubEnv(f, '');
  vi.stubEnv('VITE_MM_LEAD_CONFIG', '1');
  vi.stubEnv('VITE_MM_RESULT_CONTACT', '1');
  submitPublicQuote.mockReset();
  submitPublicQuote.mockResolvedValue({
    ok: true,
    result: { priceRange: { min: 27500, max: 53000 } },
  });
});
afterEach(() => {
  vi.unstubAllEnvs();
  delete document.body.dataset.resultCookie;
  delete document.body.dataset.formCookie;
});
vi.setConfig({ testTimeout: 30_000 });

const COMBOS = ['', '1'].flatMap((ui) =>
  ['', '1'].flatMap((timeline) => ['', '1'].map((booking) => ({ ui, timeline, booking }))),
);
const cls = (el: Element) => (el.getAttribute('class') ?? '').split(/\s+/);

describe('MIX-1815 r3: Z11 × nowy wygląd × terminy × oś czasu (8 kombinacji)', () => {
  it('lista kombinacji jest pełna (2^3)', () => {
    expect(new Set(COMBOS.map((c) => JSON.stringify(c))).size).toBe(8);
  });
  for (const combo of COMBOS) {
    const name = `wygląd=${combo.ui || 'stary'}, oś=${combo.timeline || 'pusta'}, terminy=${combo.booking || 'puste'}`;
    it(name, async () => {
      vi.stubEnv('VITE_MM_CALC_NEW_UI', combo.ui);
      vi.stubEnv('VITE_MM_NEW_CLIENT_TIMELINE', combo.timeline);
      vi.stubEnv('VITE_MM_BOOKING_EMBED', combo.booking);
      const { unmount } = await reachResult();

      const box = screen.getByTestId('calc-result');
      const h = within(box).getByRole('heading', { level: 2, name: /Twój projekt:/ });
      expect(flat(h.textContent)).toBe('Twój projekt: 27 500 – 53 000 zł netto');
      expect(box.textContent).toContain('Dokładną cenę podamy po 20-minutowej');
      expect(screen.queryByText(/orientacyjne widełki/i)).toBeNull();

      const actions = screen.getByTestId('calc-result-actions');
      const link = within(actions).getByRole('link', { name: 'Umów rozmowę' });
      const again = within(actions).getByRole('button', { name: 'Policz jeszcze raz' });
      expect(link.getAttribute('href')).toBe('/contact/');
      if (combo.ui === '1') {
        // MIX-1937: pigułka jednolita (axe liczy kontrast), strzałka = SVG, nie znak tekstu.
        expect(cls(link)).toContain('bg-[#4D4B9F]');
        expect(cls(link).join(' ')).not.toMatch(/gradient|from-/);
        expect(link.querySelector('svg')).not.toBeNull();
        expect(link.textContent).toBe('Umów rozmowę');
        for (const el of [link, again]) expect(cls(el)).toContain('min-h-12');
        expect(document.activeElement).toBe(h);
        // Tekst Z11 na granacie ≥ text-white/75 (terminy i oś czasu to osobne komponenty).
        const own = [...box.children].filter(
          (el) =>
            !['booking-embed', 'new-client-timeline'].includes(el.getAttribute('data-testid')!),
        );
        expect(own.length).toBe(4);
        for (const el of own) expect(el.outerHTML).not.toMatch(/text-gray-[34]00/);
        const alphas = own.flatMap((el) =>
          [...el.outerHTML.matchAll(/text-white\/(\d+)/g)].map((m) => Number(m[1])),
        );
        expect(alphas.length).toBeGreaterThan(0);
        for (const a of alphas) expect(a).toBeGreaterThanOrEqual(75);
      } else {
        for (const el of [link, again]) expect(cls(el)).toContain('min-h-11');
        expect(link.querySelector('svg')).toBeNull();
      }

      const booking = screen.queryAllByTestId('booking-embed');
      const timeline = screen.queryAllByTestId('new-client-timeline');
      if (combo.booking === '1') {
        expect(booking).toHaveLength(1);
        expect(booking[0].parentElement).toBe(box);
      } else expect(booking).toHaveLength(0);
      if (combo.timeline === '1') {
        expect(timeline).toHaveLength(1);
        expect(box.lastElementChild, 'oś czasu na końcu ekranu wyniku').toBe(timeline[0]);
        if (combo.booking === '1') expect(timeline[0].previousElementSibling).toBe(booking[0]);
      } else {
        expect(timeline).toHaveLength(0);
        if (combo.booking === '1') expect(box.lastElementChild).toBe(booking[0]);
      }

      fireEvent.click(link);
      const state = await screen.findByTestId('contact-state');
      const handoff = readHandoff(JSON.parse(state.textContent ?? 'null'));
      expect(handoff?.email).toBe('jan@firma.pl');
      expect(flat(handoff?.text)).toContain('Jaki jest cel projektu?');
      expect(flat(handoff?.text)).toContain('Sklep');
      expect(flat(handoff?.text)).toContain('27 500 – 53 000 zł netto');
      unmount();
    });
  }
});

describe('MIX-1815 r3: formularz w nowym wyglądzie', () => {
  it('otoczka pomiaru obejmuje opcje, e-mail i przycisk wysyłki (LEAD_CONFIG)', async () => {
    vi.stubEnv('VITE_MM_CALC_NEW_UI', '1');
    render(
      <MemoryRouter>
        <PublicCalculator />
      </MemoryRouter>,
    );
    await screen.findByText('Jaki jest cel projektu?');
    const formBox = screen.getByTestId('calc-form-box');
    expect(within(formBox).getByRole('radio', { name: /Sklep/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /Sklep/ }));
    fireEvent.click(screen.getByRole('button', { name: /Dalej/ }));
    await waitFor(() => expect(within(formBox).getByLabelText('Twój e-mail')).toBeInTheDocument());
    expect(within(formBox).getByRole('button', { name: 'Wyślij i umów rozmowę' })).toBeTruthy();
  });

  it('przełącznik wyłączony, nowy wygląd: wynik i formularz jak na integracja', async () => {
    vi.stubEnv('VITE_MM_RESULT_CONTACT', '');
    vi.stubEnv('VITE_MM_CALC_NEW_UI', '1');
    render(
      <MemoryRouter>
        <PublicCalculator />
      </MemoryRouter>,
    );
    await screen.findByText('Jaki jest cel projektu?');
    expect(screen.queryByTestId('calc-form-box')).toBeNull();
    fireEvent.click(screen.getByRole('radio', { name: /Sklep/ }));
    fireEvent.click(screen.getByRole('button', { name: /Dalej/ }));
    fireEvent.change(screen.getByLabelText('Twój e-mail'), { target: { value: 'jan@firma.pl' } });
    fireEvent.click(screen.getByRole('button', { name: 'Wyślij i umów rozmowę' }));
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Twój projekt: orientacyjne widełki' }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('calc-result-actions')).toBeNull();
    expect(screen.getByTestId('calc-result').textContent).not.toContain('netto');
  });
});
