import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Abonament from '../../components/pages/abonament/Abonament';
import { TIERS } from '../../components/pages/abonament/PreonboardModal';

// Testy charakteryzacyjne lejka /abonament/ (raport 9 §5.2) — opisują OBECNE zachowanie
// strony, żeby cięcie Abonament.tsx na sekcje/hooki (§2.1) dało się zweryfikować bez zmian.
// Ceny sprawdzamy względem TIERS (źródło używane przy płatności), nie wpisanych liczb —
// zmiana cennika w jednym miejscu bez drugiego ma tu wybuchnąć.

// PREONBOARD_KEY / HUB są czytane przy imporcie PreonboardModal → env przed importami.
const { trackEventMock, redirectMock } = vi.hoisted(() => {
  vi.stubEnv('VITE_MM_PREONBOARD_KEY', 'test-key');
  vi.stubEnv('VITE_MM_HUB_URL', 'https://hub.mock.invalid');
  return { trackEventMock: vi.fn(), redirectMock: vi.fn() };
});
vi.mock('../../utils/analytics', () => ({ trackEvent: trackEventMock }));
vi.mock('../../components/pages/abonament/preonboardLogic', async (orig) => ({
  ...(await orig<typeof import('../../components/pages/abonament/preonboardLogic')>()),
  redirectToCheckout: (url: string) => redirectMock(url),
}));

type TierId = keyof typeof TIERS;
type JsonLd = Record<string, unknown> & { '@type'?: string };

const DRAFT_KEY = 'mm_preonboard_draft';
const VALID_NIP = '1234563218';
const CARD_TIERS: TierId[] = ['starter', 'standard', 'premium'];

// Aktualny ?query routera (po setSearchParams) — widoczny w DOM, bez mutowania zmiennych w renderze.
const LocationSpy = () => <output data-testid="router-search">{useLocation().search}</output>;

// Deep-link ?tier= jest czytany z window.location (nie z routera) → ustawiamy oba.
function renderPage(url = '/abonament/') {
  window.history.replaceState(null, '', url);
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[url]}>
        <Abonament />
        <LocationSpy />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

const callsOf = (name: string) =>
  trackEventMock.mock.calls.filter((c) => c[0] === name).map((c) => c[1]);
const funnelCalls = () => trackEventMock.mock.calls.filter((c) => c[0] !== 'view_pricing');

const jsonLdBlocks = (): JsonLd[] =>
  Array.from(document.head.querySelectorAll('script[type="application/ld+json"]')).flatMap((s) => {
    const parsed = JSON.parse(s.textContent || 'null');
    return Array.isArray(parsed) ? parsed : [parsed];
  });

async function waitForJsonLd(type: string): Promise<JsonLd> {
  let found: JsonLd | undefined;
  await waitFor(() => {
    found = jsonLdBlocks().find((b) => b['@type'] === type);
    expect(found).toBeDefined();
  });
  return found as JsonLd;
}

const dialog = () => document.querySelector('dialog');

function jsonRes(status: number, body: unknown) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

