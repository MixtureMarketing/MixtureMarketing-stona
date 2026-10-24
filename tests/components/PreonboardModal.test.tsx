import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../utils/analytics', () => ({ trackEvent: vi.fn() }));

// jsdom nie nawiguje — podmieniamy samo przekierowanie, reszta logiki jest prawdziwa.
const redirectMock = vi.fn();
vi.mock('../../components/pages/abonament/preonboardLogic', async (orig) => ({
  ...(await orig<typeof import('../../components/pages/abonament/preonboardLogic')>()),
  redirectToCheckout: (url: string) => redirectMock(url),
}));

const DRAFT_KEY = 'mm_preonboard_draft';
const VALID_NIP = '1234563218';

type Modal = typeof import('../../components/pages/abonament/PreonboardModal').default;

// PREONBOARD_KEY jest czytany przy imporcie modułu → env przed (re)importem.
async function loadModal(): Promise<Modal> {
  vi.stubEnv('VITE_MM_PREONBOARD_KEY', 'test-key');
  vi.stubEnv('VITE_MM_HUB_URL', 'https://hub.mock.invalid');
  vi.resetModules();
  return (await import('../../components/pages/abonament/PreonboardModal')).default;
}

function jsonRes(status: number, body: unknown) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function fillForm(overrides: Partial<Record<'business' | 'email' | 'phone' | 'nip', string>> = {}) {
  const v = {
    business: 'Ślusarstwo Kowalski',
    email: 'jan@kowalski.pl',
    phone: '600 100 200',
    nip: VALID_NIP,
    ...overrides,
  };
  fireEvent.change(screen.getByLabelText(/Nazwa firmy/), { target: { value: v.business } });
  fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: v.email } });
  fireEvent.change(screen.getByLabelText(/Telefon/), { target: { value: v.phone } });
  fireEvent.change(screen.getByLabelText(/^NIP/), { target: { value: v.nip } });
  fireEvent.click(screen.getByRole('checkbox', { name: /Akceptuję/ }));
}

const submit = () => fireEvent.click(screen.getByRole('button', { name: /Zapłać/ }));

describe('PreonboardModal', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let Modal: Modal;

  beforeEach(async () => {
    sessionStorage.clear();
    redirectMock.mockClear();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    Modal = await loadModal();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  const renderModal = (onClose = vi.fn()) =>
    render(
      <MemoryRouter>
        <Modal tier="standard" onClose={onClose} />
      </MemoryRouter>,
    );

  const okFlow = () => {
    fetchMock.mockImplementation((url: string) =>
      url.includes('/preonboard')
        ? jsonRes(200, { ok: true, data: { client_id: 'c_1' } })
        : jsonRes(200, { ok: true, data: { url: 'https://checkout.mock.invalid/pay' } }),
    );
  };

  it('po przekierowaniu do Stripe draft ZOSTAJE (powrót z ?stripe=canceled ma wypełniony formularz)', async () => {
    okFlow();
    const { unmount } = renderModal();
    fillForm();
    submit();
    await waitFor(() =>
      expect(redirectMock).toHaveBeenCalledWith('https://checkout.mock.invalid/pay'),
    );

    const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || '{}');
    expect(draft.businessName).toBe('Ślusarstwo Kowalski');
    expect(draft.nip).toBe(VALID_NIP);

    // Powrót z anulowanej płatności = nowe zamontowanie strony.
    unmount();
    renderModal();
    expect(screen.getByLabelText(/Nazwa firmy/)).toHaveValue('Ślusarstwo Kowalski');
    expect(screen.getByLabelText(/^Email/)).toHaveValue('jan@kowalski.pl');
    expect(screen.getByLabelText(/^NIP/)).toHaveValue(VALID_NIP);
  });

  it('kształt success_path / cancel_path bez zmian', async () => {
    okFlow();
    renderModal();
    fillForm();
    submit();
    await waitFor(() => expect(redirectMock).toHaveBeenCalled());
    const checkoutBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(checkoutBody.success_path).toBe('/abonament/dziekujemy?sid={CHECKOUT_SESSION_ID}');
    expect(checkoutBody.cancel_path).toBe('/abonament?stripe=canceled');
  });

  it('telefon „0600 100 200" idzie do huba jako +48600100200', async () => {
    okFlow();
    renderModal();
    fillForm({ phone: '0600 100 200' });
    submit();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const preBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(preBody.phone).toBe('+48600100200');
  });

  it('NIP z błędną sumą kontrolną blokuje wysyłkę z komunikatem', async () => {
    okFlow();
    renderModal();
    fillForm({ nip: '1234567890' });
    submit();
    expect(await screen.findByText(/Ten NIP jest nieprawidłowy/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^NIP/)).toHaveAttribute('aria-invalid', 'true');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('422 „Invalid NIP checksum" z huba NIE pokazuje „NIP zarejestrowany / zaloguj się"', async () => {
    fetchMock.mockImplementation(() =>
      jsonRes(422, {
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid NIP checksum' },
      }),
    );
    renderModal();
    fillForm();
    submit();
    expect(await screen.findByText(/uznał go za nieprawidłowy/)).toBeInTheDocument();
    expect(screen.queryByText(/już zarejestrowany/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Zaloguj się do panelu klienta/)).not.toBeInTheDocument();
  });

  it('409 / kod duplikatu → „NIP zarejestrowany" z CTA do panelu', async () => {
    fetchMock.mockImplementation(() =>
      jsonRes(409, { ok: false, error: { code: 'NIP_TAKEN', message: 'NIP already registered' } }),
    );
    renderModal();
    fillForm();
    submit();
    expect(await screen.findByText(/już zarejestrowany/)).toBeInTheDocument();
    expect(screen.getByText(/Zaloguj się do panelu klienta/)).toBeInTheDocument();
  });

  it('zamknięcie modala w trakcie wysyłki NIE przekierowuje do Stripe', async () => {
    let resolvePre: (r: Response) => void = () => {};
    fetchMock.mockImplementation((url: string, init: RequestInit) => {
      if (url.includes('/preonboard')) {
        // Wolny hub; fetch nie respektuje tu abortu, żeby sprawdzić flagę przed redirectem.
        return new Promise<Response>((res) => {
          resolvePre = res;
          void init;
        });
      }
      return jsonRes(200, { ok: true, data: { url: 'https://checkout.mock.invalid/pay' } });
    });
    const onClose = vi.fn();
    renderModal(onClose);
    fillForm();
    submit();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const signal = fetchMock.mock.calls[0][1].signal as AbortSignal;

    fireEvent.click(screen.getByRole('button', { name: 'Zamknij okno' }));
    expect(onClose).toHaveBeenCalled();
    expect(signal.aborted).toBe(true);

    await act(async () => {
      resolvePre(
        new Response(JSON.stringify({ ok: true, data: { client_id: 'c_1' } }), { status: 200 }),
      );
    });
    await new Promise((r) => setTimeout(r, 20));
    expect(redirectMock).not.toHaveBeenCalled();
    // Przycisk nie zostaje zablokowany po zamknięciu.
    expect(screen.getByRole('button', { name: /Zapłać/ })).not.toBeDisabled();
  });

  it('zawieszony hub → po limicie czasu komunikat i odblokowany przycisk', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_res, rej) => {
          init.signal?.addEventListener('abort', () =>
            rej(new DOMException('aborted', 'AbortError')),
          );
        }),
    );
    renderModal();
    fillForm();
    submit();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await act(async () => {
      vi.advanceTimersByTime(21_000);
    });
    expect(await screen.findByText(/Serwer płatności nie odpowiada/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Zapłać/ })).not.toBeDisabled();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
