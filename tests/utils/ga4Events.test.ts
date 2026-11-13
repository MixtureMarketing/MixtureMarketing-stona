import fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { applyConsent, trackEvent } from '@/utils/analytics';
import { GA4_EVENTS, REFUSED, sanitizeGa4Event, scanText } from '@/utils/ga4Events';
import { cleanPageContext, cleanUrl } from '@/utils/ga4Page';

/**
 * MIX-1457: jedna allowlista zdarzen GA4 i jeden detektor e-maila / telefonu.
 * Odmowa parametru = wartosc "(odrzucone)", zdarzenie idzie dalej; nieznane zdarzenie nie idzie.
 * Kazda odmowa ma blizniaka, ktory przechodzi bez zmian.
 */
let track: Mock<(event: string, data?: Record<string, unknown>) => void>;
let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  track = vi.fn<(event: string, data?: Record<string, unknown>) => void>();
  window.zaraz = { track, consent: { set: vi.fn() } };
  window.dataLayer = [];
  warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});
afterEach(() => {
  delete window.zaraz;
  delete window.dataLayer;
  window.history.replaceState({}, '', '/');
  document.title = '';
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

const sent = (): Record<string, unknown> => {
  expect(track).toHaveBeenCalledTimes(1);
  return track.mock.calls[0][1] as Record<string, unknown>;
};
/** Linia powodu nie powtarza wartosci (ani adresu, ani cyfr). */
const warnLineClean = () => {
  for (const c of warn.mock.calls) expect(String(c[0])).not.toMatch(/@|\d{3}/);
};

describe('kazde zdarzenie strony jest w allowliscie', () => {
  it.each([
    'calculator_submit',
    'audit_request',
    'calculator_step',
    'click_phone',
    'click_email',
    'consultation_click',
    'form_submit',
    'lead_start',
    'contact_form_success',
    'purchase',
    'stripe_redirect',
    'web_vital_lcp',
  ])('%s jest znane', (name) => {
    expect(Object.prototype.hasOwnProperty.call(GA4_EVENTS, name)).toBe(true);
  });
});

describe('nieznane zdarzenie nie idzie (jedyna odmowa calego zdarzenia)', () => {
  it.each([
    'phone_click',
    'email_click',
    '',
    '__proto__',
    'constructor',
    'toString',
    'click_phone ',
  ])('odmowa: %j', (name) => {
    trackEvent(name, { link_location: 'header' });
    expect(track).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toMatch(/^trackEvent: odmowa: nieznane zdarzenie/);
  });
  it('blizniak: click_phone idzie bez linii w konsoli', () => {
    trackEvent('click_phone', { link_location: 'header' });
    expect(sent()).toEqual({ link_location: 'header' });
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('odmowa zastepuje tylko jeden parametr wartoscia "(odrzucone)"', () => {
  it.each<[string, string, Record<string, unknown>, Record<string, unknown>]>([
    [
      'telefon w utm_campaign, purchase dochodzi',
      'purchase',
      { transaction_id: 'cs_live_a1B2c3', currency: 'PLN', utm_campaign: 'jan_600_100_200' },
      { transaction_id: 'cs_live_a1B2c3', currency: 'PLN', utm_campaign: REFUSED },
    ],
    [
      'e-mail w link_location',
      'click_email',
      { link_location: 'jan@firma.pl' },
      { link_location: REFUSED },
    ],
    [
      'telefon jako liczba w polu liczbowym',
      'open_modal',
      { tier: 'starter', price_pln: 600100200 },
      { tier: 'starter', price_pln: REFUSED },
    ],
    [
      'kod bledu z telefonem',
      'preonboard_error',
      { tier: 'starter', error_code: 'HTTP_600_100_200', http_status: 500 },
      { tier: 'starter', error_code: REFUSED, http_status: 500 },
    ],
    [
      'pakiet ze spacja (poza ASCII allowlista)',
      'consultation_click',
      { contact_type: 'web', source: '/strony-www/', package: 'Pakiet Start' },
      { contact_type: 'web', source: '/strony-www/', package: REFUSED },
    ],
  ])('%s', (_l, event, params, expected) => {
    trackEvent(event, params);
    expect(sent()).toEqual(expected);
    warnLineClean();
  });

  it('blizniak: te same zdarzenia z czystymi wartosciami ida bez zmian', () => {
    const cases: [string, Record<string, unknown>][] = [
      [
        'purchase',
        { transaction_id: 'cs_live_a1B2c3', currency: 'PLN', utm_campaign: 'black_friday' },
      ],
      ['click_email', { link_location: 'footer' }],
      ['open_modal', { tier: 'starter', price_pln: 999999 }],
      ['preonboard_error', { tier: 'starter', error_code: 'HTTP_500', http_status: 500 }],
      [
        'consultation_click',
        { contact_type: 'web', source: '/strony-www/', package: 'pakiet-start' },
      ],
    ];
    for (const [event, params] of cases) trackEvent(event, params);
    expect(track.mock.calls.map((c) => c[1])).toEqual(cases.map((c) => c[1]));
  });

  it('brak utm (undefined / null) = parametru brak, nie odmowa', () => {
    trackEvent('purchase', {
      transaction_id: 'cs_test_a1',
      currency: 'PLN',
      utm_source: undefined,
      utm_medium: null,
    });
    expect(sent()).toEqual({ transaction_id: 'cs_test_a1', currency: 'PLN' });
  });

  it('nieznany klucz odpada bez czytania wartosci (getter, ktory rzuca, nie jest wolany)', () => {
    const params = Object.defineProperty({ link_location: 'header' }, 'g', {
      enumerable: true,
      get() {
        throw new Error('x');
      },
    });
    trackEvent('click_phone', params);
    expect(sent()).toEqual({ link_location: 'header' });
  });

  it('getter dozwolonego klucza rzuca -> ten parametr "(odrzucone)"', () => {
    const params = Object.defineProperty({}, 'link_location', {
      enumerable: true,
      get() {
        throw new Error('x');
      },
    });
    trackEvent('click_phone', params);
    expect(sent()).toEqual({ link_location: REFUSED });
  });

  it('klucz z prototypu nie jest czytany (tylko wlasne pola)', () => {
    trackEvent(
      'click_phone',
      Object.create({ link_location: 'header' }) as Record<string, unknown>,
    );
    expect(sent()).toEqual({});
  });

  it('parametry, ktore nie sa obiektem -> zdarzenie bez parametrow, linia odmowy w dev', () => {
    vi.stubEnv('DEV', true);
    trackEvent('click_phone', ['header'] as unknown as Record<string, unknown>);
    expect(sent()).toEqual({});
    expect(String(warn.mock.calls[0][0])).toBe(
      'trackEvent: click_phone: odrzucone (parametry) (poza allowlista)',
    );
  });
});

describe('linia odmowy tylko w trybie dev', () => {
  it('produkcja (DEV=false): odmowa bez linii w konsoli, zdarzenie idzie z "(odrzucone)"', () => {
    vi.stubEnv('DEV', false);
    trackEvent('click_phone', { link_location: 'a@b.pl' });
    expect(sent()).toEqual({ link_location: REFUSED });
    expect(warn).not.toHaveBeenCalled();
  });
  it('blizniak: dev (DEV=true) -> jedna linia z nazwa parametru i powodem', () => {
    vi.stubEnv('DEV', true);
    trackEvent('click_phone', { link_location: 'a@b.pl' });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toBe(
      'trackEvent: click_phone: odrzucone link_location (wyglada na e-mail lub telefon)',
    );
  });
});

describe('dataLayer: sygnal zgody przez te sama brame', () => {
  it('applyConsent dopisuje cookie_consent_update bez parametrow', () => {
    applyConsent({ analytics: true, marketing: false });
    expect(window.dataLayer).toContainEqual({ event: 'cookie_consent_update' });
  });
  it('dataLayer tez dostaje oczyszczony page_location', () => {
    window.history.replaceState({}, '', '/?utm_campaign=600100200');
    applyConsent({ analytics: true, marketing: false });
    const pushed = (window.dataLayer ?? []).find(
      (e) => (e as { event?: string }).event === 'cookie_consent_update',
    ) as Record<string, unknown>;
    expect(pushed.page_location).toBe(`http://localhost:3000/?utm_campaign=${REFUSED}`);
  });
});

describe('page_location / page_referrer / page_title przez ten sam detektor', () => {
  it('telefon w utm_campaign adresu -> wyslany page_location bez numeru', () => {
    window.history.replaceState({}, '', '/abonament/?utm_source=google&utm_campaign=600100200');
    trackEvent('click_phone', { link_location: 'header' });
    const p = sent();
    expect(p.page_location).toBe(
      `http://localhost:3000/abonament/?utm_source=google&utm_campaign=${REFUSED}`,
    );
    expect(JSON.stringify(p)).not.toMatch(/600/);
  });
  it('blizniak: czysty adres z utm -> brak nadpisania (GA4 wysle ten sam)', () => {
    window.history.replaceState({}, '', '/abonament/?utm_source=google&utm_campaign=black_friday');
    trackEvent('click_phone', { link_location: 'header' });
    expect(sent()).toEqual({ link_location: 'header' });
  });
  it('e-mail w sciezce, w kluczu i we fragmencie', () => {
    expect(cleanUrl('https://x.pl/kontakt/jan@firma.pl/?a=1').value).toBe(
      `https://x.pl/${REFUSED}?a=1`,
    );
    expect(cleanUrl('https://x.pl/?jan%40firma.pl=1').value).toBe(`https://x.pl/?${REFUSED}=1`);
    expect(cleanUrl('https://x.pl/a#tel-600-100-200').value).toBe('https://x.pl/a');
    expect(cleanUrl('https://x.pl/a?q=600+100+200').value).toBe(`https://x.pl/a?q=${REFUSED}`);
    expect(cleanUrl('https://x.pl/a?q=%E0%A4').why).toBe('unreadable');
    expect(cleanUrl('nie adres').value).toBe(REFUSED);
  });
  it('blizniaki: zwykle adresy strony bez zmian', () => {
    for (const u of [
      'https://mixturemarketing.pl/blog/2025/11/28/',
      'https://x.pl/a?gclid=Cj0KCQiA4L67BhDUARIsADWrl7H&utm_campaign=promo-12-2025#oferta',
      'https://www.google.com/',
      '',
    ]) {
      expect(cleanUrl(u)).toEqual({ value: u, why: null });
    }
  });
  it('telefon w tytule strony -> page_title "(odrzucone)"; blizniak bez nadpisania', () => {
    document.title = 'Oddzwonimy: 600 100 200';
    trackEvent('click_phone', { link_location: 'header' });
    expect(sent()).toEqual({ link_location: 'header', page_title: REFUSED });
    track.mockClear();
    document.title = 'Strona w abonamencie | Mixture Marketing 2025';
    trackEvent('click_phone', { link_location: 'header' });
    expect(sent()).toEqual({ link_location: 'header' });
  });
  it('referrer z e-mailem -> page_referrer oczyszczony; blizniak bez zmian', () => {
    expect(
      cleanPageContext({ location: '', referrer: 'https://poczta.pl/?to=jan@firma.pl', title: '' }),
    ).toEqual({
      params: { page_referrer: `https://poczta.pl/?to=${REFUSED}` },
      refused: [{ param: 'page_referrer', why: 'personal' }],
    });
    expect(
      cleanPageContext({ location: '', referrer: 'https://www.google.com/', title: '' }),
    ).toEqual({ params: {}, refused: [] });
  });
});

describe('liczbowe id kampanii (regula jawna)', () => {
  // Telefon PL ma 9 cyfr (z 48: 11), E.164 do 15; id kampanii Google Ads 10-11 cyfr, Meta 15-18.
  // Dlugosci sie pokrywaja, wiec kazdy ciag 9+ cyfr w utm_* to "(odrzucone)"; zdarzenie zostaje.
  it.each(['21567834512', '120210987654321098', 'gads_21567834512', 'pmax_19876543210'])(
    'utm_campaign %s -> "(odrzucone)", purchase dochodzi',
    (v) => {
      trackEvent('purchase', { transaction_id: 'cs_live_a1', currency: 'PLN', utm_campaign: v });
      expect(sent()).toEqual({
        transaction_id: 'cs_live_a1',
        currency: 'PLN',
        utm_campaign: REFUSED,
      });
    },
  );
  it.each([
    '2025_11_newsletter_v2',
    'cyber_monday_2025_12_01',
    'q4_2025_remarketing',
    'promo-12-2025',
  ])('blizniak: %s idzie bez zmian', (v) => {
    trackEvent('purchase', { transaction_id: 'cs_live_a1', currency: 'PLN', utm_campaign: v });
    expect(sent()).toEqual({ transaction_id: 'cs_live_a1', currency: 'PLN', utm_campaign: v });
  });
});

describe('identyfikatory', () => {
  const U = '0f8fad5b-d9cb-469f-a165-70867728950e';
  it.each<[string, string, Record<string, unknown>, string]>([
    ['client_id z kropka', 'stripe_redirect', { client_id: 'jan.kowalski' }, 'client_id'],
    ['client_id z @', 'stripe_redirect', { client_id: 'jan@firma.pl' }, 'client_id'],
    ['client_id 600--100--200', 'stripe_redirect', { client_id: '600--100--200' }, 'client_id'],
    ['client_id token (nie UUID)', 'stripe_redirect', { client_id: 'cus_AbC123' }, 'client_id'],
    ['UUID z dopisanym telefonem', 'contact_form_success', { lead_id: `${U}600100200` }, 'lead_id'],
    ['UUID z nowa linia', 'contact_form_success', { lead_id: `${U}\n` }, 'lead_id'],
    [
      'web-vitals ogon 14 cyfr',
      'web_vital_lcp',
      { metric_id: 'v6-1762970000000-12345678901234' },
      'metric_id',
    ],
    [
      'web-vitals z dopiskiem',
      'web_vital_lcp',
      { metric_id: 'v6-1762970000000-1234567890123x' },
      'metric_id',
    ],
    ['Stripe z telefonem', 'purchase', { transaction_id: 'cs_live_600100200' }, 'transaction_id'],
    [
      'Stripe: telefon po literze',
      'purchase',
      { transaction_id: 'cs_live_a600100200' },
      'transaction_id',
    ],
  ])('%s -> "(odrzucone)"', (_l, event, params, key) => {
    trackEvent(event, params);
    expect(sent()[key]).toBe(REFUSED);
  });
  it.each<[string, string, Record<string, unknown>]>([
    ['client_id UUID', 'stripe_redirect', { client_id: U }],
    ['lead_id UUID wielkimi', 'contact_form_success', { lead_id: U.toUpperCase() }],
    ['web-vitals 13+13', 'web_vital_lcp', { metric_id: 'v6-1762970000000-1234567890123' }],
    ['Stripe zwykly', 'purchase', { transaction_id: 'cs_live_a1B2c3D4e5' }],
    ['Stripe 8 cyfr', 'purchase', { transaction_id: 'cs_live_a60010020b' }],
  ])('blizniak: %s idzie bez zmian', (_l, event, params) => {
    trackEvent(event, params);
    expect(sent()).toEqual(params);
  });
});

describe('detektor (jeden dla parametrow, id i adresow)', () => {
  it.each([
    ['separatory podwojne', '600--100--200'],
    ['separatory podwojne _', '600__100__200'],
    ['spacja i _', '600 _ 100 _ 200'],
    ['mieszane separatory', '600_-100-_200'],
    ['cyfry w kolkach (\\p{No})', '❻⓿⓿❶⓿⓿❷⓿⓿'],
    ['cyfry arabsko-indyjskie', '٦٠٠١٠٠٢٠٠'],
    ['cyfry pelnej szerokosci', '６００１００２００'],
    ['zerowa spacja', '600​100​200'],
    ['NBSP', '600 100 200'],
    ['encje HTML dziesietne', '&#54;&#48;&#48;&#49;&#48;&#48;&#50;&#48;&#48;'],
    ['encje HTML szesnastkowe', '&#x36;&#x30;&#x30;&#x31;&#x30;&#x30;&#x32;&#x30;&#x30;'],
    ['kodowanie % podwojne', '%2536%2530%2530%2531%2530%2530%2532%2530%2530'],
    ['@ pelnej szerokosci', 'jan＠firma.pl'],
    ['encja @', 'jan&#64;firma.pl'],
    ['(at) z domena', 'jan (at) firma.pl'],
    ['( at ) bez domeny', 'jan ( at ) firma'],
    ['(a ZW t)', 'jan(a​t)firma.pl'],
    ['_at_ z domena', 'jan_at_firma.pl'],
    ['at ... kropka pl', 'jan at firma kropka pl'],
    ['9 cyfr pod rzad', 'x600100200'],
  ])('%s -> personal', (_l, v) => {
    expect(scanText(v)).toBe('personal');
  });
  it.each([
    ['zwykla kampania', 'black_friday_2025-11-28'],
    ['8 cyfr w grupach', '600-100-20'],
    ['600-100 (krotkie id)', '600-100'],
    ['jan-at-home', 'jan-at-home'],
    ['web at scale', 'Web at scale'],
    ['(atak)', 'jan (atak) firma'],
    ['litera przerywa grupe', '600100a200'],
    ['data', '2025/11/28'],
    ['anecdotes', 'deal at anecdotes'],
  ])('blizniak: %s -> czysto', (_l, v) => {
    expect(scanText(v)).toBeNull();
  });
  it.each([
    ['za dlugi tekst', 'a'.repeat(2049)],
    ['bledne kodowanie %', '%E0%A4'],
    ['%u', '%u0036%u0030'],
    ['4x kodowanie', 'jan%25252540firma.pl'],
  ])('%s -> unreadable', (_l, v) => {
    expect(scanText(v)).toBe('unreadable');
  });
  it('ReDoS: 2048 znakow po kazdym wzorcu ponizej 50 ms', () => {
    for (const s of [
      ` at ${'a'.repeat(2040)}`,
      ' at a-'.repeat(340),
      `at-${'a-'.repeat(1020)}`,
      '(at '.repeat(512),
      '-'.repeat(2048),
      `at ${'-'.repeat(2044)}`,
      '1 '.repeat(1024),
    ]) {
      const t0 = performance.now();
      scanText(s);
      expect(performance.now() - t0).toBeLessThan(50);
    }
  });
});

/** Deterministyczny generator (testy nie zaleza od losowania). */
const rng = (seed: number) => () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};

describe('falszywe odmowy = 0', () => {
  it('sciezki strony (sitemap + trasy) w source, page_path i page_location', () => {
    const xml = fs.readFileSync('public/sitemap.xml', 'utf8');
    const locs = [...xml.matchAll(/<loc>https:\/\/[^/<]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
    const routes = [...fs.readFileSync('config/routes.tsx', 'utf8').matchAll(/path: *'([^']+)'/g)]
      .map((m) => m[1])
      .filter((p) => p.startsWith('/'))
      .map((p) => p.replace(':slug', 'przyklad-wpisu'));
    const paths = [
      ...new Set([...locs, ...routes, ...routes.map((p) => (p.endsWith('/') ? p : `${p}/`))]),
    ];
    expect(paths.length).toBeGreaterThanOrEqual(150);
    const bad: string[] = [];
    for (const p of paths) {
      const a = sanitizeGa4Event('calculator_submit', { source: p });
      const b = sanitizeGa4Event('web_vital_lcp', { metric_name: 'LCP', page_path: p });
      const c = cleanUrl(
        `https://mixturemarketing.pl${p}?utm_source=google&utm_campaign=promo-12-2025`,
      );
      if (!a.ok || a.refused.length || !b.ok || b.refused.length || c.why) bad.push(p);
    }
    expect(bad).toEqual([]);
  });

  it('20000 id kazdego rodzaju: web-vitals, lead UUID, client UUID, Stripe cs_live_ (58)', () => {
    const r = rng(1457);
    const b62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const rnd = (n: number) => Array.from({ length: n }, () => b62[Math.floor(r() * 62)]).join('');
    const hex = (n: number) =>
      Array.from({ length: n }, () => '0123456789abcdef'[Math.floor(r() * 16)]).join('');
    const counts = { vitals: 0, lead: 0, client: 0, stripe: 0 };
    const refusedAny = (ev: string, p: Record<string, unknown>) => {
      const x = sanitizeGa4Event(ev, p);
      return !x.ok || x.refused.length > 0;
    };
    for (let i = 0; i < 20000; i++) {
      const vid = `v6-${1762970000000 - Math.floor(r() * 1e9)}-${Math.floor(r() * (9e12 - 1)) + 1e12}`;
      const uuid = `${hex(8)}-${hex(4)}-4${hex(3)}-${'89ab'[Math.floor(r() * 4)]}${hex(3)}-${hex(12)}`;
      if (refusedAny('web_vital_inp', { metric_name: 'INP', metric_value: 120, metric_id: vid }))
        counts.vitals++;
      if (refusedAny('contact_form_success', { lead_id: uuid })) counts.lead++;
      if (refusedAny('stripe_redirect', { tier: 'starter', client_id: uuid, price_pln: 990 }))
        counts.client++;
      if (refusedAny('purchase', { transaction_id: `cs_live_${rnd(58)}`, currency: 'PLN' }))
        counts.stripe++;
    }
    expect(counts).toEqual({ vitals: 0, lead: 0, client: 0, stripe: 0 });
  });
});
