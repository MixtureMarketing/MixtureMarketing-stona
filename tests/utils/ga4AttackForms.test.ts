import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { installContactLinkTracking, trackEvent } from '@/utils/analytics';
import { REFUSED } from '@/utils/ga4Events';

/**
 * MIX-1457: stały zestaw form ataku na bramę zdarzeń GA4 (odmowa + dozwolony bliźniak).
 * Oczekiwanie:
 *   S         zdarzenie idzie, każdy dozwolony parametr bez zmian, bez "(odrzucone)"
 *   R:<klucz> zdarzenie idzie, <klucz> = "(odrzucone)"
 *   D:<klucz> zdarzenie idzie, nieznany <klucz> odpada (nie jest wysłany)
 *   N         zdarzenie nie idzie (nieznana nazwa albo link bez tel:/mailto:)
 * Ryzyko resztkowe (format przyjęty, choć mógłby nieść cyfry) ma etykietę "resztkowe".
 */
let track: Mock<(event: string, data?: Record<string, unknown>) => void>;
beforeEach(() => {
  track = vi.fn<(event: string, data?: Record<string, unknown>) => void>();
  window.zaraz = { track, consent: { set: vi.fn() } };
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});
afterEach(() => {
  delete window.zaraz;
  document.body.innerHTML = '';
  window.history.replaceState({}, '', '/');
  document.title = '';
  vi.restoreAllMocks();
});

const U = '0f8fad5b-d9cb-469f-a165-70867728950e';
const TX = 'cs_test_a1';
type Form = [
  id: string,
  exp: string,
  label: string,
  event: string,
  params: Record<string, unknown> | null,
];

