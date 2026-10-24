import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { serverError } from './errors';
import { onRequestGet as getLeads } from '../admin/get_leads';
import { onRequestPost as saveProject } from '../admin/save_project';
import { onRequest as adminMiddleware } from '../admin/_middleware';
import { onRequest as portalMiddleware } from '../portal/_middleware';
import { onRequestPost as verifyToken } from '../auth/verify_token';
import { fnContext } from '../../../tests/helpers/fakeD1';

type Handler = (ctx: never) => Promise<Response> | Response;

// D1, który zawsze rzuca błąd z „wrażliwymi” szczegółami schematu.
const SECRET_DETAIL = 'D1_ERROR: no such column: users.session_token_hash at offset 42';
const brokenDb = {
  prepare: () => {
    const stmt = {
      bind: () => stmt,
      first: async () => {
        throw new Error(SECRET_DETAIL);
      },
      all: async () => {
        throw new Error(SECRET_DETAIL);
      },
      run: async () => {
        throw new Error(SECRET_DETAIL);
      },
    };
    return stmt;
  },
  batch: async () => {
    throw new Error(SECRET_DETAIL);
  },
};

let errSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => errSpy.mockRestore());

async function expectGeneric500(res: Response) {
  expect(res.status).toBe(500);
  expect(res.headers.get('Content-Type')).toContain('application/json');
  const text = await res.text();
  expect(text).not.toContain('no such column');
  expect(text).not.toContain('D1_ERROR');
  const body = JSON.parse(text);
  expect(body.error).toBe('server_error');
  expect(body.request_id).toMatch(/^[0-9a-f-]{36}$/);
  expect(body.message).toContain(body.request_id.slice(0, 8));
  expect(res.headers.get('X-Request-Id')).toBe(body.request_id);
  // szczegóły (ze stosem) lądują w logach pod tym samym identyfikatorem
  const logged = errSpy.mock.calls.map((c: unknown[]) => c.map(String).join(' ')).join('\n');
  expect(logged).toContain(body.request_id);
  expect(logged).toContain('no such column');
  return body;
}

describe('serverError', () => {
  it('nie ujawnia err.message, zwraca id korelacji i loguje szczegóły', async () => {
    await expectGeneric500(serverError(new Error(SECRET_DETAIL), 'test'));
  });

  it('obsługuje status, własny komunikat i dodatkowe pola (kontrakt run_audit)', async () => {
    const res = serverError('string error', 'audit/run_audit', {
      status: 503,
      message: 'Audyt niedostępny.',
      extra: { status: 'error' },
    });
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.status).toBe('error');
    expect(body.message).toMatch(/^Audyt niedostępny\. \(kod błędu: [0-9a-f]{8}\)$/);
  });
});

describe('endpointy nie zwracają szczegółów błędu D1', () => {
  it('admin/get_leads', async () => {
    await expectGeneric500(
      await (getLeads as Handler)(fnContext({ env: { DB: brokenDb } }) as never),
    );
  });

  it('admin/save_project', async () => {
    await expectGeneric500(
      await (saveProject as Handler)(
        fnContext({ env: { DB: brokenDb }, body: { user_id: 1, name: 'X' } }) as never,
      ),
    );
  });

  it('auth/verify_token (publiczny)', async () => {
    await expectGeneric500(
      await (verifyToken as Handler)(
        fnContext({ env: { DB: brokenDb }, body: { token: 'abc' } }) as never,
      ),
    );
  });

  it('middleware admina i portalu: awaria D1 → JSON 500, nie strona błędu Cloudflare', async () => {
    for (const mw of [adminMiddleware, portalMiddleware]) {
      await expectGeneric500(
        await (mw as Handler)(
          fnContext({
            env: { DB: brokenDb },
            headers: { Authorization: 'Bearer tok' },
          }) as never,
        ),
      );
    }
  });
});
