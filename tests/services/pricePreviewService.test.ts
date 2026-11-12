// MIX-1466: klient podglądu widełek — limit czasu zapytania i rozpoznanie braku endpointu.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  PREVIEW_TIMEOUT_MS,
  isPreviewUnavailable,
  requestPricePreview,
} from '../../services/pricePreviewService';

const fetchMock = vi.fn();
const PAYLOAD = { answers: { project_goal: 'sklep' }, captcha_token: 'c1' };

/** fetch, który odpowiada dopiero po `ms` albo odrzuca AbortError po przerwaniu sygnału. */
const slowFetch =
  (ms: number, body: unknown = { priceRange: { min: 1000, max: 2000 } }) =>
  (_url: string, init: { signal: AbortSignal }) =>
    new Promise((resolve, reject) => {
      const t = setTimeout(() => resolve({ ok: true, status: 200, json: async () => body }), ms);
      init.signal.addEventListener('abort', () => {
        clearTimeout(t);
        reject(new DOMException('aborted', 'AbortError'));
      });
    });

describe('requestPricePreview — limit czasu (MIX-1466)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('limit czasu to 4000 ms', () => {
    expect(PREVIEW_TIMEOUT_MS).toBe(4000);
  });

  it('serwer milczy dłużej niż limit: zapytanie przerwane, wynik jak błąd sieci (status 0)', async () => {
    fetchMock.mockImplementation(slowFetch(60_000));
    const p = requestPricePreview(PAYLOAD);
    await vi.advanceTimersByTimeAsync(PREVIEW_TIMEOUT_MS);
    await expect(p).resolves.toEqual({ ok: false, status: 0 });
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
  });

  it('bliźniak: odpowiedź tuż przed limitem daje widełki', async () => {
    fetchMock.mockImplementation(slowFetch(PREVIEW_TIMEOUT_MS - 1));
    const p = requestPricePreview(PAYLOAD);
    await vi.advanceTimersByTimeAsync(PREVIEW_TIMEOUT_MS - 1);
    await expect(p).resolves.toEqual({
      ok: true,
      priceRange: { min: 1000, max: 2000 },
      previewToken: undefined,
    });
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(false);
  });

  it('przerwanie z zewnątrz (nowe odpowiedzi) przerywa zapytanie od razu', async () => {
    fetchMock.mockImplementation(slowFetch(60_000));
    const outer = new AbortController();
    const p = requestPricePreview(PAYLOAD, outer.signal);
    outer.abort();
    await expect(p).resolves.toEqual({ ok: false, status: 0 });
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
  });

  it('sygnał przerwany przed startem: fetch dostaje przerwany sygnał', async () => {
    fetchMock.mockImplementation(slowFetch(60_000));
    const outer = new AbortController();
    outer.abort();
    await expect(requestPricePreview(PAYLOAD, outer.signal)).resolves.toEqual({
      ok: false,
      status: 0,
    });
  });

  it('405 z serwera wraca jako status 405 (do rozpoznania braku endpointu)', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 405, json: async () => ({}) });
    await expect(requestPricePreview(PAYLOAD)).resolves.toEqual({ ok: false, status: 405 });
  });
});

describe('isPreviewUnavailable — tylko brak endpointu (MIX-1466)', () => {
  it.each([404, 405, 501])('%i = endpointu nie ma', (s) => {
    expect(isPreviewUnavailable(s)).toBe(true);
  });
  it.each([0, 200, 400, 401, 403, 408, 429, 500, 502, 503])(
    '%i = zwykły błąd, pytamy dalej',
    (s) => {
      expect(isPreviewUnavailable(s)).toBe(false);
    },
  );
});
