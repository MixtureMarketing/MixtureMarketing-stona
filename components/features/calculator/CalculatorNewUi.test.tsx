// MIX-1867: nowy wygląd kalkulatora /wycena/ za przełącznikiem VITE_MM_CALC_NEW_UI.
// Wyłączony = stary wygląd (bez paska postępu z rolą progressbar, bez kart pytań). Włączony = pasek
// postępu z nazwami kroków, karty pytań, cele dotyku ≥ 48 px, fokus na nagłówku kroku po Dalej/Wstecz,
// stany ładowania/błędu, osobny komunikat o niedziałającym zabezpieczeniu, ekran wyniku z fokusem.
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
import CalculatorForm from './CalculatorForm';
import { CAPTCHA_START_ERROR, isCalcNewUiEnabled } from './calcUi';

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

describe('MIX-1867 przełącznik VITE_MM_CALC_NEW_UI', () => {
  it('włącza tylko 1 albo true', () => {
    expect(isCalcNewUiEnabled('1')).toBe(true);
    expect(isCalcNewUiEnabled('true')).toBe(true);
    for (const v of ['', null, '0', 'TRUE', 'yes', 1]) expect(isCalcNewUiEnabled(v)).toBe(false);
    vi.stubEnv('VITE_MM_CALC_NEW_UI', '');
    expect(isCalcNewUiEnabled()).toBe(false);
  });

  it('wyłączony (pusty, jak na produkcji): stary wygląd, bez paska postępu i kart pytań', async () => {
    vi.stubEnv('VITE_MM_CALC_NEW_UI', '');
    const { container } = renderCalc();
    await screen.findByText('Jaki jest cel projektu?');
    expect(container.querySelector('[data-calc-ui]')).toHaveAttribute('data-calc-ui', 'old');
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.queryByTestId('calc-question')).toBeNull();
    expect(screen.getByText(/Krok 1 z 3/)).toBeInTheDocument();
    // Stary cel dotyku opcji (MIX-1412) bez zmian.
    expect(screen.getByRole('radio', { name: 'Sklep' }).className.split(/\s+/)).toContain(
      'min-h-11',
    );
  });

  it('wyłączony: błąd zabezpieczenia pokazuje stary komunikat 403, bez nowego', async () => {
    vi.stubEnv('VITE_MM_CALC_NEW_UI', '');
    token = '';
    renderCalc();
    await fillAndSubmit();
    expect(
      await screen.findByText(
        'Weryfikacja antybotowa nie przeszła. Odśwież stronę i spróbuj ponownie.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(CAPTCHA_START_ERROR)).toBeNull();
  });
});

describe('MIX-1867 nowy wygląd: kroki i pasek postępu', () => {
  it('pasek postępu: numer i nazwa kroku, wypełnienie, bieżący krok na liście', async () => {
    const { container } = renderCalc();
    await screen.findByText('Jaki jest cel projektu?');
    expect(container.querySelector('[data-calc-ui]')).toHaveAttribute('data-calc-ui', 'new');
    const bar = screen.getByRole('progressbar', { name: 'Postęp wyceny' });
    expect(bar).toHaveAttribute('aria-valuenow', '1');
    expect(bar).toHaveAttribute('aria-valuemax', '3');
    expect(bar).toHaveAttribute('aria-valuetext', 'Krok 1 z 3: Twój projekt');
    expect(screen.getByTestId('calc-progress-fill')).toHaveStyle({ width: '33%' });
    expect(screen.getByText('Krok 1 z 3')).toBeInTheDocument();
    const current = container.querySelector('[aria-current="step"]');
    expect(current).toHaveTextContent('Twój projekt');

    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    expect(bar).toHaveAttribute('aria-valuenow', '2');
    expect(bar).toHaveAttribute('aria-valuetext', 'Krok 2 z 3: Charakter projektu');
    expect(screen.getByTestId('calc-progress-fill')).toHaveStyle({ width: '67%' });
    expect(container.querySelector('[aria-current="step"]')).toHaveTextContent(
      'Charakter projektu',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    expect(bar).toHaveAttribute('aria-valuetext', 'Krok 3 z 3: Gdzie wysłać widełki');
    expect(screen.getByTestId('calc-progress-fill')).toHaveStyle({ width: '100%' });
  });

  it('klawiatura: Dalej/Wstecz przenoszą fokus na nagłówek nowego kroku; pierwszy render nie kradnie fokusu', async () => {
    renderCalc();
    await screen.findByText('Jaki jest cel projektu?');
    expect(document.activeElement).toBe(document.body);
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    expect(document.activeElement).toBe(
      screen.getByRole('heading', { level: 2, name: 'Charakter projektu' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Wstecz' }));
    expect(document.activeElement).toBe(
      screen.getByRole('heading', { level: 2, name: 'Twój projekt' }),
    );
  });

  it('klawiatura: wszystkie kontrolki kroku są w kolejności tabulacji (tylko honeypot poza nią)', async () => {
    const { container } = renderCalc();
    await screen.findByText('Jaki jest cel projektu?');
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    const skipped = [...container.querySelectorAll('button, input, a')].filter(
      (el) => el.getAttribute('tabindex') === '-1',
    );
    expect(skipped.map((el) => el.getAttribute('name'))).toEqual(['website_verify']);
  });

  it('błąd walidacji: karta pytania czerwona, fokus na opcji, opis = podpowiedź + błąd', async () => {
    renderCalc();
    await screen.findByText('Jaki jest cel projektu?');
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    fireEvent.change(screen.getByLabelText('Twój e-mail'), { target: { value: 'jan@firma.pl' } });
    fireEvent.click(screen.getByRole('button', { name: 'Poznaj widełki' }));
    await waitFor(() =>
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1'),
    );
    const card = screen.getByTestId('calc-question');
    expect(card).toHaveAttribute('data-invalid', 'true');
    const group = screen.getByRole('radiogroup', { name: 'Jaki jest cel projektu?' });
    expect(group).toHaveAttribute(
      'aria-describedby',
      'calc-q-project_goal-help calc-q-project_goal-err',
    );
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Sklep' })),
    );
    expect(submitPublicQuote).not.toHaveBeenCalled();
  });
});

describe('MIX-1867 nowy wygląd: pola i przyciski', () => {
  it('opcje i pola ≥ 48 px (min-h-12), znacznik wyboru, przyciski akcji jako pigułki', async () => {
    renderCalc();
    await screen.findByText('Jaki jest cel projektu?');
    const sklep = screen.getByRole('radio', { name: 'Sklep' });
    expect(sklep.className.split(/\s+/)).toContain('min-h-12');
    expect(sklep.querySelector('[data-mark]')).toHaveAttribute('data-mark', 'off');
    fireEvent.click(sklep);
    expect(sklep).toHaveAttribute('aria-checked', 'true');
    expect(sklep.querySelector('[data-mark]')).toHaveAttribute('data-mark', 'on');
    const dalej = screen.getByRole('button', { name: 'Dalej' });
    expect(dalej.className.split(/\s+/)).toEqual(
      expect.arrayContaining(['min-h-12', 'rounded-full']),
    );
    expect(screen.getByRole('button', { name: 'Wstecz' })).toBeDisabled();
    fireEvent.click(dalej);
    expect(
      screen.getByRole('spinbutton', { name: 'Ile wersji językowych?' }).className.split(/\s+/),
    ).toContain('min-h-12');
  });
});

describe('MIX-1867 nowy wygląd: stany', () => {
  it('ładowanie: szkielet z rolą status i aria-busy', async () => {
    let resolve: (q: PublicQuestion[]) => void = () => {};
    fetchQuestions = () => new Promise((r) => (resolve = r));
    renderCalc();
    const s = screen.getByTestId('calc-loading');
    expect(s).toHaveAttribute('role', 'status');
    expect(s).toHaveAttribute('aria-busy', 'true');
    expect(s).toHaveTextContent('Ładuję kalkulator…');
    resolve(QUESTIONS);
    await screen.findByText('Jaki jest cel projektu?');
    expect(screen.queryByTestId('calc-loading')).toBeNull();
  });

  it('błąd ładowania: komunikat w roli alert i przycisk Spróbuj ponownie', async () => {
    fetchQuestions = () => Promise.reject(new Error('net'));
    renderCalc();
    const e = await screen.findByTestId('calc-load-error');
    expect(e).toHaveAttribute('role', 'alert');
    expect(screen.getByRole('button', { name: 'Spróbuj ponownie' }).className).toContain(
      'rounded-full',
    );
  });

  it('brak tokenu zabezpieczenia: „Nie udało się uruchomić zabezpieczenia, odśwież stronę”, bez wysyłki', async () => {
    token = '';
    renderCalc();
    await fillAndSubmit();
    const alert = await screen.findByTestId('calc-captcha-error');
    expect(alert).toHaveAttribute('role', 'alert');
    expect(alert).toHaveTextContent('Nie udało się uruchomić zabezpieczenia, odśwież stronę');
    expect(screen.getByRole('button', { name: 'Odśwież stronę' })).toBeInTheDocument();
    expect(submitPublicQuote).not.toHaveBeenCalled();
  });

  it('błąd serwera: zwykły komunikat, nie komunikat o zabezpieczeniu', async () => {
    submitPublicQuote.mockResolvedValue({ ok: false, status: 500 });
    renderCalc();
    await fillAndSubmit();
    expect(
      await screen.findByText('Coś poszło nie tak po naszej stronie. Spróbuj ponownie za chwilę.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('calc-captcha-error')).toBeNull();
  });

  it('przycisk „Odśwież stronę” woła odświeżenie', () => {
    const onReload = vi.fn();
    render(
      <CalculatorForm
        visible={[]}
        answers={{}}
        setAnswer={() => {}}
        errors={{}}
        email=""
        setEmail={() => {}}
        websiteVerify=""
        setWebsiteVerify={() => {}}
        submitError="x"
        submitErrorKind="captcha"
        submitting={false}
        onSubmit={() => {}}
        newUi
        onReload={onReload}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Odśwież stronę' }));
    expect(onReload).toHaveBeenCalledTimes(1);
  });
});

describe('MIX-1867 nowy wygląd: ekran wyniku', () => {
  it('widełki z tym samym zapisem co pasek ceny, fokus na nagłówku, CTA do kontaktu', async () => {
    renderCalc();
    await fillAndSubmit();
    const head = await screen.findByRole('heading', {
      level: 2,
      name: 'Twój projekt: orientacyjne widełki',
    });
    expect(document.activeElement).toBe(head);
    const fmt = (n: number) => new Intl.NumberFormat('pl-PL').format(n);
    const nb = String.fromCharCode(160); // twarda spacja, jak w CalculatorResult i LivePriceBar
    expect(screen.getByTestId('calc-result').textContent).toContain(
      `${fmt(12000)}${nb}–${nb}${fmt(18000)}${nb}zł`,
    );
    expect(screen.getByRole('link', { name: 'Umów rozmowę' })).toHaveAttribute('href', '/contact/');
    // Kontrakt API bez zmian: te same pola wysyłki.
    expect(Object.keys(submitPublicQuote.mock.calls[0][0]).sort()).toEqual([
      'answers',
      'captcha_token',
      'email',
      'website_verify',
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Policz jeszcze raz' }));
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
