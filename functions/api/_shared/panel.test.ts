import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { onRequest as adminMiddleware } from '../admin/_middleware';
import { onRequest as portalMiddleware } from '../portal/_middleware';
import { onRequestPost as sendMagicLink } from '../auth/send_magic_link';
import { onRequestPost as verifyToken } from '../auth/verify_token';
import { createFakeD1, fnContext, type FakeD1 } from '../../../tests/helpers/fakeD1';
import { PANEL_PRZENIESIONY } from './panel';

// Wyłączenie starego panelu (decyzja Karola z 25.10.2026): portal klienta, Klienci, Projekty, Czat,
// Metryki i Wyceny są w Mixture CRM. Na stronie zostaje podgląd leadów dla admina.
type Handler = (ctx: never) => Promise<Response> | Response;
const wywolaj = (f: unknown, ctx: unknown) => (f as Handler)(ctx as never) as Promise<Response>;

const ADMIN = 'a'.repeat(32);
const KLIENT = 'k'.repeat(32);

let db: FakeD1;
beforeEach(() => {
  db = createFakeD1();
  const exp = new Date(Date.now() + 86400_000).toISOString();
  db.raw
    .prepare(
      `INSERT INTO users (id, email, name, role, session_token, session_expires) VALUES
        (1, 'admin@x.test', 'Admin', 'admin', ?, ?), (2, 'klient@x.test', 'Klient', 'client', ?, ?)`,
    )
    .run(ADMIN, exp, KLIENT, exp);
});
afterEach(() => vi.unstubAllGlobals());

const admin = (method: string, sciezka: string, token = ADMIN) =>
  wywolaj(
    adminMiddleware,
    fnContext({
      env: { DB: db },
      method,
      url: `https://x.test${sciezka}`,
      headers: { Authorization: `Bearer ${token}` },
    }),
  );

describe('wyłączony stary panel', () => {
  it('portal klienta: każde /api/portal/* to 410 z informacją, bez sprawdzania sesji', async () => {
    const odp = await wywolaj(
      portalMiddleware,
      fnContext({ env: { DB: db }, url: 'https://x.test/api/portal/dashboard' }),
    );
    expect(odp.status).toBe(410);
    expect(await odp.json()).toEqual({ error: PANEL_PRZENIESIONY });
  });

  it('admin: podgląd leadów przechodzi, reszta panelu to 410, nie-admin nadal 403', async () => {
    expect(await (await admin('GET', '/api/admin/get_leads')).text()).toBe('next');
    for (const [m, s] of [
      ['GET', '/api/admin/get_all_data'],
      ['POST', '/api/admin/convert_lead'],
      ['POST', '/api/admin/reply_to_lead'],
      ['POST', '/api/admin/save_project'],
      ['POST', '/api/admin/get_leads'],
    ]) {
      expect((await admin(m, s)).status, `${m} ${s}`).toBe(410);
    }
    expect((await admin('GET', '/api/admin/get_leads', KLIENT)).status).toBe(403);
  });

  it('magic link: wysyłany tylko adminowi; klient dostaje tę samą neutralną odpowiedź bez tokenu', async () => {
    const wysylka = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', wysylka);
    const env = { DB: db, RESEND_API_KEY: 'test' };
    const wyslij = (email: string) => wywolaj(sendMagicLink, fnContext({ env, body: { email } }));

    const k = await wyslij('klient@x.test');
    expect(k.status).toBe(200);
    expect(db.raw.prepare('SELECT count(*) AS n FROM auth_tokens').get()).toEqual({ n: 0 });
    expect(wysylka).not.toHaveBeenCalled();

    expect((await wyslij('admin@x.test')).status).toBe(200);
    expect(db.raw.prepare('SELECT email FROM auth_tokens').all()).toEqual([
      { email: 'admin@x.test' },
    ]);
  });

  it('weryfikacja linku: klient z wcześniej wysłanym linkiem dostaje 410 i nie dostaje sesji', async () => {
    const exp = new Date(Date.now() + 600_000).toISOString();
    db.raw
      .prepare(
        "INSERT INTO auth_tokens (email, token, expires_at) VALUES ('klient@x.test', 'stary', ?)",
      )
      .run(exp);
    const odp = await wywolaj(
      verifyToken,
      fnContext({ env: { DB: db }, body: { token: 'stary' } }),
    );
    expect(odp.status).toBe(410);
    expect(db.raw.prepare('SELECT session_token FROM users WHERE id = 2').get()).toEqual({
      session_token: KLIENT,
    });
  });
});
