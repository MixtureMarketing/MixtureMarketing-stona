import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost, TIMEOUTS_MS, PSI_RETRY_DELAY_MS, psiErrorReason } from './run_audit';
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

type Behaviour = 'ok' | 'reject' | 'hang' | 'http500' | 'http403';
let behaviour: Record<'scrape' | 'psi' | 'places', Behaviour>;
let fetchMock: ReturnType<typeof vi.fn>;
// DNS (DoH): host → adresy; brak wpisu = publiczny 93.184.216.34. 'FAIL' = awaria DNS.
let dns: Record<string, string[] | 'FAIL'>;
// Odpowiedzi scrape per URL (przekierowania); brak wpisu = strona HTML 200.
let pages: Record<string, { status: number; location?: string }>;

function respond(kind: 'scrape' | 'psi' | 'places', init?: RequestInit): Promise<Response> {
  const b = behaviour[kind];
  if (b === 'reject') return Promise.reject(new TypeError('network error (DNS/TLS)'));
  if (b === 'http500') return Promise.resolve(new Response('err', { status: 500 }));
  if (b === 'http403') return Promise.resolve(new Response('forbidden', { status: 403 }));
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

function doh(u: URL): Response {
  const name = u.searchParams.get('name') ?? '';
  const type = u.searchParams.get('type');
  const entry = dns[name];
  if (entry === 'FAIL') return new Response('fail', { status: 502 });
  const addrs = entry ?? ['93.184.216.34'];
  const want = type === 'A' ? 1 : 28;
  const isV6 = (a: string) => a.includes(':');
  const answer = addrs
    .filter((a) => (want === 28 ? isV6(a) : !isV6(a)))
    .map((data) => ({ type: want, data }));
  return new Response(JSON.stringify({ Status: 0, Answer: answer }), { status: 200 });
}

const isGate = (u: string) =>
  u.includes('cloudflare-dns.com') || u.includes('challenges.cloudflare');
const sourceCalls = () => fetchMock.mock.calls.filter(([u]) => !isGate(String(u)));
const scrapedUrls = () =>
  sourceCalls()
    .map(([u]) => String(u))
    .filter((u) => !u.includes('googleapis'));
const googleCalls = () => sourceCalls().filter(([u]) => String(u).includes('googleapis'));

beforeEach(() => {
  behaviour = { scrape: 'ok', psi: 'ok', places: 'ok' };
  dns = {};
  pages = {};
  fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    const u = String(url);
    if (u.includes('challenges.cloudflare.com')) {
      const token = new URLSearchParams(String(init?.body)).get('response');
      return new Response(JSON.stringify({ success: token === 'good' }));
    }
    if (u.startsWith('https://cloudflare-dns.com/')) return doh(new URL(u));
    if (u.includes('pagespeedonline')) return respond('psi', init);
    if (u.includes('places.googleapis')) return respond('places', init);
    const p = pages[u];
    if (p) {
      return new Response('', {
        status: p.status,
        headers: p.location ? { location: p.location } : {},
      });
    }
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

type KV = ReturnType<typeof createFakeKV>;

async function run(
  kv: KV = createFakeKV(),
  body: Record<string, unknown> = {},
  opts: { ip?: string; env?: Record<string, unknown> } = {},
) {
  const ctx = fnContext({
    env: {
      CACHE: kv,
      GOOGLE_BACKEND_KEY: 'key',
      DB: {},
      TURNSTILE_SECRET: 'secret',
      ...opts.env,
    },
    body: { url: 'https://firma.pl', companyName: 'Firma', captcha_token: 'good', ...body },
    headers: { 'cf-connecting-ip': opts.ip ?? '9.9.9.9' },
  }) as { _waitUntil: Promise<unknown>[] };
  const res = await (onRequestPost as unknown as Handler)(ctx as never);
  await Promise.all(ctx._waitUntil);
  return { res, json: await res.json(), kv };
}

const cachedKeys = (kv: KV) => [...kv.store.keys()].filter((k) => k.startsWith('v8_live_'));

/** KV, w którym padają tylko zapisy/odczyty cache wyników (liczniki bramki działają). */
function kvCacheFails(mode: 'put' | 'get'): KV {
  const kv = createFakeKV();
  const { get, put } = kv;
  kv.get = async (k: string, t?: 'json' | 'text') => {
    if (mode === 'get' && k.startsWith('v8_live_')) throw new Error('KV GET failed');
    return get(k, t);
  };
  kv.put = async (k: string, v: string) => {
    if (mode === 'put' && k.startsWith('v8_live_')) throw new Error('KV PUT failed: 429');
    return put(k, v);
  };
  return kv;
}

describe('audit/run_audit — odporność na awarie źródeł', () => {
  it('wszystkie źródła OK → pełny wynik, zapis do cache', async () => {
    const { res, json, kv } = await run();
    expect(res.status).toBe(200);
    expect(json.partial).toBeUndefined();
    expect(json.data.client.partial).toBeUndefined();
    expect(json.data.client.reputation.rating).toBe(4.8);
    expect(cachedKeys(kv)).toHaveLength(1);
  });

  it('każdy fetch źródła audytu ma AbortSignal (timeout), także DNS', async () => {
    await run();
    expect(sourceCalls()).toHaveLength(3);
    for (const [u, init] of fetchMock.mock.calls) {
      if (String(u).includes('challenges.cloudflare')) continue;
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
    // Natychmiastowy abort dla limitów scrape/Places (8 s); DNS (3 s) i PSI działają normalnie.
    const realTimeout = AbortSignal.timeout.bind(AbortSignal);
    vi.spyOn(AbortSignal, 'timeout').mockImplementation((ms: number) =>
      ms > 3_000 && ms <= 10_000
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
    expect(sourceCalls()).toHaveLength(2);
  });

  it('PSI niedostępne → 503 (jak wcześniej — bez pomiaru nie ma uczciwego wyniku)', async () => {
    behaviour.psi = 'reject';
    const { res, json } = await run();
    expect(res.status).toBe(503);
    expect(json.status).toBe('error');
  });

  it('padnięty zapis cache wyniku nie zamienia gotowego wyniku w 500', async () => {
    const { res, json } = await run(kvCacheFails('put'));
    expect(res.status).toBe(200);
    expect(json.status).toBe('success');
  });

  it('niedziałający odczyt cache → liczymy na żywo', async () => {
    const { res } = await run(kvCacheFails('get'));
    expect(res.status).toBe(200);
  });
});

const TEST_URL = 'https://firma.pl';
async function seedCache(kv: KV, value: unknown) {
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
/**
 * Po MIX-1324 (bez `force`) wpis w cache wraca od razu jako source:'cache', więc wynik
 * „stale” (MIX-893) powstaje tylko, gdy pierwszy odczyt cache zawiódł (błąd KV = brak
 * trafienia), a przy awarii PSI wpis jest już czytelny. Ten KV odtwarza tę drogę.
 */
async function kvStale(value: unknown): Promise<KV> {
  const kv = createFakeKV();
  await seedCache(kv, value);
  const { get } = kv;
  // Pierwszy odczyt KAŻDEGO klucza cache zawodzi (dla każdego adresu osobno).
  const seen = new Set<string>();
  kv.get = async (k: string, t?: 'json' | 'text') => {
    if (k.startsWith('v8_live_') && !seen.has(k)) {
      seen.add(k);
      throw new Error('KV GET failed');
    }
    return get(k, t);
  };
  return kv;
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
    const { res, json } = await run(await kvStale(CACHED));
    expect(res.status).toBe(200);
    expect(json.status).toBe('success');
    expect(json.stale).toBe(true);
    expect(json.source).toBe('cache_stale');
    expect(json.notice).toMatch(/^Wynik z 03\.11\.2026.*pomiar na żywo nie zdążył\.$/);
    expect(json.data.client.total_score).toBe(77);
  });

  it('wpis zapisany przez równoległe żądanie w trakcie pomiaru + awaria PSI → wynik z cache', async () => {
    const kv = createFakeKV();
    const inner = fetchMock.getMockImplementation()!;
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (String(url).includes('pagespeedonline')) {
        await seedCache(kv, CACHED);
        return new Response('err', { status: 500 });
      }
      return inner(url, init);
    });
    const { res, json } = await run(kv);
    expect(res.status).toBe(200);
    expect(json.source).toBe('cache_stale');
  });

  it('błąd HTTP PSI (500) + wynik w KV → też wynik z cache', async () => {
    behaviour.psi = 'http500';
    const { res, json } = await run(await kvStale(CACHED));
    expect(res.status).toBe(200);
    expect(json.stale).toBe(true);
    expect(json.data.client.url).toBe(TEST_URL);
  });

  it('wynik z cache bez daty (stary wpis) → oznaczenie bez zmyślonej daty', async () => {
    behaviour.psi = 'reject';
    const { res, json } = await run(await kvStale({ client: { url: TEST_URL, total_score: 50 } }));
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
    const { res, json } = await run(await kvStale({ foo: 1 }));
    expect(res.status).toBe(503);
    expect(json.stale).toBeUndefined();
  });

  it('PSI padło i odczyt cache nie działa → 503 (fail-closed, bez wyjątku)', async () => {
    behaviour.psi = 'reject';
    const { res, json } = await run(kvCacheFails('get'));
    expect(res.status).toBe(503);
    expect(json.message).toContain('PageSpeed Insights');
  });

  it('PSI działa, a stary wpis jest czytelny dopiero po pomiarze → pomiar na żywo, nie stary', async () => {
    const { res, json } = await run(await kvStale(CACHED));
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

// Scalenie MIX-1324 + MIX-893: bramka stoi PRZED każdą drogą do wyniku z cache, także
// przed wynikiem „stale” po awarii PSI. Każda odmowa ma dozwolonego bliźniaka.
describe('audit/run_audit — bramka przed wynikiem „stale” (MIX-1324 × MIX-893)', () => {
  const noStale = (json: Record<string, unknown>) => {
    expect(json.stale).toBeUndefined();
    expect(json.data).toBeUndefined();
  };

  it('atak: brak tokenu Turnstile przy awarii PSI i wpisie w KV → 403 captcha, 0 Google', async () => {
    behaviour.psi = 'http500';
    const { res, json } = await run(await kvStale(CACHED), { captcha_token: undefined });
    expect(res.status).toBe(403);
    expect(json).toEqual({
      status: 'error',
      reason: 'captcha',
      message: 'Weryfikacja captcha nieudana',
    });
    noStale(json);
    expect(googleCalls()).toHaveLength(0);
  });

  it('atak: zły/zużyty token przy awarii PSI → 403; bliźniak: dobry token → 200 stale', async () => {
    behaviour.psi = 'http500';
    const bad = await run(await kvStale(CACHED), { captcha_token: 'zuzyty' });
    expect(bad.res.status).toBe(403);
    expect(bad.json.reason).toBe('captcha');
    noStale(bad.json);
    const ok = await run(await kvStale(CACHED));
    expect(ok.res.status).toBe(200);
    expect(ok.json.source).toBe('cache_stale');
  });

  it('atak: budżet dzienny wyczerpany, potem awaria PSI z wpisem w KV → 429, bez wyniku', async () => {
    behaviour.psi = 'http500';
    const kv = await kvStale(CACHED);
    const env = { AUDIT_DAILY_BUDGET: '1' };
    await run(kv, { url: 'https://inna.pl/' }, { ip: '5.5.5.1', env });
    const { res, json } = await run(kv, {}, { ip: '5.5.5.2', env });
    expect(res.status).toBe(429);
    expect(json.reason).toBe('budżet dzienny');
    expect(json.message).toBe('Dzienny limit wyczerpany. Spróbuj jutro.');
    noStale(json);
  });

  it('bliźniak: budżet niewyczerpany → ta sama awaria PSI daje 200 stale', async () => {
    behaviour.psi = 'http500';
    const kv = await kvStale(CACHED);
    const env = { AUDIT_DAILY_BUDGET: '2' };
    await run(kv, { url: 'https://inna.pl/' }, { ip: '5.5.5.1', env });
    const { res, json } = await run(kv, {}, { ip: '5.5.5.2', env });
    expect(res.status).toBe(200);
    expect(json.stale).toBe(true);
  });

  it('atak: limit IP tej samej /64 wyczerpany → stale nie wychodzi (429 limit IP)', async () => {
    // 403 (bez ponowienia, MIX-1826): 11 audytów × przerwa 1 s przekroczyłoby limit testu.
    behaviour.psi = 'http403';
    const kv = await kvStale(CACHED);
    for (let i = 0; i < 10; i++) {
      await run(kv, { url: `https://h${i}.pl/` }, { ip: `2a01:db9:7:7::${i + 1}` });
    }
    const { res, json } = await run(kv, {}, { ip: '2a01:db9:7:7::ff' });
    expect(res.status).toBe(429);
    expect(json.reason).toBe('limit IP');
    noStale(json);
    const other = await run(kv, { url: 'https://h99.pl/' }, { ip: '2a01:db9:7:8::1' });
    expect(other.res.status).not.toBe(429);
  });

  it('atak: licznik nie zapisuje się (KV) przy awarii PSI → 503 licznik, nie wynik stale', async () => {
    behaviour.psi = 'http500';
    const kv = await kvStale(CACHED);
    const { put } = kv;
    kv.put = async (k: string, v: string) => {
      if (k.startsWith('gate:')) throw new Error('KV PUT failed: 429');
      return put(k, v);
    };
    const { res, json } = await run(kv);
    expect(res.status).toBe(503);
    expect(json.reason).toMatch(/^licznik: /);
    noStale(json);
  });

  it('atak: brak magazynu KV → 503 z bramki, nie wynik stale; Google nie pytany', async () => {
    behaviour.psi = 'http500';
    const { res, json } = await run(undefined, {}, { env: { CACHE: undefined } });
    expect(res.status).toBe(503);
    expect(json.reason).toBe('licznik: brak magazynu KV');
    noStale(json);
    expect(googleCalls()).toHaveLength(0);
  });

  it.each([
    ['tekst', 'abc'],
    ['ujemny', '-3'],
  ])(
    'atak: uszkodzony licznik IP (%s) → 503 „uszkodzony licznik”; bliźniak: liczba → 200',
    async (_n, bad) => {
      const kv = createFakeKV();
      await run(kv, { url: 'https://pierwszy.pl/' });
      const ipKeys = [...kv.store.keys()].filter((k) => k.startsWith('gate:audit-run:ip:'));
      expect(ipKeys).toHaveLength(1);
      kv.store.set(ipKeys[0], bad);
      const denied = await run(kv, { url: 'https://drugi.pl/' });
      expect(denied.res.status).toBe(503);
      expect(denied.json.reason).toBe('licznik: uszkodzony licznik');
      expect(denied.json.message).toBe('Usługa chwilowo niedostępna. Spróbuj później.');
      kv.store.set(ipKeys[0], '3');
      const ok = await run(kv, { url: 'https://trzeci.pl/' });
      expect(ok.res.status).toBe(200);
    },
  );

  it('atak: uszkodzony licznik budżetu dziennego → 503 (fail-closed)', async () => {
    const kv = createFakeKV();
    await run(kv, { url: 'https://pierwszy.pl/' });
    const dayKey = [...kv.store.keys()].find((k) => k.startsWith('gate:audit-run:day:'))!;
    kv.store.set(dayKey, 'NaN');
    const { res, json } = await run(kv, { url: 'https://drugi.pl/' }, { ip: '7.7.7.7' });
    expect(res.status).toBe(503);
    expect(json.reason).toBe('licznik: uszkodzony licznik');
  });

  it.each([
    ['localhost.', 'http://localhost./'],
    ['serwer.local.', 'http://serwer.local./'],
    ['db.internal.', 'https://db.internal./'],
  ])(
    'atak: host z kropką na końcu %s → 400 już na kształcie (bez zapytania DNS)',
    async (_n, url) => {
      const { res, json } = await run(createFakeKV(), { url });
      expect(res.status).toBe(400);
      expect(json).toEqual({
        status: 'error',
        reason: 'url',
        message: 'Ten adres nie może być audytowany.',
      });
      expect(
        fetchMock.mock.calls.filter(([u]) => String(u).includes('cloudflare-dns')),
      ).toHaveLength(0);
    },
  );

  it('bliźniak: publiczny host z kropką na końcu (firma.pl.) → 200', async () => {
    const { res } = await run(createFakeKV(), { url: 'https://firma.pl./' });
    expect(res.status).toBe(200);
  });
});

// MIX-1324: formy ataku, każda z dozwolonym bliźniakiem (ten sam kształt, wartość dozwolona).
describe('audit/run_audit — bramka i SSRF (MIX-1324)', () => {
  it.each([
    ['pętla zwrotna 127.0.0.1', 'http://127.0.0.1/'],
    ['metadane chmury 169.254.169.254', 'http://169.254.169.254/latest/meta-data/'],
    ['IPv6 [::1]', 'http://[::1]/'],
    ['zapis szesnastkowy 0x7f000001', 'http://0x7f000001/'],
    ['zapis dziesiętny 2130706433', 'http://2130706433/'],
    ['IPv4 zmapowany [::ffff:127.0.0.1]', 'http://[::ffff:127.0.0.1]/'],
    ['sieć prywatna 10.0.0.1', 'http://10.0.0.1/'],
    ['port spoza 80/443', 'https://firma.pl:8080/'],
    ['localhost', 'http://localhost/'],
    ['nazwa sieci lokalnej serwer.local', 'http://serwer.local/'],
    ['nazwa wewnętrzna db.internal', 'https://db.internal/'],
  ])('atak: %s → 400, bez żadnego zapytania do źródeł ani Google', async (_n, url) => {
    const { res, json } = await run(createFakeKV(), { url });
    expect(res.status).toBe(400);
    expect(json.reason).toBe('url');
    expect(sourceCalls()).toHaveLength(0);
  });

  it.each([
    ['publiczny IPv4', 'http://93.184.216.34/'],
    ['publiczny 169.255.0.1 (sąsiad link-local)', 'http://169.255.0.1/'],
    ['publiczny IPv6', 'http://[2606:4700::1111]/'],
    ['szesnastkowy publiczny 0x5db8d822', 'http://0x5db8d822/'],
    ['port 443 jawnie', 'https://firma.pl:443/'],
  ])('bliźniak: %s → 200', async (_n, url) => {
    const { res } = await run(createFakeKV(), { url });
    expect(res.status).toBe(200);
  });

  it('atak: nazwa w DNS wskazuje adres prywatny → 400; bliźniak: publiczny → 200', async () => {
    dns['zly.example.com'] = ['93.184.216.34', '192.168.1.10'];
    const bad = await run(createFakeKV(), { url: 'https://zly.example.com/' });
    expect(bad.res.status).toBe(400);
    expect(sourceCalls()).toHaveLength(0);
    dns['dobry.example.com'] = ['93.184.216.34'];
    const ok = await run(createFakeKV(), { url: 'https://dobry.example.com/' });
    expect(ok.res.status).toBe(200);
  });

  it('atak: AAAA w DNS na ::1 → 400', async () => {
    dns['v6.example.com'] = ['93.184.216.34', '::1'];
    const { res } = await run(createFakeKV(), { url: 'https://v6.example.com/' });
    expect(res.status).toBe(400);
  });

  it('awaria DNS = odmowa (fail-closed); bliźniak: DNS działa → 200', async () => {
    dns['firma.pl'] = 'FAIL';
    expect((await run()).res.status).toBe(400);
    delete dns['firma.pl'];
    expect((await run()).res.status).toBe(200);
  });

  it('atak: przekierowanie na adres prywatny → scrape nie idzie pod 127.0.0.1 (wynik częściowy)', async () => {
    pages['https://firma.pl/'] = { status: 302, location: 'http://127.0.0.1/admin' };
    const { res, json } = await run();
    expect(res.status).toBe(200);
    expect(json.data.client.unavailable).toEqual(['scrape']);
    expect(scrapedUrls()).toEqual(['https://firma.pl/']);
  });

  it('atak: przekierowanie na nazwę z prywatnym DNS → zablokowane', async () => {
    dns['wew.example.com'] = ['10.1.2.3'];
    pages['https://firma.pl/'] = { status: 301, location: 'https://wew.example.com/' };
    const { json } = await run();
    expect(json.data.client.unavailable).toEqual(['scrape']);
    expect(scrapedUrls()).toEqual(['https://firma.pl/']);
  });

  it('bliźniak: przekierowanie (względne) na publiczny adres → scrape OK', async () => {
    pages['https://firma.pl/'] = { status: 301, location: '/pl/' };
    const { json } = await run();
    expect(json.data.client.unavailable).toBeUndefined();
    expect(scrapedUrls()).toEqual(['https://firma.pl/', 'https://firma.pl/pl/']);
  });

  it('limit przekierowań: 4 skoki → odmowa; 3 skoki (bliźniak) → OK', async () => {
    pages['https://firma.pl/'] = { status: 302, location: '/a' };
    pages['https://firma.pl/a'] = { status: 302, location: '/b' };
    pages['https://firma.pl/b'] = { status: 302, location: '/c' };
    const ok = await run();
    expect(ok.json.data.client.unavailable).toBeUndefined();
    pages['https://firma.pl/c'] = { status: 302, location: '/d' };
    const bad = await run(createFakeKV());
    expect(bad.json.data.client.unavailable).toEqual(['scrape']);
    expect(scrapedUrls()).not.toContain('https://firma.pl/d');
  });

  it('atak: brak tokenu Turnstile → 403 bez zapytań do Google; zły token też', async () => {
    const none = await run(createFakeKV(), { captcha_token: undefined });
    expect(none.res.status).toBe(403);
    const bad = await run(createFakeKV(), { captcha_token: 'zly' });
    expect(bad.res.status).toBe(403);
    expect(bad.json.reason).toBe('captcha');
    expect(sourceCalls()).toHaveLength(0);
  });

  it('atak: brak sekretu Turnstile po stronie serwera → 403 (nie przepuszcza)', async () => {
    const { res } = await run(createFakeKV(), {}, { env: { TURNSTILE_SECRET: undefined } });
    expect(res.status).toBe(403);
  });

  it('brak tokenu blokuje też odpowiedź z cache', async () => {
    const kv = createFakeKV();
    await run(kv);
    const { res } = await run(kv, { captcha_token: '' });
    expect(res.status).toBe(403);
  });

  it('atak: `force` nie omija cache — wynik z cache bez nowych zapytań Google', async () => {
    const kv = createFakeKV();
    await run(kv);
    const before = googleCalls().length;
    const { json } = await run(kv, { force: true });
    expect(json.source).toBe('cache');
    expect(googleCalls().length).toBe(before);
  });

  it('atak: zalanie z jednego IP → 11. audyt 429; bliźniak: inny IP → 200', async () => {
    const kv = createFakeKV();
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      statuses.push((await run(kv, { url: `https://firma${i}.pl/` })).res.status);
    }
    expect(statuses.slice(0, 10).every((s) => s === 200)).toBe(true);
    expect(statuses[10]).toBe(429);
    const other = await run(kv, { url: 'https://inna.pl/' }, { ip: '8.8.4.4' });
    expect(other.res.status).toBe(200);
  });

  it('atak: rotacja adresów IPv6 w jednej /64 → wspólny licznik; inna /64 (bliźniak) → osobny', async () => {
    const kv = createFakeKV();
    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      const ip = `2a01:db9:1:2::${i + 1}`;
      statuses.push((await run(kv, { url: `https://f${i}.pl/` }, { ip })).res.status);
    }
    expect(statuses[10]).toBe(429);
    const other = await run(kv, { url: 'https://g.pl/' }, { ip: '2a01:db9:1:3::1' });
    expect(other.res.status).toBe(200);
  });

  it('dzienny budżet globalny: ponad budżet → 429 nawet z nowych IP', async () => {
    const kv = createFakeKV();
    const env = { AUDIT_DAILY_BUDGET: '2' };
    const s: number[] = [];
    for (let i = 0; i < 3; i++) {
      s.push((await run(kv, { url: `https://b${i}.pl/` }, { ip: `5.5.5.${i}`, env })).res.status);
    }
    expect(s).toEqual([200, 200, 429]);
  });

  it('awaria licznika (KV) = odmowa 503 z powodem, bez zapytań Google', async () => {
    const { res, json } = await run(createFakeKV({ failWrites: true }));
    expect(res.status).toBe(503);
    expect(json.reason).toMatch(/^licznik/);
    expect(googleCalls()).toHaveLength(0);
    const log = (console.error as unknown as ReturnType<typeof vi.fn>).mock.calls.flat().join(' ');
    expect(log).toContain('[gate:audit-run] odmowa 503');
  });

  it('brak magazynu KV = odmowa 503', async () => {
    const { res } = await run(undefined, {}, { env: { CACHE: undefined } });
    expect(res.status).toBe(503);
  });
});

// MIX-1826: 503 „PageSpeed Insights chwilowo niedostępny” bez śladu przyczyny w logach.
// fetchPSI loguje status HTTP i powód Google (bez klucza) i ponawia raz przy 429/5xx.
describe('audit/run_audit — status PSI w logach i jedno ponowienie (MIX-1826)', () => {
  const KEY = 'AIzaSyTESTOWY_KLUCZ_1826';
  const psiCalls = () =>
    fetchMock.mock.calls.filter(([u]) => String(u).includes('pagespeedonline'));
  const errLog = () =>
    (console.error as unknown as ReturnType<typeof vi.fn>).mock.calls.flat().map(String).join(' ');
  const googleErr = (code: number, status: string, reason: string, message: string) =>
    new Response(
      JSON.stringify({ error: { code, status, message, errors: [{ reason, message }] } }),
      {
        status: code,
      },
    );
  /** Kolejne odpowiedzi PSI z listy (ostatnia się powtarza); reszta jak w beforeEach. */
  function psiSequence(...answers: Array<() => Response>) {
    const inner = fetchMock.getMockImplementation()!;
    let i = 0;
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (String(url).includes('pagespeedonline')) {
        const a = answers[Math.min(i, answers.length - 1)];
        i++;
        return a();
      }
      return inner(url, init);
    });
  }
  const ok = () => new Response(JSON.stringify(PSI_OK), { status: 200 });
  const quota = () =>
    googleErr(
      429,
      'RESOURCE_EXHAUSTED',
      'rateLimitExceeded',
      "Quota exceeded for quota metric 'Queries'",
    );
  const runKey = () => run(createFakeKV(), {}, { env: { GOOGLE_BACKEND_KEY: KEY } });

  it('429, potem 200 → audyt kończy się wynikiem; dwa wywołania PSI; status 429 w logu', async () => {
    psiSequence(quota, ok);
    const { res, json } = await runKey();
    expect(res.status).toBe(200);
    expect(json.status).toBe('success');
    expect(psiCalls()).toHaveLength(2);
    expect(errLog()).toMatch(
      /\[run_audit\] psi: HTTP 429 \(próba 1, ponawiam\): RESOURCE_EXHAUSTED rateLimitExceeded/,
    );
  });

  it('500 dwa razy → 503; dokładnie dwa wywołania (jedno ponowienie), obie próby w logu', async () => {
    psiSequence(() => new Response('upstream', { status: 500 }));
    const { res } = await runKey();
    expect(res.status).toBe(503);
    expect(psiCalls()).toHaveLength(2);
    expect(errLog()).toContain('HTTP 500 (próba 1, ponawiam): upstream');
    expect(errLog()).toContain('HTTP 500 (próba 2): upstream');
  });

  it('503 Google, potem 200 → wynik (5xx też ponawiamy)', async () => {
    psiSequence(() => new Response('', { status: 503 }), ok);
    const { res } = await runKey();
    expect(res.status).toBe(200);
    expect(psiCalls()).toHaveLength(2);
    expect(errLog()).toContain('HTTP 503 (próba 1, ponawiam): (pusta odpowiedź)');
  });

  it('403 ograniczenie klucza → bez ponowienia, 503, powód Google w logu', async () => {
    psiSequence(() =>
      googleErr(
        403,
        'PERMISSION_DENIED',
        'forbidden',
        'Requests from referer <empty> are blocked.',
      ),
    );
    const { res } = await runKey();
    expect(res.status).toBe(503);
    expect(psiCalls()).toHaveLength(1);
    expect(errLog()).toContain(
      'HTTP 403 (próba 1): PERMISSION_DENIED forbidden Requests from referer <empty> are blocked.',
    );
  });

  it.each([400, 404, 428, 499])('HTTP %i → bez ponowienia (jedno wywołanie)', async (code) => {
    psiSequence(() => new Response('x', { status: code }));
    const { res } = await runKey();
    expect(res.status).toBe(503);
    expect(psiCalls()).toHaveLength(1);
    expect(errLog()).toContain(`HTTP ${code} (próba 1): x`);
  });

  it('klucz nigdy w logu, nawet gdy Google powtórzy go w komunikacie lub w adresie', async () => {
    psiSequence(() =>
      googleErr(
        400,
        'INVALID_ARGUMENT',
        'keyInvalid',
        `API key ${KEY} not valid; url ?key=${KEY}&x=1 &key=inny`,
      ),
    );
    await runKey();
    const log = errLog();
    expect(log).toContain('HTTP 400');
    expect(log).toContain('INVALID_ARGUMENT keyInvalid API key [klucz] not valid');
    expect(log).not.toContain(KEY);
    expect(log).not.toContain('inny');
  });

  it('ponowienie w tym samym limicie 55 s: jeden AbortSignal.timeout, ten sam sygnał w obu próbach', async () => {
    const spy = vi.spyOn(AbortSignal, 'timeout');
    psiSequence(quota, ok);
    await runKey();
    expect(spy.mock.calls.filter(([ms]) => ms === TIMEOUTS_MS.psi)).toHaveLength(1);
    const [a, b] = psiCalls().map(([, init]) => (init as RequestInit).signal);
    expect(a).toBeInstanceOf(AbortSignal);
    expect(b).toBe(a);
  });

  it('przerwa przed ponowieniem = PSI_RETRY_DELAY_MS (1 s)', async () => {
    expect(PSI_RETRY_DELAY_MS).toBe(1_000);
    const t = vi.spyOn(globalThis, 'setTimeout');
    psiSequence(quota, ok);
    await runKey();
    expect(t.mock.calls.some(([, ms]) => ms === PSI_RETRY_DELAY_MS)).toBe(true);
  });

  it('timeout PSI → w logu „przekroczony limit 55 s”, bez ponowienia', async () => {
    behaviour.psi = 'hang';
    abortAllTimeouts();
    const { res } = await runKey();
    expect(res.status).toBe(503);
    expect(psiCalls()).toHaveLength(1);
    expect(errLog()).toContain('[run_audit] psi: przekroczony limit 55 s');
  });

  it('błąd sieci PSI → w logu nazwa błędu, nie „limit”', async () => {
    behaviour.psi = 'reject';
    await runKey();
    expect(errLog()).toContain('[run_audit] psi: TypeError: network error');
    expect(errLog()).not.toContain('przekroczony limit');
  });

  it('psiErrorReason: treść nie-JSON, pusta, długa (≤ 300 znaków)', () => {
    expect(psiErrorReason('<html>Bad Gateway</html>', 'k1')).toBe('<html>Bad Gateway</html>');
    expect(psiErrorReason('', 'k1')).toBe('(pusta odpowiedź)');
    expect(psiErrorReason('a'.repeat(1000), 'k1')).toHaveLength(300);
    expect(psiErrorReason(JSON.stringify({ error: { message: 'tylko komunikat' } }), '')).toBe(
      'tylko komunikat',
    );
  });
});
