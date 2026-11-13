import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { PublicQuestion } from '../../services/calculatorService';
import { PRIVACY_POLICY_CONTENT, RODO_KLAUZULA_CONTENT, TERMS_CONTENT } from '../../data/content';
import { SITE_CONFIG } from '../../config/site';
import { contactSchema, getContactSchema } from '../../types/validation';
import ContactStep1 from '../../components/features/contact/ContactStep1';
import InlineContactForm from '../../components/features/contact/InlineContactForm';
import PublicCalculator from '../../components/features/calculator/PublicCalculator';
import PrivacyPolicy from '../../components/pages/PrivacyPolicy';
import { ModalProvider } from '../../context/ModalContext';
import { leadService } from '../../services/leadService';
import type { ContactFormData } from '../../components/features/contact/types';

// MIX-847: przy fladze VITE_RODO_KLAUZULA=1 znika okienko zgody, a polityka (pkt 3) podaje okresy
// przechowywania. Przy fladze wyłączonej wszystko jak przed zmianą (m.in. migawki DOM).

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

const STARA_RETENCJA =
  'Dane kontaktowe przechowujemy przez okres trwania korespondencji, a następnie do czasu przedawnienia ewentualnych roszczeń (zazwyczaj 3-6 lat) lub do momentu wycofania przez Ciebie zgody.';
const NOWA_RETENCJA =
  'Dane ze zgłoszenia przechowujemy 12 miesięcy od ostatniego kontaktu, a potem usuwamy lub anonimizujemy. Raport PDF z audytu strony przechowujemy 90 dni.';

/** Samo ContactStep1 w prawdziwym react-hook-form (bez reszty formularza). */
const Step1Harness: React.FC = () => {
  const { register, formState } = useForm<ContactFormData>();
  return (
    <ContactStep1
      register={register}
      errors={formState.errors}
      leadId={null}
      submitError={null}
      isLoading={false}
      onNext={() => undefined}
    />
  );
};

/** Elementy, które legalnie są puste (bez dzieci i tekstu). */
const DOZWOLONE_PUSTE = new Set([
  'INPUT',
  'BR',
  'HR',
  'IMG',
  'PATH',
  'CIRCLE',
  'LINE',
  'POLYLINE',
  'RECT',
  'POLYGON',
  'ELLIPSE',
  'TEXTAREA',
  'OPTION',
  'SELECT',
]);
/** Puste elementy w poddrzewie: wrapper po wyłączonej klauzuli zostawiłby tu pusty `div`. */
const puste = (root: Element): string[] =>
  Array.from(root.querySelectorAll('*'))
    .filter((el) => el.childNodes.length === 0 && !DOZWOLONE_PUSTE.has(el.tagName.toUpperCase()))
    .map((el) => `${el.tagName.toLowerCase()}.${el.getAttribute('class') ?? ''}`);

// Liczba legalnie pustych elementów (dekoracje) zmierzona na d115c54.
const PUSTE_STEP1 = 6;
const PUSTE_KALKULATOR = 2;

const renderInline = () =>
  render(
    <ModalProvider>
      <InlineContactForm />
    </ModalProvider>,
  );

const renderCalcOnContactStep = async () => {
  const r = render(
    <MemoryRouter>
      <PublicCalculator />
    </MemoryRouter>,
  );
  await screen.findByText('Jaki jest cel projektu?');
  fireEvent.click(screen.getByRole('radio', { name: 'Sklep' }));
  fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
  await screen.findByLabelText('Twój e-mail');
  return r;
};

const wypelnij = () => {
  fireEvent.change(screen.getByLabelText(/Imię i Nazwisko/i), {
    target: { value: 'Jan Kowalski' },
  });
  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jan@test.pl' } });
  fireEvent.change(screen.getByLabelText(/Telefon/i), { target: { value: '123456789' } });
};

