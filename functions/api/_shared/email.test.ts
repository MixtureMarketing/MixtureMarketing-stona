import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendEmail } from './email';
import { onRequestPost as replyLead } from '../admin/reply_lead';
import { onRequestPost as adminReplyChat } from '../admin/admin_reply_chat';
import { onRequestPost as convertLead } from '../admin/convert_lead';
import { onRequestPost as sendMagicLink } from '../auth/send_magic_link';
import { onRequestPost as portalSendMessage } from '../portal/send_message';

type AnyHandler = (ctx: never) => Response | Promise<Response>;

/** Atrapa D1: zapisuje wykonane zapytania; SELECT-y zwracają `firstRow`. */
function makeDb(firstRow: Record<string, unknown> | null = { id: 7, email: 'k@x.pl', name: 'K' }) {
  const executed: Array<{ sql: string; args: unknown[] }> = [];
  return {
    executed,
    prepare: (sql: string) => ({
      bind: (...args: unknown[]) => ({
        first: async () => firstRow,
        run: async () => {
          executed.push({ sql, args });
          return { meta: { changes: 1 } };
        },
      }),
    }),
  };
}

function call(handler: AnyHandler, env: unknown, body: unknown, data: unknown = {}) {
  const request = new Request('https://x/api/x', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  return handler({ request, env, data } as never) as Promise<Response>;
}

let resendStatus = 200;
beforeEach(() => {
  resendStatus = 200;
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('{"message":"x"}', { status: resendStatus })),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const payload = { from: 'a@b.pl', to: ['c@d.pl'], subject: 's', html: '<p>x</p>' };

describe('sendEmail', () => {
  it('ok przy 2xx', async () => {
    await expect(sendEmail({ RESEND_API_KEY: 'k' }, payload, 't')).resolves.toEqual({ ok: true });
  });

  it('błąd HTTP Resend → ok:false + console.error (Workers Logs)', async () => {
    resendStatus = 422;
    await expect(sendEmail({ RESEND_API_KEY: 'k' }, payload, 't')).resolves.toEqual({
      ok: false,
      reason: 'http_422',
    });
    expect(console.error).toHaveBeenCalled();
  });

  it('brak klucza → ok:false bez wywołania sieci', async () => {
    await expect(sendEmail({}, payload, 't')).resolves.toEqual({ ok: false, reason: 'no_key' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('wyjątek sieci → ok:false (nie rzuca)', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('network'));
    await expect(sendEmail({ RESEND_API_KEY: 'k' }, payload, 't')).resolves.toEqual({
      ok: false,
      reason: 'network',
    });
  });
});

describe('admin/reply_lead', () => {
  const body = { lead_id: 'L1', email: 'k@x.pl', message: 'Dzień dobry' };

  it('mail nie wyszedł → 502 z komunikatem i BEZ zmiany statusu na contacted', async () => {
    resendStatus = 500;
    const db = makeDb();
    const res = await call(replyLead as AnyHandler, { DB: db, RESEND_API_KEY: 'k' }, body);
    expect(res.status).toBe(502);
    const json = (await res.json()) as { error: string; message: string };
    expect(json.error).toBe('email_failed');
    expect(json.message).toMatch(/status leada bez zmian/);
    expect(db.executed.some((q) => q.sql.includes('UPDATE leads'))).toBe(false);
  });

  it('brak RESEND_API_KEY → 502 (nie cichy sukces)', async () => {
    const db = makeDb();
    const res = await call(replyLead as AnyHandler, { DB: db }, body);
    expect(res.status).toBe(502);
    expect(db.executed).toHaveLength(0);
  });

  it('mail wyszedł → 200 i status contacted', async () => {
    const db = makeDb();
    const res = await call(replyLead as AnyHandler, { DB: db, RESEND_API_KEY: 'k' }, body);
    expect(res.status).toBe(200);
    const update = db.executed.find((q) => q.sql.includes('UPDATE leads'));
    expect(update?.sql).toContain("status = 'contacted'");
    expect(update?.args).toEqual(['L1']);
  });
});

describe('auth/send_magic_link', () => {
  it('mail z linkiem nie wyszedł → 502 zamiast „sprawdź skrzynkę”', async () => {
    resendStatus = 403;
    const res = await call(
      sendMagicLink as AnyHandler,
      { DB: makeDb({ id: 1, name: 'K' }), RESEND_API_KEY: 'k' },
      { email: 'k@x.pl' },
    );
    expect(res.status).toBe(502);
    expect(((await res.json()) as { message: string }).message).toMatch(/linku logowania/);
  });

  it('mail wyszedł → 200', async () => {
    const res = await call(
      sendMagicLink as AnyHandler,
      { DB: makeDb({ id: 1, name: 'K' }), RESEND_API_KEY: 'k' },
      { email: 'k@x.pl' },
    );
    expect(res.status).toBe(200);
  });
});

describe('powiadomienia po udanym zapisie (bez dublowania przy ponowieniu)', () => {
  it('admin_reply_chat: wiadomość zapisana, mail padł → 200 + email_sent:false + warning', async () => {
    resendStatus = 500;
    const env = { DB: makeDb(), CACHE: { delete: async () => {} }, RESEND_API_KEY: 'k' };
    const res = await call(adminReplyChat as AnyHandler, env, { user_id: 7, content: 'Hej' });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { email_sent: boolean; warning?: string };
    expect(json.email_sent).toBe(false);
    expect(json.warning).toMatch(/NIE zostało wysłane/);
  });

  it('convert_lead: konto utworzone, mail padł → 200 + warning dla admina', async () => {
    resendStatus = 500;
    const env = { DB: makeDb({ id: 3, email: 'k@x.pl', name: 'K' }), RESEND_API_KEY: 'k' };
    const res = await call(convertLead as AnyHandler, env, { lead_id: 'L1' });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { email_sent: boolean; warning?: string };
    expect(json.email_sent).toBe(false);
    expect(json.warning).toMatch(/mail powitalny NIE/);
  });

  it('portal/send_message: mail do agencji padł → 200 dla klienta, błąd w logach', async () => {
    resendStatus = 500;
    const env = {
      DB: makeDb(),
      CACHE: { delete: async () => {} },
      RESEND_API_KEY: 'k',
      NOTIFY_EMAIL: 'a@x.pl',
    };
    const res = await call(
      portalSendMessage as AnyHandler,
      env,
      { content: 'Pytanie' },
      { user: { id: 7, name: 'K' } },
    );
    expect(res.status).toBe(200);
    expect(console.error).toHaveBeenCalled();
  });
});
