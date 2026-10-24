import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { onRequestPost as replyLead } from './reply_lead';
import { createFakeD1, fnContext, type FakeD1 } from '../../../tests/helpers/fakeD1';

type Handler = (ctx: never) => Promise<Response> | Response;
let db: FakeD1;
const call = (body: unknown) =>
  (replyLead as Handler)(
    fnContext({
      env: { DB: db, RESEND_API_KEY: 're_test' },
      body,
      user: { id: 1, role: 'admin' },
    }) as never,
  ) as Promise<Response>;
const status = (id: string) =>
  (db.raw.prepare('SELECT status FROM leads WHERE id = ?').get(id) as { status: string }).status;

beforeEach(() => {
  db = createFakeD1();
  const ins = db.raw.prepare('INSERT INTO leads (id, email, name, status) VALUES (?, ?, ?, ?)');
  ins.run('L-new', 'a@x.pl', 'A', 'new');
  ins.run('L-conv', 'b@x.pl', 'B', 'converted');
  // Resend „działa” — testujemy zmianę statusu, nie maile.
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('{"id":"e1"}', { status: 200 })),
  );
});
afterEach(() => vi.unstubAllGlobals());

describe('admin/reply_lead: status leada', () => {
  it('new → contacted po wysłanej odpowiedzi', async () => {
    const res = await call({ lead_id: 'L-new', email: 'a@x.pl', message: 'Dzień dobry' });
    expect(res.status).toBe(200);
    expect(status('L-new')).toBe('contacted');
  });

  it('converted zostaje converted (bez cofania i bez ponownego „Zrób Klienta”)', async () => {
    const res = await call({ lead_id: 'L-conv', email: 'b@x.pl', message: 'Dzień dobry' });
    expect(res.status).toBe(200);
    expect(status('L-conv')).toBe('converted');
  });
});
