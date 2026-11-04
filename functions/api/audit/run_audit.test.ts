import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost, TIMEOUTS_MS } from './run_audit';
import { safeHttpUrl, sha256Hex } from '../_shared/security';
import { createFakeKV, fnContext } from '../../../tests/helpers/fakeD1';

type Handler = (ctx: never) => Promise<Response>;

// HTMLRewriter istnieje tylko w runtime Workers — w teście przepuszczamy HTML bez zmian
// (scrape „się udaje”, ale bez wykrytych elementów).
class HTMLRewriterStub {
  on() {
    return this;
  }
  transform(res: Response) {
    return res;
  }
}

const PSI_OK = {
  lighthouseResult: {
    audits: { 'largest-contentful-paint': { numericValue: 1800 } },
    categories: { performance: { score: 0.91 } },
  },
};
// places:searchText (wyszukiwanie po nazwie firmy) zwraca listę
const PLACES_OK = { places: [{ rating: 4.8, userRatingCount: 120 }] };

type Behaviour = 'ok' | 'reject' | 'hang' | 'http500';
let behaviour: Record<'scrape' | 'psi' | 'places', Behaviour>;
let fetchMock: ReturnType<typeof vi.fn>;

function respond(kind: 'scrape' | 'psi' | 'places', init?: RequestInit): Promise<Response> {
  const b = behaviour[kind];
  if (b === 'reject') return Promise.reject(new TypeError('network error (DNS/TLS)'));
  if (b === 'http500') return Promise.resolve(new Response('err', { status: 500 }));
  if (b === 'hang') {
    // Odpowiada dopiero na abort z AbortSignal.timeout — bez timeoutu wisiałby wiecznie.
    return new Promise((_, rej) => {
      const s = init?.signal;
      if (s?.aborted) return rej(s.reason);
      s?.addEventListener('abort', () => rej(s.reason));
    });
  }
  const body =
    kind === 'scrape'
      ? '<html><title>Firma</title></html>'
      : JSON.stringify(kind === 'psi' ? PSI_OK : PLACES_OK);
  return Promise.resolve(new Response(body, { status: 200 }));
}

