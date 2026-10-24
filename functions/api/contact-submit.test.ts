import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost } from './contact-submit';

type Ctx = Parameters<typeof onRequestPost>[0];

const EXISTING = 'lead-istnieje';

function makeEnv() {
  const store = new Map<string, string>();
  return {
    DB: {
      prepare: (sql: string) => ({
        bind: (...args: unknown[]) => ({
          first: async () => (sql.includes('SELECT 1') && args[0] === EXISTING ? { ok: 1 } : null),
          run: async () => ({
            meta: { changes: sql.startsWith('UPDATE') && args.at(-1) === EXISTING ? 1 : 0 },
          }),
        }),
      }),
    },
    CACHE: {
      get: async (k: string) => store.get(k) ?? null,
      put: async (k: string, v: string) => {
        store.set(k, v);
      },
    },
    TURNSTILE_SECRET: 's',
    RESEND_API_KEY: 're',
    NOTIFY_EMAIL: 'agencja@example.com',
  };
}

function call(env: unknown, body: unknown) {
  const request = new Request('https://x/api/contact-submit', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '1.1.1.1' },
  });
  return onRequestPost({ request, env } as unknown as Ctx) as Promise<Response>;
}

let emails: number;
beforeEach(() => {
  emails = 0;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (String(url).includes('resend')) emails++;
      return new Response('{"success":false}');
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

describe('contact-submit — akcje bez captchy', () => {
  it('send_notification dla nieistniejącego leada nie wysyła maila', async () => {
    const res = await call(makeEnv(), {
      action: 'send_notification',
      id: 'zmyslone',
      type: 'success',
    });
    expect(res.status).toBe(200);
    expect(emails).toBe(0);
  });

  it('send_notification dla istniejącego leada wysyła maila tylko raz na typ', async () => {
    const env = makeEnv();
    await call(env, { action: 'send_notification', id: EXISTING, type: 'success' });
    await call(env, { action: 'send_notification', id: EXISTING, type: 'success' });
    expect(emails).toBe(1);
  });

  it('update step=3 dla nieistniejącego leada nie wysyła maila', async () => {
    const res = await call(makeEnv(), {
      action: 'update',
      id: 'zmyslone',
      step: 3,
      details: { message: 'pilne: zadzwoń' },
    });
    expect(res.status).toBe(200);
    expect(emails).toBe(0);
  });

  it('update step=3 dla istniejącego leada wysyła maila', async () => {
    await call(makeEnv(), { action: 'update', id: EXISTING, step: 3, details: { message: 'ok' } });
    expect(emails).toBe(1);
  });

  it('create bez poprawnej captchy → 403', async () => {
    const res = await call(makeEnv(), {
      action: 'create',
      lead: { id: 'n', name: 'A', email: 'a@example.com', captcha_token: 'zly' },
    });
    expect(res.status).toBe(403);
    expect(emails).toBe(0);
  });

  it('limit per IP dla akcji bez captchy → 429', async () => {
    const env = makeEnv();
    let last = 200;
    for (let i = 0; i < 31; i++) {
      last = (await call(env, { action: 'get_lead', id: 'x' })).status;
    }
    expect(last).toBe(429);
  });
});
