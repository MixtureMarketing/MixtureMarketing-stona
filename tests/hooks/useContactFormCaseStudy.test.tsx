// MIX-1855: formularz kontaktu otwarty z przycisku „Chcesz podobny projekt?” w realizacji:
// nazwa realizacji idzie do leada (similar_project), a po SUKCESIE formularza do GA4 idzie
// generate_lead z samymi stałymi (form_id, page_type), bez nazwy klienta.
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useContactForm } from '../../hooks/useContactForm';
import { leadService, LeadSubmitError } from '../../services/leadService';
import { trackEvent } from '../../utils/analytics';
import { sanitizeGa4Event } from '../../utils/ga4Events';
import type { TurnstileWidgetHandle } from '../../utils/turnstile';
import type { ContactFormData } from '../../components/features/contact/types';

const modal = vi.hoisted(() => ({ additionalData: null as Record<string, unknown> | null }));
vi.mock('../../context/ModalContext', () => ({
  useModal: () => ({ additionalData: modal.additionalData }),
}));
vi.mock('../../utils/analytics', () => ({ trackEvent: vi.fn() }));
vi.mock('../../utils/contactFormHelpers', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../utils/contactFormHelpers')>()),
  isLocalhost: () => false,
}));
vi.mock('../../services/leadService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/leadService')>();
  return {
    ...actual,
    leadService: {
      createLead: vi.fn(),
      updateLead: vi.fn(),
      sendNotification: vi.fn(),
      getLead: vi.fn(),
    },
  };
});

const turnstile = () =>
  ({
    current: { getToken: () => Promise.resolve('token'), reset: vi.fn() },
  }) as React.RefObject<TurnstileWidgetHandle | null>;

const DANE = {
  name: 'Jan Kowalski',
  email: 'jan@firma.pl',
  phone: '',
  privacy: true,
  message: 'Chcę podobny projekt',
} as unknown as ContactFormData;

const CS = { leadSource: 'case_study_similar', similarProject: 'GlamSpace: rezerwacje salonów' };
const leadsCalls = () => vi.mocked(leadService.createLead).mock.calls.map((c) => c[0]);
const gaCalls = () => vi.mocked(trackEvent).mock.calls.filter((c) => c[0] === 'generate_lead');

beforeEach(() => {
  vi.mocked(leadService.createLead).mockReset().mockResolvedValue({
    id: 'L1',
    name: 'Jan Kowalski',
    email: 'jan@firma.pl',
  });
  vi.mocked(leadService.updateLead).mockReset().mockResolvedValue(true);
  vi.mocked(leadService.sendNotification).mockReset().mockResolvedValue(true);
  vi.mocked(trackEvent).mockClear();
  modal.additionalData = null;
});

const wyslij = async () => {
  const { result } = renderHook(() => useContactForm('general', vi.fn(), turnstile()));
  await act(async () => {
    await result.current.onSubmit(DANE);
  });
  return result;
};

