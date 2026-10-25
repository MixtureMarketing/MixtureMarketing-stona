import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost } from './capture-lead';

type Ctx = Parameters<typeof onRequestPost>[0];

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]); // "%PDF-1.4"

function makeKV() {
  const store = new Map<string, string>();
  return {
    store,
    get: async (k: string) => store.get(k) ?? null,
    put: async (k: string, v: string) => {
      store.set(k, v);
    },
  };
}

function makeEnv() {
  const inserts: unknown[][] = [];
  return {
    inserts,
    env: {
      DB: {
        prepare: () => ({
          bind: (...args: unknown[]) => ({
            run: async () => {
              inserts.push(args);
              return { meta: { changes: 1 } };
            },
          }),
        }),
      },
      CACHE: makeKV(),
      RESEND_API_KEY: 're_test',
      NOTIFY_EMAIL: 'agencja@example.com',
      TURNSTILE_SECRET: 'secret',
    },
  };
}

function form(fields: Record<string, string | Blob>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (v instanceof Blob) fd.append(k, v, 'raport.pdf');
    else fd.append(k, v);
  }
  return fd;
}

function call(env: unknown, fd: FormData, ip = '1.2.3.4') {
  const request = new Request('https://x/api/audit/capture-lead', {
    method: 'POST',
    body: fd,
    headers: { 'cf-connecting-ip': ip },
  });
  return onRequestPost({ request, env } as unknown as Ctx) as Promise<Response>;
}

let fetchMock: ReturnType<typeof vi.fn>;
let emails: Array<{ to: string[]; html: string; attachments?: unknown }>;
let crm: Array<Record<string, unknown>>;

beforeEach(() => {
  emails = [];
  crm = [];
  fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (String(url).includes('turnstile')) {
      const token = new URLSearchParams(String(init?.body)).get('response');
      return new Response(JSON.stringify({ success: token === 'good' }));
    }
    if (String(url).includes('resend')) {
      emails.push(JSON.parse(String(init?.body)));
      return new Response('{}');
    }
    if (String(url).includes('ingest/lead')) {
      crm.push(JSON.parse(String(init?.body)));
      return new Response('{}', { status: 201, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response('{}', { status: 404 });
  });
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe('audit/capture-lead', () => {
  it('bez tokenu Turnstile → 403 i zero maili', async () => {
    const { env, inserts } = makeEnv();
    const res = await call(
      env,
      form({ email: 'ofiara@example.com', url: 'https://firma.pl', pdf: new Blob([PDF]) }),
    );
    expect(res.status).toBe(403);
    expect(emails).toHaveLength(0);
    expect(inserts).toHaveLength(0);
  });

  it('plik, który nie jest PDF-em → 400 i zero maili', async () => {
    const { env } = makeEnv();
    const res = await call(
      env,
      form({
        email: 'a@example.com',
        url: 'https://firma.pl',
        captcha_token: 'good',
        pdf: new Blob(['MZ-not-a-pdf']),
      }),
    );
    expect(res.status).toBe(400);
    expect(emails).toHaveLength(0);
  });

  it('url z innym schematem niż http(s) → 400', async () => {
    const { env } = makeEnv();
    const res = await call(
      env,
      form({ email: 'a@example.com', url: 'javascript:alert(1)', captcha_token: 'good' }),
    );
    expect(res.status).toBe(400);
  });

  it('honeypot → 403', async () => {
    const { env } = makeEnv();
    const res = await call(
      env,
      form({
        email: 'a@example.com',
        url: 'https://firma.pl',
        captcha_token: 'good',
        website_verify: 'bot',
      }),
    );
    expect(res.status).toBe(403);
  });

  it('poprawne zgłoszenie: zapis, mail do użytkownika i agencji, URL escapowany', async () => {
    const { env, inserts } = makeEnv();
    const res = await call(
      env,
      form({
        email: 'klient@example.com',
        url: 'https://firma.pl/"><b>x</b>',
        captcha_token: 'good',
        score: '87',
        pdf: new Blob([PDF]),
      }),
    );
    expect(res.status).toBe(200);
    expect(inserts).toHaveLength(1);
    expect(emails.map((e) => e.to[0])).toEqual(['klient@example.com', 'agencja@example.com']);
    for (const e of emails) {
      expect(e.html).not.toContain('<b>x</b>');
      expect(e.html).not.toMatch(/href="[^"]*"[^>]*"/);
    }
  });

  it('limit per adres odbiorcy: 4. zgłoszenie na ten sam adres w ciągu doby → 429', async () => {
    const { env } = makeEnv();
    const statuses: number[] = [];
    for (let i = 0; i < 4; i++) {
      const res = await call(
        env,
        form({ email: 'Cel@Example.com', url: 'https://firma.pl', captcha_token: 'good' }),
        `10.0.0.${i}`,
      );
      statuses.push(res.status);
    }
    expect(statuses).toEqual([200, 200, 200, 429]);
  });

  it('limit per IP: 6. zgłoszenie z tego samego IP w ciągu godziny → 429', async () => {
    const { env } = makeEnv();
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await call(
        env,
        form({ email: `u${i}@example.com`, url: 'https://firma.pl', captcha_token: 'good' }),
      );
      statuses.push(res.status);
    }
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
  });

  it('po udanym zapisie kopia leada idzie do CRM (source=audit, ten sam id)', async () => {
    const { env } = makeEnv();
    const czekaj: Promise<unknown>[] = [];
    const request = new Request('https://x/api/audit/capture-lead', {
      method: 'POST',
      body: form({
        email: 'klient@example.com',
        url: 'https://firma.pl',
        companyName: 'Firma',
        captcha_token: 'good',
        score: '87',
      }),
      headers: { 'cf-connecting-ip': '7.7.7.7' },
    });
    const res = (await onRequestPost({
      request,
      env: { ...env, CRM_INGEST_SECRET: 'x'.repeat(64) },
      waitUntil: (p: Promise<unknown>) => czekaj.push(p),
    } as unknown as Ctx)) as Response;
    await Promise.all(czekaj);
    const { id } = (await res.json()) as { id: string };
    expect(crm).toEqual([
      expect.objectContaining({
        external_id: id,
        source: 'audit',
        email: 'klient@example.com',
        company: 'Firma',
        source_url: 'https://firma.pl/',
      }),
    ]);
  });
});
