import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PublicQuestion } from '../../services/calculatorService';
import { RODO_KLAUZULA_CONTENT } from '../../data/content';
import { SITE_CONFIG } from '../../config/site';
import { isRodoKlauzulaEnabled } from '../../config/flags';
import InlineContactForm from '../../components/features/contact/InlineContactForm';
import ContactModal from '../../components/features/ContactModal';
import PublicCalculator from '../../components/features/calculator/PublicCalculator';
import PrivacyPolicy from '../../components/pages/PrivacyPolicy';
import { ModalProvider } from '../../context/ModalContext';
import { ContactType } from '../../types';

// MIX-844: klauzula RODO pod formularzami, ukryta za VITE_RODO_KLAUZULA (domyślnie wyłączona).

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

vi.mock('../../services/calculatorService', () => ({
  fetchPublicQuestions: () => Promise.resolve(QUESTIONS),
  submitPublicQuote: vi.fn(),
}));

vi.mock('../../services/leadService', () => ({
  leadService: { createLead: vi.fn(), updateLead: vi.fn(), sendNotification: vi.fn() },
}));

vi.mock('../../components/features/contact/TurnstileWidget', async () => {
  const R = await import('react');
  const W = R.forwardRef<unknown, unknown>((_p, ref) => {
    R.useImperativeHandle(ref, () => ({
      getToken: () => Promise.resolve('tok'),
      reset: () => undefined,
      prepare: () => undefined,
    }));
    return null;
  });
  W.displayName = 'TurnstileWidgetMock';
  return { default: W };
});

vi.mock('../../utils/turnstile', () => ({
  renderInvisibleTurnstile: vi.fn(),
  getTurnstileToken: vi.fn(),
  removeTurnstile: vi.fn(),
}));

vi.mock('../../components/common/Seo', () => ({ default: () => null }));

const FRAGMENT_KONTAKT = 'Dane z formularza przetwarzamy';
const FRAGMENT_KALKULATOR = 'Dane z kalkulatora przetwarzamy';
const FRAGMENT_PELNA = 'Informacja o przetwarzaniu danych osobowych z formularza kontaktowego';

const renderInline = () =>
  render(
    <ModalProvider>
      <InlineContactForm />
    </ModalProvider>,
  );

const renderModal = () =>
  render(
    <ModalProvider>
      <ContactModal isOpen onClose={vi.fn()} type={'web' as ContactType} />
    </ModalProvider>,
  );

const renderCalcOnContactStep = async () => {
  render(
    <MemoryRouter>
      <PublicCalculator />
    </MemoryRouter>,
  );
  await screen.findByText('Jaki jest cel projektu?');
  fireEvent.click(screen.getByRole('radio', { name: 'Sklep' }));
  fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
  await screen.findByLabelText('Twój e-mail');
};

const renderPolicy = () =>
  render(
    <MemoryRouter>
      <PrivacyPolicy />
    </MemoryRouter>,
  );

describe('RODO klauzula: flaga wyłączona (domyślnie)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_RODO_KLAUZULA', '');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('flaga jest domyślnie wyłączona, także gdy zmienna nie jest ustawiona', () => {
    expect(isRodoKlauzulaEnabled()).toBe(false);
    vi.stubEnv('VITE_RODO_KLAUZULA', 'true');
    expect(isRodoKlauzulaEnabled()).toBe(false);
    vi.stubEnv('VITE_RODO_KLAUZULA', '0');
    expect(isRodoKlauzulaEnabled()).toBe(false);
    vi.stubEnv('VITE_RODO_KLAUZULA', '1');
    expect(isRodoKlauzulaEnabled()).toBe(true);
  });

  it('formularz kontaktowy (inline) bez klauzuli', () => {
    renderInline();
    expect(screen.queryByText(new RegExp(FRAGMENT_KONTAKT))).toBeNull();
    expect(screen.queryByTestId('rodo-klauzula-krotka')).toBeNull();
    expect(screen.queryByRole('link', { name: RODO_KLAUZULA_CONTENT.linkLabel })).toBeNull();
  });

  it('modal kontaktowy bez klauzuli', () => {
    renderModal();
    expect(screen.queryByTestId('rodo-klauzula-krotka')).toBeNull();
    expect(screen.queryByText(new RegExp(FRAGMENT_KONTAKT))).toBeNull();
  });

  it('kalkulator bez klauzuli (krok kontaktowy)', async () => {
    await renderCalcOnContactStep();
    expect(screen.queryByTestId('rodo-klauzula-krotka')).toBeNull();
    expect(screen.queryByText(new RegExp(FRAGMENT_KALKULATOR))).toBeNull();
  });

  it('polityka prywatności bez pełnej klauzuli, reszta treści na miejscu', () => {
    const { container } = renderPolicy();
    expect(screen.getByText(/1\. Administrator Danych/)).toBeInTheDocument();
    expect(screen.queryByTestId('rodo-klauzula-pelna')).toBeNull();
    expect(screen.queryByText(new RegExp(FRAGMENT_PELNA))).toBeNull();
    expect(container.querySelector(`#${RODO_KLAUZULA_CONTENT.anchorId}`)).toBeNull();
  });
});

