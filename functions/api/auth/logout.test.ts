import { describe, it, expect, beforeEach } from 'vitest';
import { onRequestPost as logout } from './logout';
import { onRequest as portalMiddleware } from '../portal/_middleware';
import { createFakeD1, fnContext, type FakeD1 } from '../../../tests/helpers/fakeD1';

type Handler = (ctx: never) => Promise<Response> | Response;

const TOKEN_A = 'a'.repeat(32);
const TOKEN_B = 'b'.repeat(32);

let db: FakeD1;
beforeEach(() => {
  db = createFakeD1();
  const exp = new Date(Date.now() + 86400_000).toISOString();
  db.raw
    .prepare(
      `INSERT INTO users (id, email, name, session_token, session_expires) VALUES
        (2, 'a@a.pl', 'A', ?, ?), (3, 'b@b.pl', 'B', ?, ?)`,
    )
    .run(TOKEN_A, exp, TOKEN_B, exp);
});

const post = (headers: Record<string, string> = {}) =>
  (logout as Handler)(
    fnContext({ env: { DB: db }, method: 'POST', headers }) as never,
  ) as Promise<Response>;

const session = (id: number) =>
  db.raw.prepare('SELECT session_token, session_expires FROM users WHERE id = ?').get(id) as {
    session_token: string | null;
    session_expires: string | null;
  };

describe('POST /api/auth/logout (F12)', () => {
  it('unieważnia sesję z nagłówka — token przestaje działać w middleware portalu', async () => {
    const mw = () =>
      (portalMiddleware as Handler)(
        fnContext({ env: { DB: db }, headers: { Authorization: `Bearer ${TOKEN_A}` } }) as never,
      ) as Promise<Response>;
    expect((await mw()).status).toBe(200); // next()

    const res = await post({ Authorization: `Bearer ${TOKEN_A}` });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'success', revoked: true });
    expect(session(2)).toEqual({ session_token: null, session_expires: null });

    expect((await mw()).status).toBe(401);
  });

  it('nie rusza sesji innych użytkowników', async () => {
    await post({ Authorization: `Bearer ${TOKEN_A}` });
    expect(session(3).session_token).toBe(TOKEN_B);
  });

  it('idempotentne: brak nagłówka, pusty/krótki albo nieznany token → 200, revoked: false', async () => {
    for (const headers of [
      {},
      { Authorization: 'Bearer ' },
      { Authorization: 'Bearer x' },
      { Authorization: `Bearer ${'c'.repeat(32)}` },
    ]) {
      const res = await post(headers);
      expect(res.status).toBe(200);
      expect((await res.json()).revoked).toBe(false);
    }
    expect(session(2).session_token).toBe(TOKEN_A);
    expect(session(3).session_token).toBe(TOKEN_B);
  });
});
