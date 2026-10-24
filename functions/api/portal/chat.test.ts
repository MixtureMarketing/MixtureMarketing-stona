import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { onRequestPost as sendMessage } from './send_message';
import { onRequestGet as getMessages } from './get_messages';
import { onRequestGet as getAllMessages } from '../admin/get_all_messages';
import { onRequestPost as adminReplyChat } from '../admin/admin_reply_chat';
import { createFakeD1, createFakeKV, fnContext, type FakeD1 } from '../../../tests/helpers/fakeD1';

type Handler = (ctx: never) => Promise<Response> | Response;
const call = (h: Handler, env: unknown, opts: { body?: unknown; url?: string; user?: unknown }) =>
  h(fnContext({ env, ...opts }) as never) as Promise<Response>;

const CLIENT = { id: 2, name: 'Klient', role: 'client' };
const ADMIN = { id: 1, name: 'Admin', role: 'admin' };

let db: FakeD1;

beforeEach(async () => {
  db = createFakeD1();
  await db
    .prepare('INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?), (?, ?, ?, ?)')
    .bind(1, 'admin@mm.pl', 'Admin', 'admin', 2, 'k@firma.pl', 'Klient', 'client')
    .run();
  // Resend „działa” — testujemy KV, nie maile.
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('{}')),
  );
});
afterEach(() => vi.unstubAllGlobals());

const count = (sql: string) => (db.raw.prepare(sql).get() as { n: number }).n;
const envWith = (kv: ReturnType<typeof createFakeKV>) => ({
  DB: db,
  CACHE: kv,
  RESEND_API_KEY: 're_test',
  NOTIFY_EMAIL: 'agencja@mm.pl',
});

describe('czat: KV jako cache fail-open', () => {
  it('send_message przy wyczerpanym limicie KV → 200 i dokładnie jedna wiadomość (bez 500 → bez duplikatu)', async () => {
    const env = envWith(createFakeKV({ failWrites: true }));
    const res = await call(sendMessage, env, { body: { content: 'Cześć' }, user: CLIENT });
    expect(res.status).toBe(200);
    expect(count('SELECT COUNT(*) AS n FROM messages')).toBe(1);
  });

  it('admin_reply_chat przy błędzie KV → 200 (wiadomość zapisana, ponowienie nie jest potrzebne)', async () => {
    const env = envWith(createFakeKV({ failWrites: true }));
    const res = await call(adminReplyChat, env, {
      body: { user_id: 2, content: 'Odpowiedź' },
      user: ADMIN,
    });
    expect(res.status).toBe(200);
    expect(count("SELECT COUNT(*) AS n FROM messages WHERE sender_type = 'admin'")).toBe(1);
  });

  it('get_messages przy niedziałającym KV (odczyt i zapis) → 200 z bazy', async () => {
    const env = envWith(createFakeKV({ failWrites: true, failReads: true }));
    await call(sendMessage, envWith(createFakeKV()), { body: { content: 'A' }, user: CLIENT });
    const res = await call(getMessages, env, { user: CLIENT });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe('database');
    expect(body.messages).toHaveLength(1);
  });

  it('get_messages: drugi odczyt z cache; brak nieprzeczytanych → brak UPDATE', async () => {
    const kv = createFakeKV();
    const env = envWith(kv);
    await call(sendMessage, env, { body: { content: 'A' }, user: CLIENT });
    const before = db.queries;
    const first = await (await call(getMessages, env, { user: CLIENT })).json();
    expect(first.source).toBe('database');
    expect(db.queries - before).toBe(1); // tylko SELECT — wiadomości klienta nie oznaczamy
    const second = await (await call(getMessages, env, { user: CLIENT })).json();
    expect(second.source).toBe('cache');
    expect(kv.ops.put).toBe(1);
  });

  it('get_messages oznacza odpowiedź admina jako przeczytaną', async () => {
    const env = envWith(createFakeKV());
    await call(adminReplyChat, env, { body: { user_id: 2, content: 'Hej' }, user: ADMIN });
    await call(getMessages, env, { user: CLIENT });
    expect(
      count("SELECT COUNT(*) AS n FROM messages WHERE is_read = 0 AND sender_type='admin'"),
    ).toBe(0);
  });
});

describe('admin/get_all_messages: polling co 5 s nie zjada limitu KV', () => {
  it('kasuje cache klienta tylko, gdy były nieprzeczytane wiadomości klienta', async () => {
    const kv = createFakeKV();
    const env = envWith(kv);
    await call(sendMessage, env, { body: { content: 'Pytanie' }, user: CLIENT });
    const deletesAfterSend = kv.ops.delete;

    const url = 'https://x.test/api/admin/get_all_messages?user_id=2';
    // 1. poll: jest nieprzeczytana → UPDATE + 1 delete
    const r1 = await call(getAllMessages, env, { url, user: ADMIN });
    expect(r1.status).toBe(200);
    expect(kv.ops.delete - deletesAfterSend).toBe(1);
    expect(
      count("SELECT COUNT(*) AS n FROM messages WHERE is_read = 0 AND sender_type='client'"),
    ).toBe(0);

    // kolejne 20 pollów (≈100 s otwartej rozmowy) → zero operacji zapisu w KV
    for (let i = 0; i < 20; i++) await call(getAllMessages, env, { url, user: ADMIN });
    expect(kv.ops.delete - deletesAfterSend).toBe(1);
    expect(kv.ops.put).toBe(0);
  });

  it('błąd KV przy read-receipt nie daje 500', async () => {
    const env = envWith(createFakeKV({ failWrites: true }));
    await call(sendMessage, env, { body: { content: 'Pytanie' }, user: CLIENT });
    const res = await call(getAllMessages, env, {
      url: 'https://x.test/api/admin/get_all_messages?user_id=2',
      user: ADMIN,
    });
    expect(res.status).toBe(200);
    expect((await res.json()).messages).toHaveLength(1);
  });
});
