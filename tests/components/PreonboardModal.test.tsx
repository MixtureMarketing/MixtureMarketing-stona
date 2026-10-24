import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
// Tylko dane (ceny) — sam komponent jest re-importowany w loadModal() z env.
import { TIERS } from '../../components/pages/abonament/PreonboardModal';

// Jedna instancja mocka na cały plik — vi.resetModules() w beforeEach ponownie wykonuje
// fabrykę vi.mock, więc bez vi.hoisted każdy re-import modala dostałby nowy vi.fn().
const { trackEventMock } = vi.hoisted(() => ({ trackEventMock: vi.fn() }));
vi.mock('../../utils/analytics', () => ({ trackEvent: trackEventMock }));

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
async function loadModal(
  env: { key?: string; hub?: string } = { key: 'test-key', hub: 'https://hub.mock.invalid' },
): Promise<Modal> {
  vi.stubEnv('VITE_MM_PREONBOARD_KEY', env.key ?? '');
  vi.stubEnv('VITE_MM_HUB_URL', env.hub ?? '');
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
    trackEventMock.mockClear();
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
    expect(trackEventMock).toHaveBeenCalledWith('preonboard_error', {
      tier: 'standard',
      error_code: 'TIMEOUT',
    });
  });

  // ===========================================================================
  // Testy charakteryzacyjne (raport 9 §5.2) — opisują OBECNE zachowanie modala,
  // żeby cięcie PreonboardModal.tsx na moduły (§2.2) dało się zweryfikować bez zmian.
  // ===========================================================================

  const form = () => document.querySelector('form') as HTMLFormElement;
  const formSubmit = () => fireEvent.submit(form());
  const pending = () => new Promise<Response>(() => {});
  const eventNames = () => trackEventMock.mock.calls.map((c) => c[0]);

  describe('happy path — kontrakt z hubem (VITE_MM_HUB_URL)', () => {
    it('preonboard → checkout → redirect; dokładny kształt obu żądań i eventów', async () => {
      okFlow();
      renderModal();
      fillForm({ business: '  Ślusarstwo Kowalski  ' });
      fireEvent.click(screen.getByRole('checkbox', { name: /kontakt marketingowy/ }));
      submit();
      await waitFor(() =>
        expect(redirectMock).toHaveBeenCalledWith('https://checkout.mock.invalid/pay'),
      );
      expect(redirectMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledTimes(2);

      const [preUrl, preInit] = fetchMock.mock.calls[0];
      expect(preUrl).toBe('https://hub.mock.invalid/api/admin/preonboard');
      expect(preInit.method).toBe('POST');
      expect(preInit.headers).toEqual({
        'Content-Type': 'application/json',
        'X-BP-Preonboard-Key': 'test-key',
      });
      expect(preInit.signal).toBeInstanceOf(AbortSignal);
      expect(JSON.parse(preInit.body)).toEqual({
        business_name: 'Ślusarstwo Kowalski',
        email: 'jan@kowalski.pl',
        phone: '+48600100200',
        nip: VALID_NIP,
        tier: 'standard',
        consent_processing: true,
        consent_marketing: true,
        consent_text_version: 'v1.0',
      });

      const [coUrl, coInit] = fetchMock.mock.calls[1];
      expect(coUrl).toBe('https://hub.mock.invalid/api/admin/stripe/checkout');
      expect(coInit.method).toBe('POST');
      expect(coInit.headers).toEqual({
        'Content-Type': 'application/json',
        'X-BP-Preonboard-Key': 'test-key',
      });
      // Jeden AbortController na cały 2-krokowy flow.
      expect(coInit.signal).toBe(preInit.signal);
      // success_path BEZ trailing slasha i cancel_path bez slasha — celowo (walidacja huba nieznana).
      expect(JSON.parse(coInit.body)).toEqual({
        client_id: 'c_1',
        tier: 'standard',
        customer_email: 'jan@kowalski.pl',
        success_path: '/abonament/dziekujemy?sid={CHECKOUT_SESSION_ID}',
        cancel_path: '/abonament?stripe=canceled',
      });

      expect(trackEventMock.mock.calls).toEqual([
        ['submit_preonboard_attempt', { tier: 'standard' }],
        [
          'stripe_redirect',
          { tier: 'standard', client_id: 'c_1', price_pln: TIERS.standard.price },
        ],
      ]);
    });

    it('bez VITE_MM_HUB_URL żądania idą na domyślny https://api.mixturemarketing.pl', async () => {
      Modal = await loadModal({ key: 'test-key', hub: '' });
      okFlow();
      renderModal();
      fillForm();
      submit();
      await waitFor(() => expect(redirectMock).toHaveBeenCalled());
      expect(fetchMock.mock.calls.map((c) => c[0])).toEqual([
        'https://api.mixturemarketing.pl/api/admin/preonboard',
        'https://api.mixturemarketing.pl/api/admin/stripe/checkout',
      ]);
    });

    it('UTM z sessionStorage[mm_utm] trafiają do success_path (ale nie do cancel_path ani preonboard)', async () => {
      sessionStorage.setItem('mm_utm', 'utm_source=google&utm_medium=cpc&gclid=abc');
      okFlow();
      renderModal();
      fillForm();
      submit();
      await waitFor(() => expect(redirectMock).toHaveBeenCalled());
      const preBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(Object.keys(preBody).some((k) => k.startsWith('utm'))).toBe(false);
      const coBody = JSON.parse(fetchMock.mock.calls[1][1].body);
      expect(coBody.success_path).toBe(
        '/abonament/dziekujemy?sid={CHECKOUT_SESSION_ID}&utm_source=google&utm_medium=cpc&gclid=abc',
      );
      expect(coBody.cancel_path).toBe('/abonament?stripe=canceled');
    });

    it('niedostępny sessionStorage (getItem rzuca) → success_path bez UTM, flow idzie dalej', async () => {
      okFlow();
      renderModal();
      fillForm();
      const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });
      try {
        submit();
        await waitFor(() => expect(redirectMock).toHaveBeenCalled());
      } finally {
        spy.mockRestore();
      }
      const coBody = JSON.parse(fetchMock.mock.calls[1][1].body);
      expect(coBody.success_path).toBe('/abonament/dziekujemy?sid={CHECKOUT_SESSION_ID}');
    });

    it('w trakcie wysyłki przycisk jest zablokowany z „Przekierowuję do Stripe..."', async () => {
      fetchMock.mockImplementation(pending);
      renderModal();
      fillForm();
      submit();
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      const btn = screen.getByRole('button', { name: /Przekierowuję do Stripe/ });
      expect(btn).toBeDisabled();
      expect(screen.queryByRole('button', { name: /Zapłać/ })).not.toBeInTheDocument();
    });

    it('podwójny klik „Zapłać" → jedno żądanie do huba (guard = zablokowany przycisk)', async () => {
      fetchMock.mockImplementation(pending);
      renderModal();
      fillForm();
      submit();
      fireEvent.click(screen.getByRole('button', { name: /Przekierowuję do Stripe/ }));
      fireEvent.click(screen.getByRole('button', { name: /Przekierowuję do Stripe/ }));
      await new Promise((r) => setTimeout(r, 20));
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(eventNames().filter((n) => n === 'submit_preonboard_attempt')).toHaveLength(1);
    });

    it('drugi submit formularza w locie (np. programowy) wysyła drugie żądanie', async () => {
      // BUG? handleSubmit nie ma własnego guardu `if (submitting) return` — ochrona przed
      // podwójną wysyłką opiera się wyłącznie na `disabled` przycisku. W przeglądarce
      // niejawny submit (Enter) też jest blokowany przez zablokowany przycisk domyślny,
      // więc ryzyko jest niskie — ale przy wydzielaniu usePreonboardForm warto dodać guard.
      fetchMock.mockImplementation(pending);
      renderModal();
      fillForm();
      submit();
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      formSubmit();
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    });

    it('powrót „Wstecz" ze Stripe (pageshow z bfcache) odblokowuje przycisk', async () => {
      fetchMock.mockImplementation(pending);
      renderModal();
      fillForm();
      submit();
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      expect(screen.getByRole('button', { name: /Przekierowuję/ })).toBeDisabled();

      // pageshow bez persisted (zwykłe wczytanie) nic nie zmienia.
      act(() => {
        window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: false }));
      });
      expect(screen.getByRole('button', { name: /Przekierowuję/ })).toBeDisabled();

      act(() => {
        window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }));
      });
      expect(screen.getByRole('button', { name: /Zapłać/ })).not.toBeDisabled();
    });

    it('po błędzie ponowna próba czyści komunikat i kończy się przekierowaniem', async () => {
      let attempt = 0;
      fetchMock.mockImplementation((url: string) => {
        if (url.includes('/preonboard')) {
          attempt += 1;
          return attempt === 1
            ? jsonRes(500, { ok: false, error: { message: 'Chwilowy błąd huba' } })
            : jsonRes(200, { ok: true, data: { client_id: 'c_2' } });
        }
        return jsonRes(200, { ok: true, data: { url: 'https://checkout.mock.invalid/pay2' } });
      });
      renderModal();
      fillForm();
      submit();
      expect(await screen.findByText('Chwilowy błąd huba')).toBeInTheDocument();
      submit();
      await waitFor(() =>
        expect(redirectMock).toHaveBeenCalledWith('https://checkout.mock.invalid/pay2'),
      );
      expect(screen.queryByText('Chwilowy błąd huba')).not.toBeInTheDocument();
    });
  });

  describe('nagłówek i wybór pakietu', () => {
    it.each(Object.values(TIERS).map((t) => [t.id, t] as const))(
      '%s: nazwa, cena netto/brutto i CTA z TIERS',
      async (id, cfg) => {
        render(
          <MemoryRouter>
            <Modal tier={id} onClose={vi.fn()} />
          </MemoryRouter>,
        );
        expect(screen.getByText(`Pakiet · ${cfg.name}`)).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
          `${cfg.price} zł / mc netto`,
        );
        expect(
          screen.getByText(`(${cfg.priceGross} zł brutto · faktura VAT w panelu)`),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: `Zapłać ${cfg.ctaPriceLabel} kartą` }),
        ).toBeInTheDocument();
        if (cfg.hint) expect(screen.getByText(cfg.hint)).toBeInTheDocument();
      },
    );

    it('TIERS: brutto = round(netto × 1.23), ctaPriceLabel = „<netto> zł"', () => {
      for (const t of Object.values(TIERS)) {
        expect(t.priceGross).toBe(Math.round(t.price * 1.23));
        expect(t.ctaPriceLabel).toBe(`${t.price} zł`);
      }
    });

    it('opcje <select> (ceny wpisane ręcznie w JSX) są zgodne z TIERS', () => {
      renderModal();
      const options = Array.from(
        (screen.getByLabelText(/Wybrany pakiet/) as HTMLSelectElement).options,
      ).filter((o) => o.value);
      expect(options.map((o) => o.value)).toEqual(Object.keys(TIERS));
      for (const o of options) {
        const t = TIERS[o.value as keyof typeof TIERS];
        expect(o.textContent).toContain(`${t.name} — ${t.price} zł/mc`);
      }
      expect(screen.getByLabelText(/Wybrany pakiet/)).toHaveValue('standard');
    });

    it('zmiana pakietu w <select> zmienia nagłówek, tier w żądaniach i price_pln', async () => {
      okFlow();
      renderModal();
      fireEvent.change(screen.getByLabelText(/Wybrany pakiet/), {
        target: { value: 'professional' },
      });
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        `${TIERS.professional.price} zł / mc netto`,
      );
      expect(screen.getByText(TIERS.professional.hint as string)).toBeInTheDocument();
      fillForm();
      submit();
      await waitFor(() => expect(redirectMock).toHaveBeenCalled());
      expect(JSON.parse(fetchMock.mock.calls[0][1].body).tier).toBe('professional');
      expect(JSON.parse(fetchMock.mock.calls[1][1].body).tier).toBe('professional');
      expect(trackEventMock).toHaveBeenCalledWith('stripe_redirect', {
        tier: 'professional',
        client_id: 'c_1',
        price_pln: TIERS.professional.price,
      });
    });

    it('zmiana propa tier (klik innej karty) synchronizuje wybrany pakiet', () => {
      const { rerender } = renderModal();
      rerender(
        <MemoryRouter>
          <Modal tier="premium" onClose={vi.fn()} />
        </MemoryRouter>,
      );
      expect(screen.getByLabelText(/Wybrany pakiet/)).toHaveValue('premium');
      expect(screen.getByText(`Pakiet · ${TIERS.premium.name}`)).toBeInTheDocument();
    });

    it('tier=null → nic nie renderuje', () => {
      const { container } = render(
        <MemoryRouter>
          <Modal tier={null} onClose={vi.fn()} />
        </MemoryRouter>,
      );
      expect(container.querySelector('dialog')).toBeNull();
    });

    it('otwarcie: <dialog open> (fallback jsdom) i focus na „Nazwa firmy" po chwili', async () => {
      renderModal();
      expect(document.querySelector('dialog')).toHaveAttribute('open');
      await waitFor(() => expect(document.activeElement?.id).toBe('pb-business'));
    });
  });

  describe('brak VITE_MM_PREONBOARD_KEY — gate zamiast formularza', () => {
    it('pokazuje kontakt do rezerwacji, bez formularza; nagłówek z ceną zostaje', async () => {
      Modal = await loadModal({ key: '', hub: 'https://hub.mock.invalid' });
      renderModal();
      expect(screen.getByText('Płatności online uruchamiamy wkrótce')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'info@mixturemarketing.pl' })).toHaveAttribute(
        'href',
        `mailto:info@mixturemarketing.pl?subject=Rezerwacja%20pakietu%20${TIERS.standard.name}`,
      );
      expect(document.querySelector('form')).toBeNull();
      expect(screen.queryByRole('button', { name: /Zapłać/ })).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        `${TIERS.standard.price} zł / mc netto`,
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('walidacja pól (inline, focus na pierwsze błędne pole, event VALIDATION)', () => {
    // Puste pola wymagane łapie najpierw natywna walidacja (`required` → submit nie startuje,
    // także w jsdom). Walidatory JS sprawdzamy więc przez bezpośredni submit formularza.
    it('klik „Zapłać" przy pustym formularzu: natywna walidacja blokuje, zero eventów i żądań', () => {
      renderModal();
      submit();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(trackEventMock).not.toHaveBeenCalled();
    });

    it('pusty formularz (submit) → 4 błędy inline, focus na nazwie firmy, field=businessName', () => {
      renderModal();
      formSubmit();
      expect(screen.getByText('Podaj nazwę firmy.')).toBeInTheDocument();
      expect(screen.getByText('Wpisz adres email.')).toBeInTheDocument();
      // BUG? Pole telefonu startuje z prefiksem „+48 ", więc „puste" pole daje
      // „2/9 cyfr" zamiast „Wpisz numer telefonu" — cyfry prefiksu liczą się jako numer.
      expect(screen.getByText('2/9 cyfr — w Polsce numer ma 9 cyfr.')).toBeInTheDocument();
      expect(screen.getByText('Wpisz NIP firmy — potrzebny do faktury VAT.')).toBeInTheDocument();
      expect(document.activeElement?.id).toBe('pb-business');
      expect(trackEventMock.mock.calls).toEqual([
        ['submit_preonboard_attempt', { tier: 'standard' }],
        ['preonboard_error', { tier: 'standard', error_code: 'VALIDATION', field: 'businessName' }],
      ]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    const fieldCases: Array<[string, 'business' | 'email' | 'phone' | 'nip', string, string]> = [
      ['businessName', 'business', '', 'Podaj nazwę firmy.'],
      ['businessName', 'business', '   ', 'Podaj nazwę firmy.'],
      ['businessName', 'business', 'x'.repeat(201), 'Nazwa firmy jest za długa (max 200 znaków).'],
      ['email', 'email', '', 'Wpisz adres email.'],
      ['email', 'email', 'jan', 'Brak znaku @. Np. biuro@twojafirma.pl'],
      ['email', 'email', 'jan@kowalski', 'Brak kropki w domenie. Np. biuro@twojafirma.pl'],
      ['email', 'email', 'jan.kowalski@firma', 'Sprawdź format. Np. biuro@twojafirma.pl'],
      ['phone', 'phone', '', 'Wpisz numer telefonu. Np. 600 100 200.'],
      ['phone', 'phone', '600 100 20', '8/9 cyfr — w Polsce numer ma 9 cyfr.'],
      [
        'phone',
        'phone',
        '+48 600 100 20',
        'Sprawdź numer — polski numer ma 9 cyfr, np. 600 100 200.',
      ],
      [
        'phone',
        'phone',
        '+48 600 100 2000',
        'Sprawdź numer — polski numer ma 9 cyfr, np. 600 100 200.',
      ],
      ['nip', 'nip', '', 'Wpisz NIP firmy — potrzebny do faktury VAT.'],
      ['nip', 'nip', '12345', '5/10 cyfr — w PL NIP ma 10 cyfr.'],
      ['nip', 'nip', '1234563219', 'Ten NIP jest nieprawidłowy — sprawdź, czy nie ma literówki.'],
    ];

    it.each(fieldCases)('%s = %j → „%s"', (field, key, value, message) => {
      renderModal();
      fillForm({ [key]: value } as Partial<Record<typeof key, string>>);
      formSubmit();
      const errId = `pb-${key}-err`;
      const err = document.getElementById(errId);
      expect(err).toHaveTextContent(message);
      expect(err).toHaveAttribute('role', 'alert');
      const input = document.getElementById(`pb-${key}`);
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', errId);
      expect(document.activeElement).toBe(input);
      expect(trackEventMock).toHaveBeenCalledWith('preonboard_error', {
        tier: 'standard',
        error_code: 'VALIDATION',
        field,
      });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each([
      ['+49 151 23456789', '+4915123456789'],
      ['48 600 100 200', '+48600100200'],
      ['+48 600 100 200', '+48600100200'],
    ])('telefon %s przechodzi i idzie do huba jako %s', async (raw, e164) => {
      okFlow();
      renderModal();
      fillForm({ phone: raw });
      submit();
      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      expect(JSON.parse(fetchMock.mock.calls[0][1].body).phone).toBe(e164);
    });

    it('pole telefonu przepuszcza tylko cyfry, + i spacje; blur formatuje do „+48 600 100 200"', () => {
      renderModal();
      const phone = screen.getByLabelText(/Telefon/);
      fireEvent.change(phone, { target: { value: 'tel. 600-100-200' } });
      expect(phone).toHaveValue(' 600100200');
      fireEvent.blur(phone);
      expect(phone).toHaveValue('+48 600 100 200');
      expect(document.getElementById('pb-phone-err')).toBeNull();
    });

    it('pole NIP zostawia tylko cyfry (max 10) i pokazuje licznik', () => {
      renderModal();
      const nip = screen.getByLabelText(/^NIP/);
      fireEvent.change(nip, { target: { value: 'PL 123-456-32-18' } });
      expect(nip).toHaveValue('1234563218');
      fireEvent.change(nip, { target: { value: '123456321899' } });
      expect(nip).toHaveValue('1234563218');
      expect(screen.getByText(/10\/10 cyfr · potrzebny do faktury VAT/)).toBeInTheDocument();
    });

    it('blur waliduje pole, a pisanie w nim czyści błąd', () => {
      renderModal();
      const email = screen.getByLabelText(/^Email/);
      fireEvent.change(email, { target: { value: 'jan' } });
      fireEvent.blur(email);
      expect(screen.getByText('Brak znaku @. Np. biuro@twojafirma.pl')).toBeInTheDocument();
      expect(email).toHaveAttribute('aria-invalid', 'true');
      fireEvent.change(email, { target: { value: 'jan@' } });
      expect(screen.queryByText(/Brak znaku @/)).not.toBeInTheDocument();
      expect(email).toHaveAttribute('aria-invalid', 'false');

      const nip = screen.getByLabelText(/^NIP/);
      fireEvent.change(nip, { target: { value: '123' } });
      fireEvent.blur(nip);
      expect(screen.getByText('3/10 cyfr — w PL NIP ma 10 cyfr.')).toBeInTheDocument();

      const name = screen.getByLabelText(/Nazwa firmy/);
      fireEvent.blur(name);
      expect(screen.getByText('Podaj nazwę firmy.')).toBeInTheDocument();
    });

    it('brak zgody na regulamin → komunikat ogólny, event field=consent, bez żądań', () => {
      renderModal();
      fillForm();
      // fillForm zaznacza zgodę — odznaczamy.
      fireEvent.click(screen.getByRole('checkbox', { name: /Akceptuję/ }));
      formSubmit();
      expect(
        screen.getByText('Aby kontynuować, zaakceptuj regulamin i zgodę na przetwarzanie danych.'),
      ).toBeInTheDocument();
      expect(trackEventMock).toHaveBeenLastCalledWith('preonboard_error', {
        tier: 'standard',
        error_code: 'VALIDATION',
        field: 'consent',
      });
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('błędy huba → komunikaty dla użytkownika', () => {
    const NIP_TAKEN_MSG =
      'Ten NIP jest już zarejestrowany w naszym systemie. Jeśli to Twoja firma — zaloguj się do panelu klienta.';
    const RATE_MSG = 'Za dużo prób w krótkim czasie. Spróbuj ponownie za godzinę.';
    const AUTH_MSG =
      'Konfiguracja płatności jest tymczasowo niedostępna. Napisz: info@mixturemarketing.pl';

    const cases: Array<{
      name: string;
      status: number;
      body: unknown;
      message: string;
      code: string;
      panel?: boolean;
    }> = [
      {
        name: 'kod NIP_TAKEN',
        status: 400,
        body: { ok: false, error: { code: 'NIP_TAKEN' } },
        message: NIP_TAKEN_MSG,
        code: 'NIP_TAKEN',
        panel: true,
      },
      {
        name: 'kod CLIENT_EXISTS',
        status: 400,
        body: { ok: false, error: { code: 'CLIENT_EXISTS' } },
        message: NIP_TAKEN_MSG,
        code: 'CLIENT_EXISTS',
        panel: true,
      },
      {
        name: '409 bez treści',
        status: 409,
        body: { ok: false },
        message: NIP_TAKEN_MSG,
        code: 'HTTP_409',
        panel: true,
      },
      {
        name: 'komunikat „NIP already exists"',
        status: 400,
        body: { ok: false, error: { message: 'Client with this NIP already exists' } },
        message: NIP_TAKEN_MSG,
        code: 'HTTP_400',
        panel: true,
      },
      {
        name: 'RATE_LIMITED',
        status: 400,
        body: { ok: false, error: { code: 'RATE_LIMITED' } },
        message: RATE_MSG,
        code: 'RATE_LIMITED',
      },
      {
        name: '429 bez JSON',
        status: 429,
        body: 'Too Many Requests',
        message: RATE_MSG,
        code: 'HTTP_429',
      },
      {
        name: 'VALIDATION_ERROR z komunikatem',
        status: 422,
        body: {
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Email domain not allowed' },
        },
        message: 'Email domain not allowed',
        code: 'VALIDATION_ERROR',
      },
      {
        name: '422 bez komunikatu',
        status: 422,
        body: { ok: false },
        message: 'Sprawdź poprawność wypełnionych pól.',
        code: 'HTTP_422',
      },
      {
        name: 'VALIDATION_ERROR (400) bez komunikatu',
        status: 400,
        body: { ok: false, error: { code: 'VALIDATION_ERROR' } },
        message: 'Sprawdź poprawność wypełnionych pól.',
        code: 'VALIDATION_ERROR',
      },
      {
        name: 'AUTH_INVALID_KEY',
        status: 400,
        body: { ok: false, error: { code: 'AUTH_INVALID_KEY', message: 'bad key' } },
        message: AUTH_MSG,
        code: 'AUTH_INVALID_KEY',
      },
      { name: '401', status: 401, body: { ok: false }, message: AUTH_MSG, code: 'HTTP_401' },
      { name: '403', status: 403, body: { ok: false }, message: AUTH_MSG, code: 'HTTP_403' },
      {
        name: 'nieznany kod z komunikatem',
        status: 500,
        body: { ok: false, error: { code: 'SOMETHING_NEW', message: 'Hub: błąd bazy' } },
        message: 'Hub: błąd bazy',
        code: 'SOMETHING_NEW',
      },
      {
        name: 'nieznany kod bez komunikatu',
        status: 500,
        body: { ok: false, error: { code: 'SOMETHING_NEW' } },
        message: 'Nie udało się utworzyć konta (HTTP 500).',
        code: 'SOMETHING_NEW',
      },
      {
        name: '502 z HTML (nie-JSON)',
        status: 502,
        body: '<html>Bad gateway</html>',
        message: 'Nie udało się utworzyć konta (HTTP 502).',
        code: 'HTTP_502',
      },
      {
        name: '200 z ok:false',
        status: 200,
        body: { ok: false },
        message: 'Nie udało się utworzyć konta (HTTP 200).',
        code: 'HTTP_200',
      },
    ];

    it.each(cases)('$name → komunikat + event preonboard_error', async (c) => {
      fetchMock.mockImplementation(() =>
        typeof c.body === 'string'
          ? Promise.resolve(new Response(c.body, { status: c.status }))
          : jsonRes(c.status, c.body),
      );
      renderModal();
      fillForm();
      submit();
      expect(await screen.findByText(c.message)).toBeInTheDocument();
      const panel = screen.queryByRole('link', { name: /Zaloguj się do panelu klienta/ });
      if (c.panel) {
        expect(panel).toHaveAttribute('href', 'https://panel.mixturemarketing.pl/login');
      } else {
        expect(panel).not.toBeInTheDocument();
      }
      expect(trackEventMock).toHaveBeenCalledWith('preonboard_error', {
        tier: 'standard',
        error_code: c.code,
        http_status: c.status,
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(redirectMock).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: /Zapłać/ })).not.toBeDisabled();
      // Draft przeżywa błąd.
      expect(JSON.parse(sessionStorage.getItem(DRAFT_KEY) || '{}').nip).toBe(VALID_NIP);
    });

    it('422 z NIP w komunikacie → dodatkowo błąd inline pod polem NIP', async () => {
      fetchMock.mockImplementation(() =>
        jsonRes(422, { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid NIP' } }),
      );
      renderModal();
      fillForm();
      submit();
      expect(
        await screen.findByText('Sprawdź NIP — system płatności uznał go za nieprawidłowy.'),
      ).toBeInTheDocument();
      expect(document.getElementById('pb-nip-err')).toHaveTextContent(
        'System płatności odrzucił ten NIP — sprawdź cyfry.',
      );
    });

    it('offline (navigator.onLine=false) + błąd HTTP → „Brak połączenia z internetem"', async () => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
      try {
        fetchMock.mockImplementation(() => jsonRes(500, { ok: false }));
        renderModal();
        fillForm();
        submit();
        expect(
          await screen.findByText('Brak połączenia z internetem. Sprawdź sieć i spróbuj ponownie.'),
        ).toBeInTheDocument();
      } finally {
        delete (navigator as { onLine?: boolean }).onLine;
      }
    });

    it('fetch odrzucony (brak sieci) → surowy komunikat przeglądarki, bez preonboard_error', async () => {
      // BUG? Prawdziwy brak sieci to odrzucony fetch (TypeError „Failed to fetch"), a nie
      // odpowiedź HTTP — gałąź `!navigator.onLine` jej nie łapie. Użytkownik widzi angielski
      // komunikat przeglądarki, a GA4 nie dostaje preonboard_error (tylko TIMEOUT jest liczony).
      fetchMock.mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')));
      renderModal();
      fillForm();
      submit();
      expect(await screen.findByText('Failed to fetch')).toBeInTheDocument();
      expect(eventNames()).toEqual(['submit_preonboard_attempt']);
      expect(screen.getByRole('button', { name: /Zapłać/ })).not.toBeDisabled();
    });

    it('preonboard OK bez client_id → komunikat, checkout nie startuje', async () => {
      fetchMock.mockImplementation(() => jsonRes(200, { ok: true, data: {} }));
      renderModal();
      fillForm();
      submit();
      expect(
        await screen.findByText(
          'Hub nie zwrócił client_id. Skontaktuj się: info@mixturemarketing.pl',
        ),
      ).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it.each([
      [
        'z komunikatem',
        jsonRes(500, { ok: false, error: { message: 'Stripe niedostępny' } }),
        'Stripe niedostępny',
      ],
      [
        'bez JSON',
        Promise.resolve(new Response('oops', { status: 503 })),
        'Nie udało się rozpocząć płatności (HTTP 503).',
      ],
    ])('błąd checkoutu %s → komunikat + CHECKOUT_FAILED', async (_n, res, message) => {
      fetchMock.mockImplementation((url: string) =>
        url.includes('/preonboard') ? jsonRes(200, { ok: true, data: { client_id: 'c_1' } }) : res,
      );
      renderModal();
      fillForm();
      submit();
      expect(await screen.findByText(message)).toBeInTheDocument();
      expect(trackEventMock).toHaveBeenCalledWith(
        'preonboard_error',
        expect.objectContaining({ tier: 'standard', error_code: 'CHECKOUT_FAILED' }),
      );
      expect(eventNames()).not.toContain('stripe_redirect');
      expect(redirectMock).not.toHaveBeenCalled();
    });

    it('checkout OK bez url → komunikat, bez stripe_redirect', async () => {
      fetchMock.mockImplementation((url: string) =>
        url.includes('/preonboard')
          ? jsonRes(200, { ok: true, data: { client_id: 'c_1' } })
          : jsonRes(200, { ok: true, data: {} }),
      );
      renderModal();
      fillForm();
      submit();
      expect(
        await screen.findByText(
          'Brak adresu Stripe Checkout. Skontaktuj się: info@mixturemarketing.pl',
        ),
      ).toBeInTheDocument();
      expect(eventNames()).not.toContain('stripe_redirect');
      expect(redirectMock).not.toHaveBeenCalled();
    });
  });

  describe('zamykanie modala', () => {
    it('zamknięcie w trakcie checkoutu (2. krok) → abort, USER_CLOSED, bez redirectu i komunikatu', async () => {
      fetchMock.mockImplementation((url: string, init: RequestInit) => {
        if (url.includes('/preonboard'))
          return jsonRes(200, { ok: true, data: { client_id: 'c_1' } });
        return new Promise<Response>((_res, rej) => {
          init.signal?.addEventListener('abort', () =>
            rej(new DOMException('aborted', 'AbortError')),
          );
        });
      });
      const onClose = vi.fn();
      renderModal(onClose);
      fillForm();
      submit();
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
      fireEvent.click(screen.getByRole('button', { name: 'Zamknij okno' }));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect((fetchMock.mock.calls[1][1].signal as AbortSignal).aborted).toBe(true);
      await new Promise((r) => setTimeout(r, 20));
      expect(redirectMock).not.toHaveBeenCalled();
      expect(trackEventMock).toHaveBeenCalledWith('preonboard_error', {
        tier: 'standard',
        error_code: 'USER_CLOSED',
      });
      expect(eventNames()).not.toContain('stripe_redirect');
      // Brak komunikatu błędu po świadomym zamknięciu.
      expect(screen.queryByText(/aborted/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Serwer płatności nie odpowiada/)).not.toBeInTheDocument();
    });

    it('zamknięcie bez wysyłki → onClose, bez USER_CLOSED', () => {
      const onClose = vi.fn();
      renderModal(onClose);
      fireEvent.click(screen.getByRole('button', { name: 'Zamknij okno' }));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(trackEventMock).not.toHaveBeenCalled();
    });

    it('Esc (natywne zdarzenie close na <dialog>) → onClose', () => {
      const onClose = vi.fn();
      renderModal(onClose);
      act(() => {
        document.querySelector('dialog')!.dispatchEvent(new Event('close'));
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('klik w tło (sam <dialog>) zamyka, klik w treść nie', () => {
      const onClose = vi.fn();
      renderModal(onClose);
      fireEvent.click(screen.getByRole('heading', { level: 2 }));
      expect(onClose).not.toHaveBeenCalled();
      fireEvent.click(document.querySelector('dialog')!);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('draft w sessionStorage', () => {
    it('każda zmiana zapisuje draft (bez zgody na przetwarzanie — ta wymaga świadomego kliknięcia)', () => {
      renderModal();
      fillForm();
      fireEvent.click(screen.getByRole('checkbox', { name: /kontakt marketingowy/ }));
      expect(JSON.parse(sessionStorage.getItem(DRAFT_KEY) || '{}')).toEqual({
        businessName: 'Ślusarstwo Kowalski',
        email: 'jan@kowalski.pl',
        phone: '600 100 200',
        nip: VALID_NIP,
        consentMarketing: true,
        selectedTier: 'standard',
      });
    });

    it('odtwarza wszystkie pola z draftu; zgoda na regulamin zawsze odznaczona', () => {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          businessName: 'Firma z draftu',
          email: 'draft@firma.pl',
          phone: '+48 600 100 200',
          nip: VALID_NIP,
          consentMarketing: true,
          selectedTier: 'premium',
        }),
      );
      renderModal();
      expect(screen.getByLabelText(/Nazwa firmy/)).toHaveValue('Firma z draftu');
      expect(screen.getByLabelText(/^Email/)).toHaveValue('draft@firma.pl');
      expect(screen.getByLabelText(/Telefon/)).toHaveValue('+48 600 100 200');
      expect(screen.getByLabelText(/^NIP/)).toHaveValue(VALID_NIP);
      expect(screen.getByRole('checkbox', { name: /kontakt marketingowy/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Akceptuję/ })).not.toBeChecked();
      // Prop tier (kliknięta karta) wygrywa z pakietem z draftu.
      expect(screen.getByLabelText(/Wybrany pakiet/)).toHaveValue('standard');
    });

    it('uszkodzony draft → pusty formularz z domyślnym „+48 ", bez wyjątku', () => {
      sessionStorage.setItem(DRAFT_KEY, '{nie-json');
      renderModal();
      expect(screen.getByLabelText(/Nazwa firmy/)).toHaveValue('');
      expect(screen.getByLabelText(/Telefon/)).toHaveValue('+48 ');
    });
  });
});