describe('RODO klauzula: flaga włączona', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_RODO_KLAUZULA', '1');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const expectLinkToFullClause = (scope: HTMLElement) => {
    const link = within(scope).getByRole('link', { name: RODO_KLAUZULA_CONTENT.linkLabel });
    expect(link).toHaveAttribute('href', `/privacy-policy/#${RODO_KLAUZULA_CONTENT.anchorId}`);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  };

  it('formularz kontaktowy: krótka klauzula pod przyciskiem, z odnośnikiem do pełnej', () => {
    renderInline();
    const short = screen.getByTestId('rodo-klauzula-krotka');
    expect(short).toHaveTextContent(FRAGMENT_KONTAKT);
    expect(short).toHaveTextContent('art. 6 ust. 1 lit. b RODO');
    expect(short).toHaveTextContent('lit. f RODO');
    expect(short).toHaveTextContent(SITE_CONFIG.companyName);
    expectLinkToFullClause(short);
    const button = screen.getByText(/Zapisz i przejdź dalej/i);
    expect(button.compareDocumentPosition(short) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('modal kontaktowy: krótka klauzula z odnośnikiem', () => {
    renderModal();
    const short = screen.getByTestId('rodo-klauzula-krotka');
    expect(short).toHaveTextContent(FRAGMENT_KONTAKT);
    expectLinkToFullClause(short);
  });

  it('kalkulator: krótka klauzula (wariant z wyceną) na kroku kontaktowym, nie na wcześniejszych', async () => {
    render(
      <MemoryRouter>
        <PublicCalculator />
      </MemoryRouter>,
    );
    await screen.findByText('Jaki jest cel projektu?');
    expect(screen.queryByTestId('rodo-klauzula-krotka')).toBeNull();
    fireEvent.click(screen.getByRole('radio', { name: 'Sklep' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    await screen.findByLabelText('Twój e-mail');
    const short = screen.getByTestId('rodo-klauzula-krotka');
    expect(short).toHaveTextContent(FRAGMENT_KALKULATOR);
    expect(short).toHaveTextContent('przygotować wycenę');
    expectLinkToFullClause(short);
  });

  it('polityka prywatności: pełna klauzula pod kotwicą z odnośników', async () => {
    const { container } = renderPolicy();
    const full = await screen.findByTestId('rodo-klauzula-pelna');
    expect(full.id).toBe(RODO_KLAUZULA_CONTENT.anchorId);
    expect(container.querySelector(`#${RODO_KLAUZULA_CONTENT.anchorId}`)).toBe(full);
    expect(full).toHaveTextContent(FRAGMENT_PELNA);
    // dane administratora z SITE_CONFIG
    expect(full).toHaveTextContent(SITE_CONFIG.contact.vatID);
    expect(full).toHaveTextContent(SITE_CONFIG.contact.email);
    expect(full).toHaveTextContent('Al. Józefa Piłsudskiego 17/4, 35-074 Rzeszów');
    // podstawy, retencja, odbiorcy, SCC, uwagi weryfikatora
    expect(full).toHaveTextContent('art. 6 ust. 1 lit. b RODO');
    expect(full).toHaveTextContent('art. 6 ust. 1 lit. f RODO');
    expect(full).toHaveTextContent('12 miesięcy od ostatniego kontaktu');
    expect(full).toHaveTextContent('Raport PDF z audytu strony przechowujemy 90 dni');
    expect(full).toHaveTextContent('Linear Orbit Inc.');
    expect(full).toHaveTextContent('Cloudflare, Inc.');
    expect(full).toHaveTextContent('Resend');
    expect(full).toHaveTextContent('standardowe klauzule umowne (SCC)');
    expect(full).toHaveTextContent('klucze liczników z adresem IP wygasają po godzinie');
    expect(full).not.toHaveTextContent('adres IP wygasa po godzinie');
    expect(full).toHaveTextContent(
      'Nie podejmujemy decyzji w sposób zautomatyzowany ani nie profilujemy.',
    );
  });

  it('w tekstach klauzuli nie ma niewypełnionych pól', () => {
    const strings: string[] = [];
    const collect = (v: unknown): void => {
      if (typeof v === 'string') strings.push(v);
      else if (Array.isArray(v)) v.forEach(collect);
      else if (v && typeof v === 'object') Object.values(v).forEach(collect);
    };
    collect(RODO_KLAUZULA_CONTENT);
    const all = strings.join('\n');
    expect(all).not.toMatch(/DO UZUPEŁNIENIA|do potwierdzenia|DO POTWIERDZENIA|do decyzji/i);
    expect(all).not.toMatch(/\[[^\]]*\]/);
    expect(all).not.toMatch(/undefined|null/);
  });

  it('odnośnik z krótkiej klauzuli prowadzi do istniejącej sekcji polityki', async () => {
    renderInline();
    const href = screen
      .getByRole('link', { name: RODO_KLAUZULA_CONTENT.linkLabel })
      .getAttribute('href')!;
    const anchor = href.split('#')[1];
    const { container } = renderPolicy();
    await waitFor(() => expect(container.querySelector(`#${anchor}`)).not.toBeNull());
  });
});
