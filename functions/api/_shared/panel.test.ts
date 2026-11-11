import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { onRequest as adminMiddleware } from '../admin/_middleware';
import { onRequest as portalMiddleware } from '../portal/_middleware';
import { onRequestPost as sendMagicLink } from '../auth/send_magic_link';
import { onRequestPost as verifyToken } from '../auth/verify_token';
import { createFakeD1, fnContext, type FakeD1 } from '../../../tests/helpers/fakeD1';
import { BIBLIOTEKA_ZAMROZONA, PANEL_PRZENIESIONY } from './panel';

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
      ['PUT', '/api/admin/save_client'],
      ['PATCH', '/api/admin/get_leads'],
      ['DELETE', '/api/admin/delete_document'],
    ]) {
      expect((await admin(m, s)).status, `${m} ${s}`).toBe(410);
    }
    expect((await admin('GET', '/api/admin/get_leads', KLIENT)).status).toBe(403);
  });

  it('biblioteka wycen zamrożona: zmiana i import to 403, odczyt jak reszta panelu (410)', async () => {
    for (const [m, s] of [
      ['PATCH', '/api/admin/estimation/library'],
      ['POST', '/api/admin/estimation/library'],
      ['POST', '/api/admin/estimation/library-import'],
      ['DELETE', '/api/admin/estimation/library'],
    ]) {
      const odp = await admin(m, s);
      expect(odp.status, `${m} ${s}`).toBe(403);
      expect(await odp.json()).toEqual({ error: BIBLIOTEKA_ZAMROZONA });
    }
    expect((await admin('GET', '/api/admin/estimation/library')).status).toBe(410);
    expect((await admin('GET', '/api/admin/estimation/library-export')).status).toBe(410);
    expect((await admin('POST', '/api/admin/estimation/quote')).status).toBe(410);
    // Bez sesji admina nadal najpierw 401/403, bez zdradzania, co jest za nimi.
    expect((await admin('PATCH', '/api/admin/estimation/library', KLIENT)).status).toBe(403);
    expect(await (await admin('PATCH', '/api/admin/estimation/library', KLIENT)).json()).toEqual({
      error: 'Admin access required',
    });
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

  it('weryfikacja linku: admin dostaje sesję (200, token zapisany w bazie, rola w odpowiedzi)', async () => {
    const exp = new Date(Date.now() + 600_000).toISOString();
    db.raw
      .prepare(
        "INSERT INTO auth_tokens (email, token, expires_at) VALUES ('admin@x.test', 'nowy', ?)",
      )
      .run(exp);
    const odp = await wywolaj(verifyToken, fnContext({ env: { DB: db }, body: { token: 'nowy' } }));
    expect(odp.status).toBe(200);
    const r = (await odp.json()) as { session_token: string; user: { role: string } };
    expect(r.user.role).toBe('admin');
    expect(r.session_token).toMatch(/^[0-9a-f]{32}$/);
    expect(db.raw.prepare('SELECT session_token FROM users WHERE id = 1').get()).toEqual({
      session_token: r.session_token,
    });
    // Nowa sesja przechodzi przez middleware admina do podglądu leadów.
    expect(await (await admin('GET', '/api/admin/get_leads', r.session_token)).text()).toBe('next');
  });

  it('kalkulator publiczny poza panelem: middleware są tylko w admin/ i portal/', () => {
    // Pages Functions stosuje _middleware.ts do swojego katalogu i podkatalogów, więc
    // /api/estimation/* (kalkulator /wycena/) i /api/crm/* nie przechodzą przez blokady panelu.
    const korzen = join(__dirname, '..', '..');
    const znajdz = (k: string): string[] =>
      readdirSync(k, { withFileTypes: true }).flatMap((w) =>
        w.isDirectory()
          ? znajdz(join(k, w.name))
          : w.name.startsWith('_middleware.')
            ? [relative(korzen, join(k, w.name))]
            : [],
      );
    expect(znajdz(korzen).sort()).toEqual([
      'api/admin/_middleware.ts',
      'api/portal/_middleware.ts',
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
    // Konto bez roli (albo z inną niż admin) też nie dostaje sesji: wpuszczamy tylko admina.
    db.raw
      .prepare("INSERT INTO users (id, email, name, role) VALUES (3, 'bez@x.test', 'Bez', NULL)")
      .run();
    db.raw
      .prepare("INSERT INTO auth_tokens (email, token, expires_at) VALUES ('bez@x.test', 'bez', ?)")
      .run(exp);
    const bez = await wywolaj(verifyToken, fnContext({ env: { DB: db }, body: { token: 'bez' } }));
    expect(bez.status).toBe(410);
    expect(db.raw.prepare('SELECT session_token FROM users WHERE id = 3').get()).toEqual({
      session_token: null,
    });
  });
});