describe('MIX-847, flaga wyłączona: formularz jak przed zmianą', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_RODO_KLAUZULA', '');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('ContactStep1: okienko zgody jest, z linkiem do polityki i tekstem zgody', () => {
    render(<Step1Harness />);
    const cb = screen.getByRole('checkbox');
    expect(cb).toBeInTheDocument();
    expect(cb.closest('label')).toHaveTextContent(
      'Akceptuję Politykę Prywatności i wyrażam zgodę na przetwarzanie danych.',
    );
    expect(screen.getByRole('link', { name: 'Politykę Prywatności' })).toHaveAttribute(
      'href',
      '/privacy-policy/',
    );
  });

  it('ContactStep1: migawka DOM = d115c54 (M4: żaden pusty wrapper po klauzuli)', () => {
    const { container } = render(<Step1Harness />);
    expect(container.firstElementChild).toMatchSnapshot();
    // 6 dekoracyjnych pustych elementów (podkreślenia pól) jak na d115c54; wrapper klauzuli = 7
    expect(puste(container)).toHaveLength(PUSTE_STEP1);
    expect(screen.queryByTestId('rodo-klauzula-krotka')).toBeNull();
    // ostatnie dziecko to przycisk (bez dopisanego elementu po nim)
    expect(container.firstElementChild?.lastElementChild?.tagName).toBe('BUTTON');
  });

  it('kalkulator (krok kontaktowy): migawka DOM i brak pustego elementu po klauzuli', async () => {
    const { container } = await renderCalcOnContactStep();
    expect(container.firstElementChild).toMatchSnapshot();
    // 2 dekoracyjne paski postępu jak na d115c54; wrapper klauzuli = 3
    expect(puste(container)).toHaveLength(PUSTE_KALKULATOR);
    expect(screen.queryByTestId('rodo-klauzula-krotka')).toBeNull();
  });

  it('bez zaznaczenia zgody krok 1 nie przechodzi: komunikat zgody, lead nie powstaje', async () => {
    renderInline();
    wypelnij();
    fireEvent.click(screen.getByText(/Zapisz i przejdź dalej/i));
    expect(await screen.findByText(/Zgoda na przetwarzanie danych jest wymagana/i)).toBeVisible();
    expect(leadService.createLead).not.toHaveBeenCalled();
  });

  it('po zaznaczeniu zgody krok 1 wysyła lead i przechodzi dalej', async () => {
    (leadService.createLead as Mock).mockResolvedValue({ id: 'lead-1' });
    renderInline();
    wypelnij();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText(/Zapisz i przejdź dalej/i));
    await waitFor(() => expect(leadService.createLead).toHaveBeenCalledTimes(1));
  });

  it('schemat wymaga zgody (privacy: true) i wybiera schemat z wymaganiem', () => {
    const dane = { name: 'Jan Kowalski', email: 'jan@test.pl' };
    expect(getContactSchema()).toBe(contactSchema);
    expect(contactSchema.safeParse({ ...dane, privacy: false }).success).toBe(false);
    expect(contactSchema.safeParse(dane).success).toBe(false);
    expect(contactSchema.safeParse({ ...dane, privacy: true }).success).toBe(true);
  });

  it('polityka: pkt 3 ze starym tekstem retencji, bez 12 miesięcy i 90 dni', () => {
    const { container } = render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>,
    );
    expect(screen.getByText(STARA_RETENCJA)).toBeInTheDocument();
    expect(container.textContent).not.toContain('12 miesięcy');
    expect(container.textContent).not.toContain('90 dni');
  });
});

