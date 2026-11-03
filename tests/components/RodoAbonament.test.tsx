import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { RODO_KLAUZULA_CONTENT } from '../../data/content';
import { SITE_CONFIG } from '../../config/site';

// MIX-627 / MIX-860 pkt 11 (decyzja A): w formularzu zapisu na abonament (PreonboardModal) przy
// VITE_RODO_KLAUZULA=1 obowiązkowa zgoda na przetwarzanie danych zastąpiona krótką klauzulą
// informacyjną, zgoda marketingowa zostaje (opcjonalna). Przy fladze wyłączonej wszystko jak dotąd.

const { trackEventMock } = vi.hoisted(() => ({ trackEventMock: vi.fn() }));
vi.mock('../../utils/analytics', () => ({ trackEvent: trackEventMock }));

const redirectMock = vi.fn();
vi.mock('../../components/pages/abonament/preonboardLogic', async (orig) => ({
  ...(await orig<typeof import('../../components/pages/abonament/preonboardLogic')>()),
  redirectToCheckout: (url: string) => redirectMock(url),
}));

const VALID_NIP = '1234563218';
const BLAD_ZGODY = 'Aby kontynuować, zaakceptuj regulamin i zgodę na przetwarzanie danych.';

type Modal = typeof import('../../components/pages/abonament/PreonboardModal').default;

async function loadModal(): Promise<Modal> {
  vi.stubEnv('VITE_MM_PREONBOARD_KEY', 'test-key');
  vi.stubEnv('VITE_MM_HUB_URL', 'https://hub.mock.invalid');
  vi.resetModules();
  return (await import('../../components/pages/abonament/PreonboardModal')).default;
}

const jsonRes = (status: number, body: unknown) =>
  Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

const fillFields = (nip = VALID_NIP) => {
  fireEvent.change(screen.getByLabelText(/Nazwa firmy/), {
    target: { value: 'Ślusarstwo Kowalski' },
  });
  fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'jan@kowalski.pl' } });
  fireEvent.change(screen.getByLabelText(/Telefon/), { target: { value: '600 100 200' } });
  fireEvent.change(screen.getByLabelText(/^NIP/), { target: { value: nip } });
};
const submit = () => fireEvent.click(screen.getByRole('button', { name: /Zapłać/ }));
// Zdarzenie submit wprost (z pominięciem natywnej walidacji `required`, którą jsdom uruchamia przy kliknięciu).
const submitForm = () =>
  fireEvent.submit(
    screen.getByRole('button', { name: /Zapłać/ }).closest('form') as HTMLFormElement,
  );

