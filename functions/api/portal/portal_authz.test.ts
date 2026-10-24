import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { onRequestPost as sendMessage } from './send_message';
import { onRequestPost as updateMilestone } from './update_milestone';
import { createFakeD1, createFakeKV, fnContext, type FakeD1 } from '../../../tests/helpers/fakeD1';

type Handler = (ctx: never) => Promise<Response> | Response;
const call = (h: Handler, env: unknown, body: unknown, user: unknown) =>
  h(fnContext({ env, body, user }) as never) as Promise<Response>;

const A = { id: 2, name: 'Klient A', role: 'client' };
const B = { id: 3, name: 'Klient B', role: 'client' };

let db: FakeD1;
let env: Record<string, unknown>;
let projA: number;
let projB: number;
let milA: number;
let milB: number;

beforeEach(() => {
  db = createFakeD1();
  env = { DB: db, CACHE: createFakeKV(), RESEND_API_KEY: 're_test', NOTIFY_EMAIL: 'x@mm.pl' };
  db.raw.exec(`INSERT INTO users (id, email, name) VALUES (2, 'a@a.pl', 'A'), (3, 'b@b.pl', 'B')`);
  const insP = db.raw.prepare('INSERT INTO projects (user_id, name, type) VALUES (?, ?, ?)');
  projA = Number(insP.run(2, 'PA', 'web').lastInsertRowid);
  projB = Number(insP.run(3, 'PB', 'web').lastInsertRowid);
  const insM = db.raw.prepare('INSERT INTO milestones (project_id, title) VALUES (?, ?)');
  milA = Number(insM.run(projA, 'MA').lastInsertRowid);
  milB = Number(insM.run(projB, 'MB').lastInsertRowid);
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('{}')),
  );
});
afterEach(() => vi.unstubAllGlobals());

const msgCount = () =>
  (db.raw.prepare('SELECT COUNT(*) AS n FROM messages').get() as { n: number }).n;
const milestone = (id: number) =>
  db.raw.prepare('SELECT status, feedback FROM milestones WHERE id = ?').get(id);

describe('portal/send_message — project_id należy do klienta (F11)', () => {
  it('cudzy project_id → 403 i brak zapisu', async () => {
    const res = await call(sendMessage, env, { content: 'x', project_id: projB }, A);
    expect(res.status).toBe(403);
    expect(msgCount()).toBe(0);
  });

  it('własny project_id → zapis z tym projektem; brak project_id → NULL', async () => {
    expect((await call(sendMessage, env, { content: 'x', project_id: projA }, A)).status).toBe(200);
    expect((await call(sendMessage, env, { content: 'y', sender_type: 'client' }, A)).status).toBe(
      200,
    );
    expect(db.raw.prepare('SELECT project_id FROM messages ORDER BY id').all()).toEqual([
      { project_id: projA },
      { project_id: null },
    ]);
  });

  it('pusta albo za długa treść → 400', async () => {
    expect((await call(sendMessage, env, { content: '   ' }, A)).status).toBe(400);
    expect((await call(sendMessage, env, { content: 'x'.repeat(10_001) }, A)).status).toBe(400);
    expect(msgCount()).toBe(0);
  });
});

describe('portal/update_milestone — whitelist statusu i limit feedbacku (F11)', () => {
  it('accepted/corrections na własnym etapie → 200', async () => {
    const res = await call(
      updateMilestone,
      env,
      { id: milA, status: 'corrections', feedback: 'Popraw logo' },
      A,
    );
    expect(res.status).toBe(200);
    expect(milestone(milA)).toEqual({ status: 'corrections', feedback: 'Popraw logo' });
  });

  it.each(['pending', 'done', 'accepted; DROP TABLE x', ''])('status „%s” → 400', async (s) => {
    const res = await call(updateMilestone, env, { id: milA, status: s }, A);
    expect(res.status).toBe(400);
    expect(milestone(milA)).toEqual({ status: 'pending', feedback: null });
  });

  it('feedback ponad limit → 400', async () => {
    const res = await call(
      updateMilestone,
      env,
      { id: milA, status: 'accepted', feedback: 'x'.repeat(5001) },
      A,
    );
    expect(res.status).toBe(400);
  });

  it('cudzy etap → 403, bez zmian', async () => {
    const res = await call(updateMilestone, env, { id: milB, status: 'accepted' }, A);
    expect(res.status).toBe(403);
    expect(milestone(milB)).toEqual({ status: 'pending', feedback: null });
    // B nadal może zdecydować o swoim etapie
    expect((await call(updateMilestone, env, { id: milB, status: 'accepted' }, B)).status).toBe(
      200,
    );
  });
});