describe('MIX-847, flaga włączona: bez okienka zgody', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_RODO_KLAUZULA', '1');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('ContactStep1: brak pola wyboru i brak tekstu zgody, klauzula krótka jest', () => {
    render(<Step1Harness />);
    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(screen.queryByText(/wyrażam zgodę/i)).toBeNull();
    expect(screen.queryByRole('link', { name: 'Politykę Prywatności' })).toBeNull();
    expect(screen.getByTestId('rodo-klauzula-krotka')).toBeInTheDocument();
  });

  it('formularz: krok 1 bez zgody przechodzi, lead idzie bez pola privacy', async () => {
    (leadService.createLead as Mock).mockResolvedValue({ id: 'lead-1' });
    renderInline();
    expect(screen.queryByRole('checkbox')).toBeNull();
    wypelnij();
    fireEvent.click(screen.getByText(/Zapisz i przejdź dalej/i));
    await waitFor(() => expect(leadService.createLead).toHaveBeenCalledTimes(1));
    const payload = (leadService.createLead as Mock).mock.calls[0][0];
    expect(payload).toMatchObject({ email: 'jan@test.pl', captcha_token: 'tok' });
    expect(payload).not.toHaveProperty('privacy');
    await waitFor(() => expect(screen.getByText(/Ostatni krok|Szczegóły/i)).toBeInTheDocument());
    expect(screen.queryByText(/Zgoda na przetwarzanie danych jest wymagana/i)).toBeNull();
  });

  it('formularz: pozostałe walidacje działają (puste pola nadal blokują krok 1)', async () => {
    renderInline();
    fireEvent.click(screen.getByText(/Zapisz i przejdź dalej/i));
    expect(await screen.findByText(/co najmniej 2 znaki/i)).toBeVisible();
    expect(screen.queryByText(/Zgoda na przetwarzanie danych jest wymagana/i)).toBeNull();
    expect(leadService.createLead).not.toHaveBeenCalled();
  });

  it('schemat: bez privacy przechodzi, ale zły e-mail i brak imienia nadal nie', () => {
    const dane = { name: 'Jan Kowalski', email: 'jan@test.pl' };
    expect(getContactSchema()).not.toBe(contactSchema);
    expect(getContactSchema().safeParse(dane).success).toBe(true);
    expect(getContactSchema().safeParse({ ...dane, email: 'zly' }).success).toBe(false);
    expect(getContactSchema().safeParse({ email: 'jan@test.pl' }).success).toBe(false);
  });

  it('polityka: pkt 3 podaje 12 miesięcy i 90 dni, bez „wycofania zgody”, zgodnie z klauzulą', () => {
    const { container } = render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>,
    );
    expect(screen.getByText(NOWA_RETENCJA)).toBeInTheDocument();
    expect(screen.queryByText(STARA_RETENCJA)).toBeNull();
    expect(container.textContent).not.toContain('wycofania przez Ciebie zgody');
    const pkt6 = RODO_KLAUZULA_CONTENT.full.items.find((i) => i.title.startsWith('Jak długo'));
    expect(pkt6?.text).toContain(NOWA_RETENCJA);
    expect(PRIVACY_POLICY_CONTENT.data.retention.textRodo).toBe(NOWA_RETENCJA);
  });
});

describe('MIX-847: adres w regulaminie i polityce z SITE_CONFIG', () => {
  it('tekst bez zmian dla obecnej konfiguracji', () => {
    expect(TERMS_CONTENT.sections.general.content[0]).toContain(
      'z siedzibą w Rzeszowie (35-074), Al. Józefa Piłsudskiego 17/4, wpisana do rejestru',
    );
    expect(PRIVACY_POLICY_CONTENT.admin.content[0]).toContain(
      'z siedzibą w Rzeszowie, przy Al. Józefa Piłsudskiego 17/4, 35-074 Rzeszów, NIP:',
    );
    expect(SITE_CONFIG.contact.address.postalCode).toBe('35-074');
  });

  it('zmiana adresu w konfiguracji zmienia regulamin i politykę (nic nie jest wpisane ręcznie)', async () => {
    vi.resetModules();
    vi.doMock('../../config/site', async () => {
      const real = await vi.importActual<typeof import('../../config/site')>('../../config/site');
      return {
        SITE_CONFIG: {
          ...real.SITE_CONFIG,
          contact: {
            ...real.SITE_CONFIG.contact,
            address: {
              ...real.SITE_CONFIG.contact.address,
              street: 'ul. Testowa 5 / 9',
              postalCode: '00-001',
              city: 'Testowo',
            },
          },
        },
      };
    });
    try {
      const mod = await import('../../data/content/common');
      const regulamin = mod.TERMS_CONTENT.sections.general.content[0];
      const polityka = mod.PRIVACY_POLICY_CONTENT.admin.content[0];
      expect(regulamin).toContain('(00-001), ul. Testowa 5/9, wpisana');
      expect(polityka).toContain('przy ul. Testowa 5/9, 00-001 Testowo, NIP:');
      for (const t of [regulamin, polityka]) {
        expect(t).not.toContain('Piłsudskiego');
        expect(t).not.toContain('35-074');
      }
    } finally {
      vi.doUnmock('../../config/site');
      vi.resetModules();
    }
  });
});