describe('/abonament/ — lejek (Abonament.tsx)', () => {
  let scrollToSpy: ReturnType<typeof vi.spyOn>;
  let fetchMock: ReturnType<typeof vi.fn>;
  const realFetch = globalThis.fetch;

  beforeEach(() => {
    sessionStorage.clear();
    trackEventMock.mockClear();
    redirectMock.mockClear();
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    // Nic nie może wyjść do sieci.
    fetchMock = vi.fn(() => Promise.reject(new Error('unexpected fetch')));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    scrollToSpy.mockRestore();
    globalThis.fetch = realFetch;
    window.history.replaceState(null, '', '/');
    delete document.body.dataset.stickyMobileBar;
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  describe('cennik — ceny zgodne z TIERS (źródło płatności)', () => {
    it.each(CARD_TIERS)('karta %s: nazwa, cena netto, brutto, CTA', (id) => {
      renderPage();
      const t = TIERS[id];
      const pricing = document.getElementById('pricing') as HTMLElement;
      const heading = within(pricing).getByRole('heading', { level: 3, name: t.name });
      const card = heading.parentElement as HTMLElement;
      expect(within(card).getByText(String(t.price))).toBeInTheDocument();
      expect(
        within(card).getByText(`netto · brutto ${t.priceGross} zł · Faktura VAT w panelu`),
      ).toBeInTheDocument();
      expect(within(card).getByRole('button', { name: `Wybierz ${t.name}` })).toBeInTheDocument();
    });

    it('tylko Standard jest wyróżniony („Najpopularniejszy")', () => {
      renderPage();
      const badge = screen.getByText('Najpopularniejszy');
      expect(badge.parentElement).toHaveTextContent(TIERS.standard.name);
      expect(screen.getAllByText('Najpopularniejszy')).toHaveLength(1);
    });

    it('panel Professional: cena netto i brutto z TIERS', () => {
      renderPage();
      const pricing = document.getElementById('pricing') as HTMLElement;
      const heading = within(pricing).getByRole('heading', { name: 'Pakiet Professional.' });
      const panel = heading.parentElement as HTMLElement;
      expect(within(panel).getByText(String(TIERS.professional.price))).toBeInTheDocument();
      expect(panel).toHaveTextContent(`netto · brutto ${TIERS.professional.priceGross} zł`);
    });

    it('karta w hero: Starter z ceną netto i brutto z TIERS', () => {
      renderPage();
      const heroBtn = screen.getAllByRole('button', { name: /^Wybierz Starter/ })[0];
      const heroCard = heroBtn.parentElement as HTMLElement;
      expect(within(heroCard).getByText(String(TIERS.starter.price))).toBeInTheDocument();
      expect(heroCard).toHaveTextContent(
        `/ miesięcznie · netto · brutto ${TIERS.starter.priceGross} zł`,
      );
    });

    it('ceny wpisane ręcznie w copy (nagłówek cennika, hero, sticky bar, FAQ, title) = TIERS', async () => {
      renderPage();
      const { starter, standard, premium, professional } = TIERS;
      const pricing = document.getElementById('pricing') as HTMLElement;
      expect(within(pricing).getByRole('heading', { level: 2 })).toHaveTextContent(
        `${starter.price}, ${standard.price}, ${premium.price}.`,
      );
      expect(
        screen.getByText(`● NOWOŚĆ · 2026 · 4 pakiety od ${starter.price} zł/mc`),
      ).toBeInTheDocument();
      expect(screen.getByText(`Od ${starter.price} zł / mc`)).toBeInTheDocument();
      await waitFor(() => expect(document.title).toContain(`od ${starter.price} zł/mc`));

      const faq = (await waitForJsonLd('FAQPage')) as {
        mainEntity: { name: string; acceptedAnswer: { text: string } }[];
      };
      const priceAnswer = faq.mainEntity.find(
        (q) => q.name === 'Ile kosztuje strona w abonamencie?',
      )?.acceptedAnswer.text;
      for (const t of [starter, standard, premium]) {
        expect(priceAnswer).toContain(`${t.name} ${t.price} zł/mc`);
      }
      expect(priceAnswer).toContain(`Professional od ${professional.price} zł/mc`);
    });
  });

  describe('JSON-LD', () => {
    it('wszystkie bloki to poprawny JSON; są Service, FAQPage, Person, BreadcrumbList', async () => {
      renderPage();
      await waitForJsonLd('Service');
      const types = jsonLdBlocks().map((b) => b['@type']);
      expect(types).toEqual(
        expect.arrayContaining(['Service', 'FAQPage', 'Person', 'BreadcrumbList']),
      );
      expect(types.filter((t) => t === 'Service')).toHaveLength(1);
    });

    it('Service.offers = 4 pakiety z cenami z TIERS (PLN, miesięcznie)', async () => {
      renderPage();
      const service = (await waitForJsonLd('Service')) as {
        offers: Record<string, unknown>[];
        description: string;
        dateModified: string;
      };
      expect(service.offers.map((o) => o['@id'])).toEqual(
        (Object.keys(TIERS) as TierId[]).map(
          (id) => `https://mixturemarketing.pl/abonament/#offer-${id}`,
        ),
      );
      for (const offer of service.offers) {
        const id = String(offer['@id']).split('#offer-')[1] as TierId;
        const t = TIERS[id];
        expect(offer).toMatchObject({
          '@type': 'Offer',
          name: `Pakiet ${t.name}`,
          price: String(t.price),
          priceCurrency: 'PLN',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: String(t.price),
            priceCurrency: 'PLN',
            billingDuration: 'P1M',
            billingIncrement: 1,
            unitText: 'MON',
          },
        });
        expect(offer.description).toContain(`${t.price} zł netto / miesiąc`);
      }
      expect(service.description).toContain(`od ${TIERS.starter.price} zł`);
      // dateModified = data renderu (new Date()) — snapshot-diff musi ją normalizować.
      expect(service.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('FAQPage = pytania i odpowiedzi widoczne w sekcji #faq', async () => {
      renderPage();
      const faq = (await waitForJsonLd('FAQPage')) as {
        mainEntity: { name: string; acceptedAnswer: { text: string } }[];
      };
      const section = document.getElementById('faq') as HTMLElement;
      const visible = Array.from(section.querySelectorAll('details')).map((d) => ({
        q: d.querySelector('summary')?.textContent || '',
        a: d.querySelector('.faq-answer')?.textContent || '',
      }));
      expect(faq.mainEntity.length).toBeGreaterThan(0);
      expect(faq.mainEntity).toHaveLength(visible.length);
      faq.mainEntity.forEach((entry, i) => {
        expect(visible[i].q).toContain(entry.name);
        expect(visible[i].a).toBe(entry.acceptedAnswer.text);
      });
    });

    it('canonical /abonament/, indeksowalna (bez noindex)', async () => {
      renderPage();
      await waitFor(() =>
        expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
          'href',
          'https://mixturemarketing.pl/abonament/',
        ),
      );
      expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
    });
  });

  describe('kotwice', () => {
    it('sekcje docelowe istnieją, a każdy link „#…" na stronie ma swój cel', () => {
      renderPage();
      for (const id of ['pricing', 'demo', 'proces', 'porownanie', 'kontakt', 'faq']) {
        expect(document.getElementById(id)).not.toBeNull();
      }
      const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
      expect(anchors.length).toBeGreaterThan(0);
      for (const a of anchors) {
        expect(document.getElementById(a.getAttribute('href')!.slice(1))).not.toBeNull();
      }
    });

    it('„Wybierz pakiet" w hero: preventDefault + płynny scroll (offset nagłówka)', () => {
      renderPage();
      const link = screen.getAllByRole('link', { name: /Wybierz pakiet/ })[0];
      expect(link).toHaveAttribute('href', '#pricing');
      const notPrevented = fireEvent.click(link);
      expect(notPrevented).toBe(false);
      // jsdom: getBoundingClientRect().top = 0, scrollY = 0 → top = -80.
      expect(scrollToSpy).toHaveBeenCalledWith({ top: -80, behavior: 'smooth' });
    });
  });

  describe('CTA → modal preonboard z właściwym pakietem', () => {
    const ctas: Array<[string, () => HTMLElement, TierId, string]> = [
      [
        'hero „Wybierz Starter"',
        () => screen.getAllByRole('button', { name: /^Wybierz Starter/ })[0],
        'starter',
        'hero_cta',
      ],
      [
        'karta Starter',
        () => screen.getAllByRole('button', { name: /^Wybierz Starter/ })[1],
        'starter',
        'pricing_card',
      ],
      [
        'karta Standard',
        () => screen.getByRole('button', { name: /^Wybierz Standard/ }),
        'standard',
        'pricing_card',
      ],
      [
        'karta Premium',
        () => screen.getByRole('button', { name: /^Wybierz Premium/ }),
        'premium',
        'pricing_card',
      ],
      [
        'panel Professional',
        () => screen.getByRole('button', { name: /^Wybierz Professional/ }),
        'professional',
        'pricing_card',
      ],
    ];

    // Wariant z draftem zawierającym inny pakiet (np. powrót po anulowaniu) — modal musi
    // pokazać kliknięty pakiet, nie ten z draftu. Świeża sesja bez draftu: test niżej.
    const seedDraftTier = () =>
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ selectedTier: 'starter' }));

    it.each(ctas)('%s → modal %s + click_tier_button / open_modal', (_n, getBtn, tier, source) => {
      seedDraftTier();
      renderPage();
      expect(dialog()).toBeNull();
      fireEvent.click(getBtn());
      const dlg = dialog() as HTMLDialogElement;
      expect(dlg).toHaveAttribute('open');
      expect(within(dlg).getByRole('heading', { level: 2 })).toHaveTextContent(
        `${TIERS[tier].price} zł / mc netto`,
      );
      expect(within(dlg).getByLabelText(/Wybrany pakiet/)).toHaveValue(tier);
      expect(funnelCalls()).toEqual([
        ['click_tier_button', { tier, price_pln: TIERS[tier].price, source }],
        // open_modal z kliknięcia NIE ma pola source i jest wysyłany dokładnie raz
        // (wcześniej efekt deep-link dokładał drugi z source:'deep_link').
        ['open_modal', { tier, price_pln: TIERS[tier].price }],
      ]);
    });

    it('drugie otwarcie w tej samej wizycie wysyła już tylko click_tier_button + open_modal', () => {
      seedDraftTier();
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /^Wybierz Standard/ }));
      fireEvent.click(screen.getByRole('button', { name: 'Zamknij okno' }));
      trackEventMock.mockClear();
      fireEvent.click(screen.getByRole('button', { name: /^Wybierz Premium/ }));
      expect(funnelCalls()).toEqual([
        [
          'click_tier_button',
          { tier: 'premium', price_pln: TIERS.premium.price, source: 'pricing_card' },
        ],
        ['open_modal', { tier: 'premium', price_pln: TIERS.premium.price }],
      ]);
    });

    it('zamknięcie modala usuwa go z DOM; ponowny klik otwiera znowu', () => {
      seedDraftTier();
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /^Wybierz Standard/ }));
      fireEvent.click(screen.getByRole('button', { name: 'Zamknij okno' }));
      expect(dialog()).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: /^Wybierz Premium/ }));
      const dlg = dialog() as HTMLDialogElement;
      expect(dlg).toHaveAttribute('open');
      expect(within(dlg).getByLabelText(/Wybrany pakiet/)).toHaveValue('premium');
    });

    it('świeża sesja (bez draftu): pierwszy klik otwiera modal z klikniętym pakietem', () => {
      // Regresja (od lipca 2026 do 25.10.2026 na produkcji): PreonboardModal jest zamontowany
      // z tier=null, a selectedTier startuje jako null. Render po kliknięciu zwracał null, efekt
      // showModal() wykonywał się bez <dialog> w DOM i nie wracał — pierwszy klik „Wybierz …"
      // nie otwierał modala, drugi klik tego samego pakietu też nie.
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /^Wybierz Standard/ }));
      const dlg = dialog() as HTMLDialogElement;
      expect(dlg).toHaveAttribute('open');
      expect(within(dlg).getByLabelText(/Wybrany pakiet/)).toHaveValue('standard');
      expect(within(dlg).getByRole('heading', { level: 2 })).toHaveTextContent(
        `${TIERS.standard.price} zł / mc netto`,
      );
      expect(callsOf('open_modal')).toEqual([
        { tier: 'standard', price_pln: TIERS.standard.price },
      ]);
    });
  });

  describe('deep-link ?tier=', () => {
    it.each(Object.keys(TIERS) as TierId[])('?tier=%s → modal otwarty od razu', (tier) => {
      renderPage(`/abonament/?tier=${tier}`);
      const dlg = dialog() as HTMLDialogElement;
      expect(dlg).toHaveAttribute('open');
      expect(within(dlg).getByLabelText(/Wybrany pakiet/)).toHaveValue(tier);
      expect(within(dlg).getByRole('heading', { level: 2 })).toHaveTextContent(
        `${TIERS[tier].price} zł / mc netto`,
      );
      expect(funnelCalls()).toEqual([
        ['open_modal', { tier, price_pln: TIERS[tier].price, source: 'deep_link' }],
      ]);
    });

    it('?tier=xyz (nieznany) → brak modala i eventu', () => {
      renderPage('/abonament/?tier=xyz');
      expect(dialog()).toBeNull();
      expect(callsOf('open_modal')).toEqual([]);
    });

    it('deep-link open_modal wysyłany raz, także po zamknięciu i ponownym otwarciu', () => {
      renderPage('/abonament/?tier=standard');
      fireEvent.click(screen.getByRole('button', { name: 'Zamknij okno' }));
      fireEvent.click(screen.getByRole('button', { name: /^Wybierz Standard/ }));
      expect(callsOf('open_modal')).toEqual([
        { tier: 'standard', price_pln: TIERS.standard.price, source: 'deep_link' },
        { tier: 'standard', price_pln: TIERS.standard.price },
      ]);
    });
  });

  describe('powrót ze Stripe: ?stripe=canceled', () => {
    it('baner anulowania + purchase_canceled + scroll do cennika; modal sam się nie otwiera', () => {
      renderPage('/abonament/?stripe=canceled');
      expect(screen.getByText('Anulowałeś płatność')).toBeInTheDocument();
      expect(screen.getByText(/Twój wybór nie został utracony/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Wróć do pakietów ↑' })).toHaveAttribute(
        'href',
        '#pricing',
      );
      expect(funnelCalls()).toEqual([['purchase_canceled', { recovery_offered: true }]]);
      expect(scrollToSpy).toHaveBeenCalledWith({ top: -80, behavior: 'smooth' });
      expect(dialog()).toBeNull();
    });

    it('bez parametru → brak banera i purchase_canceled', () => {
      renderPage();
      expect(screen.queryByText('Anulowałeś płatność')).not.toBeInTheDocument();
      expect(callsOf('purchase_canceled')).toEqual([]);
    });

    it('wybór pakietu po anulowaniu: source=retry_after_cancel, draft odtworzony, parametr usunięty', () => {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          businessName: 'Ślusarstwo Kowalski',
          email: 'jan@kowalski.pl',
          phone: '+48 600 100 200',
          nip: VALID_NIP,
          consentMarketing: true,
          selectedTier: 'standard',
        }),
      );
      renderPage('/abonament/?stripe=canceled&utm_source=google');
      trackEventMock.mockClear();

      fireEvent.click(screen.getByRole('button', { name: /^Wybierz Standard/ }));

      expect(funnelCalls()).toEqual([
        [
          'click_tier_button',
          { tier: 'standard', price_pln: TIERS.standard.price, source: 'retry_after_cancel' },
        ],
        ['open_modal', { tier: 'standard', price_pln: TIERS.standard.price }],
      ]);
      expect(dialog()).toHaveAttribute('open');
      const dlg = dialog() as HTMLDialogElement;
      expect(within(dlg).getByLabelText(/Nazwa firmy/)).toHaveValue('Ślusarstwo Kowalski');
      expect(within(dlg).getByLabelText(/^Email/)).toHaveValue('jan@kowalski.pl');
      expect(within(dlg).getByLabelText(/Telefon/)).toHaveValue('+48 600 100 200');
      expect(within(dlg).getByLabelText(/^NIP/)).toHaveValue(VALID_NIP);
      expect(within(dlg).getByRole('checkbox', { name: /kontakt marketingowy/ })).toBeChecked();

      // ?stripe usunięty (replace), pozostałe parametry zostają; baner znika.
      expect(screen.getByTestId('router-search').textContent).toBe('?utm_source=google');
      expect(screen.queryByText('Anulowałeś płatność')).not.toBeInTheDocument();

      // Kolejny wybór to już zwykłe pricing_card.
      fireEvent.click(screen.getByRole('button', { name: 'Zamknij okno' }));
      trackEventMock.mockClear();
      fireEvent.click(screen.getByRole('button', { name: /^Wybierz Premium/ }));
      expect(callsOf('click_tier_button')).toEqual([
        { tier: 'premium', price_pln: TIERS.premium.price, source: 'pricing_card' },
      ]);
    });
  });

  describe('UTM → sessionStorage[mm_utm]', () => {
    it('zapisuje znane klucze w stałej kolejności, wartości zakodowane, obce pomija', () => {
      renderPage(
        '/abonament/?gclid=abc&utm_campaign=wiosna%202026&foo=bar&utm_medium=cpc&utm_source=google&fbclid=f1',
      );
      expect(sessionStorage.getItem('mm_utm')).toBe(
        'utm_source=google&utm_medium=cpc&utm_campaign=wiosna%202026&gclid=abc&fbclid=f1',
      );
    });

    it('bez UTM w URL poprzednia wartość zostaje', () => {
      sessionStorage.setItem('mm_utm', 'utm_source=newsletter');
      renderPage('/abonament/');
      expect(sessionStorage.getItem('mm_utm')).toBe('utm_source=newsletter');
    });

    // Wejście przez deep-link (np. kampania z ?tier=). Wejście kliknięciem karty pokrywa
    // test „świeża sesja" w sekcji CTA.
    it('cały lejek: deep-link z UTM → formularz → success_path z UTM → redirect do Stripe', async () => {
      fetchMock.mockImplementation((url: string) =>
        url.includes('/preonboard')
          ? jsonRes(200, { ok: true, data: { client_id: 'c_9' } })
          : jsonRes(200, { ok: true, data: { url: 'https://checkout.mock.invalid/pay' } }),
      );
      renderPage('/abonament/?tier=premium&utm_source=google&utm_medium=cpc');
      const dlg = within(dialog() as HTMLElement);
      fireEvent.change(dlg.getByLabelText(/Nazwa firmy/), { target: { value: 'Firma' } });
      fireEvent.change(dlg.getByLabelText(/^Email/), { target: { value: 'a@firma.pl' } });
      fireEvent.change(dlg.getByLabelText(/Telefon/), { target: { value: '600 100 200' } });
      fireEvent.change(dlg.getByLabelText(/^NIP/), { target: { value: VALID_NIP } });
      fireEvent.click(dlg.getByRole('checkbox', { name: /Akceptuję/ }));
      fireEvent.click(dlg.getByRole('button', { name: /Zapłać/ }));

      await waitFor(() =>
        expect(redirectMock).toHaveBeenCalledWith('https://checkout.mock.invalid/pay'),
      );
      const checkout = JSON.parse(fetchMock.mock.calls[1][1].body);
      expect(checkout.tier).toBe('premium');
      expect(checkout.success_path).toBe(
        '/abonament/dziekujemy?sid={CHECKOUT_SESSION_ID}&utm_source=google&utm_medium=cpc',
      );
      expect(checkout.cancel_path).toBe('/abonament?stripe=canceled');
      expect(funnelCalls()).toEqual([
        ['open_modal', { tier: 'premium', price_pln: TIERS.premium.price, source: 'deep_link' }],
        ['submit_preonboard_attempt', { tier: 'premium' }],
        ['stripe_redirect', { tier: 'premium', client_id: 'c_9', price_pln: TIERS.premium.price }],
      ]);
    });
  });

  describe('view_pricing i sticky bar (IntersectionObserver)', () => {
    it('view_pricing raz, z pathname jako source (mock IO z tests/setup.ts)', () => {
      renderPage();
      expect(callsOf('view_pricing')).toEqual([{ source: '/abonament/' }]);
    });

    it('sticky bar: widoczny po zjechaniu z hero, chowa się nad cennikiem; view_pricing tylko raz', () => {
      type Entry = { el: Element; cb: IntersectionObserverCallback; io: IntersectionObserver };
      const observed: Entry[] = [];
      class ControlledIO {
        constructor(private cb: IntersectionObserverCallback) {}
        observe = (el: Element) => {
          observed.push({ el, cb: this.cb, io: this as unknown as IntersectionObserver });
        };
        disconnect = () => {};
        unobserve = () => {};
        takeRecords = () => [];
      }
      const OrigIO = window.IntersectionObserver;
      window.IntersectionObserver = ControlledIO as unknown as typeof IntersectionObserver;
      try {
        const { unmount } = renderPage();
        const fire = (el: Element, isIntersecting: boolean) =>
          act(() => {
            for (const o of observed.filter((x) => x.el === el)) {
              o.cb([{ isIntersecting, target: el } as IntersectionObserverEntry], o.io);
            }
          });
        const pricing = document.getElementById('pricing') as HTMLElement;
        const hero = document.querySelector('section') as HTMLElement;
        expect(observed.map((o) => o.el)).toEqual(expect.arrayContaining([pricing, hero]));

        const bar = screen
          .getByText(`Od ${TIERS.starter.price} zł / mc`)
          .closest('div.fixed') as HTMLElement;
        expect(bar).toHaveAttribute('aria-hidden', 'true');
        expect(document.body.dataset.stickyMobileBar).toBeUndefined();
        expect(callsOf('view_pricing')).toEqual([]);

        fire(hero, false);
        expect(bar).toHaveAttribute('aria-hidden', 'false');
        expect(document.body.dataset.stickyMobileBar).toBe('true');

        fire(pricing, true);
        expect(bar).toHaveAttribute('aria-hidden', 'true');
        expect(document.body.dataset.stickyMobileBar).toBeUndefined();
        expect(callsOf('view_pricing')).toEqual([{ source: '/abonament/' }]);

        fire(pricing, false);
        fire(pricing, true);
        expect(callsOf('view_pricing')).toHaveLength(1);

        fire(pricing, false);
        expect(document.body.dataset.stickyMobileBar).toBe('true');
        fireEvent.click(within(bar).getByRole('button', { name: /Wybierz pakiet/ }));
        expect(scrollToSpy).toHaveBeenCalledWith({ top: -80, behavior: 'smooth' });

        unmount();
        expect(document.body.dataset.stickyMobileBar).toBeUndefined();
      } finally {
        window.IntersectionObserver = OrigIO;
      }
    });
  });
});
