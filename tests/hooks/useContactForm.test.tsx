import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useContactForm } from '../../hooks/useContactForm';
import { leadService, LeadSubmitError } from '../../services/leadService';
import { describeLeadError } from '../../utils/contactFormHelpers';
import type { TurnstileWidgetHandle } from '../../utils/turnstile';

vi.mock('../../context/ModalContext', () => ({ useModal: () => ({ additionalData: null }) }));
vi.mock('../../utils/analytics', () => ({ trackEvent: vi.fn() }));
// jsdom ma hostname 'localhost' — wyłączamy lokalny bypass captchy, jak na produkcji.
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

const turnstile = (getToken: () => Promise<string>) =>
  ({ current: { getToken, reset: vi.fn() } }) as React.RefObject<TurnstileWidgetHandle | null>;

async function submitStep1(getToken: () => Promise<string>) {
  const { result } = renderHook(() => useContactForm('web', vi.fn(), turnstile(getToken)));
  act(() => {
    result.current.formMethods.setValue('name', 'Jan Kowalski');
    result.current.formMethods.setValue('email', 'jan@firma.pl');
    result.current.formMethods.setValue('phone', '');
    result.current.formMethods.setValue('privacy', true);
  });
  await act(async () => {
    await result.current.nextStep();
  });
  return result;
}

describe('useContactForm — rozróżnione komunikaty błędów kroku 1', () => {
  beforeEach(() => {
    vi.mocked(leadService.createLead).mockReset();
  });

  it('brak tokenu Turnstile → komunikat o weryfikacji bezpieczeństwa (bez wywołania API)', async () => {
    const result = await submitStep1(() => Promise.reject(new Error('TURNSTILE_NOT_READY')));
    expect(result.current.submitError).toMatch(/Turnstile/);
    expect(leadService.createLead).not.toHaveBeenCalled();
  });

  it.each([
    [403, /captcha/i],
    [429, /Zbyt wiele prób/],
    [500, /awaria serwera.*NIE zostało zapisane/],
    [0, /Brak połączenia/],
  ])('serwer %s → właściwy komunikat (nie „Turnstile nieudana”)', async (status, re) => {
    vi.mocked(leadService.createLead).mockRejectedValueOnce(
      new LeadSubmitError('x', status as number),
    );
    const result = await submitStep1(() => Promise.resolve('token'));
    expect(result.current.submitError).toMatch(re);
    if (status !== 403) expect(result.current.submitError).not.toMatch(/Turnstile|captcha/i);
    expect(result.current.step).toBe(1);
  });

  it('sukces → krok 2', async () => {
    vi.mocked(leadService.createLead).mockResolvedValueOnce({
      id: 'L1',
      name: 'Jan Kowalski',
      email: 'jan@firma.pl',
    });
    const result = await submitStep1(() => Promise.resolve('token'));
    expect(result.current.submitError).toBeNull();
    expect(result.current.step).toBe(2);
  });
});

describe('describeLeadError', () => {
  it('nieznany błąd → ogólny komunikat z telefonem', () => {
    expect(describeLeadError(new Error('?'))).toMatch(/Nie udało się wysłać formularza/);
  });
});