describe('PreonboardModal: klauzula RODO zamiast obowiązkowej zgody (flaga VITE_RODO_KLAUZULA)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let Modal: Modal;

  beforeEach(async () => {
    sessionStorage.clear();
    redirectMock.mockClear();
    trackEventMock.mockClear();
    fetchMock = vi.fn((url: string) =>
      url.includes('/preonboard')
        ? jsonRes(200, { ok: true, data: { client_id: 'c_1' } })
        : jsonRes(200, { ok: true, data: { url: 'https://checkout.mock.invalid/pay' } }),
    );
    vi.stubGlobal('fetch', fetchMock);
    Modal = await loadModal();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const renderModal = () =>
    render(
      <MemoryRouter>
        <Modal tier="standard" onClose={vi.fn()} />
      </MemoryRouter>,
    );
  const preBody = () => JSON.parse(fetchMock.mock.calls[0][1].body);
  const wartosciFlagi = ['', '0', 'true', ' 1', '1 ', '01', 'yes'];

  describe('flaga wyłączona: dokładnie jak dotąd', () => {
    it.each(wartosciFlagi)('flaga %j: obowiązkowa zgoda jest, klauzuli krótkiej brak', (v) => {
      vi.stubEnv('VITE_RODO_KLAUZULA', v);
      renderModal();
      const zgoda = screen.getByRole('checkbox', { name: /Akceptuję/ });
      expect(zgoda).toBeRequired();
      expect(zgoda.closest('label')).toHaveTextContent(
        'Akceptuję regulamin i zgadzam się na przetwarzanie danych zgodnie z polityką prywatności. *',
      );
      expect(screen.getAllByRole('checkbox')).toHaveLength(2);
      expect(screen.getByRole('checkbox', { name: /kontakt marketingowy/ })).not.toBeRequired();
      expect(screen.queryByTestId('rodo-klauzula-krotka')).toBeNull();
    });

    it('migawka DOM formularza = stan sprzed zmiany (cc8f97a)', () => {
      vi.stubEnv('VITE_RODO_KLAUZULA', '');
      const { baseElement } = renderModal();
      expect(baseElement).toMatchSnapshot();
    });

    it('bez zaznaczenia zgody: komunikat, żadne żądanie nie idzie', () => {
      vi.stubEnv('VITE_RODO_KLAUZULA', '');
      renderModal();
      fillFields();
      submit();
      expect(fetchMock).not.toHaveBeenCalled(); // natywne `required` blokuje już klik
      submitForm();
      expect(screen.getByRole('alert')).toHaveTextContent(BLAD_ZGODY);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('ze zgodą: consent_processing true, marketing wg okienka, wersja v1.0', async () => {
      vi.stubEnv('VITE_RODO_KLAUZULA', '');
      renderModal();
      fillFields();
      fireEvent.click(screen.getByRole('checkbox', { name: /Akceptuję/ }));
      submit();
      await waitFor(() => expect(redirectMock).toHaveBeenCalled());
      expect(preBody()).toMatchObject({
        consent_processing: true,
        consent_marketing: false,
        consent_text_version: 'v1.0',
      });
    });
  });

  describe('flaga włączona (dokładnie "1"): klauzula zamiast zgody', () => {
    beforeEach(() => vi.stubEnv('VITE_RODO_KLAUZULA', '1'));

    it('brak obowiązkowej zgody, jest tylko dobrowolna zgoda marketingowa i klauzula z linkiem', () => {
      renderModal();
      const boxes = screen.getAllByRole('checkbox');
      expect(boxes).toHaveLength(1);
      expect(boxes[0]).not.toBeRequired();
      expect(boxes[0].closest('label')).toHaveTextContent(
        'Wyrażam zgodę na kontakt marketingowy (opcjonalnie).',
      );
      expect(screen.queryByText(/Akceptuję/)).toBeNull();
      expect(screen.queryByText(/zgadzam się na przetwarzanie danych/)).toBeNull();
      expect(screen.queryByRole('link', { name: 'regulamin' })).toBeNull();
      const klauzula = screen.getByTestId('rodo-klauzula-krotka');
      expect(klauzula).toHaveTextContent(RODO_KLAUZULA_CONTENT.short.abonament);
      expect(screen.getByRole('link', { name: RODO_KLAUZULA_CONTENT.linkLabel })).toHaveAttribute(
        'href',
        RODO_KLAUZULA_CONTENT.linkHref,
      );
    });

    it('klauzula podaje administratora i podstawę umowną (lit. b), bez „zgody” na przetwarzanie', () => {
      const t = RODO_KLAUZULA_CONTENT.short.abonament;
      expect(t).toContain(SITE_CONFIG.companyName);
      expect(t).toContain('lit. b');
      expect(t).not.toMatch(/wyrażam zgodę|zgodę na przetwarzanie/i);
    });

    it('formularz wysyła się bez żadnego zaznaczenia; consent_processing nie jest wysyłane, marketing false', async () => {
      renderModal();
      fillFields();
      submit();
      await waitFor(() =>
        expect(redirectMock).toHaveBeenCalledWith('https://checkout.mock.invalid/pay'),
      );
      const body = preBody();
      expect(body).not.toHaveProperty('consent_processing');
      expect(body.consent_marketing).toBe(false);
      expect(body.consent_text_version).toBe('v1.0');
      expect(body).toMatchObject({
        business_name: 'Ślusarstwo Kowalski',
        nip: VALID_NIP,
        tier: 'standard',
      });
      expect(screen.queryByText(BLAD_ZGODY)).toBeNull();
    });

    it('zgoda marketingowa nadal wysyłana (true) i zapamiętywana w drafcie', async () => {
      renderModal();
      fillFields();
      fireEvent.click(screen.getByRole('checkbox', { name: /kontakt marketingowy/ }));
      submit();
      await waitFor(() => expect(redirectMock).toHaveBeenCalled());
      const body = preBody();
      expect(body.consent_marketing).toBe(true);
      expect(body).not.toHaveProperty('consent_processing');
      expect(
        JSON.parse(sessionStorage.getItem('mm_preonboard_draft') || '{}').consentMarketing,
      ).toBe(true);
    });

    it('walidacja pól działa jak dotąd: zły NIP blokuje wysyłkę', () => {
      renderModal();
      fillFields('1234567890');
      submit();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(screen.queryByText(BLAD_ZGODY)).toBeNull();
      expect(screen.getAllByText(/NIP/).length).toBeGreaterThan(0);
    });
  });
});