beforeEach(() => {
  behaviour = { scrape: 'ok', psi: 'ok', places: 'ok' };
  fetchMock = vi.fn((url: string, init?: RequestInit) => {
    const u = String(url);
    if (u.includes('pagespeedonline')) return respond('psi', init);
    if (u.includes('places.googleapis')) return respond('places', init);
    return respond('scrape', init);
  });
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('HTMLRewriter', HTMLRewriterStub);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function run(kv = createFakeKV(), body: Record<string, unknown> = {}) {
  const ctx = fnContext({
    env: { CACHE: kv, GOOGLE_BACKEND_KEY: 'key', DB: {} },
    body: { url: 'https://firma.pl', companyName: 'Firma', force: true, ...body },
    headers: { 'cf-connecting-ip': '9.9.9.9' },
  }) as { _waitUntil: Promise<unknown>[] };
  const res = await (onRequestPost as unknown as Handler)(ctx as never);
  await Promise.all(ctx._waitUntil);
  return { res, json: await res.json(), kv };
}

const cachedKeys = (kv: ReturnType<typeof createFakeKV>) =>
  [...kv.store.keys()].filter((k) => k.startsWith('v8_live_'));

describe('audit/run_audit — odporność na awarie źródeł', () => {
  it('wszystkie źródła OK → pełny wynik, zapis do cache', async () => {
    const { res, json, kv } = await run();
    expect(res.status).toBe(200);
    expect(json.partial).toBeUndefined();
    expect(json.data.client.partial).toBeUndefined();
    expect(json.data.client.reputation.rating).toBe(4.8);
    expect(cachedKeys(kv)).toHaveLength(1);
  });

  it('każdy zewnętrzny fetch ma AbortSignal (timeout)', async () => {
    await run();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    for (const [, init] of fetchMock.mock.calls) {
      expect((init as RequestInit).signal).toBeInstanceOf(AbortSignal);
    }
  });

  it('padnięty scrape (DNS/TLS) → wynik częściowy z PSI, bez zmyślonych kar, bez cache', async () => {
    behaviour.scrape = 'reject';
    const { res, json, kv } = await run();
    expect(res.status).toBe(200);
    expect(json.partial).toBe(true);
    expect(json.data.client.partial).toBe(true);
    expect(json.data.client.unavailable).toEqual(['scrape']);
    expect(json.data.client.metrics.speed_score).toBe(91);
    // brak treści strony ≠ brak piksela/H1/ALT/analityki
    expect(json.data.client.audit_results).toEqual({});
    expect(cachedKeys(kv)).toHaveLength(0);
  });

  it('strona błędu (HTTP 500/403) traktowana jak niedostępna treść', async () => {
    behaviour.scrape = 'http500';
    const { json } = await run();
    expect(json.data.client.unavailable).toEqual(['scrape']);
  });

  it('wiszący scrape i Places są ucinane timeoutem → wynik częściowy zamiast wiecznego czekania', async () => {
    behaviour.scrape = 'hang';
    behaviour.places = 'hang';
    // AbortSignal.timeout z natychmiastowym abortem dla krótkich limitów (scrape/Places).
    const realTimeout = AbortSignal.timeout.bind(AbortSignal);
    vi.spyOn(AbortSignal, 'timeout').mockImplementation((ms: number) =>
      ms <= 10_000
        ? AbortSignal.abort(new DOMException('timeout', 'TimeoutError'))
        : realTimeout(ms),
    );
    const { res, json } = await run();
    expect(res.status).toBe(200);
    expect(json.data.client.unavailable).toEqual(['scrape', 'reputation']);
  });

  it('awaria Places → wynik częściowy, reputacja 0', async () => {
    behaviour.places = 'http500';
    const { json } = await run();
    expect(json.data.client.unavailable).toEqual(['reputation']);
    expect(json.data.client.reputation).toEqual({ rating: 0, reviews_count: 0, score: 0 });
  });

  it('bez nazwy firmy i placeId Places nie jest pytane i wynik nie jest częściowy', async () => {
    const { json } = await run(createFakeKV(), { companyName: '' });
    expect(json.data.client.partial).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('PSI niedostępne → 503 (jak wcześniej — bez pomiaru nie ma uczciwego wyniku)', async () => {
    behaviour.psi = 'reject';
    const { res, json } = await run();
    expect(res.status).toBe(503);
    expect(json.status).toBe('error');
  });

  it('wyczerpany limit zapisów KV nie zamienia gotowego wyniku w 500', async () => {
    const { res, json } = await run(createFakeKV({ failWrites: true }));
    expect(res.status).toBe(200);
    expect(json.status).toBe('success');
  });

  it('niedziałający odczyt KV (cache) → liczymy na żywo', async () => {
    const { res } = await run(createFakeKV({ failReads: true }), { force: false });
    expect(res.status).toBe(200);
  });
});

const TEST_URL = 'https://firma.pl';
async function seedCache(kv: ReturnType<typeof createFakeKV>, value: unknown) {
  const normalized = safeHttpUrl(TEST_URL) as string;
  kv.store.set(`v8_live_${await sha256Hex(normalized)}`, JSON.stringify(value));
}
const CACHED = {
  client: {
    url: TEST_URL,
    generated_at: '2026-11-03T10:15:00.000Z',
    total_score: 77,
    metrics: { speed_score: 66 },
  },
};
/** Każdy AbortSignal.timeout od razu przerwany = PSI „nie zdążyło” w limicie. */
function abortAllTimeouts() {
  return vi
    .spyOn(AbortSignal, 'timeout')
    .mockImplementation(() => AbortSignal.abort(new DOMException('timeout', 'TimeoutError')));
}

describe('audit/run_audit — limit PSI i wynik z cache (MIX-893)', () => {
  it('limit PSI wynosi 55 s (30 s ucinało cięższe strony), a Places/scrape zostają krótkie', () => {
    expect(TIMEOUTS_MS.psi).toBe(55_000);
    expect(TIMEOUTS_MS.scrape).toBe(8_000);
    expect(TIMEOUTS_MS.places).toBe(8_000);
  });

  it('fetch PSI dostaje AbortSignal.timeout z limitem PSI', async () => {
    const spy = vi.spyOn(AbortSignal, 'timeout');
    await run();
    expect(spy).toHaveBeenCalledWith(55_000);
  });

  it('timeout PSI + wcześniejszy wynik w KV → 200 z oznaczeniem daty i danymi z cache', async () => {
    behaviour.psi = 'hang';
    abortAllTimeouts();
    const kv = createFakeKV();
    await seedCache(kv, CACHED);
    const { res, json } = await run(kv);
    expect(res.status).toBe(200);
    expect(json.status).toBe('success');
    expect(json.stale).toBe(true);
    expect(json.source).toBe('cache_stale');
    expect(json.notice).toMatch(/^Wynik z 03\.11\.2026.*pomiar na żywo nie zdążył\.$/);
    expect(json.data.client.total_score).toBe(77);
  });

  it('błąd HTTP PSI (500) + wynik w KV → też wynik z cache', async () => {
    behaviour.psi = 'http500';
    const kv = createFakeKV();
    await seedCache(kv, CACHED);
    const { res, json } = await run(kv);
    expect(res.status).toBe(200);
    expect(json.stale).toBe(true);
    expect(json.data.client.url).toBe(TEST_URL);
  });

  it('wynik z cache bez daty (stary wpis) → oznaczenie bez zmyślonej daty', async () => {
    behaviour.psi = 'reject';
    const kv = createFakeKV();
    await seedCache(kv, { client: { url: TEST_URL, total_score: 50 } });
    const { res, json } = await run(kv);
    expect(res.status).toBe(200);
    expect(json.notice).toBe(
      'Wynik z wcześniejszego pomiaru (do 24 h temu), pomiar na żywo nie zdążył.',
    );
  });

  it('timeout PSI bez wyniku w KV → 503 z komunikatem, bez fabrykowania liczb', async () => {
    behaviour.psi = 'hang';
    abortAllTimeouts();
    const { res, json } = await run();
    expect(res.status).toBe(503);
    expect(json.status).toBe('error');
    expect(json.message).toContain('Pomiar wydajności (PageSpeed Insights) chwilowo niedostępny');
    expect(json.data).toBeUndefined();
    expect(json.stale).toBeUndefined();
  });

  it('wpis KV bez pola client (uszkodzony) → 503, nie zwracamy śmieci', async () => {
    behaviour.psi = 'http500';
    const kv = createFakeKV();
    await seedCache(kv, { foo: 1 });
    const { res, json } = await run(kv);
    expect(res.status).toBe(503);
    expect(json.stale).toBeUndefined();
  });

  it('PSI padło i KV nie odczytuje się → 503 (fail-closed, bez wyjątku)', async () => {
    behaviour.psi = 'reject';
    const { res } = await run(createFakeKV({ failReads: true }));
    expect(res.status).toBe(503);
  });

  it('PSI działa, a w KV leży stary wynik → zwracamy pomiar na żywo, nie stary', async () => {
    const kv = createFakeKV();
    await seedCache(kv, CACHED);
    const { res, json } = await run(kv);
    expect(res.status).toBe(200);
    expect(json.stale).toBeUndefined();
    expect(json.notice).toBeUndefined();
    expect(json.data.client.metrics.speed_score).toBe(91);
  });

  it('wynik na żywo niesie generated_at (data pomiaru dla późniejszego oznaczenia)', async () => {
    const { json } = await run();
    expect(new Date(json.data.client.generated_at).getTime()).toBeGreaterThan(0);
  });

  it('zły adres → 400 Invalid URL, brak fetchy i brak wyniku z cache', async () => {
    const kv = createFakeKV();
    const { res, json } = await run(kv, { url: 'javascript:alert(1)' });
    expect(res.status).toBe(400);
    expect(json).toEqual({ status: 'error', message: 'Invalid URL' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('brak url → 400 URL is required', async () => {
    const { res, json } = await run(createFakeKV(), { url: '' });
    expect(res.status).toBe(400);
    expect(json.message).toBe('URL is required');
  });
});
