import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost, onRequestGet } from './contact-submit';
import { d1Sqlite } from '../../tests/helpers/d1Sqlite';
import { podpiszLead, sprawdzLead } from './_leadToken';

// Regresja: `update` / `get_lead` / `send_notification` wymagały wyłącznie id leada.
// Kto znał id (np. z logów, z Zaraz `lead_id`), czytał i nadpisywał dane osobowe.
// Teraz `create` zwraca podpisany `edit_token`, a reszta akcji bez niego dostaje 403.

const SEKRET = 'sekret-testowy';

let wyslaneMaile: unknown[] = [];
beforeEach(() => {
  wyslaneMaile = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      if (String(url).includes('siteverify'))
        return new Response(JSON.stringify({ success: true }));
      wyslaneMaile.push(JSON.parse(String(init?.body ?? '{}')));
      return new Response('{}');
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

const srodowisko = (env: Record<string, unknown> = {}) => {
  const { DB, db } = d1Sqlite(['0001_init.sql', '0002_leads_add_source_company.sql']);
  return {
    env: { DB, TURNSTILE_SECRET: 'ts', RESEND_API_KEY: 'r', NOTIFY_EMAIL: 'a@b.pl', ...env },
    db,
  };
};

const post = (env: unknown, body: unknown): never =>
  ({
    env,
    request: new Request('https://mixturemarketing.pl/api/contact-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  }) as never;

const wywolaj = async (env: unknown, body: unknown) => {
  const res = (await onRequestPost(post(env, body))) as Response;
  return { status: res.status, body: (await res.json()) as Record<string, unknown> };
};

const utworz = (env: unknown, id = 'id-od-klienta') =>
  wywolaj(env, {
    action: 'create',
    lead: { id, name: 'Jan', email: 'jan@firma.pl', captcha_token: 'tok' },
  });

describe('contact-submit — create', () => {
  it('zwraca id wygenerowane przez serwer i token edycji', async () => {
    const { env, db } = srodowisko({ LEAD_TOKEN_SECRET: SEKRET });
    const { status, body } = await utworz(env);
    expect(status).toBe(200);
    expect(body.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(body.id).not.toBe('id-od-klienta');
    expect(typeof body.edit_token).toBe('string');
    expect(db.prepare('SELECT name FROM leads WHERE id = ?').get(body.id as string)).toEqual({
      name: 'Jan',
    });
  });

  it('nie da się przejąć cudzego leada, podając jego id przy create', async () => {
    const { env } = srodowisko({ LEAD_TOKEN_SECRET: SEKRET });
    const ofiara = await utworz(env);
    const napastnik = await utworz(env, ofiara.body.id as string);
    expect(napastnik.body.id).not.toBe(ofiara.body.id);
    const proba = await wywolaj(env, {
      action: 'get_lead',
      id: ofiara.body.id,
      edit_token: napastnik.body.edit_token,
    });
    expect(proba.status).toBe(403);
  });

  it('bez LEAD_TOKEN_SECRET awaryjnie podpisuje TURNSTILE_SECRET — formularz działa', async () => {
    const { env } = srodowisko();
    const { status, body } = await utworz(env);
    expect(status).toBe(200);
    const res = await wywolaj(env, {
      action: 'get_lead',
      id: body.id,
      edit_token: body.edit_token,
    });
    expect(res.status).toBe(200);
  });
});

describe('_leadToken — bez klucza nic nie przechodzi (fail-closed)', () => {
  it('nie wydaje i nie akceptuje tokenów bez żadnego sekretu', async () => {
    expect(await podpiszLead({}, 'x')).toBeNull();
    const token = (await podpiszLead({ LEAD_TOKEN_SECRET: SEKRET }, 'x'))!;
    expect(await sprawdzLead({}, 'x', token)).toBe(false);
    expect(await sprawdzLead({ LEAD_TOKEN_SECRET: SEKRET }, 'x', token)).toBe(true);
  });
});

describe('contact-submit — akcje wymagające tokenu', () => {
  const przygotuj = async () => {
    const { env, db } = srodowisko({ LEAD_TOKEN_SECRET: SEKRET });
    const { body } = await utworz(env);
    return { env, db, id: body.id as string, token: body.edit_token as string };
  };

  it('update z poprawnym tokenem zapisuje dane', async () => {
    const { env, db, id, token } = await przygotuj();
    const res = await wywolaj(env, {
      action: 'update',
      id,
      edit_token: token,
      details: { budget: '10k' },
      step: 2,
    });
    expect(res.status).toBe(200);
    expect(db.prepare('SELECT budget FROM leads WHERE id = ?').get(id)).toEqual({ budget: '10k' });
  });

  it.each([
    ['bez tokenu', undefined],
    ['z pustym tokenem', ''],
    ['z cudzym/zmyślonym tokenem', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
    ['ze śmieciami zamiast base64', '!!!'],
  ])('update %s → 403 i brak zmian w bazie', async (_opis, edit_token) => {
    const { env, db, id } = await przygotuj();
    const res = await wywolaj(env, {
      action: 'update',
      id,
      edit_token,
      details: { email: 'napastnik@zly.pl' },
    });
    expect(res.status).toBe(403);
    expect(db.prepare('SELECT email FROM leads WHERE id = ?').get(id)).toEqual({
      email: 'jan@firma.pl',
    });
  });

  it('token jednego leada nie otwiera innego', async () => {
    const { env, id: idA } = await przygotuj();
    const b = await utworz(env);
    const res = await wywolaj(env, { action: 'get_lead', id: idA, edit_token: b.body.edit_token });
    expect(res.status).toBe(403);
  });

  it('token podpisany innym sekretem jest odrzucany', async () => {
    const { env, id, token } = await przygotuj();
    const res = await wywolaj(
      { ...env, LEAD_TOKEN_SECRET: 'inny-sekret' },
      { action: 'get_lead', id, edit_token: token },
    );
    expect(res.status).toBe(403);
  });

  it('get_lead (POST) z tokenem zwraca dane, bez tokenu — 403', async () => {
    const { env, id, token } = await przygotuj();
    const ok = await wywolaj(env, { action: 'get_lead', id, edit_token: token });
    expect(ok.status).toBe(200);
    expect((ok.body.lead as Record<string, unknown>).email).toBe('jan@firma.pl');
    expect((await wywolaj(env, { action: 'get_lead', id })).status).toBe(403);
  });

  it('get_lead (GET) wymaga parametru token', async () => {
    const { env, id, token } = await przygotuj();
    const get = async (qs: string) =>
      (await onRequestGet({
        env,
        request: new Request(`https://mixturemarketing.pl/api/contact-submit?${qs}`),
      } as never)) as Response;
    expect((await get(`action=get_lead&id=${id}`)).status).toBe(403);
    const ok = await get(`action=get_lead&id=${id}&token=${encodeURIComponent(token)}`);
    expect(ok.status).toBe(200);
  });

  it('send_notification bez tokenu → 403 i żaden mail nie wychodzi', async () => {
    const { env, id } = await przygotuj();
    wyslaneMaile = [];
    const res = await wywolaj(env, { action: 'send_notification', id, type: 'success' });
    expect(res.status).toBe(403);
    expect(wyslaneMaile).toHaveLength(0);
  });

  it('send_notification z tokenem wysyła powiadomienie', async () => {
    const { env, id, token } = await przygotuj();
    wyslaneMaile = [];
    const res = await wywolaj(env, {
      action: 'send_notification',
      id,
      edit_token: token,
      type: 'success',
    });
    expect(res.status).toBe(200);
    expect(wyslaneMaile).toHaveLength(1);
  });
});
