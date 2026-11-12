// MIX-1476: token podglądu ceny — kształt, kid, podpis w stałym czasie, exp, skrót IP.
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  activeKey,
  issueToken,
  secretForKid,
  timingSafeEqual,
  tokenCrypto,
  verifyToken,
  PREVIEW_TOKEN_TTL_SEC,
} from './_previewToken';
import { edgeIpKey } from '../_shared/gateCounter';

const SECRET = 'a'.repeat(32);
const SECRET_K2 = 'b'.repeat(40);
const ENV = { PREVIEW_TOKEN_SECRET: SECRET };
const T0 = 1_800_000_000_000;
const IP = 'v4:203.0.113.7';

const b64u = (s: string) => btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function sign(secret: string, payloadB64: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`pv1.${payloadB64}`)),
  );
  return b64u(String.fromCharCode(...sig));
}

async function forge(payload: Record<string, unknown>, secret = SECRET): Promise<string> {
  const p = b64u(JSON.stringify(payload));
  return `${p}.${await sign(secret, p)}`;
}

const decode = (token: string) =>
  JSON.parse(atob(token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/'))) as Record<
    string,
    unknown
  >;

afterEach(() => vi.restoreAllMocks());

describe('timingSafeEqual', () => {
  it('równe = true, różne długości i jeden znak = false', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true);
    expect(timingSafeEqual('abc', 'abd')).toBe(false);
    expect(timingSafeEqual('abc', 'ab')).toBe(false);
    expect(timingSafeEqual('', 'a')).toBe(false);
  });

  it('MIX-1495: różna długość z doklejonym NUL-em = false (zabija wyzerowanie xor długości)', () => {
    // Bez składnika `a.length ^ b.length` brakujący znak liczyłby się jako 0 i NUL by przechodził.
    expect(timingSafeEqual('ab', 'ab\0')).toBe(false);
    expect(timingSafeEqual('ab\0\0', 'ab')).toBe(false);
    expect(timingSafeEqual('', '\0')).toBe(false);
    expect(timingSafeEqual('x'.repeat(43), 'x'.repeat(43) + '\0')).toBe(false);
  });

  it('MIX-1495: różnica jednego znaku na każdej pozycji podpisu (43 znaki) = false', () => {
    const sig = 'A'.repeat(43);
    for (let i = 0; i < sig.length; i++) {
      const bad = sig.slice(0, i) + 'B' + sig.slice(i + 1);
      expect(timingSafeEqual(sig, bad)).toBe(false);
      expect(timingSafeEqual(bad, sig)).toBe(false);
    }
    expect(timingSafeEqual(sig, sig)).toBe(true);
  });

  it('nie kończy wcześnie: czyta wszystkie znaki także przy różnicy na pozycji 0', () => {
    let reads = 0;
    const fake = (s: string) =>
      ({
        length: s.length,
        charCodeAt: (i: number) => {
          reads++;
          return s.charCodeAt(i);
        },
      }) as unknown as string;
    expect(timingSafeEqual(fake('Xbcdefgh'), fake('abcdefgh'))).toBe(false);
    expect(reads).toBe(16);
  });
});

