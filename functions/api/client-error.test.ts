import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost, MAX_BODY_BYTES, REPORTS_PER_IP_PER_HOUR } from './client-error';

type Ctx = Parameters<typeof onRequestPost>[0];

function makeKv() {
  const store = new Map<string, string>();
  return {
    store,
    get: async (k: string) => store.get(k) ?? null,
    put: async (k: string, v: string) => {
      store.set(k, v);
    },
  };
}

function call(body: string, env: unknown = {}, headers: Record<string, string> = {}) {
  const request = new Request('https://mixturemarketing.pl/api/client-error', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '1.2.3.4', ...headers },
  });
  return onRequestPost({ request, env } as unknown as Ctx) as Promise<Response>;
}

const valid = {
  kind: 'react-boundary',
  message: 'Error: boom',
  stack: 's'.repeat(3000),
  url: 'https://mixturemarketing.pl/oferta/?utm=x#a',
  ua: 'Mozilla',
  release: 'abc123',
};

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe('/api/client-error', () => {
  it('poprawny raport → 204 i jeden wpis console.error (Workers Logs) z przyciętymi polami', async () => {
    const res = await call(JSON.stringify(valid), { CACHE: makeKv() });
    expect(res.status).toBe(204);
    expect(console.error).toHaveBeenCalledTimes(1);
    const [tag, json] = vi.mocked(console.error).mock.calls[0] as [string, string];
    expect(tag).toBe('[client-error]');
    const row = JSON.parse(json);
    expect(row).toMatchObject({
      kind: 'react-boundary',
      message: 'Error: boom',
      release: 'abc123',
    });
    expect(row.stack).toHaveLength(2048);
    expect(row.url).toBe('https://mixturemarketing.pl/oferta/'); // bez query/hash
  });

  it('za duże ciało → 413 bez logu', async () => {
    const res = await call(JSON.stringify({ ...valid, stack: 'x'.repeat(MAX_BODY_BYTES) }));
    expect(res.status).toBe(413);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('zły JSON / brak wymaganych pól → 400', async () => {
    expect((await call('nie-json')).status).toBe(400);
    expect((await call('[1,2]')).status).toBe(400);
    expect((await call(JSON.stringify({ kind: 'x' }))).status).toBe(400);
  });

  it('obcy origin → 403', async () => {
    const res = await call(JSON.stringify(valid), {}, { Origin: 'https://evil.example' });
    expect(res.status).toBe(403);
  });

  it(`limit per IP (${REPORTS_PER_IP_PER_HOUR}/h) przez KV → 429`, async () => {
    const env = { CACHE: makeKv() };
    let last = 0;
    for (let i = 0; i <= REPORTS_PER_IP_PER_HOUR; i++) {
      last = (await call(JSON.stringify(valid), env)).status;
    }
    expect(last).toBe(429);
    expect([...env.CACHE.store.keys()]).toEqual(['clierr:1.2.3.4']);
  });
});
