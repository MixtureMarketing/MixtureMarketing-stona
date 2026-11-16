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
import {
  CAPTCHA_START_ERROR,
  NEW_UI_CONTRAST,
  NEW_UI_SHELL,
  isCalcNewUiEnabled,
} from './calcUi';

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
  it('włącza tylko 1 (MIX-1846: true już nie włącza)', () => {
    expect(isCalcNewUiEnabled('1')).toBe(true);
    for (const v of ['', null, '0', 'true', 'TRUE', 'yes', 1])
      expect(isCalcNewUiEnabled(v)).toBe(false);
    vi.stubEnv('VITE_MM_CALC_NEW_UI', '');
    expect(isCalcNewUiEnabled()).toBe(false);
  });

  it('wyłączony (pusty, jak na produkcji): stary wygląd, bez paska postępu i kart pytań', async () => {
    vi.stubEnv('VITE_MM_CALC_NEW_UI', '');
    const { container } = renderCalc();
    await screen.findByText('Jaki jest cel projektu?');
    // Stary DOM bez zmian (migawka MIX-847 w tests/components/RodoZgoda.test.tsx).
    expect(container.querySelector('[data-calc-ui]')).toBeNull();
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
  it('nowy wygląd: kontener podnosi kontrast szarych tekstów (AA na granacie), stary nie', async () => {
    const { container, unmount } = renderCalc();
    await screen.findByText('Jaki jest cel projektu?');
    const box = container.querySelector('[data-calc-ui="new"]')!;
    for (const c of NEW_UI_CONTRAST.split(' ')) expect(box.classList).toContain(c);
    unmount();
    vi.stubEnv('VITE_MM_CALC_NEW_UI', '');
    const old = renderCalc();
    await screen.findByText('Jaki jest cel projektu?');
    expect(old.container.innerHTML).not.toContain('text-white/75');
  });
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

// MIX-1894 (uwaga Jakuba „za dużo zagłębień bloczków”): jedyna ramka wokół odpowiedzi to karta
// kroku; na telefonie (< 640 px) karta bez ramki, z odstępem 16 px i tłem na całą szerokość.
const tokens = (el: Element) => (el.getAttribute('class') || '').split(/\s+/).filter(Boolean);
/** Klasa rysująca ramkę albo tło bloczka (bez wariantów stanu: hover/focus/aria/group). */
const FRAME = /^(?:(?:sm|md|lg):)?(?:border(?:-[trblxy])?|bg-(?:white|primary|red-500)\/.+|rounded-(?:xl|2xl|3xl))$/;
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
    const head = await screen.findByRole('heading', { name: 'Twój projekt: orientacyjne widełki' });
    const shell = container.querySelector('[data-calc-ui="new"]')!;
    expect(framesBetween(head, shell)).toEqual([]);
    const res = screen.getByTestId('calc-result');
    expect(res.querySelectorAll('[class*="border-primary"], [class*="bg-primary/"]').length).toBe(0);
  });

  it('ładowanie: szkielet bez ramki pytania', () => {
    fetchQuestions = () => new Promise(() => {});
    const { container } = renderCalc();
    const s = screen.getByTestId('calc-loading');
    const shell = container.querySelector('[data-calc-ui="new"]')!;
    const framed = [...s.querySelectorAll('*')].filter((e) =>
      tokens(e).some((x) => /^(?:border|rounded-2xl)$/.test(x)) && e.children.length > 0,
    );
    expect(framed).toEqual([]);
    expect(shell.contains(s)).toBe(true);
  });
});