describe('activeKey / secretForKid', () => {
  it('brak sekretu = odmowa z nazwą zmiennej; 31 znaków = odmowa; 32 = OK', () => {
    expect(activeKey({})).toEqual({ ok: false, reason: 'konfiguracja: PREVIEW_TOKEN_SECRET' });
    expect(activeKey({ PREVIEW_TOKEN_SECRET: 'a'.repeat(31) })).toEqual({
      ok: false,
      reason: 'konfiguracja: PREVIEW_TOKEN_SECRET',
    });
    expect(activeKey(ENV)).toEqual({ ok: true, kid: 'main', secret: SECRET });
  });

  it('rotacja: PREVIEW_TOKEN_KID=k2 bierze PREVIEW_TOKEN_SECRET_K2; brak = odmowa', () => {
    expect(activeKey({ ...ENV, PREVIEW_TOKEN_KID: 'k2' })).toEqual({
      ok: false,
      reason: 'konfiguracja: PREVIEW_TOKEN_SECRET_K2',
    });
    expect(
      activeKey({ ...ENV, PREVIEW_TOKEN_KID: 'k2', PREVIEW_TOKEN_SECRET_K2: SECRET_K2 }),
    ).toEqual({ ok: true, kid: 'k2', secret: SECRET_K2 });
    expect(activeKey({ ...ENV, PREVIEW_TOKEN_KID: 'K2!' })).toEqual({
      ok: false,
      reason: 'konfiguracja: PREVIEW_TOKEN_KID',
    });
  });

  it('kid spoza wzorca nie sięga do innych zmiennych', () => {
    expect(secretForKid({ ...ENV, PREVIEW_TOKEN_SECRET___PROTO__: SECRET }, '__proto__')).toBe(
      null,
    );
    expect(secretForKid(ENV, 'unknown')).toBe(null);
    expect(secretForKid(ENV, 'main')).toBe(SECRET);
  });
});