const FORMS: Form[] = [
  [
    'A1',
    'R:package',
    'telefon rozbity na dwa parametry',
    'consultation_click',
    { package: '600 100', source: '/200/' },
  ],
  [
    'A1t',
    'S',
    'bliźniak (ASCII)',
    'consultation_click',
    { package: 'pakiet-start', source: '/kontakt/' },
  ],
  [
    'A2',
    'R:source',
    'telefon %20 w ścieżce',
    'calculator_submit',
    { source: '/kontakt/600%20100%20200' },
  ],
  ['A2t', 'S', 'bliźniak', 'calculator_submit', { source: '/kontakt/' }],
  ['A3', 'R:source', 'podkreślenia w ścieżce', 'view_pricing', { source: '/x/600_100_200' }],
  ['A3t', 'S', 'bliźniak', 'view_pricing', { source: '/x/a_b_c' }],
  ['A4', 'R:package', 'przecinki', 'consultation_click', { package: '600,100,200' }],
  ['A4t', 'S', 'bliźniak (ASCII)', 'consultation_click', { package: 'web-seo' }],
  ['A5', 'R:lead_id', 'UUID+telefon', 'contact_form_success', { lead_id: `${U}600100200` }],
  ['A5b', 'R:lead_id', 'UUID\\ntelefon', 'contact_form_success', { lead_id: `${U}\n600100200` }],
  ['A5c', 'R:lead_id', 'telefon UUID', 'contact_form_success', { lead_id: `600100200 ${U}` }],
  ['A5t', 'S', 'bliźniak', 'contact_form_success', { lead_id: U }],
  [
    'A6',
    'S',
    'UUID z samych cyfr (resztkowe: format UUID)',
    'contact_form_success',
    { lead_id: '48600100-2000-0000-0000-000000000000' },
  ],
  [
    'A7',
    'S',
    'ogon web-vitals (resztkowe: format biblioteki)',
    'web_vital_lcp',
    { metric_name: 'LCP', metric_id: 'v6-1762970000000-0048600100200' },
  ],
  [
    'A7b',
    'R:metric_id',
    'id web-vitals + e-mail',
    'web_vital_lcp',
    { metric_name: 'LCP', metric_id: 'v6-1762970000000-1234567890123a@b.pl' },
  ],
  [
    'A8',
    'R:package',
    '200k + telefon',
    'consultation_click',
    { package: `${'a'.repeat(200000)} 600 100 200` },
  ],
  [
    'A8t',
    'R:package',
    '200k bez telefonu (ponad 2048 = nieczytelne)',
    'consultation_click',
    { package: 'a'.repeat(200000) },
  ],
  ['A9', 'S', 'null w parametrze', 'click_phone', { link_location: null }],
  ['A9b', 'S', 'parametry null', 'click_phone', null],
  ['A10', 'R:link_location', 'e-mail w link_location', 'click_email', { link_location: 'x@y.pl' }],
  ['A10t', 'S', 'bliźniak', 'click_email', { link_location: 'footer' }],
  [
    'A11',
    'R:package',
    'telefon cyframi arabsko-indyjskimi',
    'consultation_click',
    { package: '٦٠٠١٠٠٢٠٠' },
  ],
  [
    'A12',
    'R:link_location',
    'obiekt String z e-mailem',
    'click_email',
    { link_location: new String('a@b.pl') },
  ],
  [
    'A13',
    'D:n',
    'BigInt w nieznanym kluczu',
    'click_phone',
    { link_location: 'header', n: BigInt(600100200) },
  ],
  ['A14', 'R:score', 'ujemna liczba-telefon', 'audit_request', { score: -600100200 }],
  ['A14t', 'S', 'bliźniak', 'audit_request', { source: '/audyt/', score: 87 }],
  [
    'A15',
    'R:utm_campaign',
    'utm z podkreśleniami',
    'purchase',
    { transaction_id: TX, utm_campaign: 'jan_600_100_200' },
  ],
  ['A15t', 'S', 'bliźniak', 'purchase', { transaction_id: TX, utm_campaign: 'black_friday' }],
  ['A16', 'R:package', '(at) e-mail', 'consultation_click', { package: 'jan (at) firma.pl' }],
  ['A17', 'R:source', 'tylda', 'view_pricing', { source: '/600~100~200' }],
  [
    'A18',
    'S',
    'litera zamiast cyfry (resztkowe: litera przerywa grupę)',
    'consultation_click',
    { package: '60010020o' },
  ],
  [
    'A19',
    'D:m',
    'Map z e-mailem w nieznanym kluczu',
    'click_email',
    { link_location: 'header', m: new Map([['a', 'a@b.pl']]) },
  ],
  [
    'A20',
    'R:error_code',
    'kod błędu z telefonem',
    'preonboard_error',
    { tier: 'starter', error_code: 'HTTP_600_100_200' },
  ],
  ['A20t', 'S', 'bliźniak', 'preonboard_error', { tier: 'starter', error_code: 'HTTP_500' }],
  ['A21', 'N', 'zdarzenie hasOwnProperty', 'hasOwnProperty', {}],
  ['A22', 'N', 'zdarzenie ze spacją', 'click_phone ', { link_location: 'header' }],
  [
    'A23',
    'S',
    'client_id UUID',
    'stripe_redirect',
    { tier: 'starter', client_id: '3d9e5a10-6812-4a3b-9f00-123456789abc', price_pln: 990 },
  ],
  [
    'N1',
    'R:utm_campaign',
    'utm cyfry arabsko-indyjskie',
    'purchase',
    { transaction_id: TX, utm_campaign: '٦٠٠١٠٠٢٠٠' },
  ],
  ['N1t', 'S', 'bliźniak (ASCII)', 'purchase', { transaction_id: TX, utm_campaign: 'promocja-2' }],
  [
    'N2',
    'R:package',
    'pełna szerokość ze spacjami',
    'consultation_click',
    { package: '６００ １００ ２００' },
  ],
  ['N2t', 'S', 'bliźniak (ASCII)', 'consultation_click', { package: 'pakiet-6' }],
  [
    'N3',
    'R:utm_campaign',
    'ZWSP między grupami',
    'purchase',
    { transaction_id: TX, utm_campaign: '600​100​200' },
  ],
  [
    'N3b',
    'R:package',
    'ZWJ/ZWNJ/WJ/BOM w środku',
    'consultation_click',
    { package: '6‍0‌0 1⁠0 0 2﻿00' },
  ],
  ['N3c', 'R:package', '(ZW at ZW) e-mail', 'consultation_click', { package: 'jan(​at​)firma.pl' }],
  ['N3t', 'S', 'bliźniak (ASCII)', 'purchase', { transaction_id: TX, utm_campaign: 'zima2025' }],
  ['N4', 'R:package', 'grupy z NBSP', 'consultation_click', { package: '600 100 200' }],
  [
    'N4b',
    'R:package',
    'spacja ideograficzna / wąska',
    'consultation_click',
    { package: '600　100 200' },
  ],
  ['N4t', 'S', 'bliźniak (ASCII)', 'consultation_click', { package: 'pakiet_start' }],
  [
    'N5',
    'R:source',
    'ucieczki %u0036',
    'calculator_submit',
    { source: '/x/%u0036%u0030%u0030%u0031%u0030%u0030%u0032%u0030%u0030' },
  ],
  ['N5t', 'S', 'bliźniak', 'calculator_submit', { source: '/o-nas/%C5%BC' }],
  [
    'N6',
    'R:package',
    'encje HTML dziesiętne',
    'consultation_click',
    { package: '&#54;&#48;&#48;&#49;&#48;&#48;&#50;&#48;&#48;' },
  ],
  ['N6b', 'R:package', 'encja HTML @', 'consultation_click', { package: 'jan&#64;firma.pl' }],
  [
    'N6c',
    'R:package',
    'encje HTML szesnastkowe',
    'consultation_click',
    { package: '&#x36;&#x30;&#x30;&#x31;&#x30;&#x30;&#x32;&#x30;&#x30;' },
  ],
  ['N7', 'R:package', '+48(600)100-200', 'consultation_click', { package: '+48(600)100-200' }],
  ['N7t', 'S', 'bliźniak (ASCII)', 'consultation_click', { package: 'pakiet-start-2-3' }],
  [
    'N8',
    'R:package',
    '2048 znaków, telefon na końcu',
    'consultation_click',
    { package: `${'a'.repeat(2036)} 600100200` },
  ],
  [
    'N8b',
    'R:package',
    '2049 znaków (nieczytelne)',
    'consultation_click',
    { package: 'a'.repeat(2049) },
  ],
  ['N8t', 'S', 'bliźniak 100 znaków', 'consultation_click', { package: 'a'.repeat(100) }],
  [
    'N9',
    'R:source',
    'telefon zakodowany 2x',
    'calculator_submit',
    { source: '/x/%2536%2530%2530%2531%2530%2530%2532%2530%2530' },
  ],
  ['N9b', 'R:source', '@ zakodowane 3x', 'calculator_submit', { source: '/x/jan%252540firma.pl' }],
  [
    'N9c',
    'R:source',
    '@ zakodowane 4x',
    'calculator_submit',
    { source: '/x/jan%25252540firma.pl' },
  ],
  ['N9d', 'R:source', 'bomba %25 x682', 'calculator_submit', { source: `/${'%25'.repeat(682)}` }],
  ['N9t', 'S', 'bliźniak', 'calculator_submit', { source: '/blog/%C5%BCaba/' }],
  [
    'N10',
    'R:utm_campaign',
    'cyfry w kółkach',
    'purchase',
    { transaction_id: TX, utm_campaign: '❻⓿⓿❶⓿⓿❷⓿⓿' },
  ],
  [
    'N10b',
    'R:package',
    'cyfry w kółkach ze spacjami',
    'consultation_click',
    { package: '➏⓪⓪ ➊⓪⓪ ➋⓪⓪' },
  ],
  [
    'N11',
    'R:utm_campaign',
    'cyfry CJK (poza ASCII)',
    'purchase',
    { transaction_id: TX, utm_campaign: '六〇〇一〇〇二〇〇' },
  ],
  [
    'N12',
    'R:client_id',
    'client_id 600--100--200',
    'stripe_redirect',
    { tier: 'starter', client_id: '600--100--200', price_pln: 990 },
  ],
  [
    'N13',
    'R:client_id',
    'client_id 600__100__200',
    'stripe_redirect',
    { tier: 'starter', client_id: '600__100__200', price_pln: 990 },
  ],
  [
    'N13b',
    'R:client_id',
    'client_id _- mieszane',
    'stripe_redirect',
    { tier: 'starter', client_id: '600_-100-_200', price_pln: 990 },
  ],
  [
    'N13c',
    'R:client_id',
    'client_id pojedyncze cyfry',
    'stripe_redirect',
    { tier: 'starter', client_id: '6-0-0-1-0-0-2-0-0', price_pln: 990 },
  ],
  [
    'N13d',
    'R:client_id',
    'client_id e-mail',
    'stripe_redirect',
    { tier: 'starter', client_id: 'jan@firma.pl', price_pln: 990 },
  ],
  [
    'N13t',
    'S',
    'bliźniak (UUID, jedyny format Hub)',
    'stripe_redirect',
    { tier: 'starter', client_id: U, price_pln: 990 },
  ],
  [
    'N14',
    'R:utm_campaign',
    'znaki łączące',
    'purchase',
    { transaction_id: TX, utm_campaign: '6́0́0́1́0́0́2́0́0́' },
  ],
  [
    'N15',
    'R:utm_campaign',
    'cyfry matematyczne pogrubione',
    'purchase',
    { transaction_id: TX, utm_campaign: '𝟔𝟎𝟎𝟏𝟎𝟎𝟐𝟎𝟎' },
  ],
  ['N16', 'R:package', 'indeksy górne', 'consultation_click', { package: '⁶⁰⁰¹⁰⁰²⁰⁰' }],
  ['N17', 'R:package', 'małe @', 'consultation_click', { package: 'jan﹫firma.pl' }],
  [
    'N17b',
    'R:utm_campaign',
    '@ pełnej szerokości',
    'purchase',
    { transaction_id: TX, utm_campaign: 'jan＠firma.pl' },
  ],
  [
    'N18',
    'R:utm_campaign',
    'jan at firma pl (spacje poza ASCII allowlistą)',
    'purchase',
    { transaction_id: TX, utm_campaign: 'jan at firma pl' },
  ],
  [
    'N18b',
    'R:utm_campaign',
    'jan.kowalski gmail.com',
    'purchase',
    { transaction_id: TX, utm_campaign: 'jan.kowalski gmail.com' },
  ],
  [
    'N19',
    'R:utm_campaign',
    'jan_at_firma.pl',
    'purchase',
    { transaction_id: TX, utm_campaign: 'jan_at_firma.pl' },
  ],
  [
    'N20',
    'R:utm_campaign',
    'at ... kropka pl',
    'purchase',
    { transaction_id: TX, utm_campaign: 'jan at firma kropka pl' },
  ],
  [
    'N20t',
    'S',
    'bliźniak web-at-scale / jan-at-home',
    'purchase',
    { transaction_id: TX, utm_campaign: 'jan-at-home' },
  ],
  ['N21', 'R:package', 'jan«at»firma.pl', 'consultation_click', { package: 'jan«at»firma.pl' }],
  [
    'N22',
    'D:600100200',
    'telefon w nazwie klucza',
    'click_phone',
    { link_location: 'header', '600100200': 'x' },
  ],
  [
    'N22b',
    'D:a@b.pl',
    'e-mail w nazwie klucza',
    'click_phone',
    { link_location: 'header', 'a@b.pl': 1 },
  ],
  [
    'N22t',
    'D:foo',
    'bliźniak: nieznany klucz',
    'click_phone',
    { link_location: 'header', foo: 'x' },
  ],
  [
    'N23',
    'R:price_pln',
    'ułamek-telefon',
    'open_modal',
    { tier: 'starter', price_pln: 600100200.5 },
  ],
  ['N23t', 'S', 'bliźniak 999999', 'open_modal', { tier: 'starter', price_pln: 999999 }],
  [
    'N24',
    'R:transaction_id',
    'id transakcji z telefonem',
    'purchase',
    { transaction_id: 'cs_live_600100200' },
  ],
  [
    'N24b',
    'R:transaction_id',
    'telefon po literze',
    'purchase',
    { transaction_id: 'cs_live_a600100200' },
  ],
  ['N24t', 'S', 'bliźniak', 'purchase', { transaction_id: 'cs_live_a1B2c3D4e5' }],
  [
    'N25',
    'R:utm_source',
    'utm +48',
    'purchase',
    { transaction_id: TX, utm_source: '+48 600 100 200' },
  ],
  ['N26', 'R:source', 'separatory ;', 'view_pricing', { source: '/x;600;100;200' }],
  ['N27', 'S', 'UUID wielkimi', 'contact_form_success', { lead_id: U.toUpperCase() }],
  ['N27b', 'R:lead_id', 'UUID + \\n + e-mail', 'contact_form_success', { lead_id: `${U}\na@b.pl` }],
  [
    'N28',
    'R:metric_id',
    'web-vitals ogon 14 cyfr',
    'web_vital_lcp',
    { metric_name: 'LCP', metric_id: 'v6-1762970000000-12345678901234' },
  ],
  [
    'N29',
    'D:s',
    'Symbol w nieznanym kluczu',
    'click_phone',
    { link_location: 'header', s: Symbol('x') },
  ],
  [
    'N30',
    'D:a',
    'zagnieżdżona tablica',
    'click_phone',
    { link_location: 'header', a: [[['600 100 200']]] },
  ],
  [
    'N31',
    'D:a',
    'bomba głębokości',
    'click_phone',
    { link_location: 'header', a: [[[[[[['x']]]]]]] },
  ],
  [
    'N32',
    'D:g',
    'getter rzuca w nieznanym kluczu',
    'click_phone',
    Object.defineProperty({ link_location: 'header' }, 'g', {
      enumerable: true,
      get() {
        throw new Error('x');
      },
    }),
  ],
  // telefon z podwójnymi separatorami, pełna szerokość, (at), id (każda z bliźniakiem)
  [
    'B1',
    'R:utm_campaign',
    '600--100--200 w utm',
    'purchase',
    { transaction_id: TX, utm_campaign: '600--100--200' },
  ],
  ['B1t', 'S', 'bliźniak 600-100', 'purchase', { transaction_id: TX, utm_campaign: '600-100' }],
  [
    'B2',
    'R:utm_campaign',
    'pełna szerokość bez spacji',
    'purchase',
    { transaction_id: TX, utm_campaign: '６００１００２００' },
  ],
  [
    'B3',
    'R:utm_campaign',
    'jan (at) firma.pl w utm',
    'purchase',
    { transaction_id: TX, utm_campaign: 'jan (at) firma.pl' },
  ],
  [
    'B4',
    'R:client_id',
    'client_id z kropką',
    'stripe_redirect',
    { tier: 'starter', client_id: 'jan.kowalski', price_pln: 990 },
  ],
  [
    'B5',
    'R:metric_id',
    'web-vitals ogon 20 cyfr',
    'web_vital_lcp',
    { metric_name: 'LCP', metric_id: 'v6-1762970000000-48600100200123456789' },
  ],
  [
    'B5t',
    'S',
    'bliźniak 13 cyfr',
    'web_vital_lcp',
    { metric_name: 'LCP', metric_id: 'v6-1762970000000-1234567890123' },
  ],
  [
    'B6',
    'R:utm_campaign',
    'liczbowe id kampanii Google (11 cyfr)',
    'purchase',
    { transaction_id: TX, currency: 'PLN', utm_campaign: '21567834512' },
  ],
  [
    'B6t',
    'S',
    'bliźniak nazwa kampanii',
    'purchase',
    { transaction_id: TX, currency: 'PLN', utm_campaign: 'pmax-ecommerce' },
  ],
];

