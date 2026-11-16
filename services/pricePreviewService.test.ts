// Kontrakt klienta podglądu widełek (MIX-1412, uwagi weryfikatora MIX-1385: V4 min/max, V7 brak
// sprawdzenia liczb). Lista dozwolona: każda odmowa ma obok dozwolonego bliźniaka.
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  requestPricePreview,
  parsePriceRange,
  PREVIEW_URL,
  MAX_PREVIEW_PLN,
} from './pricePreviewService';

const respond = (status: number, body: unknown) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });

afterEach(() => vi.unstubAllGlobals());

describe('requestPricePreview — kontrakt', () => {
  it('żądanie: POST JSON na PREVIEW_URL z odpowiedziami i tokenem, przekazuje signal', async () => {
    const fetchMock = respond(200, { priceRange: { min: 1, max: 2 } });
    vi.stubGlobal('fetch', fetchMock);
    const ctrl = new AbortController();
    await requestPricePreview({ answers: { a: 1 }, captcha_token: 'c1' }, ctrl.signal);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/estimation/public-preview');
    expect(url).toBe(PREVIEW_URL);
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body)).toEqual({ answers: { a: 1 }, captcha_token: 'c1' });
    // MIX-1466: fetch dostaje własny sygnał (limit czasu), nie sygnał wywołującego.
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(init.signal).not.toBe(ctrl.signal);
    expect(init.signal.aborted).toBe(false);
  });

  it('przerwanie sygnału wywołującego w trakcie zapytania przerywa sygnał fetch (powiązanie)', async () => {
    let fetchSignal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init: { signal: AbortSignal }) => {
        fetchSignal = init.signal;
        return new Promise((_resolve, reject) => {
          init.signal.addEventListener('abort', () => reject(new Error('aborted')));
        });
      }),
    );
    const ctrl = new AbortController();
    const pending = requestPricePreview({ answers: {} }, ctrl.signal);
    expect(fetchSignal?.aborted).toBe(false);
    ctrl.abort();
    expect(fetchSignal?.aborted).toBe(true);
    expect(await pending).toEqual({ ok: false, status: 0 });
  });

  it('sygnał wywołującego przerwany przed wywołaniem: fetch dostaje od razu przerwany sygnał', async () => {
    let fetchSignal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init: { signal: AbortSignal }) => {
        fetchSignal = init.signal;
        return Promise.reject(new Error('aborted'));
      }),
    );
    const ctrl = new AbortController();
    ctrl.abort();
    expect(await requestPricePreview({ answers: {} }, ctrl.signal)).toEqual({
      ok: false,
      status: 0,
    });
    expect(fetchSignal?.aborted).toBe(true);
  });

  it('min/max mapowane wprost (nie zamienione), preview_token przekazany', async () => {
    vi.stubGlobal(
      'fetch',
      respond(200, { priceRange: { min: 27500, max: 53000 }, preview_token: 'pt-1' }),
    );
    const r = await requestPricePreview({ answers: {} });
    expect(r).toEqual({ ok: true, priceRange: { min: 27500, max: 53000 }, previewToken: 'pt-1' });
  });

  it('min == max jest dozwolone (bliźniak odmowy min > max)', async () => {
    vi.stubGlobal('fetch', respond(200, { priceRange: { min: 5000, max: 5000 } }));
    expect(await requestPricePreview({ answers: {} })).toEqual({
      ok: true,
      priceRange: { min: 5000, max: 5000 },
      previewToken: undefined,
    });
  });

  it('dodatkowe pola widełek nie przechodzą dalej (tylko min i max)', async () => {
    vi.stubGlobal('fetch', respond(200, { priceRange: { min: 1, max: 2, evil: '<b>' } }));
    const r = await requestPricePreview({ answers: {} });
    expect(r.ok && Object.keys(r.priceRange)).toEqual(['min', 'max']);
  });

  it.each([
    ['min > max', { min: 53000, max: 27500 }],
    ['min ujemne', { min: -1, max: 100 }],
    ['max ujemne', { min: 0, max: -5 }],
    ['NaN', { min: Number.NaN, max: 100 }],
    ['min tekstem', { min: '1000', max: 2000 }],
    ['max tekstem', { min: 1000, max: '2000' }],
    ['brak min', { max: 2000 }],
    ['brak max', { min: 1000 }],
    ['null w polu', { min: null, max: 2000 }],
    ['ogromna liczba', { min: 1, max: 1e12 }],
    ['nieskończoność', { min: 1, max: Number.POSITIVE_INFINITY }],
    ['widełki tekstem', '1000-2000'],
    ['widełki tablicą', [1000, 2000]],
    ['brak widełek', undefined],
  ])('odmowa: %s → { ok: false, status: 500 }', async (_n, priceRange) => {
    vi.stubGlobal('fetch', respond(200, { priceRange, preview_token: 'pt' }));
    expect(await requestPricePreview({ answers: {} })).toEqual({ ok: false, status: 500 });
  });

  it('granice: 0 i MAX_PREVIEW_PLN dozwolone, MAX + 1 odmowa', async () => {
    vi.stubGlobal('fetch', respond(200, { priceRange: { min: 0, max: MAX_PREVIEW_PLN } }));
    expect(await requestPricePreview({ answers: {} })).toMatchObject({
      ok: true,
      priceRange: { min: 0, max: MAX_PREVIEW_PLN },
    });
    vi.stubGlobal('fetch', respond(200, { priceRange: { min: 0, max: MAX_PREVIEW_PLN + 1 } }));
    expect(await requestPricePreview({ answers: {} })).toEqual({ ok: false, status: 500 });
  });

  it('ciało nie-obiektem (null, tekst) → status 500', async () => {
    for (const body of [null, 'ok', 42]) {
      vi.stubGlobal('fetch', respond(200, body));
      expect(await requestPricePreview({ answers: {} })).toEqual({ ok: false, status: 500 });
    }
  });

  it('preview_token: tylko niepusty tekst; inne typy pomijane, widełki zostają', async () => {
    for (const preview_token of ['', 123, { t: 1 }, null]) {
      vi.stubGlobal('fetch', respond(200, { priceRange: { min: 1, max: 2 }, preview_token }));
      expect(await requestPricePreview({ answers: {} })).toEqual({
        ok: true,
        priceRange: { min: 1, max: 2 },
        previewToken: undefined,
      });
    }
  });

  it.each([401, 403, 429, 500, 503])('status HTTP %i przekazany bez czytania ciała', async (s) => {
    const json = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: s, json }));
    expect(await requestPricePreview({ answers: {} })).toEqual({ ok: false, status: s });
    expect(json).not.toHaveBeenCalled();
  });

  it('sieć, przerwanie (abort) i zły JSON → status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    expect(await requestPricePreview({ answers: {} })).toEqual({ ok: false, status: 0 });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('x', 'AbortError')));
    expect(await requestPricePreview({ answers: {} })).toEqual({ ok: false, status: 0 });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError('bad json')),
      }),
    );
    expect(await requestPricePreview({ answers: {} })).toEqual({ ok: false, status: 0 });
  });
});

describe('parsePriceRange', () => {
  it('dozwolone: liczby całkowite i ułamkowe w zakresie', () => {
    expect(parsePriceRange({ min: 8000, max: 15000 })).toEqual({ min: 8000, max: 15000 });
    expect(parsePriceRange({ min: 0.5, max: 1.5 })).toEqual({ min: 0.5, max: 1.5 });
  });
  it('odmowa: odwrócone, ujemne, NaN, tekst, brak', () => {
    for (const v of [
      { min: 2, max: 1 },
      { min: -1, max: 1 },
      { min: Number.NaN, max: 1 },
      { min: '1', max: 2 },
      {},
      null,
      undefined,
      'x',
    ]) {
      expect(parsePriceRange(v)).toBeNull();
    }
  });
});