describe('issueToken / verifyToken', () => {
  it('wydany token: 5 pól, jti 128 bit, exp = teraz + 15 min, przechodzi weryfikację', async () => {
    const { token, jti, exp } = await issueToken({ kid: 'main', secret: SECRET }, IP, T0);
    const p = decode(token);
    expect(Object.keys(p).sort()).toEqual(['exp', 'iph', 'jti', 'kid', 'v']);
    expect(p.v).toBe(1);
    expect(jti).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(exp).toBe(T0 / 1000 + PREVIEW_TOKEN_TTL_SEC);
    expect(p.iph).toMatch(/^[0-9a-f]{32}$/);
    expect(token).not.toContain('203.0.113.7');
    expect(await verifyToken(ENV, token, IP, T0)).toEqual({ ok: true, jti });
    const other = await issueToken({ kid: 'main', secret: SECRET }, IP, T0);
    expect(other.jti).not.toBe(jti);
  });

  it('exp: sekunda przed = OK, dokładnie exp = wygasł', async () => {
    const { token } = await issueToken({ kid: 'main', secret: SECRET }, IP, T0);
    const end = T0 + PREVIEW_TOKEN_TTL_SEC * 1000;
    expect((await verifyToken(ENV, token, IP, end - 1)).ok).toBe(true);
    expect(await verifyToken(ENV, token, IP, end)).toEqual({ ok: false, reason: 'token: wygasł' });
  });

  it('exp dalej niż 15 min (poprawnie podpisany) = odmowa', async () => {
    const { token } = await issueToken({ kid: 'main', secret: SECRET }, IP, T0);
    const p = decode(token);
    const far = await forge({ ...p, exp: (p.exp as number) + 1 });
    expect(await verifyToken(ENV, far, IP, T0)).toEqual({
      ok: false,
      reason: 'token: exp z przyszłości',
    });
  });

  it('inny klucz IP = odmowa; ten sam /64 IPv6 = OK', async () => {
    const a = edgeIpKey('2001:db8:1:2::1');
    const b = edgeIpKey('2001:db8:1:2:ffff::9');
    const c = edgeIpKey('2001:db8:1:3::1');
    if (!a.ok || !b.ok || !c.ok) throw new Error('ip');
    const { token } = await issueToken({ kid: 'main', secret: SECRET }, a.key, T0);
    expect((await verifyToken(ENV, token, b.key, T0)).ok).toBe(true);
    expect(await verifyToken(ENV, token, c.key, T0)).toEqual({ ok: false, reason: 'token: ip' });
  });

  it('podpis porównywany przez tokenCrypto.equal (stały czas), także przy zmianie 1 znaku', async () => {
    const spy = vi.spyOn(tokenCrypto, 'equal');
    const { token } = await issueToken({ kid: 'main', secret: SECRET }, IP, T0);
    const last = token.slice(-1);
    const bad = token.slice(0, -1) + (last === 'A' ? 'B' : 'A');
    expect(await verifyToken(ENV, bad, IP, T0)).toEqual({ ok: false, reason: 'token: podpis' });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toHaveLength(43);
  });

  it('MIX-1495: podpis i skrót IP idą przez tokenCrypto.equal (podmiana na === / wczesne wyjście nie przejdzie)', async () => {
    const { token } = await issueToken({ kid: 'main', secret: SECRET }, IP, T0);
    const spy = vi.spyOn(tokenCrypto, 'equal');
    expect(await verifyToken(ENV, token, IP, T0)).toMatchObject({ ok: true });
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls.map((c) => c[0].length)).toEqual([43, 32]);
    // Wymuszone `equal` = true przepuszcza zmieniony podpis: weryfikacja zależy od tej funkcji,
    // a nie od własnego porównania `===`.
    spy.mockReturnValue(true);
    const last = token.slice(-1);
    const bad = token.slice(0, -1) + (last === 'A' ? 'B' : 'A');
    expect(await verifyToken(ENV, bad, IP, T0)).toMatchObject({ ok: true });
    // Wymuszone `false` odrzuca prawidłowy token podpisem, a nie dopiero kolejnym warunkiem.
    spy.mockReturnValue(false);
    expect(await verifyToken(ENV, token, IP, T0)).toEqual({ ok: false, reason: 'token: podpis' });
    // Skrót IP: pierwsze porównanie (podpis) prawdziwe, drugie (IP) fałszywe = token: ip.
    spy.mockReset();
    spy.mockReturnValueOnce(true).mockReturnValueOnce(false);
    expect(await verifyToken(ENV, token, IP, T0)).toEqual({ ok: false, reason: 'token: ip' });
  });

  it('kid nieznany podpisany sekretem głównym = token: kid; kid k2 z sekretem K2 = OK', async () => {
    const { token } = await issueToken({ kid: 'main', secret: SECRET }, IP, T0);
    const p = decode(token);
    expect(await verifyToken(ENV, await forge({ ...p, kid: 'k9' }), IP, T0)).toEqual({
      ok: false,
      reason: 'token: kid',
    });
    const env2 = { ...ENV, PREVIEW_TOKEN_SECRET_K2: SECRET_K2 };
    const t2 = await issueToken({ kid: 'k2', secret: SECRET_K2 }, IP, T0);
    expect((await verifyToken(env2, t2.token, IP, T0)).ok).toBe(true);
    // stary token `main` nadal ważny po rotacji, dopóki PREVIEW_TOKEN_SECRET jest ustawiony
    expect((await verifyToken(env2, token, IP, T0)).ok).toBe(true);
  });

  it('format: 3 segmenty, pusty podpis, alg none, pole extra, v=2, zły typ = token: format', async () => {
    const { token } = await issueToken({ kid: 'main', secret: SECRET }, IP, T0);
    const p = decode(token);
    const [pay, sig] = token.split('.');
    const hdr = b64u(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const fmt = { ok: false, reason: 'token: format' };
    for (const t of [
      `${hdr}.${pay}.${sig}`,
      `${pay}.${sig}.`,
      `${pay}.`,
      `${pay}`,
      `${pay}.${sig}=`,
      `${pay}+.${sig}`,
      await forge({ ...p, alg: 'none' }),
      await forge({ ...p, v: 2 }),
      await forge({ ...p, exp: String(p.exp) }),
      await forge({ ...p, jti: 'short' }),
      await forge([p] as unknown as Record<string, unknown>),
      '',
      'x'.repeat(400),
      42,
      null,
    ])
      expect(await verifyToken(ENV, t, IP, T0)).toEqual(fmt);
    expect((await verifyToken(ENV, token, IP, T0)).ok).toBe(true);
  });
});