const ALLOWED_KEYS = (p: Record<string, unknown> | null) =>
  Object.fromEntries(Object.entries(p ?? {}).filter(([, v]) => v !== null && v !== undefined));

describe('formy ataku na bramę GA4 (stały zestaw)', () => {
  it.each(FORMS)('%s %s: %s', (_id, exp, _label, event, params) => {
    const t0 = performance.now();
    trackEvent(event, params as Record<string, unknown>);
    expect(performance.now() - t0).toBeLessThan(200);
    if (exp === 'N') {
      expect(track).not.toHaveBeenCalled();
      return;
    }
    expect(track).toHaveBeenCalledTimes(1);
    expect(track.mock.calls[0][0]).toBe(event);
    const payload = track.mock.calls[0][1] as Record<string, unknown>;
    if (exp === 'S') {
      expect(payload).toEqual(ALLOWED_KEYS(params));
      return;
    }
    const [kind, key] = [exp.slice(0, 1), exp.slice(2)];
    if (kind === 'R') {
      expect(payload[key]).toBe(REFUSED);
    } else {
      expect(Object.prototype.hasOwnProperty.call(payload, key)).toBe(false);
    }
    // niezależna wyrocznia: w wysłanym zdarzeniu nie ma @ ani 9 cyfr ASCII pod rząd
    expect(JSON.stringify(payload)).not.toMatch(/@|\d{9}/);
  });

  it('każda odmowa (R/D/N) ma dozwolonego bliźniaka (S) dla tego samego zdarzenia', () => {
    const okEvents = new Set(FORMS.filter((f) => f[1] === 'S').map((f) => f[3]));
    const without = FORMS.filter((f) => f[1] !== 'S' && f[1] !== 'N' && !okEvents.has(f[3])).map(
      (f) => f[0],
    );
    expect(without).toEqual([]);
  });
});

