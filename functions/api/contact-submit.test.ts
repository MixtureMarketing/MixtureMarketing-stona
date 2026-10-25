import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost } from './contact-submit';
import { podpiszLead } from './_leadToken';

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

// Ważny token edycji (klucz awaryjny = TURNSTILE_SECRET z makeEnv). Testy poniżej sprawdzają
// logikę za bramką tokenu, więc wołają akcje tak, jak robi to prawdziwy formularz.
const tok = (id: string) => podpiszLead({ TURNSTILE_SECRET: 's' }, id);

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
      edit_token: await tok('zmyslone'),
      type: 'success',
    });
    expect(res.status).toBe(200);
    expect(emails).toBe(0);
  });

  it('send_notification dla istniejącego leada wysyła maila tylko raz na typ', async () => {
    const env = makeEnv();
    const edit_token = await tok(EXISTING);
    await call(env, { action: 'send_notification', id: EXISTING, edit_token, type: 'success' });
    await call(env, { action: 'send_notification', id: EXISTING, edit_token, type: 'success' });
    expect(emails).toBe(1);
  });

  it('update step=3 dla nieistniejącego leada nie wysyła maila', async () => {
    const res = await call(makeEnv(), {
      action: 'update',
      id: 'zmyslone',
      edit_token: await tok('zmyslone'),
      step: 3,
      details: { message: 'pilne: zadzwoń' },
    });
    expect(res.status).toBe(200);
    expect(emails).toBe(0);
  });

  it('update step=3 dla istniejącego leada wysyła maila', async () => {
    await call(makeEnv(), {
      action: 'update',
      id: EXISTING,
      edit_token: await tok(EXISTING),
      step: 3,
      details: { message: 'ok' },
    });
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

describe('contact-submit — create nie gubi leada po cichu', () => {
  const lead = { id: 'nowy', name: 'A', email: 'a@example.com', captcha_token: 'dobry' };

  function stubNetwork(resendStatus: number) {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (String(url).includes('turnstile')) return new Response('{"success":true}');
        emails++;
        return new Response('{}', { status: resendStatus });
      }),
    );
  }

  function envWithBrokenDb() {
    return {
      ...makeEnv(),
      DB: {
        prepare: () => ({
          bind: () => ({
            first: async () => null,
            run: async () => {
              throw new Error('D1_ERROR: overloaded');
            },
          }),
        }),
      },
    };
  }

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('D1 i Resend padły → 500 LEAD_NOT_SAVED (użytkownik widzi błąd i może ponowić)', async () => {
    stubNetwork(500);
    const res = await call(envWithBrokenDb(), { action: 'create', lead });
    expect(res.status).toBe(500);
    expect(((await res.json()) as { code: string }).code).toBe('LEAD_NOT_SAVED');
  });

  it('D1 padło, ale mail wyszedł → sukces (degraded)', async () => {
    stubNetwork(200);
    const res = await call(envWithBrokenDb(), { action: 'create', lead });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, degraded: true });
    expect(emails).toBe(1);
  });

  it('D1 zapisało, mail padł → sukces (lead jest w bazie)', async () => {
    stubNetwork(500);
    const res = await call(makeEnv(), { action: 'create', lead });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, degraded: true });
  });

  it('wszystko OK → sukces bez degraded', async () => {
    stubNetwork(200);
    const res = await call(makeEnv(), { action: 'create', lead });
    expect(await res.json()).toMatchObject({ success: true, degraded: false });
  });
});