describe('lead z przycisku w realizacji', () => {
  it('create dostaje nazwę realizacji (similar_project), update kroku 3 też', async () => {
    modal.additionalData = CS;
    await wyslij();
    expect(leadsCalls()).toHaveLength(1);
    expect(leadsCalls()[0]).toMatchObject({
      service_interest: 'general',
      similar_project: 'GlamSpace: rezerwacje salonów',
    });
    const [id, dane, krok] = vi.mocked(leadService.updateLead).mock.calls[0];
    expect(id).toBe('L1');
    expect(krok).toBe(3);
    expect(dane).toMatchObject({ similar_project: 'GlamSpace: rezerwacje salonów' });
    expect(leadService.sendNotification).toHaveBeenCalledWith('L1', 'success');
  });

  it('nazwa realizacji: spacje ściśnięte i ucięta do 100 znaków', async () => {
    modal.additionalData = { ...CS, similarProject: `  Glam   ${'x'.repeat(300)}` };
    await wyslij();
    const nazwa = (leadsCalls()[0] as { similar_project: string }).similar_project;
    expect(nazwa.startsWith('Glam x')).toBe(true);
    expect(nazwa).toHaveLength(100);
  });

  it('sukces → dokładnie jedno generate_lead ze stałymi parametrami, po sendNotification', async () => {
    modal.additionalData = CS;
    const result = await wyslij();
    expect(result.current.isSubmitted).toBe(true);
    expect(gaCalls()).toEqual([
      ['generate_lead', { form_id: 'case_study_similar', page_type: 'case_study' }],
    ]);
    // żaden parametr GA4 nie niesie nazwy klienta ani danych z formularza
    expect(JSON.stringify(vi.mocked(trackEvent).mock.calls)).not.toMatch(/GlamSpace|jan@|Kowalski/);
    // parametry przechodzą przez allowlistę bez odrzuceń
    const ok = sanitizeGa4Event('generate_lead', gaCalls()[0][1]);
    expect(ok).toMatchObject({ ok: true, refused: [] });
  });

  it('(−) błąd serwera przy create → brak generate_lead i brak potwierdzenia', async () => {
    modal.additionalData = CS;
    vi.mocked(leadService.createLead).mockRejectedValueOnce(new LeadSubmitError('x', 500));
    const result = await wyslij();
    expect(result.current.isSubmitted).toBe(false);
    expect(gaCalls()).toEqual([]);
  });

  it('(−) błąd update kroku 3 → brak generate_lead', async () => {
    modal.additionalData = CS;
    vi.mocked(leadService.updateLead).mockRejectedValueOnce(new LeadSubmitError('x', 500));
    const result = await wyslij();
    expect(result.current.isSubmitted).toBe(false);
    expect(gaCalls()).toEqual([]);
  });
});

describe('zwykły formularz (bez przycisku z realizacji): bez zmian', () => {
  it.each([
    ['brak danych modala', null],
    ['pakiet', { package: 'Pakiet Start' }],
    ['nazwa bez źródła', { similarProject: 'GlamSpace' }],
    ['inne źródło', { leadSource: 'cennik', similarProject: 'GlamSpace' }],
  ])('%s: brak generate_lead', async (_n, dane) => {
    modal.additionalData = dane as Record<string, unknown> | null;
    const result = await wyslij();
    expect(result.current.isSubmitted).toBe(true);
    expect(gaCalls()).toEqual([]);
  });

  it('bez nazwy realizacji lead nie dostaje pola similar_project (ani w create, ani w update)', async () => {
    modal.additionalData = { package: 'Pakiet Start' };
    await wyslij();
    expect(leadsCalls()[0]).not.toHaveProperty('similar_project');
    expect(vi.mocked(leadService.updateLead).mock.calls[0][1]).not.toHaveProperty(
      'similar_project',
    );
    expect(vi.mocked(leadService.updateLead).mock.calls[0][1]).toMatchObject({
      package_name: 'Pakiet Start',
    });
  });

  it('puste i nietekstowe similarProject: pola nie ma w leadzie', async () => {
    modal.additionalData = { leadSource: 'case_study_similar', similarProject: '   ' };
    await wyslij();
    expect(leadsCalls()[0]).not.toHaveProperty('similar_project');
  });
});

describe('krok 1 formularza', () => {
  it('create po kroku 1 niesie similar_project', async () => {
    modal.additionalData = CS;
    const { result } = renderHook(() => useContactForm('general', vi.fn(), turnstile()));
    act(() => {
      result.current.formMethods.setValue('name', 'Jan Kowalski');
      result.current.formMethods.setValue('email', 'jan@firma.pl');
      result.current.formMethods.setValue('phone', '');
      result.current.formMethods.setValue('privacy', true);
    });
    await act(async () => {
      await result.current.nextStep();
    });
    expect(leadsCalls()).toHaveLength(1);
    expect(leadsCalls()[0]).toMatchObject({ similar_project: 'GlamSpace: rezerwacje salonów' });
    expect(result.current.step).toBe(2);
    expect(gaCalls()).toEqual([]); // generate_lead dopiero po sukcesie, nie po kroku 1
  });
});