describe('page_location / page_title: formy ataku', () => {
  it.each<[string, string, string, string | null]>([
    [
      'P1',
      '/?utm_campaign=600100200',
      'utm_campaign z telefonem',
      `http://localhost:3000/?utm_campaign=${REFUSED}`,
    ],
    [
      'P2',
      '/?utm_campaign=jan%40firma.pl&utm_source=google',
      'e-mail w utm',
      `http://localhost:3000/?utm_campaign=${REFUSED}&utm_source=google`,
    ],
    [
      'P3',
      '/?utm_term=%D9%A6%D9%A0%D9%A0%D9%A1%D9%A0%D9%A0%D9%A2%D9%A0%D9%A0',
      'cyfry arabsko-indyjskie',
      `http://localhost:3000/?utm_term=${REFUSED}`,
    ],
    [
      'P4',
      '/?utm_campaign=600+100+200',
      'spacje jako +',
      `http://localhost:3000/?utm_campaign=${REFUSED}`,
    ],
    ['P5', '/kontakt/600100200/', 'telefon w ścieżce', `http://localhost:3000/${REFUSED}`],
    [
      'P6',
      '/?utm_id=21567834512',
      'liczbowe id kampanii',
      `http://localhost:3000/?utm_id=${REFUSED}`,
    ],
    ['P1t', '/?utm_campaign=black_friday&gclid=Cj0KCQiA4L67BhDUARIsADWrl7H', 'bliźniak', null],
  ])('%s %s: %s', (_id, url, _label, expected) => {
    window.history.replaceState({}, '', url);
    trackEvent('click_phone', { link_location: 'header' });
    const payload = track.mock.calls[0][1] as Record<string, unknown>;
    if (expected === null) {
      expect(payload).toEqual({ link_location: 'header' });
    } else {
      expect(payload.page_location).toBe(expected);
      expect(String(payload.page_location)).not.toMatch(/@|%40|\d{9}/);
    }
  });

  it.each<[string, string, boolean]>([
    ['T1', 'Zadzwoń: 600 100 200', true],
    ['T2', 'Napisz: jan@firma.pl', true],
    ['T3', 'Tel. ６００-１００-２００', true],
    ['T1t', 'Strona w abonamencie | Mixture Marketing', false],
  ])('%s tytuł %s', (_id, title, refused) => {
    document.title = title;
    trackEvent('click_phone', { link_location: 'header' });
    const payload = track.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.page_title).toBe(refused ? REFUSED : undefined);
  });
});

