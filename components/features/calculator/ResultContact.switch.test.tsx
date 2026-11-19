// MIX-1815 (Z11): ekran wyniku za przełącznikiem VITE_MM_RESULT_CONTACT.
// K1 włączony: treści P4 (pytania i wynik „netto”), przyciski wyniku min-h-11 (44 px), hak ciasteczek
//    na przyciskach wyniku, „Umów rozmowę” przenosi konfigurację do formularza /contact/ (ramka,
//    e-mail w kroku 1, wiadomość w kroku 3 i w treści wysłanej do leadService).
// K2 wyłączony: wynik, pytania i /contact/ jak dziś (bez konfiguracji, nawet gdy stan ją niesie).
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import type { PublicQuestion } from '../../../services/calculatorService';

const QUESTIONS: PublicQuestion[] = [
  {
    code: 'project_goal',
    text: 'Jaki jest cel projektu?',
    help_text: null,
    answer_type: 'select',
    options: [
      { value: 'sklep', label: 'Sklep internetowy' },
      { value: 'portal', label: 'Portal' },
    ],
    visible_if: null,
    group: 'projekt',
    sort_order: 0,
  },
  {
    code: 'views_count',
    text: 'Ile unikalnych podstron/widoków?',
    help_text: null,
    answer_type: 'number',
    options: null,
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
vi.mock('../../../services/leadService', () => ({
  leadService: { createLead: vi.fn(), updateLead: vi.fn(), sendNotification: vi.fn() },
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
import ContactPage from '../../pages/ContactPage';
import { ModalProvider } from '../../../context/ModalContext';
import { leadService } from '../../../services/leadService';
import { handoffState, HANDOFF_VERSION, P4_TEXTS } from './calculatorHandoff';
import { isResultContactEnabled } from './livePrice';

const FLAGS = [
  'VITE_MM_CONFIG_LINK',
  'VITE_MM_CONFIG_PREVIEW',
  'VITE_MM_LIVE_PRICE_BAR',
  'VITE_MM_RESULT_CONTACT',
];

const renderApp = (initial: Parameters<typeof MemoryRouter>[0]['initialEntries'] = ['/wycena/']) =>
  render(
    <HelmetProvider>
      <ModalProvider>
        <MemoryRouter initialEntries={initial}>
          <Routes>
            <Route path="/wycena/" element={<PublicCalculator />} />
            <Route path="/contact/" element={<ContactPage />} />
          </Routes>
        </MemoryRouter>
      </ModalProvider>
    </HelmetProvider>,
  );

const toResult = async () => {
  const view = renderApp();
  await toResultFromForm();
  return view;
};

const toResultFromForm = async () => {
  await screen.findByText('Jaki jest cel projektu?');
  fireEvent.click(screen.getByRole('radio', { name: 'Portal' }));
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '6' } });
  fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
  fireEvent.change(await screen.findByLabelText('Twój e-mail'), {
    target: { value: 'jan@firma.pl' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Poznaj widełki' }));
  await waitFor(() => expect(submitPublicQuote).toHaveBeenCalledTimes(1));
};

beforeEach(() => {
  for (const f of FLAGS) vi.stubEnv(f, '');
  submitPublicQuote.mockReset();
  submitPublicQuote.mockResolvedValue({
    ok: true,
    result: { priceRange: { min: 27500, max: 53000 }, currency: 'PLN', status: 'ok' },
  });
  (leadService.createLead as Mock).mockReset().mockResolvedValue({ id: 'lead-1' });
  (leadService.updateLead as Mock).mockReset().mockResolvedValue(undefined);
  (leadService.sendNotification as Mock).mockReset().mockResolvedValue(undefined);
});
afterEach(() => {
  vi.unstubAllEnvs();
  delete document.body.dataset.resultCookie;
  delete document.body.dataset.formCookie;
});

// MIX-1815 r2: przycisk ciasteczek nad opcją formularza. Blok formularza (calc-form-box) zawsze
// nachodzi na przycisk; kontrolki tylko wtedy, gdy `overOption` = true (opcja „Portal”).
const COOKIE = { left: 10, right: 60, top: 700, bottom: 750, width: 50, height: 50 } as DOMRect;
const FAR = { left: 0, right: 390, top: 0, bottom: 40, width: 390, height: 40 } as DOMRect;
const withCookieOverForm = (overOption: () => boolean) => {
  const btn = document.createElement('button');
  btn.className = 'cookie-floating-btn';
  document.body.appendChild(btn);
  const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this === btn) return COOKIE;
    if (this.dataset.testid === 'calc-form-box')
      return { left: 0, right: 390, top: 0, bottom: 2000, width: 390, height: 2000 } as DOMRect;
    if (
      overOption() &&
      this.getAttribute('role') === 'radio' &&
      this.textContent?.includes('Portal')
    )
      return { left: 0, right: 390, top: 690, bottom: 740, width: 390, height: 50 } as DOMRect;
    return FAR;
  });
  return () => {
    spy.mockRestore();
    btn.remove();
  };
};

describe('K1 przełącznik włączony', () => {
  beforeEach(() => vi.stubEnv('VITE_MM_RESULT_CONTACT', '1'));

  it('pytanie views_count ma tekst P4', async () => {
    renderApp();
    expect(await screen.findByText(P4_TEXTS.views_count)).toBeInTheDocument();
    expect(screen.queryByText('Ile unikalnych podstron/widoków?')).toBeNull();
  });

  it('wynik: nagłówek netto, tekst P4, przyciski min-h-11', async () => {
    await toResult();
    const h = await screen.findByRole('heading', { name: /Twój projekt:/ });
    expect(h.textContent).toBe('Twój projekt: 27 500 – 53 000 zł netto');
    expect(
      screen.getByText(
        'To orientacja z naszego modelu wyceny, nie oferta. Dokładną cenę podamy po 20-minutowej rozmowie.',
      ),
    ).toBeInTheDocument();
    const actions = screen.getByTestId('calc-result-actions');
    const els = [
      within(actions).getByRole('link', { name: 'Umów rozmowę' }),
      within(actions).getByRole('button', { name: 'Policz jeszcze raz' }),
    ];
    for (const el of els) expect(el.className.split(/\s+/)).toContain('min-h-11');
  });

  it('przycisk ciasteczek nad przyciskami wyniku: body dostaje data-result-cookie', async () => {
    const btn = document.createElement('button');
    btn.className = 'cookie-floating-btn';
    btn.getBoundingClientRect = () =>
      ({ left: 10, right: 60, top: 700, bottom: 750, width: 50, height: 50 }) as DOMRect;
    document.body.appendChild(btn);
    const spy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this === btn)
          return { left: 10, right: 60, top: 700, bottom: 750, width: 50, height: 50 } as DOMRect;
        return { left: 0, right: 390, top: 680, bottom: 800, width: 390, height: 120 } as DOMRect;
      });
    try {
      await toResult();
      await screen.findByTestId('calc-result-actions');
      expect(document.body.dataset.resultCookie).toBe('true');
      fireEvent.click(screen.getByRole('button', { name: 'Policz jeszcze raz' }));
      await waitFor(() => expect(screen.queryByTestId('calc-result-actions')).toBeNull());
      expect(document.body.dataset.resultCookie).toBeUndefined();
    } finally {
      spy.mockRestore();
      btn.remove();
    }
  });

  it('r2: przycisk ciasteczek nad opcją formularza: body dostaje data-form-cookie, nad pustym miejscem nie', async () => {
    let over = false;
    const restore = withCookieOverForm(() => over);
    try {
      renderApp();
      await screen.findByText('Jaki jest cel projektu?');
      // Blok formularza nachodzi na przycisk, ale żadna kontrolka: przycisk zostaje widoczny.
      expect(document.body.dataset.formCookie).toBeUndefined();
      over = true;
      window.dispatchEvent(new Event('resize'));
      await waitFor(() => expect(document.body.dataset.formCookie).toBe('true'));
      over = false;
      window.dispatchEvent(new Event('scroll'));
      await waitFor(() => expect(document.body.dataset.formCookie).toBeUndefined());
    } finally {
      restore();
    }
  });

  it('r2: po wyniku znacznik formularza znika', async () => {
    const restore = withCookieOverForm(() => true);
    try {
      renderApp();
      await screen.findByText('Jaki jest cel projektu?');
      await waitFor(() => expect(document.body.dataset.formCookie).toBe('true'));
    } finally {
      restore();
    }
    await toResultFromForm();
    await screen.findByTestId('calc-result-actions');
    expect(document.body.dataset.formCookie).toBeUndefined();
  });

  it('r2: „Umów rozmowę” prowadzi na /contact/ bez parametrów i bez e-maila w adresie', async () => {
    await toResult();
    const link = await screen.findByRole('link', { name: 'Umów rozmowę' });
    expect(link.getAttribute('href')).toBe('/contact/');
    expect(link.getAttribute('href')).not.toContain('firma.pl');
  });

  it('r2: tekst konfiguracji z HTML trafia do ramki jako tekst, bez elementów', async () => {
    const text = 'Cel <img src=x onerror=alert(1)><b>gruby</b>';
    const state = handoffState({ v: HANDOFF_VERSION, text, email: '' });
    renderApp([{ pathname: '/contact/', state }]);
    const box = await screen.findByTestId('contact-calculator-config');
    expect(box.textContent).toContain(text);
    expect(box.querySelector('img, b')).toBeNull();
  });

  it('„Umów rozmowę” przenosi konfigurację do formularza kontaktu i do wysłanej wiadomości', async () => {
    await toResult();
    fireEvent.click(await screen.findByRole('link', { name: 'Umów rozmowę' }));
    const box = await screen.findByTestId('contact-calculator-config');
    expect(box.textContent).toContain('Widełki: 27 500 – 53 000 zł netto');
    expect(box.textContent).toContain('- Jaki jest cel projektu? Portal');
    expect(box.textContent).toContain(`- ${P4_TEXTS.views_count} 6`);
    expect(box.textContent).not.toContain('portal');
    // Krok 1: e-mail z kalkulatora.
    expect(screen.getByLabelText(/Email/i)).toHaveValue('jan@firma.pl');
    fireEvent.change(screen.getByLabelText(/Imię i Nazwisko/i), { target: { value: 'Jan Nowak' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText(/Zapisz i przejdź dalej/i));
    await waitFor(() => expect(leadService.createLead).toHaveBeenCalledTimes(1));
    fireEvent.click(await screen.findByRole('button', { name: /^Dalej/ }));
    // Krok 3: wiadomość = konfiguracja.
    const msg = (await screen.findByLabelText(/Opisz swój cel/i)) as HTMLTextAreaElement;
    expect(msg.value).toContain('Konfiguracja z kalkulatora wyceny (/wycena/):');
    expect(msg.value).toContain('- Jaki jest cel projektu? Portal');
    fireEvent.click(screen.getByRole('button', { name: /Wyślij zgłoszenie/ }));
    await waitFor(() => expect(leadService.sendNotification).toHaveBeenCalledTimes(1));
    const step3 = (leadService.updateLead as Mock).mock.calls.find((c) => c[2] === 3);
    expect(step3?.[1].message).toContain('Widełki: 27 500 – 53 000 zł netto');
    expect(step3?.[1].message).toContain('- Jaki jest cel projektu? Portal');
  }, 30_000);

  it('/contact/ bez stanu albo ze złym stanem: brak ramki, puste pola', async () => {
    for (const state of [
      undefined,
      { calculatorConfig: { v: 2, text: 'x', email: '' } },
      { calculatorConfig: { v: HANDOFF_VERSION, text: 'x'.repeat(1501), email: '' } },
      { calculatorConfig: [] },
    ]) {
      const { unmount } = renderApp([{ pathname: '/contact/', state }]);
      await screen.findByLabelText(/Imię i Nazwisko/i);
      expect(screen.queryByTestId('contact-calculator-config')).toBeNull();
      expect(screen.getByLabelText(/Email/i)).toHaveValue('');
      unmount();
    }
  });
});

describe('K2 przełącznik wyłączony: jak dziś', () => {
  it('pytania z D1, wynik bez „netto” i bez min-h-11, /contact/ bez konfiguracji', async () => {
    await toResult();
    expect(screen.queryByRole('heading', { name: /Twój projekt:/ })).toBeNull();
    expect(await screen.findByText('Orientacyjne widełki')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Umów rozmowę' });
    expect(link.className.split(/\s+/)).not.toContain('min-h-11');
    fireEvent.click(link);
    await screen.findByLabelText(/Imię i Nazwisko/i);
    expect(screen.queryByTestId('contact-calculator-config')).toBeNull();
    expect(screen.getByLabelText(/Email/i)).toHaveValue('');
  });

  it('stan z konfiguracją nie jest czytany przy wyłączonym przełączniku', async () => {
    const state = handoffState({ v: HANDOFF_VERSION, text: 'Konfiguracja X', email: 'a@b.pl' });
    renderApp([{ pathname: '/contact/', state }]);
    await screen.findByLabelText(/Imię i Nazwisko/i);
    expect(screen.queryByTestId('contact-calculator-config')).toBeNull();
    expect(screen.getByLabelText(/Email/i)).toHaveValue('');
  });

  it('r2: przycisk ciasteczek nad opcją: bez znacznika formularza przy wyłączonym przełączniku', async () => {
    const restore = withCookieOverForm(() => true);
    try {
      renderApp();
      await screen.findByText('Jaki jest cel projektu?');
      window.dispatchEvent(new Event('resize'));
      await new Promise((r) => setTimeout(r, 50));
      expect(document.body.dataset.formCookie).toBeUndefined();
    } finally {
      restore();
    }
  });

  it('r2: zmienna VITE_MM_RESULT_CONTACT nieustawiona = przełącznik wyłączony', () => {
    vi.stubEnv('VITE_MM_RESULT_CONTACT', undefined);
    expect(isResultContactEnabled()).toBe(false);
  });

  it('pytanie views_count ma tekst z D1', async () => {
    renderApp();
    expect(await screen.findByText('Ile unikalnych podstron/widoków?')).toBeInTheDocument();
  });
});

describe('reguła CSS dla znacznika wyniku', () => {
  it('r2: index.css chowa .cookie-floating-btn przy data-form-cookie w tej samej regule', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const css = fs.readFileSync(
      path.join(path.dirname(new URL(import.meta.url).pathname), '../../../index.css'),
      'utf8',
    );
    const m = css.match(/body\[data-form-cookie='true'\]\s+\.cookie-floating-btn,[^{]*\{([^}]*)\}/);
    expect(m).not.toBeNull();
    expect(m![1]).toMatch(/visibility:\s*hidden/);
    expect(m![1]).toMatch(/pointer-events:\s*none/);
  });

  it('index.css chowa .cookie-floating-btn przy data-result-cookie (visibility, pointer-events)', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const css = fs.readFileSync(
      path.join(path.dirname(new URL(import.meta.url).pathname), '../../../index.css'),
      'utf8',
    );
    const m = css.match(
      /body\[data-result-cookie='true'\]\s+\.cookie-floating-btn,[^{]*\{([^}]*)\}/,
    );
    expect(m).not.toBeNull();
    expect(m![1]).toMatch(/visibility:\s*hidden/);
    expect(m![1]).toMatch(/pointer-events:\s*none/);
  });
});
