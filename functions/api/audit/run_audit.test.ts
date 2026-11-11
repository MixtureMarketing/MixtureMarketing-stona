import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost } from './run_audit';
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
// DNS (DoH): host → adresy; brak wpisu = publiczny 93.184.216.34. 'FAIL' = awaria DNS.
let dns: Record<string, string[] | 'FAIL'>;
// Odpowiedzi scrape per URL (przekierowania); brak wpisu = strona HTML 200.
let pages: Record<string, { status: number; location?: string }>;

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