describe('kliknięcia tel: / mailto: (DOM)', () => {
  const dom: [string, string, string, string][] = [
    [
      'D1',
      'S',
      'tel: w nagłówku, zagnieżdżony svg',
      '<header><svg><a href="tel:600100200"><text id="x">t</text></a></svg></header>',
    ],
    [
      'D2',
      'S',
      'svg xlink:href tel w stopce',
      '<footer><svg xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:href="tel:600100200"><text id="x">t</text></a></svg></footer>',
    ],
    ['D3', 'S', 'tel z ?/# śmieciami', '<a id="x" href="tel:600100200?x=a@b.pl#c">t</a>'],
    ['D4', 'N', 'link javascript:', '<a id="x" href="javascript:void(0)">t</a>'],
    [
      'D5',
      'S',
      'przycisk mailto w stopce',
      '<footer><a href="mailto:a@b.pl"><button id="x">m</button></a></footer>',
    ],
    ['D6', 'N', 'względny link z cyframi', '<a id="x" href="600100200">t</a>'],
    [
      'D7',
      'S',
      'zewnętrzny a bez href, wewnętrzny tel',
      '<a><span><a href="tel:1"><b id="x">t</b></a></span></a>',
    ],
    [
      'D8',
      'N',
      'wewnętrzny a bez href w linku https',
      '<a href="https://x.pl/"><a name="q"><b id="x">t</b></a></a>',
    ],
    [
      'D9',
      'S',
      'TEL: wielkimi ze spacjami',
      '<header><a href=" TEL:+48 600 100 200 "><i id="x">t</i></a></header>',
    ],
  ];
  it.each(dom)('%s %s: %s', (_id, exp, _label, html) => {
    const off = installContactLinkTracking();
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener('click', prevent);
    document.body.innerHTML = html;
    (document.querySelector('#x') as Element).dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    document.removeEventListener('click', prevent);
    off();
    if (exp === 'N') {
      expect(track).not.toHaveBeenCalled();
      return;
    }
    expect(track).toHaveBeenCalledTimes(1);
    const payload = track.mock.calls[0][1] as Record<string, unknown>;
    expect(Object.keys(payload)).toEqual(['link_location']);
    expect(['header', 'footer', 'section']).toContain(payload.link_location);
  });
});
